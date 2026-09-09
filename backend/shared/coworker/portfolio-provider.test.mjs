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

test('every household has transactions and a signals record', () => {
  for (const hh of provider.getHouseholds()) {
    const txns = provider.getTransactions(hh.id);
    assert.ok(txns.length > 0, `${hh.id} has transactions`);
    for (const t of txns) {
      assert.ok(t.transaction_id && t.date && t.pillar, `${hh.id} txn well-formed`);
      assert.ok(['debit', 'credit'].includes(t.direction), `${hh.id} txn has direction`);
    }
    const sig = provider.getSignals(hh.id);
    assert.ok(sig && typeof sig.financial === 'object', `${hh.id} has financial posture`);
    assert.ok(Array.isArray(sig.life_events), `${hh.id} life_events is an array`);
  }
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
