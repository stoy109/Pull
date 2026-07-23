import assert from "node:assert/strict";
import test from "node:test";
import { getSupplierProfile } from "./profile.ts";

test("supplier profile completion follows saved fields", () => {
  const partial = getSupplierProfile({
    display_name: "Budi Santoso",
    business_name: "Solo Supply",
    headline: "Bahan baku",
  });
  const complete = getSupplierProfile({
    display_name: "Budi Santoso",
    business_name: "Solo Supply",
    headline: "Bahan baku",
    delivery_area: "Solo Raya",
    phone: "+628123456789",
  });

  assert.equal(partial.profileCompletion, 60);
  assert.equal(complete.profileCompletion, 100);
  assert.equal(complete.businessName, "Solo Supply");
});
