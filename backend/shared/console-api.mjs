import {
  decisionScopeForScenario,
  requiredEntitlementForScenario,
} from './hosted-decision-runtime.mjs';
import {
  authorizeScenarioDecision,
  authorizeScenarioRead,
  authorizeTodayRead,
  authorizedTodayScenarios,
  authorizeConnectionsRead,
  authorizeConnectionsWrite,
  authorizeCoworkerDelivery,
  authorizeGovernanceRead,
  authorizeGrowthPlayApproval,
  authorizeGrowthPlayRead,
  authorizeGrowthPlayWrite,
  authorizeResultsRead,
  authorizeSkillApproval,
  authorizeSkillDraft,
  authorizeSkillRead,
  authorizeSkillTransition,
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
  controlPlane,
  growthPlayRegistry,
  deliverCoworkerBriefing,
  readSalesforceOutcome,
  runControlledSandbox,
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
      if (method === 'GET' && path.endsWith('/results')) {
        if (!controlPlane) return unavailable('product results', responseHeaders);
        const authorization = authorizeResultsRead(membership);
        if (!authorization.allowed) return forbidden('results', responseHeaders);
        return response(200, await controlPlane.results({
          tenantId: identity.tenantHint,
          projection: authorization.projection,
          actorId: identity.subject,
          businessLineScopes: membership.businessLines || [],
        }), responseHeaders);
      }
      if (method === 'GET' && path.endsWith('/governance')) {
        if (!controlPlane) return unavailable('governance', responseHeaders);
        const authorization = authorizeGovernanceRead(membership);
        if (!authorization.allowed) return forbidden('governance', responseHeaders);
        return response(200, await controlPlane.governance({
          tenantId: identity.tenantHint,
          projection: authorization.projection,
          businessLineScopes: membership.businessLines || [],
        }), responseHeaders);
      }
      if (method === 'GET' && path.endsWith('/skills/shadows')) {
        if (!controlPlane) return unavailable('Skill shadow registry', responseHeaders);
        if (!authorizeSkillRead(membership).allowed) return forbidden('Skill shadow registry', responseHeaders);
        return response(200, await controlPlane.listSkillShadows({ tenantId: identity.tenantHint }), responseHeaders);
      }
      if (method === 'POST' && path.endsWith('/skills/shadows')) {
        if (!controlPlane) return unavailable('Skill shadow registry', responseHeaders);
        if (!authorizeSkillDraft(membership).allowed) return forbidden('Skill shadow registry', responseHeaders);
        const body = parseBody(event.body);
        if (body.status !== undefined) {
          throw new ConsoleRequestError('Skill status is derived by the server from governed transitions');
        }
        const result = await controlPlane.createSkillDraft({
          tenantId: identity.tenantHint, skillId: body.skillId, version: body.version,
          benchmark: body.benchmark, actorId: identity.subject,
        });
        return response(201, { ...result, serverAuthoritative: true }, responseHeaders);
      }
      const skillApprovalPath = parseSkillApprovalPath(path);
      if (method === 'POST' && skillApprovalPath) {
        if (!controlPlane) return unavailable('Skill governance', responseHeaders);
        const body = parseBody(event.body);
        if (!authorizeSkillApproval(membership, body.phase, body.approvalType).allowed) return forbidden('Skill approval', responseHeaders);
        const result = await controlPlane.recordSkillApproval({
          tenantId: identity.tenantHint,
          skillId: skillApprovalPath.skillId,
          version: skillApprovalPath.version,
          expectedRevision: body.expectedRevision,
          phase: body.phase,
          approvalType: body.approvalType,
          decision: body.decision,
          actorId: identity.subject,
          reason: body.reason,
        });
        return response(201, { ...result, serverAuthoritative: true }, responseHeaders);
      }
      const skillTransitionPath = parseSkillTransitionPath(path);
      if (method === 'POST' && skillTransitionPath) {
        if (!controlPlane) return unavailable('Skill governance', responseHeaders);
        const body = parseBody(event.body);
        if (body.status !== undefined) {
          throw new ConsoleRequestError('Skill status is derived by the server from governed transitions');
        }
        if (!authorizeSkillTransition(membership, body.action).allowed) return forbidden('Skill transition', responseHeaders);
        const result = await controlPlane.transitionSkill({
          tenantId: identity.tenantHint,
          skillId: skillTransitionPath.skillId,
          version: skillTransitionPath.version,
          expectedRevision: body.expectedRevision,
          action: body.action,
          actorId: identity.subject,
          reason: body.reason,
        });
        return response(201, { ...result, serverAuthoritative: true }, responseHeaders);
      }
      if (method === 'GET' && path.endsWith('/growth-plays')) {
        if (!controlPlane) return unavailable('Growth Plays', responseHeaders);
        if (!authorizeGrowthPlayRead(membership).allowed) return forbidden('Growth Plays', responseHeaders);
        return response(200, await controlPlane.listGrowthPlays({ tenantId: identity.tenantHint }), responseHeaders);
      }
      if (method === 'POST' && path.endsWith('/growth-plays/drafts')) {
        if (!controlPlane) return unavailable('Growth Plays', responseHeaders);
        if (!authorizeGrowthPlayWrite(membership).allowed) return forbidden('Growth Play configuration', responseHeaders);
        const body = parseBody(event.body);
        const saved = await controlPlane.saveDraft({
          tenantId: identity.tenantHint,
          draftId: body.draftId,
          expectedVersion: body.expectedVersion,
          contract: body.contract,
          actorId: identity.subject,
        });
        return response(201, { draft: saved, serverAuthoritative: true }, responseHeaders);
      }
      if (method === 'POST' && path.endsWith('/growth-plays/register')) {
        if (!controlPlane) return unavailable('Growth Plays', responseHeaders);
        if (!authorizeGrowthPlayWrite(membership).allowed) return forbidden('Growth Play registration', responseHeaders);
        const body = parseBody(event.body);
        const registered = await controlPlane.registerDraft({
          tenantId: identity.tenantHint,
          draftId: body.draftId,
          actorId: identity.subject,
          sessionId: event.requestContext?.requestId || identity.subject,
          identityProvider: 'cognito',
          registeredAt: new Date().toISOString(),
        });
        return response(201, { ...registered, serverAuthoritative: true }, responseHeaders);
      }
      const protocolApprovalPath = parseProtocolApprovalPath(path);
      if (method === 'POST' && protocolApprovalPath) {
        if (!growthPlayRegistry) return unavailable('Growth Play approvals', responseHeaders);
        if (!authorizeGrowthPlayApproval(membership).allowed) return forbidden('Growth Play approval', responseHeaders);
        const body = parseBody(event.body);
        const recorded = await growthPlayRegistry.recordApproval({
          tenantId: identity.tenantHint,
          decisionProtocolId: protocolApprovalPath.decisionProtocolId,
          businessLine: body.businessLine,
          decision: body.decision,
          decidedBy: identity.subject,
          decidedBySessionId: event.requestContext?.requestId || identity.subject,
          identityProvider: 'cognito',
          decidedAt: new Date().toISOString(),
          changeRecordId: body.changeRecordId,
          reason: body.reason,
        });
        return response(201, { approval: recorded.record, serverAuthoritative: true }, responseHeaders);
      }
      if (method === 'GET' && path.endsWith('/connections')) {
        if (!controlPlane) return unavailable('connections', responseHeaders);
        if (!authorizeConnectionsRead(membership).allowed) return forbidden('connections', responseHeaders);
        return response(200, await controlPlane.listConnections({ tenantId: identity.tenantHint }), responseHeaders);
      }
      if (method === 'GET' && path.endsWith('/onboarding/readiness')) {
        if (!controlPlane) return unavailable('onboarding readiness', responseHeaders);
        if (!authorizeConnectionsRead(membership).allowed) return forbidden('onboarding readiness', responseHeaders);
        return response(200, await controlPlane.onboardingReadiness({ tenantId: identity.tenantHint }), responseHeaders);
      }
      if (method === 'POST' && path.endsWith('/connections')) {
        if (!controlPlane) return unavailable('connections', responseHeaders);
        if (!authorizeConnectionsWrite(membership).allowed) return forbidden('connection configuration', responseHeaders);
        const body = parseBody(event.body);
        const mapping = await controlPlane.saveConnection({
          tenantId: identity.tenantHint,
          mappingId: body.mappingId,
          connector: body.connector,
          expectedVersion: body.expectedVersion,
          status: body.status,
          configuration: body.configuration,
          actorId: identity.subject,
        });
        return response(201, { mapping, serverAuthoritative: true }, responseHeaders);
      }
      const connectionTransition = parseConnectionTransitionPath(path);
      if (method === 'POST' && connectionTransition) {
        if (!controlPlane) return unavailable('connections', responseHeaders);
        if (!authorizeConnectionsWrite(membership).allowed) return forbidden('connection configuration', responseHeaders);
        const body = parseBody(event.body);
        const result = connectionTransition.targetStatus === 'tested' && typeof controlPlane.testConnection === 'function'
          ? await controlPlane.testConnection({
            tenantId: identity.tenantHint,
            mappingId: connectionTransition.mappingId,
            expectedVersion: body.expectedVersion,
            actorId: identity.subject,
          })
          : await controlPlane.transitionConnection({
          tenantId: identity.tenantHint,
          mappingId: connectionTransition.mappingId,
          expectedVersion: body.expectedVersion,
          targetStatus: connectionTransition.targetStatus,
          actorId: identity.subject,
          detail: body.detail,
          });
        return response(201, { ...result, serverAuthoritative: true }, responseHeaders);
      }
      if (method === 'POST' && path.endsWith('/briefings/deliveries')) {
        if (!controlPlane || typeof deliverCoworkerBriefing !== 'function') return unavailable('Coworker delivery', responseHeaders);
        if (!authorizeCoworkerDelivery(membership).allowed) return forbidden('Coworker delivery', responseHeaders);
        const body = parseBody(event.body);
        const connector = body.channel === 'outlook' ? 'microsoft-outlook' : body.channel === 'slack' ? 'slack' : '';
        if (!connector) throw new ConsoleRequestError('Coworker channel is unsupported');
        const scenario = typeof body.scenario === 'string' ? body.scenario : '';
        const scenarioAuthorization = authorizeScenarioRead(membership, scenario);
        if (!scenarioAuthorization.allowed) return forbidden('briefing scenario', responseHeaders);
        const mapping = await controlPlane.activeConnection({ tenantId: identity.tenantHint, connector });
        if (!mapping) throw new ConsoleRequestError('No active institution mapping exists for this Coworker channel');
        const delivery = await deliverCoworkerBriefing({
          tenantId: identity.tenantHint,
          channel: body.channel,
          role: membership.role,
          businessLine: scenarioAuthorization.businessLine,
          sessionId: event.requestContext?.requestId || identity.subject,
          title: body.title,
          counts: body.counts,
          decisionIds: body.decisionIds,
          mapping,
        });
        return response(201, { ...delivery, serverAuthoritative: true }, responseHeaders);
      }
      if (method === 'POST' && path.endsWith('/outcomes/salesforce-sync')) {
        if (!controlPlane || typeof readSalesforceOutcome !== 'function' || !journey) return unavailable('Salesforce outcome return', responseHeaders);
        if (!authorizeResultsRead(membership).allowed) return forbidden('Salesforce outcome return', responseHeaders);
        const body = parseBody(event.body);
        if (typeof body.decisionId !== 'string') throw new ConsoleRequestError('decisionId is required');
        const moment = await journey.loadMoment({ tenantId: identity.tenantHint, decisionId: body.decisionId });
        if (!authorizeScenarioRead(membership, moment.scenario).allowed) return forbidden('moment', responseHeaders);
        const mapping = await controlPlane.activeConnection({ tenantId: identity.tenantHint, connector: 'salesforce-fsc' });
        if (!mapping) throw new ConsoleRequestError('No active Salesforce FSC outcome mapping exists for this institution');
        const decisionRecordId = moment.receipt?.records?.decision?.id;
        if (!decisionRecordId) throw new ConsoleRequestError('This moment has no Salesforce Decision Receipt to reconcile');
        const outcome = await readSalesforceOutcome({
          tenantId: identity.tenantHint,
          decisionRecordId,
          mapping,
        });
        const recorded = await controlPlane.recordFscOutcome({
          tenantId: identity.tenantHint,
          moment,
          outcome,
          mapping,
          actorId: identity.subject,
        });
        return response(200, {
          mapping: { mappingId: mapping.mappingId, version: mapping.version, connector: mapping.connector },
          outcome,
          recorded,
          serverAuthoritative: true,
        }, responseHeaders);
      }
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
        const decisionAt = new Date();
        let protocolApproval = null;
        if (body.source?.mode === 'live') {
          if (typeof growthPlayRegistry?.requireLatestApproved !== 'function') {
            return response(503, { error: 'Growth Play approval enforcement is unavailable' }, responseHeaders);
          }
          const scope = decisionScopeForScenario(body.scenario);
          try {
            protocolApproval = await growthPlayRegistry.requireLatestApproved({
              tenantId: identity.tenantHint,
              growthPlayId: scope.growthPlayId,
              businessLine: scope.businessLine,
              at: decisionAt.toISOString(),
            });
          } catch {
            return response(409, {
              error: 'An independently approved Growth Play protocol is required before connected evidence can be evaluated.',
              code: 'growth_play_approval_required',
            }, responseHeaders);
          }
        }
        const decision = executeDecision({
          tenantId: identity.tenantHint,
          body,
          now: decisionAt,
          protocolApproval,
        });
        const recorded = await appendDecision({
          decision,
          requestId: event.requestContext?.requestId || 'console-request',
        });
        const { moment, ...ledgerReceipt } = recorded;
        return response(200, { ...decision, ledgerReceipt, ...(moment ? { moment } : {}) }, responseHeaders);
      }

      if (path.endsWith('/controlled-sandbox-run')) {
        if (method !== 'POST') return response(405, { error: 'method not allowed' }, responseHeaders);
        if (typeof runControlledSandbox !== 'function') return unavailable('controlled sandbox runner', responseHeaders);
        const body = parseBody(event.body);
        requiredEntitlementForScenario(body.scenario);
        if (!authorizeScenarioDecision(membership, body.scenario).allowed) return forbidden('controlled sandbox run', responseHeaders);
        const result = await runControlledSandbox({
          tenantId: identity.tenantHint, scenario: body.scenario,
          requestId: event.requestContext?.requestId || identity.subject,
        });
        return response(200, { ...result, serverAuthoritative: true }, responseHeaders);
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

function parseProtocolApprovalPath(path) {
  const matched = path.match(/\/growth-plays\/protocols\/([A-Za-z0-9][A-Za-z0-9_.:@-]{1,255})\/approvals$/);
  return matched ? { decisionProtocolId: matched[1] } : null;
}

function parseSkillApprovalPath(path) {
  const matched = path.match(/\/skills\/shadows\/([A-Za-z0-9][A-Za-z0-9_.:@-]{1,255})\/([A-Za-z0-9][A-Za-z0-9_.:@-]{0,79})\/approvals$/);
  return matched ? { skillId: matched[1], version: matched[2] } : null;
}

function parseSkillTransitionPath(path) {
  const matched = path.match(/\/skills\/shadows\/([A-Za-z0-9][A-Za-z0-9_.:@-]{1,255})\/([A-Za-z0-9][A-Za-z0-9_.:@-]{0,79})\/transitions$/);
  return matched ? { skillId: matched[1], version: matched[2] } : null;
}

function parseConnectionTransitionPath(path) {
  const matched = path.match(/\/connections\/([A-Za-z0-9][A-Za-z0-9_.:@-]{1,255})\/(test|approve|activate|revoke)$/);
  if (!matched) return null;
  return {
    mappingId: matched[1],
    targetStatus: { test: 'tested', approve: 'approved', activate: 'active', revoke: 'disabled' }[matched[2]],
  };
}

function unavailable(label, headers) {
  return response(503, { error: `${label} is unavailable` }, headers);
}

function forbidden(label, headers) {
  return response(403, { error: `${label} is not authorized for this member` }, headers);
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
