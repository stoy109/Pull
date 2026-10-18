// Verifies the "new job in your district" fan-out.
// Cases: publish, draft->publish transition, district mismatch,
// disabled preference, and an "unavailable" worker.
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
  console.log(`${pass ? "ok  " : "FAIL"} | ${check.padEnd(50)} | ${detail}`);
};

const umkmId = (await sql(`select id from auth.users where email = 'qa.umkm@pull-qa.test'`))[0].id;
const pekerjaId = (await sql(`select id from auth.users where email = 'qa.pekerja@pull-qa.test'`))[0].id;

// The worker must live in a district for the fan-out to have a target.
await sql(`update public.profiles set district = 'Laweyan' where id = $1`, [pekerjaId]);
await sql(`delete from public.worker_preferences where user_id = $1`, [pekerjaId]);
await sql(`update public.notification_preferences set jobs_enabled = true, in_app_enabled = true where user_id = $1`, [pekerjaId]);

const stamp = Date.now().toString().slice(-4);
const createdJobs = [];
const notifCount = async (title) =>
  (await sql(
    `select count(*)::int n from public.notifications where user_id = $1 and body like $2`,
    [pekerjaId, `%${title}%`],
  ))[0].n;

const insertJob = async (title, { district = "Laweyan", status = "published" } = {}) => {
  const id = (await sql(
    `insert into public.job_postings
       (owner_id, title, category, district, wage_amount, wage_unit, duration_days, start_date, end_date, quota, hours_per_day, description, status)
     values ($1, $2, 'Logistik', $3, 150000, 'hari', 2, current_date + 1, current_date + 3, 2, 6, 'Uji notifikasi lowongan.', $4)
     returning id`,
    [umkmId, title, district, status],
  ))[0].id;
  createdJobs.push(id);
  return id;
};

// ---------- 1. publish in the same district ----------
const titleA = `QA Loker Sekitar ${stamp}`;
await insertJob(titleA);
{
  const n = await notifCount(titleA);
  const row = (await sql(
    `select title, body from public.notifications where user_id = $1 and body like $2`,
    [pekerjaId, `%${titleA}%`],
  ))[0];
  record("publish di kecamatan sama → pekerja diberi tahu", n === 1, `${n} notifikasi`);
  record("judul & isi notifikasi sesuai", row?.title === "Lowongan baru di sekitar Anda" && /upah 150000 hari/.test(row?.body ?? ""), row?.body ?? "-");
}

// ---------- 2. draft → published transition ----------
const titleB = `QA Loker Draft ${stamp}`;
const draftId = await insertJob(titleB, { status: "draft" });
{
  const before = await notifCount(titleB);
  record("draft belum memicu notifikasi", before === 0, `${before} notifikasi`);
  await sql(`update public.job_postings set status = 'published' where id = $1`, [draftId]);
  const after = await notifCount(titleB);
  record("draft → published memicu notifikasi", after === 1, `${after} notifikasi`);
  // publishing again must not duplicate
  await sql(`update public.job_postings set title = title || ' ' where id = $1`, [draftId]);
  const again = await notifCount(titleB);
  record("update lain tidak menduplikasi notifikasi", again === 1, `${again} notifikasi`);
}

// ---------- 3. different district ----------
const titleC = `QA Loker Luar ${stamp}`;
await insertJob(titleC, { district: "Banjarsari" });
{
  const n = await notifCount(titleC);
  record("kecamatan berbeda → tidak ada notifikasi", n === 0, `${n} notifikasi`);
}

// ---------- 4. preference disabled ----------
const titleD = `QA Loker Pref ${stamp}`;
await sql(`update public.notification_preferences set jobs_enabled = false where user_id = $1`, [pekerjaId]);
await insertJob(titleD);
{
  const n = await notifCount(titleD);
  record("preferensi jobs nonaktif menahan notifikasi", n === 0, `${n} notifikasi`);
  await sql(`update public.notification_preferences set jobs_enabled = true where user_id = $1`, [pekerjaId]);
}

// ---------- 5. worker marked unavailable ----------
const titleE = `QA Loker Sibuk ${stamp}`;
await sql(
  `insert into public.worker_preferences (user_id, availability) values ($1, 'unavailable')
   on conflict (user_id) do update set availability = 'unavailable'`,
  [pekerjaId],
);
await insertJob(titleE);
{
  const n = await notifCount(titleE);
  record("pekerja berstatus unavailable dilewati", n === 0, `${n} notifikasi`);
  await sql(`delete from public.worker_preferences where user_id = $1`, [pekerjaId]);
}

// ---------- 6. the notification reaches the worker UI ----------
{
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill('input[name="email"]', "qa.pekerja@pull-qa.test");
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });
  const response = await page.goto(`${BASE}/worker/notifications`, { waitUntil: "networkidle", timeout: 60000 });
  const visible = await page.locator(`text=${titleA}`).count();
  record("tampil di /worker/notifications", response?.status() === 200 && visible > 0, `${response?.status()}, ${visible} kemunculan`);
  await page.screenshot({ path: `${SHOTS}/notif-worker-new-job.png` });
  await context.close();
  await browser.close();
}

// ---------- cleanup ----------
for (const id of createdJobs) {
  await sql(`delete from public.job_applications where job_id = $1`, [id]);
  await sql(`delete from public.job_postings where id = $1`, [id]);
}
await sql(`delete from public.notifications where body like $1`, [`%QA Loker%${stamp}%`]);
await sql(`update public.profiles set district = null where id = $1`, [pekerjaId]);
await db.end();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.check} | ${f.detail}`);
}
