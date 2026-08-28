import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  computeInterventionExpectationsHash,
  materializeInterventionCase,
  validateInterventionBenchmark,
} from './intervention-benchmark.mjs';

export function buildBlindReviewPacket(manifest, reviewerSlot) {
  const readiness = validateInterventionBenchmark(manifest);
  assert.equal(readiness.frozen, false, 'cannot prepare review packets from a frozen benchmark');
  assertIdentifier(reviewerSlot, 'reviewerSlot');
  const visibleCases = manifest.cases.map((benchmarkCase) => {
    const materialized = materializeInterventionCase(manifest, benchmarkCase);
    return {
      case_id: benchmarkCase.case_id,
      growth_play_id: benchmarkCase.growth_play_id,
      objective: benchmarkCase.objective,
      dimensions: benchmarkCase.dimensions,
      evidence: benchmarkCase.evidence,
      allowed_actions: materialized.allowed_actions.map((action) => ({
        action_id: action.action_id,
        label: action.label,
        owner_role: action.owner_role,
        default_channel: action.default_channel,
      })),
      required_policies: materialized.required_policies,
    };
  });
  return {
    version: 1,
    benchmark_id: manifest.benchmark_id,
    reviewer_slot: reviewerSlot,
    reviewer_id: '',
    reviewed_at: '',
    source_packet_sha256: hashVisibleCases(visibleCases),
    instructions: [
      'Review without opening candidate model predictions or the authored expected labels.',
      'Choose one allowed action or abstain for every case.',
      'Cite only supplied evidence transaction ids that materially support the decision.',
      'Do not change case content, source_packet_sha256, or reviewer_slot.',
    ],
    cases: visibleCases.map((benchmarkCase) => ({
      ...benchmarkCase,
      review: {
        action_id: null,
        abstain: null,
        evidence_transaction_ids: [],
        notes: '',
      },
    })),
  };
}

export function validateInterventionReview(manifest, packet) {
  assert.ok(packet && typeof packet === 'object' && !Array.isArray(packet), 'review packet must be an object');
  assert.equal(packet.version, 1, 'unsupported review packet version');
  assert.equal(packet.benchmark_id, manifest.benchmark_id, 'review packet benchmark mismatch');
  assertIdentifier(packet.reviewer_slot, 'reviewer_slot');
  assertIdentifier(packet.reviewer_id, 'reviewer_id');
  assert.ok(!Number.isNaN(Date.parse(packet.reviewed_at)), 'reviewed_at is invalid');
  assert.ok(Array.isArray(packet.cases), 'review cases are required');

  const expectedBlind = buildBlindReviewPacket(manifest, packet.reviewer_slot);
  assert.equal(packet.source_packet_sha256, expectedBlind.source_packet_sha256, 'review packet source hash mismatch');
  assert.equal(packet.cases.length, manifest.cases.length, 'review packet must cover every benchmark case');

  const sourceCases = new Map(expectedBlind.cases.map((item) => [item.case_id, item]));
  const seen = new Set();
  const decisions = [];
  for (const reviewedCase of packet.cases) {
    assertIdentifier(reviewedCase.case_id, 'review.case_id');
    assert.ok(!seen.has(reviewedCase.case_id), `duplicate review case ${reviewedCase.case_id}`);
    seen.add(reviewedCase.case_id);
    const sourceCase = sourceCases.get(reviewedCase.case_id);
    assert.ok(sourceCase, `unknown review case ${reviewedCase.case_id}`);
    assert.equal(
      hashVisibleCases([stripReview(reviewedCase)]),
      hashVisibleCases([stripReview(sourceCase)]),
      `visible case content changed for ${reviewedCase.case_id}`,
    );
    const review = reviewedCase.review;
    assert.ok(review && typeof review === 'object' && !Array.isArray(review), `review decision missing for ${reviewedCase.case_id}`);
    assert.equal(typeof review.abstain, 'boolean', `abstain must be decided for ${reviewedCase.case_id}`);
    const allowedActionIds = new Set(sourceCase.allowed_actions.map((action) => action.action_id));
    if (review.abstain) {
      assert.equal(review.action_id, null, `abstaining review must have a null action for ${reviewedCase.case_id}`);
    } else {
      assert.ok(allowedActionIds.has(review.action_id), `review selected an unapproved action for ${reviewedCase.case_id}`);
    }
    assert.ok(Array.isArray(review.evidence_transaction_ids), `review evidence must be an array for ${reviewedCase.case_id}`);
    if (!review.abstain) {
      assert.ok(review.evidence_transaction_ids.length > 0, `non-abstaining review must cite evidence for ${reviewedCase.case_id}`);
    }
    const suppliedEvidence = new Set(sourceCase.evidence.map((item) => item.transaction_id));
    const cited = new Set();
    for (const transactionId of review.evidence_transaction_ids) {
      assert.ok(suppliedEvidence.has(transactionId), `review cited unknown evidence ${transactionId} for ${reviewedCase.case_id}`);
      assert.ok(!cited.has(transactionId), `review cited duplicate evidence ${transactionId} for ${reviewedCase.case_id}`);
      cited.add(transactionId);
    }
    assert.ok(review.notes === undefined || typeof review.notes === 'string', `review notes are invalid for ${reviewedCase.case_id}`);
    decisions.push({
      case_id: reviewedCase.case_id,
      action_id: review.abstain ? null : review.action_id,
      abstain: review.abstain,
      evidence_transaction_ids: [...cited].sort(),
      notes: review.notes ?? '',
    });
  }
  assert.deepEqual([...seen].sort(), [...sourceCases.keys()].sort(), 'review packet case coverage mismatch');
  return {
    reviewer_slot: packet.reviewer_slot,
    reviewer_id: packet.reviewer_id,
    reviewed_at: new Date(packet.reviewed_at).toISOString(),
    source_packet_sha256: packet.source_packet_sha256,
    decisions: decisions.sort((left, right) => left.case_id.localeCompare(right.case_id)),
  };
}

export function adjudicateInterventionReviews(manifest, packets) {
  validateInterventionBenchmark(manifest);
  assert.ok(Array.isArray(packets), 'review packets must be an array');
  assert.ok(packets.length >= manifest.review.minimum_reviewers, 'not enough review packets');
  const reviews = packets.map((packet) => validateInterventionReview(manifest, packet));
  assert.equal(new Set(reviews.map((review) => review.reviewer_id)).size, reviews.length, 'reviewers must be distinct');
  assert.equal(new Set(reviews.map((review) => review.reviewer_slot)).size, reviews.length, 'reviewer slots must be distinct');

  const disagreements = [];
  const consensus = [];
  const authoredDifferences = [];
  for (const benchmarkCase of manifest.cases) {
    const decisions = reviews.map((review) => review.decisions.find((item) => item.case_id === benchmarkCase.case_id));
    const canonical = decisions.map(canonicalDecision);
    if (new Set(canonical).size !== 1) {
      disagreements.push({
        case_id: benchmarkCase.case_id,
        reviews: reviews.map((review, index) => ({ reviewer_id: review.reviewer_id, ...decisions[index] })),
      });
      continue;
    }
    const agreed = {
      action_id: decisions[0].action_id,
      abstain: decisions[0].abstain,
      evidence_transaction_ids: decisions[0].evidence_transaction_ids,
    };
    consensus.push({ case_id: benchmarkCase.case_id, expected: agreed });
    if (canonicalDecision(agreed) !== canonicalDecision(benchmarkCase.expected)) {
      authoredDifferences.push({ case_id: benchmarkCase.case_id, authored: benchmarkCase.expected, consensus: agreed });
    }
  }
  return {
    benchmark_id: manifest.benchmark_id,
    reviewer_ids: reviews.map((review) => review.reviewer_id),
    source_packet_sha256: reviews[0].source_packet_sha256,
    ready_to_freeze: disagreements.length === 0 && consensus.length === manifest.cases.length,
    consensus,
    disagreements,
    authored_differences: authoredDifferences,
    reviews,
  };
}

export function freezeInterventionBenchmark(manifest, packets) {
  assert.equal(manifest.status, 'draft', 'only a draft benchmark can be frozen');
  const adjudication = adjudicateInterventionReviews(manifest, packets);
  assert.equal(adjudication.ready_to_freeze, true, 'review disagreements must be resolved before freezing');
  const consensus = new Map(adjudication.consensus.map((item) => [item.case_id, item.expected]));
  const frozen = structuredClone(manifest);
  frozen.cases = frozen.cases.map((benchmarkCase) => ({
    ...benchmarkCase,
    expected: consensus.get(benchmarkCase.case_id),
  }));
  frozen.review.reviewers = adjudication.reviews.map((review) => ({
    reviewer_id: review.reviewer_id,
    decision: 'approved',
    reviewed_at: review.reviewed_at,
    reviewer_slot: review.reviewer_slot,
    source_packet_sha256: review.source_packet_sha256,
  }));
  frozen.review.adjudication = {
    method: 'independent_consensus',
    authored_differences: adjudication.authored_differences.map((item) => item.case_id),
  };
  frozen.status = 'frozen';
  frozen.expectations_sha256 = computeInterventionExpectationsHash(frozen);
  validateInterventionBenchmark(frozen);
  return { manifest: frozen, adjudication };
}

function stripReview(benchmarkCase) {
  const { review: _review, ...visible } = benchmarkCase;
  return visible;
}

function hashVisibleCases(cases) {
  return createHash('sha256').update(JSON.stringify(cases)).digest('hex');
}

function canonicalDecision(decision) {
  return JSON.stringify({
    action_id: decision.action_id ?? null,
    abstain: decision.abstain === true,
    evidence_transaction_ids: [...(decision.evidence_transaction_ids ?? [])].sort(),
  });
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.trim().length >= 2 && value.length <= 200, `${label} is invalid`);
}
