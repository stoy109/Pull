// Verifies the two new notification triggers end-to-end through the real UI:
//   1. worker applies        -> job owner receives a "Lamaran baru masuk"
//   2. pool reaches target   -> owner and every member receive "Target pool tercapai"
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { chromium } from "playwright-core";
import { projectDir, BASE, EXE, PASSWORD, SHOTS } from "./config.mjs";

const url = new URL((await readFile(`${projectDir}/supabase/.temp/pooler-url`, "utf8")).trim());
url.password = encodeURIComponent(process.env.PGPASSWORD);
const db = new Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
await db.connect();
const sql = async (s, p = []) => (await db.query(s, p)).rows;

const results = [];
const record = (check, pass, detail) => {
  results.push({ check, pass, detail });
  console.log(`${pass ? "ok  " : "FAIL"} | ${check.padEnd(46)} | ${detail}`);
};

// ---------- fixture: a second UMKM so a pool can actually be joined ----------
const SECOND = { email: "qa.umkm2@pull-qa.test", name: "QA UMKM Dua", phone: "6281234500005" };
{
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: process.env.SERVICE_ROLE,
      Authorization: `Bearer ${process.env.SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: SECOND.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { role: "umkm", onboarding_step: "complete", display_name: SECOND.name, business_name: "QA Warung Dua", phone: SECOND.phone },
    }),
  });
  const body = await response.json();
  if (!response.ok && !String(body.msg ?? "").includes("already")) {
    throw new Error(`create second umkm: ${response.status} ${JSON.stringify(body).slice(0, 160)}`);
  }
  const id = body.id ?? body.user?.id;
  await sql(
    `update public.profiles set role = 'umkm', account_status = 'active', display_name = $2,
            business_name = 'QA Warung Dua', phone = $3, updated_at = now()
      where id = $1`,
    [id, SECOND.name, SECOND.phone],
  );
}

const umkmId = (await sql(`select id from auth.users where email = 'qa.umkm@pull-qa.test'`))[0].id;
const umkm2Id = (await sql(`select id from auth.users where email = $1`, [SECOND.email]))[0].id;
const pekerjaId = (await sql(`select id from auth.users where email = 'qa.pekerja@pull-qa.test'`))[0].id;

const stamp = Date.now().toString().slice(-4);
const JOB_TITLE = `QA Notif Loker ${stamp}`;
const POOL_ITEM = `QA Notif Kain ${stamp}`;

const jobId = (await sql(
  `insert into public.job_postings
     (owner_id, title, category, district, wage_amount, duration_days, start_date, end_date, quota, hours_per_day, description, status)
   values ($1, $2, 'Logistik', 'Laweyan', 150000, 2, current_date + 1, current_date + 3, 2, 6, 'Uji notifikasi lamaran.', 'published')
   returning id`,
  [umkmId, JOB_TITLE],
))[0].id;

const poolId = (await sql(
  `insert into public.pools
     (owner_id, item_name, category, description, unit, target_quantity, min_threshold, district, deadline, status)
   values ($1, $2, 'Tekstil', 'Uji notifikasi target pool.', 'kg', 20, 20, 'Laweyan', now() + interval '2 days', 'open')
   returning id`,
  [umkmId, POOL_ITEM],
))[0].id;

const browser = await chromium.launch({ executablePath: EXE, headless: true });

async function session(email) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });
  return { context, page };
}

// ============================================================
// 1. worker applies -> owner notified
// ============================================================
{
  const { context, page } = await session("qa.pekerja@pull-qa.test");
  await page.goto(`${BASE}/worker/apply`, { waitUntil: "networkidle", timeout: 60000 });
  const card = page.locator("form", { hasText: JOB_TITLE }).first();
  if (!(await card.count())) {
    record("pekerja melamar (prasyarat)", false, "lowongan tidak tampil di /worker/apply");
  } else {
    const message = card.locator('textarea[name="message"], input[name="message"]').first();
    if (await message.count()) await message.fill("Saya siap mulai besok.");
    await Promise.all([
      page.waitForURL(/success=|error=/, { timeout: 45000 }).catch(() => {}),
      card.locator('button:has-text("Kirim lamaran")').first().click(),
    ]);
    record("pekerja melamar (prasyarat)", new URL(page.url()).searchParams.get("success") === "1", `success=${new URL(page.url()).searchParams.get("success") ?? "-"}`);
  }
  await context.close();
}

{
  const rows = await sql(
    `select notification_type, title, body from public.notifications
      where user_id = $1 and notification_type = 'jobs' and title = 'Lamaran baru masuk'
        and body like $2 order by created_at desc`,
    [umkmId, `%${JOB_TITLE}%`],
  );
  const body = rows[0]?.body ?? "";
  record("pemilik menerima notifikasi lamaran", rows.length === 1, rows.length ? `${rows.length} baris` : "tidak ada");
  record("isi notifikasi menyebut pekerja + lowongan", body.includes("QA Pekerja") && body.includes(JOB_TITLE), body || "-");
}

// ============================================================
// 2. pool reaches target -> owner + member notified
// ============================================================
{
  const { context, page } = await session(SECOND.email);
  await page.goto(`${BASE}/dashboard/pools`, { waitUntil: "networkidle", timeout: 60000 });
  const form = page.locator("form", { hasText: POOL_ITEM }).filter({ has: page.locator('input[name="quantity"]') }).first();
  if (!(await form.count())) {
    record("umkm kedua bergabung ke pool (prasyarat)", false, "form join tidak ditemukan");
  } else {
    await form.locator('input[name="quantity"]').fill("20");
    await Promise.all([
      page.waitForURL(/success=|error=/, { timeout: 45000 }).catch(() => {}),
      form.locator('button[type="submit"], button:has-text("Gabung"), button:has-text("Ikut")').first().click(),
    ]);
    const params = new URL(page.url()).searchParams;
    record("umkm kedua bergabung ke pool (prasyarat)", params.get("error") === null, `success=${params.get("success") ?? "-"} error=${params.get("error") ?? "-"}`);
  }
  await context.close();
}

{
  const quantity = (await sql(`select current_quantity, target_quantity from public.pools where id = $1`, [poolId]))[0];
  record("kuantitas pool mencapai target", Number(quantity.current_quantity) >= Number(quantity.target_quantity), `${quantity.current_quantity}/${quantity.target_quantity}`);

  const ownerRows = await sql(
    `select body from public.notifications where user_id = $1 and title = 'Target pool tercapai' and body like $2`,
    [umkmId, `%${POOL_ITEM}%`],
  );
  const memberRows = await sql(
    `select body from public.notifications where user_id = $1 and title = 'Target pool tercapai' and body like $2`,
    [umkm2Id, `%${POOL_ITEM}%`],
  );
  record("pemilik pool menerima notifikasi target", ownerRows.length === 1, ownerRows[0]?.body ?? "tidak ada");
  record("anggota pool menerima notifikasi target", memberRows.length === 1, memberRows[0]?.body ?? "tidak ada");
}

// ============================================================
// 3. the notifications actually show up on the UMKM page
// ============================================================
{
  const { context, page } = await session("qa.umkm@pull-qa.test");
  const response = await page.goto(`${BASE}/dashboard/notifications`, { waitUntil: "networkidle", timeout: 60000 });
  // The owner legitimately receives two pool notifications (member joined + target
  // reached), so match on the headline rather than on the item name alone.
  const jobNotif = await page.locator("article", { hasText: "Lamaran baru masuk" }).filter({ hasText: JOB_TITLE }).count();
  const poolNotif = await page.locator("article", { hasText: "Target pool tercapai" }).filter({ hasText: POOL_ITEM }).count();
  const joinNotif = await page.locator("article", { hasText: "Anggota pool baru" }).filter({ hasText: POOL_ITEM }).count();
  record("keduanya tampil di /dashboard/notifications", response?.status() === 200 && jobNotif === 1 && poolNotif === 1, `lamaran=${jobNotif} target=${poolNotif} anggota-baru=${joinNotif}`);
  await page.screenshot({ path: `${SHOTS}/notif-umkm-events.png` });
  await context.close();
}

// ============================================================
// 4. preferences are respected (owner disables job notifications)
// ============================================================
{
  await sql(`update public.notification_preferences set jobs_enabled = false where user_id = $1`, [umkmId]);
  const secondJobId = (await sql(
    `insert into public.job_postings
       (owner_id, title, category, district, wage_amount, duration_days, start_date, end_date, quota, hours_per_day, description, status)
     values ($1, $2, 'Logistik', 'Laweyan', 150000, 2, current_date + 1, current_date + 3, 2, 6, 'Uji preferensi.', 'published')
     returning id`,
    [umkmId, `${JOB_TITLE} off`],
  ))[0].id;

  await sql(
    `insert into public.job_applications (job_id, worker_id, message) values ($1, $2, 'Uji preferensi nonaktif.')`,
    [secondJobId, pekerjaId],
  );

  const rows = await sql(`select count(*)::int n from public.notifications where user_id = $1 and body like $2`, [umkmId, `%${JOB_TITLE} off%`]);
  record("preferensi nonaktif menahan notifikasi", rows[0].n === 0, `${rows[0].n} notifikasi (harus 0)`);

  await sql(`update public.notification_preferences set jobs_enabled = true where user_id = $1`, [umkmId]);
  await sql(`delete from public.job_applications where job_id = $1`, [secondJobId]);
  await sql(`delete from public.job_postings where id = $1`, [secondJobId]);
}

await browser.close();

// ---------- cleanup ----------
await sql(`delete from public.job_applications where job_id = $1`, [jobId]);
await sql(`delete from public.job_postings where id = $1`, [jobId]);
await sql(`delete from public.pool_members where pool_id = $1`, [poolId]);
await sql(`delete from public.pools where id = $1`, [poolId]);
await sql(`delete from public.notifications where body like $1 or body like $2`, [`%${JOB_TITLE}%`, `%${POOL_ITEM}%`]);
// Remove the second account's traces first: its activity_logs.actor_id is set to
// null on profile delete, which would leave orphan rows behind.
await sql(`delete from public.activity_logs where actor_id = $1 or (actor_id is null and created_at > now() - interval '1 hour')`, [umkm2Id]);
await sql(`delete from public.profiles where id = $1`, [umkm2Id]);
await fetch(`${process.env.SUPABASE_URL}/auth/v1/admin/users/${umkm2Id}`, {
  method: "DELETE",
  headers: { apikey: process.env.SERVICE_ROLE, Authorization: `Bearer ${process.env.SERVICE_ROLE}` },
});
await db.end();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.check} | ${f.detail}`);
}
