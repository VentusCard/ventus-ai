import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  evaluateGoldenPredictionResults,
  readJson,
  validateGoldenEnrichmentExpectations,
} from '../scripts/lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const mockBankRoot = join(backendRoot, 'fixtures', 'mock-bank');
const partnerIngestRoot = join(backendRoot, 'fixtures', 'partner-ingest');
const expectationsPath = join(
  backendRoot,
  'fixtures',
  'evaluation',
  'golden-enrichment-expectations.json'
);
const customExpectationsPath = process.env.VENTUS_QA_EXPECTATIONS_PATH
  ? resolve(process.env.VENTUS_QA_EXPECTATIONS_PATH)
  : null;

assert.ok(
  process.env.VENTUS_QA_PREDICTIONS_PATH,
  'VENTUS_QA_PREDICTIONS_PATH is required to generate a model-output evaluation report'
);

const expectations = readJson(customExpectationsPath || expectationsPath);
if (!customExpectationsPath) {
  validateGoldenEnrichmentExpectations(expectations, mockBankRoot, partnerIngestRoot);
}

const predictionsPath = resolve(process.env.VENTUS_QA_PREDICTIONS_PATH);
const predictions = readJson(predictionsPath);
const report = evaluateGoldenPredictionResults(expectations, predictions, {
  expectations_path: customExpectationsPath || expectationsPath,
  predictions_path: predictionsPath,
  provider: process.env.VENTUS_QA_MODEL_PROVIDER ?? null,
  model: process.env.VENTUS_QA_MODEL_NAME ?? null,
  run_id: process.env.VENTUS_QA_RUN_ID ?? null,
});

if (process.env.VENTUS_QA_EVALUATION_REPORT_PATH) {
  const reportPath = resolve(process.env.VENTUS_QA_EVALUATION_REPORT_PATH);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`wrote model-output evaluation report: ${reportPath}`);
}

console.log(
  [
    `Model-output evaluation: ${report.summary.passed_expectations}/${report.summary.total_expectations} expectations passed`,
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
