// backend/shared/coworker/benefit.mjs
//
// Annual benefit for a household/product pair.
//
// Two modes, and the difference is visible to the reader:
//
//   computed  - derived from this household's own transactions run against the
//               product's published rate card, net of what they already earn on
//               the card they hold today, net of the annual fee, with quarterly
//               caps applied. Reported as a point number, because it is
//               arithmetic and an advisor can check it.
//
//   estimated - a transparent heuristic for products where the benefit depends
//               on facts we do not hold (how much of an idle balance actually
//               moves, what rate underwriting returns). Reported as a range,
//               because false precision on an assumption is worse than an
//               honest band.
//
// A third outcome matters as much as the first two: when a household's current
// card is held somewhere else, we cannot state a net figure at all. Rather than
// quietly treating their current earn as zero and overstating the gain, the
// baseline is marked unknown and only the gross is reported.
//
// Pure functions. No I/O, no model calls, no clock.

/**
 * Debits that move money rather than consume it. Distinct from the catalog's
 * card_ineligible list, which is about what earns rewards: rent is consumption
 * even though it earns nothing, while a transfer to savings is neither. Any
 * answer to "what does this household spend on" that ranks savings transfers
 * near the top is useless to an advisor.
 */
export const NON_CONSUMPTION_SUBCATEGORIES = [
  'Savings & Deposits',
  'Investments',
  'Transfers',
  'Loan Payments',
  'Banking Fees',
  'Income & Payroll',
];

/** Calendar-quarter key for a YYYY-MM-DD date string, e.g. "2026-Q1". */
function quarterOf(dateStr) {
  const [year, month] = String(dateStr || '').split('-').map(Number);
  if (!year || !month) return 'unknown';
  return `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
}

/**
 * Split a household's debit transactions into card-earn categories, tracking
 * per-quarter totals so quarterly caps can be applied where they actually bind.
 *
 * @param {object[]} transactions
 * @param {object} spendCategories  the catalog's spend_categories block
 * @returns {{byCategory: Record<string,{total:number,byQuarter:Record<string,number>}>, ineligibleTotal:number, cardEligibleTotal:number}}
 */
export function spendProfile(transactions = [], spendCategories = {}) {
  const ineligible = new Set(spendCategories.card_ineligible?.subcategories || []);
  const categoryOf = new Map();
  for (const [name, subcats] of Object.entries(spendCategories)) {
    if (!Array.isArray(subcats)) continue; // skips `note` and `card_ineligible`
    for (const sub of subcats) categoryOf.set(sub, name);
  }

  const byCategory = {};
  let ineligibleTotal = 0;
  let cardEligibleTotal = 0;

  const bump = (category, quarter, amount) => {
    const entry = (byCategory[category] ||= { total: 0, byQuarter: {} });
    entry.total = round2(entry.total + amount);
    entry.byQuarter[quarter] = round2((entry.byQuarter[quarter] || 0) + amount);
  };

  for (const t of transactions) {
    if (t.direction !== 'debit') continue;
    const amount = Number(t.amount) || 0;
    if (amount <= 0) continue;
    if (ineligible.has(t.subcategory)) {
      ineligibleTotal = round2(ineligibleTotal + amount);
      continue;
    }
    cardEligibleTotal = round2(cardEligibleTotal + amount);
    bump(categoryOf.get(t.subcategory) || 'other', quarterOf(t.date), amount);
  }

  return { byCategory, ineligibleTotal, cardEligibleTotal };
}

/**
 * What a household earns today on the card they already hold, over the same
 * spend base.
 *
 * When we do not hold their card we do NOT treat their current earn as zero.
 * A household putting $70k a year on plastic is almost certainly earning
 * something on a card somewhere, and assuming otherwise inflates the gain by
 * the full gross. The baseline comes back unknown instead, and the caller
 * reports gross with the gap stated rather than a net it cannot support.
 *
 * @returns {{known:true, name:string, rate_pct:number, earn_usd:number, fee_usd:number}|{known:false, reason:string}}
 */
export function currentCardEarn({ household, incumbents = {}, profile }) {
  const held = household?.relationship?.products_held || [];
  const heldCardId = held.find((id) => incumbents[id]);

  if (!heldCardId) {
    return {
      known: false,
      reason:
        'We do not hold their day-to-day card, so we cannot see what they earn on this spend today.',
    };
  }

  const card = incumbents[heldCardId];
  const flatRate = (card.earn || []).find((e) => (e.categories || []).includes('*'));
  const rate = Number(flatRate?.rate_pct) || 0;
  return {
    known: true,
    name: card.name,
    rate_pct: rate,
    earn_usd: round2((profile.cardEligibleTotal * rate) / 100),
    fee_usd: Number(card.annual_fee_usd) || 0,
  };
}

/**
 * Annual benefit of a cash-back card, computed from the household's own ledger.
 *
 * Bonus categories share a quarterly spend cap: spend inside the cap earns the
 * bonus rate, spend beyond it drops to the base rate. This is where the honest
 * number diverges most from a flat percentage, and where an advisor is most
 * likely to be challenged, so the cap is applied per calendar quarter against
 * that quarter's actual spend rather than annualized.
 */
export function computeCardBenefit({ product, household, transactions, catalog }) {
  const terms = product.terms || {};
  const spendCategories = catalog?.spend_categories || {};
  const incumbents = catalog?.incumbents || {};
  const profile = spendProfile(transactions, spendCategories);

  const baseRate = Number(terms.base_rate_pct) || 0;
  const fee = Number(terms.annual_fee_usd) || 0;

  // Group the bonus tiers by the cap they share, so travel and dining compete
  // for one combined quarterly allowance the way a real rate card works.
  const capsByGroup = new Map((terms.caps || []).map((c) => [c.group, c]));
  const groups = new Map();
  for (const tier of terms.earn || []) {
    const key = tier.cap_group || `__uncapped_${tier.label}`;
    const group = groups.get(key) || {
      cap: capsByGroup.get(tier.cap_group) || null,
      rate_pct: Number(tier.rate_pct) || 0,
      labels: [],
      byQuarter: {},
      total: 0,
    };
    group.labels.push(tier.label);
    for (const category of tier.categories || []) {
      const entry = profile.byCategory[category];
      if (!entry) continue;
      group.total = round2(group.total + entry.total);
      for (const [quarter, amount] of Object.entries(entry.byQuarter)) {
        group.byQuarter[quarter] = round2((group.byQuarter[quarter] || 0) + amount);
      }
    }
    groups.set(key, group);
  }

  const lines = [];
  let bonusSpend = 0;
  let grossEarn = 0;
  let capBinding = false;

  for (const group of groups.values()) {
    const capPerPeriod = Number(group.cap?.spend_usd_per_period) || Infinity;
    let atBonus = 0;
    let overflow = 0;
    for (const amount of Object.values(group.byQuarter)) {
      const eligible = Math.min(amount, capPerPeriod);
      atBonus = round2(atBonus + eligible);
      overflow = round2(overflow + (amount - eligible));
    }
    if (overflow > 0) capBinding = true;
    bonusSpend = round2(bonusSpend + group.total);

    const bonusEarn = round2((atBonus * group.rate_pct) / 100);
    const overflowEarn = round2((overflow * baseRate) / 100);
    grossEarn = round2(grossEarn + bonusEarn + overflowEarn);

    lines.push({
      label: group.labels.join(' and '),
      spend_usd: group.total,
      rate_pct: group.rate_pct,
      spend_at_bonus_usd: atBonus,
      spend_at_base_usd: overflow,
      earned_usd: round2(bonusEarn + overflowEarn),
      cap_label: group.cap?.label || null,
    });
  }

  const otherSpend = round2(Math.max(0, profile.cardEligibleTotal - bonusSpend));
  const otherEarn = round2((otherSpend * baseRate) / 100);
  grossEarn = round2(grossEarn + otherEarn);
  lines.push({
    label: 'Everything else',
    spend_usd: otherSpend,
    rate_pct: baseRate,
    spend_at_bonus_usd: 0,
    spend_at_base_usd: otherSpend,
    earned_usd: otherEarn,
    cap_label: null,
  });

  const current = currentCardEarn({ household, incumbents, profile });

  if (!current.known) {
    return {
      mode: 'computed',
      baseline: 'unknown',
      product_id: product.id,
      gross_usd: grossEarn,
      current_usd: null,
      fee_usd: fee,
      net_usd: null,
      lines,
      cap_binding: capBinding,
      card_eligible_spend_usd: profile.cardEligibleTotal,
      basis: `${grossEarn ? `$${fmt(grossEarn)} gross cash back` : 'No measurable cash back'} on $${fmt(profile.cardEligibleTotal)} of card spend over the last 12 months, before the $${fmt(fee)} annual fee. ${current.reason} We cannot state a net gain without it.`,
    };
  }

  const net = round2(grossEarn - current.earn_usd - fee + current.fee_usd);
  return {
    mode: 'computed',
    baseline: 'known',
    product_id: product.id,
    gross_usd: grossEarn,
    current_usd: current.earn_usd,
    current_card: current.name,
    fee_usd: fee,
    net_usd: net,
    lines,
    cap_binding: capBinding,
    card_eligible_spend_usd: profile.cardEligibleTotal,
    basis: buildCardBasis({ grossEarn, current, fee, net, profile, capBinding, lines }),
  };
}

function buildCardBasis({ grossEarn, current, fee, net, profile, capBinding }) {
  const parts = [
    `$${fmt(grossEarn)} cash back on $${fmt(profile.cardEligibleTotal)} of card spend over the last 12 months`,
  ];
  parts.push(
    current.earn_usd > 0
      ? `less the $${fmt(current.earn_usd)} they already earn on the ${current.name} at ${current.rate_pct}%`
      : 'and they earn nothing on card spend with us today'
  );
  parts.push(`less the $${fmt(fee)} annual fee, so $${fmt(net)} net`);
  const capNote = capBinding
    ? ' Travel and dining spend runs past the quarterly bonus cap, so the spend above it is credited at the base rate.'
    : '';
  return `${parts.join(', ')}.${capNote}`;
}

/**
 * Transparent heuristic benefit for products whose value depends on facts we do
 * not hold. Every branch states its assumption, and the caller renders these as
 * ranges so the imprecision is visible.
 */
export function estimateBenefit({ product, signals }) {
  const terms = product.terms || {};
  const fin = signals?.financial || {};
  const idle = Number(fin.idle_cash_usd) || 0;

  switch (terms.kind) {
    case 'deposit_apy': {
      const apy = Number(terms.apy_pct) || 0;
      const baseline = Number(terms.baseline_apy_pct) || 0;
      return {
        mode: 'estimated',
        usd: round2((idle * (apy - baseline)) / 100),
        assumption: `Assumes the $${fmt(idle)} currently sitting uninvested moves across and stays put for a year, earning ${apy}% instead of about ${baseline}%.`,
      };
    }
    case 'advisory_fee': {
      // Deliberately not dollarized. The only way to put an annual figure on
      // advice is to assume a return, and a five-figure number resting on an
      // assumed return is the least defensible thing we could hand an advisor.
      // State the balance actually at stake, which is a fact, and let the
      // advisor have the returns conversation.
      return {
        mode: 'estimated',
        usd: 0,
        outcome: idle
          ? `$${fmt(idle)} sitting in cash to put to work`
          : 'Portfolio consolidation conversation',
        assumption: `The balance shown is what the household currently holds in cash. We do not put an annual dollar figure on advice, because that would require assuming a return. The advisory fee is ${terms.advisory_fee_pct}%.`,
      };
    }
    case 'loan_refinance': {
      const balance = Number(fin.student_loan_balance_usd) || 0;
      const currentRate = Number(fin.student_loan_rate_pct) || 0;
      const target = Number(terms.target_rate_pct) || 0;
      if (!balance || currentRate <= target) {
        return {
          mode: 'estimated',
          usd: 0,
          assumption: 'No interest saving to estimate at their current rate.',
        };
      }
      return {
        mode: 'estimated',
        usd: round2((balance * (currentRate - target)) / 100),
        assumption: `First-year interest difference on the $${fmt(balance)} balance if it moves from ${currentRate}% to about ${target}%. The rate they are offered depends on their credit profile.`,
      };
    }
    case 'fee_avoidance': {
      const avoided = Number(terms.avoided_fee_usd) || 0;
      const events = (signals?.risk || []).filter((r) => r.type === 'nsf_overdraft_cluster').length;
      return {
        mode: 'estimated',
        usd: round2(avoided * (events ? 3 : 0)),
        assumption: events
          ? `Assumes the three overdraft and returned-item charges on file in the last 60 days would have been avoided at $${fmt(avoided)} each.`
          : 'No overdraft charges on file, so there is no fee saving to estimate.',
      };
    }
    default:
      return {
        mode: 'estimated',
        usd: 0,
        outcome: 'Planning and protection conversation',
        assumption:
          'The value here is planning or protection rather than a dollar figure, so we do not put a number on it.',
      };
  }
}

/**
 * Dispatch to the computed or estimated path. Callers should branch on
 * `mode` and `baseline`, never assume a `net_usd` is present.
 */
export function benefitFor({ product, household, signals, transactions, catalog }) {
  if (product?.terms?.kind === 'card_cash_back') {
    return computeCardBenefit({ product, household, transactions, catalog });
  }
  return estimateBenefit({ product, signals });
}

/**
 * How a benefit should be presented, in descending order of how well it holds
 * up to being questioned:
 *
 *   net      - computed from their ledger, net of current earn and fee. A point
 *              number, because it is arithmetic.
 *   gross    - computed, but we cannot see their current card, so no net.
 *   estimate - rests on an assumption. Shown as a range.
 *   outcome  - no defensible dollar figure exists. Shown as a phrase.
 */
export function headlineBenefit(benefit) {
  if (!benefit) return null;
  if (benefit.mode === 'computed') {
    if (benefit.baseline === 'unknown') {
      return { usd: benefit.gross_usd, precision: 'point', qualifier: 'gross' };
    }
    return { usd: benefit.net_usd, precision: 'point', qualifier: 'net' };
  }
  if (benefit.usd) {
    return { usd: benefit.usd, precision: 'range', qualifier: 'estimate' };
  }
  if (benefit.outcome) {
    return { usd: 0, precision: 'none', qualifier: 'outcome', outcome: benefit.outcome };
  }
  return null;
}

/** Presentation rank for a headline, lower is more defensible. */
export function benefitRank(qualifier) {
  return { net: 0, gross: 1, estimate: 2, outcome: 3 }[qualifier] ?? 4;
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function fmt(n) {
  return Math.round(Number(n) || 0).toLocaleString('en-US');
}
