import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { PLAID_FIXTURE_PRIMACY } from "../src/lib/plaid.ts";
import { POST } from "./decision-run.ts";

const originalFetch = globalThis.fetch;
const managed = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "VENTUS_CONSOLE_INTERNAL_DOMAINS",
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

test("active, entitled operator can run the server decision baseline", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_123",
    email: "operator@ventusai.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });

  const response = await POST(request());
  const body = await response.json() as { status?: string; tenantId?: string; runtime?: { modelInvocation?: unknown } };
  assert.equal(response.status, 200);
  assert.equal(body.status, "qualified");
  assert.equal(body.tenantId, "ventus");
  assert.equal(body.runtime?.modelInvocation, null);
});

test("unprovisioned operator cannot run a decision", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "user_456",
    email: "person@example.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {},
  });

  const response = await POST(request());
  assert.equal(response.status, 401);
});

test("operator cannot run a business-line scenario outside their entitlements", async () => {
  configure();
  globalThis.fetch = async () => Response.json({
    id: "advisor_123",
    email: "advisor@ml.com",
    email_confirmed_at: "2026-07-18T12:00:00Z",
    app_metadata: {
      tenant_id: "bofa",
      console_access_status: "active",
      console_entitlements: ["wealth_demo", "growth_console", "live_connectors"],
    },
  });

  const response = await POST(request());
  assert.equal(response.status, 403);
});

function configure() {
  process.env.SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon-key";
  process.env.VENTUS_CONSOLE_INTERNAL_DOMAINS = "ventusai.com";
}

function request() {
  return new Request("https://demo.ventusai.com/api/decision-run", {
    method: "POST",
    headers: {
      Authorization: "Bearer supabase-token",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      scenario: "deposit-retention",
      transactions: PLAID_FIXTURE_PRIMACY,
      source: { mode: "fixture", name: "Plaid-shaped fixture" },
    }),
  });
}
