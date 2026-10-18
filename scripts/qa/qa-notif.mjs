// Verifies the new UMKM notification inbox: rendering, unread state,
// mark-as-read round trip, and navigation entry.
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
  console.log(`${pass ? "ok  " : "FAIL"} | ${check.padEnd(44)} | ${detail}`);
};

const umkmId = (await sql(`select id from auth.users where email = 'qa.umkm@pull-qa.test'`))[0].id;
const TITLE = `QA Notifikasi ${Date.now().toString().slice(-4)}`;

// Two rows: one already read, one unread, to prove the visual distinction.
const inserted = await sql(
  `insert into public.notifications (user_id, notification_type, title, body, data)
   values ($1, 'jobs', $2, 'Ada pekerja yang melamar lowongan QA Anda.', '{}'::jsonb)
   returning id`,
  [umkmId, TITLE],
);
const notificationId = inserted[0].id;

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text().slice(0, 200)));
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
await page.fill('input[name="email"]', "qa.umkm@pull-qa.test");
await page.fill('input[name="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });

// 1. sidebar entry
const navLink = page.locator('nav[aria-label="Navigasi utama UMKM"] a[href="/dashboard/notifications"]');
record("tautan Notifikasi ada di sidebar", (await navLink.count()) === 1, `${await navLink.count()} tautan`);

// 2. page renders
const response = await page.goto(`${BASE}/dashboard/notifications`, { waitUntil: "networkidle", timeout: 60000 });
const heading = (await page.locator("h1").first().textContent().catch(() => ""))?.trim();
record("halaman /dashboard/notifications", response?.status() === 200 && heading === "Notifikasi", `${response?.status()} "${heading ?? ""}"`);

// 3. notification listed with unread marker
const row = page.locator("article", { hasText: TITLE }).first();
record("notifikasi tampil di daftar", (await row.count()) === 1, `${await row.count()} baris`);
const unreadDot = await row.locator('[aria-label="Belum dibaca"]').count();
record("penanda belum dibaca tampil", unreadDot === 1, `${unreadDot} penanda`);

await page.screenshot({ path: `${SHOTS}/notif-umkm-unread.png` });

// 4. mark as read
const button = row.locator('button:has-text("Tandai dibaca")');
record("tombol Tandai dibaca tersedia", (await button.count()) === 1, `${await button.count()} tombol`);
await Promise.all([
  page.waitForURL(/result=/, { timeout: 45000 }).catch(() => {}),
  button.click(),
]);
const params = new URL(page.url()).searchParams;
record("aksi tandai dibaca", params.get("result") === "saved", `result=${params.get("result") ?? "-"}`);

const readAt = (await sql(`select read_at from public.notifications where id = $1`, [notificationId]))[0].read_at;
record("read_at tersimpan di database", Boolean(readAt), readAt ? String(readAt).slice(0, 19) : "null");

// 5. UI reflects the new state after the redirect
const afterRow = page.locator("article", { hasText: TITLE }).first();
const alreadyRead = await afterRow.locator("text=Sudah dibaca").count();
const stillUnread = await afterRow.locator('[aria-label="Belum dibaca"]').count();
record("UI berubah jadi sudah dibaca", alreadyRead > 0 && stillUnread === 0, `sudah=${alreadyRead} belum=${stillUnread}`);
await page.screenshot({ path: `${SHOTS}/notif-umkm-read.png` });

// 6. no console errors
record("tanpa error konsol", errors.length === 0, errors.length ? errors[0] : "bersih");

// 7. a worker must not reach this route
{
  const workerContext = await browser.newContext();
  const workerPage = await workerContext.newPage();
  await workerPage.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await workerPage.fill('input[name="email"]', "qa.pekerja@pull-qa.test");
  await workerPage.fill('input[name="password"]', PASSWORD);
  await workerPage.click('button[type="submit"]');
  await workerPage.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });
  await workerPage.goto(`${BASE}/dashboard/notifications`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await workerPage.waitForTimeout(800);
  const landed = new URL(workerPage.url()).pathname;
  record("pekerja ditolak dari notifikasi UMKM", landed !== "/dashboard/notifications", `dialihkan ke ${landed}`);
  await workerContext.close();
}

await context.close();
await browser.close();

await db.query(`delete from public.notifications where id = $1`, [notificationId]);
await db.end();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.check} | ${f.detail}`);
}
