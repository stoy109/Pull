import assert from "node:assert/strict";
import test from "node:test";
import {
  dashboardPathForRole,
  isRoleAllowed,
  parseOnboardingRole,
  resolveUserRole,
} from "./roles.ts";

test("maps every role to its own dashboard", () => {
  assert.equal(dashboardPathForRole("admin"), "/admin");
  assert.equal(dashboardPathForRole("umkm"), "/dashboard");
  assert.equal(dashboardPathForRole("pekerja"), "/worker/dashboard");
  assert.equal(dashboardPathForRole("supplier"), "/supplier");
});

test("public onboarding never accepts the admin role", () => {
  assert.equal(parseOnboardingRole("admin"), null);
  assert.equal(parseOnboardingRole("supplier"), "supplier");
});

test("role guards only accept explicitly allowed dashboards", () => {
  assert.equal(isRoleAllowed("admin", ["admin"]), true);
  assert.equal(isRoleAllowed("umkm", ["admin"]), false);
  assert.equal(isRoleAllowed("pekerja", ["pekerja"]), true);
  assert.equal(isRoleAllowed("supplier", ["umkm"]), false);
});

test("trusted app metadata can provision an administrator", () => {
  assert.equal(
    resolveUserRole({
      appMetadataRole: "admin",
      hasProfile: true,
      profileRole: "umkm",
      userMetadataRole: "pekerja",
    }),
    "admin",
  );
});

test("an existing profile cannot be overridden by editable user metadata", () => {
  assert.equal(
    resolveUserRole({
      appMetadataRole: null,
      hasProfile: true,
      profileRole: "supplier",
      userMetadataRole: "admin",
    }),
    "supplier",
  );
  assert.equal(
    resolveUserRole({
      appMetadataRole: null,
      hasProfile: true,
      profileRole: null,
      userMetadataRole: "umkm",
    }),
    null,
  );
});

test("legacy fallback permits domain roles but never administrator", () => {
  assert.equal(
    resolveUserRole({
      appMetadataRole: null,
      hasProfile: false,
      profileRole: null,
      userMetadataRole: "pekerja",
    }),
    "pekerja",
  );
  assert.equal(
    resolveUserRole({
      appMetadataRole: null,
      hasProfile: false,
      profileRole: null,
      userMetadataRole: "admin",
    }),
    null,
  );
});
