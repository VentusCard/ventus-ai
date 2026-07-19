import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { verifyConnectorSession } from "./_connectorAuth.ts";
import { POST } from "./presenter-session.ts";

const SESSION_SECRET = "presenter-session-test-secret-32-characters-minimum";
const originalFetch = globalThis.fetch;
const managedVariables = [
  "ENABLE_LIVE_CONNECTORS",
  "VENTUS_ENABLE_DEMO_CONNECTOR_SESSION",
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "VENTUS_DEMO_ORIGIN",
  "VENTUS_DEMO_TENANT_ID",
  "VERCEL_ENV",
  "PLAID_CLIENT_ID",
  "PLAID_SECRET",
  "SF_LOGIN_URL",
  "SF_CLIENT_ID",
  "SF_CLIENT_SECRET",
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
  assert.deepEqual(principal?.scopes.sort(), ["plaid_read", "salesforce_write"]);
  assert.deepEqual(principal?.destinations.sort(), ["plaid", "salesforce"]);
  assert.equal(principal?.tenantId, "ventus");
  assert.equal(principal?.subject, "operator_123");
  assert.ok((body.expiresAt ?? 0) > Math.floor(Date.now() / 1000));
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
