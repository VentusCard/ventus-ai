import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBriefingDelivery } from './briefing-delivery.mjs';
import { buildDeliveryReservation } from './connector-delivery.mjs';

const GENERATED_AT = '2026-07-29T20:00:00.000Z';

test('briefing delivery maps each channel onto the shared connector receipt contract', () => {
  const expected = {
    console: ['bank_workbench', 'growth_console_briefing'],
    teams: ['microsoft_teams', 'teams_adaptive_card'],
    outlook: ['microsoft_outlook', 'outlook_actionable_message'],
  };
  for (const [channel, [connector, destination]] of Object.entries(expected)) {
    const delivery = buildBriefingDelivery(input({ channel }));
    assert.equal(delivery.connector, connector);
    assert.equal(delivery.destination, destination);
    assert.equal(delivery.payload.briefing_id, 'briefing_week_31');
    assert.deepEqual(delivery.payload.decision_ids, ['decision_001', 'decision_002']);
    assert.doesNotThrow(() => buildDeliveryReservation(delivery));
  }
});

test('briefing delivery is deterministic and deduplicates decision references', () => {
  const delivery = buildBriefingDelivery(input({
    decisionIds: ['decision_001', 'decision_001', 'decision_002'],
  }));
  const first = buildDeliveryReservation(delivery);
  const second = buildDeliveryReservation(buildBriefingDelivery(input({
    decisionIds: ['decision_001', 'decision_001', 'decision_002'],
  })));
  assert.deepEqual(delivery.payload.decision_ids, ['decision_001', 'decision_002']);
  assert.equal(first.deliveryId, second.deliveryId);
  assert.equal(first.requestHash, second.requestHash);
});

test('briefing delivery rejects unsupported roles, channels, and empty decisions', () => {
  assert.throws(() => buildBriefingDelivery(input({ role: 'advisor' })), /role is unsupported/);
  assert.throws(() => buildBriefingDelivery(input({ channel: 'slack' })), /channel is unsupported/);
  assert.throws(() => buildBriefingDelivery(input({ decisionIds: [] })), /decisionIds/);
});

function input(overrides = {}) {
  return {
    tenantId: 'bank_1',
    briefingId: 'briefing_week_31',
    role: 'executive',
    channel: 'console',
    requestedBySessionId: 'session_operator_1',
    generatedAt: GENERATED_AT,
    title: 'Three decisions need attention',
    decisionIds: ['decision_001', 'decision_002'],
    counts: {
      needsReview: 3,
      routed: 2,
      outcomesObserved: 1,
    },
    ...overrides,
  };
}
