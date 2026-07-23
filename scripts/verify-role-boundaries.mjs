import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  const values = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[key] = value;
  }
  return values;
}

const [appEnv, adminEnv, customRoleEnv] = await Promise.all([
  readFile(resolve(process.cwd(), ".env.local"), "utf8").then(parseEnv),
  readFile(resolve(process.cwd(), ".env.admin.local"), "utf8").then(parseEnv),
  readFile(resolve(process.cwd(), ".env.roles.local"), "utf8").then(parseEnv).catch(() => ({})),
]);
const roleEnv = { ...adminEnv, ...customRoleEnv };

const supabaseUrl = appEnv.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = appEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !publishableKey) throw new Error("Konfigurasi Supabase publik belum lengkap.");

const clientOptions = { auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false } };
const cases = [
  {
    role: "umkm",
    email: roleEnv.UMKM_EMAIL || "demo.umkm@pull.example.com",
    password: roleEnv.UMKM_PASSWORD || roleEnv.ADMIN_TEMP_PASSWORD,
    forbiddenRpc: "create_supplier_offer",
    forbiddenArgs: { offer_item_name: "Uji lintas role", offer_unit: "unit", offer_unit_price: 1 },
  },
  {
    role: "pekerja",
    email: roleEnv.WORKER_EMAIL || "demo.pekerja@pull.example.com",
    password: roleEnv.WORKER_PASSWORD || roleEnv.ADMIN_TEMP_PASSWORD,
    forbiddenRpc: "create_job_posting",
    forbiddenArgs: { job_title: "Uji lintas role", job_description: "Aksi ini wajib ditolak oleh database." },
  },
  {
    role: "supplier",
    email: roleEnv.SUPPLIER_EMAIL || "demo.supplier@pull.example.com",
    password: roleEnv.SUPPLIER_PASSWORD || roleEnv.ADMIN_TEMP_PASSWORD,
    forbiddenRpc: "submit_job_application",
    forbiddenArgs: { target_job_id: crypto.randomUUID(), application_message: "Aksi ini wajib ditolak." },
  },
];

if (cases.some(({ email, password }) => !email || !password)) {
  throw new Error("Isi kredensial role atau ADMIN_TEMP_PASSWORD sebelum menjalankan verifikasi.");
}

const verified = [];
for (const testCase of cases) {
  const client = createClient(supabaseUrl, publishableKey, clientOptions);
  const { data: login, error: loginError } = await client.auth.signInWithPassword({ email: testCase.email, password: testCase.password });
  if (loginError) throw new Error(`Login ${testCase.role} gagal: ${loginError.message}`);

  const { data: profile, error: profileError } = await client.from("profiles").select("role,account_status").eq("id", login.user.id).single();
  if (profileError || profile?.role !== testCase.role || profile?.account_status !== "active") throw new Error(`Profil ${testCase.role} tidak sesuai.`);

  const { error: adminRpcError } = await client.rpc("get_admin_monitoring", { period_days: 7, role_filter: null, app_timezone: "Asia/Jakarta" });
  if (!adminRpcError) throw new Error(`${testCase.role} dapat membaca monitoring Administrator.`);

  const { error: crossRoleError } = await client.rpc(testCase.forbiddenRpc, testCase.forbiddenArgs);
  if (!crossRoleError) throw new Error(`${testCase.role} dapat menjalankan aksi role lain.`);

  const { error: ownActivityError } = await client.from("activity_logs").select("id").eq("actor_id", login.user.id).limit(1);
  if (ownActivityError) throw new Error(`${testCase.role} tidak dapat membaca aktivitasnya sendiri.`);

  const dashboardQuery = testCase.role === "umkm"
    ? client.from("job_postings").select("id,status").eq("owner_id", login.user.id).limit(1)
    : testCase.role === "pekerja"
      ? client.from("job_applications").select("id,status,job_postings(title)").eq("worker_id", login.user.id).limit(1)
      : client.from("supplier_offers").select("id,status").eq("supplier_id", login.user.id).limit(1);
  const { error: dashboardError } = await dashboardQuery;
  if (dashboardError) throw new Error(`Data dashboard ${testCase.role} tidak dapat dibaca.`);

  await client.auth.signOut({ scope: "local" });
  verified.push(testCase.role);
}

console.log(JSON.stringify({ verifiedRoles: verified, adminMonitoringDenied: true, crossRoleActionsDenied: true, ownActivityReadable: true, roleDashboardsReadable: true }));
