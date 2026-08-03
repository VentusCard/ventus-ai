declare const process: { env: Record<string, string | undefined> };
import { createHmac, timingSafeEqual } from "node:crypto";

const ISSUER = "ventus-ai";
const AUDIENCE = "ventus-control-plane";
const MAX_SESSION_SECONDS = 15 * 60;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/;

export type ControlPlanePrincipal = {
  tenantId: string;
  subject: string;
  roles: string[];
  businessLines: string[];
  sessionId: string;
  identityProvider: string;
  authenticatedAt: number;
  expiresAt: number;
  authMode: "control_session";
};

type ControlPlaneClaims = {
  iss: string;
  aud: string;
  sub: string;
  tenant_id: string;
  roles: string[];
  business_lines: string[];
  jti: string;
  idp: string;
  auth_time: number;
  iat: number;
  exp: number;
};

export function controlPlaneEnabled(): boolean {
  return process.env.ENABLE_GROWTH_PLAY_CONTROL_PLANE === "true";
}

export function authorizeControlPlane(
  request: Request,
  requirements: { role?: string; businessLine?: string } = {},
): ControlPlanePrincipal | null {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const secret = process.env.VENTUS_CONTROL_PLANE_SESSION_SECRET?.trim();
  if (!bearer || !secret) return null;
  const principal = verifyControlPlaneSession(bearer, secret);
  return principal && controlPrincipalAllowed(principal, requirements) ? principal : null;
}

export function controlPrincipalAllowed(
  principal: ControlPlanePrincipal,
  requirements: { role?: string; businessLine?: string },
): boolean {
  return (!requirements.role || principal.roles.includes(requirements.role))
    && (!requirements.businessLine || principal.businessLines.includes(requirements.businessLine));
}

export function issueControlPlaneSession({
  secret,
  tenantId,
  subject,
  roles,
  businessLines,
  sessionId,
  identityProvider,
  authenticatedAt,
  ttlSeconds = 5 * 60,
  now = Math.floor(Date.now() / 1000),
}: {
  secret: string;
  tenantId: string;
  subject: string;
  roles: string[];
  businessLines: string[];
  sessionId: string;
  identityProvider: string;
  authenticatedAt?: number;
  ttlSeconds?: number;
  now?: number;
}): string {
  validateSecret(secret);
  for (const [value, label] of [[tenantId, "tenantId"], [subject, "subject"], [sessionId, "sessionId"], [identityProvider, "identityProvider"]] as const) {
    validateOpaqueId(value, label);
  }
  validateEntitlements(roles, "roles");
  validateEntitlements(businessLines, "businessLines");
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > MAX_SESSION_SECONDS) {
    throw new Error(`ttlSeconds must be 30-${MAX_SESSION_SECONDS}`);
  }
  const authTime = authenticatedAt ?? now;
  if (!Number.isInteger(authTime) || authTime > now + 60 || now - authTime > 12 * 60 * 60) {
    throw new Error("authenticatedAt must represent a recent identity-provider authentication");
  }
  const header = encodeJson({ alg: "HS256", typ: "VCP1" });
  const claims: ControlPlaneClaims = {
    iss: ISSUER,
    aud: AUDIENCE,
    sub: subject,
    tenant_id: tenantId,
    roles: [...new Set(roles)],
    business_lines: [...new Set(businessLines)],
    jti: sessionId,
    idp: identityProvider,
    auth_time: authTime,
    iat: now,
    exp: now + ttlSeconds,
  };
  const payload = encodeJson(claims);
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyControlPlaneSession(
  token: string,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): ControlPlanePrincipal | null {
  try {
    validateSecret(secret);
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedClaims, signature] = parts;
    const unsigned = `${encodedHeader}.${encodedClaims}`;
    if (!safeEqual(signature, sign(unsigned, secret))) return null;
    const header = decodeJson(encodedHeader) as { alg?: unknown; typ?: unknown };
    const claims = decodeJson(encodedClaims) as ControlPlaneClaims;
    if (header.alg !== "HS256" || header.typ !== "VCP1") return null;
    if (claims.iss !== ISSUER || claims.aud !== AUDIENCE) return null;
    for (const [value, label] of [[claims.tenant_id, "tenant_id"], [claims.sub, "sub"], [claims.jti, "jti"], [claims.idp, "idp"]] as const) {
      validateOpaqueId(value, label);
    }
    validateEntitlements(claims.roles, "roles");
    validateEntitlements(claims.business_lines, "business_lines");
    for (const value of [claims.auth_time, claims.iat, claims.exp]) if (!Number.isInteger(value)) return null;
    if (claims.iat > now + 60 || claims.auth_time > claims.iat + 60 || claims.iat - claims.auth_time > 12 * 60 * 60) return null;
    if (claims.exp <= now || claims.exp - claims.iat < 30 || claims.exp - claims.iat > MAX_SESSION_SECONDS) return null;
    return {
      tenantId: claims.tenant_id,
      subject: claims.sub,
      roles: [...new Set(claims.roles)],
      businessLines: [...new Set(claims.business_lines)],
      sessionId: claims.jti,
      identityProvider: claims.idp,
      authenticatedAt: claims.auth_time,
      expiresAt: claims.exp,
      authMode: "control_session",
    };
  } catch {
    return null;
  }
}

export function controlPlaneDisabledResponse(): Response {
  return Response.json({ error: "Growth Play control plane disabled" }, { status: 404 });
}

function validateSecret(secret: string): void {
  if (typeof secret !== "string" || secret.length < 32) throw new Error("control-plane session secret must be at least 32 characters");
}

function validateOpaqueId(value: string, label: string): void {
  if (typeof value !== "string" || !OPAQUE_ID.test(value)) throw new Error(`${label} must be an opaque identifier`);
}

function validateEntitlements(values: string[], label: string): void {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => typeof value !== "string" || !OPAQUE_ID.test(value))) {
    throw new Error(`${label} must contain opaque identifiers`);
  }
}

function sign(unsigned: string, secret: string): string {
  return createHmac("sha256", secret).update(unsigned).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeJson(value: string): unknown {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
}
