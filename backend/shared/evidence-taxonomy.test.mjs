import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bundleEvidenceClass,
  canonicalEvidenceClass,
  deriveClaimStatus,
  storageEvidenceClass,
} from './evidence-taxonomy.mjs';

test('evidence aliases are accepted only at the compatibility boundary', () => {
  assert.equal(canonicalEvidenceClass('synthetic'), 'fixture');
  assert.equal(canonicalEvidenceClass('sandbox'), 'partner_sandbox');
  assert.equal(canonicalEvidenceClass('sanctioned'), 'sanctioned_pilot');
  assert.equal(storageEvidenceClass('partner_sandbox'), 'sandbox');
  assert.equal(bundleEvidenceClass(['sandbox', 'partner_sandbox']), 'partner_sandbox');
  assert.equal(bundleEvidenceClass(['fixture', 'partner_sandbox']), 'mixed');
});

test('claim authority never upgrades fixture or partner-sandbox evidence', () => {
  for (const evidenceClass of ['fixture', 'partner_sandbox']) {
    assert.equal(deriveClaimStatus({
      evidenceClass,
      measurementStatus: 'measured',
      gatesPassed: true,
      independentReview: 'approved',
    }), 'not_eligible');
  }
});

test('sanctioned claims advance only through measurement gates and exact review', () => {
  assert.equal(deriveClaimStatus({ evidenceClass: 'sanctioned_pilot', measurementStatus: 'collecting' }), 'not_eligible');
  assert.equal(deriveClaimStatus({ evidenceClass: 'sanctioned_pilot', measurementStatus: 'measured', gatesPassed: true }), 'descriptive');
  assert.equal(deriveClaimStatus({ evidenceClass: 'sanctioned_pilot', measurementStatus: 'measured', gatesPassed: true, independentReview: 'pending' }), 'independent_review_required');
  assert.equal(deriveClaimStatus({ evidenceClass: 'sanctioned_pilot', measurementStatus: 'measured', gatesPassed: true, independentReview: 'approved' }), 'approved');
});

