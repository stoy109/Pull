// Full E2E suite: 4 roles, session lifecycle, every role page, guards,
// /verify-phone degradation, logout, and the branded 404.
// Verdicts are explicit booleans — no regex guessing over result strings.
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import { BASE, EXE, PASSWORD, SHOTS } from "./config.mjs";

await mkdir(SHOTS, { recursive: true });

const accounts = [
  {
    role: "admin", email: "qa.admin@pull-qa.test", expect: "/admin",
    routes: ["/admin", "/admin/users", "/admin/kyc", "/admin/metrics", "/admin/impact", "/admin/activity"],
    forbidden: "/dashboard",
  },
  {
    role: "umkm", email: "qa.umkm@pull-qa.test", expect: "/dashboard",
    routes: ["/dashboard", "/dashboard/pools", "/dashboard/jobs", "/dashboard/publish", "/dashboard/profile", "/dashboard/trust", "/dashboard/activity", "/dashboard/settings"],
    forbidden: "/admin",
  },
  {
    role: "pekerja", email: "qa.pekerja@pull-qa.test", expect: "/worker/dashboard",
    routes: ["/worker/dashboard", "/worker/jobs", "/worker/applications", "/worker/profile", "/worker/trust", "/worker/notifications", "/worker/settings"],
    forbidden: "/admin",
  },
  {
    role: "supplier", email: "qa.supplier@pull-qa.test", expect: "/supplier",
    routes: ["/supplier", "/supplier/products", "/supplier/demands", "/supplier/offers", "/supplier/transactions", "/supplier/finance", "/supplier/insights", "/supplier/store", "/supplier/profile", "/supplier/settings", "/supplier/notifications"],
    forbidden: "/dashboard",
  },
];

const browser = await chromium.launch({ executablePath: EXE, headless: true });
const results = [];

// "Failed to load resource" is how the browser reports an HTTP error response.
// On negative tests that response is the expected outcome, so it is filtered out.
const realErrors = (errors) => errors.filter((e) => !/Failed to load resource/i.test(e));

function push({ role, check, pass, detail, errors = [], ms }) {
  const kept = realErrors(errors);
  const ok = Boolean(pass) && kept.length === 0;
  results.push({ role, check, pass: ok, detail, errors: kept, ms });
  console.log(`${ok ? "ok  " : "FAIL"} | ${role.padEnd(8)} | ${check.padEnd(36)} | ${detail}`);
  for (const e of kept.slice(0, 2)) console.log(`       ↳ ${e}`);
}

function attach(page, bucket) {
  page.on("console", (m) => m.type() === "error" && bucket.push(`console: ${m.text().slice(0, 240)}`));
  page.on("pageerror", (e) => bucket.push(`pageerror: ${String(e).slice(0, 240)}`));
}

async function login(context, email) {
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !["/", "/auth/redirect"].includes(u.pathname), { timeout: 45000 });
  return page;
}

const contexts = {};

for (const account of accounts) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  context.on("page", (p) => attach(p, errors));
  contexts[account.role] = { context, errors };

  let page;
  try {
    page = await login(context, account.email);
    const landed = new URL(page.url()).pathname;
    push({ role: account.role, check: "login + redirect peran", pass: landed.startsWith(account.expect), detail: `→ ${landed} (harap ${account.expect})`, errors: [...errors] });
  } catch (error) {
    push({ role: account.role, check: "login + redirect peran", pass: false, detail: `gagal login: ${String(error).slice(0, 140)}`, errors: [...errors] });
    await context.close();
    continue;
  }

  // session survives a hard reload
  errors.length = 0;
  await page.reload({ waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(600);
  const afterReload = new URL(page.url()).pathname;
  push({ role: account.role, check: "sesi bertahan setelah reload", pass: afterReload.startsWith(account.expect), detail: `→ ${afterReload}`, errors: [...errors] });

  // every authorised route
  for (const route of account.routes) {
    errors.length = 0;
    const started = Date.now();
    let pass = false;
    let detail;
    try {
      const response = await page.goto(BASE + route, { waitUntil: "domcontentloaded", timeout: 60000 });
      const status = response?.status() ?? 0;
      const finalPath = new URL(page.url()).pathname;
      const h1 = (await page.locator("h1, h2").first().textContent().catch(() => ""))?.trim().slice(0, 48) ?? "";
      const body = (await page.locator("body").innerText().catch(() => "")).slice(0, 2500);
      const errorPage = /Application error|Unhandled Runtime Error|missing required error components/i.test(body);
      const root = account.role === "pekerja" ? "/worker" : account.role === "umkm" ? "/dashboard" : `/${account.role}`;
      const redirected = finalPath !== route;
      const stillInRole = redirected && finalPath.startsWith(root);
      pass = status === 200 && !errorPage && (!redirected || stillInRole);
      detail = `${status}${redirected ? ` → ${finalPath}` : ""}${errorPage ? " ERROR-PAGE" : ""}${h1 ? ` "${h1}"` : ""}`;
    } catch (error) {
      detail = `TIMEOUT/ERROR: ${String(error).slice(0, 110)}`;
    }
    push({ role: account.role, check: route, pass, detail, errors: [...errors], ms: Date.now() - started });
  }

  // cross-role guard
  errors.length = 0;
  try {
    await page.goto(BASE + account.forbidden, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(900);
    const finalPath = new URL(page.url()).pathname;
    push({ role: account.role, check: `guard ${account.forbidden}`, pass: finalPath !== account.forbidden, detail: finalPath === account.forbidden ? "BOCOR: tetap di halaman terlarang" : `OK dialihkan ke ${finalPath}`, errors: [...errors] });
  } catch (error) {
    push({ role: account.role, check: `guard ${account.forbidden}`, pass: false, detail: `ERROR ${String(error).slice(0, 100)}`, errors: [...errors] });
  }

  await page.screenshot({ path: `${SHOTS}/full-${account.role}.png` });
}

// ---------- /verify-phone: renders + validates + degrades without an SMS provider ----------
if (contexts.pekerja) {
  const { context } = contexts.pekerja;
  const errors = [];
  const page = await context.newPage();
  attach(page, errors);

  const response = await page.goto(`${BASE}/verify-phone`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const heading = (await page.locator("h1").first().textContent().catch(() => ""))?.trim();
  push({ role: "pekerja", check: "verify-phone render", pass: response?.status() === 200 && Boolean(heading), detail: `${response?.status() ?? 0} "${heading ?? ""}"`, errors: [...errors] });

  // Without an SMS provider the form is deliberately hidden, so the page must
  // explain itself instead of offering a form that can never deliver a code.
  // With a provider configured (NEXT_PUBLIC_PHONE_VERIFICATION_ENABLED=true)
  // the form is rendered and the two checks below apply instead.
  const telInput = page.locator('input[inputmode="tel"]');
  const formPresent = (await telInput.count()) > 0;

  if (!formPresent) {
    const notice = await page.locator("text=belum tersedia karena provider SMS").count();
    push({ role: "pekerja", check: "verify-phone tanpa provider: form disembunyikan", pass: notice > 0, detail: notice ? "penjelasan tampil, form tidak dirender" : "TIDAK ADA penjelasan", errors: [...errors] });
  } else {
    // invalid local number -> client-side rejection, no request sent
    errors.length = 0;
    await telInput.fill("123");
    await page.locator('form button:not([type="button"])').first().click();
    await page.waitForTimeout(700);
    const invalidMsg = await page.locator("text=Masukkan nomor Indonesia yang valid").count();
    push({ role: "pekerja", check: "verify-phone tolak nomor invalid", pass: invalidMsg > 0, detail: invalidMsg ? "pesan validasi tampil" : "TIDAK ADA pesan validasi", errors: [...errors] });

    // valid number but no SMS provider -> graceful error, page must not crash
    errors.length = 0;
    await telInput.fill("81234567890");
    await page.locator('form button:not([type="button"])').first().click();
    await page.waitForTimeout(6000);
    const body = await page.locator("body").innerText();
    const crashed = /Application error|Unhandled Runtime Error/i.test(body);
    const graceful = /OTP belum dapat dikirim|provider|SMS|not configured|Unable/i.test(body);
    push({ role: "pekerja", check: "verify-phone tanpa provider SMS", pass: !crashed && graceful, detail: crashed ? "halaman crash" : graceful ? "ditolak dengan pesan jelas (tanpa crash)" : "BUKAN: tidak ada umpan balik", errors: [...errors] });
  }
  await page.screenshot({ path: `${SHOTS}/full-verify-phone.png` });
  await page.close();
}

// ---------- logout clears the session ----------
if (contexts.umkm) {
  const { context } = contexts.umkm;
  const errors = [];
  const page = await context.newPage();
  attach(page, errors);
  await page.goto(`${BASE}/dashboard/settings`, { waitUntil: "networkidle", timeout: 60000 });
  const button = page.locator('form:has(button:has-text("Keluar")) button').first();
  if (await button.count()) {
    await Promise.all([
      page.waitForURL((u) => u.pathname === "/", { timeout: 45000 }).catch(() => {}),
      button.click(),
    ]);
    const afterLogout = new URL(page.url()).pathname;
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(700);
    const guarded = new URL(page.url()).pathname;
    push({ role: "umkm", check: "logout + proteksi ulang", pass: afterLogout === "/" && guarded === "/", detail: `after=${afterLogout} then /dashboard→${guarded}`, errors: [...errors] });
  } else {
    push({ role: "umkm", check: "logout + proteksi ulang", pass: false, detail: "TIDAK ADA tombol Keluar", errors: [...errors] });
  }
  await page.close();
}

// ---------- negatives: wrong password, anonymous, branded 404 ----------
{
  const context = await browser.newContext();
  const errors = [];
  const page = await context.newPage();
  attach(page, errors);

  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.fill('input[name="email"]', "qa.umkm@pull-qa.test");
  await page.fill('input[name="password"]', "salah-banget-123");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4500);
  const text = await page.locator("body").innerText();
  const shown = /belum sesuai|tidak sesuai|invalid|gagal/i.test(text);
  const stillOnLogin = new URL(page.url()).pathname === "/";
  push({ role: "anon", check: "login password salah", pass: shown && stillOnLogin, detail: shown ? "pesan error tampil, tetap di /" : "TIDAK ADA pesan error", errors: [...errors] });

  errors.length = 0;
  await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(800);
  const adminPath = new URL(page.url()).pathname;
  push({ role: "anon", check: "akses /admin tanpa login", pass: adminPath !== "/admin", detail: `dialihkan ke ${adminPath}`, errors: [...errors] });

  errors.length = 0;
  const notFound = await page.goto(`${BASE}/halaman-yang-tidak-ada`, { waitUntil: "domcontentloaded", timeout: 45000 });
  const notFoundBody = await page.locator("body").innerText();
  const branded = /tidak ditemukan|404|kembali/i.test(notFoundBody);
  push({ role: "anon", check: "halaman 404 branded", pass: notFound?.status() === 404 && branded, detail: `status ${notFound?.status()}${branded ? " + halaman branded" : ""}`, errors: [...errors] });
  await page.screenshot({ path: `${SHOTS}/full-404.png` });
  await context.close();
}

for (const { context } of Object.values(contexts)) await context.close();
await browser.close();

const failures = results.filter((r) => !r.pass);
await writeFile(`${SHOTS}/report-full.json`, JSON.stringify({ total: results.length, passed: results.length - failures.length, failures: failures.length, results }, null, 2), "utf8");
console.log(`\n${results.length - failures.length}/${results.length} lolos`);
if (failures.length) {
  console.log("\nYang gagal:");
  for (const f of failures) console.log(`  - ${f.role} | ${f.check} | ${f.detail}`);
}
