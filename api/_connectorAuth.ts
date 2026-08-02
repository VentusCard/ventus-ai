declare const process: { env: Record<string, string | undefined> };
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_ISSUER = "ventus-ai";
const SESSION_AUDIENCE = "ventus-connectors";
const MAX_SESSION_SECONDS = 15 * 60;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;

export type ConnectorPrincipal = {
  tenantId: string;
  subject: string;
  scopes: string[];
  destinations: string[];
  sessionId: string;
  expiresAt: number;
  authMode: "session" | "legacy_bearer" | "local_demo";
  sessionKind: "presenter" | "console" | "service";
  role: string | null;
  businessLineScopes: string[];
  queueScopes: string[];
};

type ConnectorSessionClaims = {
  iss: string;
  aud: string;
  sub: string;
  tenant_id: string;
  scopes: string[];
  destinations: string[];
  jti: string;
  iat: number;
  exp: number;
  session_kind?: "presenter" | "console" | "service";
  role?: string;
  business_line_scopes?: string[];
  queue_scopes?: string[];
};

export function liveConnectorsEnabled(): boolean {
  return process.env.ENABLE_LIVE_CONNECTORS === "true";
}

export function authorizeConnector(
  request: Request,
  requirements: { scope?: string; destination?: string } = {},
): ConnectorPrincipal | null {
  const authorization = request.headers.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const sessionSecret = process.env.VENTUS_CONNECTOR_SESSION_SECRET?.trim();

  if (bearer && sessionSecret) {
    const principal = verifyConnectorSession(bearer, sessionSecret);
    if (principal && principalAllowed(principal, requirements)) return principal;
  }

  const expectedLegacy = process.env.VENTUS_CONNECTOR_TOKEN?.trim();
  const legacyAllowed = !sessionSecret
    || process.env.VERCEL_ENV !== "production"
    || process.env.VENTUS_ALLOW_LEGACY_CONNECTOR_TOKEN === "true";
  if (bearer && expectedLegacy && legacyAllowed && safeEqual(bearer, expectedLegacy)) {
    const principal: ConnectorPrincipal = {
      tenantId: safeEnvironmentId("VENTUS_LEGACY_CONNECTOR_TENANT_ID", "legacy_default"),
      subject: "legacy_connector_client",
      scopes: ["*"],
      destinations: ["*"],
      sessionId: "legacy_bearer",
      expiresAt: 0,
      authMode: "legacy_bearer",
      sessionKind: "service",
      role: null,
      businessLineScopes: [],
      queueScopes: [],
    };
    if (principalAllowed(principal, requirements)) return principal;
  }

  const localDemoAllowed =
    process.env.VENTUS_ALLOW_LOCAL_CONNECTORS === "true" &&
    process.env.VERCEL_ENV !== "production" &&
    request.headers.get("x-ventus-client") === "web-app";
  if (localDemoAllowed) {
    const principal: ConnectorPrincipal = {
      tenantId: safeEnvironmentId("VENTUS_LOCAL_CONNECTOR_TENANT_ID", "local_demo"),
      subject: "local_demo_browser",
      scopes: ["*"],
      destinations: ["*"],
      sessionId: "local_demo",
      expiresAt: 0,
      authMode: "local_demo",
      sessionKind: "presenter",
      role: null,
      businessLineScopes: [],
      queueScopes: [],
    };
    if (principalAllowed(principal, requirements)) return principal;
  }
  return null;
}

export function connectorAuthorized(request: Request): boolean {
  return authorizeConnector(request) !== null;
}

export function issueConnectorSession({
  secret,
  tenantId,
  subject,
  scopes,
  destinations,
  sessionId,
  sessionKind = "service",
  role,
  businessLineScopes = [],
  queueScopes = [],
  ttlSeconds = 5 * 60,
  now = Math.floor(Date.now() / 1000),
}: {
  secret: string;
  tenantId: string;
  subject: string;
  scopes: string[];
  destinations: string[];
  sessionId: string;
  sessionKind?: "presenter" | "console" | "service";
  role?: string;
  businessLineScopes?: string[];
  queueScopes?: string[];
  ttlSeconds?: number;
  now?: number;
}): string {
  validateSecret(secret);
  validateOpaqueId(tenantId, "tenantId");
  validateOpaqueId(subject, "subject");
  validateOpaqueId(sessionId, "sessionId");
  validateEntitlements(scopes, "scopes");
  validateEntitlements(destinations, "destinations");
  if (!["presenter", "console", "service"].includes(sessionKind)) {
    throw new Error("sessionKind is invalid");
  }
  if (role !== undefined) validateOpaqueId(role, "role");
  validateOptionalEntitlements(businessLineScopes, "businessLineScopes");
  validateOptionalEntitlements(queueScopes, "queueScopes");
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 30 || ttlSeconds > MAX_SESSION_SECONDS) {
    throw new Error(`ttlSeconds must be 30-${MAX_SESSION_SECONDS}`);
  }
  const header = encodeJson({ alg: "HS256", typ: "VCS1" });
  const claims: ConnectorSessionClaims = {
    iss: SESSION_ISSUER,
    aud: SESSION_AUDIENCE,
    sub: subject,
    tenant_id: tenantId,
    scopes: [...new Set(scopes)],
    destinations: [...new Set(destinations)],
    jti: sessionId,
    iat: now,
    exp: now + ttlSeconds,
    session_kind: sessionKind,
    ...(role ? { role } : {}),
    ...(businessLineScopes.length ? { business_line_scopes: [...new Set(businessLineScopes)] } : {}),
    ...(queueScopes.length ? { queue_scopes: [...new Set(queueScopes)] } : {}),
  };
  const payload = encodeJson(claims);
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyConnectorSession(
  token: string,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): ConnectorPrincipal | null {
  try {
    validateSecret(secret);
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [encodedHeader, encodedClaims, signature] = parts;
    const unsigned = `${encodedHeader}.${encodedClaims}`;
    if (!safeEqual(signature, sign(unsigned, secret))) return null;
    const header = decodeJson(encodedHeader) as { alg?: unknown; typ?: unknown };
    const claims = decodeJson(encodedClaims) as ConnectorSessionClaims;
    if (header.alg !== "HS256" || header.typ !== "VCS1") return null;
    if (claims.iss !== SESSION_ISSUER || claims.aud !== SESSION_AUDIENCE) return null;
    validateOpaqueId(claims.tenant_id, "tenant_id");
    validateOpaqueId(claims.sub, "sub");
    validateOpaqueId(claims.jti, "jti");
    validateEntitlements(claims.scopes, "scopes");
    validateEntitlements(claims.destinations, "destinations");
    const sessionKind = claims.session_kind ?? "service";
    if (!["presenter", "console", "service"].includes(sessionKind)) return null;
    if (claims.role !== undefined) validateOpaqueId(claims.role, "role");
    validateOptionalEntitlements(claims.business_line_scopes ?? [], "business_line_scopes");
    validateOptionalEntitlements(claims.queue_scopes ?? [], "queue_scopes");
    if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp)) return null;
    if (claims.iat > now + 60 || claims.exp <= now) return null;
    if (claims.exp - claims.iat > MAX_SESSION_SECONDS || claims.exp - claims.iat < 30) return null;
    return {
      tenantId: claims.tenant_id,
      subject: claims.sub,
      scopes: [...new Set(claims.scopes)],
      destinations: [...new Set(claims.destinations)],
      sessionId: claims.jti,
      expiresAt: claims.exp,
      authMode: "session",
      sessionKind,
      role: claims.role ?? null,
      businessLineScopes: [...new Set(claims.business_line_scopes ?? [])],
      queueScopes: [...new Set(claims.queue_scopes ?? [])],
    };
  } catch {
    return null;
  }
}

export function connectorDisabledResponse(): Response {
  return Response.json({ error: "connector disabled" }, { status: 404 });
}

function principalAllowed(
  principal: ConnectorPrincipal,
  requirements: { scope?: string; destination?: string },
): boolean {
  const scopeAllowed = !requirements.scope
    || principal.scopes.includes("*")
    || principal.scopes.includes(requirements.scope);
  const destinationAllowed = !requirements.destination
    || principal.destinations.includes("*")
    || principal.destinations.includes(requirements.destination);
  return scopeAllowed && destinationAllowed;
}

function validateSecret(secret: string): void {
  if (typeof secret !== "string" || secret.length < 32) throw new Error("connector session secret must be at least 32 characters");
}

function validateOpaqueId(value: string, label: string): void {
  if (typeof value !== "string" || !OPAQUE_ID.test(value)) throw new Error(`${label} must be an opaque identifier`);
}

function validateEntitlements(values: string[], label: string): void {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => typeof value !== "string" || !OPAQUE_ID.test(value))) {
    throw new Error(`${label} must contain opaque identifiers`);
  }
}

function validateOptionalEntitlements(values: string[], label: string): void {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string" || !OPAQUE_ID.test(value))) {
    throw new Error(`${label} must contain opaque identifiers`);
  }
}

function safeEnvironmentId(name: string, fallback: string): string {
  const value = process.env[name]?.trim() || fallback;
  return OPAQUE_ID.test(value) ? value : fallback;
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
