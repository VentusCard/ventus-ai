import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';
import {
  buildAdvisorDigest,
  buildAudience,
  classifyIntent,
  householdTokens,
  modeledBenefit,
  resolveProduct,
  retrieveEvidence,
} from './tasks.mjs';

const provider = createFixturePortfolioProvider();

// --- deterministic audience build --------------------------------------------

test('travel-card audience: qualifies the traveler, suppresses the overdraft household', () => {
  const res = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'travel-card' });
  assert.equal(res.considered, 4);
  assert.deepEqual(
    res.candidates.map((c) => c.household_id),
    ['hh_okafor']
  );
  assert.equal(res.candidates[0].fit_score, 2);
  assert.ok(res.candidates[0].modeled_annual_benefit_usd > 0);
  // Alvarez has an nsf_overdraft_cluster risk flag -> hard suppressed.
  const supp = res.suppressed.find((s) => s.household_id === 'hh_alvarez');
  assert.ok(supp);
  assert.equal(supp.reason, 'nsf_overdraft_cluster');
});

test('high-yield-savings audience ranks by fit then modeled benefit', () => {
  const res = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'high-yield-savings' });
  // Bianchi matches idle_cash + Recurring savings transfers (fit 2) -> ranks first.
  assert.equal(res.candidates[0].household_id, 'hh_bianchi');
  assert.equal(res.candidates[0].fit_score, 2);
  // Alvarez is suppressed by the low_liquidity_buffer gate.
  const supp = res.suppressed.find((s) => s.household_id === 'hh_alvarez');
  assert.ok(supp);
  assert.equal(supp.reason, 'low_liquidity_buffer');
  // Every candidate carries a positive modeled benefit with an assumption.
  for (const c of res.candidates) {
    assert.ok(c.modeled_annual_benefit_usd > 0);
    assert.ok(c.benefit_assumption.length > 0);
  }
});

test('student-loan-refi models interest savings from the rate delta', () => {
  const res = buildAudience({ provider, advisorId: 'adv_reyes', productId: 'student-loan-refi' });
  const delgado = res.candidates.find((c) => c.household_id === 'hh_delgado');
  assert.ok(delgado);
  // 68,000 * (8.9 - 6.5)/100 = 1632
  assert.equal(delgado.modeled_annual_benefit_usd, 1632);
});

test('buildAudience throws on unknown product/advisor', () => {
  assert.throws(() => buildAudience({ provider, advisorId: 'adv_okoro', productId: 'nope' }));
  assert.throws(() => buildAudience({ provider, advisorId: 'nobody', productId: 'travel-card' }));
});

// --- product resolution (tolerant of free-text model output) -----------------

test('resolveProduct maps free-text model mentions to catalog ids', () => {
  const catalog = provider.getCatalog();
  // Exact id (model already returned the id).
  assert.equal(resolveProduct(catalog, 'travel-card')?.id, 'travel-card');
  // Hyphen-normalized: "travel card" -> "travel-card" (the real smoke-test miss).
  assert.equal(resolveProduct(catalog, 'travel card')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'TRAVEL CARD')?.id, 'travel-card');
  // Display name.
  assert.equal(resolveProduct(catalog, 'Travel Rewards Card')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'High Yield Savings')?.id, 'high-yield-savings');
  // Nonsense / empty -> null so the caller can clarify.
  assert.equal(resolveProduct(catalog, 'nope'), null);
  assert.equal(resolveProduct(catalog, ''), null);
  assert.equal(resolveProduct(catalog, null), null);
});

test('buildAudience accepts a free-text product mention', () => {
  const byName = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'travel card' });
  const byId = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'travel-card' });
  assert.equal(byName.product.id, 'travel-card');
  assert.deepEqual(
    byName.candidates.map((c) => c.household_id),
    byId.candidates.map((c) => c.household_id)
  );
});

test('householdTokens derives financial tokens', () => {
  const tokens = householdTokens(provider.getSignals('hh_okafor'));
  assert.ok(tokens.has('idle_cash'));
  assert.ok(tokens.has('Travel-heavy spend'));
});

test('modeledBenefit HYSA uses idle cash and APY delta', () => {
  const b = modeledBenefit({
    product: { id: 'high-yield-savings', category: 'Deposits' },
    household: provider.getHousehold('hh_okafor'),
    signals: provider.getSignals('hh_okafor'),
    provider,
  });
  // 40,000 * (0.0425 - 0.005) = 1500
  assert.equal(Math.round(b.usd), 1500);
});

// --- advisor digest ----------------------------------------------------------

test('buildAdvisorDigest keeps one best opportunity per household, ranked by benefit', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: 'adv_okoro' });
  assert.ok(digest.items.length >= 1);
  // One item per household at most.
  const ids = digest.items.map((i) => i.household_id);
  assert.equal(new Set(ids).size, ids.length);
  // Ranked by modeled benefit descending.
  for (let i = 1; i < digest.items.length; i++) {
    assert.ok(
      digest.items[i - 1].modeled_annual_benefit_usd >= digest.items[i].modeled_annual_benefit_usd
    );
  }
  // Alvarez (all-suppressed profile) should not surface a card/HYSA opportunity
  // that was gated; if present it must come from a non-suppressing product.
  const alvarez = digest.items.find((i) => i.household_id === 'hh_alvarez');
  if (alvarez) {
    assert.notEqual(alvarez.product.id, 'travel-card');
    assert.notEqual(alvarez.product.id, 'high-yield-savings');
  }
});

// --- evidence ----------------------------------------------------------------

test('retrieveEvidence returns bullets for a known household and flags unknowns', () => {
  const ev = retrieveEvidence({ provider, householdId: 'hh_bianchi' });
  assert.equal(ev.found, true);
  assert.ok(ev.bullets.some((b) => /new_child_expected/.test(b)));

  const miss = retrieveEvidence({ provider, householdId: 'hh_nope' });
  assert.equal(miss.found, false);
  assert.equal(miss.bullets.length, 0);
});

// --- intent classification (model-backed, mocked) ----------------------------

function mockGateway(toolArgs, { ok = true } = {}) {
  return {
    async chatCompletion() {
      return {
        response: {
          ok,
          async json() {
            return {
              choices: [
                { message: { tool_calls: [{ function: { arguments: JSON.stringify(toolArgs) } }] } },
              ],
            };
          },
        },
      };
    },
  };
}

test('classifyIntent parses a tool call', async () => {
  const gw = mockGateway({ task_type: 'audience_build', product_id: 'travel-card', confidence: 0.9 });
  const intent = await classifyIntent(gw, { subject: 'who to pitch', body: 'travel card please' });
  assert.equal(intent.task_type, 'audience_build');
  assert.equal(intent.product_id, 'travel-card');
});

test('classifyIntent falls back to "other" when the model errors', async () => {
  const gw = mockGateway({}, { ok: false });
  const intent = await classifyIntent(gw, { subject: '', body: '' });
  assert.equal(intent.task_type, 'other');
  assert.ok(intent.confidence <= 0.4);
});
