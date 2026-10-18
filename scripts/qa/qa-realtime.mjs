// Realtime end-to-end: a write in one session must refresh another session's
// page without a manual reload. Proves the publication actually covers the
// tables RealtimeRefresh subscribes to.
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { chromium } from "playwright-core";
import { projectDir, BASE, EXE, PASSWORD } from "./config.mjs";

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

const qaUmkm = (await sql(`select id from auth.users where email = 'qa.umkm@pull-qa.test'`))[0].id;
const qaPekerja = (await sql(`select id from auth.users where email = 'qa.pekerja@pull-qa.test'`))[0].id;

const browser = await chromium.launch({ executablePath: EXE, headless: true });

async function session(email, path) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const refreshes = [];
  page.on("request", (req) => {
    if (req.url().includes("_rsc")) refreshes.push(Date.now());
  });
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500); // let the websocket join and settle
  refreshes.length = 0; // ignore the navigation's own RSC fetches
  return { context, page, refreshes };
}

const waitForRefresh = async (refreshes, ms = 12000) => {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    if (refreshes.length > 0) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
};

// ---------- 1. notifications ----------
// Exercised from the dashboard shell: it mounts RealtimeRefresh, so a row
// inserted straight into the table must trigger a refresh on its own.
{
  const { context, refreshes } = await session("qa.umkm@pull-qa.test", "/dashboard");
  const before = refreshes.length;

  await sql(
    `insert into public.notifications (user_id, notification_type, title, body, data)
     values ($1, 'system', 'QA realtime probe', 'baris ini harus memicu refresh otomatis', '{}'::jsonb)`,
    [qaUmkm],
  );

  const fired = await waitForRefresh(refreshes);
  record("realtime notifications → dashboard", fired, fired ? `refresh otomatis dalam <12s (${refreshes.length - before} fetch)` : "tidak ada refresh (websocket tidak menerima)");

  const [{ n }] = await sql(`select count(*)::int n from public.notifications where title = 'QA realtime probe' and user_id = $1`, [qaUmkm]);
  record("notifikasi tersimpan untuk penerima", n === 1, `${n} baris`);

  await sql(`delete from public.notifications where title = 'QA realtime probe' and user_id = $1`, [qaUmkm]);
  await context.close();
}

// ---------- 2. job_postings (the table that was missing from the publication) ----------
{
  const { context, page, refreshes } = await session("qa.umkm@pull-qa.test", "/dashboard/jobs");
  const title = `QA Realtime Loker ${Date.now().toString().slice(-4)}`;

  await sql(
    `insert into public.job_postings
       (owner_id, title, category, district, wage_amount, duration_days, start_date, end_date, quota, hours_per_day, description, status)
     values ($1, $2, 'Logistik', 'Laweyan', 150000, 2, current_date + 1, current_date + 3, 2, 6, 'Probe realtime.', 'published')`,
    [qaUmkm, title],
  );

  const fired = await waitForRefresh(refreshes);
  record("realtime job_postings → Papan Loker", fired, fired ? `refresh otomatis dalam <12s (${refreshes.length} fetch)` : "tidak ada refresh — tabel belum terpublikasi?");

  await page.reload({ waitUntil: "networkidle", timeout: 45000 });
  const visible = await page.locator(`text=${title}`).count();
  record("lowongan baru muncul di Papan Loker", visible > 0, visible ? "tampil" : "tidak tampil");

  await sql(`delete from public.job_postings where title = $1`, [title]);
  await context.close();
}

// ---------- 3. job_applications: worker applies, owner's page refreshes ----------
{
  const jobTitle = `QA Realtime Lamaran ${Date.now().toString().slice(-4)}`;
  const jobId = (await sql(
    `insert into public.job_postings
       (owner_id, title, category, district, wage_amount, duration_days, start_date, end_date, quota, hours_per_day, description, status)
     values ($1, $2, 'Logistik', 'Laweyan', 150000, 2, current_date + 1, current_date + 3, 2, 6, 'Probe realtime lamaran.', 'published')
     returning id`,
    [qaUmkm, jobTitle],
  ))[0].id;

  const owner = await session("qa.umkm@pull-qa.test", "/dashboard/jobs");
  const worker = await session("qa.pekerja@pull-qa.test", "/worker/apply");

  await sql(
    `insert into public.job_applications (job_id, worker_id, message, status)
     values ($1, $2, 'Lamaran probe realtime.', 'submitted')`,
    [jobId, qaPekerja],
  );

  const fired = await waitForRefresh(owner.refreshes);
  record("realtime job_applications → pemilik lowongan", fired, fired ? `refresh otomatis dalam <12s` : "tidak ada refresh");

  await owner.context.close();
  await worker.context.close();
  await sql(`delete from public.job_applications where job_id = $1`, [jobId]);
  await sql(`delete from public.job_postings where id = $1`, [jobId]);
}

await browser.close();
await db.end();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.check} | ${f.detail}`);
}
