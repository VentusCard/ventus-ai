// Short-lived connector session broker for the hosted executive demo.
//
// Deployment access controls protect the demo. This endpoint returns a session scoped
// only to Plaid sandbox reads and Salesforce sandbox writes. Partner credentials never
// enter the browser.
declare const process: { env: Record<string, string | undefined> };
import { randomUUID } from "node:crypto";
import { connectorDisabledResponse, issueConnectorSession, liveConnectorsEnabled } from "./_connectorAuth.js";
import { authorizeConsoleUser } from "./_consoleAuth.js";

export const maxDuration = 10;

const SESSION_SECONDS = 15 * 60;

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();
  if (process.env.VENTUS_ENABLE_DEMO_CONNECTOR_SESSION !== "true") {
    return Response.json({ error: "live connector session disabled" }, { status: 404 });
  }
  if (!sameOriginAllowed(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  // Two auth paths coexist here:
  //  1. Authenticated console operator -> session scoped to that operator's tenant and
  //     entitled scenarios (the governed Growth Console path).
  //  2. No operator, but the hosted executive demo is explicitly enabled -> fall back to a
  //     demo-tenant session (the no-login presenter path). This only activates behind
  //     liveConnectorsEnabled + VENTUS_ENABLE_DEMO_CONNECTOR_SESSION + same-origin, so it
  //     is never reachable in an unconfigured deployment.
  const operator = await authorizeConsoleUser(request);
  const anonDemoAllowed = process.env.VENTUS_ALLOW_ANON_DEMO_SESSION === "true";
  if (!operator && !anonDemoAllowed) {
    return Response.json({ error: "authenticated operator required" }, { status: 401 });
  }

  const sessionSecret = process.env.VENTUS_CONNECTOR_SESSION_SECRET?.trim();
  if (!sessionSecret) {
    return Response.json({ error: "live connector session is not configured" }, { status: 503 });
  }

  try {
    const sessionId = `demo_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
    const tenantId = operator?.tenantId ?? environmentId("VENTUS_DEMO_TENANT_ID", "demo_bank");
    const subject = operator?.userId ?? "demo_operator";
    // Operators are scoped to only the scenarios they are entitled to. The no-login demo
    // path receives both scenarios so it works end-to-end with the scenario-scoped
    // /api/plaid-transactions endpoint.
    const scenarioScopes = operator
      ? [
          ...(operator.entitlements.includes("consumer_demo") ? ["scenario_deposit_retention"] : []),
          ...(operator.entitlements.includes("wealth_demo") ? ["scenario_wealth_growth"] : []),
        ]
      : ["scenario_deposit_retention", "scenario_wealth_growth"];
    const token = issueConnectorSession({
      secret: sessionSecret,
      tenantId,
      subject,
      scopes: ["plaid_read", "salesforce_write", ...scenarioScopes],
      destinations: ["plaid", "salesforce"],
      sessionId,
      ttlSeconds: SESSION_SECONDS,
    });
    const response = Response.json({
      token,
      tokenType: "connector-session",
      sessionId,
      expiresAt: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
      tenantId,
      subject,
      role: operator?.role ?? "demo",
      connectors: {
        plaid: Boolean(process.env.PLAID_CLIENT_ID?.trim() && process.env.PLAID_SECRET?.trim()),
        salesforce: Boolean(
          process.env.SF_LOGIN_URL?.trim()
          && process.env.SF_CLIENT_ID?.trim()
          && process.env.SF_CLIENT_SECRET?.trim(),
        ),
      },
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return Response.json({ error: String(error).slice(0, 180) }, { status: 503 });
  }
}

function sameOriginAllowed(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (process.env.VERCEL_ENV !== "production") return true;
  if (!origin) return false;
  const configured = process.env.VENTUS_DEMO_ORIGIN?.trim().replace(/\/$/, "");
  const expected = configured || new URL(request.url).origin;
  return origin === expected;
}

function environmentId(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  return /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/.test(value) ? value : fallback;
}
