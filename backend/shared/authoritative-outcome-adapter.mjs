import assert from 'node:assert/strict';

export class AuthoritativeOutcomeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthoritativeOutcomeError';
  }
}

/**
 * Converts one bank-owned economic outcome into Ventus's immutable outcome event.
 * Transport authentication belongs to the bank connector; this module only accepts
 * its already-authorized, minimal envelope.
 */
export function createAuthoritativeOutcomeAdapter({
  protocolRegistry,
  measurementRepository,
  ledgerRepository,
  operatingLoop,
  sourceContract,
}) {
  assertDependencies({ protocolRegistry, measurementRepository, ledgerRepository, operatingLoop });
  const source = normalizeSourceContract(sourceContract);

  return {
    async record(input) {
      assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'authoritative outcome request is required');
      assertExactKeys(input, ['tenantId', 'decisionProtocolId', 'businessLine', 'observation'], 'authoritative outcome request');
      const { tenantId, decisionProtocolId, businessLine, observation } = input;
      assertIdentifier(tenantId, 'tenantId');
      assertIdentifier(decisionProtocolId, 'decisionProtocolId');
      assertIdentifier(businessLine, 'businessLine');
      const normalized = normalizeObservation(observation, source);
      const experimentId = `exp_${decisionProtocolId.replace(/^dcp_/, '')}`;
      const loaded = await measurementRepository.loadExperiment({ tenantId, experimentId });
      assert.ok(loaded.assignments.length > 0, 'experiment has no persisted assignments');
      assertBinaryProtocolAssignments(loaded.assignments, decisionProtocolId);

      const assignment = loaded.assignments.find((item) => item.householdToken === normalized.subjectToken);
      assert.ok(assignment, 'outcome household has no persisted assignment');
      const approved = await protocolRegistry.requireApproved({
        tenantId,
        decisionProtocolId,
        businessLine,
        at: assignment.assignedAt,
      });
      const context = await ledgerRepository.loadOutcomeContext({
        tenantId,
        experimentId,
        householdToken: normalized.subjectToken,
      });
      assertContextMatches(context, assignment, approved.contract, decisionProtocolId);
      assertSourceMatchesGrowthPlay(approved.contract, normalized, source);
      assertObservationWindow(assignment, approved.contract, normalized);
      assertCorrectionSemantics(loaded.outcomes, normalized);
      assertTreatmentHoldoutParity(loaded.outcomes, normalized, source);

      const event = {
        contract_version: '1.0',
        event_id: normalized.eventId,
        tenant_id: tenantId,
        household_token: normalized.subjectToken,
        growth_play_id: context.growthPlayId,
        decision_id: context.decisionId,
        activation_id: context.activationId,
        event_type: normalized.eventType,
        occurred_at: normalized.occurredAt,
        assignment: {
          experiment_id: assignment.experimentId,
          arm: assignment.arm,
          assigned_at: assignment.assignedAt,
          decision_protocol_id: decisionProtocolId,
        },
        value: normalized.value,
        source_system: normalized.sourceSystem,
        source_record_id: normalized.sourceRecordId,
        reason_code: normalized.reasonCode,
        provenance: {
          source_version: normalized.sourceVersion,
          observed_at: normalized.observedAt,
          correction_sequence: normalized.correctionSequence,
        },
      };
      const recorded = await operatingLoop.recordOutcome(event, approved.contract);
      return {
        ...recorded,
        eventId: event.event_id,
        tenantId,
        householdToken: event.household_token,
        growthPlayId: event.growth_play_id,
        decisionId: event.decision_id,
        activationId: event.activation_id,
        experimentId,
        arm: assignment.arm,
        sourceVersion: normalized.sourceVersion,
        correctionSequence: normalized.correctionSequence,
        businessClaimAllowed: false,
        causalClaimAllowed: false,
      };
    },
  };
}

function assertDependencies({ protocolRegistry, measurementRepository, ledgerRepository, operatingLoop }) {
  for (const [name, value] of Object.entries({ protocolRegistry, measurementRepository, ledgerRepository, operatingLoop })) {
    assert.ok(value && typeof value === 'object', `${name} is required`);
  }
  assert.equal(typeof protocolRegistry.requireApproved, 'function', 'protocolRegistry.requireApproved is required');
  assert.equal(typeof measurementRepository.loadExperiment, 'function', 'measurementRepository.loadExperiment is required');
  assert.equal(typeof ledgerRepository.loadOutcomeContext, 'function', 'ledgerRepository.loadOutcomeContext is required');
  assert.equal(typeof operatingLoop.recordOutcome, 'function', 'operatingLoop.recordOutcome is required');
}

function normalizeSourceContract(value) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'authoritative source contract is required');
  assertExactKeys(value, ['sourceSystem', 'sourceVersion', 'metric', 'eventTypes', 'maxObservationLagDays'], 'authoritative source contract');
  assertIdentifier(value.sourceSystem, 'sourceSystem');
  assertIdentifier(value.sourceVersion, 'sourceVersion');
  assertIdentifier(value.metric, 'metric');
  assert.ok(Array.isArray(value.eventTypes) && value.eventTypes.length > 0, 'eventTypes are required');
  const eventTypes = [...new Set(value.eventTypes.map((item) => requiredIdentifier(item, 'eventType')))].sort();
  assert.ok(Number.isInteger(value.maxObservationLagDays) && value.maxObservationLagDays >= 1 && value.maxObservationLagDays <= 90,
    'maxObservationLagDays must be 1-90');
  return {
    sourceSystem: value.sourceSystem,
    sourceVersion: value.sourceVersion,
    metric: value.metric,
    eventTypes,
    maxObservationLagDays: value.maxObservationLagDays,
  };
}

function normalizeObservation(value, source) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'authoritative outcome observation is required');
  assertExactKeys(value, [
    'eventId', 'subjectToken', 'metric', 'value', 'eventType', 'sourceSystem', 'sourceRecordId',
    'sourceVersion', 'occurredAt', 'observedAt', 'correctionSequence', 'reasonCode',
  ], 'authoritative outcome observation');
  const eventId = requiredIdentifier(value.eventId, 'eventId');
  const subjectToken = requiredSubjectToken(value.subjectToken);
  const metric = requiredIdentifier(value.metric, 'metric');
  const eventType = requiredIdentifier(value.eventType, 'eventType');
  const sourceSystem = requiredIdentifier(value.sourceSystem, 'sourceSystem');
  const sourceRecordId = requiredIdentifier(value.sourceRecordId, 'sourceRecordId');
  const sourceVersion = requiredIdentifier(value.sourceVersion, 'sourceVersion');
  const occurredAt = requiredDate(value.occurredAt, 'occurredAt');
  const observedAt = requiredDate(value.observedAt, 'observedAt');
  assert.ok(Date.parse(observedAt) >= Date.parse(occurredAt), 'observedAt cannot predate occurredAt');
  assert.ok(Date.parse(observedAt) - Date.parse(occurredAt) <= source.maxObservationLagDays * 86_400_000,
    'outcome observation exceeds the approved freshness threshold');
  assert.ok(Number.isInteger(value.correctionSequence) && value.correctionSequence >= 0,
    'correctionSequence must be a non-negative integer');
  const reasonCode = value.reasonCode === undefined ? null : nullableIdentifier(value.reasonCode, 'reasonCode');
  const outcomeValue = normalizeValue(value.value, metric);
  return {
    eventId, subjectToken, metric, eventType, sourceSystem, sourceRecordId, sourceVersion,
    occurredAt, observedAt, correctionSequence: value.correctionSequence, reasonCode, value: outcomeValue,
  };
}

function normalizeValue(value, metric) {
  if (value === null) return null;
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'value must be an object or null');
  assertExactKeys(value, ['amount', 'currency'], 'value');
  assert.ok(Number.isFinite(value.amount), 'value.amount must be finite');
  assert.equal(value.currency, 'USD', 'value.currency must be USD');
  return { metric, amount: value.amount, currency: 'USD' };
}

function assertBinaryProtocolAssignments(assignments, decisionProtocolId) {
  for (const assignment of assignments) {
    assert.ok(['treatment', 'holdout'].includes(assignment.arm), 'authoritative outcome adapter accepts binary assignments only');
    assert.equal(assignment.decisionProtocolId, decisionProtocolId, 'assignment decision protocol does not match the requested protocol');
  }
}

function assertContextMatches(context, assignment, contract, decisionProtocolId) {
  assert.equal(context.assignmentId, assignment.assignmentId, 'ledger assignment ID does not match measurement assignment');
  assert.equal(context.arm, assignment.arm, 'ledger arm does not match measurement assignment');
  assert.equal(context.decisionProtocolId, decisionProtocolId, 'ledger decision protocol does not match measurement assignment');
  assert.equal(context.growthPlayId, contract.growth_play_id, 'ledger Growth Play does not match approved protocol');
}

function assertSourceMatchesGrowthPlay(contract, observation, source) {
  const measurement = contract?.measurement;
  assert.ok(measurement && typeof measurement === 'object', 'approved Growth Play measurement is required');
  assert.equal(observation.metric, source.metric, 'observation metric does not match the registered authoritative source');
  assert.equal(observation.sourceSystem, source.sourceSystem, 'observation source system does not match the registered authoritative source');
  assert.equal(observation.sourceVersion, source.sourceVersion, 'observation source version does not match the registered authoritative source');
  assert.ok(source.eventTypes.includes(observation.eventType), 'observation event type is not registered for the authoritative source');
  assert.equal(measurement.metric, observation.metric, 'outcome metric does not match the approved Growth Play');
  assert.ok(measurement.outcome_event_types.includes(observation.eventType), 'outcome event type is not approved by the Growth Play');
  assert.ok(measurement.outcome_source_systems.includes(observation.sourceSystem), 'outcome source system is not approved by the Growth Play');
}

function assertObservationWindow(assignment, contract, observation) {
  const windowDays = Number(contract?.measurement?.outcome_window_days ?? contract?.measurement?.window_days);
  assert.ok(Number.isInteger(windowDays) && windowDays >= 1, 'approved Growth Play outcome window is invalid');
  const assignedAt = Date.parse(assignment.assignedAt);
  const occurredAt = Date.parse(observation.occurredAt);
  assert.ok(occurredAt >= assignedAt, 'outcome cannot predate assignment');
  assert.ok(occurredAt <= assignedAt + windowDays * 86_400_000, 'outcome exceeds the approved Growth Play window');
}

function assertCorrectionSemantics(outcomes, observation) {
  const prior = outcomes
    .filter((event) => event?.household_token === observation.subjectToken
      && event?.source_system === observation.sourceSystem
      && event?.source_record_id === observation.sourceRecordId
      && event?.event_type === observation.eventType)
    .map((event) => event?.provenance?.correction_sequence)
    .filter(Number.isInteger);
  if (prior.length > 0) {
    assert.ok(observation.correctionSequence > Math.max(...prior), 'correctionSequence must advance for an existing source record');
  }
}

function assertTreatmentHoldoutParity(outcomes, observation, source) {
  for (const event of outcomes) {
    if (event?.value?.metric !== observation.metric) continue;
    assert.equal(event.source_system, source.sourceSystem, 'treatment and holdout outcomes must share one source system');
    assert.equal(event.event_type, observation.eventType, 'treatment and holdout outcomes must share one event type');
    assert.equal(event?.provenance?.source_version, source.sourceVersion,
      'treatment and holdout outcomes must share one source version');
  }
}

function assertExactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) assert.ok(allowed.includes(key), `${label} has unknown field ${key}`);
}

function requiredSubjectToken(value) {
  assert.ok(typeof value === 'string' && /^tok_[A-Za-z0-9_-]{8,120}$/.test(value), 'subjectToken must be opaque');
  return value;
}

function requiredIdentifier(value, label) {
  assertIdentifier(value, label);
  return value;
}

function nullableIdentifier(value, label) {
  if (value === null) return null;
  return requiredIdentifier(value, label);
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{1,255}$/.test(value), `${label} is invalid`);
}

function requiredDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be an ISO date-time`);
  return new Date(value).toISOString();
}
