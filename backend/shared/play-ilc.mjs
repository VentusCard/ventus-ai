// Task-level iterative learning control for a Growth Play parameter vector.
//
// Each wave is one trial: a cohort is assigned, treated, measured against its holdout, and
// the measured error is pushed back through a coarse sensitivity model to produce the next
// parameter vector. The model does not need to be accurate — with the signs right and the
// step bounded, iteration on real waves supplies the magnitudes.
//
// The household is NOT the trial unit. A household cannot be re-run, and the population
// drifts between waves, so the error is only meaningful at cohort level against a holdout
// assigned in the same wave.
//
// Three guards keep the loop inside what the bank approved:
//
//   1. Step cap        — no parameter moves more than one contract max_step per wave.
//   2. Drift budget    — cumulative movement from the last APPROVED vector is bounded; once
//                        spent, the play stops and needs a fresh approval event.
//   3. Noise gate      — an error smaller than the holdout's own wave-to-wave variation is
//                        not evidence, and updating on it fits seasonality instead of signal.
//
// All parameter movement is in normalized steps: 1.0 == that knob's approved max_step.

import assert from 'node:assert/strict';
import { parameterValues, withParameterValues } from './growth-play-contract.mjs';
import { solveRidge } from './least-squares.mjs';

export const LIFT_FEATURE = 'absolute_lift';

// Wave-to-wave standard deviation of the holdout arm: what the metric does when Ventus does
// nothing. Any error smaller than this is indistinguishable from the environment moving.
export function holdoutNoiseBand(waves, { minimumWaves = 3 } = {}) {
  assert.ok(Array.isArray(waves), 'waves must be an array');
  const means = waves.map((wave) => wave?.holdout?.mean ?? wave?.holdoutMean).filter((value) => Number.isFinite(value));
  if (means.length < minimumWaves) {
    return { sigma: null, observedWaves: means.length, sufficient: false, minimumWaves };
  }
  const average = means.reduce((sum, value) => sum + value, 0) / means.length;
  const variance = means.reduce((sum, value) => sum + (value - average) ** 2, 0) / (means.length - 1);
  return { sigma: round(Math.sqrt(variance)), observedWaves: means.length, sufficient: true, minimumWaves };
}

export function waveError({ summary, targets, observedFeatures = {}, noiseBand = null }) {
  assert.ok(summary && typeof summary === 'object', 'measurement summary is required');
  assert.ok(targets && typeof targets === 'object', 'targets are required');
  const error = {};
  const noise = {};
  const measured = {};

  if (Object.hasOwn(targets, LIFT_FEATURE)) {
    assert.ok(Number.isFinite(targets[LIFT_FEATURE]), `target ${LIFT_FEATURE} must be finite`);
    if (Number.isFinite(summary.absoluteLift)) {
      measured[LIFT_FEATURE] = summary.absoluteLift;
      error[LIFT_FEATURE] = round(summary.absoluteLift - targets[LIFT_FEATURE]);
      // Take the wider of the within-wave standard error and the holdout's own wave-to-wave
      // drift. Ignoring the second is how a loop learns the calendar instead of the play.
      const standardError = Number.isFinite(summary.inference?.standardError) ? summary.inference.standardError : 0;
      noise[LIFT_FEATURE] = round(Math.max(standardError, Number.isFinite(noiseBand?.sigma) ? noiseBand.sigma : 0));
    }
  }

  for (const [feature, observation] of Object.entries(observedFeatures)) {
    assert.ok(Object.hasOwn(targets, feature), `observed feature ${feature} has no target`);
    assert.ok(Number.isFinite(observation?.value), `observed feature ${feature} requires a finite value`);
    measured[feature] = observation.value;
    error[feature] = round(observation.value - targets[feature]);
    noise[feature] = Number.isFinite(observation.sigma) ? observation.sigma : 0;
  }

  return {
    error,
    noise,
    measured,
    targets,
    ready: summary.status === 'measured' && Object.keys(error).length > 0,
    status: summary.status,
  };
}

export function computeParameterUpdate({
  contract,
  jacobian,
  error,
  noise = {},
  appliedDrift = 0,
  gain = 1,
  regularization = 0.25,
}) {
  assert.ok(contract?.parameters, 'compiled Growth Play with parameters is required');
  assert.ok(jacobian && typeof jacobian === 'object', 'jacobian is required');
  assert.ok(error && typeof error === 'object', 'error vector is required');
  assert.ok(Number.isFinite(gain) && gain > 0 && gain <= 1, 'gain must be in (0, 1]');
  assert.ok(Number.isFinite(regularization) && regularization > 0, 'regularization must be positive');
  assert.ok(Number.isFinite(appliedDrift) && appliedDrift >= 0, 'appliedDrift must be non-negative');

  const learning = contract.learning ?? {};
  const names = Object.keys(contract.parameters).sort();
  const current = parameterValues(contract);
  const noiseGateSigma = Number.isFinite(learning.noise_gate_sigma) ? learning.noise_gate_sigma : 0;

  const gatedFeatures = [];
  const activeFeatures = [];
  for (const [feature, value] of Object.entries(error)) {
    if (!Number.isFinite(value)) continue;
    const sigma = Number.isFinite(noise[feature]) ? noise[feature] : 0;
    if (noiseGateSigma > 0 && Math.abs(value) < noiseGateSigma * sigma) gatedFeatures.push(feature);
    else activeFeatures.push(feature);
  }
  if (activeFeatures.length === 0) {
    return noUpdate('error_within_noise_band', { names, current, appliedDrift, learning, gatedFeatures });
  }

  // Desired feature movement is the negative of the error: drive measured toward target.
  const rows = activeFeatures.map((feature) => names.map((name) => {
    const value = jacobian[name]?.[feature];
    return Number.isFinite(value) ? value : 0;
  }));
  const targetChange = activeFeatures.map((feature) => -gain * error[feature]);
  if (rows.every((row) => row.every((value) => Math.abs(value) < 1e-12))) {
    return noUpdate('no_sensitivity_for_active_features', { names, current, appliedDrift, learning, gatedFeatures });
  }
  const solved = solveRidge(rows, targetChange, regularization);

  // Step cap: one approved max_step per wave, per knob.
  const requested = {};
  names.forEach((name, index) => {
    const value = Number.isFinite(solved[index]) ? solved[index] : 0;
    requested[name] = Math.max(-1, Math.min(1, value));
  });

  const scaled = applyDriftBudget(requested, appliedDrift, learning);
  if (scaled.exhausted) {
    return noUpdate('drift_budget_exhausted', {
      names, current, appliedDrift, learning, gatedFeatures, reapprovalRequired: true,
    });
  }

  const delta = {};
  const nextValues = {};
  const normalizedDelta = {};
  for (const name of names) {
    const spec = contract.parameters[name];
    const proposed = current[name] + scaled.normalized[name] * spec.max_step;
    // Quantize to the knob's approved resolution so the proposal is a value a reviewer can
    // read and sign off, not a long decimal that happened to fall out of the solver.
    const quantized = Math.round(proposed / spec.resolution) * spec.resolution;
    const bounded = Math.min(spec.max, Math.max(spec.min, quantized));
    const next = spec.kind === 'integer' ? Math.round(bounded) : round(bounded);
    nextValues[name] = next;
    delta[name] = round(next - current[name]);
    normalizedDelta[name] = round((next - current[name]) / spec.max_step);
  }

  const driftApplied = round(norm(Object.values(normalizedDelta)));
  if (driftApplied < 1e-9) {
    return noUpdate('update_below_parameter_resolution', { names, current, appliedDrift, learning, gatedFeatures });
  }

  return {
    updateApplied: true,
    reason: 'update_computed',
    currentValues: current,
    nextValues,
    delta,
    normalizedDelta,
    activeFeatures,
    gatedFeatures,
    driftApplied,
    cumulativeDrift: round(appliedDrift + driftApplied),
    remainingDriftBudget: round(Math.max(0, (learning.drift_budget ?? 0) - appliedDrift - driftApplied)),
    driftBudgetScaled: scaled.scaledBy < 1,
    reapprovalRequired: false,
    // An update proposes the next protocol version. Compiling it is not approving it.
    approvalRequired: 'growth_play_protocol_approval',
  };
}

export function planWaveUpdate({
  contract,
  jacobian,
  summary,
  targets,
  observedFeatures = {},
  waveHistory = [],
  appliedDrift = 0,
  gain = 1,
  regularization = 0.25,
}) {
  assert.ok(contract?.learning, 'compiled Growth Play with a learning block is required');
  const learning = contract.learning;
  const context = {
    names: Object.keys(contract.parameters).sort(),
    current: parameterValues(contract),
    appliedDrift,
    learning,
    gatedFeatures: [],
  };

  if (!learning.enabled) return { ...noUpdate('learning_disabled', context), wave: waveHistory.length + 1 };
  if (waveHistory.length >= learning.max_waves) {
    return { ...noUpdate('max_waves_reached', { ...context, reapprovalRequired: true }), wave: waveHistory.length + 1 };
  }
  if (summary?.status !== 'measured') {
    return { ...noUpdate(`measurement_${summary?.status ?? 'unavailable'}`, context), wave: waveHistory.length + 1 };
  }

  const noiseBand = holdoutNoiseBand(waveHistory);
  const built = waveError({ summary, targets, observedFeatures, noiseBand });
  if (!built.ready) return { ...noUpdate('wave_error_unavailable', context), wave: waveHistory.length + 1 };

  const update = computeParameterUpdate({
    contract, jacobian, error: built.error, noise: built.noise, appliedDrift, gain, regularization,
  });
  return {
    ...update,
    wave: waveHistory.length + 1,
    wavesRemaining: learning.max_waves - waveHistory.length - 1,
    measured: built.measured,
    targets: built.targets,
    error: built.error,
    noise: built.noise,
    noiseBand,
  };
}

export function applyWaveUpdate(contract, plan, { version }) {
  assert.ok(plan?.updateApplied, 'only an applied update can be compiled into a new protocol');
  assert.ok(typeof version === 'string' && version.length > 0, 'a new Growth Play version is required');
  return withParameterValues(contract, plan.nextValues, { version });
}

function applyDriftBudget(requested, appliedDrift, learning) {
  const budget = Number.isFinite(learning?.drift_budget) ? learning.drift_budget : Infinity;
  const remaining = budget - appliedDrift;
  if (remaining <= 1e-9) return { normalized: requested, scaledBy: 0, exhausted: true };
  const magnitude = norm(Object.values(requested));
  if (magnitude <= remaining || magnitude < 1e-12) return { normalized: requested, scaledBy: 1, exhausted: false };
  const scaledBy = remaining / magnitude;
  return {
    normalized: Object.fromEntries(Object.entries(requested).map(([name, value]) => [name, value * scaledBy])),
    scaledBy,
    exhausted: false,
  };
}

function noUpdate(reason, { names, current, appliedDrift, learning, gatedFeatures = [], reapprovalRequired = false }) {
  const zeros = Object.fromEntries(names.map((name) => [name, 0]));
  return {
    updateApplied: false,
    reason,
    currentValues: current,
    nextValues: { ...current },
    delta: zeros,
    normalizedDelta: zeros,
    activeFeatures: [],
    gatedFeatures,
    driftApplied: 0,
    cumulativeDrift: round(appliedDrift),
    remainingDriftBudget: round(Math.max(0, (learning?.drift_budget ?? 0) - appliedDrift)),
    driftBudgetScaled: false,
    reapprovalRequired,
    approvalRequired: 'growth_play_protocol_approval',
  };
}

function norm(values) {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
}

function round(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}
