import assert from 'node:assert/strict';
import test from 'node:test';
import { createFixturePortfolioProvider } from './portfolio-provider.mjs';
import {
  annualBenefit,
  buildAdvisorDigest,
  buildAudience,
  classifyIntent,
  digestSubject,
  generateOutreach,
  householdTokens,
  answerQuestion,
  leadSignal,
  outreachSubject,
  resolveHousehold,
  resolveProduct,
  retrieveEvidence,
  scanHouseholdMentions,
  summarizeSpend,
  validateClientDraft,
} from './tasks.mjs';
import { findBannedVocabulary, findSnakeCase } from './labels.mjs';
import { benefitRank } from './benefit.mjs';
import { buildHouseholdContext } from './context.mjs';
import { renderDigestTable } from './render.mjs';
import { createCoworkerStore, createInMemoryBackend } from './store.mjs';

const provider = createFixturePortfolioProvider();

// The demo advisor's book is the whole 12-household portfolio; adv_okoro holds
// the original four, which several assertions below deliberately pin.
const DEMO_ADVISOR = 'adv_zoheb';

/**
 * Size of an advisor's book, read rather than written down.
 *
 * These assertions are about the screen reconciling every household it was
 * given, which is true at any book size. Pinning the literal count made a
 * fixture expansion look like six logic regressions.
 */
function bookSize(advisorId) {
  return provider.getAdvisors().find((a) => a.id === advisorId).household_ids.length;
}

// --- deterministic audience build --------------------------------------------

test('travel-card audience fits the traveler and excludes the overdraft household', () => {
  const res = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'travel-card' });
  assert.equal(res.considered, bookSize('adv_okoro'), 'the whole book is reconciled');
  assert.deepEqual(
    res.candidates.map((c) => c.household_id),
    ['hh_okafor']
  );
  assert.equal(res.candidates[0].fit_score, 2);
  assert.ok(res.candidates[0].annual_benefit_usd > 0);
  // Alvarez carries an overdraft flag, which the institution treats as a hard
  // exclusion for this product.
  const held = res.excluded.find((s) => s.household_id === 'hh_alvarez');
  assert.ok(held);
  assert.equal(held.reason, 'nsf_overdraft_cluster');
  assert.equal(held.reason_label, 'recent overdraft activity');
});

test('a single-product screen returns a real audience across the demo book', () => {
  const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  // A screen that returns one household reads as a lookup, not a screen. The
  // demo book is sized so the demonstrated product returns a genuine list.
  assert.ok(
    res.candidates.length >= 6,
    `expected at least 6 fits, got ${res.candidates.length}`
  );
  assert.ok(res.excluded.length >= 1);
  assert.ok(res.no_signal.length >= 1);
});

test('every household in the book is accounted for in exactly one bucket', () => {
  const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const { considered, fits, excluded, no_signal: noSignal } = res.reconciliation;
  assert.equal(fits + excluded + noSignal, considered);
  assert.equal(fits, res.candidates.length);

  const seen = [
    ...res.candidates.map((c) => c.household_id),
    ...res.excluded.map((c) => c.household_id),
    ...res.no_signal.map((c) => c.household_id),
  ];
  assert.equal(new Set(seen).size, considered, 'no household may appear in two buckets');
});

test('high-yield-savings audience ranks by fit then benefit', () => {
  const res = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'high-yield-savings' });
  // The ordering is the claim, not which household happens to hold the top
  // slot: fit first, and among equal fit the larger benefit. Pinning an id
  // meant that adding a household with more idle cash read as a regression.
  assert.ok(res.candidates.length > 1, 'more than one household to rank');
  for (let i = 1; i < res.candidates.length; i++) {
    const [prev, cur] = [res.candidates[i - 1], res.candidates[i]];
    assert.ok(
      prev.fit_score > cur.fit_score ||
        (prev.fit_score === cur.fit_score && prev.annual_benefit_usd >= cur.annual_benefit_usd),
      `${prev.household_id} should outrank ${cur.household_id}`
    );
  }
  assert.equal(
    res.candidates[0].fit_score,
    Math.max(...res.candidates.map((c) => c.fit_score)),
    'the best-fitting household leads'
  );
  const held = res.excluded.find((s) => s.household_id === 'hh_alvarez');
  assert.ok(held);
  assert.equal(held.reason, 'low_liquidity_buffer');
  for (const c of res.candidates) {
    assert.ok(c.annual_benefit_usd > 0);
    assert.ok(c.benefit_basis.length > 0);
  }
});

test('student-loan-refi estimates interest saving from the rate delta', () => {
  const res = buildAudience({ provider, advisorId: 'adv_reyes', productId: 'student-loan-refi' });
  const delgado = res.candidates.find((c) => c.household_id === 'hh_delgado');
  assert.ok(delgado);
  // 68,000 * (8.9 - 6.5)/100 = 1632
  assert.equal(delgado.annual_benefit_usd, 1632);
  // It rests on the rate they are offered, so it must present as an estimate.
  assert.equal(delgado.benefit_qualifier, 'estimate');
  assert.equal(delgado.benefit_precision, 'range');
});

test('buildAudience throws on unknown product/advisor', () => {
  assert.throws(() => buildAudience({ provider, advisorId: 'adv_okoro', productId: 'nope' }));
  assert.throws(() => buildAudience({ provider, advisorId: 'nobody', productId: 'travel-card' }));
});

// --- benefit provenance ------------------------------------------------------

test('card benefit is computed net of current earn and the annual fee', () => {
  const household = provider.getHousehold('hh_okafor');
  const b = annualBenefit({
    product: provider.getCatalog().find((p) => p.id === 'travel-card'),
    household,
    signals: provider.getSignals('hh_okafor'),
    provider,
  });
  assert.equal(b.mode, 'computed');
  assert.equal(b.baseline, 'known');
  // Okafor holds the flat cashback card, so the baseline is real, not zero.
  assert.ok(b.current_usd > 0);
  assert.equal(b.fee_usd, 95);
  assert.equal(b.net_usd, round2(b.gross_usd - b.current_usd - b.fee_usd));
  assert.match(b.basis, /annual fee/);
});

test('a household whose card we do not hold gets a gross figure, never an invented net', () => {
  const household = provider.getHousehold('hh_lindqvist');
  const b = annualBenefit({
    product: provider.getCatalog().find((p) => p.id === 'travel-card'),
    household,
    signals: provider.getSignals('hh_lindqvist'),
    provider,
  });
  assert.equal(b.baseline, 'unknown');
  assert.equal(b.net_usd, null);
  assert.equal(b.current_usd, null);
  assert.ok(b.gross_usd > 0);
  assert.match(b.basis, /cannot state a net gain/i);
});

test('advice is not dollarized, because that would require assuming a return', () => {
  const b = annualBenefit({
    product: provider.getCatalog().find((p) => p.id === 'managed-portfolio'),
    household: provider.getHousehold('hh_sharma'),
    signals: provider.getSignals('hh_sharma'),
    provider,
  });
  assert.equal(b.mode, 'estimated');
  assert.equal(b.usd, 0);
  assert.match(b.outcome, /\$512,000/);
  assert.match(b.assumption, /assuming a return/i);
});

test('HYSA benefit uses idle cash and the published APY delta', () => {
  const b = annualBenefit({
    product: provider.getCatalog().find((p) => p.id === 'high-yield-savings'),
    household: provider.getHousehold('hh_okafor'),
    signals: provider.getSignals('hh_okafor'),
    provider,
  });
  // 40,000 * (4.25 - 0.5)/100 = 1500
  assert.equal(Math.round(b.usd), 1500);
});

// --- product resolution (tolerant of free-text model output) -----------------

test('resolveProduct maps free-text model mentions to catalog ids', () => {
  const catalog = provider.getCatalog();
  assert.equal(resolveProduct(catalog, 'travel-card')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'travel card')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'TRAVEL CARD')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'Travel Cash Rewards Card')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'High Yield Savings')?.id, 'high-yield-savings');
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
  assert.deepEqual(scanHouseholdMentions('draft outreach for the top 3', households), []);
  assert.deepEqual(scanHouseholdMentions('', households), []);
});

// --- signals and evidence ----------------------------------------------------

test('evidence bullets contain no internal keys', () => {
  const ev = retrieveEvidence({ provider, householdId: 'hh_bianchi' });
  assert.equal(ev.found, true);
  // The life event must read as something that happened, not as a field name.
  assert.ok(ev.bullets.some((b) => /Expecting a child/.test(b)));
  assert.deepEqual(findSnakeCase(ev.bullets.join(' ')), []);

  const miss = retrieveEvidence({ provider, householdId: 'hh_nope' });
  assert.equal(miss.found, false);
  assert.equal(miss.bullets.length, 0);
});

test('an exclusion reason is attributed to the institution, in plain language', () => {
  const ev = retrieveEvidence({ provider, householdId: 'hh_alvarez' });
  const line = ev.bullets.find((b) => /overdraft/i.test(b));
  assert.ok(line);
  assert.match(line, /the institution treats as an exclusion/i);
  assert.doesNotMatch(line, /nsf_overdraft_cluster/);
});

test('leadSignal explains the row it appears on', () => {
  // Whitfield has a retirement life event, but the travel card fits on travel
  // spend. Showing the retirement event next to a card invites the question of
  // what one has to do with the other.
  const lead = leadSignal({
    signals: provider.getSignals('hh_whitfield'),
    matched: ['Travel-heavy spend', 'Pays card in full'],
  });
  assert.equal(lead.label, 'Travel-heavy spend');
});

test('leadSignal prefers a matched life event when there is one', () => {
  const lead = leadSignal({
    signals: provider.getSignals('hh_bianchi'),
    matched: ['new_child_expected'],
  });
  assert.equal(lead.label, 'Expecting a child');
});

test('householdTokens derives financial tokens', () => {
  const tokens = householdTokens(provider.getSignals('hh_okafor'));
  assert.ok(tokens.has('idle_cash'));
  assert.ok(tokens.has('Travel-heavy spend'));
});

test('summarizeSpend ranks Okafor spend with Travel & Exploration on top', () => {
  const spend = summarizeSpend(provider.getTransactions('hh_okafor'));
  assert.equal(spend.top_pillars[0].name, 'Travel & Exploration');
  assert.ok(spend.top_pillars[0].observed_usd > 0);
  assert.ok(spend.top_merchants.length > 0);
  assert.ok(!spend.top_merchants.some((m) => /payroll/i.test(m.name)));
});

// --- advisor digest ----------------------------------------------------------

test('digest keeps one opportunity per household and reconciles the whole book', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  assert.ok(digest.items.length >= 1);
  const ids = digest.items.map((i) => i.household_id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(digest.considered, bookSize(DEMO_ADVISOR));
});

test('the subject counts what needs attention, not the size of the book', () => {
  // A relationship manager carries hundreds of households and knows it. The
  // denominator in the subject only ever told them something they knew, and in
  // a demo book it says the book is small.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  const subject = digestSubject(digest);
  assert.match(subject, new RegExp(`${digest.items.length} households? needs? attention`));
  assert.doesNotMatch(subject, new RegExp(String(bookSize(DEMO_ADVISOR))));
  assert.equal(digestSubject({ items: [] }), 'Your Daily Digest: nothing needs your attention today');
});

test('digest leads with figures that survive being questioned', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  // A computed net beats a larger estimate. Picking purely by size would put a
  // five-figure assumed-return number at the top of the email.
  assert.equal(digest.items[0].benefit_qualifier, 'net');
  assert.equal(digest.items[0].benefit_mode, 'computed');
});

test('no single product may occupy more than half the digest', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });
  const counts = new Map();
  for (const i of digest.items) {
    counts.set(i.product.id, (counts.get(i.product.id) || 0) + 1);
  }
  for (const [productId, count] of counts) {
    assert.ok(
      count <= Math.floor(5 / 2),
      `${productId} occupies ${count} of ${digest.items.length} rows`
    );
  }
  assert.ok(counts.size >= 2, 'a digest of one product is a campaign, not a digest');
});

test('every digest row rests on at least two supporting signals', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  for (const i of digest.items) {
    assert.ok(
      i.supporting_signal_count >= 2,
      `${i.household_id} has ${i.supporting_signal_count} supporting signal(s)`
    );
  }
});

test('every digest row carries a signal phrase and an outreach window', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  for (const i of digest.items) {
    assert.ok(i.lead_signal?.label, `${i.household_id} has no signal phrase`);
    assert.deepEqual(findSnakeCase(i.lead_signal.label), []);
    assert.ok(i.outreach_window?.label);
    // A window with no stated reason is a number an advisor cannot defend.
    assert.ok(i.outreach_window.basis.length > 20);
  }
});

test('digest says nothing rather than padding when there is nothing to say', () => {
  const empty = createFixturePortfolioProvider({
    data: {
      households: {
        institution: { id: 'i', name: 'I', domain: 'x.com' },
        advisors: [{ id: 'adv_empty', name: 'E', email: 'e@x.com', household_ids: [] }],
        households: [],
      },
      transactions: { transactions: {} },
      signals: { signals: {} },
      catalog: provider.getCatalogDocument(),
    },
  });
  const digest = buildAdvisorDigest({ provider: empty, advisorId: 'adv_empty' });
  assert.equal(digest.items.length, 0);
  assert.match(digestSubject(digest), /nothing needs your attention/);
});

// --- outreach drafting -------------------------------------------------------

const DOWN_GATEWAY = {
  async chatCompletion() {
    return { response: { ok: false, async json() { return {}; } } };
  },
};

test('outreach falls back to a deterministic draft when the model is unavailable', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const { drafts } = await generateOutreach({
    gateway: DOWN_GATEWAY,
    product: audience.product,
    candidates: audience.candidates,
  });
  assert.ok(drafts.length >= 1 && drafts.length <= 3);
  for (const d of drafts) {
    assert.ok(d.client_body.length > 0);
    assert.ok(d.rationale.length > 0);
    assert.ok(d.subject.length > 0);
    assert.equal(d.validation.used_fallback, true);
  }
});

test('every product carries a client-safe plain_benefit', () => {
  // The tagline cannot be used in a client draft: "4% back on travel" is a
  // percentage, and validateClientDraft rejects the whole draft for it. So
  // plain_benefit has to exist on every product and has to stay figure-free,
  // or outreach silently falls back to generic copy for that product.
  for (const product of provider.getCatalog()) {
    assert.ok(
      product.plain_benefit,
      `${product.id} has no plain_benefit, so its drafts cannot say what it does`
    );
    assert.doesNotMatch(product.plain_benefit, /\$\s?\d/, `${product.id} plain_benefit has a figure`);
    assert.doesNotMatch(product.plain_benefit, /\d+(\.\d+)?\s?%/, `${product.id} plain_benefit has a rate`);
    assert.doesNotMatch(product.plain_benefit, /[a-z0-9]+_[a-z0-9]+/, `${product.id} plain_benefit has an internal key`);
  }
});

test('the product description survives the handoff into a draft', () => {
  // buildAudience hands generateOutreach a reduced product object. plain_benefit
  // was added to that projection precisely because tagline was not in it, and
  // dropping it again would quietly make every draft generic.
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  assert.ok(audience.product.plain_benefit, 'buildAudience dropped plain_benefit');
});

test('a draft names the specific thing the advisor noticed', async () => {
  // A draft that says "a change in your spending habits" is true of every
  // client alive, which makes it a form letter. The observation is the only
  // part of the client half that could not have been written for someone else,
  // so it has to survive into the body even on the deterministic path.
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const { drafts } = await generateOutreach({
    gateway: DOWN_GATEWAY,
    product: audience.product,
    candidates: audience.candidates,
  });
  const traveler = drafts.find((d) => d.household_id === 'hh_whitfield') || drafts[0];
  assert.match(traveler.client_body, /flights and hotels|card balance every month/);
  for (const d of drafts) {
    assert.doesNotMatch(d.client_body, /spending habits/i);
    assert.doesNotMatch(d.client_body, /financial activity/i);
    // "paid attention to that retirement is..." is what a clause-shaped
    // observation produces. Every entry must be a noun phrase.
    assert.doesNotMatch(d.client_body, /attention to that /i);
  }
});

test('the client half of a draft never carries a dollar figure', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const { drafts } = await generateOutreach({
    gateway: DOWN_GATEWAY,
    product: audience.product,
    candidates: audience.candidates,
  });
  for (const d of drafts) {
    assert.doesNotMatch(d.client_body, /\$\s?\d/, `figure leaked to client: ${d.household_id}`);
    assert.doesNotMatch(d.client_body, /\d+(\.\d+)?\s?%/);
  }
});

test('the advisor half inherits the calculated basis rather than restating it', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const top = audience.candidates[0];
  const { drafts } = await generateOutreach({
    gateway: DOWN_GATEWAY,
    product: audience.product,
    candidates: [top],
  });
  // The figure in the briefing is the exact string the calculator produced, so
  // it cannot drift from the audience table.
  assert.ok(drafts[0].rationale.includes(top.benefit_basis));
});

test('a model draft that leaks an inferred attribute is rejected in favor of the fallback', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const top = audience.candidates[0];
  // Adversarial: the model returns copy naming the modeled signal and a figure.
  const leaky = {
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
                        {
                          household_id: top.household_id,
                          body: 'Our modeled signals flagged your Travel-heavy spend, worth about $553 a year.',
                        },
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
  const { drafts } = await generateOutreach({
    gateway: leaky,
    product: audience.product,
    candidates: [top],
  });
  assert.equal(drafts[0].validation.used_fallback, true);
  assert.ok(drafts[0].validation.violations.includes('dollar_figure'));
  assert.doesNotMatch(drafts[0].client_body, /modeled/i);
  assert.doesNotMatch(drafts[0].client_body, /Travel-heavy spend/);
});

test('a clean model draft is used as written', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const top = audience.candidates[0];
  const clean = {
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
                        {
                          household_id: top.household_id,
                          body: 'I was going through your accounts this week and noticed something worth a conversation. Do you have twenty minutes?',
                        },
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
  const { drafts } = await generateOutreach({
    gateway: clean,
    product: audience.product,
    candidates: [top],
  });
  assert.equal(drafts[0].validation.used_fallback, false);
  assert.match(drafts[0].client_body, /going through your accounts/);
});

test('validateClientDraft catches figures, internal keys, and signal names', () => {
  const candidate = { supporting_signals: ['Travel-heavy spend', 'idle_cash'] };
  assert.deepEqual(validateClientDraft('A clean note asking for a call.', candidate), []);
  assert.ok(validateClientDraft('Worth $553 a year.', candidate).includes('dollar_figure'));
  assert.ok(validateClientDraft('You could earn 4% back.', candidate).includes('percentage'));
  assert.ok(
    validateClientDraft('We saw your Travel-heavy spend.', candidate).some((v) =>
      v.startsWith('internal_term')
    )
  );
  assert.ok(validateClientDraft('Flagged by idle_cash.', candidate).includes('internal_key'));
});

test('subject lines are tone-specific and short enough to survive a lock screen', () => {
  const tones = ['warm_personal', 'direct_professional', 'formal_reserved', 'analytical'];
  const seen = new Set();
  for (const tone of tones) {
    const subject = outreachSubject({ tone, category: 'Cards' });
    assert.ok(subject.length < 40, `"${subject}" is ${subject.length} chars`);
    assert.ok(subject.length > 0);
    seen.add(subject);
  }
  assert.equal(seen.size, tones.length, 'each tone needs its own subject');
});

test('a draft inherits the household tone the advisor set', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const whitfield = audience.candidates.find((c) => c.household_id === 'hh_whitfield');
  assert.equal(whitfield.tone, 'formal_reserved');
  const { drafts } = await generateOutreach({
    gateway: DOWN_GATEWAY,
    product: audience.product,
    candidates: [whitfield],
  });
  assert.equal(drafts[0].tone, 'formal_reserved');
  // The reserved tone addresses by full name rather than a first name.
  assert.match(drafts[0].client_body, /Dear Eleanor Whitfield,/);
});

test('outreach copy uses no banned vocabulary', async () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const { drafts } = await generateOutreach({
    gateway: DOWN_GATEWAY,
    product: audience.product,
    candidates: audience.candidates,
  });
  for (const d of drafts) {
    assert.deepEqual(findBannedVocabulary(d.client_body), []);
    assert.doesNotMatch(d.client_body, /\u2014/);
  }
});

// --- grounded free-form Q&A --------------------------------------------------

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

  const none = await answerQuestion({ gateway: DOWN_GATEWAY, question: 'x', context: {} });
  assert.equal(none.text, '');
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

function round2(n) {
  return Math.round(n * 100) / 100;
}

test('the audience is ranked by how defensible the figure is, then by its size', () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const qualifiers = audience.candidates.map((c) => c.benefit_qualifier);

  // Every stated net comes before the one household whose current card we
  // cannot see. A gross and a net are not the same number, so interleaving
  // them by size would put a row an advisor cannot act on yet at the top.
  const lastNet = qualifiers.lastIndexOf('net');
  const firstGross = qualifiers.indexOf('gross');
  assert.ok(firstGross === -1 || firstGross > lastNet, `ordering was ${qualifiers.join(', ')}`);

  // Within the nets, the money column reads top to bottom.
  const nets = audience.candidates
    .filter((c) => c.benefit_qualifier === 'net')
    .map((c) => c.annual_benefit_usd);
  assert.deepEqual(nets, [...nets].sort((a, b) => b - a), `net column was ${nets.join(', ')}`);
  assert.ok(nets.length >= 5, 'the demo book needs enough nets for the ordering to be visible');
});

test('a household we cannot price net is still shown rather than dropped', () => {
  const audience = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const gross = audience.candidates.find((c) => c.benefit_qualifier === 'gross');
  assert.ok(gross, 'the book should contain a household whose card we do not hold');
  assert.equal(gross.benefit.baseline, 'unknown');
  assert.equal(gross.benefit.net_usd, null);
  assert.match(gross.benefit_basis, /We do not hold their day-to-day card/);
});

// --- timing: context-aware ordering, expiry, and cadence -----------------------

const LIFE_EVENT_TYPES = new Set([
  'estate_inflow',
  'business_liquidity',
  'new_child',
  'new_child_expected',
  'home_purchase_intent',
  'relocation',
  'elder_care',
  'college_bound',
  'home_renovation',
  'retirement_horizon',
]);

const REFRESH_START = new Date('2026-03-01T11:00:00.000Z');
const dayAfter = (n) => new Date(REFRESH_START.getTime() + n * 86400000);

/**
 * Simulate the refresh job having run twice over an advisor's book: once at
 * REFRESH_START to establish first_seen_at, and once at `now`. Optionally hide
 * some signals from the first run so they read as newly arrived on the second.
 */
function bookContext({ advisorId, now, newlyArrived = () => false }) {
  const advisor = provider.getAdvisors().find((a) => a.id === advisorId);
  const map = new Map();
  for (const householdId of advisor.household_ids) {
    const household = provider.getHousehold(householdId);
    const signals = provider.getSignals(householdId);
    const before = {
      ...signals,
      life_events: (signals.life_events || []).filter((e) => !newlyArrived(householdId, e.type)),
    };
    const first = buildHouseholdContext({ household, signals: before, previous: null, now: REFRESH_START });
    map.set(
      householdId,
      buildHouseholdContext({ household, signals, previous: first, now })
    );
  }
  return map;
}

function touchMap(entries) {
  return new Map(
    Object.entries(entries).map(([householdId, v]) => [
      householdId,
      { lastTouchAt: v.lastTouchAt || null, byProduct: new Map(Object.entries(v.byProduct || {})) },
    ])
  );
}

test('with no context the digest is byte-identical to the pre-timing behavior', () => {
  // The guarantee that makes this safe to deploy: the first run after release,
  // before any refresh has happened, changes nothing an advisor sees.
  const withoutContext = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  const items = withoutContext.items;
  assert.ok(items.length > 0);
  for (const item of items) {
    assert.equal(item.timing.status, 'undated');
    assert.equal(item.timing.decay, 1);
    assert.equal(item.priority, item.annual_benefit_usd);
  }
  assert.equal(withoutContext.context_coverage.covered, 0);
});

test('a life event past its window drops out of the audience and is reconciled', () => {
  // hh_nakamura leads on a home renovation, which carries a 30-day window.
  const early = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'high-yield-savings',
    context: bookContext({ advisorId: DEMO_ADVISOR, now: dayAfter(5) }),
    now: dayAfter(5),
  });
  assert.ok(early.candidates.some((c) => c.household_id === 'hh_nakamura'));

  const late = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'high-yield-savings',
    context: bookContext({ advisorId: DEMO_ADVISOR, now: dayAfter(45) }),
    now: dayAfter(45),
  });
  assert.ok(!late.candidates.some((c) => c.household_id === 'hh_nakamura'));

  const expired = late.expired.find((e) => e.household_id === 'hh_nakamura');
  assert.ok(expired, 'the household is reported rather than silently vanishing');
  assert.equal(expired.window_days, 30);
  assert.match(expired.reason_label, /window on this signal closed/);

  // Every household in the book still lands in exactly one bucket.
  const r = late.reconciliation;
  assert.equal(r.fits + r.excluded + r.no_signal + r.expired, r.considered);
});

test('a standing signal keeps its row no matter how long it has been true', () => {
  // Travel-heavy spend is as real on day 400 as on day 1.
  const context = bookContext({ advisorId: DEMO_ADVISOR, now: dayAfter(400) });
  const res = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'travel-card',
    context,
    now: dayAfter(400),
  });
  const sharma = res.candidates.find((c) => c.household_id === 'hh_sharma');
  assert.ok(sharma, 'a standing signal never expires');
  assert.ok(sharma.timing.decay >= 0.5, 'but it does lose weight down to the floor');
  assert.ok(sharma.priority < sharma.annual_benefit_usd);
});

test('an aged signal ranks below where it started without changing its dollar figure', () => {
  const fresh = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'travel-card',
    context: bookContext({ advisorId: DEMO_ADVISOR, now: dayAfter(1) }),
    now: dayAfter(1),
  });
  const aged = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'travel-card',
    context: bookContext({ advisorId: DEMO_ADVISOR, now: dayAfter(365) }),
    now: dayAfter(365),
  });

  const freshSharma = fresh.candidates.find((c) => c.household_id === 'hh_sharma');
  const agedSharma = aged.candidates.find((c) => c.household_id === 'hh_sharma');
  assert.ok(agedSharma.priority < freshSharma.priority, 'rank weight falls');
  assert.equal(
    agedSharma.annual_benefit_usd,
    freshSharma.annual_benefit_usd,
    'the benefit shown to the advisor does not'
  );
});

test('a signal that arrived overnight is flagged and promoted', () => {
  const now = dayAfter(2);
  const context = bookContext({
    advisorId: DEMO_ADVISOR,
    now,
    newlyArrived: (householdId, type) => householdId === 'hh_nakamura' && type === 'home_renovation',
  });
  const res = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'high-yield-savings',
    context,
    now,
  });

  const nakamura = res.candidates.find((c) => c.household_id === 'hh_nakamura');
  assert.equal(nakamura.timing.novel, true);
  assert.equal(nakamura.timing.status, 'new');
  assert.ok(nakamura.priority > nakamura.annual_benefit_usd, 'novelty lifts the rank weight');
});

test('a household shown this week is held back, and the digest says so', () => {
  const now = dayAfter(3);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const baseline = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now });
  const first = baseline.items[0];

  const withTouch = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({ [first.household_id]: { lastTouchAt: dayAfter(2).toISOString() } }),
  });

  assert.ok(!withTouch.items.some((i) => i.household_id === first.household_id));
  assert.equal(withTouch.dropped.contacted_recently, 1);

  const held = withTouch.held.find((h) => h.household_id === first.household_id);
  assert.equal(held.reason, 'contacted_recently');
  assert.equal(held.days_since, 1);
  assert.ok(held.next_eligible_at, 'an operator can see when it comes back');
});

test('the same household returns once the cadence window has passed', () => {
  const now = dayAfter(20);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const first = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now }).items[0];

  // Asserted on `held` rather than on `items`: the question here is whether
  // cadence still gates the household, not whether it wins a slot. Once it is
  // free it competes on rank like anything else, and a household contacted ten
  // days ago sits behind ten that have never been raised at all.
  const inside = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({ [first.household_id]: { lastTouchAt: dayAfter(19).toISOString() } }),
  });
  assert.ok(
    inside.held.some((h) => h.household_id === first.household_id),
    'held while still inside the window'
  );

  const after = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({ [first.household_id]: { lastTouchAt: dayAfter(10).toISOString() } }),
  });
  assert.ok(
    !after.held.some((h) => h.household_id === first.household_id),
    'free again once the window has passed'
  );
});

test('a new signal pulls a recently-contacted household back into the digest', () => {
  // The clause the whole cadence design exists for: news overrides the cap.
  const now = dayAfter(2);
  const context = bookContext({
    advisorId: DEMO_ADVISOR,
    now,
    newlyArrived: (householdId, type) => householdId === 'hh_nakamura' && type === 'home_renovation',
  });
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    // Contacted yesterday, but about a different product.
    touches: touchMap({
      hh_nakamura: { lastTouchAt: dayAfter(1).toISOString(), byProduct: { 'travel-card': dayAfter(1).toISOString() } },
    }),
  });

  const nakamura = res.items.find((i) => i.household_id === 'hh_nakamura');
  assert.ok(nakamura, 'a genuinely new signal is not held by the weekly cap');
  assert.equal(nakamura.cadence.reason, 'new_signal_override');
});

test('the same pitch for an unchanged reason is not repeated within the month', () => {
  const now = dayAfter(3);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const first = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now }).items[0];

  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({
      [first.household_id]: {
        lastTouchAt: dayAfter(1).toISOString(),
        byProduct: { [first.product.id]: dayAfter(1).toISOString() },
      },
    }),
  });

  assert.ok(!res.items.some((i) => i.household_id === first.household_id));
  assert.equal(res.dropped.same_product_recently, 1);
});

test('expiries are counted once per household, not once per product scanned', () => {
  // The catalog is scanned product by product, so a naive sum reports the same
  // closed window a dozen times and a book of 12 shows 22 expiries.
  const now = dayAfter(60);
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context: bookContext({ advisorId: DEMO_ADVISOR, now }),
    now,
  });
  assert.ok(res.dropped.expired <= res.considered, `${res.dropped.expired} expiries on ${res.considered} households`);
});

test('cadence thresholds can be loosened for a smaller book', () => {
  const now = dayAfter(3);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const first = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now }).items[0];
  const touches = touchMap({ [first.household_id]: { lastTouchAt: dayAfter(2).toISOString() } });

  const strict = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now, touches });
  assert.ok(strict.held.some((h) => h.household_id === first.household_id));

  const loose = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches,
    cadence: { minDaysBetween: 1, minDaysBetweenSameProduct: 1 },
  });
  assert.ok(!loose.held.some((h) => h.household_id === first.household_id));
});

/**
 * The digest lambda's loop, reduced to the part that matters here: read this
 * advisor's contact history, build, then log what was actually mailed.
 */
async function runDigestDay({ store, advisorIds, context, now }) {
  const sent = new Map();
  for (const advisorId of advisorIds) {
    const householdIds = provider.getAdvisors().find((a) => a.id === advisorId).household_ids;
    const digest = buildAdvisorDigest({
      provider,
      advisorId,
      maxItems: 5,
      context,
      touches: await store.getTouchSummaries(householdIds, { advisorId }),
      now,
      cadence: { minDaysBetween: 5, minDaysBetweenSameProduct: 5 },
    });
    sent.set(advisorId, digest.items.length);
    for (const item of digest.items) {
      await store.recordTouch({
        householdId: item.household_id,
        advisorId,
        productId: item.product.id,
        channel: 'digest',
        now,
      });
    }
  }
  return sent;
}

test('advisors sharing a book do not spend each other\'s cadence', async () => {
  // The demo has four advisors holding the same 28 households, and the contact
  // log is keyed by household. Read unscoped, the first advisor's mail marks
  // those households contacted for everyone behind them in the loop, so one
  // morning burned twenty of the twenty-eight and the digest went silent on
  // day three. Live for two days in September before anyone noticed.
  const store = createCoworkerStore(createInMemoryBackend());
  const advisors = ['adv_zoheb', 'adv_marco', 'adv_yusheng'];

  for (let day = 1; day <= 4; day += 1) {
    const now = dayAfter(day);
    const sent = await runDigestDay({
      store,
      advisorIds: advisors,
      context: bookContext({ advisorId: advisors[0], now }),
      now,
    });
    for (const advisorId of advisors) {
      assert.ok(sent.get(advisorId) > 0, `${advisorId} got nothing on day ${day}`);
    }
  }
});

test('a household already mailed is still held for the advisor who mailed it', async () => {
  // The other half of the same rule: scoping must not turn the cadence cap off.
  const store = createCoworkerStore(createInMemoryBackend());
  const now = dayAfter(1);
  const context = bookContext({ advisorId: 'adv_zoheb', now });

  const first = await runDigestDay({ store, advisorIds: ['adv_zoheb'], context, now });
  assert.ok(first.get('adv_zoheb') > 0);

  const mailed = (await store.listTouches(
    buildAdvisorDigest({ provider, advisorId: 'adv_zoheb', maxItems: 5, context, now }).items[0]
      .household_id
  )).length;
  assert.ok(mailed > 0, 'the send was logged');

  const nextDay = dayAfter(2);
  const digest = buildAdvisorDigest({
    provider,
    advisorId: 'adv_zoheb',
    maxItems: 5,
    context: bookContext({ advisorId: 'adv_zoheb', now: nextDay }),
    touches: await store.getTouchSummaries(
      provider.getAdvisors().find((a) => a.id === 'adv_zoheb').household_ids,
      { advisorId: 'adv_zoheb' }
    ),
    now: nextDay,
    cadence: { minDaysBetween: 5, minDaysBetweenSameProduct: 5 },
  });
  assert.ok(digest.held.length > 0, 'yesterday\'s households are held for the advisor who saw them');
});

test('a life event reaches the mail even though we will not price it', () => {
  // Ranking by how defensible the figure is put all 22 life events in the
  // bottom half of the 28-household book, with "Inheritance received" 27th of
  // 27 behind a $1,132 card saving, because we deliberately refuse to put a
  // number on an inheritance.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });
  const events = digest.items.filter((i) => LIFE_EVENT_TYPES.has(i.lead_signal?.type));
  assert.ok(events.length >= 1, 'at least one life event is in the mail');

  // The heaviest event in the book leads the reserved rows, not the nearest one.
  assert.ok(
    digest.items.some((i) => i.lead_signal?.type === 'estate_inflow'),
    'an inheritance outranks a home renovation for a reserved row'
  );
});

test('reserved rows do not take over the digest', () => {
  // 22 of 28 households carry an event. Promoting rather than reserving would
  // swap one monoculture for another.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });
  const events = digest.items.filter((i) => LIFE_EVENT_TYPES.has(i.lead_signal?.type));
  assert.ok(events.length <= 2, `expected at most 2 reserved rows, got ${events.length}`);
  assert.ok(
    digest.items.some((i) => i.benefit_qualifier === 'net'),
    'the priced rows still hold the rest of the mail'
  );
});

test('reservation can be turned off', () => {
  const digest = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    maxItems: 5,
    lifeEventSlots: 0,
  });
  assert.equal(
    digest.items.filter((i) => LIFE_EVENT_TYPES.has(i.lead_signal?.type)).length,
    0,
    'without reservation the defensible figures sweep the mail again'
  );
});

test('a scarce product slot rotates instead of starving the same household', () => {
  // Seven households in the demo book want the travel card and the
  // concentration cap allows one a day. Ordered by benefit alone that queue is
  // stable, so the same winners take the slot forever and the household at the
  // back is never mentioned again — the worst outcome available, since an
  // advisor cannot act on a household they are never shown.
  const now = dayAfter(10);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const baseline = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now });
  const winner = baseline.items[0];

  const afterContact = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({ [winner.household_id]: { lastTouchAt: dayAfter(9).toISOString() } }),
  });
  assert.ok(
    afterContact.items.length && afterContact.items[0].household_id !== winner.household_id,
    'yesterday\u2019s winner does not lead again today'
  );
});

test('within a week the more defensible figure still leads', () => {
  // The bound on the fairness term. It is bucketed by week precisely so that
  // it stays inert among households in the same bucket; without that, "nobody
  // called them lately" would beat a figure computed from a household's own
  // ledger on any given morning.
  const now = dayAfter(30);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const sameDay = dayAfter(21).toISOString();
  const touches = touchMap(
    Object.fromEntries(
      provider.getHouseholds().map((h) => [h.id, { lastTouchAt: sameDay }])
    )
  );
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches,
    maxItems: 20,
    pace: false,
  });
  const ranks = res.items.map((i) => benefitRank(i.benefit_qualifier));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), 'benefit tiers stay in order');
});

test('a household waiting a week longer outranks a slightly better figure', () => {
  // The demo book starved a household this way: six price the travel card from
  // posted rates and rank a tier above the seventh, six fit exactly into a
  // six-day cycle through one daily slot, and the seventh — holding the
  // largest figure of the seven — was never mentioned again.
  const now = dayAfter(30);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const recent = dayAfter(29).toISOString();
  const touches = touchMap(
    Object.fromEntries(
      provider
        .getHouseholds()
        .filter((h) => h.id !== 'hh_lindqvist')
        .map((h) => [h.id, { lastTouchAt: recent }])
    )
  );
  const res = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now, touches });
  assert.equal(res.items[0].household_id, 'hh_lindqvist');
});

test('breaking news wins a household row over a tidier figure', () => {
  // Petrov already earns a row for a travel card whose benefit is computed from
  // their own ledger. An inheritance arrives. The card figure is still the more
  // defensible one, and it is still the wrong thing to put in the mail.
  const now = dayAfter(3);
  const inheritance = {
    type: 'estate_inflow',
    confidence_band: 'high',
    evidence: 'A $310,000 deposit landed from an estate settlement.',
  };
  const withInheritance = {
    ...provider,
    getSignals: (id) =>
      id === 'hh_petrov'
        ? { ...provider.getSignals(id), life_events: [...provider.getSignals(id).life_events, inheritance] }
        : provider.getSignals(id),
  };

  const advisor = provider.getAdvisors().find((a) => a.id === DEMO_ADVISOR);
  const context = new Map();
  for (const householdId of advisor.household_ids) {
    const household = provider.getHousehold(householdId);
    const before = buildHouseholdContext({
      household,
      signals: provider.getSignals(householdId),
      previous: null,
      now: REFRESH_START,
    });
    context.set(
      householdId,
      buildHouseholdContext({
        household,
        signals: withInheritance.getSignals(householdId),
        previous: before,
        now,
      })
    );
  }

  const digest = buildAdvisorDigest({ provider: withInheritance, advisorId: DEMO_ADVISOR, context, now });
  const petrov = digest.items.find((i) => i.household_id === 'hh_petrov');

  assert.ok(petrov, 'the household earns a row');
  assert.equal(petrov.lead_signal.type, 'estate_inflow', 'and the row is about the inheritance');
  assert.notEqual(petrov.product.id, 'travel-card');
  assert.equal(digest.items[0].household_id, 'hh_petrov', 'news leads the mail');

  // The rest of the ordering is untouched: everything below the news is still
  // ranked by how defensible its figure is.
  const rest = digest.items.slice(1);
  for (const item of rest) assert.equal(Boolean(item.timing.novel), false);
});

test('the digest paces itself to what the book can sustain', () => {
  // maxItems is a ceiling, not a target. Taking the best five every morning
  // spends a twelve-household book in three days and then sends nothing for a
  // week, which reads to an advisor as the product breaking.
  const now = dayAfter(1);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    maxItems: 5,
    touches: touchMap({}),
  });

  assert.ok(res.items.length < 5, 'a small book does not get a full mail');
  assert.equal(res.pacing.paced_to, res.pacing.sustainable);
  assert.ok(res.pacing.sustainable >= 1, 'but it always gets at least one row');
  assert.ok(res.dropped.paced > 0, 'and the rationing is reported');
});

test('nothing is paced away when there is no contact log to ration against', () => {
  // Without a contact log no row is being saved for another day, so a thinner
  // mail buys nothing and just loses opportunities.
  const now = dayAfter(1);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const res = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now, maxItems: 5 });
  assert.equal(res.pacing.paced_to, 5);
  assert.equal(res.dropped.paced, 0);
});

test('a book large enough for the full digest is not paced down', () => {
  const now = dayAfter(1);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    maxItems: 5,
    touches: touchMap({}),
    // A tight same-product cap stands in for a large book: both raise the
    // number of rows a day the book can support without repeating itself.
    cadence: { minDaysBetween: 1, minDaysBetweenSameProduct: 1 },
  });
  assert.equal(res.pacing.paced_to, 5);
  assert.equal(res.dropped.paced, 0);
});

test('pacing rations routine rows but never holds back news', () => {
  const now = dayAfter(2);
  const context = bookContext({
    advisorId: DEMO_ADVISOR,
    now,
    newlyArrived: (householdId, type) => householdId === 'hh_nakamura' && type === 'home_renovation',
  });
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    maxItems: 5,
    touches: touchMap({}),
  });
  assert.ok(res.items.some((i) => i.household_id === 'hh_nakamura' && i.timing.novel));
});

test('pacing divides by the cap that actually binds', () => {
  // A household returns after minDaysBetween only if its product changed;
  // otherwise it waits out the same-product cap. Pacing off the shorter one
  // promises a rhythm the book cannot keep.
  const now = dayAfter(1);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({}),
    cadence: { minDaysBetween: 2, minDaysBetweenSameProduct: 40 },
  });
  assert.equal(res.pacing.cadence_days, 40);
});

test('pacing can be turned off entirely', () => {
  const now = dayAfter(1);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const res = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    context,
    now,
    touches: touchMap({}),
    pace: false,
  });
  assert.equal(res.pacing.paced_to, 5);
});

test('the digest reports how much of the book the refresh has covered', () => {
  const now = dayAfter(1);
  const full = bookContext({ advisorId: DEMO_ADVISOR, now });
  const partial = new Map([...full].slice(0, 3));

  const res = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context: partial, now });
  assert.equal(res.context_coverage.covered, 3);
  assert.equal(res.context_coverage.of, bookSize(DEMO_ADVISOR));
});

test('the digest email shows signal age and marks what is new', () => {
  const now = dayAfter(2);
  const context = bookContext({
    advisorId: DEMO_ADVISOR,
    now,
    newlyArrived: (householdId, type) => householdId === 'hh_nakamura' && type === 'home_renovation',
  });
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now });
  const html = renderDigestTable(digest.items);

  assert.match(html, /NEW<\/span>/, 'the one row worth opening the mail for is marked');
  assert.match(html, /First seen/);
  assert.match(html, /days left/, 'windowed signals state their remaining time');
  assert.deepEqual(findBannedVocabulary(html), []);
  assert.deepEqual(findSnakeCase(html), []);
});

test('an undated row states no age rather than implying it is new', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  const html = renderDigestTable(digest.items);
  assert.ok(!/First seen/.test(html));
  assert.ok(!/NEW<\/span>/.test(html));
});
