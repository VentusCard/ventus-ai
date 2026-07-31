import assert from 'node:assert/strict';
import test from 'node:test';
import { createAuthoritativeOutcomeAdapter } from './authoritative-outcome-adapter.mjs';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { createInMemoryGrowthPlayRegistry } from './growth-play-registry.mjs';

const ASSIGNED_AT = '2026-07-01T00:00:00.000Z';
const sourceContract = {
  sourceSystem: 'deposit_core_sandbox',
  sourceVersion: 'deposit-retention-v1',
  metric: 'deposit_retained',
  eventTypes: ['deposit_balance_observed'],
  maxObservationLagDays: 7,
};
const draft = {
  contract_version: '1.0', growth_play_id: 'deposit-primacy-defense', version: '1.0.0', business_line: 'consumer-banking',
  objective: 'Retain primary deposit relationships',
  source: { receipt_source_systems: ['partner_sandbox'], schema_versions: ['1.0'], record_sources: [{ source_system: 'deposit_core', allowed_rails: ['ach'] }] },
  eligibility: { criteria_version: 'deposit-primacy-eligibility-v1' },
  policy: { version: 'consumer-policy-v1', required_policy_ids: ['consent'] },
  actions: [{ action_id: 'banker_retention_review', owner_role: 'relationship_banker', connector: 'bank_workbench', destination: 'banker_workbench', destination_environment: 'sandbox' }],
  measurement: { metric: 'deposit_retained', outcome_event_types: ['deposit_balance_observed'], outcome_source_systems: ['deposit_core_sandbox'], outcome_window_days: 31, holdout_pct: 10, minimum_per_arm: 30, minimum_coverage: 0.9 },
};
const play = compileGrowthPlayContract(draft);
const experimentId = `exp_${play.decision_protocol_id.slice(4)}`;

test('authoritative outcome adapter derives immutable lineage and preserves source provenance', async () => {
  const { adapter, captured } = await service();
  const receipt = await adapter.record(request());
  assert.equal(receipt.eventId, 'evt_deposit_001');
  assert.equal(receipt.decisionId, 'decision_treatment_001');
  assert.equal(receipt.activationId, 'activation_treatment_001');
  assert.equal(receipt.sourceVersion, sourceContract.sourceVersion);
  assert.equal(receipt.correctionSequence, 0);
  assert.equal(receipt.businessClaimAllowed, false);
  assert.deepEqual(captured[0].provenance, {
    source_version: sourceContract.sourceVersion,
    observed_at: '2026-07-03T00:00:00.000Z',
    correction_sequence: 0,
  });
  assert.equal(captured[0].value.amount, 0, 'a zero amount must remain an explicit observation');
});

test('authoritative outcome adapter rejects caller lineage, stale data, invalid source and non-advancing corrections', async () => {
  const prior = [{
    household_token: 'tok_household_000001', source_system: sourceContract.sourceSystem,
    source_record_id: 'eligible_balance_001', event_type: 'deposit_balance_observed',
    value: { metric: 'deposit_retained', amount: 100, currency: 'USD' },
    provenance: { source_version: sourceContract.sourceVersion, observed_at: '2026-07-03T00:00:00.000Z', correction_sequence: 0 },
  }];
  const { adapter } = await service({ outcomes: prior });
  await assert.rejects(() => adapter.record(request({}, { decisionId: 'fabricated' })), /unknown field decisionId/);
  await assert.rejects(() => adapter.record(request({ sourceVersion: 'unapproved-v2' })), /source version/);
  await assert.rejects(() => adapter.record(request({ observedAt: '2026-07-20T00:00:00.000Z' })), /freshness threshold/);
  await assert.rejects(() => adapter.record(request()), /correctionSequence must advance/);
});

test('authoritative outcome adapter enforces treatment/holdout source-version parity and accepts a correction', async () => {
  const prior = [{
    household_token: 'tok_household_000002', source_system: sourceContract.sourceSystem,
    source_record_id: 'eligible_balance_002', event_type: 'deposit_balance_observed',
    value: { metric: 'deposit_retained', amount: 100, currency: 'USD' },
    provenance: { source_version: 'deposit-retention-v0', observed_at: '2026-07-03T00:00:00.000Z', correction_sequence: 0 },
  }];
  const inconsistent = await service({ outcomes: prior });
  await assert.rejects(() => inconsistent.adapter.record(request()), /source version/);

  const corrected = await service({ outcomes: [{
    household_token: 'tok_household_000001', source_system: sourceContract.sourceSystem,
    source_record_id: 'eligible_balance_001', event_type: 'deposit_balance_observed',
    value: { metric: 'deposit_retained', amount: 100, currency: 'USD' },
    provenance: { source_version: sourceContract.sourceVersion, observed_at: '2026-07-03T00:00:00.000Z', correction_sequence: 0 },
  }] });
  const receipt = await corrected.adapter.record(request({ eventId: 'evt_deposit_002', correctionSequence: 1 }));
  assert.equal(receipt.correctionSequence, 1);
});

async function service({ outcomes = [] } = {}) {
  const registry = createInMemoryGrowthPlayRegistry();
  await registry.register({ tenantId: 'bank_1', contract: play, registeredBy: 'configurator_1', registeredBySessionId: 'session_1', identityProvider: 'bank_sso', registeredAt: '2026-06-30T00:00:00.000Z' });
  await registry.recordApproval({ tenantId: 'bank_1', decisionProtocolId: play.decision_protocol_id, businessLine: play.business_line, decision: 'approved', decidedBy: 'consumer_owner_1', decidedBySessionId: 'session_2', identityProvider: 'bank_sso', decidedAt: '2026-06-30T01:00:00.000Z', changeRecordId: 'change_1', reason: 'Approved.' });
  const captured = [];
  const assignments = [
    assignment('tok_household_000001', 'assignment_treatment_001', 'treatment'),
    assignment('tok_household_000002', 'assignment_holdout_001', 'holdout'),
  ];
  return {
    captured,
    adapter: createAuthoritativeOutcomeAdapter({
      protocolRegistry: registry,
      measurementRepository: { async loadExperiment() { return { assignments, outcomes }; } },
      ledgerRepository: { async loadOutcomeContext({ householdToken }) {
        const treatment = householdToken.endsWith('1');
        return {
          growthPlayId: play.growth_play_id, decisionId: treatment ? 'decision_treatment_001' : 'decision_holdout_001',
          assignmentId: treatment ? 'assignment_treatment_001' : 'assignment_holdout_001', arm: treatment ? 'treatment' : 'holdout',
          decisionProtocolId: play.decision_protocol_id, activationId: treatment ? 'activation_treatment_001' : null,
        };
      } },
      operatingLoop: { async recordOutcome(event) { captured.push(event); return { inserted: true, evidenceClass: 'sanctioned' }; } },
      sourceContract,
    }),
  };
}

function assignment(householdToken, assignmentId, arm) {
  return { assignmentId, tenantId: 'bank_1', experimentId, householdToken, arm, design: 'binary', evidenceClass: 'sanctioned', assignedAt: ASSIGNED_AT, decisionProtocolId: play.decision_protocol_id };
}

function request(observationOverrides = {}, requestOverrides = {}) {
  return {
    tenantId: 'bank_1', decisionProtocolId: play.decision_protocol_id, businessLine: play.business_line,
    observation: {
      eventId: 'evt_deposit_001', subjectToken: 'tok_household_000001', metric: 'deposit_retained', value: { amount: 0, currency: 'USD' },
      eventType: 'deposit_balance_observed', sourceSystem: sourceContract.sourceSystem, sourceRecordId: 'eligible_balance_001',
      sourceVersion: sourceContract.sourceVersion, occurredAt: '2026-07-02T00:00:00.000Z', observedAt: '2026-07-03T00:00:00.000Z', correctionSequence: 0,
      ...observationOverrides,
    },
    ...requestOverrides,
  };
}
