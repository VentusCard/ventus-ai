// Vercel serverless function — the delivery adapter. Takes a routed opportunity and
// emits the system-native payload for the bank's stack (Salesforce / Marketing Cloud /
// Erica / workbench). If DELIVERY_WEBHOOK_URL is configured (e.g. a Salesforce sandbox
// bridge or a mock endpoint), the payload is forwarded; otherwise it's returned staged.
// Payload shapes live in src/lib/integrations.ts — one contract for UI and API.
import { buildDeliveryPayload, type DeliveryOpp } from "../src/lib/integrations";
import { connectorAuthorized, connectorDisabledResponse, liveConnectorsEnabled } from "./_connectorAuth.ts";

declare const process: { env: Record<string, string | undefined> };

export const maxDuration = 15;

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();
  if (!connectorAuthorized(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  let body: { opportunity?: unknown };
  try {
    body = (await request.json()) as { opportunity?: unknown };
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const o = body.opportunity as DeliveryOpp | undefined;
  if (!o || typeof o.id !== "string" || typeof o.destination !== "string") {
    return Response.json({ error: "opportunity required" }, { status: 400 });
  }

  const built = buildDeliveryPayload(o);
  const webhook = process.env.DELIVERY_WEBHOOK_URL?.trim();

  let forwarded = false;
  let forwardError: string | undefined;
  if (webhook) {
    const started = Date.now();
    try {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ventus-adapter": built.system },
        body: JSON.stringify(built),
      });
      forwarded = res.ok;
      if (!res.ok) forwardError = `sandbox responded ${res.status}`;
    } catch (e) {
      forwardError = e instanceof Error ? e.message : "sandbox unreachable";
    }
    return Response.json({ ...built, forwarded, forwardError, latencyMs: Date.now() - started });
  }

  return Response.json({ ...built, forwarded });
}
