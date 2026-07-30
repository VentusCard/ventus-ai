import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { POST } from "./console-access.ts";

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

test("confirmed Ventus presenters receive both demos and connector access", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_123",
    email: "presenter@ventusai.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });

  const response = await POST(request());
  const body = await response.json() as { status?: string; entitlements?: string[] };
  assert.equal(response.status, 200);
  assert.equal(body.status, "active");
  assert.deepEqual(body.entitlements, [
    "consumer_demo",
    "wealth_demo",
    "growth_console",
    "live_connectors",
  ]);
});

test("unprovisioned external registrations remain pending", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_456",
    email: "evaluator@example.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });

  const response = await POST(request());
  const body = await response.json() as { status?: string; entitlements?: string[] };
  assert.equal(response.status, 200);
  assert.equal(body.status, "pending");
  assert.deepEqual(body.entitlements, []);
});

test("IdP-controlled metadata provisions one institution and selected demos", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_789",
    email: "advisor@ml.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {
      tenant_id: "bofa",
      organization_id: "bofa",
      console_role: "bank_operator",
      console_access_status: "active",
      console_entitlements: ["wealth_demo", "growth_console", "unknown"],
      console_business_lines: ["wealth-management"],
    },
  });

  const response = await POST(request());
  const body = await response.json() as {
    tenantId?: string;
    organizationId?: string;
    status?: string;
    entitlements?: string[];
  };
  assert.equal(response.status, 200);
  assert.equal(body.tenantId, "bofa");
  assert.equal(body.organizationId, "bofa");
  assert.equal(body.status, "active");
  assert.deepEqual(body.entitlements, ["wealth_demo", "growth_console"]);
});

function configure() {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon-key";
  process.env.VENTUS_CONSOLE_INTERNAL_DOMAINS = "ventusai.com";
}

function request() {
  return new Request("https://demo.ventusai.com/api/console-access", {
    method: "POST",
    headers: { Authorization: "Bearer supabase-token" },
  });
}
