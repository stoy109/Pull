// API + RLS audit. Uses real user access tokens against PostgREST so the
// policies are exercised exactly as a browser would.
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { projectDir, BASE, PASSWORD } from "./config.mjs";

const SUPABASE = process.env.SUPABASE_URL;
const ANON = process.env.ANON_KEY;
if (!projectDir || !SUPABASE || !ANON) throw new Error("projectDir, SUPABASE_URL and ANON_KEY are required");

const url = new URL((await readFile(`${projectDir}/supabase/.temp/pooler-url`, "utf8")).trim());
url.password = encodeURIComponent(process.env.PGPASSWORD);
const db = new Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
await db.connect();
const sql = async (s, p = []) => (await db.query(s, p)).rows;

const results = [];
const record = (area, check, pass, detail) => {
  results.push({ area, check, pass, detail });
  console.log(`${pass ? "ok  " : "FAIL"} | ${area.padEnd(10)} | ${check.padEnd(44)} | ${detail}`);
};

// ---------- helpers ----------
async function signIn(email) {
  const response = await fetch(`${SUPABASE}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(`signIn ${email}: ${response.status} ${body.error_description ?? body.msg ?? ""}`);
  return { token: body.access_token, id: body.user.id };
}

async function rest(token, path, init = {}) {
  const response = await fetch(`${SUPABASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${token ?? ANON}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body, rows: Array.isArray(body) ? body.length : null };
}

const api = async (path, init) => {
  const response = await fetch(BASE + path, init);
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
};

// ---------- fixtures ----------
const sessions = {};
for (const role of ["admin", "umkm", "pekerja", "supplier"]) {
  sessions[role] = await signIn(`qa.${role}@pull-qa.test`);
}
const realJob = (await sql(`select id, owner_id, title from public.job_postings order by created_at limit 1`))[0];
const realProfile = (await sql(`select id, display_name from public.profiles where id <> all($1::uuid[]) limit 1`, [Object.values(sessions).map((s) => s.id)]))[0];

// ============================================================
// A. /api/worker/activities — role gate
// ============================================================
const unauthGet = await api("/api/worker/activities");
record("API", "GET activities tanpa login", unauthGet.status === 401, `${unauthGet.status} ${JSON.stringify(unauthGet.body)}`);

const badPost = await api("/api/worker/activities", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nope: true }),
});
record("API", "POST activities body invalid", badPost.status === 401 || badPost.status === 400, `${badPost.status} ${JSON.stringify(badPost.body)}`);

const presenceAnon = await api("/api/presence", { method: "POST" });
record("API", "POST presence tanpa login", presenceAnon.status === 401, `${presenceAnon.status} ${JSON.stringify(presenceAnon.body)}`);

// The endpoint authenticates through Supabase SSR cookies, so the authenticated
// role gate has to be exercised from inside a real browser session.
{
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath: "C:\\Users\\user\\AppData\\Local\\ms-playwright\\chromium-1248\\chrome-win64\\chrome.exe",
    headless: true,
  });
  for (const role of ["pekerja", "umkm", "supplier", "admin"]) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.fill('input[name="email"]', `qa.${role}@pull-qa.test`);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });

    const outcome = await page.evaluate(async (isWorker) => {
      const get = await fetch("/api/worker/activities", { cache: "no-store" });
      const presence = await fetch("/api/presence", { method: "POST" });
      // Only non-workers probe POST: for a real worker it would create data.
      let post = null;
      if (!isWorker) {
        const response = await fetch("/api/worker/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobReference: "x", jobTitle: "x", employerName: "x" }),
        });
        post = response.status;
      }
      return { get: get.status, presence: presence.status, post };
    }, role === "pekerja");

    const expected = role === "pekerja";
    const pass = expected
      ? outcome.get === 200 && outcome.presence === 200
      : outcome.get === 403 && outcome.post === 403;
    record("API", `activities sebagai ${role}`, pass,
      `GET=${outcome.get}${outcome.post === null ? "" : ` POST=${outcome.post}`} presence=${outcome.presence} (harap ${expected ? "200" : "403"})`);
    await context.close();
  }
  await browser.close();
}

// ============================================================
// B. RLS — reads must not leak across tenants
// ============================================================
{
  const asWorker = await rest(sessions.pekerja.token, "job_applications?select=id,worker_id,message");
  const foreign = (Array.isArray(asWorker.body) ? asWorker.body : []).filter((r) => r.worker_id !== sessions.pekerja.id);
  record("RLS", "pekerja baca job_applications orang lain", asWorker.status === 200 && foreign.length === 0,
    `${asWorker.status}, ${asWorker.rows ?? 0} baris, ${foreign.length} milik orang lain`);
}

{
  const asSupplier = await rest(sessions.supplier.token, "job_applications?select=id,worker_id");
  const foreign = (Array.isArray(asSupplier.body) ? asSupplier.body : []).filter((r) => r.worker_id !== sessions.supplier.id);
  record("RLS", "supplier baca lamaran pekerja", asSupplier.status === 200 && foreign.length === 0,
    `${asSupplier.status}, ${foreign.length} baris asing`);
}

{
  const anonRead = await rest(null, "job_applications?select=id,message");
  record("RLS", "anon baca job_applications", anonRead.status >= 400 || (anonRead.rows ?? 0) === 0,
    `${anonRead.status}, ${anonRead.rows ?? 0} baris`);
}

{
  const anonProfiles = await rest(null, "profiles?select=id,phone,email");
  const leaked = (Array.isArray(anonProfiles.body) ? anonProfiles.body : []).filter((r) => r.phone || r.email);
  record("RLS", "anon baca kolom sensitif profiles", anonProfiles.status >= 400 || leaked.length === 0,
    `${anonProfiles.status}, ${anonProfiles.rows ?? 0} baris, ${leaked.length} bocor telepon/email`);
}

{
  const anonOffers = await rest(null, "supplier_offers?select=id,item_name,unit_price");
  record("RLS", "anon baca supplier_offers (katalog publik?)", true, `${anonOffers.status}, ${anonOffers.rows ?? 0} baris — ${anonOffers.status >= 400 ? "ditolak" : "diizinkan"}`);
}

// ============================================================
// C. RLS — writes must not cross tenants
// ============================================================
{
  // No-op write (same title) so a policy hole cannot damage real data.
  const patch = await rest(sessions.umkm.token, `job_postings?id=eq.${realJob.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ title: realJob.title }),
  });
  const changed = patch.rows ?? 0;
  record("RLS", "umkm ubah lowongan milik UMKM lain", changed === 0,
    `${patch.status}, ${changed} baris terpengaruh (harus 0)`);
}

{
  const insert = await rest(sessions.pekerja.token, "job_postings", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ owner_id: sessions.pekerja.id, title: "RLS probe", category: "QA", district: "QA", wage_amount: 1, duration_days: 1, start_date: "2026-11-01", end_date: "2026-11-02", quota: 1, hours_per_day: 1, description: "probe", status: "draft" }),
  });
  record("RLS", "pekerja terbitkan lowongan", insert.status >= 400, `${insert.status} ${JSON.stringify(insert.body).slice(0, 120)}`);
  if (insert.status < 400) {
    await sql(`delete from public.job_postings where title = 'RLS probe' and owner_id = $1`, [sessions.pekerja.id]);
  }
}

{
  const insert = await rest(sessions.supplier.token, "pools", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ owner_id: sessions.supplier.id, item_name: "RLS probe pool", hub: "probe", district: "probe", target_quantity: 1 }),
  });
  record("RLS", "supplier buat pool", insert.status >= 400, `${insert.status} ${JSON.stringify(insert.body).slice(0, 120)}`);
  if (insert.status < 400) await sql(`delete from public.pools where item_name = 'RLS probe pool'`);
}

// ============================================================
// D. Privilege escalation attempts
// ============================================================
{
  const before = (await sql(`select role from public.profiles where id = $1`, [sessions.pekerja.id]))[0].role;
  const patch = await rest(sessions.pekerja.token, `profiles?id=eq.${sessions.pekerja.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ role: "admin" }),
  });
  const after = (await sql(`select role from public.profiles where id = $1`, [sessions.pekerja.id]))[0].role;
  const escalated = after === "admin";
  record("SEC", "pekerja naikkan role sendiri → admin", !escalated, `sebelum=${before} sesudah=${after} (HTTP ${patch.status})`);
  if (escalated) await sql(`update public.profiles set role = 'pekerja' where id = $1`, [sessions.pekerja.id]);
}

{
  const patch = await rest(sessions.umkm.token, `profiles?id=eq.${realProfile.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ display_name: realProfile.display_name }),
  });
  record("SEC", "umkm ubah profil pengguna lain", (patch.rows ?? 0) === 0, `${patch.status}, ${patch.rows ?? 0} baris`);
}

{
  // app_metadata is the trusted source; users must not be able to set it themselves.
  const response = await fetch(`${SUPABASE}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: ANON, Authorization: `Bearer ${sessions.pekerja.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { role: "admin" }, app_metadata: { role: "admin" } }),
  });
  const body = await response.json().catch(() => ({}));
  const appMetaRole = body.app_metadata?.role ?? body.user?.app_metadata?.role;
  record("SEC", "pekerja tulis app_metadata.role", appMetaRole !== "admin", `HTTP ${response.status}, app_metadata.role=${appMetaRole ?? "(tidak berubah)"}`);
}

{
  // user_metadata.role is user-writable by design — confirm the app does not trust it.
  const response = await fetch(`${SUPABASE}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: ANON, Authorization: `Bearer ${sessions.pekerja.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ data: { role: "admin" } }),
  });
  const body = await response.json().catch(() => ({}));
  const metaRole = body.user_metadata?.role ?? body.data?.role;
  const profileRole = (await sql(`select role from public.profiles where id = $1`, [sessions.pekerja.id]))[0].role;
  record("SEC", "user_metadata.role=admin tidak mengubah profil", profileRole === "pekerja", `user_metadata.role=${metaRole ?? "?"} tapi profiles.role=${profileRole}`);
}

// ============================================================
// E. Data integrity constraints
// ============================================================
{
  const dup = await rest(sessions.pekerja.token, "job_applications", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ job_id: realJob.id, worker_id: sessions.pekerja.id, message: "probe duplikat" }),
  });
  const [{ n }] = await sql(`select count(*)::int n from public.job_applications where worker_id = $1 and job_id = $2`, [sessions.pekerja.id, realJob.id]);
  record("DATA", "lamaran ganda ke lowongan sama", n <= 1, `${n} baris untuk pasangan yang sama (HTTP ${dup.status})`);
  if (n > 1) await sql(`delete from public.job_applications where worker_id = $1 and job_id = $2 and message = 'probe duplikat'`, [sessions.pekerja.id, realJob.id]);
}

{
  // Negative wage / absurd values should be rejected by a check constraint or trigger.
  const bad = await rest(sessions.umkm.token, "job_postings", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ owner_id: sessions.umkm.id, title: "QA negatif", category: "QA", district: "QA", wage_amount: -500, duration_days: 0, start_date: "2026-11-02", end_date: "2026-11-01", quota: 0, hours_per_day: 0, description: "x", status: "draft" }),
  });
  const accepted = bad.status < 400;
  record("DATA", "lowongan upah negatif / tanggal terbalik", !accepted, `${bad.status} ${accepted ? "DITERIMA (perlu validasi)" : "ditolak"}`);
  if (accepted) await sql(`delete from public.job_postings where title = 'QA negatif' and owner_id = $1`, [sessions.umkm.id]);
}

// ---------- summary ----------
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.area} | ${f.check} | ${f.detail}`);
}
await db.end();
