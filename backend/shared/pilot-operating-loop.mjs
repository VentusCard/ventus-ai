import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { assignExperiment, summarizeIncrementalLift } from './experiment-measurement.mjs';
import { validateTenantId } from './tenant-context.mjs';

const ACTIVATION_MODES = new Set(['shadow', 'sandbox_assisted', 'production_assisted']);
const EVIDENCE_CLASSES = new Set(['synthetic', 'sandbox', 'sanctioned']);
const POLICY_VERDICTS = new Set(['clear', 'review', 'block']);

export function createPilotOperatingLoop({
  detector,
  ledgerRepository,
  measurementRepository,
  deliveryRepository,
  deliver,
}) {
  assert.equal(typeof detector, 'function', 'detector is required');
  assert.equal(typeof ledgerRepository?.append, 'function', 'ledgerRepository.append is required');
  assert.equal(typeof measurementRepository?.recordAssignment, 'function', 'measurementRepository.recordAssignment is required');
  assert.equal(typeof measurementRepository?.recordOutcome, 'function', 'measurementRepository.recordOutcome is required');
  assert.equal(typeof measurementRepository?.loadExperiment, 'function', 'measurementRepository.loadExperiment is required');
  assert.equal(typeof deliveryRepository?.reserve, 'function', 'deliveryRepository.reserve is required');
  assert.equal(typeof deliveryRepository?.complete, 'function', 'deliveryRepository.complete is required');
  assert.equal(typeof deliver, 'function', 'deliver is required');

  return {
    async runHousehold(input) {
      validateRunInput(input);
      const detected = await detector({
        tenantId: input.tenantId,
        householdToken: input.householdToken,
        records: input.records,
        objective: input.objective,
        policies: input.policies,
      });
      const decision = validateDetectedDecision(input, detected);
      const decisionId = `dec_${sha256(`${input.tenantId}\u001f${input.caseId}\u001f${decision.growthPlayId}`).slice(0, 24)}`;
      const ledgerStatus = input.sourceReceipt.evidenceClass === 'synthetic' ? 'simulated' : 'confirmed';

      await appendLedger(ledgerRepository, input, {
        stage: 'source',
        eventType: 'enrich',
        status: ledgerStatus,
        growthPlayId: decision.growthPlayId,
        payload: {
          source_receipt_id: input.sourceReceipt.receiptId,
          source_system: input.sourceReceipt.sourceSystem,
          source_batch_id: input.sourceReceipt.batchId,
          schema_version: input.sourceReceipt.schemaVersion,
          evidence_class: input.sourceReceipt.evidenceClass,
          records_received: input.sourceReceipt.recordCount,
          records_evaluated: input.records.length,
          rails: [...new Set(input.records.map((record) => record.rail))].sort(),
        },
      });
      await appendLedger(ledgerRepository, input, {
        stage: 'signal',
        eventType: 'signal',
        status: ledgerStatus,
        growthPlayId: decision.growthPlayId,
        payload: {
          decision_id: decisionId,
          signal_types: decision.evidence.map((item) => item.signal_type),
          evidence_transaction_ids: decision.evidence.map((item) => item.transaction_id),
          confidence: decision.confidence,
        },
      });
      await appendLedger(ledgerRepository, input, {
        stage: 'policy',
        eventType: 'policy',
        status: decision.abstain ? 'suppressed' : ledgerStatus,
        growthPlayId: decision.growthPlayId,
        policyVersion: input.policyVersion,
        payload: {
          decision_id: decisionId,
          policy_version: input.policyVersion,
          checks: input.policies,
          abstain: decision.abstain,
          abstain_reason: decision.abstainReason,
        },
      });

      if (decision.abstain) {
        await appendDecision(ledgerRepository, input, decision, decisionId, null, 'suppressed');
        return operatingResult({ input, decision, decisionId, assignment: null, activation: 'suppressed', receipt: null });
      }
      if (input.activationMode === 'shadow') {
        await appendDecision(ledgerRepository, input, decision, decisionId, null, 'simulated');
        return operatingResult({ input, decision, decisionId, assignment: null, activation: 'shadow_only', receipt: null });
      }

      const assignment = assignExperiment({
        tenantId: input.tenantId,
        experimentId: input.experiment.experimentId,
        householdToken: input.householdToken,
        holdoutPct: input.experiment.holdoutPct,
        salt: input.experiment.assignmentSalt,
        evidenceClass: input.sourceReceipt.evidenceClass,
        assignedAt: input.experiment.assignedAt,
      });
      await measurementRepository.recordAssignment(assignment);
      await appendLedger(ledgerRepository, input, {
        stage: 'assignment',
        eventType: 'counterfactual',
        status: assignment.arm === 'holdout' ? 'suppressed' : ledgerStatus,
        growthPlayId: decision.growthPlayId,
        payload: {
          decision_id: decisionId,
          experiment_id: assignment.experimentId,
          assignment_id: assignment.assignmentId,
          arm: assignment.arm,
          assigned_at: assignment.assignedAt,
          evidence_class: assignment.evidenceClass,
        },
      });
      await appendDecision(
        ledgerRepository,
        input,
        decision,
        decisionId,
        assignment,
        assignment.arm === 'holdout' ? 'suppressed' : 'confirmed',
      );
      if (assignment.arm === 'holdout') {
        return operatingResult({ input, decision, decisionId, assignment, activation: 'holdout', receipt: null });
      }

      const reservation = await deliveryRepository.reserve({
        tenantId: input.tenantId,
        idempotencyKey: `${decisionId}:${decision.connector}:${decision.destination}`,
        connector: decision.connector,
        destination: decision.destination,
        decisionId,
        actionId: decision.actionId,
        sessionId: input.sessionId,
        payload: decision.deliveryPayload,
        requestedAt: input.runAt,
      });
      if (!reservation.shouldDeliver) {
        return operatingResult({
          input,
          decision,
          decisionId,
          assignment,
          activation: reservation.reconciliationRequired ? 'reconciliation_required' : reservation.record.status,
          receipt: reservation.record,
        });
      }

      const delivered = await deliver({ input, decision: { ...decision, decisionId }, reservation: reservation.record });
      validateDeliveryCallback(delivered);
      const completed = await deliveryRepository.complete({
        tenantId: input.tenantId,
        deliveryId: reservation.record.delivery_id,
        status: delivered.status,
        sessionId: input.sessionId,
        externalReceiptId: delivered.externalReceiptId ?? null,
        externalReceiptUrl: delivered.externalReceiptUrl ?? null,
        errorCode: delivered.errorCode ?? null,
        completedAt: delivered.completedAt,
      });
      await appendLedger(ledgerRepository, input, {
        stage: 'activation',
        eventType: 'activation',
        status: delivered.status === 'delivered' ? 'confirmed' : 'failed',
        growthPlayId: decision.growthPlayId,
        payload: {
          decision_id: decisionId,
          activation_id: reservation.record.delivery_id,
          connector: decision.connector,
          destination: decision.destination,
          external_receipt_id: delivered.externalReceiptId ?? null,
          delivery_status: delivered.status,
        },
      });
      return operatingResult({
        input,
        decision,
        decisionId,
        assignment,
        activation: delivered.status,
        receipt: completed.record,
      });
    },

    async recordOutcome(event) {
      const loaded = await measurementRepository.loadExperiment({
        tenantId: event.tenant_id,
        experimentId: event.assignment?.experiment_id,
      });
      const assignment = loaded.assignments.find((item) => item.householdToken === event.household_token);
      assert.ok(assignment, 'outcome has no persisted assignment');
      const recorded = await measurementRepository.recordOutcome(event);
      await ledgerRepository.append({
        tenantId: event.tenant_id,
        idempotencyKey: `outcome:${event.event_id}`,
        eventType: 'outcome',
        householdToken: event.household_token,
        growthPlayId: event.growth_play_id,
        policyVersion: null,
        status: assignment.evidenceClass === 'sanctioned' ? 'confirmed' : 'simulated',
        occurredAt: event.occurred_at,
        payload: {
          event_id: event.event_id,
          decision_id: event.decision_id,
          activation_id: event.activation_id ?? null,
          experiment_id: event.assignment.experiment_id,
          arm: event.assignment.arm,
          metric: event.value?.metric ?? null,
          evidence_class: assignment.evidenceClass,
          source_system: event.source_system,
        },
      });
      return { ...recorded, evidenceClass: assignment.evidenceClass, businessClaimAllowed: false };
    },

    async measureExperiment({ tenantId, experimentId, metric, minimumPerArm = 30, minimumCoverage = 0.9 }) {
      const loaded = await measurementRepository.loadExperiment({ tenantId, experimentId });
      return summarizeIncrementalLift({
        ...loaded,
        metric,
        minimumPerArm,
        minimumCoverage,
      });
    },
  };
}

function validateRunInput(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'run input must be an object');
  validateTenantId(input.tenantId);
  assertIdentifier(input.caseId, 'caseId');
  assert.match(input.householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  assertIdentifier(input.objective, 'objective');
  assertIsoDate(input.runAt, 'runAt');
  assert.ok(ACTIVATION_MODES.has(input.activationMode), 'activationMode is unsupported');
  assert.ok(Array.isArray(input.records) && input.records.length > 0, 'records are required');
  const recordIds = new Set();
  for (const record of input.records) {
    assertIdentifier(record.transaction_id, 'record.transaction_id');
    assert.ok(!recordIds.has(record.transaction_id), `duplicate record ${record.transaction_id}`);
    recordIds.add(record.transaction_id);
    assertIdentifier(record.rail, 'record.rail');
    assertIdentifier(record.source_system, 'record.source_system');
    assert.ok(Number.isFinite(record.amount), 'record.amount must be finite');
    assertIsoDate(record.occurred_at, 'record.occurred_at');
    assertNoDirectPiiKeys(record);
  }
  assert.ok(input.sourceReceipt && typeof input.sourceReceipt === 'object', 'sourceReceipt is required');
  assertIdentifier(input.sourceReceipt.receiptId, 'sourceReceipt.receiptId');
  assertIdentifier(input.sourceReceipt.sourceSystem, 'sourceReceipt.sourceSystem');
  assertIdentifier(input.sourceReceipt.batchId, 'sourceReceipt.batchId');
  assertIdentifier(input.sourceReceipt.schemaVersion, 'sourceReceipt.schemaVersion');
  assertIsoDate(input.sourceReceipt.receivedAt, 'sourceReceipt.receivedAt');
  assert.ok(EVIDENCE_CLASSES.has(input.sourceReceipt.evidenceClass), 'source evidenceClass is unsupported');
  assert.ok(Number.isInteger(input.sourceReceipt.recordCount) && input.sourceReceipt.recordCount >= input.records.length, 'source recordCount is invalid');
  assertIdentifier(input.policyVersion, 'policyVersion');
  assert.ok(Array.isArray(input.policies) && input.policies.length > 0, 'policies are required');
  const policyIds = new Set();
  for (const policy of input.policies) {
    assertIdentifier(policy.policy_id, 'policy.policy_id');
    assert.ok(!policyIds.has(policy.policy_id), `duplicate policy ${policy.policy_id}`);
    policyIds.add(policy.policy_id);
    assert.ok(POLICY_VERDICTS.has(policy.verdict), 'policy verdict is unsupported');
  }
  if (input.activationMode === 'shadow') return;
  assert.ok(input.experiment && typeof input.experiment === 'object', 'experiment is required for assisted activation');
  assertIdentifier(input.experiment.experimentId, 'experiment.experimentId');
  assert.ok(Number.isFinite(input.experiment.holdoutPct), 'experiment.holdoutPct is required');
  assert.ok(typeof input.experiment.assignmentSalt === 'string' && input.experiment.assignmentSalt.length >= 16, 'experiment assignment salt is invalid');
  assertIsoDate(input.experiment.assignedAt, 'experiment.assignedAt');
  assertIdentifier(input.sessionId, 'sessionId');
  if (input.activationMode === 'sandbox_assisted') {
    assert.equal(input.destinationEnvironment, 'sandbox', 'sandbox activation requires a sandbox destination');
    assert.notEqual(input.sourceReceipt.evidenceClass, 'synthetic', 'synthetic evidence cannot activate a connector');
  }
  if (input.activationMode === 'production_assisted') {
    assert.equal(input.destinationEnvironment, 'production', 'production activation requires a production destination');
    assert.equal(input.sourceReceipt.evidenceClass, 'sanctioned', 'production activation requires sanctioned evidence');
  }
}

function validateDetectedDecision(input, decision) {
  assert.ok(decision && typeof decision === 'object' && !Array.isArray(decision), 'detector result must be an object');
  assertIdentifier(decision.growthPlayId, 'decision.growthPlayId');
  assert.ok(typeof decision.abstain === 'boolean', 'decision.abstain must be boolean');
  assert.ok(Number.isFinite(decision.confidence) && decision.confidence >= 0 && decision.confidence <= 1, 'decision.confidence must be 0-1');
  assert.ok(Array.isArray(decision.evidence) && decision.evidence.length > 0, 'decision evidence is required');
  const recordIds = new Set(input.records.map((record) => record.transaction_id));
  const evidenceIds = new Set();
  for (const evidence of decision.evidence) {
    assertIdentifier(evidence.transaction_id, 'evidence.transaction_id');
    assert.ok(recordIds.has(evidence.transaction_id), `evidence ${evidence.transaction_id} is not in the source records`);
    assert.ok(!evidenceIds.has(evidence.transaction_id), `duplicate evidence ${evidence.transaction_id}`);
    evidenceIds.add(evidence.transaction_id);
    assertIdentifier(evidence.signal_type, 'evidence.signal_type');
    assert.ok(typeof evidence.summary === 'string' && evidence.summary.length > 0 && evidence.summary.length <= 300, 'evidence.summary is invalid');
  }
  const blockingPolicy = input.policies.some((policy) => policy.verdict === 'block');
  if (blockingPolicy) assert.equal(decision.abstain, true, 'blocking policy requires abstention');
  if (decision.abstain) {
    for (const field of ['actionId', 'ownerRole', 'connector', 'destination', 'cohort', 'deliveryPayload']) {
      assert.equal(decision[field] ?? null, null, `abstaining decision cannot include ${field}`);
    }
    assert.ok(typeof decision.abstainReason === 'string' && decision.abstainReason.length > 0, 'abstainReason is required');
  } else {
    for (const field of ['actionId', 'ownerRole', 'connector', 'destination', 'cohort']) {
      assertIdentifier(decision[field], `decision.${field}`);
    }
    assert.ok(decision.deliveryPayload && typeof decision.deliveryPayload === 'object' && !Array.isArray(decision.deliveryPayload), 'decision.deliveryPayload is required');
    assertNoDirectPiiKeys(decision.deliveryPayload);
  }
  return decision;
}

async function appendDecision(repository, input, decision, decisionId, assignment, status) {
  return appendLedger(repository, input, {
    stage: 'decision',
    eventType: 'decision',
    status,
    growthPlayId: decision.growthPlayId,
    policyVersion: input.policyVersion,
    payload: {
      decision_id: decisionId,
      cohort: decision.cohort ?? 'suppressed',
      action: decision.actionId ?? 'abstain',
      channel: decision.destination ?? 'none',
      owner_role: decision.ownerRole ?? null,
      confidence: decision.confidence,
      signal_types: decision.evidence.map((item) => item.signal_type),
      evidence_transaction_ids: decision.evidence.map((item) => item.transaction_id),
      abstain: decision.abstain,
      abstain_reason: decision.abstainReason ?? null,
      experiment_id: assignment?.experimentId ?? null,
      arm: assignment?.arm ?? null,
    },
  });
}

async function appendLedger(repository, input, event) {
  return repository.append({
    tenantId: input.tenantId,
    idempotencyKey: `${input.caseId}:${event.stage}`,
    eventType: event.eventType,
    householdToken: input.householdToken,
    growthPlayId: event.growthPlayId,
    policyVersion: event.policyVersion ?? null,
    status: event.status,
    occurredAt: input.runAt,
    payload: event.payload,
  });
}

function validateDeliveryCallback(result) {
  assert.ok(result && typeof result === 'object' && !Array.isArray(result), 'delivery callback result must be an object');
  assert.ok(['delivered', 'failed'].includes(result.status), 'delivery callback status is unsupported');
  assertIsoDate(result.completedAt, 'delivery.completedAt');
  if (result.status === 'delivered') assertIdentifier(result.externalReceiptId, 'delivery.externalReceiptId');
  else assertIdentifier(result.errorCode, 'delivery.errorCode');
}

function operatingResult({ input, decision, decisionId, assignment, activation, receipt }) {
  return {
    tenantId: input.tenantId,
    caseId: input.caseId,
    householdToken: input.householdToken,
    sourceReceiptId: input.sourceReceipt.receiptId,
    evidenceClass: input.sourceReceipt.evidenceClass,
    growthPlayId: decision.growthPlayId,
    decisionId,
    decision,
    assignment,
    activation,
    receipt,
    businessClaimAllowed: false,
  };
}

function assertNoDirectPiiKeys(value) {
  const stack = [value];
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object') continue;
    for (const [key, child] of Object.entries(item)) {
      const normalizedKey = key.toLowerCase();
      const directPii = /^(first_name|last_name|full_name|customer_name|customer_email|email|customer_phone|phone|customer_address|street_address|address|ssn|pan|cvv|card_number|account_number|routing_number)$/.test(normalizedKey);
      assert.ok(!directPii, `direct PII field ${key} is prohibited`);
      if (child && typeof child === 'object') stack.push(child);
    }
  }
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 256, `${label} is invalid`);
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
