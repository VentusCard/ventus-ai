import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDeliveryReservation } from './connector-delivery.mjs';
import { assignExperiment, validateOutcomeEvent } from './experiment-measurement.mjs';
import { createPilotOperatingLoop } from './pilot-operating-loop.mjs';

const SALT = 'pilot-operating-loop-assignment-salt';
const ASSIGNED_AT = '2026-07-12T12:00:00.000Z';
const RUN_AT = '2026-07-12T12:01:00.000Z';
const OUTCOME_AT = '2026-08-12T12:00:00.000Z';

test('wealth loop runs source-to-receipt once, preserves holdout, and measures only as sandbox evidence', async () => {
  const state = createState();
  const loop = createLoop(state);
  const treatmentInput = wealthInput(tokenForArm('treatment'), 'wealth_treatment');
  const holdoutInput = wealthInput(tokenForArm('holdout'), 'wealth_holdout');

  const treatment = await loop.runHousehold(treatmentInput);
  const replay = await loop.runHousehold(treatmentInput);
  const holdout = await loop.runHousehold(holdoutInput);

  assert.equal(treatment.assignment.arm, 'treatment');
  assert.equal(treatment.activation, 'delivered');
  assert.equal(treatment.evidenceClass, 'sandbox');
  assert.equal(treatment.businessClaimAllowed, false);
  assert.equal(replay.activation, 'delivered');
  assert.equal(state.deliveryCalls, 1, 'replay must not create a second downstream action');
  assert.equal(holdout.assignment.arm, 'holdout');
  assert.equal(holdout.activation, 'holdout');
  assert.equal(state.deliveryCalls, 1, 'holdout must not call a connector');
  assert.ok(
    state.trace.indexOf(`assignment:${treatment.householdToken}`) < state.trace.indexOf(`deliver:${treatment.decisionId}`),
    'assignment must be persisted before activation',
  );
  assert.ok(state.ledger.some((event) => event.eventType === 'enrich' && event.payload.evidence_class === 'sandbox'));
  assert.ok(state.ledger.some((event) => event.eventType === 'activation' && event.status === 'confirmed'));

  await loop.recordOutcome(outcomeEvent(treatment, 200));
  await loop.recordOutcome(outcomeEvent(holdout, 100));
  const measurement = await loop.measureExperiment({
    tenantId: 'bank_1',
    experimentId: 'wealth_pilot_01',
    metric: 'net_new_assets',
    minimumPerArm: 1,
    minimumCoverage: 1,
  });
  assert.equal(measurement.status, 'measured');
  assert.equal(measurement.absoluteLift, 100);
  assert.equal(measurement.evidenceClass, 'sandbox');
  assert.equal(measurement.businessClaimAllowed, false);
  assert.equal(measurement.causalClaimAllowed, false);
  assert.ok(state.ledger.filter((event) => event.eventType === 'outcome').every((event) => event.status === 'simulated'));
});

test('deposit loop reaches a banker workbench action through the same institution-neutral contract', async () => {
  const state = createState();
  const loop = createLoop(state);
  const input = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'deposit_treatment');
  const result = await loop.runHousehold(input);
  assert.equal(result.growthPlayId, 'deposit-primacy-defense');
  assert.equal(result.decision.actionId, 'banker_retention_review');
  assert.equal(result.decision.connector, 'bank_workbench');
  assert.equal(result.activation, 'delivered');
  assert.equal(state.deliveryCalls, 1);
});

test('blocking policy suppresses before assignment or connector delivery', async () => {
  const state = createState();
  const loop = createLoop(state);
  const input = wealthInput(tokenForArm('treatment'), 'wealth_blocked');
  input.policies = input.policies.map((policy) => (
    policy.policy_id === 'consent' ? { ...policy, verdict: 'block' } : policy
  ));
  const result = await loop.runHousehold(input);
  assert.equal(result.activation, 'suppressed');
  assert.equal(result.assignment, null);
  assert.equal(state.assignments.length, 0);
  assert.equal(state.deliveryCalls, 0);
});

test('synthetic evidence cannot activate and fabricated evidence cannot enter the ledger', async () => {
  const state = createState();
  const loop = createLoop(state);
  const synthetic = wealthInput(tokenForArm('treatment'), 'synthetic_activation');
  synthetic.sourceReceipt.evidenceClass = 'synthetic';
  await assert.rejects(() => loop.runHousehold(synthetic), /synthetic evidence cannot activate/);

  const directPii = wealthInput(tokenForArm('treatment'), 'direct_pii');
  directPii.activationMode = 'shadow';
  directPii.records[0].customer_name = 'Prohibited person name';
  await assert.rejects(() => loop.runHousehold(directPii), /direct PII field customer_name is prohibited/);

  const unsafe = createPilotOperatingLoop({
    ...dependencies(state),
    detector: async () => ({
      ...wealthDecision(false),
      evidence: [{ transaction_id: 'tx_fabricated', signal_type: 'liquidity_event', summary: 'Invented' }],
    }),
  });
  await assert.rejects(
    () => unsafe.runHousehold(wealthInput(tokenForArm('treatment'), 'fabricated_evidence')),
    /is not in the source records/,
  );
});

function createLoop(state) {
  return createPilotOperatingLoop({
    ...dependencies(state),
    detector: async ({ objective, policies }) => {
      const blocked = policies.some((policy) => policy.verdict === 'block');
      return objective.includes('deposit') ? depositDecision(blocked) : wealthDecision(blocked);
    },
  });
}

function dependencies(state) {
  return {
    ledgerRepository: {
      async append(draft) {
        const existing = state.ledger.find((event) => event.tenantId === draft.tenantId && event.idempotencyKey === draft.idempotencyKey);
        if (existing) return { inserted: false, record: existing };
        state.ledger.push(draft);
        state.trace.push(`ledger:${draft.idempotencyKey}`);
        return { inserted: true, record: draft };
      },
    },
    measurementRepository: {
      async recordAssignment(assignment) {
        const existing = state.assignments.find((item) => (
          item.tenantId === assignment.tenantId
          && item.experimentId === assignment.experimentId
          && item.householdToken === assignment.householdToken
        ));
        if (!existing) {
          state.assignments.push(assignment);
          state.trace.push(`assignment:${assignment.householdToken}`);
        }
        return existing ?? assignment;
      },
      async recordOutcome(event) {
        const assignment = state.assignments.find((item) => (
          item.tenantId === event.tenant_id
          && item.experimentId === event.assignment.experiment_id
          && item.householdToken === event.household_token
        ));
        validateOutcomeEvent(event, assignment);
        const existing = state.outcomes.find((item) => item.event_id === event.event_id && item.tenant_id === event.tenant_id);
        if (!existing) state.outcomes.push(event);
        return { inserted: !existing, record: existing ?? event };
      },
      async loadExperiment({ tenantId, experimentId }) {
        return {
          assignments: state.assignments.filter((item) => item.tenantId === tenantId && item.experimentId === experimentId),
          outcomes: state.outcomes.filter((item) => item.tenant_id === tenantId && item.assignment.experiment_id === experimentId),
        };
      },
    },
    deliveryRepository: {
      async reserve(request) {
        const built = buildDeliveryReservation(request);
        const existing = state.receipts.find((item) => item.tenant_id === request.tenantId && item.idempotency_key === request.idempotencyKey);
        if (existing) {
          assert.equal(existing.request_hash, built.requestHash);
          return { inserted: false, shouldDeliver: false, replayed: true, reconciliationRequired: existing.status === 'pending', record: existing };
        }
        const record = {
          tenant_id: request.tenantId,
          delivery_id: built.deliveryId,
          idempotency_key: request.idempotencyKey,
          request_hash: built.requestHash,
          status: 'pending',
        };
        state.receipts.push(record);
        state.trace.push(`reservation:${request.decisionId}`);
        return { inserted: true, shouldDeliver: true, replayed: false, reconciliationRequired: false, record };
      },
      async complete(result) {
        const record = state.receipts.find((item) => item.tenant_id === result.tenantId && item.delivery_id === result.deliveryId);
        assert.ok(record);
        if (record.status === 'pending') {
          record.status = result.status;
          record.external_receipt_id = result.externalReceiptId;
          record.error_code = result.errorCode;
        }
        return { updated: true, record };
      },
    },
    async deliver({ decision }) {
      state.deliveryCalls += 1;
      state.trace.push(`deliver:${decision.decisionId}`);
      return {
        status: 'delivered',
        externalReceiptId: `external_${decision.decisionId}`,
        externalReceiptUrl: `https://sandbox.example.test/${decision.decisionId}`,
        completedAt: '2026-07-12T12:01:02.000Z',
      };
    },
  };
}

function wealthInput(householdToken, caseId) {
  return baseInput({
    householdToken,
    caseId,
    objective: 'Convert qualified liquidity into net new assets',
    experimentId: 'wealth_pilot_01',
    records: [
      record('tx_liquidity', 'wire', 250000, 'deposit_core'),
      record('tx_relationship', 'ach', 6200, 'relationship_core'),
    ],
  });
}

function depositInput(householdToken, caseId) {
  return baseInput({
    householdToken,
    caseId,
    objective: 'Retain primary deposit relationships',
    experimentId: 'deposit_pilot_01',
    records: [
      record('tx_payroll', 'ach', 4800, 'deposit_core'),
      record('tx_outflow', 'p2p', -2100, 'payments_core'),
    ],
  });
}

function baseInput({ householdToken, caseId, objective, experimentId, records }) {
  return {
    tenantId: 'bank_1',
    caseId,
    householdToken,
    objective,
    runAt: RUN_AT,
    activationMode: 'sandbox_assisted',
    destinationEnvironment: 'sandbox',
    sessionId: 'session_pilot_001',
    records,
    sourceReceipt: {
      receiptId: `receipt_${caseId}`,
      sourceSystem: 'partner_sandbox',
      batchId: 'batch_001',
      schemaVersion: '1.0',
      recordCount: records.length,
      receivedAt: RUN_AT,
      evidenceClass: 'sandbox',
    },
    policyVersion: 'policy_1',
    policies: [
      { policy_id: 'consent', verdict: 'clear' },
      { policy_id: 'vulnerability', verdict: 'clear' },
      { policy_id: 'eligibility', verdict: 'clear' },
    ],
    experiment: { experimentId, holdoutPct: 10, assignmentSalt: SALT, assignedAt: ASSIGNED_AT },
  };
}

function wealthDecision(blocked) {
  return {
    growthPlayId: 'liquidity-to-wealth',
    abstain: blocked,
    abstainReason: blocked ? 'Consent policy blocks activation.' : null,
    confidence: 0.94,
    evidence: [
      { transaction_id: 'tx_liquidity', signal_type: 'liquidity_event', summary: 'Large on-bank liquidity event.' },
      { transaction_id: 'tx_relationship', signal_type: 'relationship_depth', summary: 'Established banking relationship without wealth coverage.' },
    ],
    actionId: blocked ? null : 'warm_wealth_referral',
    ownerRole: blocked ? null : 'relationship_banker',
    connector: blocked ? null : 'salesforce',
    destination: blocked ? null : 'salesforce_fsc_task',
    cohort: blocked ? null : 'qualified_liquidity_no_advisor',
    deliveryPayload: blocked ? null : { household_token: 'tok_placeholder_000001', action: 'warm_wealth_referral' },
  };
}

function depositDecision(blocked) {
  return {
    growthPlayId: 'deposit-primacy-defense',
    abstain: blocked,
    abstainReason: blocked ? 'Consent policy blocks activation.' : null,
    confidence: 0.91,
    evidence: [
      { transaction_id: 'tx_payroll', signal_type: 'payroll_present', summary: 'Payroll remains on-bank.' },
      { transaction_id: 'tx_outflow', signal_type: 'offbank_outflow_acceleration', summary: 'External outflow accelerated.' },
    ],
    actionId: blocked ? null : 'banker_retention_review',
    ownerRole: blocked ? null : 'relationship_banker',
    connector: blocked ? null : 'bank_workbench',
    destination: blocked ? null : 'banker_workbench',
    cohort: blocked ? null : 'primary_deposit_at_risk',
    deliveryPayload: blocked ? null : { household_token: 'tok_placeholder_000002', action: 'banker_retention_review' },
  };
}

function record(transactionId, rail, amount, sourceSystem) {
  return {
    transaction_id: transactionId,
    rail,
    amount,
    source_system: sourceSystem,
    occurred_at: '2026-07-10T00:00:00.000Z',
    entity: 'tokenized_counterparty',
    category: 'evaluation_category',
    merchant_name: 'Tokenized Merchant',
  };
}

function outcomeEvent(result, amount) {
  return {
    contract_version: '1.0',
    event_id: `event_${result.caseId}`,
    tenant_id: result.tenantId,
    household_token: result.householdToken,
    growth_play_id: 'liquidity-to-wealth',
    decision_id: result.decisionId,
    activation_id: result.receipt?.delivery_id ?? null,
    event_type: 'assets_transferred',
    occurred_at: OUTCOME_AT,
    assignment: {
      experiment_id: result.assignment.experimentId,
      arm: result.assignment.arm,
      assigned_at: result.assignment.assignedAt,
    },
    value: { metric: 'net_new_assets', amount, currency: 'USD' },
    source_system: 'wealth_core_sandbox',
    source_record_id: null,
    reason_code: null,
  };
}

function tokenForArm(arm, experimentId = 'wealth_pilot_01') {
  for (let index = 0; index < 1000; index += 1) {
    const householdToken = `tok_household_${String(index).padStart(8, '0')}`;
    const assignment = assignExperiment({
      tenantId: 'bank_1',
      experimentId,
      householdToken,
      holdoutPct: 10,
      salt: SALT,
      evidenceClass: 'sandbox',
      assignedAt: ASSIGNED_AT,
    });
    if (assignment.arm === arm) return householdToken;
  }
  throw new Error(`could not find ${arm} token`);
}

function createState() {
  return { ledger: [], assignments: [], outcomes: [], receipts: [], trace: [], deliveryCalls: 0 };
}
