import assert from "node:assert/strict";
import test from "node:test";
import { parseSupplierWorkspaceValue } from "./workspace.ts";

test("supplier workspace parser safely defaults malformed RPC data", () => {
  const workspace = parseSupplierWorkspaceValue({
    profile: { business_name: "Pasok Bersama", trust_score: "82.5" },
    products: [{ id: "product-1", item_name: "Kopi", stock_quantity: "40", status: "active" }, null],
    orders: "not-an-array",
    demands: [{ id: "pool-1", metadata: { item_name: "Gula", target_quantity: "250" } }],
  });

  assert.equal(workspace.profile.businessName, "Pasok Bersama");
  assert.equal(workspace.profile.trustScore, 82.5);
  assert.equal(workspace.products[0]?.stockQuantity, 40);
  assert.deepEqual(workspace.orders, []);
  assert.equal(workspace.demands[0]?.targetQuantity, 250);
  assert.deepEqual(parseSupplierWorkspaceValue(null).products, []);
});
