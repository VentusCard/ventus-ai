import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compileGrowthPlayContract, parameterValues } from './growth-play-contract.mjs';
import { applyWaveUpdate, computeParameterUpdate, holdoutNoiseBand, planWaveUpdate, waveError } from './play-ilc.mjs';

const drafts = JSON.parse(readFileSync(new URL('../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const merrill = compileGrowthPlayContract(drafts[1]);

// A documented prior: one approved step on the transfer threshold (+25k) is believed to move
// net-new-assets lift by about 12k per household. Only its sign is trusted.
const JACOBIAN = {
  min_transfer_amount: { absolute_lift: 12_000 },
  min_corroborating_signals: { absolute_lift: 0 },
  qualified_confidence: { absolute_lift: 0 },
};

test('holdout noise band needs enough waves before it will speak', () => {
  assert.deepEqual(holdoutNoiseBand([]), { sigma: null, observedWaves: 0, sufficient: false, minimumWaves: 3 });
  const thin = holdoutNoiseBand([{ holdout: { mean: 100 } }, { holdout: { mean: 120 } }]);
  assert.equal(thin.sufficient, false);

  const band = holdoutNoiseBand([
    { holdout: { mean: 1000 } }, { holdout: { mean: 1200 } }, { holdout: { mean: 900 } }, { holdout: { mean: 1100 } },
  ]);
  assert.equal(band.sufficient, true);
  assert.ok(band.sigma > 100 && band.sigma < 200);
});

test('wave error takes the wider of within-wave error and holdout drift', () => {
  const built = waveError({
    summary: measuredSummary(12_000, 400),
    targets: { absolute_lift: 20_000 },
    noiseBand: { sigma: 2_500 },
  });
  assert.equal(built.error.absolute_lift, -8_000);
  assert.equal(built.noise.absolute_lift, 2_500, 'holdout drift dominates the within-wave standard error');
  assert.equal(built.ready, true);
});

test('an error inside the holdout noise band is not evidence and is not learned from', () => {
  const plan = planWaveUpdate({
    contract: merrill,
    jacobian: JACOBIAN,
    summary: measuredSummary(19_000, 200),
    targets: { absolute_lift: 20_000 },
    waveHistory: [
      { holdout: { mean: 40_000 } }, { holdout: { mean: 38_000 } },
      { holdout: { mean: 42_500 } }, { holdout: { mean: 39_000 } },
    ],
  });
  assert.equal(plan.updateApplied, false);
  assert.equal(plan.reason, 'error_within_noise_band');
  assert.deepEqual(plan.gatedFeatures, ['absolute_lift']);
  assert.deepEqual(plan.nextValues, parameterValues(merrill));
});

test('a single wave never moves a knob further than one approved step', () => {
  const update = computeParameterUpdate({
    contract: merrill,
    jacobian: JACOBIAN,
    error: { absolute_lift: -40_000 },
    noise: { absolute_lift: 100 },
  });
  assert.equal(update.updateApplied, true);
  assert.equal(update.normalizedDelta.min_transfer_amount, 1);
  assert.equal(update.delta.min_transfer_amount, 25_000);
  assert.equal(update.nextValues.min_transfer_amount, 125_000);
  assert.equal(update.nextValues.min_corroborating_signals, 3, 'knobs with no sensitivity stay put');
  assert.equal(update.driftApplied, 1);
  assert.equal(update.reapprovalRequired, false);
});

test('the drift budget scales the last step down and then stops the loop', () => {
  const nearBudget = computeParameterUpdate({
    contract: merrill,
    jacobian: JACOBIAN,
    error: { absolute_lift: -40_000 },
    noise: { absolute_lift: 100 },
    appliedDrift: 2.9,
  });
  assert.equal(nearBudget.updateApplied, true);
  assert.equal(nearBudget.driftBudgetScaled, true);
  assert.ok(Math.abs(nearBudget.normalizedDelta.min_transfer_amount - 0.1) < 1e-6);
  assert.equal(nearBudget.nextValues.min_transfer_amount, 102_500);
  assert.equal(nearBudget.remainingDriftBudget, 0);
  // Proposals land on the knob's approved resolution, not on solver decimals.
  const spec = merrill.parameters.min_transfer_amount;
  assert.equal(nearBudget.nextValues.min_transfer_amount % spec.resolution, 0);

  const exhausted = computeParameterUpdate({
    contract: merrill,
    jacobian: JACOBIAN,
    error: { absolute_lift: -40_000 },
    noise: { absolute_lift: 100 },
    appliedDrift: 3,
  });
  assert.equal(exhausted.updateApplied, false);
  assert.equal(exhausted.reason, 'drift_budget_exhausted');
  assert.equal(exhausted.reapprovalRequired, true, 'leaving the approved box requires a new approval event');
});

test('the loop refuses to run when the contract or the measurement says no', () => {
  const disabled = compileGrowthPlayContract({
    ...drafts[1], version: '1.0.1', learning: { ...drafts[1].learning, enabled: false },
  });
  assert.equal(planWaveUpdate({
    contract: disabled, jacobian: JACOBIAN, summary: measuredSummary(12_000, 100), targets: { absolute_lift: 20_000 },
  }).reason, 'learning_disabled');

  assert.equal(planWaveUpdate({
    contract: merrill,
    jacobian: JACOBIAN,
    summary: { status: 'insufficient_sample', absoluteLift: null },
    targets: { absolute_lift: 20_000 },
  }).reason, 'measurement_insufficient_sample');

  assert.equal(planWaveUpdate({
    contract: merrill,
    jacobian: JACOBIAN,
    summary: measuredSummary(12_000, 100),
    targets: { absolute_lift: 20_000 },
    waveHistory: new Array(10).fill({ holdout: { mean: 40_000 } }),
  }).reason, 'max_waves_reached');

  assert.equal(computeParameterUpdate({
    contract: merrill,
    jacobian: { min_transfer_amount: { absolute_lift: 0 }, min_corroborating_signals: { absolute_lift: 0 }, qualified_confidence: { absolute_lift: 0 } },
    error: { absolute_lift: -8_000 },
    noise: { absolute_lift: 100 },
  }).reason, 'no_sensitivity_for_active_features');
});

test('an applied update compiles into a new, distinct, in-bounds protocol', () => {
  const update = computeParameterUpdate({
    contract: merrill, jacobian: JACOBIAN, error: { absolute_lift: -40_000 }, noise: { absolute_lift: 100 },
  });
  const next = applyWaveUpdate(merrill, update, { version: '1.1.0' });
  assert.notEqual(next.decision_protocol_id, merrill.decision_protocol_id);
  assert.equal(next.parameters.min_transfer_amount.value, 125_000);
  assert.equal(next.version, '1.1.0');
  assert.throws(() => applyWaveUpdate(merrill, update, { version: '' }), /new Growth Play version is required/);
});

// The load-bearing test: a deliberately wrong sensitivity model still converges, because the
// step cap bounds the error and each wave re-measures. This is the whole reason the plan does
// not invest in a high-fidelity behaviour simulator.
test('a 1.5x-wrong model still converges within the approved wave budget', () => {
  const contract = compileGrowthPlayContract({
    ...drafts[1],
    version: '2.0.0',
    learning: { enabled: true, max_waves: 12, drift_budget: 10, noise_gate_sigma: 1 },
  });
  // Truth: +25k on the threshold moves lift by 8k. The model believes 12k.
  const trueLift = (threshold) => 8_000 * ((threshold - 100_000) / 25_000);
  const target = 20_000;

  let play = contract;
  let appliedDrift = 0;
  const waveHistory = [];
  const errors = [];

  for (let wave = 0; wave < 12; wave += 1) {
    const lift = trueLift(parameterValues(play).min_transfer_amount);
    errors.push(Math.abs(lift - target));
    const plan = planWaveUpdate({
      contract: play,
      jacobian: JACOBIAN,
      summary: measuredSummary(lift, 50),
      targets: { absolute_lift: target },
      waveHistory,
      appliedDrift,
    });
    waveHistory.push({ holdout: { mean: 40_000 } });
    if (!plan.updateApplied) break;
    appliedDrift = plan.cumulativeDrift;
    play = applyWaveUpdate(play, plan, { version: `2.0.${wave + 1}` });
  }

  for (let index = 1; index < errors.length; index += 1) {
    assert.ok(errors[index] <= errors[index - 1] + 1e-6, `error grew at wave ${index + 1}: ${errors.join(', ')}`);
  }
  assert.ok(errors.at(-1) < 200, `final error ${errors.at(-1)} should be near the noise floor`);
  assert.ok(errors.length <= 8, `converged in ${errors.length} waves`);
  assert.ok(errors[0] > 15_000, 'the first wave should start far from target');
  const finalThreshold = parameterValues(play).min_transfer_amount;
  assert.ok(Math.abs(finalThreshold - 162_500) < 2_000, `settled at ${finalThreshold}, expected ~162500`);
  assert.ok(appliedDrift < 10, 'convergence stayed inside the approved drift budget');
});

function measuredSummary(absoluteLift, standardError) {
  return {
    status: 'measured',
    metric: 'net_new_assets',
    absoluteLift,
    inference: { standardError, method: 'difference_in_means_normal_approximation' },
    holdout: { mean: 40_000 },
    causalClaimAllowed: false,
  };
}
