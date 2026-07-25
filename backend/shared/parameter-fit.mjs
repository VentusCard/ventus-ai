// Initialize a Growth Play parameter vector from a demonstration instead of a guess.
//
// The learning loop converges in a handful of waves only if it starts near a workable
// command. The cheapest source of one is an expert already doing the task: the households a
// top-decile banker or advisor actually acted on. This module searches the approved
// parameter box for the vector that best reproduces that expert's selections, and reports
// how well it fits so the initialization can be reviewed rather than trusted.
//
// Offline only. Scoring runs unsigned probe plays (see probeGrowthPlay); nothing here can
// reach the operating loop, and nothing here mints an approved protocol.

import assert from 'node:assert/strict';
import { parameterValues, probeGrowthPlay } from './growth-play-contract.mjs';

export function parameterGrid(spec) {
  assert.ok(spec && Number.isFinite(spec.min) && Number.isFinite(spec.max), 'parameter spec requires finite bounds');
  assert.ok(Number.isFinite(spec.max_step) && spec.max_step > 0, 'parameter spec requires a positive max_step');
  const values = [];
  for (let value = spec.min; value <= spec.max + 1e-9; value += spec.max_step) {
    values.push(spec.kind === 'integer' ? Math.round(value) : round(value));
  }
  if (!values.some((value) => close(value, spec.max))) values.push(spec.max);
  if (!values.some((value) => close(value, spec.value))) values.push(spec.value);
  return [...new Set(values)].sort((left, right) => left - right);
}

export function scoreAgainstDemonstrations({ contract, detector, cases, demonstratedHouseholds, values = {} }) {
  assert.equal(typeof detector, 'function', 'detector is required');
  assert.ok(Array.isArray(cases) && cases.length > 0, 'replay cases are required');
  const demonstrated = demonstratedHouseholds instanceof Set
    ? demonstratedHouseholds
    : new Set(assertArray(demonstratedHouseholds, 'demonstratedHouseholds'));
  const growthPlay = probeGrowthPlay(contract, values);

  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let errors = 0;
  for (const replayCase of cases) {
    assert.ok(replayCase?.householdToken, 'each replay case requires a householdToken');
    const expected = demonstrated.has(replayCase.householdToken);
    let qualified = false;
    try {
      const decision = detector({
        records: replayCase.records,
        policies: replayCase.policies ?? [],
        growthPlay,
        householdToken: replayCase.householdToken,
      });
      qualified = decision?.abstain === false;
    } catch {
      // A case the detector cannot evaluate is a non-selection, not a silent success.
      errors += 1;
    }
    if (qualified && expected) truePositives += 1;
    else if (qualified && !expected) falsePositives += 1;
    else if (!qualified && expected) falseNegatives += 1;
  }

  const precision = truePositives + falsePositives === 0 ? 0 : truePositives / (truePositives + falsePositives);
  const recall = truePositives + falseNegatives === 0 ? 0 : truePositives / (truePositives + falseNegatives);
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return {
    truePositives,
    falsePositives,
    falseNegatives,
    errors,
    evaluated: cases.length,
    precision: round(precision),
    recall: round(recall),
    f1: round(f1),
  };
}

export function fitParametersFromDemonstrations({
  contract,
  detector,
  cases,
  demonstratedHouseholds,
  passes = 3,
}) {
  assert.ok(contract?.parameters && Object.keys(contract.parameters).length > 0, 'Growth Play declares no tunable parameters');
  assert.ok(Number.isInteger(passes) && passes >= 1 && passes <= 10, 'passes must be 1-10');
  const demonstrated = new Set(assertArray(demonstratedHouseholds, 'demonstratedHouseholds'));
  assert.ok(demonstrated.size > 0, 'at least one demonstrated household is required');

  const names = Object.keys(contract.parameters).sort();
  const grids = Object.fromEntries(names.map((name) => [name, parameterGrid(contract.parameters[name])]));
  const score = (values) => scoreAgainstDemonstrations({ contract, detector, cases, demonstratedHouseholds: demonstrated, values });

  const declared = parameterValues(contract);
  const baseline = score(declared);
  let best = { ...declared };
  let bestScore = baseline;
  let evaluations = 1;
  let convergedPass = null;

  // Coordinate descent over the approved grid. A full cross-product is unnecessary at this
  // dimensionality and would over-fit the demonstration; cycling one knob at a time keeps the
  // search honest and the evaluation count small enough to run on a laptop.
  for (let pass = 0; pass < passes; pass += 1) {
    let improved = false;
    for (const name of names) {
      for (const value of grids[name]) {
        if (close(value, best[name])) continue;
        const candidate = { ...best, [name]: value };
        const candidateScore = score(candidate);
        evaluations += 1;
        if (candidateScore.f1 > bestScore.f1 + 1e-9) {
          best = candidate;
          bestScore = candidateScore;
          improved = true;
        }
      }
    }
    if (!improved) {
      convergedPass = pass + 1;
      break;
    }
  }

  // A demonstration often cannot distinguish neighbouring values: if no household sits
  // between two thresholds, both reproduce the expert exactly. Reporting one of them as THE
  // answer hides that, so report the whole equivalence class and let the approver choose.
  const ties = {};
  for (const name of names) {
    const equivalent = grids[name].filter((value) => {
      if (close(value, best[name])) return true;
      return Math.abs(score({ ...best, [name]: value }).f1 - bestScore.f1) < 1e-9;
    });
    evaluations += grids[name].length - 1;
    if (equivalent.length > 1) ties[name] = equivalent;
  }

  return {
    growthPlayId: contract.growth_play_id,
    declaredValues: declared,
    fittedValues: best,
    baselineScore: baseline,
    fittedScore: bestScore,
    // Values the demonstration cannot tell apart from the fitted one. A non-empty entry means
    // the data does not identify that knob; the choice inside the class is a judgement call.
    equivalentValues: ties,
    identified: Object.keys(ties).length === 0,
    improvementF1: round(bestScore.f1 - baseline.f1),
    changedParameters: names.filter((name) => !close(best[name], declared[name])),
    evaluations,
    converged: convergedPass !== null,
    convergedAfterPasses: convergedPass,
    demonstratedHouseholds: demonstrated.size,
    // The fit proposes an initialization. It is not an approval, and a good F1 against one
    // expert's history is not evidence that the expert's selections were the right ones.
    approvalRequired: 'growth_play_protocol_approval',
  };
}

function assertArray(value, label) {
  assert.ok(Array.isArray(value) || value instanceof Set, `${label} must be an array or Set`);
  return [...value];
}

function close(left, right) {
  return Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-9;
}

function round(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}
