import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { assignExperiment, summarizeIncrementalLift } from './experiment-measurement.mjs';
import {
  validateCompiledGrowthPlayContract,
  validateGrowthPlayDecision,
  validateGrowthPlayOutcome,
  validateGrowthPlayRun,
} from './growth-play-contract.mjs';
import { validateTenantId } from '../platform/tenant-context.mjs';

const ACTIVATION_MODES = new Set(['shadow', 'sandbox_review', 'sandbox_assisted', 'production_assisted']);
const EVIDENCE_CLASSES = new Set(['synthetic', 'sandbox', 'sanctioned']);
const POLICY_VERDICTS = new Set(['clear', 'review', 'block']);

export function createPilotOperatingLoop({
  detector,
  protocolRegistry,
  ledgerRepository,
  measurementRepository,
  deliveryRepository,
  deliver,
}) {
  assert.equal(typeof detector, 'function', 'detector is required');
  assert.equal(typeof protocolRegistry?.requireApproved, 'function', 'protocolRegistry.requireApproved is required');
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
      const growthPlay = validateGrowthPlayRun(input, input.growthPlay);
      const protocolApproval = await protocolRegistry.requireApproved({
        tenantId: input.tenantId,
        decisionProtocolId: growthPlay.decision_protocol_id,
        businessLine: growthPlay.business_line,
        at: input.runAt,
      });
      const decisionId = `dec_${sha256(`${input.tenantId}\u001f${input.caseId}\u001f${growthPlay.growth_play_id}`).slice(0, 24)}`;
      const ledgerStatus = input.sourceReceipt.evidenceClass === 'synthetic' ? 'simulated' : 'confirmed';

      await appendLedger(ledgerRepository, input, {
        stage: 'source',
        eventType: 'enrich',
        status: ledgerStatus,
        growthPlayId: growthPlay.growth_play_id,
        payload: {
          source_receipt_id: input.sourceReceipt.receiptId,
          source_system: input.sourceReceipt.sourceSystem,
          source_batch_id: input.sourceReceipt.batchId,
          schema_version: input.sourceReceipt.schemaVersion,
          evidence_class: input.sourceReceipt.evidenceClass,
          records_received: input.sourceReceipt.recordCount,
          records_evaluated: input.records.length,
          rails: [...new Set(input.records.map((record) => record.rail))].sort(),
          eligibility_receipt_id: input.eligibilityReceipt.receiptId,
          eligibility_criteria_version: input.eligibilityReceipt.criteriaVersion,
          growth_play_version: growthPlay.version,
          decision_protocol_id: growthPlay.decision_protocol_id,
          protocol_digest: growthPlay.protocol_digest,
          protocol_approval_event_id: protocolApproval.approvalEventId,
          protocol_change_record_id: protocolApproval.changeRecordId,
          protocol_approved_at: protocolApproval.decidedAt,
        },
      });
      const blockingPolicy = input.policies.find((policy) => policy.verdict === 'block');
      await appendLedger(ledgerRepository, input, {
        stage: 'policy',
        eventType: 'policy',
        status: blockingPolicy ? 'suppressed' : ledgerStatus,
        growthPlayId: growthPlay.growth_play_id,
        policyVersion: input.policyVersion,
        payload: {
          decision_id: decisionId,
          policy_version: input.policyVersion,
          checks: input.policies,
          abstain: Boolean(blockingPolicy),
          abstain_reason: blockingPolicy ? `Required policy ${blockingPolicy.policy_id} blocks decisioning.` : null,
        },
      });

      if (blockingPolicy) {
        const decision = validateDetectedDecision(
          input,
          policySuppressedDecision(input, growthPlay, blockingPolicy),
          growthPlay,
        );
        await appendDecision(ledgerRepository, input, decision, decisionId, null, 'suppressed');
        return operatingResult({ input, decision, decisionId, assignment: null, activation: 'suppressed', receipt: null });
      }

      let assignment = null;
      if (input.activationMode !== 'shadow') {
        assignment = assignExperiment({
          tenantId: input.tenantId,
          experimentId: input.experiment.experimentId,
          householdToken: input.householdToken,
          holdoutPct: input.experiment.holdoutPct,
          salt: input.experiment.assignmentSalt,
          decisionProtocolId: growthPlay.decision_protocol_id,
          evidenceClass: input.sourceReceipt.evidenceClass,
          assignedAt: input.experiment.assignedAt,
        });
        await measurementRepository.recordAssignment(assignment);
        await appendLedger(ledgerRepository, input, {
          stage: 'assignment',
          eventType: 'counterfactual',
          status: assignment.arm === 'holdout' ? 'suppressed' : ledgerStatus,
          growthPlayId: growthPlay.growth_play_id,
          payload: {
            decision_id: decisionId,
            experiment_id: assignment.experimentId,
            assignment_id: assignment.assignmentId,
            arm: assignment.arm,
            assigned_at: assignment.assignedAt,
            evidence_class: assignment.evidenceClass,
            decision_protocol_id: growthPlay.decision_protocol_id,
            eligibility_receipt_id: input.eligibilityReceipt.receiptId,
          },
        });
        if (assignment.arm === 'holdout') {
          return operatingResult({ input, decision: null, decisionId, assignment, activation: 'holdout', receipt: null });
        }
      }

      let decision;
      try {
        const detected = await detector({
          tenantId: input.tenantId,
          householdToken: input.householdToken,
          records: input.records,
          objective: input.objective,
          policies: input.policies,
          growthPlay,
          decisionProtocolId: growthPlay.decision_protocol_id,
        });
        decision = validateDetectedDecision(input, detected, growthPlay);
      } catch (error) {
        await appendLedger(ledgerRepository, input, {
          stage: 'decision-failure',
          eventType: 'decision',
          status: 'failed',
          growthPlayId: growthPlay.growth_play_id,
          policyVersion: input.policyVersion,
          payload: {
            decision_id: decisionId,
            experiment_id: assignment?.experimentId ?? null,
            arm: assignment?.arm ?? null,
            decision_protocol_id: growthPlay.decision_protocol_id,
            error_code: 'detector_or_contract_failure',
          },
        });
        throw error;
      }
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
      if (decision.abstain) {
        await appendDecision(ledgerRepository, input, decision, decisionId, assignment, 'suppressed');
        return operatingResult({ input, decision, decisionId, assignment, activation: 'suppressed', receipt: null });
      }
      if (input.activationMode === 'shadow') {
        await appendDecision(ledgerRepository, input, decision, decisionId, null, 'simulated');
        return operatingResult({ input, decision, decisionId, assignment: null, activation: 'shadow_only', receipt: null });
      }
      await appendDecision(ledgerRepository, input, decision, decisionId, assignment, 'confirmed');
      if (input.activationMode === 'sandbox_review') {
        return operatingResult({ input, decision, decisionId, assignment, activation: 'review_required', receipt: null });
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
        if (reservation.record.status === 'delivered' || reservation.record.status === 'failed') {
          await appendActivationReceipt({
            ledgerRepository,
            tenantId: input.tenantId,
            caseId: input.caseId,
            householdToken: input.householdToken,
            growthPlayId: decision.growthPlayId,
            policyVersion: input.policyVersion,
            decisionId,
            connector: decision.connector,
            destination: decision.destination,
            receipt: reservation.record,
          });
        }
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
      await appendActivationReceipt({
        ledgerRepository,
        tenantId: input.tenantId,
        caseId: input.caseId,
        householdToken: input.householdToken,
        growthPlayId: decision.growthPlayId,
        policyVersion: input.policyVersion,
        decisionId,
        connector: decision.connector,
        destination: decision.destination,
        receipt: completed.record,
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

    async activatePreparedDecision(input) {
      validatePreparedActivationInput(input);
      assert.equal(
        typeof ledgerRepository.loadPreparedDecision,
        'function',
        'ledgerRepository.loadPreparedDecision is required for reviewed activation',
      );
      const prepared = await ledgerRepository.loadPreparedDecision({
        tenantId: input.tenantId,
        decisionId: input.decisionId,
      });
      validatePreparedDecision(prepared, input);
      await protocolRegistry.requireApproved({
        tenantId: input.tenantId,
        decisionProtocolId: prepared.payload.decision_protocol_id,
        businessLine: prepared.payload.business_line,
        at: input.activatedAt,
      });

      const reservation = await deliveryRepository.reserve({
        tenantId: input.tenantId,
        idempotencyKey: `${input.decisionId}:${input.decision.connector}:${input.decision.destination}`,
        connector: input.decision.connector,
        destination: input.decision.destination,
        decisionId: input.decisionId,
        actionId: input.decision.actionId,
        sessionId: input.sessionId,
        payload: input.decision.deliveryPayload,
        requestedAt: input.activatedAt,
      });
      if (!reservation.shouldDeliver) {
        if (reservation.record.status === 'delivered' || reservation.record.status === 'failed') {
          await appendActivationReceipt({
            ledgerRepository,
            tenantId: input.tenantId,
            caseId: prepared.payload.case_id,
            householdToken: prepared.householdToken,
            growthPlayId: prepared.growthPlayId,
            policyVersion: prepared.policyVersion,
            decisionId: input.decisionId,
            connector: input.decision.connector,
            destination: input.decision.destination,
            receipt: reservation.record,
          });
        }
        return preparedActivationResult({
          prepared,
          input,
          activation: reservation.reconciliationRequired ? 'reconciliation_required' : reservation.record.status,
          receipt: reservation.record,
        });
      }

      const deliveryInput = {
        tenantId: input.tenantId,
        caseId: prepared.payload.case_id,
        householdToken: prepared.householdToken,
        sessionId: input.sessionId,
        runAt: input.activatedAt,
      };
      const delivered = await deliver({
        input: deliveryInput,
        decision: { ...input.decision, decisionId: input.decisionId },
        reservation: reservation.record,
      });
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
      await appendActivationReceipt({
        ledgerRepository,
        tenantId: input.tenantId,
        caseId: prepared.payload.case_id,
        householdToken: prepared.householdToken,
        growthPlayId: prepared.growthPlayId,
        policyVersion: prepared.policyVersion,
        decisionId: input.decisionId,
        connector: input.decision.connector,
        destination: input.decision.destination,
        receipt: completed.record,
      });
      return preparedActivationResult({
        prepared,
        input,
        activation: delivered.status,
        receipt: completed.record,
      });
    },

    async recordOutcome(event, growthPlayContract) {
      const growthPlay = validateCompiledGrowthPlayContract(growthPlayContract);
      const loaded = await measurementRepository.loadExperiment({
        tenantId: event.tenant_id,
        experimentId: event.assignment?.experiment_id,
      });
      const assignment = loaded.assignments.find((item) => item.householdToken === event.household_token);
      assert.ok(assignment, 'outcome has no persisted assignment');
      validateGrowthPlayOutcome(event, assignment, growthPlay);
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
          decision_protocol_id: growthPlay.decision_protocol_id,
        },
      });
      return { ...recorded, evidenceClass: assignment.evidenceClass, businessClaimAllowed: false };
    },

    async measureExperiment({ tenantId, experimentId, growthPlay: growthPlayContract }) {
      const growthPlay = validateCompiledGrowthPlayContract(growthPlayContract);
      const loaded = await measurementRepository.loadExperiment({ tenantId, experimentId });
      return summarizeIncrementalLift({
        ...loaded,
        metric: growthPlay.measurement.metric,
        minimumPerArm: growthPlay.measurement.minimum_per_arm,
        minimumCoverage: growthPlay.measurement.minimum_coverage,
      });
    },
  };
}

function validateRunInput(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'run input must be an object');
  assert.ok(input.growthPlay && typeof input.growthPlay === 'object', 'compiled Growth Play is required');
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
  assert.ok(Date.parse(input.sourceReceipt.receivedAt) <= Date.parse(input.runAt), 'source receipt must predate the run');
  assert.ok(EVIDENCE_CLASSES.has(input.sourceReceipt.evidenceClass), 'source evidenceClass is unsupported');
  assert.ok(Number.isInteger(input.sourceReceipt.recordCount) && input.sourceReceipt.recordCount >= input.records.length, 'source recordCount is invalid');
  assert.ok(input.eligibilityReceipt && typeof input.eligibilityReceipt === 'object', 'eligibilityReceipt is required');
  assertIdentifier(input.eligibilityReceipt.receiptId, 'eligibilityReceipt.receiptId');
  assertIdentifier(input.eligibilityReceipt.criteriaVersion, 'eligibilityReceipt.criteriaVersion');
  assertIsoDate(input.eligibilityReceipt.evaluatedAt, 'eligibilityReceipt.evaluatedAt');
  assert.ok(Date.parse(input.sourceReceipt.receivedAt) <= Date.parse(input.eligibilityReceipt.evaluatedAt), 'source receipt must predate eligibility');
  assert.ok(Date.parse(input.eligibilityReceipt.evaluatedAt) <= Date.parse(input.runAt), 'eligibility must predate the run');
  assert.equal(typeof input.eligibilityReceipt.eligible, 'boolean', 'eligibilityReceipt.eligible must be boolean');
  assert.ok(Array.isArray(input.eligibilityReceipt.evidenceTransactionIds) && input.eligibilityReceipt.evidenceTransactionIds.length > 0, 'eligibility evidence is required');
  const eligibilityEvidenceIds = new Set();
  for (const transactionId of input.eligibilityReceipt.evidenceTransactionIds) {
    assert.ok(recordIds.has(transactionId), `eligibility evidence ${transactionId} is not in the source records`);
    assert.ok(!eligibilityEvidenceIds.has(transactionId), `duplicate eligibility evidence ${transactionId}`);
    eligibilityEvidenceIds.add(transactionId);
  }
  assert.ok(input.records.every((record) => Date.parse(record.occurred_at) <= Date.parse(input.sourceReceipt.receivedAt)), 'source record cannot postdate its receipt');
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
  assert.ok(Date.parse(input.eligibilityReceipt.evaluatedAt) <= Date.parse(input.experiment.assignedAt), 'eligibility must predate assignment');
  assert.ok(Date.parse(input.experiment.assignedAt) <= Date.parse(input.runAt), 'assignment must predate the run');
  assertIdentifier(input.sessionId, 'sessionId');
  if (input.activationMode === 'sandbox_review' || input.activationMode === 'sandbox_assisted') {
    assert.equal(input.destinationEnvironment, 'sandbox', 'sandbox activation requires a sandbox destination');
    assert.notEqual(input.sourceReceipt.evidenceClass, 'synthetic', 'synthetic evidence cannot activate a connector');
  }
  if (input.activationMode === 'production_assisted') {
    assert.equal(input.destinationEnvironment, 'production', 'production activation requires a production destination');
    assert.equal(input.sourceReceipt.evidenceClass, 'sanctioned', 'production activation requires sanctioned evidence');
  }
}

function validateDetectedDecision(input, decision, growthPlay) {
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
  validateGrowthPlayDecision(input, decision, growthPlay);
  return decision;
}

function policySuppressedDecision(input, growthPlay, blockingPolicy) {
  return {
    growthPlayId: growthPlay.growth_play_id,
    abstain: true,
    abstainReason: `Required policy ${blockingPolicy.policy_id} blocks decisioning.`,
    confidence: 1,
    evidence: input.eligibilityReceipt.evidenceTransactionIds.map((transactionId) => ({
      transaction_id: transactionId,
      signal_type: 'eligibility_evidence',
      summary: 'Evidence referenced by the approved eligibility receipt.',
    })),
    actionId: null,
    ownerRole: null,
    connector: null,
    destination: null,
    cohort: null,
    deliveryPayload: null,
  };
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
      case_id: input.caseId,
      business_line: input.growthPlay.business_line,
      evidence_class: input.sourceReceipt.evidenceClass,
      growth_play_version: input.growthPlay.version,
      decision_protocol_id: input.growthPlay.decision_protocol_id,
      cohort: decision.cohort ?? 'suppressed',
      action: decision.actionId ?? 'abstain',
      connector: decision.connector ?? 'none',
      channel: decision.destination ?? 'none',
      owner_role: decision.ownerRole ?? null,
      confidence: decision.confidence,
      signal_types: decision.evidence.map((item) => item.signal_type),
      evidence_transaction_ids: decision.evidence.map((item) => item.transaction_id),
      abstain: decision.abstain,
      abstain_reason: decision.abstainReason ?? null,
      experiment_id: assignment?.experimentId ?? null,
      arm: assignment?.arm ?? null,
      decision_digest: decisionFingerprint(decision),
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

async function appendActivationReceipt({
  ledgerRepository,
  tenantId,
  caseId,
  householdToken,
  growthPlayId,
  policyVersion,
  decisionId,
  connector,
  destination,
  receipt,
}) {
  const occurredAt = receipt.completed_at ?? receipt.completedAt;
  assertIsoDate(occurredAt, 'delivery receipt completedAt');
  assert.ok(receipt.status === 'delivered' || receipt.status === 'failed', 'delivery receipt must be terminal');
  assertIdentifier(receipt.delivery_id ?? receipt.deliveryId, 'delivery receipt deliveryId');
  return ledgerRepository.append({
    tenantId,
    idempotencyKey: `${caseId}:activation`,
    eventType: 'activation',
    householdToken,
    growthPlayId,
    policyVersion,
    status: receipt.status === 'delivered' ? 'confirmed' : 'failed',
    occurredAt,
    payload: {
      decision_id: decisionId,
      activation_id: receipt.delivery_id ?? receipt.deliveryId,
      connector,
      destination,
      external_receipt_id: receipt.external_receipt_id ?? receipt.externalReceiptId ?? null,
      delivery_status: receipt.status,
    },
  });
}

function validatePreparedActivationInput(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'activation input must be an object');
  validateTenantId(input.tenantId);
  assertIdentifier(input.decisionId, 'decisionId');
  assertIdentifier(input.sessionId, 'sessionId');
  assertIsoDate(input.activatedAt, 'activatedAt');
  assert.ok(input.decision && typeof input.decision === 'object' && !Array.isArray(input.decision), 'decision is required');
  for (const field of ['growthPlayId', 'actionId', 'ownerRole', 'connector', 'destination', 'cohort']) {
    assertIdentifier(input.decision[field], `decision.${field}`);
  }
  assert.equal(input.decision.abstain, false, 'abstaining decision cannot be activated');
  assert.ok(input.decision.deliveryPayload && typeof input.decision.deliveryPayload === 'object', 'decision.deliveryPayload is required');
  assertNoDirectPiiKeys(input.decision.deliveryPayload);
}

function validatePreparedDecision(prepared, input) {
  assert.ok(prepared && typeof prepared === 'object', 'prepared decision was not found');
  assert.equal(prepared.eventType, 'decision', 'prepared event must be a decision');
  assert.equal(prepared.status, 'confirmed', 'prepared decision is not approved for review');
  assert.match(prepared.householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'prepared household token must be opaque');
  assert.ok(Date.parse(prepared.occurredAt) <= Date.parse(input.activatedAt), 'activation cannot predate the decision');
  assert.equal(prepared.payload.decision_id, input.decisionId, 'prepared decision reference does not match');
  assert.equal(prepared.payload.action, input.decision.actionId, 'prepared action does not match');
  assert.equal(prepared.payload.connector, input.decision.connector, 'prepared connector does not match');
  assert.equal(prepared.payload.channel, input.decision.destination, 'prepared destination does not match');
  assert.equal(prepared.payload.abstain, false, 'prepared abstention cannot be activated');
  assert.equal(prepared.payload.arm, 'treatment', 'only a prepared treatment decision can be activated');
  assert.equal(prepared.payload.decision_digest, decisionFingerprint(input.decision), 'prepared decision content does not match');
}

function decisionFingerprint(decision) {
  return sha256(canonicalize({
    growthPlayId: decision.growthPlayId,
    abstain: decision.abstain,
    abstainReason: decision.abstainReason ?? null,
    confidence: decision.confidence,
    evidence: decision.evidence,
    actionId: decision.actionId,
    ownerRole: decision.ownerRole,
    connector: decision.connector,
    destination: decision.destination,
    cohort: decision.cohort,
    deliveryPayload: decision.deliveryPayload,
  }));
}

function canonicalize(value) {
  if (value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function preparedActivationResult({ prepared, input, activation, receipt }) {
  return {
    tenantId: input.tenantId,
    caseId: prepared.payload.case_id,
    householdToken: prepared.householdToken,
    evidenceClass: prepared.payload.evidence_class,
    growthPlayId: prepared.growthPlayId,
    growthPlayVersion: prepared.payload.growth_play_version,
    decisionProtocolId: prepared.payload.decision_protocol_id,
    decisionId: input.decisionId,
    decision: input.decision,
    assignment: {
      experimentId: prepared.payload.experiment_id,
      arm: prepared.payload.arm,
    },
    activation,
    receipt,
    businessClaimAllowed: false,
  };
}

function operatingResult({ input, decision, decisionId, assignment, activation, receipt }) {
  return {
    tenantId: input.tenantId,
    caseId: input.caseId,
    householdToken: input.householdToken,
    sourceReceiptId: input.sourceReceipt.receiptId,
    evidenceClass: input.sourceReceipt.evidenceClass,
    growthPlayId: decision?.growthPlayId ?? input.growthPlay.growth_play_id,
    growthPlayVersion: input.growthPlay.version,
    decisionProtocolId: input.growthPlay.decision_protocol_id,
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
