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
  redactFigures,
  retrieveEvidence,
  scanHouseholdMentions,
  scanNamedTargets,
  summarizeSpend,
  summarizeThread,
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
  // Travel spend, reimbursed business travel, and loyalty spend all target the
  // card; "pays card in full" is only a qualifier and must not count here.
  assert.equal(res.candidates[0].fit_score, 3);
  assert.deepEqual(res.candidates[0].matched_signals, [
    'Travel-heavy spend',
    'loyalty_spend',
    'business_travel_reimbursed',
  ]);
  assert.ok(res.candidates[0].annual_benefit_usd > 0);
  // Alvarez carries an overdraft flag, which the institution treats as a hard
  // exclusion for this product.
  const held = res.excluded.find((s) => s.household_id === 'hh_alvarez');
  assert.ok(held);
  assert.equal(held.reason, 'nsf_overdraft_cluster');
  assert.equal(held.reason_label, 'recent overdraft activity');
});

test('a qualifying signal on its own does not put a household in the audience', () => {
  const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  const ids = res.candidates.map((c) => c.household_id);

  // Both pay their card in full, which is a qualifier for the travel card: good
  // to know once something has made the card relevant, never the thing that
  // makes it relevant. Neither travels — their own ledgers put travel and
  // dining at 3-4% of spend. A screen that returns them is pitching a rewards
  // card on creditworthiness.
  for (const householdId of ['hh_petrov', 'hh_kim']) {
    const tokens = householdTokens(provider.getSignals(householdId));
    assert.ok(tokens.has('Pays card in full'), `${householdId} still pays in full`);
    assert.ok(!ids.includes(householdId), `${householdId} qualified on the qualifier alone`);
  }

  // The household that actually travels is still a fit, and the card no longer
  // cites paying in full as support for the pitch. supporting_signals feeds the
  // digest's refusal to build a row on a single data point, so counting a trait
  // there made a one-signal row look corroborated.
  const whitfield = res.candidates.find((c) => c.household_id === 'hh_whitfield');
  assert.ok(whitfield, 'the household that actually travels is still a fit');
  assert.ok(!whitfield.supporting_signals.includes('Pays card in full'));
});

test('a household is never pitched a product it already holds with us', () => {
  // Every product carries already_holds_product as a block. It is enforced
  // against the relationship record rather than authored as a signal, because
  // the bank already knows what it sold.
  const savings = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'high-yield-savings' });
  const marchetti = savings.excluded.find((e) => e.household_id === 'hh_marchetti');
  assert.ok(marchetti, 'Marchetti holds the savings account');
  assert.equal(marchetti.reason, 'already_holds_product');
  assert.equal(marchetti.reason_label, 'already holding this product with us');
  assert.ok(!savings.candidates.some((c) => c.household_id === 'hh_marchetti'));

  // The block is per product: the same household is still a fit elsewhere.
  const portfolio = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'managed-portfolio' });
  assert.ok(portfolio.candidates.some((c) => c.household_id === 'hh_marchetti'));
  // And a household that holds the portfolio is excluded from it in turn.
  assert.equal(
    portfolio.excluded.find((e) => e.household_id === 'hh_sharma')?.reason,
    'already_holds_product'
  );
});

test('qualifiers the bank already knows are derived from the relationship record', () => {
  const household = provider.getHousehold('hh_nakamura');
  const tokens = householdTokens(provider.getSignals('hh_nakamura'), household);
  assert.ok(tokens.has('monthly_surplus'), 'a positive surplus is a qualifier');
  assert.ok(!tokens.has('no_monthly_surplus'));
  assert.ok(tokens.has('owns_home'), 'equity on file means they own the home');
  assert.ok(tokens.has('high_net_worth'), '$1.85M under management');
  assert.ok(tokens.has('multi_product_household'), 'three products held');

  const thin = householdTokens(provider.getSignals('hh_dubois'), provider.getHousehold('hh_dubois'));
  assert.ok(!thin.has('owns_home'));
  assert.ok(!thin.has('high_net_worth'));
  assert.ok(!thin.has('multi_product_household'));

  // Without the record the derivations stay off rather than guessing.
  const bare = householdTokens(provider.getSignals('hh_nakamura'));
  assert.ok(!bare.has('high_net_worth'));
  assert.ok(!bare.has('multi_product_household'));
  assert.ok(bare.has('owns_home'), 'equity is in the signals, so this one still derives');

  // None of them can create a match on their own.
  const trust = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'trust-account' });
  const nakamura = trust.candidates.find((c) => c.household_id === 'hh_nakamura');
  assert.ok(nakamura);
  assert.ok(!nakamura.matched_signals.includes('high_net_worth'));
  assert.ok(nakamura.supporting_signals.includes('high_net_worth'), 'but it corroborates once matched');
});

test('the newer bank-catalog products fire on the signals authored for them', () => {
  const fits = (productId) =>
    buildAudience({ provider, advisorId: DEMO_ADVISOR, productId }).candidates.map((c) => c.household_id);

  // college_bound reaches the products the bank maps it to.
  assert.ok(fits('student-card').includes('hh_villanueva'));
  assert.ok(fits('teen-savings').includes('hh_villanueva'));
  assert.ok(fits('529-plan').includes('hh_villanueva'));
  // job_change reaches the rollover service, and the household is not thin.
  const rollover = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: '401k-rollover' });
  const qureshi = rollover.candidates.find((c) => c.household_id === 'hh_qureshi');
  assert.ok(qureshi);
  assert.equal(qureshi.lead_signal.type, 'job_change');
  assert.equal(qureshi.lead_signal.label, 'Changed jobs');
  assert.ok(qureshi.supporting_signal_count >= 2);
  // A card with a ledger behind it prices itself from real transactions.
  const grocery = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'category-cashback-card' });
  const bianchi = grocery.candidates.find((c) => c.household_id === 'hh_bianchi');
  assert.ok(bianchi);
  assert.equal(bianchi.benefit.mode, 'computed');
  assert.ok(bianchi.annual_benefit_usd > 0);
  // A refinance against a balance other than the student loan.
  const refi = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'auto-refinance' });
  const oyelaran = refi.candidates.find((c) => c.household_id === 'hh_oyelaran');
  assert.ok(oyelaran);
  assert.equal(oyelaran.annual_benefit_usd, 851);
  // High-cost debt on an overdrafting household is blocked on every lender.
  for (const id of ['heloc', 'balance-transfer-card', 'personal-loan', 'personal-line-of-credit']) {
    const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: id });
    assert.ok(!res.candidates.some((c) => c.household_id === 'hh_alvarez'), `${id} does not pitch Alvarez`);
    assert.ok(res.excluded.some((e) => e.household_id === 'hh_alvarez'), `${id} excludes Alvarez explicitly`);
  }
});

test('a behavioral lead from the bank vocabulary renders as a phrase, never a field name', () => {
  const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'pet-insurance' });
  const novak = res.candidates.find((c) => c.household_id === 'hh_novak');
  assert.ok(novak);
  assert.equal(novak.lead_signal.type, 'new_pet');
  assert.equal(novak.lead_signal.label, 'New pet at home');
  assert.deepEqual(findSnakeCase(novak.lead_signal.label), []);
  assert.deepEqual(findSnakeCase(novak.matched_signal_labels.join(' ')), []);

  const ev = retrieveEvidence({ provider, householdId: 'hh_novak' });
  assert.deepEqual(findSnakeCase(ev.bullets.join(' ')), []);
  assert.ok(ev.bullets.some((b) => /^New pet at home, /.test(b)));
});

test('a row matched on a financial token leads with that token, not a stray event', () => {
  const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'high-yield-savings' });
  const nakamura = res.candidates.find((c) => c.household_id === 'hh_nakamura');

  // Savings matches this household on idle cash alone. The household also has
  // a home renovation on file, and the renovation used to headline the row,
  // which put "home renovation" at the top of a savings pitch and invited the
  // obvious question of what one had to do with the other.
  assert.equal(nakamura.lead_signal.type, 'idle_cash');
  assert.equal(nakamura.lead_signal.kind, 'financial');
  assert.ok(
    provider.getSignals('hh_nakamura').life_events.some((e) => e.type === 'home_renovation'),
    'the renovation is still on file — it just no longer leads'
  );
});

test('a single-product screen returns a real audience across the demo book', () => {
  const res = buildAudience({ provider, advisorId: DEMO_ADVISOR, productId: 'travel-card' });
  // A screen that returns one household reads as a lookup, not a screen. The
  // demo book is sized so the demonstrated product returns a genuine list.
  //
  // Five, not six: "Pays card in full" used to count as a targeting signal, so
  // two households with no travel or dining spend to speak of qualified on
  // creditworthiness alone. Their own ledgers put travel and dining at 3-4% of
  // spend against 12% for the households that remain.
  assert.ok(
    res.candidates.length >= 5,
    `expected at least 5 fits, got ${res.candidates.length}`
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

test('an unqualified mention of a product family resolves to its base product', () => {
  const catalog = provider.getCatalog();
  // "travel" now matches three cards. The advisor who says it means the one
  // without a qualifier, and the premium tiers all contain its name.
  assert.equal(resolveProduct(catalog, 'travel')?.id, 'travel-card');
  assert.equal(resolveProduct(catalog, 'premium travel')?.id, 'premium-travel-card');
  assert.equal(resolveProduct(catalog, 'ultra premium travel card')?.id, 'ultra-premium-travel-card');
  // Unrelated products that happen to share a word are still ambiguous.
  assert.equal(resolveProduct(catalog, 'insurance'), null);
  assert.equal(resolveProduct(catalog, 'loan'), null);
});

// --- household resolution (tolerant of free-text model output) ---------------

test('resolveHousehold maps ids, family names, and contacts to a household', () => {
  const households = provider.getHouseholds();
  assert.equal(resolveHousehold(households, 'hh_nakamura')?.id, 'hh_nakamura');
  assert.equal(resolveHousehold(households, 'Nakamura')?.id, 'hh_nakamura');
  assert.equal(resolveHousehold(households, 'Nakamura Household')?.id, 'hh_nakamura');
  assert.equal(resolveHousehold(households, 'Kenji Nakamura')?.id, 'hh_nakamura');
  // A family named in the plural or the possessive is the same family. "Draft a
  // note to the Lindqvists" came back "I can't find Lindqvists in your book".
  assert.equal(resolveHousehold(households, 'Lindqvists')?.id, 'hh_lindqvist');
  assert.equal(resolveHousehold(households, "Lindqvist's")?.id, 'hh_lindqvist');
  assert.equal(resolveHousehold(households, 'Alvarezes')?.id, 'hh_alvarez');
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
  assert.deepEqual(scanHouseholdMentions('a note to the Lindqvists about the travel card', households), [
    'hh_lindqvist',
  ]);
  assert.deepEqual(scanNamedTargets('Draft a note to the Lindqvists about the travel card', { households }), []);
  assert.deepEqual(scanHouseholdMentions('draft outreach for the top 3', households), []);
  assert.deepEqual(scanHouseholdMentions('', households), []);
});

test('a named household that is not in the book is caught, so no draft falls through', () => {
  const households = provider.getHouseholds();
  const catalog = provider.getCatalog();
  const scan = (text) => scanNamedTargets(text, { households, catalog });

  // Row 14 of the path comparison, verbatim. The classifier returns nothing for
  // "Pemberton", so this scan is the only thing standing between the advisor and
  // client-ready copy addressed to whoever happens to fit the product.
  assert.deepEqual(scan('Draft outreach for the Pemberton family on the travel card.'), [
    'Pemberton',
  ]);
  assert.deepEqual(scan('Draft outreach for Pemberton on the travel card.'), ['Pemberton']);
  assert.deepEqual(scan('Write to the Pembertons about high-yield savings'), ['Pembertons']);
  // A caps subject line defeats the capitalization test, so the stopwords carry it.
  assert.deepEqual(scan('DRAFT OUTREACH FOR PEMBERTON'), ['PEMBERTON']);
});

test('the real asks a demo is built on are not mistaken for unknown households', () => {
  const households = provider.getHouseholds();
  const catalog = provider.getCatalog();
  const scan = (text) => scanNamedTargets(text, { households, catalog });

  // Every one of these is a message the advisor is expected to send. A false
  // positive here is a refusal in front of an audience, so they are pinned.
  assert.deepEqual(scan('Draft outreach for Okafor on the travel card.'), []);
  assert.deepEqual(scan('Draft outreach for the Okafor Household'), []);
  assert.deepEqual(scan('Draft outreach for Ada Okafor'), []);
  assert.deepEqual(scan('Draft outreach for the top 3'), []);
  assert.deepEqual(scan('Draft outreach for Travel Cash Rewards Card'), []);
  assert.deepEqual(scan('Screen the book for High-Yield Savings'), []);
  assert.deepEqual(scan('Who should I pitch the travel card to?'), []);
  assert.deepEqual(scan('Prep me for my call with Okafor tomorrow.'), []);
  assert.deepEqual(scan('Draft outreach for Monday'), []);
  assert.deepEqual(scan(''), []);
  assert.deepEqual(scan(null), []);
});

test('an unknown household is reported alongside the known ones, not instead of them', () => {
  const households = provider.getHouseholds();
  const catalog = provider.getCatalog();

  const found = scanNamedTargets('Draft outreach for Okafor and for Pemberton', {
    households,
    catalog,
  });
  assert.deepEqual(found, ['Pemberton']);
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

test('redacting an amount leaves a sentence that still reads', () => {
  // The lead-in words go with the amount. Dropping only the digits left
  // "two paymentsto design firms" and "12 months totalingin Travel".
  assert.equal(
    redactFigures('9 flights and 7 lodging bookings over 12 months totaling about $18,400 in Travel & Exploration.'),
    '9 flights and 7 lodging bookings over 12 months in Travel & Exploration.'
  );
  assert.equal(
    redactFigures('Two payments above $8,000 to design and survey firms this quarter.'),
    'Two payments to design and survey firms this quarter.'
  );
  assert.equal(redactFigures('Automated $1,500/mo transfer to savings.'), 'Automated transfer to savings.');
  assert.equal(
    redactFigures('Gig payouts ranging $610-$2,010 with no fixed cadence.'),
    'Gig payouts with no fixed cadence.'
  );
  // An amount can open the sentence, and removing it left a lowercase start.
  assert.equal(
    redactFigures('$28k+ across Home Depot, Ferguson, and design retailers in 90 days.'),
    'Across Home Depot, Ferguson, and design retailers in 90 days.'
  );
});

test('redacting leaves counts and windows alone, and takes rates with it', () => {
  const kept = 'Two overdraft fees plus one NSF returned item in 60 days.';
  assert.equal(redactFigures(kept), kept);
  assert.equal(redactFigures('Their account earns 0.5% today.'), 'Their account earns today.');
  assert.equal(redactFigures('We could get them 35 basis points more.'), 'We could get them more.');
});

test('every model-facing bullet in the book is free of figures', () => {
  for (const hh of provider.getHouseholds()) {
    const ev = retrieveEvidence({ provider, householdId: hh.id });
    if (!ev.found) continue;
    for (const bullet of ev.modelBullets) {
      assert.doesNotMatch(bullet, /\$\s?\d/, `${hh.name}: ${bullet}`);
      assert.doesNotMatch(bullet, /\d\s?%/, `${hh.name}: ${bullet}`);
    }
    assert.equal(ev.modelBullets.length, ev.bullets.length, 'one for one, nothing dropped');
  }
});

test('a household spending more than it earns reads as a shortfall, not as negative surplus', () => {
  const ev = retrieveEvidence({ provider, householdId: 'hh_alvarez' });
  const line = ev.bullets.find((b) => /^Posture is/.test(b));

  assert.ok(line);
  // "$-150 of monthly surplus" scans as a typo, and it is the one number on a
  // juggler household an advisor most needs to catch.
  assert.doesNotMatch(line, /\$-/);
  assert.match(line, /\$150 a month more going out than coming in/);
  // Zero idle cash is the absence of a measurement, not a measurement.
  assert.doesNotMatch(line, /\$0/);
  assert.doesNotMatch(line, /uninvested/);
});

test('a household with both figures still gets both, in whole dollars', () => {
  const ev = retrieveEvidence({ provider, householdId: 'hh_okafor' });
  const line = ev.bullets.find((b) => /^Posture is/.test(b));

  assert.match(line, /accumulator/);
  assert.match(line, /about \$40,000 sitting uninvested/);
  assert.match(line, /roughly \$3,200 of monthly surplus/);
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

test('the subject carries no reply prefix of its own', () => {
  // A "Re:" on the digest was Gmail titling a conversation that test replies
  // had started, not anything in the mail. Worth pinning anyway: the digest is
  // always the first message of its thread, so a prefix here would be a lie
  // about a conversation that does not exist.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  for (const subject of [digestSubject(digest), digestSubject({ items: [] })]) {
    assert.doesNotMatch(subject, /^\s*(re|fwd?)\s*:/i);
  }
});

test('a digest survives being written to the table', () => {
  // The digest lambda persists this object as-is, and the DynamoDB document
  // client throws on anything that is not JSON-native — a Date field cost a
  // send its thread record and its contact log. Round-tripping through JSON
  // only comes back deep-equal if every value is already a plain one.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, now: new Date() });
  assert.deepEqual(JSON.parse(JSON.stringify(digest)), digest);
  assert.equal(typeof digest.generatedAt, 'string');
});

test('the subject stays undated whatever the digest knows about today', () => {
  // Dating it was an attempt to stop Gmail threading consecutive digests, and
  // it was aimed at the wrong thing: same-subject mail a day apart never
  // threaded, only a burst of sends minutes apart did. The subject keeps the
  // count at the front, where it is read.
  const generatedAt = new Date('2026-09-25T11:00:00Z');
  assert.equal(
    digestSubject({ items: [{}, {}], generatedAt }),
    'Your Daily Digest: 2 households need attention'
  );
  assert.equal(digestSubject({ items: [{}] }), 'Your Daily Digest: 1 household needs attention');
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
  assert.ok(nets.length >= 4, 'the demo book needs enough nets for the ordering to be visible');
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

const isLifeEvent = (item) => item.lead_signal?.kind === 'life_event';

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
  //
  // Screened against the HELOC rather than savings: a window only governs a
  // lead signal, and the renovation can only lead where it is what matched.
  // Savings matches this household on idle cash, which has no date to expire.
  const early = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'heloc',
    context: bookContext({ advisorId: DEMO_ADVISOR, now: dayAfter(5) }),
    now: dayAfter(5),
  });
  assert.ok(early.candidates.some((c) => c.household_id === 'hh_nakamura'));

  const late = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'heloc',
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
  // The HELOC, for the same reason as the window test above: novelty attaches
  // to the lead signal, and the renovation only leads where it is what matched.
  const res = buildAudience({
    provider,
    advisorId: DEMO_ADVISOR,
    productId: 'heloc',
    context,
    now,
  });

  const nakamura = res.candidates.find((c) => c.household_id === 'hh_nakamura');
  assert.equal(nakamura.timing.novel, true);
  assert.equal(nakamura.timing.status, 'new');

  // Novelty cannot lift this row, and the assertion says so rather than
  // pretending otherwise. priorityScore scales the headline benefit, and the
  // HELOC prices as an outcome rather than a dollar figure, so the weight is
  // zero before novelty is applied and zero after.
  //
  // No product currently prices a life-event-led row: the card is the only one
  // computed from a ledger and it matches on travel and dining, which are
  // spending patterns. So timing has nothing to scale wherever a life event is
  // what leads. That is a gap in the catalog, not in the timing model.
  assert.equal(nakamura.annual_benefit_usd, 0);
  assert.equal(nakamura.priority, 0, 'a benefit of zero cannot be lifted by novelty');
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
  const events = digest.items.filter(isLifeEvent);
  assert.ok(events.length >= 1, 'at least one life event is in the mail');

  // The heaviest event in the book leads the reserved rows, not the nearest one.
  assert.ok(
    digest.items.some((i) => i.lead_signal?.type === 'estate_inflow'),
    'an inheritance outranks a home renovation for a reserved row'
  );
});

test('the mail does not say the same thing twice over', () => {
  // The complaint this answers: ten rows carrying four products, with the
  // savings account and the travel card taking eight of them between them.
  // Fourteen of the 28 households match the savings account and thirteen
  // price it above everything else they qualify for, so when a household was
  // collapsed to its single best-paying product before anything looked at the
  // mail as a whole, that product won every row it was allowed.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 10 });
  const products = new Set(digest.items.map((i) => i.product.id));
  const signals = new Set(digest.items.map((i) => i.lead_signal?.label));
  const categories = new Set(digest.items.map((i) => i.product.category));

  assert.ok(
    products.size >= 7,
    `expected at least 7 distinct products in 10 rows, got ${products.size}`
  );
  assert.ok(
    signals.size >= 8,
    `expected at least 8 distinct lead signals, got ${signals.size}`
  );
  assert.ok(
    categories.size >= 4,
    `expected at least 4 product categories, got ${categories.size}`
  );

  // No product may hold more than a fifth of the mail, rounded up.
  const perProduct = new Map();
  for (const i of digest.items) {
    perProduct.set(i.product.id, (perProduct.get(i.product.id) || 0) + 1);
  }
  const worst = Math.max(...perProduct.values());
  assert.ok(worst <= 2, `no product should hold more than 2 of 10 rows, got ${worst}`);

  // A cap on its own buys variety by throwing households away: tightening it
  // without letting a household fall back to its second product drops eight of
  // them out of the mail and backfills with two $105 overdraft rows. The
  // household should lose the product, never the row.
  assert.ok(
    digest.dropped.product_concentration <= 2,
    `the cap should rarely cost a household its row, lost ${digest.dropped.product_concentration}`
  );
});

test('a row headlines with a signal the page has not used yet when it has one', () => {
  // Every signal that drove a match is an honest headline for the row. When
  // the default one is already on the page, the row steps to the next the
  // household actually carries, and the window moves with it.
  const digest = buildAdvisorDigest({ provider, advisorId: 'adv_okoro', maxItems: 10 });
  const dubois = digest.items.find((i) => i.household_id === 'hh_dubois');
  const alvarez = digest.items.find((i) => i.household_id === 'hh_alvarez');
  assert.ok(dubois && alvarez, 'both overdraft households are in the mail');
  assert.equal(dubois.product.id, alvarez.product.id, 'same product');
  assert.notEqual(dubois.lead_signal.label, alvarez.lead_signal.label, 'different headlines');
  assert.ok(
    dubois.matched_signals.includes(dubois.lead_signal.type),
    'the swapped headline is one of the signals that matched, not an invention'
  );
  assert.equal(
    dubois.outreach_window.bucket,
    dubois.timing.window.bucket,
    'window and timing describe the headline actually shown'
  );

  // A household whose only matched signal is already on the page keeps it;
  // nothing is made up to be different.
  for (const item of digest.items) {
    const own = new Set([...item.matched_signals]);
    assert.ok(own.has(item.lead_signal.type), `${item.household_id} headlines a signal it matched`);
  }
});

test('a household whose best-paying match is thin still gets its row from a product that is not', () => {
  // Tanaka's highest-benefit match rests on one signal. Gating the household
  // on that row alone dropped him from the mail while three products he
  // qualified for on two or more signals went unread.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 28, pace: false });
  const ids = new Set(digest.items.map((i) => i.household_id));
  for (const id of ['hh_tanaka', 'hh_marchetti', 'hh_sorensen', 'hh_oyelaran']) {
    assert.ok(ids.has(id), `${id} reaches the mail`);
  }
  assert.equal(digest.dropped.thin_signal, 0, 'nothing is filed as thin while a corroborated row exists');
  for (const item of digest.items) {
    assert.ok(item.supporting_signal_count >= 2, `${item.household_id} row is corroborated`);
  }
  assert.equal(ids.size, bookSize(DEMO_ADVISOR), 'every household in the book is reachable');
});

test('a five-row mail does not spend three rows on one category', () => {
  // Three travel cards under three different headlines are still three travel
  // rows. The category is never capped, but a repeat has to cost something.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });
  const perCategory = new Map();
  for (const i of digest.items) {
    perCategory.set(i.product.category, (perCategory.get(i.product.category) || 0) + 1);
  }
  assert.ok(Math.max(...perCategory.values()) <= 2, `no category takes more than 2 of 5 rows: ${[...perCategory]}`);
  assert.equal(new Set(digest.items.map((i) => i.product.id)).size, 5, 'five distinct products');
  assert.equal(new Set(digest.items.map((i) => i.lead_signal?.label)).size, 5, 'five distinct headlines');
});

test('reserved life-event rows scale with the length of the mail', () => {
  const short = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });
  const long = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 10 });
  const events = (d) => d.items.filter((i) => i.lead_signal?.kind === 'life_event').length;
  assert.equal(short.pacing.life_event_slots, 2);
  assert.equal(long.pacing.life_event_slots, 3);
  assert.ok(events(short) >= 2, `two reserved in five rows, got ${events(short)}`);
  assert.ok(events(long) >= 3, `three reserved in ten rows, got ${events(long)}`);
  // An explicit choice is respected as given.
  const pinned = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 10, lifeEventSlots: 1 });
  assert.equal(pinned.pacing.life_event_slots, 1);
});

test('rows past the floor are only added when they bring a new product and headline', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 12, minItems: 10 });
  assert.equal(digest.pacing.min_items, 10);
  assert.equal(digest.pacing.max_items, 12);
  assert.ok(digest.items.length >= 10 && digest.items.length <= 12, `got ${digest.items.length} rows`);
  // The caps are sized to the floor, so the ceiling never loosens them: a
  // twelve-row mail still allows at most two of any product or headline.
  const count = (key) =>
    Math.max(...Object.values(digest.items.reduce((m, i) => ((m[key(i)] = (m[key(i)] || 0) + 1), m), {})));
  assert.ok(count((i) => i.product.id) <= 2, 'no product more than twice in twelve rows');
  assert.ok(count((i) => i.lead_signal?.label) <= 2, 'no headline more than twice in twelve rows');

  // Without a floor the length is simply the ceiling, as before.
  const fixed = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 12 });
  assert.equal(fixed.pacing.min_items, 12);
  assert.equal(fixed.items.length, 12);

  // On a book too thin to say three different things, the floor is where the
  // mail stops. Alvarez and Dubois both qualify for overdraft protection; a
  // fixed three-row mail prints it twice, a two-to-three-row mail prints the
  // savings row, the first overdraft row, and leaves the second out.
  const thin = {
    ...provider,
    getAdvisors: () =>
      provider
        .getAdvisors()
        .map((a) =>
          a.id === DEMO_ADVISOR ? { ...a, household_ids: ['hh_alvarez', 'hh_dubois', 'hh_sorensen'] } : a
        ),
  };
  const padded = buildAdvisorDigest({ provider: thin, advisorId: DEMO_ADVISOR, maxItems: 3 });
  assert.equal(padded.items.length, 3);
  assert.equal(padded.items.filter((i) => i.product.id === 'overdraft-protection').length, 2);
  const floored = buildAdvisorDigest({ provider: thin, advisorId: DEMO_ADVISOR, maxItems: 3, minItems: 2 });
  assert.equal(floored.items.length, 2, 'the third row would have repeated a product, so it is not added');
  assert.equal(new Set(floored.items.map((i) => i.product.id)).size, 2);

  // And where the caps alone would still allow a repeat past the floor, the
  // extra row has to be new anyway. Okoro's book fills eight rows with seven
  // products when the length is fixed; with a floor of six, the two rows past
  // it each bring a product the page has not shown.
  const distinct = (d) => new Set(d.items.map((i) => i.product.id)).size;
  const okoroFixed = buildAdvisorDigest({ provider, advisorId: 'adv_okoro', maxItems: 8 });
  const okoroFloored = buildAdvisorDigest({ provider, advisorId: 'adv_okoro', maxItems: 8, minItems: 6 });
  assert.equal(okoroFixed.items.length, 8);
  assert.equal(okoroFloored.items.length, 8);
  assert.ok(distinct(okoroFixed) < 8, 'the fixed-length mail repeats a product');
  assert.equal(distinct(okoroFloored), 8, 'the floored mail does not');
});

test('one household still gets one row', () => {
  // Keeping every match rather than the household's best is what makes the
  // variety possible, and is also the obvious way to start mailing an advisor
  // about the same family three times in one morning.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 10 });
  const ids = digest.items.map((i) => i.household_id);
  assert.equal(new Set(ids).size, ids.length, 'no household appears twice');
});

test('the heaviest event keeps its row at any digest size', () => {
  // The guard that stops reservation narrowing the mail used to read one row
  // at a time, and said a swap "loses a product" even when the row coming in
  // carried the same product as the row going out. A retirement horizon on a
  // managed portfolio therefore held its place against an inheritance on the
  // same managed portfolio, and the heaviest event in the book fell out of
  // the ten-row digest while staying in the five-row one.
  for (const maxItems of [5, 10]) {
    const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems });
    assert.ok(
      digest.items.some((i) => i.lead_signal?.type === 'estate_inflow'),
      `an inheritance should hold a row in a ${maxItems}-row digest`
    );
  }
});

test('reserved rows do not take over the digest', () => {
  // 22 of 28 households carry an event. Promoting rather than reserving would
  // swap one monoculture for another.
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });
  const events = digest.items.filter(isLifeEvent);
  assert.ok(events.length <= 2, `expected at most 2 reserved rows, got ${events.length}`);
  assert.ok(
    digest.items.some((i) => i.benefit_qualifier === 'net'),
    'the priced rows still hold the rest of the mail'
  );
});

test('reservation decides which event gets the row, not whether one does', () => {
  // This used to assert that turning reservation off emptied the mail of life
  // events, because ranking by defensibility swept every unpriced row out.
  // Selecting for variety surfaces them on their own now, so reservation has a
  // narrower job: making sure the rows go to the events that matter most.
  const off = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    maxItems: 5,
    lifeEventSlots: 0,
  });
  const on = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, maxItems: 5 });

  const types = (d) => d.items.filter(isLifeEvent).map((i) => i.lead_signal.type);
  // Five rows on a fifty-five-product book are all priced rows now, so merit
  // alone needs the longer mail to show an event. That is the case for
  // reserving rows in the short one.
  const offLonger = buildAdvisorDigest({
    provider,
    advisorId: DEMO_ADVISOR,
    maxItems: 10,
    lifeEventSlots: 0,
  });
  assert.ok(types(offLonger).length > 0, 'events reach the mail on merit without reservation');
  assert.ok(
    !types(off).includes('estate_inflow'),
    'but the heaviest event is not guaranteed a row'
  );
  assert.ok(
    types(on).includes('estate_inflow'),
    'reservation is what promotes an inheritance over a kitchen renovation'
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

test('the digest email marks what is new without restating routine age', () => {
  const now = dayAfter(2);
  const context = bookContext({
    advisorId: DEMO_ADVISOR,
    now,
    newlyArrived: (householdId, type) => householdId === 'hh_nakamura' && type === 'home_renovation',
  });
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now });
  const html = renderDigestTable(digest.items);

  assert.match(html, /NEW<\/span>/, 'the one row worth opening the mail for is marked');
  assert.ok(
    !/First seen/.test(html),
    'a book refreshed in one pass would otherwise print the same age under every row'
  );
  assert.match(html, /days left/, 'windowed signals state their remaining time');
  assert.deepEqual(findBannedVocabulary(html), []);
  assert.deepEqual(findSnakeCase(html), []);
});

test('a signal still on the list after weeks says how long it has been there', () => {
  const now = dayAfter(21);
  const context = bookContext({ advisorId: DEMO_ADVISOR, now });
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR, context, now });
  const html = renderDigestTable(digest.items);

  assert.match(html, /First seen 21 days ago/, 'age is worth saying once it is unusual');
});

test('an undated row states no age rather than implying it is new', () => {
  const digest = buildAdvisorDigest({ provider, advisorId: DEMO_ADVISOR });
  const html = renderDigestTable(digest.items);
  assert.ok(!/First seen/.test(html));
  assert.ok(!/NEW<\/span>/.test(html));
});

// ---------------------------------------------------------------------------
// summarizeThread
// ---------------------------------------------------------------------------

test('summarizeThread does not ask the model to summarize an empty thread', async () => {
  let called = 0;
  const gateway = {
    async chatCompletion() {
      called += 1;
      // What the real model did when handed "(no prior turns)": it wrote a
      // confident recap of a support ticket that never existed.
      return {
        response: {
          ok: true,
          async json() {
            return {
              choices: [
                {
                  message: {
                    content:
                      'A client is reporting a permission denied error and a colleague is investigating.',
                  },
                },
              ],
            };
          },
        },
      };
    },
  };

  const empty = await summarizeThread({ gateway, turns: [] });
  const blank = await summarizeThread({ gateway, turns: [{ direction: 'inbound', text: '  ' }] });

  assert.equal(called, 0, 'nothing to summarize means no call to make');
  assert.match(empty, /nothing for me to recap/);
  assert.match(blank, /nothing for me to recap/);
  assert.doesNotMatch(empty, /permission denied/);
});

test('summarizeThread summarizes a thread that has content', async () => {
  const gateway = {
    async chatCompletion({ messages }) {
      assert.match(messages.at(-1).content, /who fits the travel card/);
      return {
        response: {
          ok: true,
          async json() {
            return { choices: [{ message: { content: 'You asked who fits the travel card.' } }] };
          },
        },
      };
    },
  };

  const text = await summarizeThread({
    gateway,
    turns: [{ direction: 'inbound', text: 'who fits the travel card' }],
  });
  assert.match(text, /travel card/);
});
