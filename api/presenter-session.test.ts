import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { verifyConnectorSession } from "./_connectorAuth.ts";
import { POST } from "./presenter-session.ts";

const SESSION_SECRET = "presenter-session-test-secret-32-characters-minimum";
const originalFetch = globalThis.fetch;
const managedVariables = [
  "ENABLE_LIVE_CONNECTORS",
  "VENTUS_ENABLE_DEMO_CONNECTOR_SESSION",
  "VENTUS_ALLOW_ANON_DEMO_SESSION",
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "VENTUS_DEMO_ORIGIN",
  "VENTUS_DEMO_TENANT_ID",
  "VERCEL_ENV",
  "PLAID_CLIENT_ID",
  "PLAID_SECRET",
  "SF_LOGIN_URL",
  "SF_CLIENT_ID",
  "SF_CLIENT_SECRET",
  "ENABLE_STANDALONE_PILOT_RUNTIME",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "VENTUS_CONSOLE_INTERNAL_DOMAINS",
  "VENTUS_CONSOLE_ALLOWED_DOMAINS",
] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("demo connector broker is disabled by default", async () => {
  delete process.env.ENABLE_LIVE_CONNECTORS;
  assert.equal((await POST(request())).status, 404);
});

test("demo connector broker rejects cross-origin access in production", async () => {
  configure();
  process.env.VERCEL_ENV = "production";
  process.env.VENTUS_DEMO_ORIGIN = "https://demo.ventusai.com";
  assert.equal((await POST(request("https://other.example"))).status, 403);
});

test("demo connector broker requires an authenticated operator", async () => {
  configure();
  process.env.VERCEL_ENV = "production";
  process.env.VENTUS_DEMO_ORIGIN = "https://demo.ventusai.com";
  assert.equal((await POST(request("https://demo.ventusai.com", ""))).status, 401);
});

test("hosted no-login demo path mints a demo-scoped session when explicitly enabled", async () => {
  configure();
  process.env.VENTUS_ALLOW_ANON_DEMO_SESSION = "true";
  process.env.VERCEL_ENV = "production";
  process.env.VENTUS_DEMO_ORIGIN = "https://demo.ventusai.com";
  process.env.VENTUS_DEMO_TENANT_ID = "demo_bank";

  const response = await POST(request("https://demo.ventusai.com", ""));
  const body = await response.json() as { token?: string; subject?: string; tenantId?: string; role?: string };
  assert.equal(response.status, 200);
  const principal = verifyConnectorSession(body.token || "", SESSION_SECRET);
  assert.equal(principal?.tenantId, "demo_bank");
  assert.equal(principal?.subject, "demo_operator");
  assert.equal(principal?.sessionKind, "presenter");
  assert.equal(body.role, "demo");
  // The demo path must carry both scenarios so it works with the scenario-scoped
  // /api/plaid-transactions endpoint.
  assert.deepEqual(principal?.scopes.sort(), [
    "plaid_read",
    "salesforce_outcome_read",
    "salesforce_write",
    "scenario_deposit_retention",
    "scenario_wealth_growth",
  ].sort());
});

test("demo connector broker mints one short-lived Plaid and Salesforce session", async () => {
  configure();
  process.env.VERCEL_ENV = "production";
  process.env.VENTUS_DEMO_ORIGIN = "https://demo.ventusai.com";
  process.env.PLAID_CLIENT_ID = "plaid-client";
  process.env.PLAID_SECRET = "plaid-secret";
  process.env.SF_LOGIN_URL = "https://example.my.salesforce.com";
  process.env.SF_CLIENT_ID = "salesforce-client";
  process.env.SF_CLIENT_SECRET = "salesforce-secret";

  globalThis.fetch = async () => Response.json({
    id: "operator_123",
    email: "operator@ventusai.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });
  const response = await POST(request("https://demo.ventusai.com", "supabase-token"));
  const body = await response.json() as {
    token?: string;
    expiresAt?: number;
    connectors?: { plaid?: boolean; salesforce?: boolean };
  };
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(body.connectors?.plaid, true);
  assert.equal(body.connectors?.salesforce, true);
  const principal = verifyConnectorSession(body.token || "", SESSION_SECRET);
  assert.deepEqual(principal?.scopes.sort(), [
    "plaid_read",
    "salesforce_outcome_read",
    "scenario_deposit_retention",
    "scenario_wealth_growth",
  ].sort());
  assert.deepEqual(principal?.destinations.sort(), ["plaid", "salesforce"]);
  assert.equal(principal?.tenantId, "ventus");
  assert.equal(principal?.subject, "operator_123");
  assert.equal(principal?.sessionKind, "console");
  assert.equal(principal?.role, "bank_operator");
  assert.ok((body.expiresAt ?? 0) > Math.floor(Date.now() / 1000));
});

test("connector session carries only the operator's entitled scenarios", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "advisor_123",
    email: "advisor@ml.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {
      tenant_id: "bofa",
      console_role: "bank_operator",
      console_access_status: "active",
      console_entitlements: ["wealth_demo", "growth_console", "live_connectors"],
      console_business_lines: ["wealth-management"],
    },
  });

  const response = await POST(request("https://demo.ventusai.com", "supabase-token"));
  const body = await response.json() as { token?: string };
  const principal = verifyConnectorSession(body.token || "", SESSION_SECRET);
  assert.equal(response.status, 200);
  assert.ok(principal?.scopes.includes("scenario_wealth_growth"));
  assert.equal(principal?.scopes.includes("scenario_deposit_retention"), false);
  assert.equal(principal?.scopes.includes("salesforce_schema_read"), false);
});

test("connector session grants bounded FSC schema discovery only to administrators", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "admin_123",
    email: "admin@ml.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {
      tenant_id: "bofa",
      console_role: "admin",
      console_access_status: "active",
      console_entitlements: ["wealth_demo", "growth_console", "live_connectors"],
    },
  });

  const response = await POST(request("https://demo.ventusai.com", "supabase-token"));
  const body = await response.json() as { token?: string };
  const principal = verifyConnectorSession(body.token || "", SESSION_SECRET);
  assert.equal(response.status, 200);
  assert.ok(principal?.scopes.includes("salesforce_schema_read"));
});

test("governed activation is operator-only and isolated to entitled business lines", async () => {
  configure();
  process.env.ENABLE_STANDALONE_PILOT_RUNTIME = "true";
  globalThis.fetch = async () => Response.json({
    id: "advisor_456",
    email: "advisor@ml.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {
      tenant_id: "bofa",
      console_role: "bank_operator",
      console_access_status: "active",
      console_entitlements: ["wealth_demo", "growth_console", "live_connectors"],
      console_business_lines: ["wealth-management"],
    },
  });

  const response = await POST(request("https://demo.ventusai.com", "supabase-token"));
  const body = await response.json() as { token?: string };
  const principal = verifyConnectorSession(body.token || "", SESSION_SECRET);
  assert.equal(response.status, 200);
  assert.ok(principal?.scopes.includes("growth_play_activate"));
  assert.equal(principal?.scopes.includes("growth_play_run"), false);
  assert.ok(principal?.destinations.includes("wealth-management"));
  assert.equal(principal?.destinations.includes("consumer-banking"), false);

  process.env.VENTUS_ALLOW_ANON_DEMO_SESSION = "true";
  const anonymousResponse = await POST(request("https://demo.ventusai.com", ""));
  const anonymousBody = await anonymousResponse.json() as { token?: string };
  const anonymous = verifyConnectorSession(anonymousBody.token || "", SESSION_SECRET);
  assert.equal(anonymous?.scopes.includes("growth_play_activate"), false);
  assert.equal(anonymous?.destinations.includes("wealth-management"), false);
  assert.equal(anonymous?.destinations.includes("consumer-banking"), false);
});

function configure() {
  process.env.ENABLE_LIVE_CONNECTORS = "true";
  process.env.VENTUS_ENABLE_DEMO_CONNECTOR_SESSION = "true";
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SESSION_SECRET;
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon-key";
  process.env.VENTUS_CONSOLE_INTERNAL_DOMAINS = "ventusai.com";
}

function request(origin = "http://127.0.0.1:5179", accessToken = "supabase-token") {
  return new Request("https://demo.ventusai.com/api/presenter-session", {
    method: "POST",
    headers: {
      Origin: origin,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}
