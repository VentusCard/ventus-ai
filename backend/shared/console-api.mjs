import { requiredEntitlementForScenario } from './hosted-decision-runtime.mjs';
import {
  authorizeScenarioDecision,
  authorizeScenarioRead,
  authorizeTodayRead,
  authorizedTodayScenarios,
} from './console-authorization.mjs';

export class ConsoleRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConsoleRequestError';
  }
}

export function createConsoleApiHandler({
  verifyIdentity,
  resolveMembership,
  executeDecision,
  appendDecision,
  journey,
  deliverReserved,
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
    if (!['GET', 'POST'].includes(method)) return response(405, { error: 'method not allowed' }, responseHeaders);
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
      if (method === 'GET' && path.endsWith('/today')) {
        if (!journey) return response(503, { error: 'durable Console journey is unavailable' }, responseHeaders);
        const authorization = authorizeTodayRead(membership);
        if (!authorization.allowed) return response(403, { error: 'today is not authorized for this member' }, responseHeaders);
        const scenarios = new Set(authorizedTodayScenarios(membership));
        const moments = (await journey.listMoments({ tenantId: identity.tenantHint }))
          .filter((moment) => scenarios.has(moment.scenario));
        return response(200, todayProjection(moments, authorization.aggregateOnly), responseHeaders);
      }

      const momentPath = parseMomentPath(path);
      if (method === 'GET' && path.endsWith('/moments')) {
        if (!journey) return response(503, { error: 'durable Console journey is unavailable' }, responseHeaders);
        const moments = await journey.listMoments({ tenantId: identity.tenantHint });
        const visible = moments.filter((moment) => authorizeScenarioRead(membership, moment.scenario).allowed);
        return response(200, { moments: visible, serverAuthoritative: true }, responseHeaders);
      }
      if (method === 'GET' && momentPath?.operation === 'read') {
        if (!journey) return response(503, { error: 'durable Console journey is unavailable' }, responseHeaders);
        const moment = await journey.loadMoment({ tenantId: identity.tenantHint, decisionId: momentPath.decisionId });
        if (!authorizeScenarioRead(membership, moment.scenario).allowed) {
          return response(403, { error: 'moment is not authorized for this member' }, responseHeaders);
        }
        return response(200, { moment, serverAuthoritative: true }, responseHeaders);
      }

      if (method === 'POST' && momentPath?.operation === 'responses') {
        if (!journey) return response(503, { error: 'durable Console journey is unavailable' }, responseHeaders);
        const moment = await journey.loadMoment({ tenantId: identity.tenantHint, decisionId: momentPath.decisionId });
        if (!authorizeScenarioDecision(membership, moment.scenario).allowed) {
          return response(403, { error: 'operator role and business-line access are required for this response' }, responseHeaders);
        }
        const body = parseBody(event.body);
        const mutation = mutationMeta(event, body);
        if (mutation.expectedState !== 'queued') {
          throw new ConsoleRequestError('responses can only be recorded from the queued state');
        }
        const result = await journey.recordResponse({
          tenantId: identity.tenantHint,
          decisionId: momentPath.decisionId,
          actorId: identity.subject,
          sessionId: event.requestContext?.requestId || identity.subject,
          idempotencyKey: mutation.idempotencyKey,
          expectedState: mutation.expectedState,
          requestedAt: mutation.clientRequestedAt,
          response: body.response,
        });
        return response(201, { ...result, serverAuthoritative: true }, responseHeaders);
      }

      if (method === 'POST' && momentPath?.operation === 'deliveries') {
        if (!journey) return response(503, { error: 'durable Console journey is unavailable' }, responseHeaders);
        const moment = await journey.loadMoment({ tenantId: identity.tenantHint, decisionId: momentPath.decisionId });
        if (!authorizeScenarioDecision(membership, moment.scenario).allowed) {
          return response(403, { error: 'operator role and business-line access are required for this delivery' }, responseHeaders);
        }
        const body = parseBody(event.body);
        const mutation = mutationMeta(event, body);
        if (!['approved', 'delivery_failed'].includes(mutation.expectedState)) {
          throw new ConsoleRequestError('deliveries can only be reserved from an approved or terminally failed state');
        }
        const reservation = await journey.reserveDelivery({
          tenantId: identity.tenantHint,
          decisionId: momentPath.decisionId,
          sessionId: event.requestContext?.requestId || identity.subject,
          idempotencyKey: mutation.idempotencyKey,
          expectedState: mutation.expectedState,
          requestedAt: mutation.clientRequestedAt,
        });
        const result = reservation.reservation?.shouldDeliver && typeof deliverReserved === 'function'
          ? await deliverReserved({
            tenantId: identity.tenantHint,
            decisionId: momentPath.decisionId,
            sessionId: event.requestContext?.requestId || identity.subject,
            reservation: reservation.reservation,
            moment: reservation.moment,
          })
          : reservation;
        const { reservation: internalReservation, ...publicResult } = result;
        return response(201, {
          ...publicResult,
          ...(internalReservation?.reconciliationRequired ? { reconciliationRequired: true } : {}),
          serverAuthoritative: true,
        }, responseHeaders);
      }

      if (path.endsWith('/decision-run')) {
        if (method !== 'POST') return response(405, { error: 'method not allowed' }, responseHeaders);
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
        const recorded = await appendDecision({
          decision,
          requestId: event.requestContext?.requestId || 'console-request',
        });
        const { moment, ...ledgerReceipt } = recorded;
        return response(200, { ...decision, ledgerReceipt, ...(moment ? { moment } : {}) }, responseHeaders);
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
      if (error?.name === 'DecisionRequestError' || error?.name === 'ConsoleRequestError' || error?.code === 'ERR_ASSERTION') {
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
    'Access-Control-Allow-Headers': 'Authorization,Content-Type,Idempotency-Key',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

function parseMomentPath(path) {
  const matched = path.match(/\/moments\/([A-Za-z0-9][A-Za-z0-9_.:@-]{1,255})(?:\/(responses|deliveries))?$/);
  if (!matched) return null;
  return {
    decisionId: matched[1],
    operation: matched[2] || 'read',
  };
}

function mutationMeta(event, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ConsoleRequestError('valid mutation body required');
  const idempotencyKey = header(event, 'idempotency-key');
  const expectedState = typeof body.expectedState === 'string' ? body.expectedState : '';
  const clientRequestedAt = typeof body.clientRequestedAt === 'string' ? body.clientRequestedAt : '';
  if (!/^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(idempotencyKey)) {
    throw new ConsoleRequestError('Idempotency-Key header is required');
  }
  if (!['queued', 'approved', 'delivery_failed'].includes(expectedState)) throw new ConsoleRequestError('expectedState is invalid');
  if (Number.isNaN(Date.parse(clientRequestedAt))) throw new ConsoleRequestError('clientRequestedAt is invalid');
  return { idempotencyKey, expectedState, clientRequestedAt };
}

function todayProjection(moments, aggregateOnly) {
  const counts = moments.reduce((summary, moment) => {
    summary.total += 1;
    summary.byScenario[moment.scenario] = (summary.byScenario[moment.scenario] || 0) + 1;
    summary.byStatus[moment.status] = (summary.byStatus[moment.status] || 0) + 1;
    return summary;
  }, { total: 0, byScenario: {}, byStatus: {} });
  return {
    generatedAt: new Date().toISOString(),
    aggregateOnly,
    counts,
    ...(aggregateOnly ? {} : { moments: moments.slice(0, 8) }),
    serverAuthoritative: true,
  };
}

function response(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: body === null ? '' : JSON.stringify(body),
  };
}
