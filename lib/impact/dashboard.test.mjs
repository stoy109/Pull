import assert from "node:assert/strict";
import test from "node:test";
import { normalizeImpactFilters, parseImpactDashboard } from "./dashboard.ts";

test("normalizes impact filters to supported values", () => {
  assert.deepEqual(normalizeImpactFilters({ range: "90", category: "supplier", priority: "high", page: "2" }), {
    days: 90,
    category: "supplier",
    priority: "high",
    page: 2,
  });
  assert.deepEqual(normalizeImpactFilters({ range: "365", category: "unknown", priority: "urgent" }), {
    days: 30,
    category: null,
    priority: null,
    page: 1,
  });
});

test("parses impact RPC response safely", () => {
  const parsed = parseImpactDashboard({
    period_days: 7,
    metrics: { active_jobs: 2, applications: 4, placement_rate: "25.0", active_supplier_offers: 3 },
    priority_summary: { high: 1, medium: 2, low: 3, pending: 4 },
    total: 1,
    page: 1,
    page_size: 15,
    items: [{ item_type: "job_posting", item_id: "id-1", item_name: "Kru Packing", category: "recruitment", status: "published", priority: "high" }],
  });
  assert.equal(parsed.metrics.placementRate, 25);
  assert.equal(parsed.prioritySummary.pending, 4);
  assert.equal(parsed.items[0].priority, "high");
});

