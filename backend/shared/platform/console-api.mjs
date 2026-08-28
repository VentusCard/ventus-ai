export function createConsoleApiHandler({ verifyIdentity, resolveMembership }) {
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
