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
  throw new Error("Konfigurasi verifikasi Smart Impact belum lengkap.");
}

const clientOptions = {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
};

const rpcArguments = {
  period_days: 30,
  category_filter: null,
  priority_filter: null,
  page_number: 1,
  page_size: 15,
  app_timezone: "Asia/Jakarta",
};

const anonymousClient = createClient(supabaseUrl, publishableKey, clientOptions);
const { error: anonymousDashboardError } = await anonymousClient.rpc(
  "get_admin_impact_dashboard",
  rpcArguments,
);

if (!anonymousDashboardError) {
  throw new Error("Smart Impact seharusnya tidak dapat dibaca tanpa sesi Administrator.");
}

const supabase = createClient(supabaseUrl, publishableKey, clientOptions);
const { data: loginData, error: loginError } =
  await supabase.auth.signInWithPassword({ email, password });

if (loginError) throw loginError;

const { data: dashboard, error: dashboardError } = await supabase.rpc(
  "get_admin_impact_dashboard",
  rpcArguments,
);

if (dashboardError) throw dashboardError;

const { error: fakeInsertError } = await supabase
  .from("impact_action_logs")
  .insert({
    actor_id: loginData.user.id,
    item_type: "job_posting",
    item_id: crypto.randomUUID(),
    action_type: "dismissed",
    previous_priority: "low",
  });

if (!fakeInsertError) {
  throw new Error("Client seharusnya tidak dapat menulis Action Log secara langsung.");
}

const { error: fakeActionError } = await supabase.rpc("record_impact_action", {
  target_item_type: "job_posting",
  target_item_id: crypto.randomUUID(),
  requested_action: "dismissed",
  action_note: "Verifikasi target palsu",
});

if (!fakeActionError) {
  throw new Error("RPC Action Log seharusnya menolak item yang tidak tersedia.");
}

const metricNames = [
  "active_jobs",
  "applications",
  "placement_rate",
  "active_supplier_offers",
];
const dashboardVerified =
  dashboard?.period_days === 30 &&
  dashboard?.category_filter === null &&
  dashboard?.priority_filter === null &&
  metricNames.every((name) => Number.isFinite(Number(dashboard?.metrics?.[name]))) &&
  ["high", "medium", "low", "pending"].every((name) =>
    Number.isFinite(Number(dashboard?.priority_summary?.[name])),
  ) &&
  Array.isArray(dashboard?.items) &&
  Array.isArray(dashboard?.recommendations) &&
  Array.isArray(dashboard?.action_log);

await supabase.auth.signOut({ scope: "local" });

if (!dashboardVerified) {
  throw new Error("Data Smart Impact tidak memenuhi kontrak yang diharapkan.");
}

console.log(
  JSON.stringify({
    anonymousAccessDenied: true,
    directActionLogInsertDenied: true,
    invalidActionTargetDenied: true,
    dashboardRpcVerified: true,
    metricCount: metricNames.length,
    itemCount: dashboard.items.length,
    recommendationCount: dashboard.recommendations.length,
    actionLogCount: dashboard.action_log.length,
  }),
);
