import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';
import {
  buildAdvisorDigest,
  buildAudience,
  classifyIntent,
  generateOutreach,
  householdTokens,
  modeledBenefit,
  answerQuestion,
  resolveHousehold,
  resolveProduct,
  retrieveEvidence,
  scanHouseholdMentions,
  summarizeSpend,
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

// --- household resolution (tolerant of free-text model output) ---------------

test('resolveHousehold maps ids, family names, and contacts to a household', () => {
  const households = provider.getHouseholds();
  assert.equal(resolveHousehold(households, 'hh_nakamura')?.id, 'hh_nakamura');
  assert.equal(resolveHousehold(households, 'Nakamura')?.id, 'hh_nakamura');
  assert.equal(resolveHousehold(households, 'Nakamura Household')?.id, 'hh_nakamura');
  assert.equal(resolveHousehold(households, 'Kenji Nakamura')?.id, 'hh_nakamura');
  // Nonsense / empty -> null so the caller can ask.
  assert.equal(resolveHousehold(households, 'nobody'), null);
  assert.equal(resolveHousehold(households, ''), null);
  assert.equal(resolveHousehold(households, null), null);
});

test('scanHouseholdMentions finds households by surname in free text', () => {
  const households = provider.getHouseholds();
  assert.deepEqual(scanHouseholdMentions('Draft for Okafor', households), ['hh_okafor']);
  assert.deepEqual(scanHouseholdMentions('what about the Nakamura household?', households), [
    'hh_nakamura',
  ]);
  // "the top 3" names nobody -> empty, so the caller falls back to slot memory.
  assert.deepEqual(scanHouseholdMentions('draft outreach for the top 3', households), []);
  assert.deepEqual(scanHouseholdMentions('', households), []);
});

// --- grounded free-form Q&A ---------------------------------------------------

test('summarizeSpend ranks Okafor spend with Travel & Exploration on top', () => {
  const spend = summarizeSpend(provider.getTransactions('hh_okafor'));
  assert.equal(spend.top_pillars[0].name, 'Travel & Exploration');
  assert.ok(spend.top_pillars[0].observed_usd > 0);
  assert.ok(spend.top_merchants.length > 0);
  // Payroll is a credit and must be excluded from spend.
  assert.ok(!spend.top_merchants.some((m) => /payroll/i.test(m.name)));
});

test('answerQuestion returns model text, and empty string when the model is down', async () => {
  const okGw = {
    async chatCompletion() {
      return {
        response: {
          ok: true,
          async json() {
            return { choices: [{ message: { content: 'Okafor skews toward travel spend.' } }] };
          },
        },
      };
    },
  };
  const ans = await answerQuestion({ gateway: okGw, question: 'what does okafor spend on', context: {} });
  assert.match(ans.text, /travel/i);

  const downGw = { async chatCompletion() { return { response: { ok: false, async json() { return {}; } } }; } };
  const none = await answerQuestion({ gateway: downGw, question: 'x', context: {} });
  assert.equal(none.text, '');
});

// --- outreach drafting (grounded; deterministic fallback on model failure) ---

test('generateOutreach returns a grounded fallback draft when the model is unavailable', async () => {
  const audience = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'high-yield-savings' });
  const gw = { async chatCompletion() { return { response: { ok: false, async json() { return {}; } } }; } };
  const { drafts } = await generateOutreach({
    gateway: gw,
    product: audience.product,
    candidates: audience.candidates,
  });
  assert.ok(drafts.length >= 1 && drafts.length <= 3);
  for (const d of drafts) {
    assert.ok(d.text.length > 0);
    assert.ok(d.household_name.length > 0);
    // Fallback must not fabricate a precise dollar figure.
    assert.doesNotMatch(d.text, /\$\d/);
  }
});

test('generateOutreach parses model JSON drafts and keeps only known households', async () => {
  const audience = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'high-yield-savings' });
  const top = audience.candidates[0];
  const gw = {
    async chatCompletion() {
      return {
        response: {
          ok: true,
          async json() {
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      drafts: [
                        { household_id: top.household_id, text: 'Hi there, quick idea to review together.' },
                        { household_id: 'hh_not_in_audience', text: 'should be dropped' },
                      ],
                    }),
                  },
                },
              ],
            };
          },
        },
      };
    },
  };
  const { drafts } = await generateOutreach({ gateway: gw, product: audience.product, candidates: audience.candidates });
  assert.equal(drafts.length, 1);
  assert.equal(drafts[0].household_id, top.household_id);
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
