import "server-only";

import { getAdminActivity } from "@/features/admin/data/get-admin-activity";
import { getAdminUsers } from "@/features/admin/data/get-admin-users";
import {
  parseMonitoringData,
  type MonitoringData,
  type MonitoringFilters,
} from "@/lib/activity/monitoring";
import { isMvpAuthEnabled } from "@/lib/auth/mvp-session";
import { APP_ROLES } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

export async function getAdminMonitoring(
  filters: MonitoringFilters,
): Promise<MonitoringData> {
  if (isMvpAuthEnabled()) {
    const [activityData, userData] = await Promise.all([
      getAdminActivity({ days: filters.days, role: filters.role, status: null, query: "", page: 1 }),
      getAdminUsers({ query: "", role: null, status: null, page: 1 }),
    ]);
    const now = Date.now();
    const filteredUsers = filters.role
      ? userData.users.filter((user) => user.role === filters.role)
      : userData.users;
    const dateFormatter = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    });
    const dateKey = (value: string | number) => {
      const parts = Object.fromEntries(
        dateFormatter.formatToParts(new Date(value)).map(({ type, value: part }) => [type, part]),
      );
      return `${parts.year}-${parts.month}-${parts.day}`;
    };
    const today = dateKey(now);
    const roleCounts = Object.fromEntries(
      APP_ROLES.map((role) => [
        role,
        userData.users.filter((user) => user.role === role).length,
      ]),
    ) as MonitoringData["activityDistribution"];
    const activityCounts = Object.fromEntries(
      APP_ROLES.map((role) => [
        role,
        activityData.activities.filter((activity) => activity.actorRole === role).length,
      ]),
    ) as MonitoringData["activityDistribution"];

    return {
      generatedAt: new Date(now).toISOString(),
      periodDays: filters.days,
      roleFilter: filters.role,
      metrics: {
        activeUsers: filteredUsers.filter((user) =>
          user.accountStatus === "active" &&
          user.lastActiveAt &&
          now - new Date(user.lastActiveAt).getTime() <= 15 * 60_000
        ).length,
        activitiesToday: activityData.activities.filter((activity) =>
          dateKey(activity.createdAt) === today
        ).length,
        totalUsers: filteredUsers.length,
        attention: activityData.activities.filter((activity) =>
          dateKey(activity.createdAt) === today && activity.status !== "success"
        ).length + filteredUsers.filter((user) => user.accountStatus === "suspended").length,
      },
      userDistribution: { ...roleCounts, unassigned: 0 },
      activityDistribution: activityCounts,
      trend: Array.from({ length: filters.days }, (_, index) => {
        const date = dateKey(now - (filters.days - index - 1) * 86_400_000);
        return {
          date,
          count: activityData.activities.filter((activity) => dateKey(activity.createdAt) === date).length,
        };
      }),
      recentActivities: activityData.activities.slice(0, 12),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_monitoring", {
    period_days: filters.days,
    role_filter: filters.role,
    app_timezone: "Asia/Jakarta",
  });

  if (error) {
    console.error("Unable to load administrator monitoring data", {
      code: error.code,
      message: error.message,
    });
    throw new Error("Data monitoring belum dapat dimuat.");
  }

  return parseMonitoringData(data);
}
