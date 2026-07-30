import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDecisionPackage, createConsoleJourneyRepository, projectMoment, projectMoments } from './console-journey.mjs';

const decision = {
  schemaVersion: 'ventus.decision-run.v1',
  decisionId: 'dec_1234567890abcdef',
  tenantId: 'pilot_bank',
  scenario: 'deposit-retention',
  generatedAt: '2026-07-30T12:00:00.000Z',
  source: { mode: 'sandbox', name: 'Plaid sandbox', recordCount: 2, transactionRefs: ['txn_a', 'txn_b'] },
  runtime: { engine: 'deterministic-baseline', version: 'plaid-rules-v1', policyVersion: 'mvp-policy-v1', modelInvocation: null },
  opportunity: {
    type: 'Checking primacy at risk',
    reason: 'Direct deposit is anchored here, but spend is moving off-bank.',
    confidence: 88,
    signals: [{ type: 'payroll', label: 'Direct-deposit relationship', strength: 0.9 }],
  },
  policy: { allowed: true, reason: 'MVP policy checks cleared' },
};

test('server Decision Package retains only an opaque subject and bounded evidence', () => {
  const result = buildDecisionPackage(decision);
  assert.match(result.subject.token, /^tok_[a-f0-9]{24}$/);
  assert.equal(result.growthPlay.businessLine, 'consumer-banking');
  assert.equal(result.recommendation.selectedAction.id, 'banker-retention-review');
  assert.deepEqual(result.response, { status: 'pending' });
  assert.equal(JSON.stringify(result).includes('txn_a'), false);
});

test('Moment projection applies an append-only response and delivery reservation', () => {
  const packageProjection = buildDecisionPackage(decision);
  const moment = projectMoment([
    row(1, 'decision', {
      decision_id: decision.decisionId,
      scenario: decision.scenario,
      source: decision.source,
      opportunity: decision.opportunity,
      policy: decision.policy,
      runtime: decision.runtime,
      decision_package: packageProjection,
    }),
    row(2, 'response', {
      decision_id: decision.decisionId,
      actor_id: 'operator_1',
      response: { status: 'modified', actionId: 'specialist-relationship-review' },
    }),
    row(3, 'activation', {
      decision_id: decision.decisionId,
      delivery_id: 'dlv_1234567890abcdef12345678',
      delivery_status: 'pending',
    }),
  ]);
  assert.equal(moment.status, 'delivery_reserved');
  assert.equal(moment.decisionPackage.response.status, 'modified');
  assert.equal(moment.decisionPackage.recommendation.selectedAction.id, 'specialist-relationship-review');
  assert.equal(moment.decisionPackage.workflow.status, 'reserved');
});

test('Moment projection groups all append-only records by decision ID', () => {
  const packageProjection = buildDecisionPackage(decision);
  const moments = projectMoments([
    row(1, 'decision', { decision_id: decision.decisionId, scenario: decision.scenario, source: decision.source, opportunity: decision.opportunity, policy: decision.policy, runtime: decision.runtime, decision_package: packageProjection }),
    row(2, 'response', { decision_id: decision.decisionId, actor_id: 'operator_1', response: { status: 'deferred', reason: 'Review later' } }),
  ]);
  assert.equal(moments.length, 1);
  assert.equal(moments[0].status, 'deferred');
});

test('delivery reservation uses a server-derived decision and action key', async () => {
  const packageProjection = buildDecisionPackage(decision);
  const records = [
    row(1, 'decision', { decision_id: decision.decisionId, scenario: decision.scenario, source: decision.source, opportunity: decision.opportunity, policy: decision.policy, runtime: decision.runtime, decision_package: packageProjection }),
    row(2, 'response', { decision_id: decision.decisionId, actor_id: 'operator_1', response: { status: 'accepted', actionId: 'banker-retention-review' } }),
  ];
  const reservationCalls = [];
  const repository = createConsoleJourneyRepository({
    getDB: async () => ({ connect: async () => {}, end: async () => {} }),
    ledgerRepository: {
      async append() {
        return { record: row(3, 'activation', { decision_id: decision.decisionId, delivery_id: 'dlv_1234567890abcdef12345678', delivery_status: 'pending' }) };
      },
    },
    deliveryRepository: {
      async reserve(request) {
        reservationCalls.push(request);
        return { replayed: false, record: { delivery_id: 'dlv_1234567890abcdef12345678', status: 'pending', connector: 'salesforce', destination: 'salesforce-fsc', action_id: request.actionId } };
      },
      async complete() { throw new Error('should not complete'); },
    },
  });
  repository.loadMoment = async () => projectMoment(records);
  await repository.reserveDelivery({
    tenantId: decision.tenantId,
    decisionId: decision.decisionId,
    sessionId: 'session_1',
    idempotencyKey: 'browser_delivery_retry_1',
    expectedState: 'approved',
    requestedAt: '2026-07-30T12:05:00.000Z',
  });
  assert.equal(reservationCalls[0].idempotencyKey, `delivery:${decision.decisionId}:banker-retention-review`);
});

test('Moment projection exposes only bounded Salesforce receipt links after delivery', () => {
  const packageProjection = buildDecisionPackage(decision);
  const moment = projectMoment([
    row(1, 'decision', { decision_id: decision.decisionId, scenario: decision.scenario, source: decision.source, opportunity: decision.opportunity, policy: decision.policy, runtime: decision.runtime, decision_package: packageProjection }),
    row(2, 'response', { decision_id: decision.decisionId, actor_id: 'operator_1', response: { status: 'accepted', actionId: 'banker-retention-review' } }),
    row(3, 'activation', {
      decision_id: decision.decisionId,
      delivery_id: 'dlv_1234567890abcdef12345678',
      delivery_status: 'delivered',
      external_receipt_id: '00T123456789012EAA',
      external_receipt_url: 'https://example.my.salesforce.com/lightning/r/Task/00T123456789012EAA/view',
      external_records: {
        decision: { id: 'a01123456789012EAA', url: 'https://example.my.salesforce.com/lightning/r/Ventus_Decision__c/a01123456789012EAA/view' },
        task: { id: '00T123456789012EAA', url: 'https://example.my.salesforce.com/lightning/r/Task/00T123456789012EAA/view' },
      },
    }),
  ]);
  assert.equal(moment.status, 'activated');
  assert.equal(moment.receipt.records.task.id, '00T123456789012EAA');
  assert.equal(JSON.stringify(moment.receipt).includes('txn_a'), false);
});

function row(sequenceNumber, eventType, payload) {
  return {
    sequence_number: sequenceNumber,
    event_type: eventType,
    payload,
    occurred_at: `2026-07-30T12:0${sequenceNumber}:00.000Z`,
    recorded_at: `2026-07-30T12:0${sequenceNumber}:00.000Z`,
  };
}
