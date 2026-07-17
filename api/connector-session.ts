// Connector session issuer — mints the short-lived, tenant/scope/destination-bound
// sessions that authorize live connector writes. This is the authorization ROOT: it turns
// "who may deliver" into an explicit, expiring, signed grant instead of a static header.
//
// In PRODUCTION this endpoint is replaced by (or fronted by) bank SSO / the IdP — a browser
// never mints its own delivery rights. In NON-PROD it is gated by an admin issuer token so
// the pilot:e2e flow and the Live Lab can obtain a real session without standing up an IdP.
//
// Gates: ENABLE_LIVE_CONNECTORS must be on; VENTUS_CONNECTOR_SESSION_SECRET must be set
// (the signing key); VENTUS_SESSION_ISSUER_TOKEN must be presented as a bearer (the caller
// authorized to mint sessions). Missing any → documented 404/503, never a silent grant.
declare const process: { env: Record<string, string | undefined> };
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { issueConnectorSession, liveConnectorsEnabled, connectorDisabledResponse } from "./_connectorAuth.js";

export const maxDuration = 10;

const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;

function issuerAuthorized(request: Request): boolean {
  const expected = process.env.VENTUS_SESSION_ISSUER_TOKEN?.trim();
  if (!expected) return false;
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!bearer) return false;
  const a = Buffer.from(bearer);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function asIdList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const list = value.filter((v): v is string => typeof v === "string" && OPAQUE_ID.test(v));
  return list.length === value.length ? [...new Set(list)] : null;
}

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();

  const secret = process.env.VENTUS_CONNECTOR_SESSION_SECRET?.trim();
  if (!secret) return Response.json({ error: "session issuance not configured — set VENTUS_CONNECTOR_SESSION_SECRET" }, { status: 503 });
  if (!process.env.VENTUS_SESSION_ISSUER_TOKEN?.trim()) {
    return Response.json({ error: "session issuer not configured — set VENTUS_SESSION_ISSUER_TOKEN (replaced by SSO in production)" }, { status: 503 });
  }

  // Production must not mint sessions from a static admin token — that is SSO's job.
  if (process.env.VERCEL_ENV === "production" && process.env.VENTUS_ALLOW_TOKEN_ISSUER !== "true") {
    return Response.json({ error: "static-token issuance is disabled in production; use the SSO-backed issuer" }, { status: 403 });
  }

  if (!issuerAuthorized(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  let body: { tenantId?: unknown; subject?: unknown; scopes?: unknown; destinations?: unknown; ttlSeconds?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const tenantId = typeof body.tenantId === "string" && OPAQUE_ID.test(body.tenantId) ? body.tenantId : null;
  const subject = typeof body.subject === "string" && OPAQUE_ID.test(body.subject) ? body.subject : null;
  const scopes = asIdList(body.scopes);
  const destinations = asIdList(body.destinations);
  if (!tenantId || !subject || !scopes || !destinations) {
    return Response.json({ error: "tenantId, subject, scopes[], destinations[] (opaque ids) required" }, { status: 400 });
  }
  const ttlSeconds = typeof body.ttlSeconds === "number" ? body.ttlSeconds : 300;

  try {
    const sessionId = `sess${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const token = issueConnectorSession({ secret, tenantId, subject, scopes, destinations, sessionId, ttlSeconds });
    const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
    return Response.json({ token, sessionId, tenantId, subject, scopes, destinations, expiresAt, tokenType: "connector-session" });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 160) }, { status: 400 });
  }
}

// Small helper so the e2e orchestrator can mint a session in-process without HTTP.
export function mintSessionDirect(params: {
  tenantId: string;
  subject: string;
  scopes: string[];
  destinations: string[];
  ttlSeconds?: number;
}): { token: string; sessionId: string } | null {
  const secret = process.env.VENTUS_CONNECTOR_SESSION_SECRET?.trim();
  if (!secret) return null;
  const sessionId = `sess${createHmac("sha256", secret).update(JSON.stringify(params)).digest("hex").slice(0, 24)}`;
  const token = issueConnectorSession({ ...params, secret, sessionId });
  return { token, sessionId };
}
