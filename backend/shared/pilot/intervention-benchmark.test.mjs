import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  computeInterventionExpectationsHash,
  evaluateInterventionBenchmark,
  materializeInterventionCase,
  validateInterventionBenchmark,
} from './intervention-benchmark.mjs';

const fixtureUrl = new URL('../../fixtures/evaluation/intervention-planning-benchmark.json', import.meta.url);

test('draft benchmark is valid but cannot support promotion evidence', () => {
  const manifest = fixture();
  const readiness = validateInterventionBenchmark(manifest);
  assert.equal(readiness.caseCount, 21);
  assert.equal(readiness.frozen, false);
  assert.equal(readiness.independentReviewComplete, false);
  assert.equal(readiness.promotionEvidenceEligible, false);
  assert.match(readiness.expectationsHash, /^[a-f0-9]{64}$/);
});

test('deterministic baseline exposes qualitative cases it cannot resolve', () => {
  const report = evaluateInterventionBenchmark({ manifest: fixture() });
  assert.equal(report.baseline.cases, 21);
  assert.equal(report.baseline.passed, 18);
  assert.equal(report.baseline.hardFailureCount, 0);
  assert.deepEqual(
    report.baseline.failures.map((failure) => failure.case_id),
    ['deposit_seasonal_tax_outflow', 'wealth_unverified_liquidity_source', 'merrill_canceled_transfer_conflict']
  );
  assert.equal(report.runtimePromotionAllowed, false);
});

test('candidate can beat baseline while draft labels still block promotion evidence', () => {
  const manifest = fixture();
  const predictions = Object.fromEntries(manifest.cases.map((benchmarkCase) => {
    const input = materializeInterventionCase(manifest, benchmarkCase);
    return [input.case_id, expectedPrediction(input)];
  }));
  const report = evaluateInterventionBenchmark({
    manifest,
    candidatePredictions: predictions,
    candidateCostUsd: 0.014,
    candidate: { provider: 'test-provider', model: 'test-model', run_id: 'run_001' },
  });
  assert.equal(report.candidate.passRate, 1);
  assert.ok(report.comparison.qualityDelta >= 0.02);
  assert.equal(report.comparison.evaluationGatePassed, true);
  assert.equal(report.comparison.promotionEvidenceEligible, false);
  assert.ok(report.comparison.blockers.includes('benchmark_not_frozen_with_independent_review'));
  assert.equal(report.runtimePromotionAllowed, false);
});

test('two approvals and a matching hash freeze labels against later edits', () => {
  const manifest = fixture();
  manifest.status = 'frozen';
  manifest.review.reviewers = [
    { reviewer_id: 'reviewer_one', decision: 'approved', reviewed_at: '2026-07-11T14:00:00.000Z' },
    { reviewer_id: 'reviewer_two', decision: 'approved', reviewed_at: '2026-07-11T15:00:00.000Z' },
  ];
  manifest.expectations_sha256 = computeInterventionExpectationsHash(manifest);
  assert.equal(validateInterventionBenchmark(manifest).promotionEvidenceEligible, true);

  manifest.cases[0].expected.action_id = null;
  assert.throws(() => validateInterventionBenchmark(manifest), /abstaining case|expectation hash|expected action/);
});

function fixture() {
  return JSON.parse(readFileSync(fixtureUrl, 'utf8'));
}

function expectedPrediction(input) {
  const abstain = input.expected.abstain;
  const action = input.allowed_actions.find((item) => item.action_id === input.expected.action_id);
  return {
    action_id: abstain ? null : action.action_id,
    channel: abstain ? null : action.default_channel,
    owner_role: abstain ? null : action.owner_role,
    rationale: abstain ? 'Supplied context does not support an approved action.' : 'Supplied evidence supports the expected approved action.',
    evidence_transaction_ids: input.expected.evidence_transaction_ids,
    policy_checks: input.required_policies.map((policy) => ({
      ...policy,
      explanation: 'Copied from supplied policy context.',
    })),
    confidence: 0.9,
    abstain,
    abstain_reason: abstain ? 'Evidence or policy context requires abstention.' : null,
  };
}
