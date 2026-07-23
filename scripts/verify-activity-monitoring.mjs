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
  throw new Error("Konfigurasi verifikasi Activity Monitoring belum lengkap.");
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

const anonymousClient = createClient(supabaseUrl, publishableKey, clientOptions);
const { error: anonymousMonitoringError } = await anonymousClient.rpc(
  "get_admin_monitoring",
  {
    period_days: 7,
    role_filter: null,
    app_timezone: "Asia/Jakarta",
  },
);

if (!anonymousMonitoringError) {
  throw new Error("Monitoring seharusnya tidak dapat dibaca tanpa sesi Administrator.");
}

const supabase = createClient(supabaseUrl, publishableKey, clientOptions);
const { data: loginData, error: loginError } =
  await supabase.auth.signInWithPassword({ email, password });

if (loginError) throw loginError;

const { data: loginRecorded, error: loginRecordError } =
  await supabase.rpc("record_current_login");
if (loginRecordError) throw loginRecordError;

const { error: presenceError } = await supabase.rpc("touch_current_user_presence");
if (presenceError) throw presenceError;

const { error: fakeInsertError } = await supabase.from("activity_logs").insert({
  actor_id: loginData.user.id,
  actor_role: "admin",
  event_type: "auth.login_succeeded",
  category: "authentication",
  description: "Event palsu dari client",
  status: "success",
});

if (!fakeInsertError) {
  throw new Error("Client terautentikasi seharusnya tidak dapat menulis activity_logs langsung.");
}

const { data: monitoring, error: monitoringError } = await supabase.rpc(
  "get_admin_monitoring",
  {
    period_days: 7,
    role_filter: "admin",
    app_timezone: "Asia/Jakarta",
  },
);

if (monitoringError) throw monitoringError;

const { data: loginActivities, error: activityError } = await supabase
  .from("activity_logs")
  .select("id, event_type, actor_role, status")
  .eq("actor_id", loginData.user.id)
  .eq("event_type", "auth.login_succeeded")
  .order("created_at", { ascending: false })
  .limit(1);

if (activityError) throw activityError;

const monitoringVerified =
  loginRecorded === true &&
  monitoring?.period_days === 7 &&
  monitoring?.role_filter === "admin" &&
  Number(monitoring?.metrics?.active_users) >= 1 &&
  Number(monitoring?.metrics?.activities_today) >= 1 &&
  Array.isArray(monitoring?.trend) &&
  monitoring.trend.length === 7 &&
  Array.isArray(monitoring?.recent_activities) &&
  loginActivities?.[0]?.actor_role === "admin" &&
  loginActivities?.[0]?.status === "success";

await supabase.rpc("record_current_logout");
await supabase.auth.signOut({ scope: "local" });

if (!monitoringVerified) {
  throw new Error("Data monitoring Administrator tidak memenuhi kontrak yang diharapkan.");
}

console.log(
  JSON.stringify({
    anonymousAccessDenied: true,
    directLogInsertDenied: true,
    loginActivityRecorded: true,
    presenceUpdated: true,
    monitoringRpcVerified: true,
    trendPoints: monitoring.trend.length,
    recentActivityCount: monitoring.recent_activities.length,
  }),
);
