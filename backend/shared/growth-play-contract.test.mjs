import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  compileGrowthPlayContract,
  parameterValues,
  probeGrowthPlay,
  validateCompiledGrowthPlayContract,
  validateGrowthPlayDecision,
  validateGrowthPlayOutcome,
  validateGrowthPlayRun,
  withParameterValues,
} from './growth-play-contract.mjs';

const drafts = JSON.parse(readFileSync(new URL('../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const consumer = compileGrowthPlayContract(drafts[0]);
const merrill = compileGrowthPlayContract(drafts[1]);

test('Growth Play compilation is deterministic, portable, and tamper evident', () => {
  assert.equal(consumer.decision_protocol_id, compileGrowthPlayContract(drafts[0]).decision_protocol_id);
  assert.match(consumer.decision_protocol_id, /^dcp_[a-f0-9]{24}$/);
  assert.match(consumer.protocol_digest, /^[a-f0-9]{64}$/);
  assert.equal(validateCompiledGrowthPlayContract(consumer).growth_play_id, 'deposit-primacy-defense');
  assert.equal(validateCompiledGrowthPlayContract(merrill).business_line, 'wealth-management');

  const tampered = structuredClone(consumer);
  tampered.actions[0].destination = 'unapproved_destination';
  assert.throws(() => validateCompiledGrowthPlayContract(tampered), /protocol digest does not match/);
  assert.throws(
    () => compileGrowthPlayContract({ ...drafts[0], policy_pack: [] }),
    /unknown field policy_pack/,
  );
});

test('trigger thresholds are protocol-bound, not free-floating detector literals', () => {
  assert.deepEqual(parameterValues(merrill), {
    min_transfer_amount: 100_000,
    min_corroborating_signals: 3,
    qualified_confidence: 0.89,
  });

  // The gap this closes: before v1.1 a threshold could change without changing the
  // approved protocol identity. Now any value change mints a new decision protocol.
  const loosened = withParameterValues(merrill, { min_transfer_amount: 75_000 }, { version: '1.1.0' });
  assert.notEqual(loosened.decision_protocol_id, merrill.decision_protocol_id);
  assert.notEqual(loosened.protocol_digest, merrill.protocol_digest);
  assert.equal(loosened.parameters.min_transfer_amount.value, 75_000);
  assert.equal(loosened.parameters.min_corroborating_signals.value, 3);

  const tampered = structuredClone(merrill);
  tampered.parameters.min_transfer_amount.value = 75_000;
  assert.throws(() => validateCompiledGrowthPlayContract(tampered), /protocol digest does not match/);
});

test('parameter updates cannot silently reuse an approved version or leave approved bounds', () => {
  assert.throws(
    () => withParameterValues(merrill, { min_transfer_amount: 75_000 }),
    /requires a new Growth Play version/,
  );
  assert.throws(
    () => withParameterValues(merrill, { min_transfer_amount: 1_000_000 }, { version: '1.1.0' }),
    /min_transfer_amount.value is outside its approved bounds/,
  );
  assert.throws(
    () => withParameterValues(merrill, { unapproved_knob: 1 }, { version: '1.1.0' }),
    /unknown Growth Play parameter unapproved_knob/,
  );
  assert.throws(
    () => compileGrowthPlayContract({
      ...drafts[1],
      parameters: {
        ...drafts[1].parameters,
        min_corroborating_signals: { value: 2.5, min: 2, max: 3, max_step: 1, resolution: 1, kind: 'integer' },
      },
    }),
    /must be an integer/,
  );
  assert.throws(
    () => compileGrowthPlayContract({
      ...drafts[1],
      parameters: {
        ...drafts[1].parameters,
        min_transfer_amount: { ...drafts[1].parameters.min_transfer_amount, resolution: 30_000 },
      },
    }),
    /resolution cannot exceed max_step/,
  );
  assert.throws(
    () => compileGrowthPlayContract({
      ...drafts[1],
      parameters: {
        ...drafts[1].parameters,
        min_transfer_amount: { ...drafts[1].parameters.min_transfer_amount, resolution: 3_000 },
      },
    }),
    /must be a multiple of resolution/,
  );
  assert.throws(
    () => compileGrowthPlayContract({
      ...drafts[1],
      learning: { ...drafts[1].learning, drift_budget: 0 },
    }),
    /learning.drift_budget must be/,
  );
});

test('offline probe plays carry no protocol identity', () => {
  const probe = probeGrowthPlay(merrill, { min_transfer_amount: 50_000 });
  assert.equal(probe.parameters.min_transfer_amount.value, 50_000);
  assert.equal(probe.decision_protocol_id, undefined);
  assert.equal(probe.protocol_digest, undefined);
  assert.equal(probe.probe, true);
  assert.throws(() => validateCompiledGrowthPlayContract(probe), /decision_protocol_id is invalid/);
  assert.throws(() => probeGrowthPlay(merrill, { min_transfer_amount: 5_000 }), /outside its approved bounds/);
});

test('Growth Play run rejects unapproved sources, rails, policy sets, and allocations', () => {
  const input = runInput(consumer);
  assert.equal(validateGrowthPlayRun(input, consumer).decision_protocol_id, consumer.decision_protocol_id);

  assert.throws(
    () => validateGrowthPlayRun({ ...input, records: [{ ...input.records[0], source_system: 'unknown_core' }] }, consumer),
    /record source unknown_core is not approved/,
  );
  assert.throws(
    () => validateGrowthPlayRun({ ...input, records: [{ ...input.records[0], rail: 'cash' }] }, consumer),
    /rail cash is not approved/,
  );
  assert.throws(
    () => validateGrowthPlayRun({ ...input, policies: input.policies.slice(0, 2) }, consumer),
    /policy set does not match/,
  );
  assert.throws(
    () => validateGrowthPlayRun({ ...input, experiment: { ...input.experiment, holdoutPct: 20 } }, consumer),
    /holdout allocation does not match/,
  );
  assert.throws(
    () => validateGrowthPlayRun({
      ...input,
      eligibilityReceipt: { ...input.eligibilityReceipt, criteriaVersion: 'other-criteria' },
    }, consumer),
    /eligibility criteria do not match/,
  );
});

test('Growth Play decision permits only approved action tuples and the evaluated household', () => {
  const input = runInput(consumer);
  const decision = approvedDecision(input, consumer);
  assert.equal(validateGrowthPlayDecision(input, decision, consumer).growth_play_id, consumer.growth_play_id);
  assert.throws(
    () => validateGrowthPlayDecision(input, { ...decision, destination: 'other_workbench' }, consumer),
    /destination does not match/,
  );
  assert.throws(
    () => validateGrowthPlayDecision(input, {
      ...decision,
      deliveryPayload: { ...decision.deliveryPayload, household_token: 'tok_wrong_household_0001' },
    }, consumer),
    /delivery household token does not match/,
  );
});

test('Growth Play outcome is constrained to protocol, metric, source, event, and window', () => {
  const assignment = {
    assignedAt: '2026-07-01T00:00:00.000Z',
    decisionProtocolId: merrill.decision_protocol_id,
  };
  const event = {
    growth_play_id: merrill.growth_play_id,
    event_type: 'assets_transferred',
    occurred_at: '2026-08-01T00:00:00.000Z',
    source_system: 'wealth_core_sandbox',
    assignment: { decision_protocol_id: merrill.decision_protocol_id },
    value: { metric: 'net_new_assets', amount: 275000, currency: 'USD' },
  };
  assert.equal(validateGrowthPlayOutcome(event, assignment, merrill).growth_play_id, merrill.growth_play_id);
  assert.throws(
    () => validateGrowthPlayOutcome({ ...event, value: { ...event.value, metric: 'deposit_retained' } }, assignment, merrill),
    /outcome metric does not match/,
  );
  assert.throws(
    () => validateGrowthPlayOutcome({ ...event, occurred_at: '2027-01-01T00:00:00.000Z' }, assignment, merrill),
    /outside the approved measurement window/,
  );
});

function runInput(play) {
  return {
    objective: play.objective,
    activationMode: 'sandbox_assisted',
    destinationEnvironment: 'sandbox',
    records: [
      {
        transaction_id: 'tx_payroll',
        source_system: 'deposit_core',
        rail: 'ach',
        amount: 4800,
        occurred_at: '2026-06-30T00:00:00.000Z',
      },
    ],
    sourceReceipt: { sourceSystem: 'partner_sandbox', schemaVersion: '1.0' },
    eligibilityReceipt: {
      receiptId: 'eligibility_receipt_01',
      criteriaVersion: play.eligibility.criteria_version,
      eligible: true,
      evaluatedAt: '2026-07-01T00:00:00.000Z',
      evidenceTransactionIds: ['tx_payroll'],
    },
    policyVersion: play.policy.version,
    policies: play.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' })),
    experiment: { holdoutPct: play.measurement.holdout_pct },
    householdToken: 'tok_household_000001',
  };
}

function approvedDecision(input, play) {
  const action = play.actions[0];
  return {
    growthPlayId: play.growth_play_id,
    abstain: false,
    actionId: action.action_id,
    ownerRole: action.owner_role,
    connector: action.connector,
    destination: action.destination,
    deliveryPayload: { household_token: input.householdToken, action: action.action_id },
  };
}
