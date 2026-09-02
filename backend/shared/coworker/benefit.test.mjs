import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NON_CONSUMPTION_SUBCATEGORIES,
  benefitFor,
  benefitRank,
  computeCardBenefit,
  currentCardEarn,
  estimateBenefit,
  headlineBenefit,
  spendProfile,
} from './benefit.mjs';

// A deliberately tiny catalog so every figure below can be checked by hand.
// Testing against the demo fixtures would only prove the code agrees with
// itself; these numbers are small enough to verify with arithmetic.
const CATALOG = {
  spend_categories: {
    travel: ['Flights'],
    dining: ['Dining Out'],
    grocery: ['Grocery'],
    card_ineligible: { subcategories: ['Transfers', 'Loan Payments'] },
  },
  incumbents: {
    'flat-cashback-card': {
      name: 'Flat Cashback Card',
      annual_fee_usd: 0,
      earn: [{ label: 'All purchases', rate_pct: 1.5, categories: ['*'] }],
    },
  },
};

const CARD = {
  id: 'travel-card',
  name: 'Travel Cash Rewards Card',
  terms: {
    kind: 'card_cash_back',
    annual_fee_usd: 95,
    base_rate_pct: 2,
    earn: [
      { label: 'Travel', rate_pct: 4, categories: ['travel'], cap_group: 'bonus' },
      { label: 'Dining', rate_pct: 4, categories: ['dining'], cap_group: 'bonus' },
    ],
    caps: [
      {
        group: 'bonus',
        spend_usd_per_period: 3000,
        period: 'calendar_quarter',
        label: 'combined travel and dining, per quarter',
      },
    ],
  },
};

const withCard = { relationship: { products_held: ['everyday-checking', 'flat-cashback-card'] } };
const noCardWithUs = { relationship: { products_held: ['everyday-checking'] } };

function debit(date, subcategory, amount) {
  return { date, subcategory, amount, direction: 'debit' };
}

// --- spend classification ----------------------------------------------------

test('card-ineligible debits are excluded from the spend base entirely', () => {
  const profile = spendProfile(
    [
      debit('2026-01-10', 'Flights', 1000),
      debit('2026-01-11', 'Transfers', 50000),
      debit('2026-01-12', 'Loan Payments', 20000),
    ],
    CATALOG.spend_categories
  );
  // $70k of money movement must not become $70k of "card spend", which would
  // inflate the benefit far past anything the household could actually earn.
  assert.equal(profile.cardEligibleTotal, 1000);
  assert.equal(profile.ineligibleTotal, 70000);
});

test('credits and non-positive amounts never earn rewards', () => {
  const profile = spendProfile(
    [
      { date: '2026-01-10', subcategory: 'Flights', amount: 5000, direction: 'credit' },
      debit('2026-01-11', 'Flights', 0),
      debit('2026-01-12', 'Flights', 800),
    ],
    CATALOG.spend_categories
  );
  assert.equal(profile.cardEligibleTotal, 800);
});

test('spend is tracked per calendar quarter, not just as an annual total', () => {
  const profile = spendProfile(
    [debit('2026-02-01', 'Flights', 1000), debit('2026-05-01', 'Flights', 400)],
    CATALOG.spend_categories
  );
  assert.equal(profile.byCategory.travel.total, 1400);
  assert.deepEqual(profile.byCategory.travel.byQuarter, { '2026-Q1': 1000, '2026-Q2': 400 });
});

test('an unmapped subcategory still counts as card spend at the base rate', () => {
  const profile = spendProfile([debit('2026-01-10', 'Hardware Store', 600)], CATALOG.spend_categories);
  assert.equal(profile.cardEligibleTotal, 600);
  assert.equal(profile.byCategory.other.total, 600);
});

// --- computed card benefit ---------------------------------------------------

test('net benefit is gross less current earn less the annual fee', () => {
  const transactions = [
    debit('2026-01-10', 'Flights', 1000),
    debit('2026-01-11', 'Dining Out', 500),
    debit('2026-01-12', 'Grocery', 1000),
    debit('2026-01-13', 'Transfers', 5000),
  ];
  const b = computeCardBenefit({ product: CARD, household: withCard, transactions, catalog: CATALOG });

  // $1,500 bonus spend at 4% = $60; $1,000 other at 2% = $20; gross $80.
  assert.equal(b.gross_usd, 80);
  // $2,500 eligible spend at the incumbent's 1.5% = $37.50.
  assert.equal(b.current_usd, 37.5);
  assert.equal(b.net_usd, 80 - 37.5 - 95);
  assert.equal(b.baseline, 'known');
  assert.equal(b.cap_binding, false);
});

test('a fee-bearing card on thin spend produces a negative net rather than a flattering one', () => {
  const b = computeCardBenefit({
    product: CARD,
    household: withCard,
    transactions: [debit('2026-01-10', 'Flights', 400)],
    catalog: CATALOG,
  });
  // 400*4% = 16 gross, less 400*1.5% = 6 current, less the $95 fee.
  assert.equal(b.net_usd, -85);
  assert.ok(b.net_usd < 0, 'the fee has to be able to sink the number');
});

test('the quarterly cap is applied per quarter, so timing changes the answer', () => {
  const spread = computeCardBenefit({
    product: CARD,
    household: withCard,
    transactions: [debit('2026-02-01', 'Flights', 3000), debit('2026-05-01', 'Flights', 3000)],
    catalog: CATALOG,
  });
  const bunched = computeCardBenefit({
    product: CARD,
    household: withCard,
    transactions: [debit('2026-02-01', 'Flights', 3000), debit('2026-02-02', 'Flights', 3000)],
    catalog: CATALOG,
  });

  // Same $6,000 of travel. Spread across two quarters it all fits under the
  // $3,000 quarterly cap: $6,000 * 4% = $240.
  assert.equal(spread.gross_usd, 240);
  assert.equal(spread.cap_binding, false);

  // Bunched into one quarter, half of it falls to the base rate:
  // $3,000 * 4% + $3,000 * 2% = $180. Annualizing would have missed this.
  assert.equal(bunched.gross_usd, 180);
  assert.equal(bunched.cap_binding, true);
  assert.ok(bunched.gross_usd < spread.gross_usd);
});

test('travel and dining compete for one shared quarterly allowance', () => {
  const b = computeCardBenefit({
    product: CARD,
    household: withCard,
    transactions: [debit('2026-01-10', 'Flights', 2000), debit('2026-01-11', 'Dining Out', 2000)],
    catalog: CATALOG,
  });
  // The cap is combined, so of $4,000 only $3,000 earns 4% and $1,000 drops to
  // 2%: $120 + $20 = $140. Treating each category as having its own $3,000 cap
  // would have paid $160.
  assert.equal(b.gross_usd, 140);
  assert.equal(b.cap_binding, true);
});

test('the basis explains the cap when the cap is what cost them money', () => {
  const b = computeCardBenefit({
    product: CARD,
    household: withCard,
    transactions: [debit('2026-02-01', 'Flights', 9000)],
    catalog: CATALOG,
  });
  assert.match(b.basis, /quarterly bonus cap/);
  assert.match(b.basis, /base rate/);
});

test('every dollar of card spend is accounted for in exactly one earn line', () => {
  const transactions = [
    debit('2026-01-10', 'Flights', 1200),
    debit('2026-01-11', 'Dining Out', 800),
    debit('2026-01-12', 'Grocery', 1500),
    debit('2026-01-13', 'Hardware Store', 300),
    debit('2026-01-14', 'Transfers', 9000),
  ];
  const b = computeCardBenefit({ product: CARD, household: withCard, transactions, catalog: CATALOG });
  const lineTotal = b.lines.reduce((sum, l) => sum + l.spend_usd, 0);
  assert.equal(lineTotal, b.card_eligible_spend_usd);
  assert.equal(lineTotal, 3800);
  const earnTotal = b.lines.reduce((sum, l) => sum + l.earned_usd, 0);
  assert.equal(Math.round(earnTotal * 100) / 100, b.gross_usd);
});

// --- the unknown baseline ----------------------------------------------------

test('a household whose card we cannot see gets no net figure at all', () => {
  const transactions = [debit('2026-01-10', 'Flights', 2000), debit('2026-01-11', 'Grocery', 3000)];
  const b = computeCardBenefit({
    product: CARD,
    household: noCardWithUs,
    transactions,
    catalog: CATALOG,
  });

  assert.equal(b.baseline, 'unknown');
  assert.equal(b.net_usd, null, 'a net we cannot support must be absent, not zero');
  assert.equal(b.current_usd, null);
  // $2,000 travel at 4% + $3,000 other at 2% = $140.
  assert.equal(b.gross_usd, 140);
  assert.match(b.basis, /We do not hold their day-to-day card/);
  assert.match(b.basis, /cannot state a net gain/);
  assert.match(b.basis, /\$140 gross cash back/);
});

test('an unknown baseline is never silently treated as zero earn', () => {
  const transactions = [debit('2026-01-10', 'Flights', 2000)];
  const unknown = currentCardEarn({
    household: noCardWithUs,
    incumbents: CATALOG.incumbents,
    profile: spendProfile(transactions, CATALOG.spend_categories),
  });
  assert.equal(unknown.known, false);
  assert.equal(unknown.earn_usd, undefined);
  assert.match(unknown.reason, /cannot see what they earn/);
});

test('the incumbent baseline is measured over the same spend base as the gross', () => {
  const transactions = [debit('2026-01-10', 'Flights', 1000), debit('2026-01-11', 'Transfers', 40000)];
  const current = currentCardEarn({
    household: withCard,
    incumbents: CATALOG.incumbents,
    profile: spendProfile(transactions, CATALOG.spend_categories),
  });
  // The $40k transfer earns nothing on either card, so it cannot appear on the
  // baseline side either. $1,000 * 1.5% = $15.
  assert.equal(current.earn_usd, 15);
  assert.equal(current.name, 'Flat Cashback Card');
});

// --- estimated benefit -------------------------------------------------------

test('a deposit estimate is the rate delta on the idle balance', () => {
  const b = estimateBenefit({
    product: { terms: { kind: 'deposit_apy', apy_pct: 4.25, baseline_apy_pct: 0.5 } },
    signals: { financial: { idle_cash_usd: 40000 } },
  });
  assert.equal(b.mode, 'estimated');
  assert.equal(b.usd, 1500); // 40000 * 3.75%
  assert.match(b.assumption, /moves across and stays put for a year/);
});

test('advice is never given an annual dollar figure', () => {
  const b = estimateBenefit({
    product: { terms: { kind: 'advisory_fee', advisory_fee_pct: 0.85 } },
    signals: { financial: { idle_cash_usd: 240000 } },
  });
  assert.equal(b.usd, 0);
  assert.match(b.outcome, /\$240,000 sitting in cash/);
  assert.match(b.assumption, /would require assuming a return/);
  assert.equal(headlineBenefit(b).qualifier, 'outcome');
});

test('a refinance estimate is the first-year interest difference', () => {
  const b = estimateBenefit({
    product: { terms: { kind: 'loan_refinance', target_rate_pct: 4.9 } },
    signals: { financial: { student_loan_balance_usd: 48000, student_loan_rate_pct: 6.8 } },
  });
  assert.equal(b.usd, 912); // 48000 * 1.9%
  assert.match(b.assumption, /depends on their credit profile/);
});

test('a refinance that would not help says so instead of returning a number', () => {
  const b = estimateBenefit({
    product: { terms: { kind: 'loan_refinance', target_rate_pct: 4.9 } },
    signals: { financial: { student_loan_balance_usd: 48000, student_loan_rate_pct: 4.1 } },
  });
  assert.equal(b.usd, 0);
  assert.match(b.assumption, /No interest saving/);
});

test('fee avoidance is only claimed where fees were actually charged', () => {
  const terms = { kind: 'fee_avoidance', avoided_fee_usd: 35 };
  const charged = estimateBenefit({
    product: { terms },
    signals: { risk: [{ type: 'nsf_overdraft_cluster' }] },
  });
  assert.equal(charged.usd, 105);

  const clean = estimateBenefit({ product: { terms }, signals: { risk: [] } });
  assert.equal(clean.usd, 0);
  assert.match(clean.assumption, /No overdraft charges on file/);
});

test('a product with no benefit model degrades to an honest phrase', () => {
  const b = estimateBenefit({ product: { terms: { kind: 'protection' } }, signals: {} });
  assert.equal(b.usd, 0);
  assert.match(b.outcome, /Planning and protection/);
  assert.match(b.assumption, /rather than a dollar figure/);
});

test('every estimate carries the assumption it rests on', () => {
  const kinds = [
    { kind: 'deposit_apy', apy_pct: 4, baseline_apy_pct: 0.5 },
    { kind: 'advisory_fee', advisory_fee_pct: 0.85 },
    { kind: 'loan_refinance', target_rate_pct: 4.9 },
    { kind: 'fee_avoidance', avoided_fee_usd: 35 },
    { kind: 'something_new' },
  ];
  for (const terms of kinds) {
    const b = estimateBenefit({ product: { terms }, signals: { financial: { idle_cash_usd: 1000 } } });
    assert.ok(b.assumption?.length > 20, `${terms.kind} must state its assumption`);
  }
});

// --- presentation contract ---------------------------------------------------

test('benefitFor routes cards to arithmetic and everything else to an estimate', () => {
  const card = benefitFor({
    product: CARD,
    household: withCard,
    transactions: [debit('2026-01-10', 'Flights', 1000)],
    catalog: CATALOG,
    signals: {},
  });
  assert.equal(card.mode, 'computed');

  const deposit = benefitFor({
    product: { id: 'hysa', terms: { kind: 'deposit_apy', apy_pct: 4, baseline_apy_pct: 0.5 } },
    household: withCard,
    transactions: [],
    catalog: CATALOG,
    signals: { financial: { idle_cash_usd: 10000 } },
  });
  assert.equal(deposit.mode, 'estimated');
});

test('a computed figure is a point number and an estimate is a range', () => {
  const computed = headlineBenefit({ mode: 'computed', baseline: 'known', net_usd: 506 });
  assert.deepEqual(computed, { usd: 506, precision: 'point', qualifier: 'net' });

  const gross = headlineBenefit({ mode: 'computed', baseline: 'unknown', gross_usd: 1871 });
  assert.deepEqual(gross, { usd: 1871, precision: 'point', qualifier: 'gross' });

  const estimate = headlineBenefit({ mode: 'estimated', usd: 1500 });
  assert.deepEqual(estimate, { usd: 1500, precision: 'range', qualifier: 'estimate' });

  assert.equal(headlineBenefit(null), null);
  assert.equal(headlineBenefit({ mode: 'estimated', usd: 0 }), null);
});

test('defensible figures outrank large ones', () => {
  // This ordering is what stops a $20,000 number resting on an assumed return
  // from outranking a $506 number computed from the household's own ledger.
  assert.ok(benefitRank('net') < benefitRank('gross'));
  assert.ok(benefitRank('gross') < benefitRank('estimate'));
  assert.ok(benefitRank('estimate') < benefitRank('outcome'));
  assert.ok(benefitRank('anything_unknown') > benefitRank('outcome'));
});

test('consumption and card-eligibility are separate questions', () => {
  // Rent is real consumption an advisor cares about even though no card earns
  // on it, so it belongs in the spend summary but not in the earn base.
  assert.ok(!NON_CONSUMPTION_SUBCATEGORIES.includes('Rent & Mortgage'));
  assert.ok(CATALOG.spend_categories.card_ineligible.subcategories.includes('Transfers'));
  assert.ok(NON_CONSUMPTION_SUBCATEGORIES.includes('Transfers'));
});
