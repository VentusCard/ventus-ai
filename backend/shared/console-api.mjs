import { requiredEntitlementForScenario } from './hosted-decision-runtime.mjs';
import { authorizeScenarioDecision } from './console-authorization.mjs';

export function createConsoleApiHandler({
  verifyIdentity,
  resolveMembership,
  executeDecision,
  appendDecision,
}) {
  if (typeof verifyIdentity !== 'function' || typeof resolveMembership !== 'function') {
    throw new Error('Console API identity and membership adapters are required');
  }
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

      const path = String(event.path || event.rawPath || event.resource || '');
      if (path.endsWith('/decision-run')) {
        if (typeof executeDecision !== 'function' || typeof appendDecision !== 'function') {
          return response(503, { error: 'hosted decision runtime is unavailable' }, responseHeaders);
        }
        const body = parseBody(event.body);
        requiredEntitlementForScenario(body.scenario);
        const authorization = authorizeScenarioDecision(membership, body.scenario);
        if (!authorization.allowed) {
          return response(403, {
            error: 'operator role and business-line access are required for this scenario',
          }, responseHeaders);
        }
        const decision = executeDecision({ tenantId: identity.tenantHint, body });
        const ledgerReceipt = await appendDecision({
          decision,
          requestId: event.requestContext?.requestId || 'console-request',
        });
        return response(200, { ...decision, ledgerReceipt }, responseHeaders);
      }

      return response(200, {
        userId: identity.subject,
        email: membership.email,
        tenantId: identity.tenantHint,
        organizationId: identity.tenantHint,
        role: membership.role,
        status: membership.status || (membership.entitlements.length > 0 ? 'active' : 'pending'),
        entitlements: membership.entitlements,
        businessLineScopes: membership.businessLines,
        queueScopes: membership.queueScopes || [],
        authProvider: 'cognito',
      }, responseHeaders);
    } catch (error) {
      if (error?.name === 'DecisionRequestError') {
        return response(400, { error: String(error.message).slice(0, 180) }, responseHeaders);
      }
      console.error(JSON.stringify({
        event: 'console_access_error',
        requestId: event.requestContext?.requestId,
        message: String(error?.message || error).slice(0, 180),
      }));
      return response(500, { error: 'Console access check failed' }, responseHeaders);
    }
  };
}

function parseBody(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    const error = new Error('invalid JSON');
    error.name = 'DecisionRequestError';
    throw error;
  }
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
