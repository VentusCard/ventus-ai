import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  authenticateCognitoConsoleUser,
  authorizeConsoleUser,
} from "./_consoleAuth.ts";

const originalFetch = globalThis.fetch;
const managed = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "VENTUS_CONSOLE_ALLOWED_EMAILS",
  "VENTUS_CONSOLE_INTERNAL_DOMAINS",
  "VENTUS_CONSOLE_ALLOWED_DOMAINS",
  "VENTUS_AUTH_PROVIDER",
] as const;
const originalEnvironment = Object.fromEntries(managed.map((name) => [name, process.env[name]]));

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of managed) {
    const value = originalEnvironment[name];
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

test("verified, confirmed, allowlisted operators receive a server tenant", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_123",
    email: "operator@ventusai.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });

  const principal = await authorizeConsoleUser(request("supabase-token"));
  assert.deepEqual(principal, {
    userId: "user_123",
    email: "operator@ventusai.com",
    tenantId: "ventus",
    organizationId: "ventus",
    role: "bank_operator",
    status: "active",
    entitlements: [
      "consumer_demo",
      "wealth_demo",
      "growth_console",
      "live_connectors",
    ],
    businessLineScopes: ["consumer-banking", "wealth-management"],
    queueScopes: [],
  });
});

test("unconfirmed users and pending users cannot mint connector sessions", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_123",
    email: "person@example.com",
    email_confirmed_at: null,
    app_metadata: {},
  });
  assert.equal(await authorizeConsoleUser(request("supabase-token")), null);

  globalThis.fetch = async () => Response.json({
    id: "user_123",
    email: "person@example.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });
  assert.equal(await authorizeConsoleUser(request("supabase-token")), null);
});

test("app metadata can bind an allowed operator to an approved tenant and role", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_123",
    email: "operator@ventusai.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: { tenant_id: "pilot_bank", console_role: "admin" },
  });
  assert.equal((await authorizeConsoleUser(request("supabase-token")))?.tenantId, "pilot_bank");
  assert.equal((await authorizeConsoleUser(request("supabase-token")))?.role, "institution_admin");
});

test("Cognito identity plus an active Aurora membership grants scoped access", async () => {
  const principal = await authenticateCognitoConsoleUser("cognito-token", {
    verifyIdentity: async () => ({
      subject: "cognito-subject:123",
      tenantHint: "pilot_bank",
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example",
    }),
    resolveMembership: async () => ({
      email: "owner@pilotbank.com",
      role: "institution_admin",
      status: "active",
      businessLines: ["consumer"],
      queueScopes: ["consumer-review"],
      entitlements: ["consumer_demo", "growth_console", "live_connectors", "unknown"],
    }),
  });
  assert.deepEqual(principal, {
    userId: "cognito-subject:123",
    email: "owner@pilotbank.com",
    tenantId: "pilot_bank",
    organizationId: "pilot_bank",
    role: "institution_admin",
    status: "active",
    entitlements: ["consumer_demo", "growth_console", "live_connectors"],
    businessLineScopes: ["consumer"],
    queueScopes: ["consumer-review"],
  });
});

test("Cognito access fails closed without an active membership", async () => {
  const principal = await authenticateCognitoConsoleUser("cognito-token", {
    verifyIdentity: async () => ({
      subject: "cognito-subject:123",
      tenantHint: "pilot_bank",
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example",
    }),
    resolveMembership: async () => null,
  });
  assert.equal(principal, null);
});

test("Cognito bank operators remain operators and unentitled members remain pending", async () => {
  const principal = await authenticateCognitoConsoleUser("cognito-token", {
    verifyIdentity: async () => ({
      subject: "cognito-subject:123",
      tenantHint: "pilot_bank",
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example",
    }),
    resolveMembership: async () => ({
      email: "banker@pilotbank.com",
      role: "bank_operator",
      status: "pending",
      businessLines: ["consumer"],
      queueScopes: [],
      entitlements: [],
    }),
  });
  assert.equal(principal?.role, "bank_operator");
  assert.equal(principal?.status, "pending");
  assert.deepEqual(principal?.entitlements, []);
});

test("Cognito preserves risk-reviewer identity and scopes without operator elevation", async () => {
  const principal = await authenticateCognitoConsoleUser("cognito-token", {
    verifyIdentity: async () => ({
      subject: "cognito-subject:456",
      tenantHint: "pilot_bank",
      issuer: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example",
    }),
    resolveMembership: async () => ({
      email: "risk@pilotbank.com",
      role: "risk_reviewer",
      status: "active",
      businessLines: ["wealth-management"],
      queueScopes: ["wealth-exceptions"],
      entitlements: ["wealth_demo", "growth_console", "live_connectors"],
    }),
  });
  assert.equal(principal?.role, "risk_reviewer");
  assert.deepEqual(principal?.businessLineScopes, ["wealth-management"]);
  assert.deepEqual(principal?.queueScopes, ["wealth-exceptions"]);
});

function configure() {
  process.env.VENTUS_AUTH_PROVIDER = "supabase";
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon-key";
  process.env.VENTUS_CONSOLE_INTERNAL_DOMAINS = "ventusai.com";
}

function request(token: string) {
  return new Request("https://demo.ventusai.com/api/presenter-session", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}
