import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  adjudicateInterventionReviews,
  buildBlindReviewPacket,
  freezeInterventionBenchmark,
  validateInterventionReview,
} from './intervention-review.mjs';
import { validateInterventionBenchmark } from './intervention-benchmark.mjs';

const fixtureUrl = new URL('../../fixtures/evaluation/intervention-planning-benchmark.json', import.meta.url);

test('blind packet excludes authored expectations and candidate predictions', () => {
  const packet = buildBlindReviewPacket(fixture(), 'reviewer-1');
  assert.equal(packet.cases.length, 21);
  assert.match(packet.source_packet_sha256, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(packet).includes('"expected"'), false);
  assert.equal(Object.hasOwn(packet, 'candidate_predictions'), false);
  assert.ok(packet.cases.every((item) => !Object.hasOwn(item, 'prediction')));
  assert.ok(packet.cases.every((item) => item.review.abstain === null));
});

test('review validation rejects changed case content and fabricated evidence', () => {
  const manifest = fixture();
  const packet = completedPacket(manifest, 'reviewer-1', 'reviewer_one');
  packet.cases[0].objective = 'Changed after packet creation';
  assert.throws(() => validateInterventionReview(manifest, packet), /visible case content changed/);

  const fabricated = completedPacket(manifest, 'reviewer-1', 'reviewer_one');
  fabricated.cases[0].review.evidence_transaction_ids = ['tx_fabricated'];
  assert.throws(() => validateInterventionReview(manifest, fabricated), /unknown evidence/);

  const unsupported = completedPacket(manifest, 'reviewer-1', 'reviewer_one');
  unsupported.cases[0].review.evidence_transaction_ids = [];
  assert.throws(() => validateInterventionReview(manifest, unsupported), /must cite evidence/);
});

test('two independent matching reviews derive and freeze consensus expectations', () => {
  const manifest = fixture();
  const packets = [
    completedPacket(manifest, 'reviewer-1', 'reviewer_one'),
    completedPacket(manifest, 'reviewer-2', 'reviewer_two'),
  ];
  const adjudication = adjudicateInterventionReviews(manifest, packets);
  assert.equal(adjudication.ready_to_freeze, true);
  assert.equal(adjudication.disagreements.length, 0);
  const frozen = freezeInterventionBenchmark(manifest, packets).manifest;
  const readiness = validateInterventionBenchmark(frozen);
  assert.equal(readiness.promotionEvidenceEligible, true);
  assert.equal(frozen.review.reviewers.length, 2);
  assert.equal(frozen.review.adjudication.method, 'independent_consensus');
});

test('review disagreements block benchmark freezing and are reported by case', () => {
  const manifest = fixture();
  const first = completedPacket(manifest, 'reviewer-1', 'reviewer_one');
  const second = completedPacket(manifest, 'reviewer-2', 'reviewer_two');
  second.cases[0].review = { action_id: null, abstain: true, evidence_transaction_ids: [], notes: 'Insufficient evidence.' };
  const adjudication = adjudicateInterventionReviews(manifest, [first, second]);
  assert.equal(adjudication.ready_to_freeze, false);
  assert.deepEqual(adjudication.disagreements.map((item) => item.case_id), [manifest.cases[0].case_id]);
  assert.throws(() => freezeInterventionBenchmark(manifest, [first, second]), /disagreements must be resolved/);
});

function fixture() {
  return JSON.parse(readFileSync(fixtureUrl, 'utf8'));
}

function completedPacket(manifest, reviewerSlot, reviewerId) {
  const packet = buildBlindReviewPacket(manifest, reviewerSlot);
  packet.reviewer_id = reviewerId;
  packet.reviewed_at = reviewerSlot === 'reviewer-1' ? '2026-07-12T20:00:00.000Z' : '2026-07-12T21:00:00.000Z';
  const expected = new Map(manifest.cases.map((item) => [item.case_id, item.expected]));
  packet.cases = packet.cases.map((item) => ({
    ...item,
    review: { ...expected.get(item.case_id), notes: '' },
  }));
  return packet;
}
