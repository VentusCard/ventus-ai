import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { buildDeliveryReservation } from './connector-delivery.mjs';
import { assignExperiment, validateOutcomeEvent } from './experiment-measurement.mjs';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { createPilotOperatingLoop } from './pilot-operating-loop.mjs';
import { standaloneGrowthPlayDetector } from './standalone-growth-play-detectors.mjs';

const SALT = 'pilot-operating-loop-assignment-salt';
const SOURCE_AT = '2026-07-12T11:58:00.000Z';
const ELIGIBILITY_AT = '2026-07-12T11:59:00.000Z';
const ASSIGNED_AT = '2026-07-12T12:00:00.000Z';
const RUN_AT = '2026-07-12T12:01:00.000Z';
const ACTIVATED_AT = '2026-07-12T12:02:00.000Z';
const OUTCOME_AT = '2026-08-12T12:00:00.000Z';
const playDrafts = JSON.parse(readFileSync(new URL('../../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const DEPOSIT_PLAY = testPlay(playDrafts.find((play) => play.growth_play_id === 'deposit-primacy-defense'));
const MERRILL_PLAY = testPlay(playDrafts.find((play) => play.growth_play_id === 'merrill-relationship-growth'));

test('Consumer loop runs source-to-receipt once, preserves holdout, and measures only as sandbox evidence', async () => {
  const state = createState();
  const loop = createLoop(state);
  const treatmentInput = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'deposit_treatment');
  const holdoutInput = depositInput(tokenForArm('holdout', 'deposit_pilot_01'), 'deposit_holdout');

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
  assert.equal(holdout.decision, null, 'holdout must bypass decisioning');
  assert.equal(state.detectorCalls, 2, 'only the treatment run and its replay should invoke the detector');
  assert.equal(state.deliveryCalls, 1, 'holdout must not call a connector');
  assert.ok(
    state.trace.indexOf(`assignment:${treatment.householdToken}`) < state.trace.indexOf(`deliver:${treatment.decisionId}`),
    'assignment must be persisted before activation',
  );
  assert.ok(state.ledger.some((event) => event.eventType === 'enrich' && event.payload.evidence_class === 'sandbox'));
  assert.ok(state.ledger.some((event) => event.eventType === 'activation' && event.status === 'confirmed'));

  await loop.recordOutcome(outcomeEvent(treatment, 200), treatmentInput.growthPlay);
  await loop.recordOutcome(outcomeEvent(holdout, 100), holdoutInput.growthPlay);
  const measurement = await loop.measureExperiment({
    tenantId: 'bank_1',
    experimentId: 'deposit_pilot_01',
    growthPlay: treatmentInput.growthPlay,
  });
  assert.equal(measurement.status, 'measured');
  assert.equal(measurement.absoluteLift, 100);
  assert.equal(measurement.evidenceClass, 'sandbox');
  assert.equal(measurement.businessClaimAllowed, false);
  assert.equal(measurement.causalClaimAllowed, false);
  assert.ok(state.ledger.filter((event) => event.eventType === 'outcome').every((event) => event.status === 'simulated'));
});

test('Merrill relationship growth runs and measures without Consumer Banking records', async () => {
  const state = createState();
  const loop = createPilotOperatingLoop({
    ...dependencies(state),
    detector: standaloneGrowthPlayDetector,
  });
  const treatmentInput = merrillRelationshipInput(
    tokenForArm('treatment', 'merrill_growth_pilot_01'),
    'merrill_growth_treatment',
  );
  const holdoutInput = merrillRelationshipInput(
    tokenForArm('holdout', 'merrill_growth_pilot_01'),
    'merrill_growth_holdout',
  );

  const treatment = await loop.runHousehold(treatmentInput);
  const holdout = await loop.runHousehold(holdoutInput);
  assert.equal(treatment.growthPlayId, 'merrill-relationship-growth');
  assert.equal(treatment.decision.actionId, 'assign_advisor_consolidation_review');
  assert.equal(treatment.decision.connector, 'salesforce');
  assert.equal(treatment.activation, 'delivered');
  assert.equal(holdout.activation, 'holdout');
  assert.ok(treatmentInput.records.every((item) => item.source_system.startsWith('merrill_')));

  await loop.recordOutcome(outcomeEvent(treatment, 275000), treatmentInput.growthPlay);
  await loop.recordOutcome(outcomeEvent(holdout, 0), holdoutInput.growthPlay);
  const measurement = await loop.measureExperiment({
    tenantId: 'bank_1',
    experimentId: 'merrill_growth_pilot_01',
    growthPlay: treatmentInput.growthPlay,
  });
  assert.equal(measurement.status, 'measured');
  assert.equal(measurement.absoluteLift, 275000);
  assert.equal(measurement.businessClaimAllowed, false);
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

test('reviewed activation preserves pre-decision assignment and delivers the exact prepared decision once', async () => {
  const state = createState();
  const loop = createLoop(state);
  const input = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'deposit_reviewed');
  input.activationMode = 'sandbox_review';

  const prepared = await loop.runHousehold(input);
  assert.equal(prepared.assignment.arm, 'treatment');
  assert.equal(prepared.activation, 'review_required');
  assert.equal(state.deliveryCalls, 0);
  assert.ok(state.ledger.some((event) => event.eventType === 'decision' && event.status === 'confirmed'));
  assert.ok(!state.ledger.some((event) => event.eventType === 'activation'));

  const activationInput = {
    tenantId: prepared.tenantId,
    decisionId: prepared.decisionId,
    sessionId: input.sessionId,
    activatedAt: ACTIVATED_AT,
    decision: prepared.decision,
  };
  const activated = await loop.activatePreparedDecision(activationInput);
  const activationIndex = state.ledger.findIndex((event) => event.eventType === 'activation');
  assert.ok(activationIndex >= 0);
  state.ledger.splice(activationIndex, 1);
  const replay = await loop.activatePreparedDecision(activationInput);

  assert.equal(activated.activation, 'delivered');
  assert.equal(replay.activation, 'delivered');
  assert.equal(state.deliveryCalls, 1, 'review replay must not create a second downstream action');
  assert.equal(
    state.ledger.filter((event) => event.eventType === 'activation').length,
    1,
    'a terminal delivery receipt must restore a missing activation event',
  );
  assert.ok(state.ledger.some((event) => (
    event.eventType === 'activation'
    && event.payload.decision_id === prepared.decisionId
    && event.status === 'confirmed'
  )));
  assert.ok(
    state.trace.indexOf(`assignment:${prepared.householdToken}`) < state.trace.indexOf(`deliver:${prepared.decisionId}`),
    'assignment must remain earlier than reviewed activation',
  );
});

test('reviewed activation rejects changed recommendations and revoked protocols before delivery', async () => {
  const state = createState();
  let activationAllowed = true;
  const base = dependencies(state);
  const loop = createPilotOperatingLoop({
    ...base,
    protocolRegistry: {
      async requireApproved(input) {
        if (!activationAllowed) throw new assert.AssertionError({ message: 'Growth Play protocol was revoked before activation' });
        return base.protocolRegistry.requireApproved(input);
      },
    },
    detector: async ({ householdToken }) => depositDecision(false, householdToken),
  });
  const input = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'deposit_review_controls');
  input.activationMode = 'sandbox_review';
  const prepared = await loop.runHousehold(input);

  await assert.rejects(
    () => loop.activatePreparedDecision({
      tenantId: prepared.tenantId,
      decisionId: prepared.decisionId,
      sessionId: input.sessionId,
      activatedAt: ACTIVATED_AT,
      decision: {
        ...prepared.decision,
        deliveryPayload: { ...prepared.decision.deliveryPayload, action: 'changed_after_review' },
      },
    }),
    /prepared decision content does not match/,
  );
  assert.equal(state.deliveryCalls, 0);

  activationAllowed = false;
  await assert.rejects(
    () => loop.activatePreparedDecision({
      tenantId: prepared.tenantId,
      decisionId: prepared.decisionId,
      sessionId: input.sessionId,
      activatedAt: ACTIVATED_AT,
      decision: prepared.decision,
    }),
    /revoked before activation/,
  );
  assert.equal(state.deliveryCalls, 0);
});

test('blocking policy suppresses before assignment or connector delivery', async () => {
  const state = createState();
  const loop = createLoop(state);
  const input = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'deposit_blocked');
  input.policies = input.policies.map((policy) => (
    policy.policy_id === 'consent' ? { ...policy, verdict: 'block' } : policy
  ));
  const result = await loop.runHousehold(input);
  assert.equal(result.activation, 'suppressed');
  assert.equal(result.assignment, null);
  assert.equal(state.assignments.length, 0);
  assert.equal(state.deliveryCalls, 0);
  assert.equal(state.detectorCalls, 0, 'blocking policy should suppress before model decisioning');
});

test('a treatment abstention remains assigned for intention-to-treat measurement', async () => {
  const state = createState();
  const loop = createPilotOperatingLoop({
    ...dependencies(state),
    detector: async ({ householdToken }) => depositDecision(true, householdToken),
  });
  const input = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'treatment_abstention');
  const result = await loop.runHousehold(input);
  assert.equal(result.assignment.arm, 'treatment');
  assert.equal(result.activation, 'suppressed');
  assert.equal(state.assignments.length, 1);
  assert.equal(state.deliveryCalls, 0);
});

test('synthetic evidence cannot activate and fabricated evidence cannot enter the ledger', async () => {
  const state = createState();
  const loop = createLoop(state);
  const synthetic = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'synthetic_activation');
  synthetic.sourceReceipt.evidenceClass = 'synthetic';
  await assert.rejects(() => loop.runHousehold(synthetic), /synthetic evidence cannot activate/);

  const directPii = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'direct_pii');
  directPii.activationMode = 'shadow';
  directPii.records[0].customer_name = 'Prohibited person name';
  await assert.rejects(() => loop.runHousehold(directPii), /direct PII field customer_name is prohibited/);

  const unsafe = createPilotOperatingLoop({
    ...dependencies(state),
    detector: async () => ({
      ...depositDecision(false, 'tok_household_000001'),
      evidence: [{ transaction_id: 'tx_fabricated', signal_type: 'liquidity_event', summary: 'Invented' }],
    }),
  });
  await assert.rejects(
    () => unsafe.runHousehold(depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'fabricated_evidence')),
    /is not in the source records/,
  );
});

test('compiled Growth Play blocks misrouted households and unapproved actions before delivery', async () => {
  const misroutedState = createState();
  const misrouted = createPilotOperatingLoop({
    ...dependencies(misroutedState),
    detector: async ({ householdToken }) => depositDecision(false, `${householdToken}_wrong`),
  });
  await assert.rejects(
    () => misrouted.runHousehold(depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'misrouted_household')),
    /delivery household token does not match/,
  );
  assert.equal(misroutedState.deliveryCalls, 0);
  assert.equal(misroutedState.assignments.length, 1, 'failed treatment decision remains in the assigned population');
  assert.ok(misroutedState.ledger.some((event) => event.status === 'failed' && event.payload.error_code === 'detector_or_contract_failure'));

  const actionState = createState();
  const unapprovedAction = createPilotOperatingLoop({
    ...dependencies(actionState),
    detector: async ({ householdToken }) => ({
      ...depositDecision(false, householdToken),
      actionId: 'invented_offer',
      deliveryPayload: { household_token: householdToken, action: 'invented_offer' },
    }),
  });
  await assert.rejects(
    () => unapprovedAction.runHousehold(depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'unapproved_action')),
    /action invented_offer is not approved/,
  );
  assert.equal(actionState.deliveryCalls, 0);
  assert.equal(actionState.assignments.length, 1);
  assert.ok(actionState.ledger.some((event) => event.status === 'failed'));
});

test('operating evidence chronology fails closed before assignment', async () => {
  const state = createState();
  const loop = createLoop(state);
  const input = depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'invalid_chronology');
  input.eligibilityReceipt.evaluatedAt = RUN_AT;
  await assert.rejects(() => loop.runHousehold(input), /eligibility must predate assignment/);
  assert.equal(state.assignments.length, 0);
  assert.equal(state.deliveryCalls, 0);
});

test('an unapproved or revoked protocol fails before evidence, decisioning, or delivery', async () => {
  const state = createState();
  const loop = createPilotOperatingLoop({
    ...dependencies(state),
    protocolRegistry: {
      async requireApproved() {
        throw new assert.AssertionError({ message: 'Growth Play protocol is not approved at run time' });
      },
    },
    detector: async ({ householdToken }) => depositDecision(false, householdToken),
  });
  await assert.rejects(
    () => loop.runHousehold(depositInput(tokenForArm('treatment', 'deposit_pilot_01'), 'revoked_protocol')),
    /not approved at run time/,
  );
  assert.equal(state.ledger.length, 0);
  assert.equal(state.assignments.length, 0);
  assert.equal(state.deliveryCalls, 0);
  assert.equal(state.detectorCalls, 0);
});

function createLoop(state) {
  return createPilotOperatingLoop({
    ...dependencies(state),
    detector: async ({ objective, policies, householdToken }) => {
      state.detectorCalls += 1;
      const blocked = policies.some((policy) => policy.verdict === 'block');
      return objective.includes('deposit') ? depositDecision(blocked, householdToken) : merrillRelationshipDecision(blocked, householdToken);
    },
  });
}

function dependencies(state) {
  return {
    protocolRegistry: {
      async requireApproved({ tenantId, decisionProtocolId, businessLine, at }) {
        assert.equal(tenantId, 'bank_1');
        assert.ok([DEPOSIT_PLAY.decision_protocol_id, MERRILL_PLAY.decision_protocol_id].includes(decisionProtocolId));
        assert.ok(['consumer-banking', 'wealth-management'].includes(businessLine));
        assert.ok(Date.parse(at) >= Date.parse('2026-07-12T11:00:00.000Z'));
        return {
          approvalEventId: `gpa_${decisionProtocolId.slice(-24)}`,
          decisionProtocolId,
          businessLine,
          decidedBy: `${businessLine}_owner`,
          decidedAt: '2026-07-12T11:00:00.000Z',
          changeRecordId: `change_${businessLine}_001`,
        };
      },
    },
    ledgerRepository: {
      async append(draft) {
        const existing = state.ledger.find((event) => event.tenantId === draft.tenantId && event.idempotencyKey === draft.idempotencyKey);
        if (existing) return { inserted: false, record: existing };
        state.ledger.push(draft);
        state.trace.push(`ledger:${draft.idempotencyKey}`);
        return { inserted: true, record: draft };
      },
      async loadPreparedDecision({ tenantId, decisionId }) {
        const prepared = state.ledger.find((event) => (
          event.tenantId === tenantId
          && event.eventType === 'decision'
          && event.payload.decision_id === decisionId
        ));
        assert.ok(prepared, 'prepared decision was not found');
        return prepared;
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
          record.external_receipt_url = result.externalReceiptUrl;
          record.error_code = result.errorCode;
          record.completed_at = result.completedAt;
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

function merrillRelationshipInput(householdToken, caseId) {
  return baseInput({
    householdToken,
    caseId,
    growthPlay: MERRILL_PLAY,
    experimentId: 'merrill_growth_pilot_01',
    records: [
      record('tx_acats', 'acats', 275000, 'merrill_transfer_workflow'),
      record('tx_relationship', 'account', 85000, 'merrill_books'),
      record('tx_engagement', 'digital', 3, 'merrill_digital'),
    ],
  });
}

function depositInput(householdToken, caseId) {
  return baseInput({
    householdToken,
    caseId,
    growthPlay: DEPOSIT_PLAY,
    experimentId: 'deposit_pilot_01',
    records: [
      record('tx_payroll', 'ach', 4800, 'deposit_core'),
      record('tx_outflow', 'p2p', -2100, 'payments_core'),
    ],
  });
}

function baseInput({ householdToken, caseId, growthPlay, experimentId, records }) {
  return {
    growthPlay,
    tenantId: 'bank_1',
    caseId,
    householdToken,
    objective: growthPlay.objective,
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
      receivedAt: SOURCE_AT,
      evidenceClass: 'sandbox',
    },
    eligibilityReceipt: {
      receiptId: `eligibility_${caseId}`,
      criteriaVersion: growthPlay.eligibility.criteria_version,
      eligible: true,
      evaluatedAt: ELIGIBILITY_AT,
      evidenceTransactionIds: records.map((item) => item.transaction_id),
    },
    policyVersion: growthPlay.policy.version,
    policies: growthPlay.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' })),
    experiment: {
      experimentId,
      holdoutPct: growthPlay.measurement.holdout_pct,
      assignmentSalt: SALT,
      assignedAt: ASSIGNED_AT,
    },
  };
}

function merrillRelationshipDecision(blocked, householdToken) {
  return {
    growthPlayId: 'merrill-relationship-growth',
    abstain: blocked,
    abstainReason: blocked ? 'Eligibility policy blocks activation.' : null,
    confidence: 0.89,
    evidence: [
      { transaction_id: 'tx_acats', signal_type: 'asset_transfer_intent', summary: 'Outside-asset transfer is in progress.' },
      { transaction_id: 'tx_relationship', signal_type: 'self_directed_relationship', summary: 'Self-directed Merrill relationship has no assigned advisor.' },
      { transaction_id: 'tx_engagement', signal_type: 'planning_engagement', summary: 'Recent planning engagement indicates active advice demand.' },
    ],
    actionId: blocked ? null : 'assign_advisor_consolidation_review',
    ownerRole: blocked ? null : 'merrill_growth_desk',
    connector: blocked ? null : 'salesforce',
    destination: blocked ? null : 'cew_book_360_task',
    cohort: blocked ? null : 'qualified_self_directed_no_advisor',
    deliveryPayload: blocked ? null : { household_token: householdToken, action: 'assign_advisor_consolidation_review' },
  };
}

function depositDecision(blocked, householdToken) {
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
    deliveryPayload: blocked ? null : { household_token: householdToken, action: 'banker_retention_review' },
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
  const deposit = result.growthPlayId === 'deposit-primacy-defense';
  return {
    contract_version: '1.0',
    event_id: `event_${result.caseId}`,
    tenant_id: result.tenantId,
    household_token: result.householdToken,
    growth_play_id: result.growthPlayId,
    decision_id: result.decisionId,
    activation_id: result.receipt?.delivery_id ?? null,
    event_type: deposit ? 'deposit_balance_observed' : 'assets_transferred',
    occurred_at: OUTCOME_AT,
    assignment: {
      experiment_id: result.assignment.experimentId,
      arm: result.assignment.arm,
      assigned_at: result.assignment.assignedAt,
      decision_protocol_id: result.decisionProtocolId,
    },
    value: { metric: deposit ? 'deposit_retained' : 'net_new_assets', amount, currency: 'USD' },
    source_system: deposit ? 'deposit_core_sandbox' : 'wealth_core_sandbox',
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
  return { ledger: [], assignments: [], outcomes: [], receipts: [], trace: [], deliveryCalls: 0, detectorCalls: 0 };
}

function testPlay(draft) {
  return compileGrowthPlayContract({
    ...draft,
    measurement: { ...draft.measurement, minimum_per_arm: 1, minimum_coverage: 1 },
  });
}
