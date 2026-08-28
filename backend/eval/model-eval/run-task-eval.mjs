// Generic multi-task model evaluation runner.
//
// For one task and a list of models, this:
//   1. loads the task's golden fixture,
//   2. captures predictions from each model via the shared model-gateway
//      (recording latency + token/cost usage), or loads an existing predictions
//      file for 'external' capture tasks (enrichment),
//   3. scores each run with the task's scorer,
//   4. writes per-run reports and a task leaderboard (JSON + markdown).
//
// Usage:
//   OPENROUTER_API_KEY=... node ./eval/model-eval/run-task-eval.mjs \
//     --task risk_detection --models google/gemini-2.5-flash,openai/gpt-4.1-mini
//
// Environment:
//   MODEL_EVAL_TASK              task id (or --task)
//   MODEL_EVAL_MODELS            comma-separated models (or --models)
//   MODEL_EVAL_PROVIDER          provider override (default: openrouter)
//   MODEL_EVAL_OUTPUT_DIR        output root (default: artifacts/model-eval/<task>)
//   MODEL_EVAL_PREDICTIONS_PATH  (external tasks) predictions file to score
//   OPENROUTER_API_KEY / GEMINI_API_KEY as needed by the chosen provider

import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createModelGateway } from '../../shared/platform/model-gateway.mjs';
import { latencyStats } from './scoring.mjs';
import { buildLeaderboard, renderLeaderboardMarkdown } from './leaderboard.mjs';
import { getTask } from './tasks.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..', '..');

const args = parseArgs(process.argv.slice(2));
const taskId = args.task || process.env.MODEL_EVAL_TASK;
assert.ok(taskId, 'Provide a task via --task or MODEL_EVAL_TASK');
const task = getTask(taskId);

const provider = args.provider || process.env.MODEL_EVAL_PROVIDER || 'openrouter';
const models = parseList(args.models || process.env.MODEL_EVAL_MODELS);
const outputDir = resolve(
  args['output-dir'] || process.env.MODEL_EVAL_OUTPUT_DIR || join(backendRoot, 'artifacts', 'model-eval', taskId)
);
const qualityGate = {
  min_accuracy: Number(process.env.MODEL_EVAL_MIN_ACCURACY || 0.8),
  min_sample_size: Number(process.env.MODEL_EVAL_MIN_SAMPLE_SIZE || 0),
};

const golden = task.loadGolden();

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const runSummaries = [];

  if (task.capture === 'external') {
    const summary = scoreExternalRun();
    if (summary) runSummaries.push(summary);
  } else {
    assert.ok(models.length > 0, 'Provide models via --models or MODEL_EVAL_MODELS');
    const gateway = createModelGateway({
      getSecrets: async () => ({
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      }),
    });
    for (const model of models) {
      runSummaries.push(
        task.capture === 'internal'
          ? await captureInternalAndScore(gateway, model)
          : await captureAndScore(gateway, model)
      );
    }
  }

  const leaderboard = buildLeaderboard(taskId, runSummaries, { qualityGate });
  writeJson(join(outputDir, 'leaderboard.json'), leaderboard);
  writeFileSync(join(outputDir, 'leaderboard.md'), renderLeaderboardMarkdown(leaderboard));

  console.log(`\nTask: ${taskId} — ${runSummaries.length} run(s)`);
  console.log(`Recommended: ${leaderboard.winners.recommended ?? 'n/a (no run cleared the quality gate)'}`);
  console.log(`Leaderboard: ${join(outputDir, 'leaderboard.md')}`);
}

async function captureAndScore(gateway, model) {
  const runLabel = `${provider}/${model}`;
  const messages = task.buildMessages(golden);
  console.log(`\n=== ${runLabel} (${taskId}) ===`);

  const startedAt = Date.now();
  const { response, metadata } = await gateway.chatCompletion({
    task: task.routingTask,
    provider,
    model,
    label: `MODEL_EVAL_${taskId}`,
    messages,
    response_format: { type: 'json_object' },
  });
  const wallLatencyMs = Date.now() - startedAt;
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${runLabel} failed ${response.status}: ${text.slice(0, 400)}`);
  }

  const parsedEnvelope = JSON.parse(text);
  const content = parsedEnvelope.choices?.[0]?.message?.content ?? text;
  const parsed = JSON.parse(stripCodeFences(content));
  const predictions = task.mapPredictions(parsed);
  const scored = task.score(golden, predictions);

  const usage = parsedEnvelope.usage || {};
  const totalCost = numberOrNull(usage.cost ?? usage.cost_details?.upstream_inference_cost);
  const latency = latencyStats([metadata?.duration_ms ?? wallLatencyMs]);

  const runSummary = {
    run_label: runLabel,
    provider,
    model,
    accuracy: scored.accuracy,
    sample_size: scored.sample_size,
    latency,
    cost: {
      total: totalCost,
      per_unit: totalCost !== null && scored.sample_size > 0 ? totalCost / scored.sample_size : null,
    },
  };

  const runDir = join(outputDir, 'runs', slugify(runLabel));
  mkdirSync(runDir, { recursive: true });
  writeJson(join(runDir, 'predictions.json'), { run_label: runLabel, predictions });
  writeJson(join(runDir, 'report.json'), { run_summary: runSummary, detail: scored.detail });
  console.log(`accuracy=${scored.accuracy} sample=${scored.sample_size} latency=${latency.avg_ms}ms`);
  return runSummary;
}

// 'internal' capture: the task drives a shared production code path (e.g. the
// classification core) itself. It returns predictions + an end-to-end wall
// latency that already reflects production batching/concurrency/retries.
async function captureInternalAndScore(gateway, model) {
  const runLabel = `${provider}/${model}`;
  console.log(`\n=== ${runLabel} (${taskId}) [production-fidelity] ===`);

  const limit = numberOrNull(Number(args.limit ?? process.env.MODEL_EVAL_LIMIT));
  const capture = await task.capture({ gateway, model, provider, limit: limit ?? undefined });
  const scored = task.score(golden, capture.predictions);
  const latency = latencyStats([capture.latency_ms]);

  const runSummary = {
    run_label: runLabel,
    provider,
    model,
    accuracy: scored.accuracy,
    sample_size: scored.sample_size,
    latency,
    cost: { total: null, per_unit: null },
  };

  const runDir = join(outputDir, 'runs', slugify(runLabel));
  mkdirSync(runDir, { recursive: true });
  writeJson(join(runDir, 'predictions.json'), { run_label: runLabel, predictions: capture.predictions });
  writeJson(join(runDir, 'report.json'), {
    run_summary: runSummary,
    detail: scored.detail,
    capture: {
      classified: capture.classified,
      total: capture.total,
      wall_latency_ms: capture.latency_ms,
    },
  });
  console.log(
    `accuracy=${scored.accuracy} sample=${scored.sample_size} classified=${capture.classified}/${capture.total} wall=${capture.latency_ms}ms`
  );
  return runSummary;
}

function scoreExternalRun() {
  const predictionsPath = args['predictions-path'] || process.env.MODEL_EVAL_PREDICTIONS_PATH;
  if (!predictionsPath) {
    console.log(
      `Task ${taskId} uses external capture (${task.external_capture_command}).\n` +
        'Provide --predictions-path to score an existing predictions.json.'
    );
    return null;
  }
  const predictionsDoc = readJson(resolve(predictionsPath));
  const predictions = Array.isArray(predictionsDoc) ? predictionsDoc : predictionsDoc.predictions;
  const metadata = predictionsDoc.metadata || {};
  const scored = task.score(golden, predictions, metadata);
  return {
    run_label: `${metadata.provider || 'unknown'}/${metadata.model || 'unknown'}`,
    provider: metadata.provider || 'unknown',
    model: metadata.model || 'unknown',
    accuracy: scored.accuracy,
    sample_size: scored.sample_size,
    latency: latencyStats([]),
    cost: { total: null, per_unit: null },
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[(i += 1)] : 'true';
      out[key] = value;
    }
  }
  return out;
}

function parseList(value) {
  return String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function stripCodeFences(text) {
  return String(text)
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function numberOrNull(value) {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
