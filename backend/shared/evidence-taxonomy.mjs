import assert from 'node:assert/strict';

export const CANONICAL_EVIDENCE_CLASSES = Object.freeze([
  'fixture',
  'partner_sandbox',
  'sanctioned_pilot',
]);

const EVIDENCE_ALIASES = Object.freeze({
  synthetic: 'fixture',
  sandbox: 'partner_sandbox',
  sanctioned: 'sanctioned_pilot',
});

const CANONICAL_SET = new Set(CANONICAL_EVIDENCE_CLASSES);

export function canonicalEvidenceClass(value, fallback = null) {
  if (CANONICAL_SET.has(value)) return value;
  if (Object.hasOwn(EVIDENCE_ALIASES, value)) return EVIDENCE_ALIASES[value];
  return fallback;
}

export function storageEvidenceClass(value) {
  const canonical = canonicalEvidenceClass(value);
  assert.ok(canonical, 'evidenceClass is invalid');
  return canonical === 'fixture'
    ? 'synthetic'
    : canonical === 'partner_sandbox'
      ? 'sandbox'
      : 'sanctioned';
}

export function bundleEvidenceClass(items) {
  const classes = [...new Set(items
    .map((item) => canonicalEvidenceClass(item?.evidenceClass ?? item?.evidence_class ?? item))
    .filter(Boolean))];
  if (classes.length === 0) return 'fixture';
  return classes.length === 1 ? classes[0] : 'mixed';
}

export function deriveClaimStatus({
  evidenceClass,
  measurementStatus,
  gatesPassed = false,
  independentReview = 'not_started',
}) {
  const origin = canonicalEvidenceClass(evidenceClass);
  if (origin !== 'sanctioned_pilot' || measurementStatus !== 'measured' || !gatesPassed) {
    return 'not_eligible';
  }
  if (independentReview === 'approved') return 'approved';
  if (independentReview === 'pending') return 'independent_review_required';
  return 'descriptive';
}

