import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const benchmarkRoot = join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark');

const DEFAULT_MODELS = [
  'google/gemini-2.5-flash',
  'google/gemini-2.5-flash-lite',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-chat-v3.1',
  'z-ai/glm-5.2',
];

const models = parseModels(process.env.OPENROUTER_BENCHMARK_MODELS || DEFAULT_MODELS.join(','));
const limit = Number(process.env.OPENROUTER_BENCHMARK_LIMIT || 100);
const batchSize = Number(process.env.OPENROUTER_BENCHMARK_BATCH_SIZE || 10);
const force = process.env.OPENROUTER_BENCHMARK_FORCE === '1';

assert.ok(models.length > 0, 'OPENROUTER_BENCHMARK_MODELS must contain at least one model');
assert.ok(Number.isInteger(limit) && limit > 0, 'OPENROUTER_BENCHMARK_LIMIT must be a positive integer');
assert.ok(Number.isInteger(batchSize) && batchSize > 0, 'OPENROUTER_BENCHMARK_BATCH_SIZE must be a positive integer');

console.log(`OpenRouter benchmark suite: models=${models.length}, limit=${limit}, batch_size=${batchSize}`);

let needsCapture = false;
for (const model of models) {
  const runDir = runDirectoryFor(model, limit);
  if (force || !existsSync(join(runDir, 'predictions.json')) || !existsSync(join(runDir, 'raw-output.json'))) {
    needsCapture = true;
    break;
  }
}

if (needsCapture && !process.env.OPENROUTER_API_KEY) {
  throw new Error('OPENROUTER_API_KEY is required to capture missing benchmark predictions');
}

for (const model of models) {
  const runId = `openrouter-${slugify(model)}-${limit}`;
  const runDir = join(benchmarkRoot, 'runs', runId);
  const predictionsPath = join(runDir, 'predictions.json');
  const rawOutputPath = join(runDir, 'raw-output.json');
  const reportPath = join(runDir, 'evaluation-report.json');

  console.log(`\n=== ${model} (${runId}) ===`);

  if (force || !existsSync(predictionsPath) || !existsSync(rawOutputPath)) {
    runNode('./eval/capture-openrouter-benchmark-predictions.mjs', {
      OPENROUTER_BENCHMARK_PROVIDER: 'openrouter',
      OPENROUTER_BENCHMARK_MODEL: model,
      OPENROUTER_BENCHMARK_LIMIT: String(limit),
      OPENROUTER_BENCHMARK_BATCH_SIZE: String(batchSize),
      OPENROUTER_BENCHMARK_RUN_ID: runId,
      OPENROUTER_BENCHMARK_PREDICTIONS_PATH: predictionsPath,
      OPENROUTER_BENCHMARK_RAW_OUTPUT_PATH: rawOutputPath,
    });
  } else {
    console.log(`capture skipped: ${predictionsPath}`);
  }

  if (force || !existsSync(reportPath)) {
    runNode('./eval/evaluate-plaid-benchmark-run.mjs', {
      OPENROUTER_BENCHMARK_PREDICTIONS_PATH: predictionsPath,
      PLAID_BENCHMARK_PREDICTIONS_PATH: predictionsPath,
      PLAID_BENCHMARK_REPORT_PATH: reportPath,
    });
  } else {
    console.log(`evaluation skipped: ${reportPath}`);
  }
}

runNode('./eval/compare-plaid-benchmark-runs.mjs');

function runNode(scriptPath, extraEnv = {}) {
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: backendRoot,
    env: {
      ...process.env,
      ...extraEnv,
    },
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${scriptPath} failed with exit code ${result.status}`);
  }
}

function runDirectoryFor(model, transactionLimit) {
  return join(benchmarkRoot, 'runs', `openrouter-${slugify(model)}-${transactionLimit}`);
}

function parseModels(value) {
  return value
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
