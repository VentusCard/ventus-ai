import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createAuthoritativeOutcomeAdapter } from '../shared/authoritative-outcome-adapter.mjs';
import { summarizeIncrementalLift } from '../shared/experiment-measurement.mjs';
import { compileGrowthPlayContract } from '../shared/growth-play-contract.mjs';
import { createInMemoryGrowthPlayRegistry } from '../shared/growth-play-registry.mjs';

const TENANT_ID = 'bank_rehearsal';
const BUSINESS_LINE = 'consumer-banking';
const ASSIGNED_AT = '2026-07-01T00:00:00.000Z';
const SOURCE_CONTRACT = {
  sourceSystem: 'deposit_core_rehearsal',
  sourceVersion: 'deposit-retention-v1',
  metric: 'deposit_retained',
  eventTypes: ['deposit_balance_observed'],
  maxObservationLagDays: 7,
};
const GROWTH_PLAY = compileGrowthPlayContract({
  contract_version: '1.0',
  growth_play_id: 'deposit-primacy-defense',
  version: '1.0.0',
  business_line: BUSINESS_LINE,
  objective: 'Retain primary deposit relationships through governed banker review',
  source: {
    receipt_source_systems: ['bank_owned_rehearsal'],
    schema_versions: ['deposit-retention-v1'],
    record_sources: [{ source_system: 'deposit_core_rehearsal', allowed_rails: ['deposit_ledger'] }],
  },
  eligibility: { criteria_version: 'deposit-primacy-eligibility-v1' },
  policy: { version: 'consumer-policy-v1', required_policy_ids: ['consent'] },
  actions: [{
    action_id: 'banker_retention_review',
    owner_role: 'relationship_banker',
    connector: 'bank_workbench',
    destination: 'banker_workbench',
    destination_environment: 'sandbox',
  }],
  measurement: {
    metric: SOURCE_CONTRACT.metric,
    outcome_event_types: SOURCE_CONTRACT.eventTypes,
    outcome_source_systems: [SOURCE_CONTRACT.sourceSystem],
    outcome_window_days: 31,
    holdout_pct: 50,
    minimum_per_arm: 2,
    minimum_coverage: 1,
  },
});
const EXPERIMENT_ID = `exp_${GROWTH_PLAY.decision_protocol_id.slice(4)}`;

const ASSIGNMENTS = [
  assignment('tok_rehearsal_treatment_zero', 'asn_rehearsal_treatment_zero', 'treatment', 8_000),
  assignment('tok_rehearsal_treatment_value', 'asn_rehearsal_treatment_value', 'treatment', 8_001),
  assignment('tok_rehearsal_holdout_zero', 'asn_rehearsal_holdout_zero', 'holdout', 1_000),
  assignment('tok_rehearsal_holdout_value', 'asn_rehearsal_holdout_value', 'holdout', 1_001),
];

/**
 * Run the non-production bank-owned outcome rehearsal entirely in memory.
 * The adapter, rather than the fixture, derives arm and decision lineage.
 */
export async function runAuthoritativeOutcomeRehearsal({
  generatedAt = new Date().toISOString(),
} = {}) {
  assert.equal(GROWTH_PLAY.measurement.metric, SOURCE_CONTRACT.metric);
  const registry = createInMemoryGrowthPlayRegistry();
  await registry.register({
    tenantId: TENANT_ID,
    contract: GROWTH_PLAY,
    registeredBy: 'rehearsal_configurator',
    registeredBySessionId: 'rehearsal_config_session',
    identityProvider: 'rehearsal_control',
    registeredAt: '2026-06-30T00:00:00.000Z',
  });
  await registry.recordApproval({
    tenantId: TENANT_ID,
    decisionProtocolId: GROWTH_PLAY.decision_protocol_id,
    businessLine: BUSINESS_LINE,
    decision: 'approved',
    decidedBy: 'rehearsal_independent_reviewer',
    decidedBySessionId: 'rehearsal_approval_session',
    identityProvider: 'rehearsal_control',
    decidedAt: '2026-06-30T01:00:00.000Z',
    changeRecordId: 'rehearsal_change_record',
    reason: 'Approved for deterministic non-production outcome rehearsal.',
  });

  const state = { assignments: ASSIGNMENTS.map((item) => ({ ...item })), outcomes: [], ledgerReceipts: [] };
  const contexts = new Map(state.assignments.map((item) => [item.householdToken, {
    growthPlayId: GROWTH_PLAY.growth_play_id,
    decisionId: item.arm === 'treatment'
      ? `decision_${item.householdToken.slice(4)}`
      : `decision_${item.householdToken.slice(4)}`,
    assignmentId: item.assignmentId,
    arm: item.arm,
    decisionProtocolId: GROWTH_PLAY.decision_protocol_id,
    activationId: item.arm === 'treatment' ? `activation_${item.householdToken.slice(4)}` : null,
  }]));

  for (const item of state.assignments) {
    state.ledgerReceipts.push({
      receiptType: 'assignment',
      tenantId: TENANT_ID,
      experimentId: EXPERIMENT_ID,
      assignmentId: item.assignmentId,
      householdToken: item.householdToken,
      arm: item.arm,
      decisionProtocolId: GROWTH_PLAY.decision_protocol_id,
      recordedAt: item.assignedAt,
    });
  }

  const measurementRepository = {
    async loadExperiment({ tenantId, experimentId }) {
      assert.equal(tenantId, TENANT_ID);
      assert.equal(experimentId, EXPERIMENT_ID);
      return { assignments: state.assignments, outcomes: state.outcomes };
    },
  };
  const ledgerRepository = {
    async loadOutcomeContext({ tenantId, experimentId, householdToken }) {
      assert.equal(tenantId, TENANT_ID);
      assert.equal(experimentId, EXPERIMENT_ID);
      const context = contexts.get(householdToken);
      assert.ok(context, 'rehearsal context is not available');
      return context;
    },
  };
  const operatingLoop = {
    async recordOutcome(event) {
      state.outcomes.push(JSON.parse(JSON.stringify(event)));
      state.ledgerReceipts.push({
        receiptType: 'outcome',
        tenantId: event.tenant_id,
        experimentId: event.assignment.experiment_id,
        eventId: event.event_id,
        householdToken: event.household_token,
        arm: event.assignment.arm,
        decisionId: event.decision_id,
        decisionProtocolId: event.assignment.decision_protocol_id,
        correctionSequence: event.provenance.correction_sequence,
        recordedAt: event.occurred_at,
      });
      return { inserted: true, record: event, evidenceClass: 'sandbox' };
    },
  };
  const adapter = createAuthoritativeOutcomeAdapter({
    protocolRegistry: registry,
    measurementRepository,
    ledgerRepository,
    operatingLoop,
    sourceContract: SOURCE_CONTRACT,
  });

  const observations = [
    observation('evt_rehearsal_treatment_zero', 'tok_rehearsal_treatment_zero', 'record_treatment_zero', 0, '2026-07-03T00:00:00.000Z'),
    observation('evt_rehearsal_treatment_value_v1', 'tok_rehearsal_treatment_value', 'record_treatment_value', 200, '2026-07-03T00:00:00.000Z'),
    observation('evt_rehearsal_holdout_zero', 'tok_rehearsal_holdout_zero', 'record_holdout_zero', 0, '2026-07-03T00:00:00.000Z'),
    observation('evt_rehearsal_holdout_value', 'tok_rehearsal_holdout_value', 'record_holdout_value', 100, '2026-07-03T00:00:00.000Z'),
    observation('evt_rehearsal_treatment_value_v2', 'tok_rehearsal_treatment_value', 'record_treatment_value', 250, '2026-07-04T00:00:00.000Z', 1),
  ];
  const adapterReceipts = [];
  for (const item of observations) {
    adapterReceipts.push(await adapter.record({
      tenantId: TENANT_ID,
      decisionProtocolId: GROWTH_PLAY.decision_protocol_id,
      businessLine: BUSINESS_LINE,
      observation: item,
    }));
  }

  const measurement = summarizeIncrementalLift({
    assignments: state.assignments,
    outcomes: state.outcomes,
    metric: SOURCE_CONTRACT.metric,
    minimumPerArm: GROWTH_PLAY.measurement.minimum_per_arm,
    minimumCoverage: GROWTH_PLAY.measurement.minimum_coverage,
  });
  const corrections = state.outcomes.filter((event) => event.provenance.correction_sequence > 0);
  const earlierRecords = state.outcomes.filter((event) => event.event_id === 'evt_rehearsal_treatment_value_v1');
  assert.equal(corrections.length, 1);
  assert.equal(earlierRecords.length, 1);
  assert.equal(measurement.businessClaimAllowed, false);
  assert.equal(measurement.causalClaimAllowed, false);

  const core = {
    schemaVersion: 'ventus_authoritative_outcome_rehearsal/v1',
    generatedAt,
    evidenceClass: 'sandbox',
    sourceContract: SOURCE_CONTRACT,
    protocol: {
      decisionProtocolId: GROWTH_PLAY.decision_protocol_id,
      protocolDigest: GROWTH_PLAY.protocol_digest,
      businessLine: BUSINESS_LINE,
    },
    experiment: {
      tenantId: TENANT_ID,
      experimentId: EXPERIMENT_ID,
      assignments: state.assignments,
      observations: state.outcomes,
      corrections,
    },
    adapterReceipts,
    ledgerReceipts: state.ledgerReceipts,
    measurement,
    state: {
      status: measurement.status,
      treatment: measurement.treatment,
      holdout: measurement.holdout,
      appendOnly: true,
      earlierCorrectionRecordsPreserved: earlierRecords.length === 1,
    },
    claimBoundary: {
      evidenceClass: 'sandbox',
      liftComputedForRehearsal: measurement.absoluteLift !== null,
      businessClaimAllowed: false,
      causalClaimAllowed: false,
      reason: 'Deterministic partner-sandbox rehearsal; no business or causal claim is authorized.',
    },
  };
  return { ...core, manifestDigest: digest(core) };
}

function assignment(householdToken, assignmentId, arm, bucket) {
  return {
    assignmentId,
    tenantId: TENANT_ID,
    experimentId: EXPERIMENT_ID,
    householdToken,
    arm,
    design: 'binary',
    holdoutPct: 50,
    bucket,
    evidenceClass: 'sandbox',
    assignedAt: ASSIGNED_AT,
    decisionProtocolId: GROWTH_PLAY.decision_protocol_id,
  };
}

function observation(eventId, subjectToken, sourceRecordId, amount, observedAt, correctionSequence = 0) {
  return {
    eventId,
    subjectToken,
    metric: SOURCE_CONTRACT.metric,
    value: { amount, currency: 'USD' },
    eventType: SOURCE_CONTRACT.eventTypes[0],
    sourceSystem: SOURCE_CONTRACT.sourceSystem,
    sourceRecordId,
    sourceVersion: SOURCE_CONTRACT.sourceVersion,
    occurredAt: '2026-07-02T00:00:00.000Z',
    observedAt,
    correctionSequence,
    reasonCode: 'rehearsal_source_observation',
  };
}

function digest(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

async function main() {
  const bundle = await runAuthoritativeOutcomeRehearsal();
  const outIndex = process.argv.indexOf('--out');
  const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : null;
  const serialized = `${JSON.stringify(bundle, null, 2)}\n`;
  if (outPath) writeFileSync(resolve(outPath), serialized, 'utf8');
  process.stdout.write(serialized);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`authoritative outcome rehearsal failed: ${error.message}`);
    process.exitCode = 1;
  });
}
