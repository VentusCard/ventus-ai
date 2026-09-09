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

const provider = createFixturePortfolioProvider();

// The demo advisor's book is the whole 12-household portfolio; adv_okoro holds
// the original four, which several assertions below deliberately pin.
const DEMO_ADVISOR = 'adv_zoheb';

// --- deterministic audience build --------------------------------------------

test('travel-card audience fits the traveler and excludes the overdraft household', () => {
  const res = buildAudience({ provider, advisorId: 'adv_okoro', productId: 'travel-card' });
  assert.equal(res.considered, 4);
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
  assert.equal(res.candidates[0].household_id, 'hh_bianchi');
  assert.equal(res.candidates[0].fit_score, 2);
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

test('digest keeps one opportunity per household and states the denominator', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  assert.ok(digest.items.length >= 1);
  const ids = digest.items.map((i) => i.household_id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(digest.considered, 12);
  assert.match(digestSubject(digest), /of 12 households/);
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
  assert.match(digestSubject(digest), /nothing new worth your time/);
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
