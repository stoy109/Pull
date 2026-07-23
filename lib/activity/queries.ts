import "server-only";

import { parseAppRole, type Role } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type ActivityLog = {
  id: string;
  user_id: string;
  role: Role | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip: null;
  user_agent: null;
  created_at: string;
  actorName: string;
  actorRole: Role | null;
  createdAt: string;
  detail: string;
};

type Since = string | Date;
type ActivityRange = "24h" | "7d" | "30d";
type RawActivity = {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  event_type: string;
  target_type: string | null;
  target_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const LEGACY_ACTION_BY_EVENT: Record<string, string> = {
  "auth.login_succeeded": "auth.login",
  "auth.logout": "auth.logout",
  "profile.updated": "profile.update",
  "role.changed": "role.set",
  "job.created": "job.draft",
  "job.published": "job.post",
  "application.submitted": "job.apply",
  "pool.created": "pool.create",
  "pool.joined": "pool.join",
  "supplier.offer_created": "supplier.offer",
};

function normalizeSince(since?: Since) {
  if (!since) return null;
  const date = since instanceof Date ? since : new Date(since);
  if (Number.isNaN(date.getTime())) throw new TypeError("Invalid activity since date");
  return date.toISOString();
}

function sinceForRange(range?: ActivityRange) {
  if (!range) return null;
  const hours = range === "24h" ? 24 : range === "7d" ? 7 * 24 : 30 * 24;
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function throwQueryError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function readString(metadata: Record<string, unknown>, keys: readonly string[], fallback = "") {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}

function readNumber(metadata: Record<string, unknown>, keys: readonly string[]) {
  for (const key of keys) {
    const value = metadata[key];
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

function mapActivity(activity: RawActivity): ActivityLog {
  const metadata = activity.metadata ?? {};
  const role = parseAppRole(activity.actor_role);
  const userId = activity.actor_id ?? "";
  return {
    id: activity.id,
    user_id: userId,
    role,
    action: LEGACY_ACTION_BY_EVENT[activity.event_type] ?? activity.event_type,
    entity_type: activity.target_type,
    entity_id: activity.target_id,
    metadata,
    ip: null,
    user_agent: null,
    created_at: activity.created_at,
    actorName: readString(metadata, ["actor_name", "display_name", "business_name"], userId ? `Pengguna ${userId.slice(0, 8)}` : "Pengguna Pull"),
    actorRole: role,
    createdAt: activity.created_at,
    detail: readString(metadata, ["detail", "message"], activity.description),
  };
}

export async function getRecentActivities({
  limit = 50,
  roleFilter,
  userIdFilter,
  since,
  role,
  range,
}: {
  limit?: number;
  roleFilter?: Role | "all" | null;
  userIdFilter?: string | null;
  since?: Since;
  role?: Role | null;
  range?: ActivityRange;
}) {
  const normalizedSince = normalizeSince(since) ?? sinceForRange(range);
  const resolvedRole = roleFilter ?? role;
  const supabase = await createClient();
  let query = supabase
    .from("activity_logs")
    .select("id,actor_id,actor_role,event_type,target_type,target_id,description,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(100, Math.max(1, Math.trunc(limit))));

  if (resolvedRole && resolvedRole !== "all") query = query.eq("actor_role", resolvedRole);
  if (userIdFilter) query = query.eq("actor_id", userIdFilter);
  if (normalizedSince) query = query.gte("created_at", normalizedSince);

  const { data, error } = await query;
  throwQueryError("Failed to load recent activities", error);
  return ((data ?? []) as RawActivity[]).map(mapActivity);
}

export async function getActivityStats({ since }: { since?: Since } = {}) {
  const normalizedSince = normalizeSince(since);
  const wibOffset = 7 * 60 * 60 * 1000;
  const todayWib = new Date(
    Math.floor((Date.now() + wibOffset) / 86_400_000) * 86_400_000 - wibOffset,
  ).toISOString();
  const roles: Role[] = ["admin", "umkm", "pekerja", "supplier"];
  const supabase = await createClient();
  const createCountQuery = (role?: Role, querySince = normalizedSince) => {
    let query = supabase.from("activity_logs").select("id", { count: "exact", head: true });
    if (role) query = query.eq("actor_role", role);
    if (querySince) query = query.gte("created_at", querySince);
    return query;
  };

  const [todayResult, ...roleResults] = await Promise.all([
    createCountQuery(undefined, todayWib),
    ...roles.map((role) => createCountQuery(role)),
  ]);
  throwQueryError("Failed to count today's activities", todayResult.error);
  roleResults.forEach((result) => throwQueryError("Failed to count activities by role", result.error));

  return {
    totalToday: todayResult.count ?? 0,
    byRole: Object.fromEntries(roles.map((role, index) => [role, roleResults[index].count ?? 0])) as Record<Role, number>,
  };
}

export async function getActiveUsersCount({ since }: { since?: Since } = {}) {
  const normalizedSince = normalizeSince(since ?? new Date(Date.now() - 24 * 60 * 60 * 1000));
  const supabase = await createClient();
  const { data, error } = await supabase.rpc(
    "get_active_users_count",
    normalizedSince ? { since_at: normalizedSince } : {},
  );
  throwQueryError("Failed to count active users", error);
  const count = Number(data ?? 0);
  return Number.isFinite(count) ? count : 0;
}

export async function getUmkmOverviewStats(userId: string) {
  const supabase = await createClient();
  const [poolResult, jobsResult] = await Promise.all([
    supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("actor_id", userId)
      .eq("event_type", "pool.created"),
    supabase
      .from("job_postings")
      .select("id,status")
      .eq("owner_id", userId),
  ]);
  throwQueryError("Failed to count active pools", poolResult.error);
  throwQueryError("Failed to load job overview", jobsResult.error);

  const jobs = jobsResult.data ?? [];
  const jobIds = jobs.map((job) => job.id);
  let applications = 0;
  if (jobIds.length) {
    const result = await supabase
      .from("job_applications")
      .select("id", { count: "exact", head: true })
      .in("job_id", jobIds);
    throwQueryError("Failed to count job applications", result.error);
    applications = result.count ?? 0;
  }

  return {
    activePools: poolResult.count ?? 0,
    activeJobs: jobs.filter((job) => job.status === "published").length,
    applications,
  };
}

export async function getSupplierDashboardData() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_supplier_demands");
  const migrationPending = error && ["42883", "PGRST202"].includes(error.code);
  if (!migrationPending) throwQueryError("Failed to load supplier demand", error);

  const demands = ((data ?? []) as Array<{
    id: string;
    requester_key: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
  }>).map((activity) => {
    const metadata = activity.metadata ?? {};
    return {
      id: readString(metadata, ["pool_id"], activity.id),
      umkmId: activity.requester_key ?? "",
      productName: readString(metadata, ["product_name", "item_name", "commodity", "name"], "Permintaan bahan"),
      category: readString(metadata, ["category"], "Lainnya"),
      targetQuantity: readNumber(metadata, ["target_quantity", "quantity", "volume"]),
      currentQuantity: readNumber(metadata, ["current_quantity"]),
      unit: readString(metadata, ["unit"]),
      location: readString(metadata, ["location", "district"]),
      status: readString(metadata, ["status"], "active"),
      deadline: readString(metadata, ["deadline", "deadline_at"]),
      createdAt: activity.created_at,
      metadata,
    };
  });
  const activeStatuses = new Set(["active", "open", "waiting"]);
  const activeDemand = demands.filter((demand) => activeStatuses.has(demand.status.toLowerCase()));
  const waitingDemand = activeDemand.filter((demand) => demand.status.toLowerCase() === "waiting");
  const categories = new Set(activeDemand.map((demand) => demand.category)).size;
  const commodities = new Set(activeDemand.map((demand) => demand.productName)).size;
  const volumeByUnit = activeDemand.reduce<Record<string, number>>((totals, demand) => {
    const unit = demand.unit || "unit";
    totals[unit] = (totals[unit] ?? 0) + demand.targetQuantity;
    return totals;
  }, {});
  const estimatedVolume = Object.entries(volumeByUnit)
    .map(([unit, volume]) => `${volume.toLocaleString("id-ID")} ${unit}`)
    .join(" · ") || "0";
  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  const pools = waitingDemand.map((demand) => ({
    id: demand.id,
    commodity: demand.productName,
    category: demand.category,
    location: demand.location,
    volume: demand.targetQuantity,
    unit: demand.unit,
    deadline: demand.deadline,
    poolLeader: readString(demand.metadata, ["pool_leader", "business_name", "actor_name"], "Data terlindungi"),
    whatsappMasked: readString(demand.metadata, ["whatsapp_masked"], "Nomor disembunyikan"),
  }));

  return {
    demands,
    activeDemands: activeDemand.length,
    requestingUmkm: new Set(activeDemand.map((demand) => demand.umkmId).filter(Boolean)).size,
    categories,
    pools,
    poolsLast7Days: demands.filter((demand) => new Date(demand.createdAt).getTime() >= sevenDaysAgo).length,
    totalCommodities: commodities,
    estimatedVolume,
    awaitingConfirmation: waitingDemand.length,
  };
}
