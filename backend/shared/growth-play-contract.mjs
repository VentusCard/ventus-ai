import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const METRICS = new Set([
  'deposit_balance',
  'deposit_retained',
  'net_new_assets',
  'estimated_revenue',
]);
const DESTINATION_ENVIRONMENTS = new Set(['sandbox', 'production']);

export function compileGrowthPlayContract(draft) {
  assert.ok(draft && typeof draft === 'object' && !Array.isArray(draft), 'growth play draft must be an object');
  assertExactKeys(draft, [
    'contract_version', 'growth_play_id', 'version', 'business_line', 'objective',
    'source', 'eligibility', 'policy', 'actions', 'measurement',
  ], 'growth play draft');
  assert.equal(draft.contract_version, '1.0', 'growth play contract_version must be 1.0');
  assertIdentifier(draft.growth_play_id, 'growth_play_id');
  assertIdentifier(draft.version, 'version');
  assertIdentifier(draft.business_line, 'business_line');
  assertText(draft.objective, 'objective', 12, 500);
  assertExactKeys(draft.eligibility, ['criteria_version'], 'eligibility');
  assertIdentifier(draft.eligibility?.criteria_version, 'eligibility.criteria_version');

  const source = normalizeSource(draft.source);
  const policy = normalizePolicy(draft.policy);
  const actions = normalizeActions(draft.actions);
  const measurement = normalizeMeasurement(draft.measurement);
  const normalized = {
    contract_version: '1.0',
    growth_play_id: draft.growth_play_id,
    version: draft.version,
    business_line: draft.business_line,
    objective: draft.objective.trim(),
    source,
    eligibility: { criteria_version: draft.eligibility.criteria_version },
    policy,
    actions,
    measurement,
  };
  const protocolDigest = sha256(canonicalStringify(normalized));
  return deepFreeze({
    ...normalized,
    decision_protocol_id: `dcp_${protocolDigest.slice(0, 24)}`,
    protocol_digest: protocolDigest,
  });
}

export function validateCompiledGrowthPlayContract(contract) {
  assert.ok(contract && typeof contract === 'object' && !Array.isArray(contract), 'compiled growth play is required');
  const { decision_protocol_id: decisionProtocolId, protocol_digest: protocolDigest, ...draft } = contract;
  assertIdentifier(decisionProtocolId, 'decision_protocol_id');
  assert.match(protocolDigest, /^[a-f0-9]{64}$/, 'protocol_digest must be SHA-256 hex');
  const expected = compileGrowthPlayContract(draft);
  assert.equal(protocolDigest, expected.protocol_digest, 'growth play protocol digest does not match its configuration');
  assert.equal(decisionProtocolId, expected.decision_protocol_id, 'growth play decision protocol id does not match its configuration');
  return expected;
}

export function validateGrowthPlayRun(input, contract) {
  const play = validateCompiledGrowthPlayContract(contract);
  assert.equal(input.objective, play.objective, 'run objective does not match the compiled Growth Play');
  assert.ok(play.source.receipt_source_systems.includes(input.sourceReceipt.sourceSystem), 'source receipt system is not approved by the Growth Play');
  assert.ok(play.source.schema_versions.includes(input.sourceReceipt.schemaVersion), 'source schema version is not approved by the Growth Play');

  const sourceBySystem = new Map(play.source.record_sources.map((source) => [source.source_system, source]));
  for (const record of input.records) {
    const approved = sourceBySystem.get(record.source_system);
    assert.ok(approved, `record source ${record.source_system} is not approved by the Growth Play`);
    assert.ok(approved.allowed_rails.includes(record.rail), `rail ${record.rail} is not approved for ${record.source_system}`);
  }

  assert.equal(input.policyVersion, play.policy.version, 'policy version does not match the compiled Growth Play');
  assert.equal(input.eligibilityReceipt.criteriaVersion, play.eligibility.criteria_version, 'eligibility criteria do not match the compiled Growth Play');
  assert.equal(input.eligibilityReceipt.eligible, true, 'household is not eligible for the Growth Play');
  const actualPolicyIds = [...new Set(input.policies.map((policy) => policy.policy_id))].sort();
  assert.deepEqual(actualPolicyIds, play.policy.required_policy_ids, 'policy set does not match the compiled Growth Play');
  if (input.activationMode !== 'shadow') {
    assert.equal(input.experiment.holdoutPct, play.measurement.holdout_pct, 'holdout allocation does not match the compiled Growth Play');
  }
  return play;
}

export function validateGrowthPlayDecision(input, decision, contract) {
  const play = validateCompiledGrowthPlayContract(contract);
  assert.equal(decision.growthPlayId, play.growth_play_id, 'detector selected a different Growth Play');
  if (decision.abstain) return play;

  const approved = play.actions.find((action) => action.action_id === decision.actionId);
  assert.ok(approved, `action ${decision.actionId} is not approved by the Growth Play`);
  assert.equal(decision.ownerRole, approved.owner_role, 'decision owner does not match the approved action');
  assert.equal(decision.connector, approved.connector, 'decision connector does not match the approved action');
  assert.equal(decision.destination, approved.destination, 'decision destination does not match the approved action');
  assert.equal(input.destinationEnvironment, approved.destination_environment, 'destination environment does not match the approved action');
  assert.equal(decision.deliveryPayload.household_token, input.householdToken, 'delivery household token does not match the evaluated household');
  assert.equal(decision.deliveryPayload.action, decision.actionId, 'delivery action does not match the approved decision');
  return play;
}

export function validateGrowthPlayOutcome(event, assignment, contract) {
  const play = validateCompiledGrowthPlayContract(contract);
  assert.equal(event.growth_play_id, play.growth_play_id, 'outcome Growth Play does not match the compiled contract');
  assert.equal(event.assignment.decision_protocol_id, play.decision_protocol_id, 'outcome decision protocol does not match the compiled contract');
  assert.equal(assignment.decisionProtocolId, play.decision_protocol_id, 'persisted assignment does not match the compiled contract');
  assert.ok(play.measurement.outcome_event_types.includes(event.event_type), 'outcome event type is not approved by the Growth Play');
  assert.ok(play.measurement.outcome_source_systems.includes(event.source_system), 'outcome source system is not approved by the Growth Play');
  assert.equal(event.value?.metric, play.measurement.metric, 'outcome metric does not match the Growth Play');
  const elapsedMs = Date.parse(event.occurred_at) - Date.parse(assignment.assignedAt);
  assert.ok(elapsedMs >= 0, 'outcome cannot predate assignment');
  assert.ok(elapsedMs <= play.measurement.outcome_window_days * 86_400_000, 'outcome is outside the approved measurement window');
  return play;
}

function normalizeSource(source) {
  assert.ok(source && typeof source === 'object' && !Array.isArray(source), 'source contract is required');
  assertExactKeys(source, ['receipt_source_systems', 'schema_versions', 'record_sources'], 'source');
  const receiptSourceSystems = uniqueIdentifiers(source.receipt_source_systems, 'source.receipt_source_systems');
  const schemaVersions = uniqueIdentifiers(source.schema_versions, 'source.schema_versions');
  assert.ok(Array.isArray(source.record_sources) && source.record_sources.length > 0, 'source.record_sources are required');
  const seen = new Set();
  const recordSources = source.record_sources.map((item) => {
    assertExactKeys(item, ['source_system', 'allowed_rails'], 'source.record_sources item');
    assertIdentifier(item?.source_system, 'source.record_sources.source_system');
    assert.ok(!seen.has(item.source_system), `duplicate record source ${item.source_system}`);
    seen.add(item.source_system);
    return {
      source_system: item.source_system,
      allowed_rails: uniqueIdentifiers(item.allowed_rails, `source ${item.source_system} allowed_rails`),
    };
  }).sort((left, right) => left.source_system.localeCompare(right.source_system));
  return { receipt_source_systems: receiptSourceSystems, schema_versions: schemaVersions, record_sources: recordSources };
}

function normalizePolicy(policy) {
  assert.ok(policy && typeof policy === 'object' && !Array.isArray(policy), 'policy contract is required');
  assertExactKeys(policy, ['version', 'required_policy_ids'], 'policy');
  assertIdentifier(policy.version, 'policy.version');
  return {
    version: policy.version,
    required_policy_ids: uniqueIdentifiers(policy.required_policy_ids, 'policy.required_policy_ids'),
  };
}

function normalizeActions(actions) {
  assert.ok(Array.isArray(actions) && actions.length > 0, 'at least one approved action is required');
  const seen = new Set();
  return actions.map((action) => {
    assertExactKeys(action, ['action_id', 'owner_role', 'connector', 'destination', 'destination_environment'], 'action');
    for (const field of ['action_id', 'owner_role', 'connector', 'destination']) assertIdentifier(action?.[field], `action.${field}`);
    assert.ok(!seen.has(action.action_id), `duplicate action ${action.action_id}`);
    seen.add(action.action_id);
    assert.ok(DESTINATION_ENVIRONMENTS.has(action.destination_environment), 'action.destination_environment is unsupported');
    return {
      action_id: action.action_id,
      owner_role: action.owner_role,
      connector: action.connector,
      destination: action.destination,
      destination_environment: action.destination_environment,
    };
  }).sort((left, right) => left.action_id.localeCompare(right.action_id));
}

function normalizeMeasurement(measurement) {
  assert.ok(measurement && typeof measurement === 'object' && !Array.isArray(measurement), 'measurement contract is required');
  assertExactKeys(measurement, [
    'metric', 'outcome_event_types', 'outcome_source_systems', 'outcome_window_days',
    'holdout_pct', 'minimum_per_arm', 'minimum_coverage',
  ], 'measurement');
  assert.ok(METRICS.has(measurement.metric), 'measurement.metric is unsupported');
  assert.ok(Number.isFinite(measurement.holdout_pct) && measurement.holdout_pct >= 5 && measurement.holdout_pct <= 50, 'measurement.holdout_pct must be 5-50');
  assert.ok(Number.isInteger(measurement.minimum_per_arm) && measurement.minimum_per_arm >= 1, 'measurement.minimum_per_arm must be positive');
  assert.ok(Number.isFinite(measurement.minimum_coverage) && measurement.minimum_coverage > 0 && measurement.minimum_coverage <= 1, 'measurement.minimum_coverage must be 0-1');
  assert.ok(Number.isInteger(measurement.outcome_window_days) && measurement.outcome_window_days >= 1 && measurement.outcome_window_days <= 730, 'measurement.outcome_window_days must be 1-730');
  return {
    metric: measurement.metric,
    outcome_event_types: uniqueIdentifiers(measurement.outcome_event_types, 'measurement.outcome_event_types'),
    outcome_source_systems: uniqueIdentifiers(measurement.outcome_source_systems, 'measurement.outcome_source_systems'),
    outcome_window_days: measurement.outcome_window_days,
    holdout_pct: measurement.holdout_pct,
    minimum_per_arm: measurement.minimum_per_arm,
    minimum_coverage: measurement.minimum_coverage,
  };
}

function uniqueIdentifiers(values, label) {
  assert.ok(Array.isArray(values) && values.length > 0, `${label} must be a non-empty array`);
  for (const value of values) assertIdentifier(value, label);
  assert.equal(new Set(values).size, values.length, `${label} contains duplicates`);
  return [...values].sort();
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(value), `${label} is invalid`);
}

function assertText(value, label, minimum, maximum) {
  assert.ok(typeof value === 'string' && value.trim().length >= minimum && value.trim().length <= maximum, `${label} is invalid`);
}

function assertExactKeys(value, allowed, label) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
  const allowedKeys = new Set(allowed);
  for (const key of Object.keys(value)) assert.ok(allowedKeys.has(key), `${label} contains unknown field ${key}`);
  for (const key of allowed) assert.ok(Object.hasOwn(value, key), `${label} is missing ${key}`);
}

function canonicalStringify(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}
