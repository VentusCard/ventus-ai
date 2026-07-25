// Fit a Growth Play's initial parameter vector to a demonstration.
//
// Usage:
//   node ./scripts/fit-initial-parameters.mjs --play merrill-relationship-growth \
//     --demonstration ./fixtures/evaluation/<expert-actions>.json
//
// The demonstration file is a JSON object:
//   { "cases": [{ "householdToken", "records": [...], "policies": [...] }],
//     "demonstratedHouseholds": ["tok_..."] }
//
// Output is a proposal, not an approval. The fitted vector still has to be compiled and
// approved through the Growth Play registry before any run can use it.

import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileGrowthPlayContract, withParameterValues } from '../shared/growth-play-contract.mjs';
import { fitParametersFromDemonstrations } from '../shared/parameter-fit.mjs';
import { estimateSensitivity } from '../shared/play-sensitivity.mjs';
import { standaloneGrowthPlayDetector } from '../shared/standalone-growth-play-detectors.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
assert.ok(args.play, 'usage: --play <growth_play_id> --demonstration <file.json> [--out <file.json>] [--version <next>]');
assert.ok(args.demonstration, 'a --demonstration file is required');

const drafts = JSON.parse(readFileSync(
  resolve(process.env.VENTUS_GROWTH_PLAY_DRAFTS || `${scriptDir}/../fixtures/evaluation/growth-play-drafts.json`),
  'utf8',
));
const draft = drafts.find((item) => item.growth_play_id === args.play);
assert.ok(draft, `no Growth Play draft named ${args.play}`);
const contract = compileGrowthPlayContract(draft);

const demonstration = JSON.parse(readFileSync(resolve(args.demonstration), 'utf8'));
assert.ok(Array.isArray(demonstration.cases), 'demonstration.cases must be an array');
assert.ok(Array.isArray(demonstration.demonstratedHouseholds), 'demonstration.demonstratedHouseholds must be an array');

const fit = fitParametersFromDemonstrations({
  contract,
  detector: standaloneGrowthPlayDetector,
  cases: demonstration.cases,
  demonstratedHouseholds: demonstration.demonstratedHouseholds,
});
const sensitivity = estimateSensitivity({
  contract,
  detector: standaloneGrowthPlayDetector,
  cases: demonstration.cases,
  labelledHouseholds: demonstration.demonstratedHouseholds,
});

console.log(`\nGrowth Play: ${contract.growth_play_id}@${contract.version} (${contract.decision_protocol_id})`);
console.log(`Demonstration: ${fit.demonstratedHouseholds} acted-on households across ${demonstration.cases.length} replayed cases\n`);
console.log('Parameter                     declared        fitted');
for (const name of Object.keys(fit.fittedValues).sort()) {
  const changed = fit.changedParameters.includes(name) ? ' *' : '';
  console.log(`  ${name.padEnd(28)}${String(fit.declaredValues[name]).padStart(8)}${String(fit.fittedValues[name]).padStart(14)}${changed}`);
}
console.log(`\nFit against the demonstration  precision  recall     F1`);
console.log(`  declared${' '.repeat(22)}${pct(fit.baselineScore.precision)}${pct(fit.baselineScore.recall)}${pct(fit.baselineScore.f1)}`);
console.log(`  fitted${' '.repeat(24)}${pct(fit.fittedScore.precision)}${pct(fit.fittedScore.recall)}${pct(fit.fittedScore.f1)}`);
console.log(`\nEvaluations: ${fit.evaluations}${fit.converged ? ` (converged after ${fit.convergedAfterPasses} pass(es))` : ' (pass budget exhausted)'}`);
if (fit.baselineScore.errors || fit.fittedScore.errors) {
  console.log(`Cases the detector could not evaluate: ${fit.fittedScore.errors}`);
}

console.log('\nSensitivity at the fitted vector (per approved step):');
for (const [name, row] of Object.entries(sensitivity.jacobian)) {
  const rendered = Object.entries(row).map(([feature, value]) => `${feature} ${value >= 0 ? '+' : ''}${value}`).join('  ');
  console.log(`  ${name.padEnd(28)}${rendered}`);
}
if (sensitivity.saturatedParameters.length > 0) {
  console.log(`  pinned against approved bounds: ${sensitivity.saturatedParameters.join(', ')}`);
}

if (args.out) {
  const proposed = args.version
    ? withParameterValues(contract, fit.fittedValues, { version: args.version })
    : null;
  const outputPath = resolve(args.out);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify({ fit, sensitivity, proposedContract: proposed }, null, 2)}\n`);
  console.log(`\nWrote proposal to ${outputPath}`);
}

console.log('\nThis is a proposed initialization. It is not an approved protocol: compile it, then');
console.log('register and approve it through the Growth Play registry before any run uses it.\n');

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue;
    parsed[argv[index].slice(2)] = argv[index + 1]?.startsWith('--') ? true : argv[index + 1];
  }
  return parsed;
}

function pct(value) {
  return `${(value * 100).toFixed(1)}%`.padStart(11);
}
