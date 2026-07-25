// Coarse sensitivity model for a Growth Play parameter vector.
//
// The learning loop does not need an accurate model of customer behaviour. It needs the
// direction and rough magnitude of each knob's effect; real waves correct the rest. So this
// module estimates the Jacobian by finite difference over historical replay — perturb one
// approved parameter by one approved step, re-run the detector over the same records, and
// measure how the decision-side features move.
//
// Units: derivatives are per NORMALIZED step, where one unit equals that parameter's
// contract max_step. Every downstream trust-region and drift figure is in the same units, so
// a step of 1.0 always means "the largest single-wave change the bank approved".
//
// Scope: replay observes decisions, not outcomes. It can tell you that raising a threshold
// cuts qualified volume; it cannot tell you what that does to deposits. The metric row of the
// Jacobian has to come from a documented prior and then be refined from observed waves —
// see refineMetricRow.

import assert from 'node:assert/strict';
import { parameterValues, probeGrowthPlay } from './growth-play-contract.mjs';
import { solveRidge } from './least-squares.mjs';

export const DECISION_FEATURES = ['qualified_rate', 'mean_confidence', 'precision'];

export function replayFeatures({ contract, detector, cases, values = {}, labelledHouseholds }) {
  assert.equal(typeof detector, 'function', 'detector is required');
  assert.ok(Array.isArray(cases) && cases.length > 0, 'replay cases are required');
  const labelled = labelledHouseholds === undefined
    ? null
    : new Set(labelledHouseholds instanceof Set ? [...labelledHouseholds] : labelledHouseholds);
  const growthPlay = probeGrowthPlay(contract, values);

  let qualified = 0;
  let confidenceTotal = 0;
  let truePositives = 0;
  let errors = 0;
  for (const replayCase of cases) {
    assert.ok(replayCase?.householdToken, 'each replay case requires a householdToken');
    try {
      const decision = detector({
        records: replayCase.records,
        policies: replayCase.policies ?? [],
        growthPlay,
        householdToken: replayCase.householdToken,
      });
      if (decision?.abstain === false) {
        qualified += 1;
        confidenceTotal += Number.isFinite(decision.confidence) ? decision.confidence : 0;
        if (labelled?.has(replayCase.householdToken)) truePositives += 1;
      }
    } catch {
      errors += 1;
    }
  }

  return {
    evaluated: cases.length,
    qualified,
    errors,
    qualified_rate: round(qualified / cases.length),
    mean_confidence: round(qualified === 0 ? 0 : confidenceTotal / qualified),
    precision: labelled === null ? null : round(qualified === 0 ? 0 : truePositives / qualified),
  };
}

export function estimateSensitivity({ contract, detector, cases, labelledHouseholds, features = DECISION_FEATURES }) {
  assert.ok(contract?.parameters && Object.keys(contract.parameters).length > 0, 'Growth Play declares no tunable parameters');
  const declared = parameterValues(contract);
  const baseline = replayFeatures({ contract, detector, cases, labelledHouseholds });
  const active = features.filter((feature) => Number.isFinite(baseline[feature]));

  const jacobian = {};
  const steps = {};
  const saturated = [];
  for (const [name, spec] of Object.entries(contract.parameters)) {
    const high = clamp(declared[name] + spec.max_step, spec);
    const low = clamp(declared[name] - spec.max_step, spec);
    const normalizedSpan = (high - low) / spec.max_step;
    steps[name] = { low, high, normalizedSpan: round(normalizedSpan) };
    if (normalizedSpan < 1e-9) {
      // The knob is pinned against its own bounds; report zero rather than divide by nothing.
      saturated.push(name);
      jacobian[name] = Object.fromEntries(active.map((feature) => [feature, 0]));
      continue;
    }
    const highFeatures = replayFeatures({ contract, detector, cases, values: { [name]: high }, labelledHouseholds });
    const lowFeatures = replayFeatures({ contract, detector, cases, values: { [name]: low }, labelledHouseholds });
    jacobian[name] = Object.fromEntries(active.map((feature) => [
      feature,
      round((highFeatures[feature] - lowFeatures[feature]) / normalizedSpan),
    ]));
  }

  return {
    growthPlayId: contract.growth_play_id,
    baseline,
    features: active,
    jacobian,
    steps,
    saturatedParameters: saturated,
    signs: Object.fromEntries(Object.entries(jacobian).map(([name, row]) => [
      name,
      Object.fromEntries(Object.entries(row).map(([feature, value]) => [feature, Math.sign(value)])),
    ])),
    // Replay cannot observe the P&L metric. Callers must supply that row separately.
    outcomeRowIncluded: false,
  };
}

// Refit one Jacobian row from observed waves: given the normalized parameter change applied
// before each wave and the feature change measured after it, solve for the row that best
// explains them. This is the model-improvement half of the loop — the initial row can be a
// documented prior with only its sign believed, and it gets better as waves accumulate.
export function refineMetricRow({ waves, parameterNames, feature, ridgeFraction = 0.05, priorRow = null }) {
  assert.ok(Array.isArray(waves), 'waves must be an array');
  assert.ok(Array.isArray(parameterNames) && parameterNames.length > 0, 'parameterNames are required');
  assert.ok(typeof feature === 'string' && feature.length > 0, 'feature is required');
  assert.ok(Number.isFinite(ridgeFraction) && ridgeFraction > 0, 'ridgeFraction must be positive');

  const prior = parameterNames.map((name) => (Number.isFinite(priorRow?.[name]) ? priorRow[name] : 0));
  const rows = [];
  const targets = [];
  for (const wave of waves) {
    const delta = wave?.normalizedDelta;
    const observed = wave?.featureDelta?.[feature];
    if (!delta || !Number.isFinite(observed)) continue;
    rows.push(parameterNames.map((name) => (Number.isFinite(delta[name]) ? delta[name] : 0)));
    targets.push(observed);
  }
  if (rows.length === 0) {
    return {
      feature,
      row: Object.fromEntries(parameterNames.map((name, index) => [name, prior[index]])),
      usedWaves: 0,
      source: 'prior',
      identified: false,
    };
  }

  // Shrink toward the prior rather than toward zero: with few waves the documented sign
  // survives, and as waves accumulate the data takes over. The ridge weight is a fraction of
  // the design's own scale, so a metric measured in dollars is not penalised for being large.
  const scale = rows.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value * value, 0), 0) / parameterNames.length;
  const lambda = Math.max(ridgeFraction * (scale || 1), 1e-9);
  const residualTargets = targets.map((target, index) => target - dot(rows[index], prior));
  const correction = solveRidge(rows, residualTargets, lambda);
  const solved = prior.map((value, index) => value + correction[index]);

  const row = Object.fromEntries(parameterNames.map((name, index) => [name, round(solved[index])]));
  const residuals = rows.map((rowValues, index) => targets[index] - dot(rowValues, solved));
  return {
    feature,
    row,
    usedWaves: rows.length,
    source: 'observed_waves',
    residualRms: round(Math.sqrt(residuals.reduce((sum, value) => sum + value * value, 0) / residuals.length)),
    // Under-determined until waves outnumber knobs; the prior is carrying the rest.
    identified: rows.length >= parameterNames.length,
  };
}

function dot(left, right) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function clamp(value, spec) {
  const bounded = Math.min(spec.max, Math.max(spec.min, value));
  return spec.kind === 'integer' ? Math.round(bounded) : bounded;
}

function round(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}
