import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { authorizeConsoleUser } from "./_consoleAuth.ts";

const originalFetch = globalThis.fetch;
const managed = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "VENTUS_CONSOLE_ALLOWED_EMAILS",
  "VENTUS_CONSOLE_INTERNAL_DOMAINS",
  "VENTUS_CONSOLE_ALLOWED_DOMAINS",
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
    role: "operator",
    status: "active",
    entitlements: [
      "consumer_demo",
      "wealth_demo",
      "growth_console",
      "live_connectors",
    ],
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
  assert.equal((await authorizeConsoleUser(request("supabase-token")))?.role, "admin");
});

function configure() {
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
