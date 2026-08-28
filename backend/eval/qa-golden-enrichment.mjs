import assert from 'node:assert/strict';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readJson,
  validateGoldenEnrichmentExpectations,
  validateGoldenPredictionResults,
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

const expectations = readJson(expectationsPath);
const result = validateGoldenEnrichmentExpectations(expectations, mockBankRoot, partnerIngestRoot);

console.log(
  `ok golden enrichment expectations: ${result.expectationCount} expectations across ${result.sourceSystems.length} source systems`
);

if (process.env.VENTUS_QA_PREDICTIONS_PATH) {
  const predictionsPath = resolve(process.env.VENTUS_QA_PREDICTIONS_PATH);
  const predictions = readJson(predictionsPath);
  const predictionResult = validateGoldenPredictionResults(expectations, predictions);
  assert.equal(
    predictionResult.failures.length,
    0,
    `Golden prediction mismatch(es): ${predictionResult.failures.join('; ')}`
  );
  console.log(
    `ok golden prediction results: ${predictionResult.checked} transaction predictions checked`
  );
} else {
  console.log('no VENTUS_QA_PREDICTIONS_PATH provided; validated expectations only');
}
