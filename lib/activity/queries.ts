import "server-only";

import { ROLES, type Role } from "@/lib/auth/roles";
import { isMvpAuthEnabled } from "@/lib/auth/mvp-session";
import { createServiceRoleClient } from "@/lib/supabase/server";

export type ActivityLog = {
  id: string;
  user_id: string;
  role: Role;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
  actorName: string;
  actorRole: Role;
  createdAt: string;
  detail: string;
};

type Since = string | Date;
type ActivityRange = "24h" | "7d" | "30d";

type DemoActivity = Omit<
  ActivityLog,
  "actorName" | "actorRole" | "createdAt" | "detail"
>;

function getDemoActivities(): ActivityLog[] {
  const now = Date.now();
  const blueprints: Array<{
    role: Role;
    action: string;
    entityType: string;
    actor: string;
    detail: string;
    minutesAgo: number;
    metadata?: Record<string, unknown>;
  }> = [
    { role: "umkm", action: "pool.create", entityType: "pool", actor: "Dapur Sari", detail: "Membuat pool Kain Katun Combed 30s.", minutesAgo: 8, metadata: { pool_id: "demo-pool-1", product_name: "Kain Katun Combed 30s", category: "Tekstil & Kain", target_quantity: 500, current_quantity: 350, unit: "kg", district: "Laweyan", deadline_at: new Date(now + 3 * 86_400_000).toISOString(), pool_leader: "Dapur Sari", whatsapp_masked: "0812••••321", status: "waiting" } },
    { role: "pekerja", action: "job.apply", entityType: "application", actor: "Dimas Pratama", detail: "Melamar posisi Staf Packing Harian.", minutesAgo: 18 },
    { role: "supplier", action: "pool.view", entityType: "pool", actor: "Solo Supply", detail: "Melihat kebutuhan bahan baku terbaru.", minutesAgo: 27 },
    { role: "admin", action: "admin.review", entityType: "user", actor: "Panitia Bytesfest", detail: "Meninjau aktivitas pengguna terbaru.", minutesAgo: 42 },
    { role: "umkm", action: "job.post", entityType: "job", actor: "Batik Laweyan", detail: "Memposting lowongan Staf Produksi.", minutesAgo: 65 },
    { role: "pekerja", action: "profile.update", entityType: "profile", actor: "Rina Puspita", detail: "Memperbarui profil dan keahlian.", minutesAgo: 95 },
    { role: "umkm", action: "pool.create", entityType: "pool", actor: "Kriya Solo", detail: "Membuat pool Standing Pouch 500 ml.", minutesAgo: 140, metadata: { pool_id: "demo-pool-2", product_name: "Standing Pouch 500 ml", category: "Kemasan", target_quantity: 10000, current_quantity: 8000, unit: "pcs", district: "Serengan", deadline_at: new Date(now + 5 * 86_400_000).toISOString(), pool_leader: "Kriya Solo", whatsapp_masked: "0813••••908", status: "waiting" } },
    { role: "supplier", action: "supplier.offer", entityType: "pool", actor: "Mitra Bahan Solo", detail: "Mengirim penawaran supplier.", minutesAgo: 210 },
    { role: "admin", action: "activity.export", entityType: "user", actor: "Admin Pull", detail: "Mengekspor ringkasan monitoring.", minutesAgo: 2880 },
    { role: "umkm", action: "profile.update", entityType: "profile", actor: "Warung Makmur", detail: "Memperbarui profil bisnis.", minutesAgo: 17280 },
  ];

  return blueprints.map((item, index) => mapActivity({
    id: `demo-activity-${index + 1}`,
    user_id: `demo-${item.role}-${index + 1}`,
    role: item.role,
    action: item.action,
    entity_type: item.entityType,
    entity_id: null,
    metadata: { actor_name: item.actor, detail: item.detail, ...item.metadata },
    ip: null,
    user_agent: "Pull MVP Demo",
    created_at: new Date(now - item.minutesAgo * 60_000).toISOString(),
  } satisfies DemoActivity));
}

function normalizeSince(since?: Since) {
  if (!since) return null;

  const date = since instanceof Date ? since : new Date(since);
  if (Number.isNaN(date.getTime())) throw new TypeError("Invalid activity since date");
  return date.toISOString();
}

function throwQueryError(context: string, error: { message: string } | null) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function sinceForRange(range?: ActivityRange) {
  if (!range) return null;
  const hours = range === "24h" ? 24 : range === "7d" ? 7 * 24 : 30 * 24;
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function mapActivity(activity: Omit<ActivityLog, "actorName" | "actorRole" | "createdAt" | "detail">): ActivityLog {
  const metadata = activity.metadata ?? {};
  const actorName = readString(
    metadata,
    ["actor_name", "display_name", "business_name"],
    `Pengguna ${activity.user_id.slice(0, 8)}`,
  );

  return {
    ...activity,
    metadata,
    actorName,
    actorRole: activity.role,
    createdAt: activity.created_at,
    detail: readString(metadata, ["detail", "description", "message"]),
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

  if (isMvpAuthEnabled()) {
    return getDemoActivities()
      .filter((activity) => !resolvedRole || resolvedRole === "all" || activity.role === resolvedRole)
      .filter((activity) => !normalizedSince || activity.created_at >= normalizedSince)
      .slice(0, Math.min(100, Math.max(1, Math.trunc(limit))));
  }

  const supabase = createServiceRoleClient();
  let query = supabase
    .from("activity_logs")
    .select("id,user_id,role,action,entity_type,entity_id,metadata,ip,user_agent,created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(100, Math.max(1, Math.trunc(limit))));

  if (resolvedRole && resolvedRole !== "all") query = query.eq("role", resolvedRole);
  if (userIdFilter) query = query.eq("user_id", userIdFilter);
  if (normalizedSince) query = query.gte("created_at", normalizedSince);

  const { data, error } = await query;
  throwQueryError("Failed to load recent activities", error);
  return ((data ?? []) as Omit<ActivityLog, "actorName" | "actorRole" | "createdAt" | "detail">[]).map(mapActivity);
}

export async function getActivityStats(
  { since }: { since?: Since } = {},
) {
  const normalizedSince = normalizeSince(since);
  const wibOffset = 7 * 60 * 60 * 1000;
  const todayWib = new Date(
    Math.floor((Date.now() + wibOffset) / 86_400_000) * 86_400_000 -
      wibOffset,
  ).toISOString();

  if (isMvpAuthEnabled()) {
    const activities = getDemoActivities();
    return {
      totalToday: activities.filter((activity) => activity.created_at >= todayWib).length,
      byRole: Object.fromEntries(
        ROLES.map((role) => [
          role,
          activities.filter((activity) =>
            activity.role === role && (!normalizedSince || activity.created_at >= normalizedSince)
          ).length,
        ]),
      ) as Record<Role, number>,
    };
  }

  const supabase = createServiceRoleClient();
  const createCountQuery = (role?: Role, querySince = normalizedSince) => {
    let query = supabase
      .from("activity_logs")
      .select("id", { count: "exact", head: true });

    if (role) query = query.eq("role", role);
    if (querySince) query = query.gte("created_at", querySince);
    return query;
  };

  const [todayResult, ...roleResults] = await Promise.all([
    createCountQuery(undefined, todayWib),
    ...ROLES.map((role) => createCountQuery(role)),
  ]);
  throwQueryError("Failed to count today's activities", todayResult.error);
  roleResults.forEach((result) =>
    throwQueryError("Failed to count activities by role", result.error),
  );

  return {
    totalToday: todayResult.count ?? 0,
    byRole: Object.fromEntries(
      ROLES.map((role, index) => [role, roleResults[index].count ?? 0]),
    ) as Record<Role, number>,
  };
}

export async function getActiveUsersCount(
  { since }: { since?: Since } = {},
) {
  const normalizedSince = normalizeSince(
    since ?? new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  if (isMvpAuthEnabled()) {
    return new Set(
      getDemoActivities()
        .filter((activity) => !normalizedSince || activity.created_at >= normalizedSince)
        .map((activity) => activity.user_id),
    ).size;
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc(
    "get_active_users_count",
    normalizedSince ? { since_at: normalizedSince } : {},
  );

  throwQueryError("Failed to count active users", error);
  const count = Number(data ?? 0);
  return Number.isFinite(count) ? count : 0;
}

async function countActivities(
  action: string | readonly string[],
  userId?: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = createServiceRoleClient();
  let query = supabase
    .from("activity_logs")
    .select("id", { count: "exact", head: true });

  query = Array.isArray(action)
    ? query.in("action", [...action])
    : query.eq("action", action as string);
  if (userId) query = query.eq("user_id", userId);
  if (metadata) query = query.contains("metadata", metadata);

  const { count, error } = await query;
  throwQueryError("Failed to count dashboard activities", error);
  return count ?? 0;
}

export async function getUmkmOverviewStats(userId: string) {
  if (isMvpAuthEnabled()) {
    const activities = getDemoActivities();
    return {
      activePools: activities.filter((activity) => activity.action === "pool.create").length,
      activeJobs: activities.filter((activity) => activity.action === "job.post").length,
      applications: activities.filter((activity) => activity.action === "job.apply").length,
    };
  }

  const [activePools, activeJobs, applications] = await Promise.all([
    countActivities("pool.create", userId),
    countActivities("job.post", userId),
    countActivities(["job.apply", "application.create"], undefined, {
      owner_id: userId,
    }),
  ]);

  return { activePools, activeJobs, applications };
}

function readString(
  metadata: Record<string, unknown>,
  keys: readonly string[],
  fallback = "",
) {
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

export async function getSupplierDashboardData() {
  let data: Array<{
    id: string;
    user_id: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>;

  if (isMvpAuthEnabled()) {
    data = getDemoActivities()
      .filter((activity) => activity.action === "pool.create")
      .map((activity) => ({
        id: activity.id,
        user_id: activity.user_id,
        metadata: activity.metadata,
        created_at: activity.created_at,
      }));
  } else {
    const supabase = createServiceRoleClient();
    const result = await supabase
      .from("activity_logs")
      .select("id,user_id,metadata,created_at")
      .eq("action", "pool.create")
      .order("created_at", { ascending: false })
      .limit(100);

    throwQueryError("Failed to load supplier demand", result.error);
    data = (result.data ?? []) as typeof data;
  }

  const demands = data.map((activity) => {
    const metadata = (activity.metadata ?? {}) as Record<string, unknown>;
    return {
      id: readString(metadata, ["pool_id"], activity.id),
      umkmId: String(activity.user_id),
      productName: readString(
        metadata,
        ["product_name", "item_name", "commodity", "name"],
        "Permintaan bahan",
      ),
      category: readString(metadata, ["category"], "Lainnya"),
      targetQuantity: readNumber(
        metadata,
        ["target_quantity", "quantity", "volume"],
      ),
      currentQuantity: readNumber(metadata, ["current_quantity"]),
      unit: readString(metadata, ["unit"]),
      location: readString(metadata, ["location", "district"]),
      status: readString(metadata, ["status"], "active"),
      deadline: readString(metadata, ["deadline", "deadline_at"]),
      createdAt: String(activity.created_at),
      metadata,
    };
  });
  const activeStatuses = new Set(["active", "open", "waiting"]);
  const activeDemand = demands.filter((demand) =>
    activeStatuses.has(demand.status.toLowerCase()),
  );

  const waitingDemand = activeDemand.filter(
    (demand) => demand.status.toLowerCase() === "waiting",
  );
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
    poolLeader: readString(
      demand.metadata,
      ["pool_leader", "business_name", "actor_name"],
      "Data terlindungi",
    ),
    whatsappMasked: readString(
      demand.metadata,
      ["whatsapp_masked"],
      "Nomor disembunyikan",
    ),
  }));

  return {
    demands,
    activeDemands: activeDemand.length,
    requestingUmkm: new Set(activeDemand.map((demand) => demand.umkmId)).size,
    categories,
    pools,
    poolsLast7Days: demands.filter(
      (demand) => new Date(demand.createdAt).getTime() >= sevenDaysAgo,
    ).length,
    totalCommodities: commodities,
    estimatedVolume,
    awaitingConfirmation: waitingDemand.length,
  };
}
