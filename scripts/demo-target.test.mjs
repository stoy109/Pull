import assert from "node:assert/strict";
import { test } from "node:test";
import { requireDemoTarget } from "./demo-target.mjs";

test("demo scripts allow local Supabase URLs by default", () => {
  for (const url of ["http://localhost:54321", "http://127.0.0.1:54321", "http://[::1]:54321"]) {
    assert.doesNotThrow(() => requireDemoTarget(url));
  }
});

test("demo scripts require explicit opt-in and HTTPS for remote targets", () => {
  assert.throws(() => requireDemoTarget("https://test.supabase.co"), /hanya berjalan pada Supabase lokal/);
  assert.throws(() => requireDemoTarget("https://localhost.test"), /hanya berjalan pada Supabase lokal/);
  assert.throws(() => requireDemoTarget("http://test.supabase.co", { allowRemote: true }));
  assert.doesNotThrow(() => requireDemoTarget("https://test.supabase.co", { allowRemote: true }));
});

test("demo scripts reject invalid URLs and URLs with credentials", () => {
  for (const url of [undefined, "not a URL", "ftp://localhost", "https://localhost@test.supabase.co"]) {
    assert.throws(() => requireDemoTarget(url, { allowRemote: true }), /URL HTTP\(S\)/);
  }
});
