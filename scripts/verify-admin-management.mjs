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
    ) value = value.slice(1, -1);
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
  throw new Error("Konfigurasi verifikasi Administrator belum lengkap.");
}

const clientOptions = {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
};

const anonymousClient = createClient(supabaseUrl, publishableKey, clientOptions);
const { error: anonymousUsersError } = await anonymousClient.rpc("get_admin_users", {
  search_query: null,
  role_filter: null,
  status_filter: null,
  page_number: 1,
  page_size: 10,
  app_timezone: "Asia/Jakarta",
});

if (!anonymousUsersError) throw new Error("Daftar pengguna terbuka tanpa sesi Administrator.");

const supabase = createClient(supabaseUrl, publishableKey, clientOptions);
const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email,
  password,
});
if (loginError) throw loginError;

await supabase.rpc("record_current_login");

const [{ data: users, error: usersError }, { data: activities, error: activitiesError }] =
  await Promise.all([
    supabase.rpc("get_admin_users", {
      search_query: null,
      role_filter: "admin",
      status_filter: "active",
      page_number: 1,
      page_size: 10,
      app_timezone: "Asia/Jakarta",
    }),
    supabase.rpc("get_admin_activity_page", {
      period_days: 7,
      role_filter: "admin",
      result_filter: null,
      search_query: null,
      page_number: 1,
      page_size: 20,
      app_timezone: "Asia/Jakarta",
    }),
  ]);

if (usersError) throw usersError;
if (activitiesError) throw activitiesError;

const { error: selfModerationError } = await supabase.rpc("set_user_account_status", {
  target_user_id: loginData.user.id,
  requested_status: "suspended",
});

const currentAdminListed = users?.users?.some((account) => account.id === loginData.user.id);
const verified =
  currentAdminListed &&
  Number(users?.total) >= 1 &&
  Array.isArray(activities?.activities) &&
  Number(activities?.total) >= 1 &&
  selfModerationError?.message?.includes("own account");

await supabase.rpc("record_current_logout");
await supabase.auth.signOut({ scope: "local" });

if (!verified) throw new Error("Kontrak Manajemen Pengguna Administrator belum terpenuhi.");

console.log(JSON.stringify({
  anonymousUsersAccessDenied: true,
  adminUsersQueryVerified: true,
  adminActivityQueryVerified: true,
  selfSuspensionDenied: true,
  filteredAdminCount: Number(users.total),
  activityResultCount: activities.activities.length,
}));
