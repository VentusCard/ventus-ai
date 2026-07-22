// Task registry for the multi-task model evaluation framework.
//
// Each task exposes a uniform interface the runner can drive:
//   - id            stable task id (also used for run/report paths)
//   - unit          what a "sample" is ('transaction' | 'customer')
//   - routingTask   the task name in config/model-routing.json (for defaults)
//   - capture       'generic' (runner prompts the model) | 'external' (reuse an existing capture script)
//   - loadGolden()  returns the golden fixture object
//   - score(golden, predictions, metadata) -> { accuracy, sample_size, detail }
//   - buildMessages(golden) / mapPredictions(parsed)  (generic capture only)
//
// New detection tasks (risk / life events / trips) are fully implemented here.
// Enrichment is registered as 'external' because it already has a mature capture
// pipeline (capture-openrouter-benchmark-predictions.mjs); we reuse its scorer.

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeDetectionScorer, scoreEnrichment, scoreClassificationFidelity } from './scorers.mjs';
import { captureClassificationFidelity } from './capture/classify-fidelity.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..', '..');
const evalFixtureDir = join(backendRoot, 'fixtures', 'evaluation', 'model-eval');
const syntheticBenchmarkDir = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');

export const TASKS = {
  merchant_classification: {
    id: 'merchant_classification',
    unit: 'transaction',
    routingTask: 'benchmark_enrichment',
    capture: 'external',
    external_capture_command: 'npm run plaid:benchmark:openrouter:suite',
    goldenPath: join(syntheticBenchmarkDir, 'plaid-synthetic-benchmark-expectations.json'),
    loadGolden() {
      return readJson(this.goldenPath);
    },
    score: (golden, predictions, metadata) => scoreEnrichment(golden, predictions, metadata),
    note: 'Capture handled by the existing OpenRouter benchmark suite; scoring reuses evaluateGoldenPredictionResults.',
  },

  // Production-fidelity variant of merchant_classification: drives the shared
  // production classification core (classify-core.mjs) with the chosen model, so
  // the eval measures the exact prompt/tool-schema/batching/post-processing the
  // Lambda runs. Scores merchant name + lifestyle + subcategory + confidence;
  // signals are out of scope (produced by downstream detection Lambdas).
  merchant_classification_fidelity: {
    id: 'merchant_classification_fidelity',
    unit: 'transaction',
    routingTask: 'merchant_classification',
    capture: 'internal',
    goldenPath: join(syntheticBenchmarkDir, 'plaid-synthetic-benchmark-expectations.json'),
    inputsPath: join(syntheticBenchmarkDir, 'plaid-synthetic-benchmark-enrich-fixture.json'),
    loadGolden() {
      return readJson(this.goldenPath);
    },
    loadInputs(limit) {
      const doc = readJson(this.inputsPath);
      const transactions = Array.isArray(doc) ? doc : doc.transactions ?? [];
      return typeof limit === 'number' && limit > 0 ? transactions.slice(0, limit) : transactions;
    },
    async capture({ gateway, model, provider, limit }) {
      return captureClassificationFidelity({
        gateway,
        model,
        provider,
        transactions: this.loadInputs(limit),
      });
    },
    score: (golden, predictions, metadata) =>
      scoreClassificationFidelity(golden, predictions, metadata),
    note: 'Runs the shared production classification core; matches the Lambda code path (prompt, tool schema, batching, post-processing).',
  },

  risk_detection: detectionTask({
    id: 'risk_detection',
    routingTask: 'risk_detection',
    collectionKey: 'risk_factors',
    goldenFile: 'risk-detection-golden.json',
    keyFn: (item) => item.type,
    attrFn: (item) => item.severity,
    itemSchema: '{ "type": "short_snake_case_risk_type", "severity": "high|medium|low" }',
    instructions:
      'Identify financial RISK FACTORS for each customer from their transactions (e.g. overdraft, returned_payment, cash_advance, high_risk_transfer). Return an empty array when there is no risk evidence. Do not invent risks.',
  }),

  life_event_detection: detectionTask({
    id: 'life_event_detection',
    routingTask: 'life_event_detection',
    collectionKey: 'life_events',
    goldenFile: 'life-event-detection-golden.json',
    keyFn: (item) => item.type,
    attrFn: (item) => item.confidence_band,
    itemSchema: '{ "type": "short_snake_case_event_type", "confidence_band": "high|medium|low" }',
    instructions:
      'Identify major LIFE EVENTS for each customer from their transactions (e.g. moving, new_child, home_purchase, job_change). Return an empty array when there is no clear evidence. Do not over-call routine spend as a life event.',
  }),

  travel_detection: detectionTask({
    id: 'travel_detection',
    routingTask: 'travel_detection',
    collectionKey: 'trips',
    goldenFile: 'travel-detection-golden.json',
    keyFn: (item) => item.destination,
    attrFn: (item) => item.month,
    itemSchema: '{ "destination": "short_label", "month": "YYYY-MM" }',
    instructions:
      'Identify TRIPS for each customer by clustering flights, lodging, and travel spend. Routine local gas/parking/rideshare without a travel cluster is NOT a trip. Return an empty array when there is no trip evidence.',
  }),
};

export function listTasks() {
  return Object.keys(TASKS);
}

export function getTask(taskId) {
  const task = TASKS[taskId];
  if (!task) {
    throw new Error(`Unknown task "${taskId}". Known tasks: ${listTasks().join(', ')}`);
  }
  return task;
}

function detectionTask({
  id,
  routingTask,
  collectionKey,
  goldenFile,
  keyFn,
  attrFn,
  itemSchema,
  instructions,
}) {
  const goldenPath = join(evalFixtureDir, goldenFile);
  return {
    id,
    unit: 'customer',
    routingTask,
    capture: 'generic',
    collectionKey,
    goldenPath,
    loadGolden() {
      return readJson(goldenPath);
    },
    buildMessages(golden) {
      const cases = Array.isArray(golden?.cases) ? golden.cases : [];
      const system = [
        'You analyze a customer\'s bank transactions for Ventus AI.',
        `Task: ${instructions}`,
        'Return strict JSON only, no prose:',
        `{ "results": [ { "customer_id": "string", "${collectionKey}": [ ${itemSchema} ] } ] }`,
        'Include exactly one result object per input customer_id.',
      ].join('\n');
      const user = `Analyze these customers:\n${JSON.stringify(
        cases.map((testCase) => ({
          customer_id: testCase.customer_id,
          transactions: testCase.inputs?.transactions ?? [],
        })),
        null,
        2
      )}`;
      return [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ];
    },
    mapPredictions(parsed) {
      const rows = Array.isArray(parsed) ? parsed : parsed?.results ?? parsed?.predictions ?? [];
      return rows.map((row) => ({
        customer_id: row.customer_id,
        [collectionKey]: Array.isArray(row[collectionKey]) ? row[collectionKey] : [],
      }));
    },
    score: makeDetectionScorer({ collectionKey, keyFn, attrFn }),
  };
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
