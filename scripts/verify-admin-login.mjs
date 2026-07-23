import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function parseEnv(content) {
  const values = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex < 1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  return values;
}

const [appEnv, adminEnv] = await Promise.all([
  readFile(resolve(process.cwd(), ".env.local"), "utf8").then(parseEnv),
  readFile(resolve(process.cwd(), ".env.admin.local"), "utf8").then(parseEnv),
]);

const supabaseUrl = appEnv.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = appEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const email = adminEnv.ADMIN_EMAIL?.trim().toLowerCase();
const password = adminEnv.ADMIN_TEMP_PASSWORD;

if (!supabaseUrl || !publishableKey || !email || !password) {
  throw new Error("Konfigurasi login Administrator belum lengkap.");
}

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});

const { data: loginData, error: loginError } =
  await supabase.auth.signInWithPassword({ email, password });

if (loginError) throw loginError;

const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("role, account_status")
  .eq("id", loginData.user.id)
  .single();

if (profileError) throw profileError;

const verified =
  loginData.user.app_metadata?.role === "admin" &&
  profile.role === "admin" &&
  profile.account_status === "active";

await supabase.auth.signOut({ scope: "local" });

if (!verified) {
  throw new Error("Role atau status Administrator tidak sesuai.");
}

console.log(
  JSON.stringify({
    credentialLoginVerified: true,
    appMetadataRole: "admin",
    profileRole: "admin",
    status: "active",
    rlsSelfReadVerified: true,
  }),
);
