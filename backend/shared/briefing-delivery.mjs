import assert from 'node:assert/strict';
import { validateTenantId } from './tenant-context.mjs';

const ROLES = new Set(['executive', 'consumer_growth', 'wealth_growth']);
const CHANNELS = new Map([
  ['console', { connector: 'bank_workbench', destination: 'growth_console_briefing' }],
  ['teams', { connector: 'microsoft_teams', destination: 'teams_adaptive_card' }],
  ['outlook', { connector: 'microsoft_outlook', destination: 'outlook_actionable_message' }],
]);

export function buildBriefingDelivery(input) {
  validateBriefingInput(input);
  const route = CHANNELS.get(input.channel);
  const decisionIds = [...new Set(input.decisionIds)];
  const primaryDecisionId = decisionIds[0];
  return {
    tenantId: input.tenantId,
    idempotencyKey: `${input.briefingId}_${input.channel}_${input.role}`,
    connector: route.connector,
    destination: route.destination,
    decisionId: primaryDecisionId,
    actionId: `briefing_${input.role}`,
    sessionId: input.requestedBySessionId,
    requestedAt: input.generatedAt,
    payload: {
      schema_version: 1,
      briefing_id: input.briefingId,
      role: input.role,
      decision_ids: decisionIds,
      title: input.title,
      counts: {
        needs_review: input.counts.needsReview,
        routed: input.counts.routed,
        outcomes_observed: input.counts.outcomesObserved,
      },
      console_path: `/app/briefings?role=${input.role}`,
    },
  };
}

function validateBriefingInput(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'briefing input must be an object');
  validateTenantId(input.tenantId);
  assertIdentifier(input.briefingId, 'briefingId');
  assert.ok(ROLES.has(input.role), 'briefing role is unsupported');
  assert.ok(CHANNELS.has(input.channel), 'briefing channel is unsupported');
  assertIdentifier(input.requestedBySessionId, 'requestedBySessionId');
  assertIsoDate(input.generatedAt, 'generatedAt');
  assert.ok(typeof input.title === 'string' && input.title.length >= 3 && input.title.length <= 160, 'title is invalid');
  assert.ok(Array.isArray(input.decisionIds) && input.decisionIds.length >= 1 && input.decisionIds.length <= 20, 'decisionIds must contain 1-20 decisions');
  input.decisionIds.forEach((decisionId) => assertIdentifier(decisionId, 'decisionId'));
  assert.ok(input.counts && typeof input.counts === 'object' && !Array.isArray(input.counts), 'counts are required');
  for (const field of ['needsReview', 'routed', 'outcomesObserved']) {
    assert.ok(Number.isInteger(input.counts[field]) && input.counts[field] >= 0, `counts.${field} is invalid`);
  }
}

function assertIdentifier(value, label) {
  assert.ok(
    typeof value === 'string' && /^[A-Za-z0-9_-]{2,256}$/.test(value),
    `${label} is invalid`,
  );
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}
