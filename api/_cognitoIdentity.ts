declare const process: { env: Record<string, string | undefined> };

import { Client } from "pg";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9:_-]{1,255}$/;
const TENANT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;
const jwksByIssuer = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export type CognitoIdentity = {
  subject: string;
  tenantHint: string;
  issuer: string;
};

export type CognitoMembership = {
  email: string;
  role: string;
  status: "active" | "pending" | "suspended";
  entitlements: string[];
  businessLines: string[];
  queueScopes: string[];
};

export async function verifyCognitoAccessToken(token: string): Promise<CognitoIdentity | null> {
  const issuer = process.env.COGNITO_ISSUER?.trim().replace(/\/$/, "") || "";
  const clientId = process.env.COGNITO_CLIENT_ID?.trim() || "";
  if (!issuer || !clientId || !token) return null;
  try {
    let jwks = jwksByIssuer.get(issuer);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
      jwksByIssuer.set(issuer, jwks);
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      algorithms: ["RS256"],
    });
    return identityFromClaims(payload, { issuer, clientId });
  } catch {
    return null;
  }
}

export function identityFromClaims(
  payload: JWTPayload,
  config: { issuer: string; clientId: string },
): CognitoIdentity | null {
  const subject = typeof payload.sub === "string" ? payload.sub : "";
  const tenantHint = typeof payload.tenant_id === "string"
    ? payload.tenant_id
    : "";
  const tokenUse = typeof payload.token_use === "string" ? payload.token_use : "";
  const tokenClientId = typeof payload.client_id === "string" ? payload.client_id : "";
  if (
    tokenUse !== "access"
    || tokenClientId !== config.clientId
    || !OPAQUE_ID.test(subject)
    || !TENANT_ID.test(tenantHint)
  ) {
    return null;
  }
  return {
    subject,
    tenantHint,
    issuer: config.issuer,
  };
}

export async function resolveCognitoMembership(
  identity: CognitoIdentity,
): Promise<CognitoMembership | null> {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;
  const ssl = (process.env.PGSSL || "require").toLowerCase() === "disable"
    ? false
    : { rejectUnauthorized: false };
  const client = new Client({ connectionString, ssl });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [identity.tenantHint]);
    const result = await client.query(
      `SELECT m.email, m.role, m.status, m.entitlements, m.business_lines, m.queue_scopes
         FROM institution_memberships m
         JOIN institutions i
           ON i.tenant_id = m.tenant_id
         JOIN institution_identity_providers p
           ON p.tenant_id = m.tenant_id
          AND p.provider_key = m.identity_provider_key
        WHERE m.tenant_id = $1
          AND m.identity_provider_key = 'cognito'
          AND m.identity_subject = $2
          AND m.status IN ('invited', 'active', 'suspended')
          AND i.status IN ('pilot', 'active')
          AND p.status IN ('testing', 'active')
          AND p.issuer = $3
        LIMIT 1`,
      [identity.tenantHint, identity.subject, identity.issuer],
    );
    await client.query("COMMIT");
    const row = result.rows[0] as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      email: typeof row.email === "string" ? row.email.toLowerCase() : "",
      role: typeof row.role === "string" ? row.role : "",
      status: row.status === "active"
        ? "active"
        : row.status === "suspended"
          ? "suspended"
          : "pending",
      entitlements: stringArray(row.entitlements),
      businessLines: stringArray(row.business_lines),
      queueScopes: stringArray(row.queue_scopes),
    };
  } catch {
    await client.query("ROLLBACK").catch(() => undefined);
    return null;
  } finally {
    await client.end();
  }
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
