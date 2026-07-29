declare const process: { env: Record<string, string | undefined> };
import { randomUUID, timingSafeEqual } from "node:crypto";
import {
  controlPlaneDisabledResponse,
  controlPlaneEnabled,
  issueControlPlaneSession,
} from "./_controlPlaneAuth.js";

export const maxDuration = 10;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/;

export async function POST(request: Request): Promise<Response> {
  if (!controlPlaneEnabled()) return controlPlaneDisabledResponse();
  if (process.env.VERCEL_ENV === "production") {
    return Response.json({ error: "static control-plane issuance is disabled in production; use the bank SSO identity broker" }, { status: 403 });
  }
  const secret = process.env.VENTUS_CONTROL_PLANE_SESSION_SECRET?.trim();
  const issuerToken = process.env.VENTUS_CONTROL_PLANE_ISSUER_TOKEN?.trim();
  if (!secret || !issuerToken) return Response.json({ error: "control-plane session issuance is not configured" }, { status: 503 });
  if (!issuerAuthorized(request, issuerToken)) return Response.json({ error: "forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const tenantId = asId(body.tenantId);
  const subject = asId(body.subject);
  const roles = asIdList(body.roles);
  const businessLines = asIdList(body.businessLines);
  const identityProvider = asId(body.identityProvider) ?? "nonprod_control_issuer";
  if (!tenantId || !subject || !roles || !businessLines) {
    return Response.json({ error: "tenantId, subject, roles[], and businessLines[] are required" }, { status: 400 });
  }
  try {
    const sessionId = `cps_${randomUUID().replaceAll("-", "").slice(0, 24)}`;
    const ttlSeconds = typeof body.ttlSeconds === "number" ? body.ttlSeconds : 300;
    const token = issueControlPlaneSession({
      secret, tenantId, subject, roles, businessLines, identityProvider, sessionId, ttlSeconds,
    });
    return Response.json({ token, tokenType: "control-plane-session", sessionId, tenantId, subject, roles, businessLines });
  } catch (error) {
    return Response.json({ error: String(error).slice(0, 180) }, { status: 400 });
  }
}

function issuerAuthorized(request: Request, expected: string): boolean {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : "";
  const left = Buffer.from(bearer);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

function asId(value: unknown): string | null {
  return typeof value === "string" && OPAQUE_ID.test(value) ? value : null;
}

function asIdList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const values = value.map(asId);
  return values.every((item): item is string => item !== null) ? [...new Set(values)] : null;
}
