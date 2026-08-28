import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  buildReleaseEvidenceManifest,
  candidateFromStagingEvidence,
  validateReleaseEvidenceManifest,
} from './release-evidence-manifest.mjs';

const source = JSON.parse(readFileSync(new URL('../../docs/evidence/staging-acceptance-2026-08-01.json', import.meta.url)));
const COMMIT = 'a'.repeat(40);
const DIGEST = `sha256:${'b'.repeat(64)}`;

test('release manifest binds the full bank-review release and derives readiness', () => {
  const candidate = completeCandidate();
  const manifest = buildReleaseEvidenceManifest(candidate);
  validateReleaseEvidenceManifest(manifest, { requireReady: true });
  assert.equal(manifest.status, 'bank_review_ready');
  assert.deepEqual(manifest.exceptions, []);
  assert.match(manifest.manifestDigest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(manifest.release.reviewedCommit, COMMIT);
  assert.equal(manifest.frontend.deployedCommit, COMMIT);
  assert.equal(manifest.api.deployedCommit, COMMIT);
});

test('release manifest fails closed on an unknown or mismatched component', () => {
  const candidate = completeCandidate();
  candidate.frontend.deployedCommit = 'c'.repeat(40);
  const manifest = buildReleaseEvidenceManifest(candidate);
  assert.equal(manifest.status, 'not_bank_review_ready');
  assert.ok(manifest.exceptions.some((item) => item.code === 'frontend_commit_or_build_unbound'));
  assert.throws(() => validateReleaseEvidenceManifest(manifest, { requireReady: true }), /not bank-review ready/);
});

test('release manifest rejects secret-bearing fields and digest tampering', () => {
  const candidate = completeCandidate();
  candidate.api.rawCredential = 'must-not-enter-manifest';
  assert.throws(() => buildReleaseEvidenceManifest(candidate), /secret-bearing field/);

  const manifest = buildReleaseEvidenceManifest(completeCandidate());
  manifest.claims.knownLimitations.push('tampered');
  assert.throws(() => validateReleaseEvidenceManifest(manifest), /digest does not match/);
});

test('release manifest cannot self-declare readiness when a component is still unknown', () => {
  const manifest = buildReleaseEvidenceManifest(completeCandidate());
  manifest.frontend.amplify.jobId = null;
  manifest.status = 'bank_review_ready';
  manifest.claims.claimStatus = 'bank_review_ready';
  assert.throws(() => validateReleaseEvidenceManifest(manifest), /digest does not match/);
  manifest.manifestDigest = manifestDigestWithoutMutation(manifest);
  assert.throws(() => validateReleaseEvidenceManifest(manifest), /readiness was not derived/);
});

test('schema names the required release sections and readiness state', () => {
  const schema = JSON.parse(readFileSync(new URL('../../docs/evidence/release-manifest.schema.json', import.meta.url)));
  assert.ok(schema.required.includes('frontend'));
  assert.ok(schema.required.includes('identityAuthorization'));
  assert.ok(schema.required.includes('dataPlane'));
  assert.deepEqual(schema.properties.status.enum, ['bank_review_ready', 'not_bank_review_ready']);
});

function completeCandidate() {
  const candidate = candidateFromStagingEvidence(source, { createdAt: '2026-08-01T23:30:00-05:00' });
  candidate.release.reviewedCommit = COMMIT;
  candidate.release.reviewerState = { status: 'approved', releaseOwner: 'release_owner', independentReviewer: 'independent_reviewer' };
  candidate.frontend.amplify.jobId = 'amplify-job-123';
  candidate.frontend.deployedCommit = COMMIT;
  candidate.frontend.buildArtifactDigest = DIGEST;
  candidate.frontend.buildResult = 'success';
  candidate.frontend.observedAt = candidate.release.createdAt;
  candidate.api.deployedCommit = COMMIT;
  candidate.api.artifactDigests = [{ name: 'ventus-console-api', digest: DIGEST }];
  candidate.publicConfiguration.identityTarget.valueDigest = DIGEST;
  candidate.publicConfiguration.configurationDigest = DIGEST;
  candidate.identityAuthorization.userPool = { idDigest: DIGEST, issuerDigest: DIGEST };
  candidate.identityAuthorization.clientIdDigest = DIGEST;
  candidate.identityAuthorization.membershipSchemaVersion = 'institution-access-v1';
  candidate.identityAuthorization.sixRoleReceipt = { id: 'receipt-six-role', digest: DIGEST, result: 'pass' };
  candidate.identityAuthorization.deniedOperationReceipt = { id: 'receipt-denied-operation', digest: DIGEST, result: 'pass' };
  candidate.dataPlane.ledger.headHash = DIGEST;
  for (const item of candidate.integrations) {
    item.mappingVersion = 'mapping-v1';
    item.healthReceiptId = `health-${item.name}`;
    item.reconciliationReceiptId = `reconcile-${item.name}`;
    item.status = 'verified';
  }
  candidate.productContract.decisionPackageDigest = DIGEST;
  candidate.productContract.approvedProtocols = [{ id: 'dcp_rehearsal', digest: DIGEST }];
  candidate.productContract.deterministicVersion = 'console-runtime-v1';
  candidate.acceptance = candidate.acceptance.map((row) => ({
    ...row,
    result: 'pass',
    artifact: { uri: `evidence/${row.rowId}.json`, digest: DIGEST },
    actor: 'reviewer',
    timestamp: candidate.release.createdAt,
  }));
  candidate.claims.measurementStatus = 'not_ready';
  candidate.claims.claimStatus = 'bank_review_ready';
  candidate.approval = {
    releaseOwner: { actor: 'release_owner', receiptId: 'approval-release', approvedAt: candidate.release.createdAt },
    independentReviewer: { actor: 'independent_reviewer', receiptId: 'approval-independent', approvedAt: candidate.release.createdAt },
  };
  return candidate;
}

function manifestDigestWithoutMutation(manifest) {
  const copy = JSON.parse(JSON.stringify(manifest));
  delete copy.manifestDigest;
  return `sha256:${createHash('sha256').update(JSON.stringify(copy)).digest('hex')}`;
}
