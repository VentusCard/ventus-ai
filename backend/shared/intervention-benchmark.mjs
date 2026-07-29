import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  comparePlannerRuns,
  runDeterministicInterventionBaseline,
  scoreInterventionPlan,
  validateInterventionInput,
} from './intervention-planner.mjs';

export function validateInterventionBenchmark(manifest) {
  assert.ok(manifest && typeof manifest === 'object' && !Array.isArray(manifest), 'benchmark manifest must be an object');
  assert.equal(manifest.version, 1, 'unsupported benchmark version');
  assertIdentifier(manifest.benchmark_id, 'benchmark_id');
  assert.ok(['draft', 'frozen'].includes(manifest.status), 'benchmark status must be draft or frozen');
  assert.ok(manifest.catalogs?.actions && typeof manifest.catalogs.actions === 'object', 'action catalog is required');
  assert.ok(Array.isArray(manifest.catalogs?.channels) && manifest.catalogs.channels.length > 0, 'channel catalog is required');
  assert.ok(Array.isArray(manifest.catalogs?.policy_ids) && manifest.catalogs.policy_ids.length > 0, 'policy catalog is required');
  assert.ok(Array.isArray(manifest.cases) && manifest.cases.length > 0, 'benchmark cases are required');
  assert.ok(Number.isInteger(manifest.review?.minimum_reviewers) && manifest.review.minimum_reviewers >= 2, 'at least two reviewers are required');
  assert.ok(Array.isArray(manifest.review?.reviewers), 'benchmark reviewers must be an array');

  const caseIds = new Set();
  for (const benchmarkCase of manifest.cases) {
    assertIdentifier(benchmarkCase.case_id, 'case_id');
    assert.ok(!caseIds.has(benchmarkCase.case_id), `duplicate benchmark case ${benchmarkCase.case_id}`);
    caseIds.add(benchmarkCase.case_id);
    assert.ok(Array.isArray(benchmarkCase.dimensions) && benchmarkCase.dimensions.length > 0, `dimensions missing for ${benchmarkCase.case_id}`);
    assert.ok(Array.isArray(benchmarkCase.allowed_action_ids) && benchmarkCase.allowed_action_ids.length > 0, `actions missing for ${benchmarkCase.case_id}`);
    assert.ok(benchmarkCase.policy_verdicts && typeof benchmarkCase.policy_verdicts === 'object', `policy verdicts missing for ${benchmarkCase.case_id}`);
    assert.ok(benchmarkCase.expected && typeof benchmarkCase.expected === 'object', `expectation missing for ${benchmarkCase.case_id}`);
    const materialized = materializeInterventionCase(manifest, benchmarkCase);
    assert.equal(typeof benchmarkCase.expected.abstain, 'boolean', `expected abstain must be boolean for ${benchmarkCase.case_id}`);
    if (benchmarkCase.expected.abstain) {
      assert.equal(benchmarkCase.expected.action_id, null, `abstaining case must have a null action for ${benchmarkCase.case_id}`);
    } else {
      assert.ok(
        benchmarkCase.allowed_action_ids.includes(benchmarkCase.expected.action_id),
        `expected action is not allowed for ${benchmarkCase.case_id}`
      );
    }
    const evidenceIds = new Set(materialized.evidence.map((item) => item.transaction_id));
    assert.ok(Array.isArray(benchmarkCase.expected.evidence_transaction_ids), `expected evidence missing for ${benchmarkCase.case_id}`);
    for (const transactionId of benchmarkCase.expected.evidence_transaction_ids) {
      assert.ok(evidenceIds.has(transactionId), `expected evidence ${transactionId} is not supplied for ${benchmarkCase.case_id}`);
    }
  }

  const reviewerIds = manifest.review.reviewers.map((reviewer) => {
    assertIdentifier(reviewer.reviewer_id, 'reviewer_id');
    assert.equal(reviewer.decision, 'approved', `reviewer ${reviewer.reviewer_id} has not approved the benchmark`);
    assert.ok(!Number.isNaN(Date.parse(reviewer.reviewed_at)), `reviewer ${reviewer.reviewer_id} reviewed_at is invalid`);
    return reviewer.reviewer_id;
  });
  assert.equal(new Set(reviewerIds).size, reviewerIds.length, 'benchmark reviewers must be distinct');
  const expectationsHash = computeInterventionExpectationsHash(manifest);
  if (manifest.status === 'frozen') {
    assert.ok(
      reviewerIds.length >= manifest.review.minimum_reviewers,
      'frozen benchmark does not have enough independent reviewers'
    );
    assert.equal(manifest.expectations_sha256, expectationsHash, 'frozen expectation hash does not match benchmark cases');
  } else {
    assert.equal(manifest.expectations_sha256, null, 'draft benchmark must not claim a frozen expectation hash');
  }
  return {
    caseCount: manifest.cases.length,
    expectationsHash,
    frozen: manifest.status === 'frozen',
    independentReviewComplete: reviewerIds.length >= manifest.review.minimum_reviewers,
    promotionEvidenceEligible: manifest.status === 'frozen'
      && reviewerIds.length >= manifest.review.minimum_reviewers
      && manifest.expectations_sha256 === expectationsHash,
  };
}

export function materializeInterventionCase(manifest, benchmarkCase) {
  const allowedActions = benchmarkCase.allowed_action_ids.map((actionId) => {
    const action = manifest.catalogs.actions[actionId];
    assert.ok(action, `unknown action ${actionId} in ${benchmarkCase.case_id}`);
    return { action_id: actionId, ...action };
  });
  const allowedChannels = benchmarkCase.allowed_channels ?? manifest.catalogs.channels;
  for (const channel of allowedChannels) {
    assert.ok(manifest.catalogs.channels.includes(channel), `unknown channel ${channel} in ${benchmarkCase.case_id}`);
  }
  const requiredPolicies = manifest.catalogs.policy_ids.map((policyId) => {
    const verdict = benchmarkCase.policy_verdicts[policyId];
    assert.ok(['clear', 'review', 'block'].includes(verdict), `missing or invalid ${policyId} verdict in ${benchmarkCase.case_id}`);
    return { policy_id: policyId, verdict };
  });
  const input = {
    case_id: benchmarkCase.case_id,
    household_token: benchmarkCase.household_token,
    growth_play_id: benchmarkCase.growth_play_id,
    objective: benchmarkCase.objective,
    evidence: benchmarkCase.evidence,
    allowed_actions: allowedActions,
    allowed_channels: allowedChannels,
    required_policies: requiredPolicies,
    expected: benchmarkCase.expected,
  };
  return validateInterventionInput(input);
}

export function computeInterventionExpectationsHash(manifest) {
  const frozenPayload = manifest.cases
    .map((benchmarkCase) => ({
      case_id: benchmarkCase.case_id,
      expected: benchmarkCase.expected,
    }))
    .sort((left, right) => left.case_id.localeCompare(right.case_id));
  return createHash('sha256').update(JSON.stringify(frozenPayload)).digest('hex');
}

export function evaluateInterventionBenchmark({
  manifest,
  candidatePredictions = null,
  candidateCostUsd = null,
  candidate = null,
}) {
  const readiness = validateInterventionBenchmark(manifest);
  const cases = manifest.cases.map((benchmarkCase) => materializeInterventionCase(manifest, benchmarkCase));
  const baselinePredictions = Object.fromEntries(cases.map((input) => [
    input.case_id,
    runDeterministicInterventionBaseline(input),
  ]));
  const baseline = evaluatePredictions(cases, baselinePredictions);
  const report = {
    benchmark: {
      benchmark_id: manifest.benchmark_id,
      status: manifest.status,
      cases: cases.length,
      expectations_sha256: readiness.expectationsHash,
      independent_review_complete: readiness.independentReviewComplete,
      promotion_evidence_eligible: readiness.promotionEvidenceEligible,
    },
    baseline: { ...baseline, costUsd: 0, costPer1000CasesUsd: 0 },
    candidate: null,
    comparison: null,
    runtimePromotionAllowed: false,
  };
  if (!candidatePredictions) return report;
  assert.ok(Number.isFinite(candidateCostUsd) && candidateCostUsd >= 0, 'candidate cost is required with candidate predictions');
  const comparison = comparePlannerRuns({
    cases,
    candidatePredictions,
    baselinePredictions,
    candidateCostUsd,
  });
  const candidateEvaluation = evaluatePredictions(cases, candidatePredictions);
  report.candidate = {
    provider: candidate?.provider ?? null,
    model: candidate?.model ?? null,
    run_id: candidate?.run_id ?? null,
    ...candidateEvaluation,
    costUsd: candidateCostUsd,
    costPer1000CasesUsd: comparison.candidate.costPer1000CasesUsd,
  };
  report.comparison = {
    qualityDelta: comparison.qualityDelta,
    evaluationGatePassed: comparison.evaluationGatePassed,
    promotionEvidenceEligible: readiness.promotionEvidenceEligible,
    blockers: [
      ...comparison.blockers,
      ...(!readiness.promotionEvidenceEligible ? ['benchmark_not_frozen_with_independent_review'] : []),
    ],
  };
  return report;
}

function evaluatePredictions(cases, predictions) {
  const results = cases.map((input) => ({
    case_id: input.case_id,
    ...scoreInterventionPlan(input, predictions[input.case_id]),
  }));
  const passed = results.filter((result) => result.valid && result.score >= 0.9).length;
  return {
    cases: cases.length,
    passed,
    passRate: round(passed / cases.length),
    averageScore: round(results.reduce((sum, result) => sum + result.score, 0) / cases.length),
    hardFailureCount: results.reduce((sum, result) => sum + result.hardFailures.length, 0),
    failures: results
      .filter((result) => !result.valid || result.score < 0.9)
      .map((result) => ({
        case_id: result.case_id,
        score: result.score,
        hard_failures: result.hardFailures,
        metrics: result.metrics,
      })),
  };
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 200, `${label} is invalid`);
}

function round(value) {
  return Number(value.toFixed(4));
}
