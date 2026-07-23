import { parseActivityEventType, parseActivityStatus } from "./events.ts";
import { APP_ROLES, parseAppRole, type AppRole } from "../auth/roles.ts";

export const MONITORING_PERIODS = [7, 30] as const;

export type MonitoringPeriod = (typeof MONITORING_PERIODS)[number];

export type MonitoringFilters = {
  days: MonitoringPeriod;
  role: AppRole | null;
};

export type MonitoringActivity = {
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
  status: "success" | "failed" | "denied";
  createdAt: string;
};

export type MonitoringData = {
  generatedAt: string;
  periodDays: MonitoringPeriod;
  roleFilter: AppRole | null;
  metrics: {
    activeUsers: number;
    activitiesToday: number;
    totalUsers: number;
    attention: number;
  };
  userDistribution: Record<AppRole, number> & { unassigned: number };
  activityDistribution: Record<AppRole, number>;
  trend: Array<{ date: string; count: number }>;
  recentActivities: MonitoringActivity[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asCount(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value ? value : null;
}

function parseRoleCounts(value: unknown): Record<AppRole, number> {
  const record = asRecord(value);
  return Object.fromEntries(
    APP_ROLES.map((role) => [role, asCount(record[role])]),
  ) as Record<AppRole, number>;
}

export function normalizeMonitoringFilters(input: {
  range?: string | string[];
  role?: string | string[];
}): MonitoringFilters {
  const range = Array.isArray(input.range) ? input.range[0] : input.range;
  const role = Array.isArray(input.role) ? input.role[0] : input.role;

  return {
    days: range === "30" ? 30 : 7,
    role: parseAppRole(role),
  };
}

export function parseMonitoringData(value: unknown): MonitoringData {
  const root = asRecord(value);
  const metrics = asRecord(root.metrics);
  const userDistribution = asRecord(root.user_distribution);
  const periodDays: MonitoringPeriod = root.period_days === 30 ? 30 : 7;

  const recentActivities = asArray(root.recent_activities).map((item) => {
    const activity = asRecord(item);
    const parsedEvent = parseActivityEventType(activity.event_type);

    return {
      id: asString(activity.id, crypto.randomUUID()),
      actorId: asNullableString(activity.actor_id),
      actorName: asString(activity.actor_name, "Pengguna Pull"),
      actorEmail: asNullableString(activity.actor_email),
      actorRole: parseAppRole(activity.actor_role),
      eventType: parsedEvent ?? asString(activity.event_type, "system.unknown"),
      category: asString(activity.category, "system"),
      targetType: asNullableString(activity.target_type),
      targetId: asNullableString(activity.target_id),
      description: asString(activity.description, "Aktivitas sistem"),
      status: parseActivityStatus(activity.status),
      createdAt: asString(activity.created_at, new Date(0).toISOString()),
    } satisfies MonitoringActivity;
  });

  const trend = asArray(root.trend).map((item) => {
    const point = asRecord(item);
    return {
      date: asString(point.date),
      count: asCount(point.count),
    };
  }).filter((point) => point.date);

  return {
    generatedAt: asString(root.generated_at, new Date().toISOString()),
    periodDays,
    roleFilter: parseAppRole(root.role_filter),
    metrics: {
      activeUsers: asCount(metrics.active_users),
      activitiesToday: asCount(metrics.activities_today),
      totalUsers: asCount(metrics.total_users),
      attention: asCount(metrics.attention),
    },
    userDistribution: {
      ...parseRoleCounts(userDistribution),
      unassigned: asCount(userDistribution.unassigned),
    },
    activityDistribution: parseRoleCounts(root.activity_distribution),
    trend,
    recentActivities,
  };
}
