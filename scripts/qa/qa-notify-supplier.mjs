// Verifies the "supplier learns about matching pool demand" fan-out
// (migration 202610180005).
//
// Cases: match, quantity formatting, repeat pool, non-matching item,
// inactive catalogue, disabled preference, cancelled pool, non-supplier
// catalogue owner, and delivery to /supplier/notifications.
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
  console.log(`${pass ? "ok  " : "FAIL"} | ${check.padEnd(52)} | ${detail}`);
};

const supplierId = (await sql(`select id from auth.users where email = 'qa.supplier@pull-qa.test'`))[0].id;
const umkmId = (await sql(`select id from auth.users where email = 'qa.umkm@pull-qa.test'`))[0].id;

const stamp = Date.now().toString().slice(-5);
const ITEM = `QA Tepung ${stamp}`;          // pool item name
const CATALOG = `${ITEM} Premium`;          // catalogue item that should match
const OTHER = `QA Gula ${stamp}`;           // deliberately non-matching

// Remember the supplier's existing catalogue so we can put it back.
const priorCatalog = await sql(
  `select id, status from public.supplier_offers where supplier_id = $1 and pool_id is null`,
  [supplierId],
);
await sql(
  `update public.supplier_offers set status = 'inactive' where supplier_id = $1 and pool_id is null`,
  [supplierId],
);
await sql(`update public.notification_preferences set pools_enabled = true where user_id = $1`, [supplierId]);

const createdOffers = [];
const createdPools = [];

const addOffer = async (owner, itemName, status = "active") => {
  const id = (await sql(
    `insert into public.supplier_offers
       (supplier_id, item_name, unit, unit_price, stock_quantity, min_order_quantity, category, status)
     values ($1, $2, 'kg', 12000, 500, 10, 'Bahan Baku', $3)
     returning id`,
    [owner, itemName, status],
  ))[0].id;
  createdOffers.push(id);
  return id;
};

const addPool = async (itemName, target, status = "open") => {
  const id = (await sql(
    `insert into public.pools
       (owner_id, item_name, category, description, unit, target_quantity,
        current_quantity, min_threshold, district, deadline, status)
     values ($1, $2, 'Bahan Baku', 'Uji notifikasi supplier.', 'kg', $3, 0, 1, 'Laweyan',
             now() + interval '3 hours', $4)
     returning id`,
    [umkmId, itemName, target, status],
  ))[0].id;
  createdPools.push(id);
  return id;
};

const rowsFor = async (userId, needle) =>
  sql(
    `select id, title, body, data from public.notifications
      where user_id = $1 and body like $2 order by created_at`,
    [userId, `%${needle}%`],
  );

// ---------- 1. matching pool notifies the supplier ----------
await addOffer(supplierId, CATALOG);
const poolA = await addPool(ITEM, 100);
{
  const rows = await rowsFor(supplierId, ITEM);
  record("pool cocok katalog → supplier diberi tahu", rows.length === 1, `${rows.length} notifikasi`);
  record("judul notifikasi sesuai", rows[0]?.title === "Kebutuhan pool baru", rows[0]?.title ?? "-");
  record(
    "isi memuat item, jumlah, satuan, kecamatan",
    /^Pool QA Tepung \d+ butuh 100 kg di Laweyan$/.test(rows[0]?.body ?? ""),
    rows[0]?.body ?? "-",
  );
  record(
    "jumlah bulat tidak terpotong (100, bukan 1)",
    (rows[0]?.body ?? "").includes("butuh 100 kg"),
    rows[0]?.body ?? "-",
  );
  record("data menyimpan pool_id yang benar", rows[0]?.data?.pool_id === poolA, rows[0]?.data?.pool_id ?? "-");
}

// ---------- 2. a second pool is a separate notification ----------
const poolB = await addPool(ITEM, 40.5);
{
  const rows = await rowsFor(supplierId, ITEM);
  record("pool kedua menambah notifikasi (tidak menimpa)", rows.length === 2, `${rows.length} notifikasi`);
  record(
    "pecahan tetap tampil (40.5, bukan 40.500)",
    rows.some((r) => r.body.includes("butuh 40.5 kg")),
    rows.map((r) => r.body).join(" | "),
  );
  record("pool_id kedua berbeda", rows.some((r) => r.data?.pool_id === poolB), `${rows.length} baris`);
}

// ---------- 3. non-matching item name ----------
await addPool(OTHER, 60);
{
  const rows = await rowsFor(supplierId, OTHER);
  record("item tidak cocok → tidak ada notifikasi", rows.length === 0, `${rows.length} notifikasi`);
}

// ---------- 4. catalogue entry inactive ----------
await sql(`update public.supplier_offers set status = 'inactive' where supplier_id = $1 and pool_id is null`, [supplierId]);
const before4 = (await rowsFor(supplierId, ITEM)).length;
await addPool(ITEM, 80);
{
  const after = (await rowsFor(supplierId, ITEM)).length;
  record("katalog nonaktif tidak memicu notifikasi", after === before4, `${before4} → ${after}`);
  await sql(`update public.supplier_offers set status = 'active' where supplier_id = $1 and pool_id is null`, [supplierId]);
}

// ---------- 5. preference disabled ----------
await sql(`update public.notification_preferences set pools_enabled = false where user_id = $1`, [supplierId]);
const before5 = (await rowsFor(supplierId, ITEM)).length;
await addPool(ITEM, 90);
{
  const after = (await rowsFor(supplierId, ITEM)).length;
  record("preferensi pools nonaktif menahan notifikasi", after === before5, `${before5} → ${after}`);
  await sql(`update public.notification_preferences set pools_enabled = true where user_id = $1`, [supplierId]);
}

// ---------- 6. pool that is not open for demand ----------
const before6 = (await rowsFor(supplierId, ITEM)).length;
await addPool(ITEM, 70, "cancelled");
{
  const after = (await rowsFor(supplierId, ITEM)).length;
  record("pool berstatus cancelled dilewati", after === before6, `${before6} → ${after}`);
}

// ---------- 7. catalogue owned by a non-supplier ----------
await addOffer(umkmId, `${OTHER} Spesial`);
await addPool(`${OTHER} Spesial`, 30);
{
  const rows = await rowsFor(umkmId, `${OTHER} Spesial`);
  record("katalog milik non-supplier tidak memicu notifikasi", rows.length === 0, `${rows.length} notifikasi`);
}

// ---------- 8. reaches the supplier inbox ----------
{
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill('input[name="email"]', "qa.supplier@pull-qa.test");
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });
  const response = await page.goto(`${BASE}/supplier/notifications`, { waitUntil: "networkidle", timeout: 60000 });
  const visible = await page.locator(`text=${ITEM}`).count();
  record(
    "tampil di /supplier/notifications",
    response?.status() === 200 && visible > 0,
    `${response?.status()}, ${visible} kemunculan`,
  );
  await page.screenshot({ path: `${SHOTS}/notif-supplier-pool.png`, fullPage: true });
  await context.close();
  await browser.close();
}

// ---------- cleanup ----------
for (const id of createdPools) await sql(`delete from public.pools where id = $1`, [id]);
for (const id of createdOffers) await sql(`delete from public.supplier_offers where id = $1`, [id]);
await sql(`delete from public.notifications where body like $1`, [`%${stamp}%`]);
await sql(`update public.notification_preferences set pools_enabled = true where user_id = $1`, [supplierId]);
// restore the supplier's original catalogue state
for (const offer of priorCatalog) {
  await sql(`update public.supplier_offers set status = $2 where id = $1`, [offer.id, offer.status]);
}
await db.end();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.check} | ${f.detail}`);
  process.exitCode = 1;
}
