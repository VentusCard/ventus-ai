// Offline end-to-end check of the Growth Play learning loop.
//
// Runs the full chain against a synthetic plant: compile → fit the initial vector from a
// demonstration → estimate sensitivity by replay → iterate waves against a simulated,
// deliberately mis-specified response → print the learning curve.
//
// The plant is synthetic and the lift numbers are simulated evidence only. What this proves
// is orchestration, gating, and convergence behaviour of the update rule — not that any bank
// metric moves. Real waves require the pilot evidence sequence.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileGrowthPlayContract, parameterValues } from '../shared/growth-play-contract.mjs';
import { fitParametersFromDemonstrations } from '../shared/parameter-fit.mjs';
import { applyWaveUpdate, planWaveUpdate } from '../shared/play-ilc.mjs';
import { estimateSensitivity, refineMetricRow } from '../shared/play-sensitivity.mjs';
import { merrillRelationshipDetector } from '../shared/standalone-growth-play-detectors.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const drafts = JSON.parse(readFileSync(
  resolve(process.env.VENTUS_GROWTH_PLAY_DRAFTS || `${scriptDir}/../fixtures/evaluation/growth-play-drafts.json`),
  'utf8',
));
const draft = drafts.find((item) => item.growth_play_id === 'merrill-relationship-growth');
assert.ok(draft, 'merrill-relationship-growth draft is required');

const EXPERT_THRESHOLD = 150_000;
const TARGET_LIFT = 20_000;
const HOLDOUT_MEAN = 40_000;
// The plant the loop does not know: one approved step moves lift by 8k. The prior says 12k.
const TRUE_STEP_RESPONSE = 8_000;
const PRIOR_STEP_RESPONSE = 12_000;

const cases = buildCases();
const demonstrated = cases.filter((item) => item.transferAmount >= EXPERT_THRESHOLD).map((item) => item.householdToken);
const declared = compileGrowthPlayContract(draft);

// ── 1. Initialize from the demonstration rather than cold.
const fit = fitParametersFromDemonstrations({
  contract: declared, detector: merrillRelationshipDetector, cases, demonstratedHouseholds: demonstrated,
});
console.log('\n1. Demonstration fit');
console.log(`   declared min_transfer_amount ${fit.declaredValues.min_transfer_amount} → fitted ${fit.fittedValues.min_transfer_amount}`);
console.log(`   F1 against the expert: ${fit.baselineScore.f1} → ${fit.fittedScore.f1} (${fit.evaluations} evaluations)`);
assert.equal(fit.fittedValues.min_transfer_amount, EXPERT_THRESHOLD, 'fit should recover the demonstrated threshold');

// ── 2. Coarse sensitivity by replay. Decision-side only; the metric row is a prior.
const sensitivity = estimateSensitivity({
  contract: declared, detector: merrillRelationshipDetector, cases, labelledHouseholds: demonstrated,
});
console.log('\n2. Replay sensitivity (per approved step)');
for (const [name, row] of Object.entries(sensitivity.jacobian)) {
  console.log(`   ${name.padEnd(28)}qualified_rate ${signed(row.qualified_rate)}   mean_confidence ${signed(row.mean_confidence)}`);
}
assert.ok(sensitivity.jacobian.min_transfer_amount.qualified_rate < 0, 'tightening the trigger must reduce volume');
assert.equal(sensitivity.outcomeRowIncluded, false);

// ── 3. Iterate waves against the plant.
let play = compileGrowthPlayContract({
  ...draft,
  version: '1.1.0',
  parameters: withValues(draft.parameters, fit.fittedValues),
  learning: { enabled: true, max_waves: 10, drift_budget: 6, noise_gate_sigma: 1 },
});
let jacobian = { ...priorJacobian() };
let appliedDrift = 0;
const waveHistory = [];
const observedWaves = [];
const curve = [];

console.log('\n3. Wave learning curve');
console.log('   wave  min_transfer_amount   lift      error   step   drift   status');
for (let wave = 1; wave <= 10; wave += 1) {
  const values = parameterValues(play);
  const lift = plantLift(values.min_transfer_amount);
  const summary = simulatedSummary(lift);
  const error = lift - TARGET_LIFT;

  const plan = planWaveUpdate({
    contract: play, jacobian, summary, targets: { absolute_lift: TARGET_LIFT }, waveHistory, appliedDrift,
  });
  curve.push({ wave, threshold: values.min_transfer_amount, lift, error, reason: plan.reason });
  console.log(
    `   ${String(wave).padStart(4)}${String(values.min_transfer_amount).padStart(21)}`
    + `${lift.toFixed(0).padStart(10)}${error.toFixed(0).padStart(9)}`
    + `${(plan.normalizedDelta.min_transfer_amount ?? 0).toFixed(3).padStart(8)}`
    + `${plan.cumulativeDrift.toFixed(2).padStart(8)}   ${plan.reason}`,
  );

  waveHistory.push({ holdout: { mean: HOLDOUT_MEAN + (wave % 3) * 250 } });
  if (!plan.updateApplied) break;

  observedWaves.push({
    normalizedDelta: plan.normalizedDelta,
    featureDelta: { absolute_lift: plantLift(plan.nextValues.min_transfer_amount) - lift },
  });
  appliedDrift = plan.cumulativeDrift;
  play = applyWaveUpdate(play, plan, { version: `1.1.${wave}` });

  // ── 4. The model improves as waves accumulate.
  const refined = refineMetricRow({
    waves: observedWaves,
    parameterNames: Object.keys(play.parameters).sort(),
    feature: 'absolute_lift',
    priorRow: rowOf(jacobian),
  });
  jacobian = Object.fromEntries(Object.entries(refined.row).map(([name, value]) => [name, { absolute_lift: value }]));
}

const finalError = Math.abs(curve.at(-1).error);
const refinedStep = jacobian.min_transfer_amount.absolute_lift;
console.log(`\n4. Model refinement: prior ${PRIOR_STEP_RESPONSE} → refined ${refinedStep.toFixed(0)} per step (truth ${TRUE_STEP_RESPONSE})`);
console.log(`\nConverged in ${curve.length} wave(s); final |error| ${finalError.toFixed(0)} against target ${TARGET_LIFT}.`);
console.log(`Cumulative drift ${appliedDrift.toFixed(2)} of ${play.learning.drift_budget} approved normalized steps.`);
console.log(`Final protocol ${play.decision_protocol_id} @ ${play.version}.`);

for (let index = 1; index < curve.length; index += 1) {
  assert.ok(
    Math.abs(curve[index].error) <= Math.abs(curve[index - 1].error) + 1e-6,
    `error grew at wave ${curve[index].wave}`,
  );
}
assert.ok(finalError < 500, `final error ${finalError} should reach the noise floor`);
assert.ok(curve.length <= 8, `expected convergence within 8 waves, took ${curve.length}`);
assert.ok(appliedDrift <= play.learning.drift_budget, 'drift budget must not be exceeded');
assert.ok(Math.abs(refinedStep - TRUE_STEP_RESPONSE) < Math.abs(PRIOR_STEP_RESPONSE - TRUE_STEP_RESPONSE), 'refit should beat the prior');

console.log('\nPlay learning loop verified: demonstration fit, replay sensitivity, bounded wave updates,');
console.log('noise gating, drift accounting, and model refinement. Lift figures are simulated evidence');
console.log('from a synthetic plant and support no business or causal claim.\n');

function plantLift(threshold) {
  return TRUE_STEP_RESPONSE * ((threshold - EXPERT_THRESHOLD) / 25_000);
}

function simulatedSummary(absoluteLift) {
  return {
    status: 'measured',
    metric: 'net_new_assets',
    absoluteLift,
    inference: { standardError: 120, method: 'difference_in_means_normal_approximation' },
    holdout: { mean: HOLDOUT_MEAN },
    evidenceClass: 'synthetic',
    businessClaimAllowed: false,
    causalClaimAllowed: false,
  };
}

function priorJacobian() {
  return {
    min_transfer_amount: { absolute_lift: PRIOR_STEP_RESPONSE },
    min_corroborating_signals: { absolute_lift: 0 },
    qualified_confidence: { absolute_lift: 0 },
  };
}

function rowOf(currentJacobian) {
  return Object.fromEntries(Object.entries(currentJacobian).map(([name, row]) => [name, row.absolute_lift]));
}

function withValues(parameters, values) {
  return Object.fromEntries(Object.entries(parameters).map(([name, spec]) => [
    name,
    { ...spec, value: Object.hasOwn(values, name) ? values[name] : spec.value },
  ]));
}

function signed(value) {
  return `${value >= 0 ? '+' : ''}${value}`.padStart(8);
}

function buildCases() {
  const built = [];
  for (let step = 1; step <= 20; step += 1) {
    const transferAmount = step * 25_000;
    built.push({
      householdToken: `tok_household_${String(step).padStart(6, '0')}`,
      transferAmount,
      policies: draft.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' })),
      records: [
        { transaction_id: `tx_transfer_${step}`, source_system: 'merrill_transfer_workflow', rail: 'acats', amount: transferAmount },
        { transaction_id: `tx_books_${step}`, source_system: 'merrill_books', rail: 'account', amount: 0 },
        { transaction_id: `tx_digital_${step}`, source_system: 'merrill_digital', rail: 'digital', amount: 1 },
      ],
    });
  }
  return built;
}
