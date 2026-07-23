import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeMonitoringFilters,
  parseMonitoringData,
} from "./monitoring.ts";

test("normalizes monitoring filters to a safe period and known role", () => {
  assert.deepEqual(normalizeMonitoringFilters({ range: "30", role: "pekerja" }), {
    days: 30,
    role: "pekerja",
  });
  assert.deepEqual(normalizeMonitoringFilters({ range: "365", role: "owner" }), {
    days: 7,
    role: null,
  });
});

test("parses monitoring RPC data and supplies safe defaults", () => {
  const parsed = parseMonitoringData({
    generated_at: "2026-07-23T08:00:00.000Z",
    period_days: 30,
    role_filter: "umkm",
    metrics: {
      active_users: 3,
      activities_today: "8",
      total_users: 5,
      attention: -1,
    },
    user_distribution: { admin: 1, umkm: 5 },
    activity_distribution: { umkm: 8 },
    trend: [{ date: "2026-07-23", count: 8 }],
    recent_activities: [
      {
        id: "event-1",
        actor_name: "Warung Bu Sari",
        actor_role: "umkm",
        event_type: "profile.updated",
        status: "success",
        created_at: "2026-07-23T07:00:00.000Z",
      },
    ],
  });

  assert.equal(parsed.periodDays, 30);
  assert.equal(parsed.roleFilter, "umkm");
  assert.equal(parsed.metrics.activitiesToday, 8);
  assert.equal(parsed.metrics.attention, 0);
  assert.equal(parsed.userDistribution.supplier, 0);
  assert.equal(parsed.activityDistribution.umkm, 8);
  assert.equal(parsed.recentActivities[0].eventType, "profile.updated");
});
