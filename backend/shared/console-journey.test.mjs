import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDecisionPackage, buildDecisionPackageV12, createConsoleJourneyRepository, projectMoment, projectMoments } from './console-journey.mjs';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';

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

test('Decision Package v1.2 has a stable immutable digest and excludes mutable receipts', () => {
  const legacy = buildDecisionPackage(decision);
  const first = buildDecisionPackageV12(legacy, decision);
  const second = buildDecisionPackageV12({ ...legacy, response: { status: 'accepted' } }, decision);
  assert.equal(first.schemaVersion, '1.2');
  assert.match(first.packageDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(first.packageDigest, second.packageDigest);
  assert.equal('response' in first, false);
  assert.equal('outcome' in first, false);
  assert.equal(first.subject.scope, 'customer');
  assert.equal(first.moment.confidenceBand, 'high');
  assert.equal(first.recommendation.actionCatalogVersion, 'deposit-retention-v1');
  assert.equal(first.governance.approvalStatus, 'not_attested');
  assert.equal(first.decisionMethod.runtimeType, 'deterministic');
  assert.equal(first.workflowIntent.ownerRole, 'Relationship banker');
});

test('approved runtime binds the Decision Package to the exact protocol, action, and measurement contract', () => {
  const contract = approvedDepositContract();
  const approvedDecision = {
    ...decision,
    source: { mode: 'live', evidenceClass: 'sandbox', name: 'Plaid sandbox', recordCount: 2, transactionRefs: ['txn_a', 'txn_b'] },
    runtime: {
      ...decision.runtime,
      policyVersion: contract.policy.version,
      growthPlayId: contract.growth_play_id,
      businessLine: contract.business_line,
      protocolId: contract.decision_protocol_id,
      protocolDigest: contract.protocol_digest,
      protocolApprovalId: 'gpa_approved_123',
      approvedContract: contract,
      measurementPlan: {
        outcomeEventTypes: contract.measurement.outcome_event_types,
        outcomeSourceSystems: contract.measurement.outcome_source_systems,
      },
    },
  };
  const legacy = buildDecisionPackage(approvedDecision);
  const immutable = buildDecisionPackageV12(legacy, approvedDecision);
  assert.equal(legacy.growthPlay.protocolId, contract.decision_protocol_id);
  assert.equal(legacy.recommendation.selectedAction.id, 'banker_retention_review');
  assert.equal(legacy.workflow.connector, 'salesforce-fsc');
  assert.equal(immutable.governance.protocolApprovalId, 'gpa_approved_123');
  assert.equal(immutable.governance.approvalStatus, 'approved');
  assert.equal(immutable.recommendation.actionCatalogVersion, contract.decision_protocol_id);
  assert.equal(immutable.workflowIntent.destination, 'fsc_task');
  assert.deepEqual(immutable.measurementPlan.outcomeEventTypes, ['deposit_balance_observed']);
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

test('a terminal configuration failure receives one separate, server-derived retry key', async () => {
  const packageProjection = buildDecisionPackage(decision);
  const records = [
    row(1, 'decision', { decision_id: decision.decisionId, scenario: decision.scenario, source: decision.source, opportunity: decision.opportunity, policy: decision.policy, runtime: decision.runtime, decision_package: packageProjection }),
    row(2, 'response', { decision_id: decision.decisionId, actor_id: 'operator_1', response: { status: 'accepted', actionId: 'banker-retention-review' } }),
    row(3, 'activation', { decision_id: decision.decisionId, delivery_id: 'dlv_1234567890abcdef12345678', delivery_status: 'failed' }),
  ];
  const reservationCalls = [];
  const repository = createConsoleJourneyRepository({
    getDB: async () => ({ connect: async () => {}, end: async () => {} }),
    ledgerRepository: { async append() { return { record: row(4, 'activation', { decision_id: decision.decisionId, delivery_id: 'dlv_abcdef1234567890abcdef12', delivery_status: 'pending' }) }; } },
    deliveryRepository: { async reserve(request) { reservationCalls.push(request); return { replayed: false, record: { delivery_id: 'dlv_abcdef1234567890abcdef12', status: 'pending', connector: 'salesforce', destination: 'salesforce-fsc', action_id: request.actionId } }; }, async complete() { throw new Error('should not complete'); } },
  });
  repository.loadMoment = async () => projectMoment(records);
  await repository.reserveDelivery({
    tenantId: decision.tenantId,
    decisionId: decision.decisionId,
    sessionId: 'session_1',
    idempotencyKey: 'browser_delivery_retry_2',
    expectedState: 'delivery_failed',
    requestedAt: '2026-07-30T12:06:00.000Z',
  });
  assert.equal(reservationCalls[0].idempotencyKey, `delivery-retry:${decision.decisionId}:banker-retention-review`);
});

test('a connected Moment cannot be delivered after its protocol is revoked', async () => {
  const contract = approvedDepositContract();
  const approvedDecision = {
    ...decision,
    source: { mode: 'live', evidenceClass: 'sandbox', name: 'Plaid sandbox', recordCount: 2, transactionRefs: ['txn_a', 'txn_b'] },
    runtime: {
      ...decision.runtime,
      protocolId: contract.decision_protocol_id,
      protocolApprovalId: 'gpa_approved_123',
      approvedContract: contract,
    },
  };
  const packageProjection = buildDecisionPackage(approvedDecision);
  const records = [
    row(1, 'decision', {
      decision_id: approvedDecision.decisionId,
      scenario: approvedDecision.scenario,
      source: approvedDecision.source,
      opportunity: approvedDecision.opportunity,
      policy: approvedDecision.policy,
      runtime: approvedDecision.runtime,
      decision_package: packageProjection,
    }),
    row(2, 'response', {
      decision_id: approvedDecision.decisionId,
      actor_id: 'operator_1',
      response: { status: 'accepted', actionId: 'banker_retention_review' },
    }),
  ];
  let reserveCalled = false;
  const repository = createConsoleJourneyRepository({
    getDB: async () => ({ connect: async () => {}, end: async () => {} }),
    ledgerRepository: { async append() { throw new Error('should not append'); } },
    deliveryRepository: {
      async reserve() { reserveCalled = true; throw new Error('should not reserve'); },
      async complete() { throw new Error('should not complete'); },
    },
    protocolRegistry: {
      async requireApproved() {
        throw new Error('Growth Play protocol is not approved at run time');
      },
    },
  });
  repository.loadMoment = async () => projectMoment(records);
  await assert.rejects(() => repository.reserveDelivery({
    tenantId: approvedDecision.tenantId,
    decisionId: approvedDecision.decisionId,
    sessionId: 'session_1',
    idempotencyKey: 'browser_delivery_request_1',
    expectedState: 'approved',
    requestedAt: '2026-07-30T12:05:00.000Z',
  }), /not approved at run time/);
  assert.equal(reserveCalled, false);
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

function approvedDepositContract() {
  return compileGrowthPlayContract({
    contract_version: '1.0',
    growth_play_id: 'deposit-primacy-defense',
    version: '1.0.0',
    business_line: 'consumer-banking',
    objective: 'Retain primary deposit relationships through governed banker review',
    source: {
      receipt_source_systems: ['plaid_custom_user'],
      schema_versions: ['plaid-transactions-1'],
      record_sources: [{ source_system: 'deposit_core', allowed_rails: ['ach', 'card', 'p2p', 'wire'] }],
    },
    eligibility: { criteria_version: 'deposit-primacy-eligibility-v1' },
    policy: { version: 'mvp-policy-v1', required_policy_ids: ['consent', 'eligibility', 'vulnerability'] },
    actions: [{
      action_id: 'banker_retention_review',
      owner_role: 'relationship_banker',
      connector: 'salesforce-fsc',
      destination: 'fsc_task',
      destination_environment: 'sandbox',
    }],
    measurement: {
      metric: 'deposit_retained',
      outcome_event_types: ['deposit_balance_observed'],
      outcome_source_systems: ['deposit_core_sandbox'],
      outcome_window_days: 31,
      holdout_pct: 10,
      minimum_per_arm: 30,
      minimum_coverage: 0.9,
    },
  });
}

function row(sequenceNumber, eventType, payload) {
  return {
    sequence_number: sequenceNumber,
    event_type: eventType,
    payload,
    occurred_at: `2026-07-30T12:0${sequenceNumber}:00.000Z`,
    recorded_at: `2026-07-30T12:0${sequenceNumber}:00.000Z`,
  };
}
