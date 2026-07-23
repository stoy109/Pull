import "server-only";

import { parseActivityStatus, type ActivityStatus } from "@/lib/activity/events";
import { parseAppRole, type AppRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export type AdminActivityFilters = {
  days: 7 | 30;
  role: AppRole | null;
  status: ActivityStatus | null;
  query: string;
  page: number;
};

export type AdminActivityRow = {
  id: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string | null;
  actorRole: AppRole | null;
  eventType: string;
  category: string;
  targetType: string | null;
  targetId: string | null;
  description: string;
  status: ActivityStatus;
  createdAt: string;
};

export type AdminActivityData = {
  total: number;
  successCount: number;
  attentionCount: number;
  uniqueActors: number;
  page: number;
  pageSize: number;
  activities: AdminActivityRow[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asCount(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

export function normalizeAdminActivityFilters(input: {
  range?: string | string[];
  role?: string | string[];
  status?: string | string[];
  q?: string | string[];
  page?: string | string[];
}): AdminActivityFilters {
  const readFirst = (value?: string | string[]) => Array.isArray(value) ? value[0] : value;
  const status = readFirst(input.status);
  const parsedPage = Number.parseInt(readFirst(input.page) ?? "1", 10);

  return {
    days: readFirst(input.range) === "30" ? 30 : 7,
    role: parseAppRole(readFirst(input.role)),
    status: status === "success" || status === "failed" || status === "denied"
      ? status
      : null,
    query: (readFirst(input.q) ?? "").trim().slice(0, 80),
    page: Number.isFinite(parsedPage) ? Math.min(Math.max(parsedPage, 1), 999) : 1,
  };
}

export async function getAdminActivity(filters: AdminActivityFilters): Promise<AdminActivityData> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_activity_page", {
    period_days: filters.days,
    role_filter: filters.role,
    result_filter: filters.status,
    search_query: filters.query || null,
    page_number: filters.page,
    page_size: 20,
    app_timezone: "Asia/Jakarta",
  });

  if (error) {
    console.error("Unable to load administrator activity page", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Log aktivitas belum dapat dimuat.");
  }

  const root = asRecord(data);
  const activities = Array.isArray(root.activities) ? root.activities : [];

  return {
    total: asCount(root.total),
    successCount: asCount(root.success_count),
    attentionCount: asCount(root.attention_count),
    uniqueActors: asCount(root.unique_actors),
    page: Math.max(asCount(root.page), 1),
    pageSize: Math.max(asCount(root.page_size), 1),
    activities: activities.map((value) => {
      const activity = asRecord(value);
      return {
        id: asString(activity.id),
        actorId: asNullableString(activity.actor_id),
        actorName: asString(activity.actor_name, "Pengguna Pull"),
        actorEmail: asNullableString(activity.actor_email),
        actorRole: parseAppRole(activity.actor_role),
        eventType: asString(activity.event_type, "system.unknown"),
        category: asString(activity.category, "system"),
        targetType: asNullableString(activity.target_type),
        targetId: asNullableString(activity.target_id),
        description: asString(activity.description, "Aktivitas sistem"),
        status: parseActivityStatus(activity.status),
        createdAt: asString(activity.created_at, new Date(0).toISOString()),
      };
    }),
  };
}

