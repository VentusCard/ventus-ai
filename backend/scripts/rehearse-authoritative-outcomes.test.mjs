import assert from 'node:assert/strict';
import test from 'node:test';
import { runAuthoritativeOutcomeRehearsal } from './rehearse-authoritative-outcomes.mjs';

test('authoritative rehearsal covers both arms, explicit zeros, correction, and claim ceiling', async () => {
  const bundle = await runAuthoritativeOutcomeRehearsal({ generatedAt: '2026-08-02T00:00:00.000Z' });
  assert.equal(bundle.evidenceClass, 'sandbox');
  assert.equal(bundle.experiment.assignments.length, 4);
  assert.equal(bundle.experiment.observations.length, 5);
  assert.equal(bundle.experiment.corrections.length, 1);
  assert.equal(bundle.experiment.corrections[0].provenance.correction_sequence, 1);
  assert.ok(bundle.experiment.observations.some((event) => event.event_id === 'evt_rehearsal_treatment_value_v1'));

  const amountsByArm = Object.groupBy(bundle.experiment.observations, (event) => event.assignment.arm);
  for (const arm of ['treatment', 'holdout']) {
    const amounts = amountsByArm[arm].map((event) => event.value.amount);
    assert.ok(amounts.includes(0), `${arm} must include an explicit zero`);
    assert.ok(amounts.some((amount) => amount > 0), `${arm} must include a non-zero observation`);
  }
  assert.equal(bundle.measurement.status, 'measured');
  assert.equal(bundle.measurement.treatment.coverage, 1);
  assert.equal(bundle.measurement.holdout.coverage, 1);
  assert.equal(bundle.measurement.absoluteLift, 75);
  assert.equal(bundle.measurement.businessClaimAllowed, false);
  assert.equal(bundle.measurement.causalClaimAllowed, false);
  assert.equal(bundle.claimBoundary.liftComputedForRehearsal, true);
  assert.equal(bundle.claimBoundary.businessClaimAllowed, false);
  assert.equal(bundle.claimBoundary.causalClaimAllowed, false);
  assert.equal(bundle.state.appendOnly, true);
  assert.equal(bundle.state.earlierCorrectionRecordsPreserved, true);
  assert.ok(bundle.ledgerReceipts.length >= bundle.experiment.observations.length);
  assert.ok(bundle.manifestDigest.startsWith('sha256:'));
});

test('authoritative rehearsal derives tenant, arm, experiment, and protocol lineage server-side', async () => {
  const bundle = await runAuthoritativeOutcomeRehearsal({ generatedAt: '2026-08-02T00:00:00.000Z' });
  for (const event of bundle.experiment.observations) {
    assert.equal(event.tenant_id, bundle.experiment.tenantId);
    assert.equal(event.assignment.experiment_id, bundle.experiment.experimentId);
    assert.equal(event.assignment.decision_protocol_id, bundle.protocol.decisionProtocolId);
    assert.equal(event.assignment.arm, bundle.experiment.assignments.find(
      (assignment) => assignment.householdToken === event.household_token,
    ).arm);
  }
});
