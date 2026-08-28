import assert from 'node:assert/strict';
import test from 'node:test';
import { assignConnectedExpansionExperiment } from './experiment-measurement.mjs';
import { createConnectedExpansionLoop, validateConnectedExpansionInput } from './connected-expansion-loop.mjs';

const SALT = 'connected-expansion-test-salt-2026';
const ASSIGNED_AT = '2026-07-01T00:00:00.000Z';
const RUN_AT = '2026-07-02T00:00:00.000Z';

test('standalone and connected arms evaluate different authorized data scopes', async () => {
  const state = createState();
  const loop = createLoop(state);
  const standalone = await loop.runHousehold(inputForArm('standalone'));
  const connected = await loop.runHousehold(inputForArm('connected'));

  assert.equal(standalone.assignment.arm, 'standalone');
  assert.equal(standalone.exposure.decision_evaluated, true);
  assert.equal(standalone.exposure.connected_data_used, false);
  assert.equal(standalone.activation, 'delivered');
  assert.equal(connected.assignment.arm, 'connected');
  assert.equal(connected.exposure.connected_data_used, true);
  assert.equal(connected.activation, 'delivered');
  assert.deepEqual(state.detectorCalls.map((call) => [call.dataScope, call.records.length]), [
    ['standalone', 1],
    ['connected', 2],
  ]);
  assert.ok(state.detectorCalls.every((call) => call.decisionProtocolId === 'merrill_growth_protocol_v1'));
  assert.equal(state.deliveryCalls, 2);
  assert.equal(state.exposures.length, 2);
});

test('holdout assignment bypasses detector and delivery but records non-exposure', async () => {
  const state = createState();
  const result = await createLoop(state).runHousehold(inputForArm('holdout'));
  assert.equal(result.assignment.arm, 'holdout');
  assert.equal(result.activation, 'holdout');
  assert.equal(result.decision, null);
  assert.equal(result.exposure.decision_evaluated, false);
  assert.equal(result.exposure.action_delivered, false);
  assert.equal(result.exposure.connected_data_used, false);
  assert.equal(state.detectorCalls.length, 0);
  assert.equal(state.deliveryCalls, 0);
});

test('connected expansion refuses connected prequalification and unauthorized records', () => {
  const prequalifiedWithConnectedData = inputForArm('standalone');
  prequalifiedWithConnectedData.prequalification.usedConnectedData = true;
  assert.throws(() => validateConnectedExpansionInput(prequalifiedWithConnectedData), /prequalification must not use connected data/);

  const unauthorized = inputForArm('connected');
  unauthorized.connectedRecords.push({
    transaction_id: 'tx_small_business_1',
    business_line: 'small_business',
    signal_class: 'business_cashflow',
    rail: 'ach',
  });
  assert.throws(() => validateConnectedExpansionInput(unauthorized), /business line is outside authorization/);

  const changedStandalone = inputForArm('connected');
  changedStandalone.connectedRecords[0] = { ...changedStandalone.connectedRecords[0], rail: 'wire' };
  assert.throws(() => validateConnectedExpansionInput(changedStandalone), /changed standalone evidence/);

  const expiredAtRun = inputForArm('connected');
  expiredAtRun.experiment.authorization.expiresAt = '2026-07-01T12:00:00.000Z';
  assert.throws(() => validateConnectedExpansionInput(expiredAtRun), /active at run time/);

  const assignedAfterRun = inputForArm('connected');
  assignedAfterRun.experiment.assignedAt = '2026-07-03T00:00:00.000Z';
  assert.throws(() => validateConnectedExpansionInput(assignedAfterRun), /assignment must precede the run/);

  const nestedPii = inputForArm('connected');
  nestedPii.connectedRecords[1].metadata = { customer_name: 'Prohibited identity' };
  assert.throws(() => validateConnectedExpansionInput(nestedPii), /direct PII field customer_name/);
});

test('blocking policy forces abstention while preserving assigned data-scope exposure', async () => {
  const state = createState();
  const input = inputForArm('connected');
  input.policies[0].verdict = 'block';
  const loop = createConnectedExpansionLoop({
    ...dependencies(state),
    detector: async ({ records, dataScope, decisionProtocolId }) => {
      state.detectorCalls.push({ records, dataScope, decisionProtocolId });
      return decision(records, true);
    },
  });
  const result = await loop.runHousehold(input);
  assert.equal(result.activation, 'suppressed');
  assert.equal(result.exposure.decision_evaluated, true);
  assert.equal(result.exposure.connected_data_used, true);
  assert.equal(result.exposure.action_delivered, false);
  assert.equal(state.deliveryCalls, 0);
});

function createLoop(state) {
  return createConnectedExpansionLoop({
    ...dependencies(state),
    detector: async ({ records, dataScope, decisionProtocolId }) => {
      state.detectorCalls.push({ records, dataScope, decisionProtocolId });
      return decision(records, false);
    },
  });
}

function dependencies(state) {
  return {
    ledgerRepository: {
      async append(event) {
        const existing = state.ledger.find((item) => item.tenantId === event.tenantId && item.idempotencyKey === event.idempotencyKey);
        if (!existing) state.ledger.push(event);
        return { inserted: !existing, record: existing ?? event };
      },
    },
    measurementRepository: {
      async recordAssignment(assignment) {
        const existing = state.assignments.find((item) => item.tenantId === assignment.tenantId && item.experimentId === assignment.experimentId && item.householdToken === assignment.householdToken);
        if (!existing) state.assignments.push(assignment);
        return existing ?? assignment;
      },
      async recordExposure(exposure) {
        const existing = state.exposures.find((item) => item.tenant_id === exposure.tenant_id && item.event_id === exposure.event_id);
        if (!existing) state.exposures.push(exposure);
        return { inserted: !existing, record: existing ?? exposure };
      },
      async loadExperiment({ tenantId, experimentId }) {
        return {
          assignments: state.assignments.filter((item) => item.tenantId === tenantId && item.experimentId === experimentId),
          outcomes: state.outcomes.filter((item) => item.tenant_id === tenantId && item.assignment.experiment_id === experimentId),
          exposures: state.exposures.filter((item) => item.tenant_id === tenantId && item.experiment_id === experimentId),
        };
      },
    },
    deliveryRepository: {
      async reserve(request) {
        const existing = state.receipts.find((item) => item.idempotency_key === request.idempotencyKey);
        if (existing) return { shouldDeliver: false, record: existing };
        const record = {
          delivery_id: `dlv_${request.decisionId}`,
          idempotency_key: request.idempotencyKey,
          status: 'pending',
        };
        state.receipts.push(record);
        return { shouldDeliver: true, record };
      },
      async complete(result) {
        const record = state.receipts.find((item) => item.delivery_id === result.deliveryId);
        record.status = result.status;
        record.external_receipt_id = result.externalReceiptId;
        return { record };
      },
    },
    async deliver({ decision }) {
      state.deliveryCalls += 1;
      return {
        status: 'delivered',
        externalReceiptId: `external_${decision.decisionId}`,
        completedAt: '2026-07-02T00:01:00.000Z',
      };
    },
  };
}

function inputForArm(arm) {
  const householdToken = tokenForArm(arm);
  return {
    tenantId: 'bank_1',
    caseId: `case_${arm}`,
    householdToken,
    growthPlayId: 'liquidity-to-wealth',
    objective: 'Measure whether authorized Consumer signals add Merrill NNA beyond Merrill data alone',
    ownerBusinessLine: 'wealth',
    runAt: RUN_AT,
    activationMode: 'sandbox_assisted',
    sessionId: 'session_connected_01',
    sourceReceipt: { receiptId: `receipt_${arm}`, evidenceClass: 'sandbox' },
    prequalification: {
      receiptId: `prequal_${arm}`,
      criteriaVersion: 'eligible-merrill-population-v1',
      eligible: true,
      usedConnectedData: false,
    },
    standaloneRecords: [
      { transaction_id: 'tx_merrill_relationship', business_line: 'wealth', signal_class: 'wealth_relationship', rail: 'account', merchant_name: 'Merrill relationship' },
    ],
    connectedRecords: [
      { transaction_id: 'tx_merrill_relationship', business_line: 'wealth', signal_class: 'wealth_relationship', rail: 'account', merchant_name: 'Merrill relationship' },
      { transaction_id: 'tx_consumer_liquidity', business_line: 'consumer', signal_class: 'deposit_behavior', rail: 'ach' },
    ],
    policies: [
      { policy_id: 'consent', verdict: 'clear' },
      { policy_id: 'reg_bi', verdict: 'review' },
    ],
    experiment: experiment(),
  };
}

function experiment() {
  return {
    experimentId: 'connected_growth_01',
    holdoutPct: 10,
    standalonePct: 45,
    connectedPct: 45,
    assignmentSalt: SALT,
    decisionProtocolId: 'merrill_growth_protocol_v1',
    assignedAt: ASSIGNED_AT,
    authorization: {
      scopeId: 'scope_consumer_wealth_01',
      approvedAt: '2026-06-15T00:00:00.000Z',
      expiresAt: '2026-12-31T00:00:00.000Z',
      businessLines: ['consumer', 'wealth'],
      signalClasses: ['deposit_behavior', 'wealth_relationship'],
    },
  };
}

function tokenForArm(targetArm) {
  for (let index = 0; index < 10_000; index += 1) {
    const householdToken = `tok_connected_${String(index).padStart(8, '0')}`;
    const assignment = assignConnectedExpansionExperiment({
      tenantId: 'bank_1',
      experimentId: 'connected_growth_01',
      householdToken,
      holdoutPct: 10,
      standalonePct: 45,
      connectedPct: 45,
      salt: SALT,
      decisionProtocolId: 'merrill_growth_protocol_v1',
      authorization: experiment().authorization,
      evidenceClass: 'sandbox',
      assignedAt: ASSIGNED_AT,
    });
    if (assignment.arm === targetArm) return householdToken;
  }
  throw new Error(`could not find token for ${targetArm}`);
}

function decision(records, blocked) {
  return {
    abstain: blocked,
    abstainReason: blocked ? 'Consent policy blocks activation.' : null,
    confidence: 0.9,
    evidence: [{ transaction_id: records[0].transaction_id, signal_type: records[0].signal_class }],
    actionId: blocked ? null : 'advisor_review',
    connector: blocked ? null : 'salesforce',
    destination: blocked ? null : 'cew_book_360_task',
    deliveryPayload: blocked ? null : { action: 'advisor_review' },
  };
}

function createState() {
  return { assignments: [], outcomes: [], exposures: [], receipts: [], ledger: [], detectorCalls: [], deliveryCalls: 0 };
}
