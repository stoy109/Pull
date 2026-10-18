// Negative form validation, server side.
// The publish/product forms carry HTML5 constraints (required, min, minlength),
// so a normal click never reaches the server action. This suite strips those
// constraints first — exactly what an attacker bypassing the browser would do —
// and then asserts the server still refuses the input.
import { readFile } from "node:fs/promises";
import { Client } from "pg";
import { chromium } from "playwright-core";
import { projectDir, BASE, EXE, PASSWORD } from "./config.mjs";

const url = new URL((await readFile(`${projectDir}/supabase/.temp/pooler-url`, "utf8")).trim());
url.password = encodeURIComponent(process.env.PGPASSWORD);
const db = new Client({ connectionString: url.toString(), ssl: { rejectUnauthorized: false } });
await db.connect();
const count = async (s, p = []) => (await db.query(s, p)).rows[0].n;

const results = [];
const record = (check, pass, detail) => {
  results.push({ check, pass, detail });
  console.log(`${pass ? "ok  " : "FAIL"} | ${check.padEnd(44)} | ${detail}`);
};

const iso = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

// Remove every client-side guard so the request actually hits the server action.
const stripClientValidation = (page) =>
  page.evaluate(() => {
    for (const form of document.querySelectorAll("form")) form.noValidate = true;
    for (const el of document.querySelectorAll("input, textarea, select")) {
      for (const attr of ["required", "min", "max", "minlength", "maxlength", "pattern", "step"]) {
        el.removeAttribute(attr);
      }
    }
  });

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

// ---------- job posting ----------
{
  const { context, page } = await session("qa.umkm@pull-qa.test");
  const TITLE = "QA Validasi Lowongan";

  const publish = async (overrides) => {
    const values = {
      title: TITLE,
      category: "Logistik",
      district: "Laweyan",
      wageAmount: "150000",
      durationDays: "2",
      startDate: iso(1),
      endDate: iso(3),
      quota: "2",
      hoursPerDay: "6",
      description: "Deskripsi uji validasi yang cukup panjang.",
      ...overrides,
    };
    await page.goto(`${BASE}/dashboard/publish`, { waitUntil: "networkidle", timeout: 60000 });
    for (const [name, value] of Object.entries(values)) {
      const field = page.locator(`input[name="${name}"], textarea[name="${name}"]`).first();
      if (await field.count()) await field.fill(value);
    }
    await stripClientValidation(page);
    await Promise.all([
      page.waitForURL(/success=|error=/, { timeout: 20000 }).catch(() => {}),
      page.click('button[name="jobStatus"][value="draft"]'),
    ]);
    const params = new URL(page.url()).searchParams;
    return { error: params.get("error"), success: params.get("success") };
  };

  const before = await count(`select count(*)::int n from public.job_postings where title = $1`, [TITLE]);

  const cases = [
    ["upah 0", { wageAmount: "0" }],
    ["upah negatif", { wageAmount: "-5000" }],
    ["kuota 0", { quota: "0" }],
    ["jam kerja 30 (>24)", { hoursPerDay: "30" }],
    ["durasi 0", { durationDays: "0" }],
    ["tanggal selesai sebelum mulai", { startDate: iso(5), endDate: iso(1) }],
    ["deskripsi < 10 karakter", { description: "pendek" }],
    ["judul < 3 karakter", { title: "ab" }],
  ];

  for (const [label, overrides] of cases) {
    const outcome = await publish(overrides);
    const stored = await count(`select count(*)::int n from public.job_postings where title = $1`, [TITLE]);
    const rejected = outcome.error === "validation" && !outcome.success && stored === before;
    record(`tolak lowongan: ${label}`, rejected, `error=${outcome.error ?? "-"} tersimpan=${stored - before}`);
  }

  // Control: the same stripped form with valid values must succeed, otherwise
  // the rejections above could just mean "the form never works".
  const good = await publish({});
  const created = await count(`select count(*)::int n from public.job_postings where title = $1`, [TITLE]);
  record("terima lowongan valid (kontrol)", good.success === "job-created" && created === before + 1, `success=${good.success ?? "-"}, +${created - before} baris`);

  await db.query(`delete from public.job_postings where title = $1`, [TITLE]);
  await context.close();
}

// ---------- supplier product ----------
{
  const { context, page } = await session("qa.supplier@pull-qa.test");
  const ITEM = "QA Bahan Validasi";

  const save = async (overrides) => {
    const values = { itemName: ITEM, unit: "kg", unitPrice: "25000", stockQuantity: "100", targetDiscount: "10", minimumDiscountQuantity: "50", ...overrides };
    await page.goto(`${BASE}/supplier/products`, { waitUntil: "networkidle", timeout: 60000 });
    for (const [name, value] of Object.entries(values)) {
      const field = page.locator(`input[name="${name}"]`).first();
      if (await field.count()) await field.fill(value);
    }
    await stripClientValidation(page);
    await Promise.all([
      page.waitForURL(/result=|error=/, { timeout: 20000 }).catch(() => {}),
      page.locator('form:has(input[name="itemName"]) button[type="submit"]').click(),
    ]);
    const params = new URL(page.url()).searchParams;
    return { result: params.get("result"), error: params.get("error") };
  };

  const cases = [
    ["harga 0", { unitPrice: "0" }],
    ["harga negatif", { unitPrice: "-1000" }],
    ["stok negatif", { stockQuantity: "-5" }],
    ["nama bahan < 3 karakter", { itemName: "ab" }],
  ];

  for (const [label, overrides] of cases) {
    const outcome = await save(overrides);
    const stored = await count(`select count(*)::int n from public.supplier_offers where item_name = $1`, [ITEM]);
    const rejected = outcome.result === "validation" && stored === 0;
    record(`tolak bahan baku: ${label}`, rejected, `result=${outcome.result ?? "-"} error=${outcome.error ?? "-"} tersimpan=${stored}`);
  }

  const good = await save({});
  const stored = await count(`select count(*)::int n from public.supplier_offers where item_name = $1`, [ITEM]);
  record("terima bahan baku valid (kontrol)", good.result === "saved" && stored === 1, `result=${good.result ?? "-"}, tersimpan=${stored}`);

  await db.query(`delete from public.supplier_offers where item_name = $1`, [ITEM]);
  await context.close();
}

await browser.close();
await db.end();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} lolos`);
if (failed.length) {
  console.log("\nPerlu perhatian:");
  for (const f of failed) console.log(`  - ${f.check} | ${f.detail}`);
}
