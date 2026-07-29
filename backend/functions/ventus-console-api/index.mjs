import { createRemoteJWKSet, jwtVerify } from 'jose';
import pg from 'pg';
import { createSecretsProvider } from '../../shared/secrets.mjs';

const { Client } = pg;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9:_-]{1,255}$/;
const TENANT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ALLOWED_ENTITLEMENTS = new Set([
  'consumer_demo',
  'wealth_demo',
  'growth_console',
  'live_connectors',
]);
const jwksByIssuer = new Map();
let getDatabaseCredentials;

export function createHandler({
  verifyIdentity = verifyCognitoAccessToken,
  resolveMembership = resolveCognitoMembership,
} = {}) {
  return async function handler(event = {}) {
    const origin = header(event, 'origin');
    const allowedOrigins = parseAllowedOrigins(process.env.VENTUS_ALLOWED_ORIGINS);
    const responseHeaders = corsHeaders(origin, allowedOrigins);
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';

    if (method === 'OPTIONS') return response(204, null, responseHeaders);
    if (method !== 'POST') return response(405, { error: 'method not allowed' }, responseHeaders);
    if (origin && !allowedOrigins.includes(origin)) {
      return response(403, { error: 'origin is not allowed' }, responseHeaders);
    }

    const token = bearerToken(header(event, 'authorization'));
    if (!token) return response(401, { error: 'active Console access required' }, responseHeaders);

    try {
      const identity = await verifyIdentity(token);
      if (!identity) return response(401, { error: 'active Console access required' }, responseHeaders);
      const membership = await resolveMembership(identity);
      if (!membership) return response(403, { error: 'institution access is not active' }, responseHeaders);

      return response(200, {
        userId: identity.subject,
        email: membership.email,
        tenantId: identity.tenantHint,
        organizationId: identity.tenantHint,
        role: ['ventus_platform_admin', 'institution_admin'].includes(membership.role)
          ? 'admin'
          : 'operator',
        status: membership.entitlements.length > 0 ? 'active' : 'pending',
        entitlements: membership.entitlements,
        businessLines: membership.businessLines,
        authProvider: 'cognito',
      }, responseHeaders);
    } catch (error) {
      console.error(JSON.stringify({
        event: 'console_access_error',
        requestId: event.requestContext?.requestId,
        message: String(error?.message || error).slice(0, 180),
      }));
      return response(500, { error: 'Console access check failed' }, responseHeaders);
    }
  };
}

export const handler = createHandler();

async function verifyCognitoAccessToken(token) {
  const issuer = process.env.COGNITO_ISSUER?.trim().replace(/\/$/, '') || '';
  const clientId = process.env.COGNITO_CLIENT_ID?.trim() || '';
  if (!issuer || !clientId) return null;
  try {
    let jwks = jwksByIssuer.get(issuer);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
      jwksByIssuer.set(issuer, jwks);
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      algorithms: ['RS256'],
    });
    const subject = typeof payload.sub === 'string' ? payload.sub : '';
    const tenantHint = typeof payload.tenant_id === 'string' ? payload.tenant_id : '';
    if (
      payload.token_use !== 'access'
      || payload.client_id !== clientId
      || !OPAQUE_ID.test(subject)
      || !TENANT_ID.test(tenantHint)
    ) {
      return null;
    }
    return { subject, tenantHint, issuer };
  } catch {
    return null;
  }
}

async function resolveCognitoMembership(identity) {
  const credentials = await databaseCredentialsProvider()();
  const client = new Client({
    host: process.env.RDS_HOST,
    port: Number(process.env.RDS_PORT || 5432),
    database: process.env.RDS_DATABASE || 'ventus_bofa',
    user: credentials.username,
    password: credentials.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
    options: '-c search_path=ventus_evidence,public',
  });
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [identity.tenantHint]);
    const result = await client.query(
      `SELECT m.email, m.role, m.entitlements, m.business_lines
         FROM ventus_evidence.institution_memberships m
         JOIN ventus_evidence.institutions i
           ON i.tenant_id = m.tenant_id
         JOIN ventus_evidence.institution_identity_providers p
           ON p.tenant_id = m.tenant_id
          AND p.provider_key = m.identity_provider_key
        WHERE m.tenant_id = $1
          AND m.identity_provider_key = 'cognito'
          AND m.identity_subject = $2
          AND m.status = 'active'
          AND i.status IN ('pilot', 'active')
          AND p.status IN ('testing', 'active')
          AND p.issuer = $3
        LIMIT 1`,
      [identity.tenantHint, identity.subject, identity.issuer],
    );
    await client.query('COMMIT');
    const row = result.rows[0];
    if (!row || !EMAIL.test(row.email)) return null;
    return {
      email: row.email.toLowerCase(),
      role: row.role,
      entitlements: safeStringArray(row.entitlements).filter((item) => ALLOWED_ENTITLEMENTS.has(item)),
      businessLines: safeStringArray(row.business_lines),
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

function databaseCredentialsProvider() {
  if (!getDatabaseCredentials) {
    getDatabaseCredentials = createSecretsProvider({
      secretId: process.env.EVIDENCE_RUNTIME_SECRET_ID,
      region: process.env.AWS_REGION || 'us-east-2',
    });
  }
  return getDatabaseCredentials;
}

function safeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === 'string'))]
    : [];
}

function parseAllowedOrigins(value) {
  if (typeof value !== 'string' || !value.trim()) return [];
  return value.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
}

function corsHeaders(origin, allowedOrigins) {
  return {
    ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

function bearerToken(authorization) {
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

function header(event, name) {
  return Object.entries(event.headers || {})
    .find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] || '';
}

function response(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: body === null ? '' : JSON.stringify(body),
  };
}
