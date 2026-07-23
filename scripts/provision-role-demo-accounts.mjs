import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  return Object.fromEntries(content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#") && line.includes("=")).map((line) => {
    const separator = line.indexOf("=");
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [key, value];
  }));
}

const [appEnv, adminEnv] = await Promise.all([
  readFile(resolve(process.cwd(), ".env.local"), "utf8").then(parseEnv),
  readFile(resolve(process.cwd(), ".env.admin.local"), "utf8").then(parseEnv),
]);
const url = appEnv.NEXT_PUBLIC_SUPABASE_URL;
const secret = adminEnv.SUPABASE_SECRET_KEY;
const password = adminEnv.ADMIN_TEMP_PASSWORD;
if (!url || !secret || !password || password.length < 8) throw new Error("Konfigurasi provisioning akun demo belum lengkap.");

const supabase = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } });
const accounts = [
  { email: "demo.umkm@pull.example.com", role: "umkm", displayName: "Ayu Demo", businessName: "UMKM Demo Pull", headline: "Kuliner lokal" },
  { email: "demo.pekerja@pull.example.com", role: "pekerja", displayName: "Bima Demo", businessName: null, headline: "Pekerja operasional" },
  { email: "demo.supplier@pull.example.com", role: "supplier", displayName: "Citra Demo", businessName: "Supplier Demo Pull", headline: "Bahan baku UMKM" },
];

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;
const existingByEmail = new Map(listed.users.map((user) => [user.email?.toLowerCase(), user]));
const result = [];

for (const account of accounts) {
  let user = existingByEmail.get(account.email);
  let state = "reused";
  const metadata = { role: account.role, display_name: account.displayName, business_name: account.businessName, headline: account.headline, onboarding_step: "complete" };

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({ email: account.email, password, email_confirm: true, user_metadata: metadata });
    if (error || !data.user) throw error ?? new Error(`Akun ${account.role} tidak dapat dibuat.`);
    user = data.user;
    state = "created";
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: { ...user.user_metadata, ...metadata } });
    if (error || !data.user) throw error ?? new Error(`Akun ${account.role} tidak dapat diperbarui.`);
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({ id: user.id, email: account.email, display_name: account.displayName, business_name: account.businessName, headline: account.headline, role: account.role, account_status: "active", updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (profileError) throw profileError;
  result.push({ role: account.role, email: account.email, state });
}

console.log(JSON.stringify({ accounts: result, passwordSource: ".env.admin.local" }));
