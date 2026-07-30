import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  authorizeConnector,
  issueConnectorSession,
  verifyConnectorSession,
} from "./_connectorAuth.ts";
import { POST as deliver } from "./deliver.ts";

const SECRET = "connector-session-test-secret-32-characters-minimum";
const managedVariables = [
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "VENTUS_CONNECTOR_TOKEN",
  "VENTUS_ALLOW_LEGACY_CONNECTOR_TOKEN",
  "VENTUS_ALLOW_LOCAL_CONNECTORS",
  "VENTUS_LEGACY_CONNECTOR_TENANT_ID",
  "VENTUS_LOCAL_CONNECTOR_TENANT_ID",
  "VERCEL_ENV",
  "ENABLE_LIVE_CONNECTORS",
  "DELIVERY_WEBHOOK_URL",
] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("signed connector session is tenant, scope, destination, and lifetime bound", () => {
  const now = 1_783_780_000;
  const token = issueConnectorSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject: "service_workflow_1",
    scopes: ["salesforce_write"],
    destinations: ["salesforce"],
    sessionId: "session_001",
    sessionKind: "console",
    role: "bank_operator",
    businessLineScopes: ["consumer-banking"],
    queueScopes: ["deposit-review"],
    ttlSeconds: 300,
    now,
  });
  const principal = verifyConnectorSession(token, SECRET, now + 1);
  assert.equal(principal?.tenantId, "bank_1");
  assert.equal(principal?.subject, "service_workflow_1");
  assert.equal(principal?.authMode, "session");
  assert.equal(principal?.sessionKind, "console");
  assert.equal(principal?.role, "bank_operator");
  assert.deepEqual(principal?.businessLineScopes, ["consumer-banking"]);
  assert.deepEqual(principal?.queueScopes, ["deposit-review"]);
  assert.equal(verifyConnectorSession(token, SECRET, now + 301), null);
  assert.equal(verifyConnectorSession(`${token.slice(0, -1)}x`, SECRET, now + 1), null);
});

test("authorization refuses a valid session outside its scope or destination", () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const token = issueConnectorSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject: "service_workflow_1",
    scopes: ["salesforce_write"],
    destinations: ["salesforce"],
    sessionId: "session_002",
  });
  const request = bearerRequest(token);
  assert.equal(
    authorizeConnector(request, { scope: "salesforce_write", destination: "salesforce" })?.sessionId,
    "session_002",
  );
  assert.equal(authorizeConnector(request, { scope: "plaid_read", destination: "salesforce" }), null);
  assert.equal(authorizeConnector(request, { scope: "salesforce_write", destination: "plaid" }), null);
});

test("legacy bearer remains compatible until sessions are configured, then requires explicit production opt-in", () => {
  process.env.VENTUS_CONNECTOR_TOKEN = "legacy-test-token";
  process.env.VENTUS_LEGACY_CONNECTOR_TENANT_ID = "bank_legacy";
  process.env.VERCEL_ENV = "production";
  const request = bearerRequest("legacy-test-token");

  const compatibility = authorizeConnector(request, { scope: "plaid_read", destination: "plaid" });
  assert.equal(compatibility?.authMode, "legacy_bearer");
  assert.equal(compatibility?.tenantId, "bank_legacy");

  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  assert.equal(authorizeConnector(request, { scope: "plaid_read", destination: "plaid" }), null);

  process.env.VENTUS_ALLOW_LEGACY_CONNECTOR_TOKEN = "true";
  assert.equal(
    authorizeConnector(request, { scope: "plaid_read", destination: "plaid" })?.authMode,
    "legacy_bearer",
  );
});

test("local browser exception remains non-production only", () => {
  process.env.VENTUS_ALLOW_LOCAL_CONNECTORS = "true";
  const request = new Request("http://local/api/deliver", { headers: { "x-ventus-client": "web-app" } });
  assert.equal(authorizeConnector(request, { scope: "delivery_write" })?.authMode, "local_demo");
  process.env.VERCEL_ENV = "production";
  assert.equal(authorizeConnector(request, { scope: "delivery_write" }), null);
});

test("session issuer rejects weak secrets and excessive lifetime", () => {
  const base = {
    secret: SECRET,
    tenantId: "bank_1",
    subject: "service_1",
    scopes: ["delivery_write"],
    destinations: ["delivery"],
    sessionId: "session_003",
  };
  assert.throws(() => issueConnectorSession({ ...base, secret: "too-short" }), /at least 32/);
  assert.throws(() => issueConnectorSession({ ...base, ttlSeconds: 901 }), /30-900/);
});

test("generic delivery route enforces the selected destination entitlement", async () => {
  process.env.ENABLE_LIVE_CONNECTORS = "true";
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const allowed = issueConnectorSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject: "service_workflow_1",
    scopes: ["delivery_write"],
    destinations: ["advisor"],
    sessionId: "session_route_1",
  });
  const denied = issueConnectorSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject: "service_workflow_1",
    scopes: ["delivery_write"],
    destinations: ["campaign"],
    sessionId: "session_route_2",
  });
  const opportunity = {
    id: "opp_001",
    type: "Liquidity event",
    client: "tok_household_000001",
    value: "$250K",
    valueLabel: "NNA opportunity",
    confidence: 92,
    action: "Review qualified liquidity",
    reason: "Supplied evidence",
    owner: "advisor_pool",
    destination: "advisor",
  };
  const response = await deliver(deliveryRequest(allowed, opportunity));
  assert.equal(response.status, 200);
  const receipt = await response.json() as { forwarded?: unknown; authorization?: { tenantId?: unknown; sessionId?: unknown } };
  assert.equal(receipt.forwarded, false);
  assert.equal(receipt.authorization?.tenantId, "bank_1");
  assert.equal(receipt.authorization?.sessionId, "session_route_1");
  assert.equal((await deliver(deliveryRequest(denied, opportunity))).status, 403);
});

function bearerRequest(token: string): Request {
  return new Request("http://local/api/connector", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function deliveryRequest(token: string, opportunity: Record<string, unknown>): Request {
  return new Request("http://local/api/deliver", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ opportunity }),
  });
}
