import assert from "node:assert/strict";
import test from "node:test";
import { parseSupplierWorkspaceValue } from "./workspace.ts";

test("supplier workspace parser prefers active catalog over newer inactive history", () => {
  const workspace = parseSupplierWorkspaceValue({
    products: [
      { id: "inactive-new", item_name: "Lama", status: "inactive", updated_at: "2026-07-23T10:00:00Z" },
      { id: "active-old", item_name: "Aktif", status: "active", updated_at: "2026-07-22T10:00:00Z" },
    ],
  });

  assert.equal(workspace.products[0]?.id, "active-old");
});

test("supplier workspace parser safely defaults malformed RPC data", () => {
  const workspace = parseSupplierWorkspaceValue({
    profile: { business_name: "Pasok Bersama", trust_score: "82.5" },
    products: [
      { id: "product-1", item_name: "Kopi", stock_quantity: "40", min_order_quantity: "12", description: "supplier_target_discount=12.5", status: "active" },
      { id: "product-2", item_name: "Gula", stock_quantity: "10", status: "active" },
      null,
    ],
    orders: "not-an-array",
    demands: [{ id: "pool-1", metadata: { item_name: "Gula", target_quantity: "250" } }],
  });

  assert.equal(workspace.profile.businessName, "Pasok Bersama");
  assert.equal(workspace.profile.trustScore, 82.5);
  assert.equal(workspace.products.length, 1);
  assert.equal(workspace.products[0]?.stockQuantity, 40);
  assert.equal(workspace.products[0]?.targetDiscount, 12.5);
  assert.equal(workspace.products[0]?.minOrderQuantity, 12);
  assert.deepEqual(workspace.orders, []);
  assert.equal(workspace.demands[0]?.targetQuantity, 250);
  assert.deepEqual(parseSupplierWorkspaceValue(null).products, []);
});
