import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  adjudicateInterventionReviews,
  freezeInterventionBenchmark,
} from '../shared/pilot/intervention-review.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const manifestPath = process.env.VENTUS_INTERVENTION_BENCHMARK_PATH
  ? resolve(process.env.VENTUS_INTERVENTION_BENCHMARK_PATH)
  : join(backendRoot, 'fixtures', 'evaluation', 'intervention-planning-benchmark.json');
const reviewPaths = (process.env.VENTUS_INTERVENTION_REVIEW_PATHS ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean)
  .map((item) => resolve(item));
assert.ok(reviewPaths.length >= 2, 'VENTUS_INTERVENTION_REVIEW_PATHS must contain at least two comma-separated packet paths');

const manifest = readJson(manifestPath);
const packets = reviewPaths.map(readJson);
const adjudication = adjudicateInterventionReviews(manifest, packets);
const report = {
  benchmark_id: adjudication.benchmark_id,
  reviewer_ids: adjudication.reviewer_ids,
  source_packet_sha256: adjudication.source_packet_sha256,
  ready_to_freeze: adjudication.ready_to_freeze,
  disagreements: adjudication.disagreements,
  authored_differences: adjudication.authored_differences,
};

if (process.env.VENTUS_INTERVENTION_REVIEW_REPORT_PATH) {
  writeJson(resolve(process.env.VENTUS_INTERVENTION_REVIEW_REPORT_PATH), report);
}
console.log(`Intervention review: reviewers=${report.reviewer_ids.join(', ')}, ready_to_freeze=${report.ready_to_freeze}`);
console.log(`disagreements=${report.disagreements.length}, authored_differences=${report.authored_differences.length}`);
for (const disagreement of report.disagreements) console.log(` · disagreement: ${disagreement.case_id}`);

if (process.env.VENTUS_INTERVENTION_FREEZE_OUTPUT_PATH) {
  assert.equal(adjudication.ready_to_freeze, true, 'cannot write a frozen benchmark while disagreements remain');
  const frozen = freezeInterventionBenchmark(manifest, packets).manifest;
  const outputPath = resolve(process.env.VENTUS_INTERVENTION_FREEZE_OUTPUT_PATH);
  writeJson(outputPath, frozen);
  console.log(`Wrote consensus-frozen benchmark: ${outputPath}`);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
