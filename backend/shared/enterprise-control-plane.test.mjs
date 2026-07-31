import assert from 'node:assert/strict';
import test from 'node:test';
import { buildFscMeasurementEvent, fscObservationReceiptId, projectMeasurementReadiness } from './enterprise-control-plane.mjs';

test('FSC measurement promotion produces an immutable event tied to the existing assignment', () => {
  const event = buildFscMeasurementEvent({
    tenantId: 'pilot_bank',
    moment: { decisionPackage: { subject: { token: 'tok_abcdefgh' }, growthPlay: { id: 'deposit-primacy-defense' } } },
    outcome: { decisionId: 'dec_123', decisionRecordId: 'a09123456789012AAA' },
    observationReceipt: { observationId: 'obs_123', observation: { eventType: 'deposit_retained', sourceRecordId: 'core_123' } },
    assignment: { experiment_id: 'exp_123', arm: 'treatment', assigned_at: '2026-07-30T00:00:00.000Z', decision_protocol_id: 'deposit-retention-v1' },
    metric: 'deposit_retained', amount: 1, occurredAt: '2026-07-31T00:00:00.000Z',
  });

  assert.equal(event.contract_version, '1.0');
  assert.equal(event.assignment.experiment_id, 'exp_123');
  assert.equal(event.value.metric, 'deposit_retained');
  assert.match(event.event_id, /^evt_[a-f0-9]{24}$/);
  assert.equal(event.provenance.source_version, 'salesforce-fsc-v1');
});

test('FSC corrections receive a new receipt identity while exact retries remain idempotent', () => {
  const base = {
    tenantId: 'pilot_bank',
    decisionRecordId: 'a09123456789012AAA',
    outcome: {
      outcome: {
        status: 'measured',
        observation: {
          eventType: 'deposit_balance_observed', occurredAt: '2026-07-31T00:00:00.000Z',
          sourceRecordId: 'core_123', metric: 'deposit_retained', amount: 100, currency: 'USD',
        },
      },
    },
  };
  const original = fscObservationReceiptId(base);
  const retry = fscObservationReceiptId(base);
  const correction = fscObservationReceiptId({
    ...base,
    outcome: { outcome: { ...base.outcome.outcome, observation: { ...base.outcome.outcome.observation, amount: 125 } } },
  });
  assert.equal(original, retry);
  assert.notEqual(original, correction);
});

test('measurement readiness requires measured outcomes in both arms, not only assignments', () => {
  const readiness = projectMeasurementReadiness({
    treatment_assigned: 30, holdout_assigned: 30,
    treatment_outcomes_observed: 27, holdout_outcomes_observed: 27,
    minimum_per_arm: 30, minimum_coverage: 0.9,
  });
  assert.equal(readiness.coverageReady, true);
  assert.equal(readiness.sampleReady, false);
  assert.equal(readiness.ready, false);
  assert.equal(readiness.claimStatus, 'not_eligible');
});
