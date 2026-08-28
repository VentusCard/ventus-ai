import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateInterventionBenchmark } from '../shared/pilot/intervention-benchmark.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const manifestPath = process.env.VENTUS_INTERVENTION_BENCHMARK_PATH
  ? resolve(process.env.VENTUS_INTERVENTION_BENCHMARK_PATH)
  : join(backendRoot, 'fixtures', 'evaluation', 'intervention-planning-benchmark.json');
const candidatePath = process.env.VENTUS_INTERVENTION_PREDICTIONS_PATH
  ? resolve(process.env.VENTUS_INTERVENTION_PREDICTIONS_PATH)
  : null;
const manifest = readJson(manifestPath);
const candidatePredictions = candidatePath ? readJson(candidatePath) : null;
const candidateCostUsd = candidatePath
  ? Number(process.env.VENTUS_INTERVENTION_CANDIDATE_COST_USD)
  : null;

if (candidatePath) {
  assert.ok(
    Number.isFinite(candidateCostUsd) && candidateCostUsd >= 0,
    'VENTUS_INTERVENTION_CANDIDATE_COST_USD is required with candidate predictions'
  );
}

const report = evaluateInterventionBenchmark({
  manifest,
  candidatePredictions,
  candidateCostUsd,
  candidate: candidatePath ? {
    provider: process.env.VENTUS_INTERVENTION_PROVIDER ?? null,
    model: process.env.VENTUS_INTERVENTION_MODEL ?? null,
    run_id: process.env.VENTUS_INTERVENTION_RUN_ID ?? null,
  } : null,
});

assert.equal(report.baseline.hardFailureCount, 0, 'deterministic baseline emitted an invalid decision contract');

if (process.env.VENTUS_INTERVENTION_REPORT_PATH) {
  const reportPath = resolve(process.env.VENTUS_INTERVENTION_REPORT_PATH);
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`wrote intervention evaluation report: ${reportPath}`);
}

console.log([
  `Intervention benchmark: ${report.benchmark.benchmark_id}`,
  `status=${report.benchmark.status}`,
  `cases=${report.benchmark.cases}`,
  `expectations_sha256=${report.benchmark.expectations_sha256}`,
  `independent_review_complete=${report.benchmark.independent_review_complete}`,
  `baseline_pass_rate=${report.baseline.passRate}`,
  `baseline_score=${report.baseline.averageScore}`,
].join(', '));

if (!candidatePath) {
  console.log('no candidate predictions provided; validated draft packet and deterministic baseline only');
} else {
  console.log([
    `candidate=${report.candidate.provider ?? 'unknown'}/${report.candidate.model ?? 'unknown'}`,
    `pass_rate=${report.candidate.passRate}`,
    `score=${report.candidate.averageScore}`,
    `quality_delta=${report.comparison.qualityDelta}`,
    `cost_per_1000_cases_usd=${report.candidate.costPer1000CasesUsd}`,
    `evaluation_gate_passed=${report.comparison.evaluationGatePassed}`,
    `promotion_evidence_eligible=${report.comparison.promotionEvidenceEligible}`,
    `runtime_promotion_allowed=${report.runtimePromotionAllowed}`,
  ].join(', '));
  if (process.env.VENTUS_INTERVENTION_REQUIRE_GATE === '1') {
    assert.equal(report.comparison.evaluationGatePassed, true, 'candidate did not pass the quality gate');
    assert.equal(report.comparison.promotionEvidenceEligible, true, 'benchmark is not frozen with independent review');
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}
