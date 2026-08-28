import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  assignConnectedExpansionExperiment,
  summarizeConnectedExpansionLift,
} from './experiment-measurement.mjs';
import { validateTenantId } from '../platform/tenant-context.mjs';

const ACTIVATION_MODES = new Set(['shadow', 'sandbox_assisted', 'production_assisted']);
const DIRECT_PII_FIELDS = new Set([
  'customer_name', 'account_holder_name', 'first_name', 'last_name', 'email', 'phone',
  'customer_address', 'account_holder_address', 'ssn', 'date_of_birth',
]);

export function createConnectedExpansionLoop({
  detector,
  ledgerRepository,
  measurementRepository,
  deliveryRepository,
  deliver,
}) {
  assert.equal(typeof detector, 'function', 'detector is required');
  assert.equal(typeof ledgerRepository?.append, 'function', 'ledgerRepository.append is required');
  assert.equal(typeof measurementRepository?.recordAssignment, 'function', 'measurementRepository.recordAssignment is required');
  assert.equal(typeof measurementRepository?.recordExposure, 'function', 'measurementRepository.recordExposure is required');
  assert.equal(typeof measurementRepository?.loadExperiment, 'function', 'measurementRepository.loadExperiment is required');
  assert.equal(typeof deliveryRepository?.reserve, 'function', 'deliveryRepository.reserve is required');
  assert.equal(typeof deliveryRepository?.complete, 'function', 'deliveryRepository.complete is required');
  assert.equal(typeof deliver, 'function', 'deliver is required');

  return {
    async runHousehold(input) {
      validateConnectedExpansionInput(input);
      const assignment = assignConnectedExpansionExperiment({
        tenantId: input.tenantId,
        experimentId: input.experiment.experimentId,
        householdToken: input.householdToken,
        holdoutPct: input.experiment.holdoutPct,
        standalonePct: input.experiment.standalonePct,
        connectedPct: input.experiment.connectedPct,
        salt: input.experiment.assignmentSalt,
        decisionProtocolId: input.experiment.decisionProtocolId,
        authorization: input.experiment.authorization,
        evidenceClass: input.sourceReceipt.evidenceClass,
        assignedAt: input.experiment.assignedAt,
      });
      await measurementRepository.recordAssignment(assignment);
      await appendLedger(ledgerRepository, input, assignment, {
        eventType: 'counterfactual',
        status: assignment.arm === 'holdout' ? 'suppressed' : evidenceStatus(input),
        idempotencyKey: `${input.caseId}:connected-assignment`,
        payload: {
          experiment_id: assignment.experimentId,
          assignment_id: assignment.assignmentId,
          arm: assignment.arm,
          design: assignment.design,
          authorization_scope_id: assignment.authorizationScopeId,
          decision_protocol_id: assignment.decisionProtocolId,
          prequalification_receipt_id: input.prequalification.receiptId,
        },
      });

      if (assignment.arm === 'holdout') {
        const exposure = buildExposure(input, assignment, {
          decisionEvaluated: false,
          actionDelivered: false,
          connectedDataUsed: false,
        });
        await measurementRepository.recordExposure(exposure);
        return result(input, assignment, null, 'holdout', null, exposure);
      }

      const connected = assignment.arm === 'connected';
      const records = connected ? input.connectedRecords : input.standaloneRecords;
      const detected = await detector({
        tenantId: input.tenantId,
        householdToken: input.householdToken,
        records,
        objective: input.objective,
        policies: input.policies,
        dataScope: assignment.arm,
        authorizationScopeId: assignment.authorizationScopeId,
        decisionProtocolId: assignment.decisionProtocolId,
      });
      const decision = validateDecision(input, records, detected);
      const decisionId = `dec_${sha256(`${input.tenantId}\u001f${input.caseId}\u001f${assignment.arm}`).slice(0, 24)}`;
      await appendLedger(ledgerRepository, input, assignment, {
        eventType: 'decision',
        status: decision.abstain ? 'suppressed' : evidenceStatus(input),
        idempotencyKey: `${input.caseId}:connected-decision:${assignment.arm}`,
        payload: {
          decision_id: decisionId,
          action_id: decision.actionId,
          abstain: decision.abstain,
          abstain_reason: decision.abstainReason,
          evidence_transaction_ids: decision.evidence.map((item) => item.transaction_id),
          data_scope: assignment.arm,
          authorization_scope_id: assignment.authorizationScopeId,
          decision_protocol_id: assignment.decisionProtocolId,
        },
      });

      if (decision.abstain || input.activationMode === 'shadow') {
        const exposure = buildExposure(input, assignment, {
          decisionEvaluated: true,
          actionDelivered: false,
          connectedDataUsed: connected,
        });
        await measurementRepository.recordExposure(exposure);
        return result(input, assignment, { ...decision, decisionId }, decision.abstain ? 'suppressed' : 'shadow_only', null, exposure);
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
      let receipt = reservation.record;
      if (reservation.shouldDeliver) {
        const delivered = await deliver({ input, assignment, decision: { ...decision, decisionId }, reservation: reservation.record });
        assert.ok(['delivered', 'failed'].includes(delivered.status), 'delivery callback status is unsupported');
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
        receipt = completed.record;
      }
      const actionDelivered = receipt.status === 'delivered';
      const exposure = buildExposure(input, assignment, {
        decisionEvaluated: true,
        actionDelivered,
        connectedDataUsed: connected,
      });
      await measurementRepository.recordExposure(exposure);
      await appendLedger(ledgerRepository, input, assignment, {
        eventType: 'activation',
        status: actionDelivered ? evidenceStatus(input) : 'failed',
        idempotencyKey: `${input.caseId}:connected-activation:${assignment.arm}`,
        payload: {
          decision_id: decisionId,
          delivery_id: receipt.delivery_id,
          delivery_status: receipt.status,
          data_scope: assignment.arm,
          connected_data_used: connected,
          authorization_scope_id: assignment.authorizationScopeId,
          decision_protocol_id: assignment.decisionProtocolId,
        },
      });
      return result(input, assignment, { ...decision, decisionId }, receipt.status, receipt, exposure);
    },

    async measureConnection({ tenantId, experimentId, metric, ...gates }) {
      const loaded = await measurementRepository.loadExperiment({ tenantId, experimentId });
      return summarizeConnectedExpansionLift({ ...loaded, metric, ...gates });
    },
  };
}

export function validateConnectedExpansionInput(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'connected expansion input must be an object');
  validateTenantId(input.tenantId);
  assertIdentifier(input.caseId, 'caseId');
  assert.match(input.householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  assertIdentifier(input.growthPlayId, 'growthPlayId');
  assertIdentifier(input.objective, 'objective');
  assertIsoDate(input.runAt, 'runAt');
  assert.ok(ACTIVATION_MODES.has(input.activationMode), 'activationMode is unsupported');
  assertIdentifier(input.sessionId, 'sessionId');
  assertIdentifier(input.ownerBusinessLine, 'ownerBusinessLine');
  assert.ok(input.sourceReceipt && ['synthetic', 'sandbox', 'sanctioned'].includes(input.sourceReceipt.evidenceClass), 'source receipt evidence class is unsupported');
  assertIdentifier(input.sourceReceipt.receiptId, 'sourceReceipt.receiptId');
  if (input.sourceReceipt.evidenceClass === 'synthetic') assert.equal(input.activationMode, 'shadow', 'synthetic evidence cannot activate');
  assert.ok(input.prequalification?.eligible === true, 'connected experiment requires an eligible prequalified cohort');
  assert.equal(input.prequalification.usedConnectedData, false, 'prequalification must not use connected data');
  assertIdentifier(input.prequalification.receiptId, 'prequalification.receiptId');
  assertIdentifier(input.prequalification.criteriaVersion, 'prequalification.criteriaVersion');
  assert.ok(Array.isArray(input.policies) && input.policies.length > 0, 'policies are required');
  for (const policy of input.policies) {
    assertIdentifier(policy.policy_id, 'policy.policy_id');
    assert.ok(['clear', 'review', 'block'].includes(policy.verdict), 'policy verdict is unsupported');
  }
  assert.ok(input.experiment && typeof input.experiment === 'object', 'experiment is required');
  assertIdentifier(input.experiment.experimentId, 'experiment.experimentId');
  assertIdentifier(input.experiment.decisionProtocolId, 'experiment.decisionProtocolId');
  assertIsoDate(input.experiment.assignedAt, 'experiment.assignedAt');
  assert.ok(Date.parse(input.experiment.assignedAt) <= Date.parse(input.runAt), 'experiment assignment must precede the run');

  const standalone = validateRecords(input.standaloneRecords, 'standaloneRecords');
  const connected = validateRecords(input.connectedRecords, 'connectedRecords');
  assert.ok(standalone.every((record) => record.business_line === input.ownerBusinessLine), 'standalone records must belong to the owner business line');
  const connectedById = new Map(connected.map((record) => [record.transaction_id, record]));
  for (const record of standalone) {
    assert.deepEqual(connectedById.get(record.transaction_id), record, `connected records changed standalone evidence ${record.transaction_id}`);
  }
  const authorization = input.experiment.authorization;
  assert.ok(authorization && typeof authorization === 'object', 'connected-data authorization is required');
  assertIsoDate(authorization.expiresAt, 'authorization.expiresAt');
  assert.ok(Date.parse(input.runAt) < Date.parse(authorization.expiresAt), 'connected-data authorization must be active at run time');
  const allowedLines = new Set(authorization.businessLines ?? []);
  const allowedSignals = new Set(authorization.signalClasses ?? []);
  assert.ok(connected.every((record) => allowedLines.has(record.business_line)), 'connected record business line is outside authorization');
  assert.ok(connected.every((record) => allowedSignals.has(record.signal_class)), 'connected record signal class is outside authorization');
  assert.ok(connected.some((record) => record.business_line !== input.ownerBusinessLine), 'connected arm requires authorized cross-business evidence');
  return input;
}

function validateRecords(records, label) {
  assert.ok(Array.isArray(records) && records.length > 0, `${label} must not be empty`);
  const ids = new Set();
  for (const record of records) {
    assert.ok(record && typeof record === 'object' && !Array.isArray(record), `${label} record must be an object`);
    assertNoDirectPii(record, label);
    assertIdentifier(record.transaction_id, `${label}.transaction_id`);
    assertIdentifier(record.business_line, `${label}.business_line`);
    assertIdentifier(record.signal_class, `${label}.signal_class`);
    assert.ok(!ids.has(record.transaction_id), `${label} duplicate transaction ${record.transaction_id}`);
    ids.add(record.transaction_id);
  }
  return records;
}

function validateDecision(input, records, decision) {
  assert.ok(decision && typeof decision === 'object' && !Array.isArray(decision), 'detector decision must be an object');
  assert.equal(typeof decision.abstain, 'boolean', 'detector abstain must be boolean');
  assert.ok(Number.isFinite(decision.confidence) && decision.confidence >= 0 && decision.confidence <= 1, 'detector confidence must be 0-1');
  assert.ok(Array.isArray(decision.evidence), 'detector evidence must be an array');
  const recordIds = new Set(records.map((record) => record.transaction_id));
  const citedIds = new Set();
  for (const evidence of decision.evidence) {
    assert.ok(recordIds.has(evidence.transaction_id), `detector cited unavailable evidence ${evidence.transaction_id}`);
    assert.ok(!citedIds.has(evidence.transaction_id), `detector cited duplicate evidence ${evidence.transaction_id}`);
    citedIds.add(evidence.transaction_id);
    assertIdentifier(evidence.signal_type, 'decision.evidence.signal_type');
  }
  const blocked = input.policies.find((policy) => policy.verdict === 'block');
  if (blocked) assert.equal(decision.abstain, true, `blocking policy ${blocked.policy_id} requires abstention`);
  if (decision.abstain) {
    assert.equal(decision.actionId, null, 'abstaining decision must not include an action');
    assert.ok(typeof decision.abstainReason === 'string' && decision.abstainReason.length > 0, 'abstention reason is required');
  } else {
    assertIdentifier(decision.actionId, 'decision.actionId');
    assertIdentifier(decision.connector, 'decision.connector');
    assertIdentifier(decision.destination, 'decision.destination');
    assert.ok(decision.evidence.length > 0, 'action requires evidence');
    assert.ok(decision.deliveryPayload && typeof decision.deliveryPayload === 'object', 'action requires a delivery payload');
    assertNoDirectPii(decision.deliveryPayload, 'decision.deliveryPayload');
    if (decision.deliveryPayload.household_token !== undefined) {
      assert.equal(decision.deliveryPayload.household_token, input.householdToken, 'delivery household token does not match input');
    }
  }
  return decision;
}

async function appendLedger(repository, input, assignment, event) {
  await repository.append({
    tenantId: input.tenantId,
    householdToken: input.householdToken,
    growthPlayId: input.growthPlayId,
    occurredAt: input.runAt,
    ...event,
  });
}

function buildExposure(input, assignment, { decisionEvaluated, actionDelivered, connectedDataUsed }) {
  return {
    contract_version: '1.0',
    event_id: `xps_${sha256(`${input.tenantId}\u001f${input.caseId}\u001f${assignment.arm}`).slice(0, 24)}`,
    tenant_id: input.tenantId,
    experiment_id: assignment.experimentId,
    household_token: input.householdToken,
    arm: assignment.arm,
    decision_evaluated: decisionEvaluated,
    action_delivered: actionDelivered,
    connected_data_used: connectedDataUsed,
    authorization_scope_id: assignment.authorizationScopeId,
    decision_protocol_id: assignment.decisionProtocolId,
    occurred_at: input.runAt,
  };
}

function result(input, assignment, decision, activation, receipt, exposure) {
  return {
    tenantId: input.tenantId,
    caseId: input.caseId,
    householdToken: input.householdToken,
    growthPlayId: input.growthPlayId,
    assignment,
    decision,
    activation,
    receipt,
    exposure,
    evidenceClass: input.sourceReceipt.evidenceClass,
    businessClaimAllowed: false,
    causalClaimAllowed: false,
  };
}

function evidenceStatus(input) {
  return input.sourceReceipt.evidenceClass === 'synthetic' ? 'simulated' : 'confirmed';
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 128, `${label} is invalid`);
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}

function assertNoDirectPii(value, label) {
  if (Array.isArray(value)) {
    for (const item of value) assertNoDirectPii(item, label);
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, nested] of Object.entries(value)) {
    assert.ok(!DIRECT_PII_FIELDS.has(key.toLowerCase()), `${label} direct PII field ${key} is prohibited`);
    assertNoDirectPii(nested, label);
  }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
