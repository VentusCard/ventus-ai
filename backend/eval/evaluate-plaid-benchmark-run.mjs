import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { evaluateGoldenPredictionResults } from '../scripts/lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const benchmarkRoot = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');
const expectationsPath = resolve(
  process.env.PLAID_BENCHMARK_EXPECTATIONS_PATH ||
    join(benchmarkRoot, 'plaid-synthetic-benchmark-expectations.json')
);
const predictionsPath = resolveRequiredPath(
  process.env.PLAID_BENCHMARK_PREDICTIONS_PATH || process.env.OPENROUTER_BENCHMARK_PREDICTIONS_PATH,
  'PLAID_BENCHMARK_PREDICTIONS_PATH or OPENROUTER_BENCHMARK_PREDICTIONS_PATH is required'
);
const predictionsDir = dirname(predictionsPath);
const subsetPath = resolve(
  process.env.PLAID_BENCHMARK_EXPECTATIONS_SUBSET_PATH || join(predictionsDir, 'expectations-subset.json')
);
const reportPath = resolve(
  process.env.PLAID_BENCHMARK_REPORT_PATH || join(predictionsDir, 'evaluation-report.json')
);

const expectations = readJson(expectationsPath);
const predictions = readJson(predictionsPath);
const predictionRows = Array.isArray(predictions) ? predictions : predictions.predictions;
assert.ok(Array.isArray(predictionRows), 'predictions must be an array or contain predictions[]');

const predictionIds = new Set(predictionRows.map((row) => row.transaction_id));
const expectationSubset = {
  ...expectations,
  source: {
    ...expectations.source,
    subset_for_predictions_path: predictionsPath,
  },
  minimum_expected_coverage: {
    [expectations.source?.type || 'benchmark_subset']: predictionIds.size,
  },
  expectations: expectations.expectations.filter((expectation) => predictionIds.has(expectation.transaction_id)),
};

assert.equal(
  expectationSubset.expectations.length,
  predictionIds.size,
  `predictions contain ${predictionIds.size} IDs but only ${expectationSubset.expectations.length} matched expectations`
);

const report = evaluateGoldenPredictionResults(expectationSubset, predictions, {
  expectations_path: expectationsPath,
  expectations_subset_path: subsetPath,
  predictions_path: predictionsPath,
  provider: predictions.metadata?.provider ?? process.env.VENTUS_QA_MODEL_PROVIDER ?? null,
  model: predictions.metadata?.model ?? process.env.VENTUS_QA_MODEL_NAME ?? null,
  run_id: predictions.metadata?.run_id ?? process.env.VENTUS_QA_RUN_ID ?? null,
  transaction_count: predictionRows.length,
});

mkdirSync(dirname(subsetPath), { recursive: true });
writeJson(subsetPath, expectationSubset);
writeJson(reportPath, report);

console.log(`benchmark expectations subset: ${subsetPath}`);
console.log(`benchmark evaluation report: ${reportPath}`);
console.log(
  [
    `Benchmark evaluation: ${report.summary.passed_expectations}/${report.summary.total_expectations} expectations passed`,
    `pass_rate=${report.summary.pass_rate}`,
    `missing_predictions=${report.summary.missing_predictions}`,
    `extra_predictions=${report.summary.extra_predictions}`,
    `failures=${report.failures.length}`,
  ].join(', ')
);

if (report.failures.length > 0) {
  const preview = report.failures
    .slice(0, 10)
    .map((failure) => `- ${failure.message}`)
    .join('\n');
  console.log(`Top failures:\n${preview}`);
}

function resolveRequiredPath(value, message) {
  assert.ok(value, message);
  return resolve(value);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
