import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BANNED_VOCABULARY,
  exclusionLabel,
  findBannedVocabulary,
  findSnakeCase,
  humanize,
  isBalanceDerived,
  lifeEventLabel,
  outreachWindow,
  outreachWindowBuckets,
  pastVerbFor,
  pluralize,
  signalLabel,
  verbFor,
} from './labels.mjs';

// --- signal labels -----------------------------------------------------------

test('life events read as something that happened, not as a field name', () => {
  assert.equal(lifeEventLabel('new_child_expected'), 'Expecting a child');
  assert.equal(lifeEventLabel('estate_inflow'), 'Inheritance received');
  assert.equal(lifeEventLabel('home_purchase_intent'), 'Shopping for a home');
});

test('an unlabeled key still never renders as snake_case', () => {
  // Defense in depth: a signal type added to the detectors before it is added
  // here must still be readable rather than leaking an internal key.
  assert.equal(lifeEventLabel('sudden_windfall_detected'), 'Sudden windfall detected');
  assert.deepEqual(findSnakeCase(lifeEventLabel('sudden_windfall_detected')), []);
  assert.deepEqual(findSnakeCase(signalLabel('some_new_token')), []);
});

test('humanize leaves already-readable text alone', () => {
  assert.equal(humanize('Travel-heavy spend'), 'Travel-heavy spend');
  assert.equal(humanize(''), '');
  assert.equal(humanize(null), '');
});

test('exclusion reasons slot into a sentence and stay lowercase-leading', () => {
  assert.equal(exclusionLabel('nsf_overdraft_cluster'), 'recent overdraft activity');
  assert.equal(exclusionLabel('thin_credit_file'), 'a limited credit history');
  // Unknown reasons degrade to readable lowercase rather than a raw key.
  assert.equal(exclusionLabel('some_new_gate'), 'some new gate');
});

test('balance-derived signals are identifiable so a row cannot rest only on them', () => {
  assert.equal(isBalanceDerived('idle_cash'), true);
  assert.equal(isBalanceDerived('home_equity'), true);
  assert.equal(isBalanceDerived('Travel-heavy spend'), false);
  assert.equal(isBalanceDerived('new_child_expected'), false);
});

// --- outreach windows --------------------------------------------------------

test('a one-time inflow gets the short window', () => {
  const w = outreachWindow('estate_inflow');
  assert.equal(w.days, 14);
  assert.equal(w.bucket, 'fast');
  assert.match(w.basis, /uncommitted/);
});

test('a dated life decision gets the standard window', () => {
  assert.equal(outreachWindow('home_purchase_intent').days, 30);
  assert.equal(outreachWindow('new_child_expected').days, 30);
});

test('an unrecognized signal never overstates urgency', () => {
  // Defaulting to the shortest window would manufacture pressure out of
  // ignorance, so anything unknown falls to the slow bucket.
  assert.equal(outreachWindow('something_unmapped').bucket, 'slow');
  assert.equal(outreachWindow(undefined).days, 45);
});

test('every window states why it is that long', () => {
  for (const bucket of Object.values(outreachWindowBuckets())) {
    assert.ok(bucket.basis.length > 40, `${bucket.label} needs a defensible basis`);
    assert.ok(bucket.days > 0);
  }
});

// --- vocabulary guards -------------------------------------------------------

test('findBannedVocabulary flags language that claims a decision we do not make', () => {
  assert.deepEqual(findBannedVocabulary('Three households qualify for this.'), ['qualify']);
  assert.ok(findBannedVocabulary('Suppressed on risk/underwriting gates.').length > 0);
  assert.ok(findBannedVocabulary('I back-tested your book.').includes('back-test'));
  assert.deepEqual(findBannedVocabulary('Three households fit this product.'), []);
});

test('the banned list covers the terms that misstate who decides eligibility', () => {
  for (const term of ['underwriting', 'qualify', 'eligible', 'back-tested']) {
    assert.ok(BANNED_VOCABULARY.includes(term), `${term} must stay on the list`);
  }
});

test('findSnakeCase distinguishes internal keys from prose', () => {
  assert.deepEqual(findSnakeCase('A clean sentence about travel spend.'), []);
  assert.deepEqual(findSnakeCase('Held back for nsf_overdraft_cluster.'), ['nsf_overdraft_cluster']);
});

// --- grammar -----------------------------------------------------------------

test('counts read grammatically at zero, one, and many', () => {
  assert.equal(pluralize(0, 'household'), '0 households');
  assert.equal(pluralize(1, 'household'), '1 household');
  assert.equal(pluralize(3, 'household'), '3 households');
  assert.equal(pluralize(1, 'opportunity', 'opportunities'), '1 opportunity');
  assert.equal(pluralize(2, 'opportunity', 'opportunities'), '2 opportunities');
});

test('verb agreement follows the count', () => {
  assert.equal(verbFor(1), 'is');
  assert.equal(verbFor(2), 'are');
  assert.equal(pastVerbFor(1), 'was');
  assert.equal(pastVerbFor(0), 'were');
});
