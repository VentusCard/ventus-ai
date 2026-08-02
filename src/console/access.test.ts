import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessDestination,
  defaultPathForAccess,
  destinationForPath,
  entryPathForAccess,
} from "./access";
import type { ConsoleAccessProfile } from "./state";

function access(role: ConsoleAccessProfile["role"]): ConsoleAccessProfile {
  return {
    tenantId: "ventus",
    email: "operator@ventusai.com",
    role,
    status: "active",
    entitlements: ["growth_console"],
    businessLines: ["consumer-banking", "wealth"],
    queueScopes: [],
  };
}

test("institution administrators land in Connections without customer-moment access", () => {
  const profile = access("institution_admin");
  assert.equal(defaultPathForAccess(profile), "/app/connections");
  assert.equal(canAccessDestination(profile, "connections"), true);
  assert.equal(canAccessDestination(profile, "governance"), true);
  assert.equal(canAccessDestination(profile, "moments"), false);
});

test("bank operators see assigned work without configuration or governance access", () => {
  const profile = access("bank_operator");
  assert.equal(defaultPathForAccess(profile), "/app/today");
  assert.equal(canAccessDestination(profile, "today"), true);
  assert.equal(canAccessDestination(profile, "moments"), true);
  assert.equal(canAccessDestination(profile, "results"), true);
  assert.equal(canAccessDestination(profile, "connections"), false);
  assert.equal(canAccessDestination(profile, "governance"), false);
});

test("risk reviewers enter governance and retain governed review surfaces", () => {
  const profile = access("risk_reviewer");
  assert.equal(defaultPathForAccess(profile), "/app/governance");
  assert.equal(canAccessDestination(profile, "governance"), true);
  assert.equal(canAccessDestination(profile, "moments"), true);
  assert.equal(canAccessDestination(profile, "connections"), false);
});

test("executive viewers enter results without customer-moment or configuration access", () => {
  const profile = access("executive_viewer");
  assert.equal(defaultPathForAccess(profile), "/app/results");
  assert.equal(canAccessDestination(profile, "results"), true);
  assert.equal(canAccessDestination(profile, "moments"), false);
  assert.equal(canAccessDestination(profile, "connections"), false);
});

test("console routes resolve to their authorization destinations", () => {
  assert.equal(destinationForPath("/app/moments"), "moments");
  assert.equal(destinationForPath("/app/connections"), "connections");
  assert.equal(destinationForPath("/app/demo"), null);
});

test("Growth Console access takes priority over optional leadership demos", () => {
  const admin = access("institution_admin");
  admin.entitlements = ["growth_console", "consumer_demo", "wealth_demo"];
  assert.equal(entryPathForAccess(admin), "/app/connections");

  const operator = access("bank_operator");
  operator.entitlements = ["growth_console", "consumer_demo"];
  assert.equal(entryPathForAccess(operator), "/app/today");
});

test("demo-only and unentitled users enter only their permitted routes", () => {
  const demoOnly = access("executive_viewer");
  demoOnly.entitlements = ["wealth_demo"];
  assert.equal(entryPathForAccess(demoOnly), "/app/demo");

  const pending = access("executive_viewer");
  pending.entitlements = [];
  assert.equal(entryPathForAccess(pending), "/app/access-pending");
});
