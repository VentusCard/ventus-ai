import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';

const provider = createFixturePortfolioProvider();

test('institution and advisors load', () => {
  const inst = provider.getInstitution();
  assert.ok(inst.id && inst.name && inst.domain, 'institution has id/name/domain');
  const advisors = provider.getAdvisors();
  assert.ok(advisors.length >= 2, 'at least two advisors');
  for (const advisor of advisors) {
    // Most advisors are on the institution domain, but the allowlist may also
    // carry explicit external demo/test addresses (e.g. @ventuscard.com), so we
    // just require a well-formed address here.
    assert.match(advisor.email, /^[^@\s]+@[^@\s]+\.[^@\s]+$/, `${advisor.id} has a valid email`);
    assert.deepEqual(provider.getAdvisor(advisor.id), advisor, 'getAdvisor round-trips');
  }
});

test('every advisor household_id resolves; getHouseholds returns the advisor-owned subset', () => {
  const advisorIds = new Set(provider.getAdvisors().map((a) => a.id));
  for (const advisor of provider.getAdvisors()) {
    for (const hhId of advisor.household_ids) {
      const hh = provider.getHousehold(hhId);
      assert.ok(hh, `${hhId} exists`);
      // Ownership integrity: every household in a book is owned by a real advisor.
      // A coverage/test advisor may carry households owned by another advisor, so we
      // assert the owner is *some* known advisor rather than this one specifically.
      assert.ok(advisorIds.has(hh.advisor_id), `${hhId} owner ${hh.advisor_id} is a known advisor`);
    }
    // getHouseholds({advisorId}) is scoped to households this advisor OWNS, which is
    // exactly the owned subset of its book.
    const ownedInBook = advisor.household_ids
      .map((id) => provider.getHousehold(id))
      .filter((hh) => hh.advisor_id === advisor.id);
    const scoped = provider.getHouseholds({ advisorId: advisor.id });
    assert.equal(scoped.length, ownedInBook.length, 'scoped households = owned subset of the book');
  }
});

test('every household has a signals record, and any transactions it has are well-formed', () => {
  // Transactions are not required of every household. Only the card prices
  // from a ledger; every other product prices from signals, and the v3
  // households were added to give those products someone to lead with. A
  // household without transactions screens as no-signal for the card, which is
  // the honest answer rather than a gap.
  for (const hh of provider.getHouseholds()) {
    for (const t of provider.getTransactions(hh.id)) {
      assert.ok(t.transaction_id && t.date && t.pillar, `${hh.id} txn well-formed`);
      assert.ok(['debit', 'credit'].includes(t.direction), `${hh.id} txn has direction`);
    }
    const sig = provider.getSignals(hh.id);
    assert.ok(sig && typeof sig.financial === 'object', `${hh.id} has financial posture`);
    assert.ok(Array.isArray(sig.life_events), `${hh.id} life_events is an array`);
  }
});

test('the households that price from a ledger still have one', () => {
  // The guarantee the previous test was really protecting: a computed,
  // defensible card figure needs transactions behind it, and losing those
  // silently would downgrade the showpiece to an estimate.
  const withLedger = provider
    .getHouseholds()
    .filter((hh) => provider.getTransactions(hh.id).length > 0);
  assert.ok(withLedger.length >= 12, 'the original book still carries its ledgers');
});

test('unknown ids return null / empty without throwing', () => {
  assert.equal(provider.getHousehold('nope'), null);
  assert.equal(provider.getAdvisor('nope'), null);
  assert.deepEqual(provider.getTransactions('nope'), []);
  assert.deepEqual(provider.getHouseholds({ advisorId: 'nope' }), []);
});

test('catalog is non-empty and every product is well-formed', () => {
  const catalog = provider.getCatalog();
  assert.ok(catalog.length >= 10, 'catalog has products');
  const ids = new Set();
  for (const p of catalog) {
    assert.ok(p.id && p.name && p.category, `${p.id} has id/name/category`);
    assert.ok(!ids.has(p.id), `${p.id} is unique`);
    ids.add(p.id);
    assert.ok(Array.isArray(p.target_signals), `${p.id} target_signals is an array`);
    assert.ok(Array.isArray(p.disqualifiers), `${p.id} disqualifiers is an array`);
  }
});

test('the catalog carries the full bank product set with the rules every product shares', () => {
  const catalog = provider.getCatalog();
  assert.equal(catalog.length, 55, 'all fifty-five bank products are present');

  const universal = [
    'aml_review', 'fraud_watch', 'prior_chargeoff', 'already_holds_product', 'marketing_opt_out',
    'bankruptcy_active', 'hardship_program', 'financial_vulnerability', 'open_complaint',
    'outreach_fatigue', 'estate_settlement',
  ];
  const priced = new Set(['card_cash_back', 'deposit_apy', 'advisory_fee', 'loan_refinance', 'fee_avoidance']);
  for (const p of catalog) {
    for (const block of universal) {
      assert.ok(p.disqualifiers.includes(block), `${p.id} carries the universal block ${block}`);
    }
    assert.ok(p.target_signals.length > 0, `${p.id} has at least one target`);
    assert.ok(p.plain_benefit && !/\d/.test(p.plain_benefit), `${p.id} plain_benefit has no figures`);
    assert.ok(p.terms?.kind, `${p.id} has a terms kind`);
    if (!priced.has(p.terms.kind)) {
      assert.ok(p.terms.outcome && p.terms.outcome_basis, `${p.id} unpriced terms state an outcome and its basis`);
    }
  }

  // The refinance kinds name the balance they price, so an auto refinance
  // cannot silently compute off a student loan.
  const autoRefi = catalog.find((p) => p.id === 'auto-refinance');
  assert.equal(autoRefi.terms.balance_field, 'auto_loan_balance_usd');
  assert.equal(autoRefi.terms.rate_field, 'auto_loan_rate_pct');
});

test('data can be injected without touching disk', () => {
  const injected = createFixturePortfolioProvider({
    data: {
      households: {
        institution: { id: 'i', name: 'n', domain: 'd' },
        advisors: [{ id: 'a1', email: 'x@d', household_ids: ['h1'] }],
        households: [{ id: 'h1', advisor_id: 'a1' }],
      },
      transactions: { transactions: { h1: [{ transaction_id: 't1', date: '2026-01-01', pillar: 'X', direction: 'debit' }] } },
      signals: { signals: { h1: { life_events: [], behavioral: [], risk: [], financial: {} } } },
      catalog: { products: [] },
    },
  });
  assert.equal(injected.getHousehold('h1').advisor_id, 'a1');
  assert.equal(injected.getTransactions('h1').length, 1);
  assert.equal(injected.getCatalog().length, 0);
});
