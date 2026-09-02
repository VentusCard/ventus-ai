#!/usr/bin/env node
//
// Regenerates backend/shared/coworker/fixtures/transactions.json.
//
// Why a generator instead of hand-authored JSON: the Coworker now computes
// annual card benefit from a household's own transactions against a published
// rate card, including quarterly caps. That arithmetic is only credible over a
// full trailing year, and a full year of hand-written transactions is neither
// reviewable nor consistent with the totals quoted in signals.json.
//
// The generator is deterministic (seeded PRNG, no Date.now, no Math.random), so
// re-running it on an unchanged profile produces a byte-identical fixture and
// the committed file stays the reviewable artifact.
//
// Each household profile states annual spend targets per earn category. The
// generator distributes those targets across the window as discrete, merchant-
// attributed transactions and asserts the realized totals land within 2% of
// target, so signals.json evidence strings and the computed benefit cannot
// silently drift apart.
//
// Usage: node backend/scripts/generate-coworker-transactions.mjs

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'shared',
  'coworker',
  'fixtures',
  'transactions.json'
);

// Aligned to calendar quarters on purpose. The card benefit calculator applies
// a per-calendar-quarter bonus cap, so a window that straddles five partial
// quarters would hand the household five quarters of cap allowance inside one
// year and overstate the benefit.
const WINDOW_START = '2025-07-01';
const WINDOW_END = '2026-06-30';

// --- deterministic PRNG ------------------------------------------------------

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable 32-bit seed from a string so each household's stream is independent. */
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// --- merchant pools ----------------------------------------------------------

const POOLS = {
  flights: {
    pillar: 'Travel & Exploration',
    subcategory: 'Flights',
    mcc_code: '4511',
    merchants: [
      ['DELTA AIR LINES', 'Delta Air Lines'],
      ['UNITED AIRLINES', 'United Airlines'],
      ['AMERICAN AIRLINES', 'American Airlines'],
      ['ALASKA AIRLINES', 'Alaska Airlines'],
      ['LUFTHANSA', 'Lufthansa'],
      ['BRITISH AIRWAYS', 'British Airways'],
      ['JETBLUE', 'JetBlue'],
    ],
  },
  lodging: {
    pillar: 'Travel & Exploration',
    subcategory: 'Hotels & Lodging',
    mcc_code: '7011',
    merchants: [
      ['MARRIOTT', 'Marriott'],
      ['HILTON HOTELS', 'Hilton'],
      ['AIRBNB', 'Airbnb'],
      ['HYATT REGENCY', 'Hyatt'],
      ['FOUR SEASONS', 'Four Seasons'],
      ['KIMPTON HOTELS', 'Kimpton'],
    ],
  },
  activities: {
    pillar: 'Travel & Exploration',
    subcategory: 'Tours & Activities',
    mcc_code: '7991',
    merchants: [
      ['VIATOR', 'Viator'],
      ['GETYOURGUIDE', 'GetYourGuide'],
      ['NATL PARK SERVICE', 'National Park Service'],
      ['TRIPADVISOR EXP', 'Tripadvisor Experiences'],
    ],
  },
  transit: {
    pillar: 'Travel & Exploration',
    subcategory: 'Rideshare & Transit',
    mcc_code: '4121',
    merchants: [
      ['UBER TRIP', 'Uber'],
      ['LYFT RIDE', 'Lyft'],
      ['AMTRAK', 'Amtrak'],
      ['HERTZ RENT A CAR', 'Hertz'],
    ],
  },
  dining: {
    pillar: 'Food & Dining',
    subcategory: 'Dining Out',
    mcc_code: '5812',
    merchants: [
      ['SWEETGREEN', 'Sweetgreen'],
      ['CHIPOTLE', 'Chipotle'],
      ['OSTERIA MOZZA', 'Osteria Mozza'],
      ['THE CAPITAL GRILLE', 'The Capital Grille'],
      ['SHAKE SHACK', 'Shake Shack'],
      ['NOBU', 'Nobu'],
      ['LOCAL BISTRO', 'Local Bistro'],
      ['DOORDASH', 'DoorDash'],
    ],
  },
  coffee: {
    pillar: 'Food & Dining',
    subcategory: 'Coffee & Cafes',
    mcc_code: '5814',
    merchants: [
      ['STARBUCKS', 'Starbucks'],
      ['BLUE BOTTLE COFFEE', 'Blue Bottle Coffee'],
      ['PEETS COFFEE', "Peet's Coffee"],
      ['LOCAL ROASTERS', 'Local Roasters'],
    ],
  },
  grocery: {
    pillar: 'Food & Dining',
    subcategory: 'Grocery',
    mcc_code: '5411',
    merchants: [
      ['WHOLE FOODS MKT', 'Whole Foods Market'],
      ['TRADER JOES', "Trader Joe's"],
      ['SAFEWAY', 'Safeway'],
      ['H-E-B', 'H-E-B'],
      ['KROGER', 'Kroger'],
    ],
  },
  household: {
    pillar: 'Home & Living',
    subcategory: 'Household Supplies',
    mcc_code: '5200',
    merchants: [
      ['TARGET', 'Target'],
      ['COSTCO WHSE', 'Costco'],
      ['AMAZON.COM', 'Amazon'],
      ['THE CONTAINER STORE', 'The Container Store'],
    ],
  },
  utilities: {
    pillar: 'Home & Living',
    subcategory: 'Utilities',
    mcc_code: '4900',
    merchants: [
      ['CITY UTILITIES', 'City Utilities'],
      ['COMCAST XFINITY', 'Xfinity'],
      ['AT&T WIRELESS', 'AT&T'],
    ],
  },
  health: {
    pillar: 'Health & Wellness',
    subcategory: 'Medical & Doctor Visits',
    mcc_code: '8011',
    merchants: [
      ['CITY MEDICAL GROUP', 'City Medical Group'],
      ['CVS PHARMACY', 'CVS Pharmacy'],
      ['EQUINOX', 'Equinox'],
    ],
  },
  entertainment: {
    pillar: 'Entertainment & Culture',
    subcategory: 'Streaming & Media',
    mcc_code: '5815',
    merchants: [
      ['NETFLIX', 'Netflix'],
      ['SPOTIFY USA', 'Spotify'],
      ['TICKETMASTER', 'Ticketmaster'],
    ],
  },
  tech: {
    pillar: 'Technology & Digital Life',
    subcategory: 'Electronics',
    mcc_code: '5732',
    merchants: [
      ['APPLE STORE', 'Apple'],
      ['BEST BUY', 'Best Buy'],
      ['GOOGLE STORAGE', 'Google One'],
    ],
  },
};

// Which pools feed each earn category, and how the annual target splits across
// them. Shares must sum to 1 within a category.
const CATEGORY_MIX = {
  travel: [
    { pool: 'flights', share: 0.52, min: 320, max: 2200 },
    { pool: 'lodging', share: 0.33, min: 260, max: 1600 },
    { pool: 'activities', share: 0.08, min: 80, max: 500 },
    { pool: 'transit', share: 0.07, min: 28, max: 220 },
  ],
  dining: [
    { pool: 'dining', share: 0.86, min: 45, max: 420 },
    { pool: 'coffee', share: 0.14, min: 18, max: 75 },
  ],
  grocery: [{ pool: 'grocery', share: 1, min: 90, max: 420 }],
  // Spread across pillars deliberately. Concentrating non-category spend into
  // Home & Living made it outrank travel for households whose lead signal is
  // travel-heavy spend, which contradicts the signal on its face.
  other: [
    { pool: 'household', share: 0.24, min: 70, max: 950 },
    { pool: 'utilities', share: 0.12, min: 140, max: 620 },
    { pool: 'health', share: 0.2, min: 80, max: 950 },
    { pool: 'entertainment', share: 0.2, min: 45, max: 520 },
    { pool: 'tech', share: 0.24, min: 80, max: 1500 },
  ],
};

// --- household profiles ------------------------------------------------------
//
// annual: target debit spend per earn category, in dollars. These are the
// numbers signals.json quotes and the numbers the benefit calculator will see.
// payroll: monthly credit. recurring: fixed monthly debits. events: dated
// one-offs that carry a household's narrative (estate wire, renovation, birth).

const PROFILES = {
  hh_okafor: {
    annual: { travel: 18400, dining: 9200, grocery: 8600, other: 33400 },
    payroll: { merchant: 'ACME CORP PAYROLL', amount: 11800, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 214, day: 8 }],
    savings: { amount: 1500, day: 16 },
  },
  hh_bianchi: {
    annual: { travel: 2100, dining: 5400, grocery: 9100, other: 21600 },
    payroll: { merchant: 'DENVER HEALTH PAYROLL', amount: 7400, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 178, day: 6 }],
    savings: { amount: 1500, day: 17 },
    events: [
      { date: '2026-02-14', merchant: 'BUYBUY BABY', normalized: 'buybuy BABY', amount: 842.19, pillar: 'Family & Community', subcategory: 'Kids Activities', mcc_code: '5641' },
      { date: '2026-03-02', merchant: 'POTTERY BARN KIDS', normalized: 'Pottery Barn Kids', amount: 1284.5, pillar: 'Family & Community', subcategory: 'Furniture & Decor', mcc_code: '5712' },
      { date: '2026-03-19', merchant: 'WOMENS HEALTH OB', normalized: "Women's Health OB", amount: 310, pillar: 'Health & Wellness', subcategory: 'Medical & Doctor Visits', mcc_code: '8011' },
      { date: '2026-04-08', merchant: 'BIRTH & BEYOND COURSE', normalized: 'Birth & Beyond', amount: 265, pillar: 'Family & Community', subcategory: 'Childcare & Education', mcc_code: '8299' },
    ],
  },
  hh_nakamura: {
    annual: { travel: 4200, dining: 8800, grocery: 10400, other: 26800 },
    payroll: { merchant: 'NAKAMURA CONSULTING', amount: 24000, day: 1 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 388, day: 9 }],
    events: [
      { date: '2026-03-06', merchant: 'HOME DEPOT PRO', normalized: 'Home Depot', amount: 6820.44, pillar: 'Home & Living', subcategory: 'Home Improvement', mcc_code: '5211' },
      { date: '2026-03-27', merchant: 'FERGUSON PLUMBING', normalized: 'Ferguson', amount: 4310.9, pillar: 'Home & Living', subcategory: 'Home Improvement', mcc_code: '5074' },
      { date: '2026-04-15', merchant: 'MERIDIAN GENERAL CONTR', normalized: 'Meridian General Contracting', amount: 12500, pillar: 'Home & Living', subcategory: 'Home Improvement', mcc_code: '1520' },
      { date: '2026-05-11', merchant: 'ROOM & BOARD', normalized: 'Room & Board', amount: 4368.25, pillar: 'Home & Living', subcategory: 'Furniture & Decor', mcc_code: '5712' },
    ],
  },
  hh_alvarez: {
    annual: { travel: 900, dining: 4100, grocery: 5200, other: 11400 },
    gigPayroll: { merchant: 'GIG PLATFORM PAYOUT', min: 610, max: 2010, perMonth: 3 },
    recurring: [{ pool: 'utilities', merchant: 'AT&T WIRELESS', amount: 96, day: 12 }],
    events: [
      { date: '2026-04-03', merchant: 'OVERDRAFT FEE', normalized: 'Overdraft Fee', amount: 35, pillar: 'Financial & Aspirational', subcategory: 'Banking Fees', mcc_code: '6012' },
      { date: '2026-04-22', merchant: 'OVERDRAFT FEE', normalized: 'Overdraft Fee', amount: 35, pillar: 'Financial & Aspirational', subcategory: 'Banking Fees', mcc_code: '6012' },
      { date: '2026-05-09', merchant: 'NSF RETURNED ITEM', normalized: 'NSF Returned Item', amount: 30, pillar: 'Financial & Aspirational', subcategory: 'Banking Fees', mcc_code: '6012' },
      { date: '2026-05-16', merchant: 'DRAFTKINGS', normalized: 'DraftKings', amount: 250, pillar: 'Entertainment & Culture', subcategory: 'Gaming', mcc_code: '7995' },
    ],
  },
  hh_petrov: {
    annual: { travel: 3100, dining: 4800, grocery: 8900, other: 21200 },
    payroll: { merchant: 'RALEIGH TECH PAYROLL', amount: 9600, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 165, day: 7 }],
    savings: { amount: 3000, day: 18 },
    events: [
      { date: '2026-02-21', merchant: 'U-HAUL MOVING', normalized: 'U-Haul', amount: 1840.6, pillar: 'Home & Living', subcategory: 'Household Supplies', mcc_code: '4214' },
      { date: '2026-03-05', merchant: 'ZILLOW PREMIER', normalized: 'Zillow', amount: 49, pillar: 'Home & Living', subcategory: 'Professional Services', mcc_code: '6513' },
      { date: '2026-04-02', merchant: 'REDFIN', normalized: 'Redfin', amount: 39, pillar: 'Home & Living', subcategory: 'Professional Services', mcc_code: '6513' },
    ],
  },
  hh_sharma: {
    annual: { travel: 41200, dining: 16400, grocery: 14800, other: 92000 },
    payroll: { merchant: 'SHARMA HOLDINGS DISTR', amount: 41000, day: 1 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 512, day: 10 }],
    events: [
      { date: '2026-03-11', merchant: 'ESTATE SETTLEMENT WIRE', normalized: 'Estate Settlement', amount: 480000, direction: 'credit', pillar: 'Financial & Aspirational', subcategory: 'Transfers', mcc_code: '6012' },
      { date: '2026-03-18', merchant: 'HALLORAN ESTATE LAW', normalized: 'Halloran Estate Law', amount: 8400, pillar: 'Financial & Aspirational', subcategory: 'Professional Services', mcc_code: '8111' },
      { date: '2026-04-24', merchant: 'HERITAGE AUCTIONS', normalized: 'Heritage Auctions', amount: 18600, pillar: 'Entertainment & Culture', subcategory: 'Hobbies & Crafts', mcc_code: '5971' },
    ],
  },
  hh_delgado: {
    annual: { travel: 1400, dining: 3900, grocery: 6800, other: 14100 },
    payroll: { merchant: 'COLUMBUS SCHOOLS PAYROLL', amount: 5400, day: 15 },
    recurring: [
      { pool: 'utilities', merchant: 'CITY UTILITIES', amount: 142, day: 5 },
      { pool: 'loan', merchant: 'NELNET STUDENT LOAN', amount: 640, day: 20, pillar: 'Financial & Aspirational', subcategory: 'Loan Payments', mcc_code: '6012' },
    ],
    savings: { amount: 500, day: 16 },
  },
  hh_kim: {
    annual: { travel: 5600, dining: 7300, grocery: 11200, other: 59500 },
    payroll: { merchant: 'SILICON SYSTEMS PAYROLL', amount: 19400, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 296, day: 11 }],
    investing: { merchant: 'VANGUARD BUY', amount: 7000, day: 3 },
  },
  hh_whitfield: {
    annual: { travel: 34800, dining: 14600, grocery: 12400, other: 69200 },
    payroll: { merchant: 'WHITFIELD TRUST DISTR', amount: 22500, day: 1 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 342, day: 9 }],
    savings: { amount: 4000, day: 12 },
  },
  hh_castellanos: {
    annual: { travel: 11900, dining: 19300, grocery: 9600, other: 28400 },
    payroll: { merchant: 'STUDIO PRODUCTIONS PAYROLL', amount: 13200, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 238, day: 8 }],
    savings: { amount: 1200, day: 19 },
  },
  hh_oyelaran: {
    annual: { travel: 1800, dining: 5200, grocery: 6100, other: 12800 },
    payroll: { merchant: 'ATLANTA LOGISTICS PAYROLL', amount: 5900, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'AT&T WIRELESS', amount: 88, day: 14 }],
    savings: { amount: 900, day: 16 },
    investing: { merchant: 'BROKERAGE AUTO BUY', amount: 250, day: 4, startMonth: 4 },
  },
  hh_lindqvist: {
    annual: { travel: 22700, dining: 12100, grocery: 10100, other: 33900 },
    payroll: { merchant: 'NORTHERN MUTUAL PAYROLL', amount: 14100, day: 15 },
    recurring: [{ pool: 'utilities', merchant: 'CITY UTILITIES', amount: 226, day: 7 }],
    savings: { amount: 2200, day: 18 },
  },
};

// --- date helpers ------------------------------------------------------------

/** The 12 month starts in the window, as [year, monthIndex] pairs. */
function windowMonths() {
  const [sy, sm] = WINDOW_START.split('-').map(Number);
  const out = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(sy, sm - 1 + i, 1));
    out.push([d.getUTCFullYear(), d.getUTCMonth()]);
  }
  return out;
}

function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function iso(year, monthIndex, day) {
  const dim = daysInMonth(year, monthIndex);
  const d = Math.min(Math.max(1, day), dim);
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// --- generation --------------------------------------------------------------

/**
 * Spread an annual dollar target across the window as discrete transactions.
 *
 * Transaction count comes from the target divided by the pool's typical size,
 * so a household spending $1,400/yr on travel gets a few trips rather than a
 * monthly allocation too small to buy anything. Amounts are jittered weights
 * normalized back to the target, which keeps the realized total exact: the
 * benefit calculator reads these transactions, and the figures signals.json
 * quotes have to match what it computes.
 */
function generateCategory({ rnd, category, target, months }) {
  const mix = CATEGORY_MIX[category];
  const txns = [];
  if (!target || target <= 0) return txns;

  for (const slice of mix) {
    const sliceTarget = target * slice.share;
    if (sliceTarget < slice.min) continue;
    const pool = POOLS[slice.pool];

    const typical = (slice.min + slice.max) / 2;
    const count = Math.max(1, Math.round(sliceTarget / typical));

    // Jittered weights normalized so the amounts sum to sliceTarget exactly.
    const weights = Array.from({ length: count }, () => 0.6 + rnd() * 0.8);
    const weightSum = weights.reduce((a, b) => a + b, 0);

    let running = 0;
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const amount = isLast
        ? round2(sliceTarget - running)
        : round2((sliceTarget * weights[i]) / weightSum);
      running = round2(running + amount);
      if (amount <= 0) continue;

      const [year, monthIndex] = months[Math.floor(rnd() * months.length)];
      const [merchant, normalized] = pool.merchants[Math.floor(rnd() * pool.merchants.length)];
      txns.push({
        date: iso(year, monthIndex, 1 + Math.floor(rnd() * daysInMonth(year, monthIndex))),
        merchant_name: merchant,
        normalized_merchant: normalized,
        amount,
        direction: 'debit',
        pillar: pool.pillar,
        subcategory: pool.subcategory,
        mcc_code: pool.mcc_code,
      });
    }
  }

  // A slice whose share lands below the pool's minimum charge is skipped, which
  // would leave the category short of target. Absorb whatever is missing into
  // the largest transaction so the category total is exact.
  const realized = txns.reduce((a, t) => a + t.amount, 0);
  const residual = round2(target - realized);
  if (txns.length && Math.abs(residual) > 0.01) {
    const biggest = txns.reduce((a, b) => (b.amount > a.amount ? b : a));
    biggest.amount = round2(biggest.amount + residual);
  }
  return txns;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function generateHousehold(householdKey, profile) {
  const rnd = mulberry32(seedFrom(householdKey));
  const months = windowMonths();
  const txns = [];

  for (const category of ['travel', 'dining', 'grocery', 'other']) {
    txns.push(
      ...generateCategory({ rnd, category, target: profile.annual?.[category] || 0, months })
    );
  }

  // Fixed monthly payroll credit.
  if (profile.payroll) {
    months.forEach(([year, monthIndex]) => {
      txns.push({
        date: iso(year, monthIndex, profile.payroll.day),
        merchant_name: profile.payroll.merchant,
        normalized_merchant: titleize(profile.payroll.merchant),
        amount: round2(profile.payroll.amount * (0.98 + rnd() * 0.04)),
        direction: 'credit',
        pillar: 'Financial & Aspirational',
        subcategory: 'Income & Payroll',
        mcc_code: '6012',
      });
    });
  }

  // Irregular gig income: several payouts a month at unpredictable amounts.
  if (profile.gigPayroll) {
    const g = profile.gigPayroll;
    months.forEach(([year, monthIndex]) => {
      for (let i = 0; i < g.perMonth; i++) {
        txns.push({
          date: iso(year, monthIndex, 1 + Math.floor(rnd() * daysInMonth(year, monthIndex))),
          merchant_name: g.merchant,
          normalized_merchant: titleize(g.merchant),
          amount: round2(g.min + rnd() * (g.max - g.min)),
          direction: 'credit',
          pillar: 'Financial & Aspirational',
          subcategory: 'Income & Payroll',
          mcc_code: '6012',
        });
      }
    });
  }

  for (const rec of profile.recurring || []) {
    months.forEach(([year, monthIndex]) => {
      txns.push({
        date: iso(year, monthIndex, rec.day),
        merchant_name: rec.merchant,
        normalized_merchant: titleize(rec.merchant),
        amount: round2(rec.amount * (0.94 + rnd() * 0.12)),
        direction: 'debit',
        pillar: rec.pillar || POOLS[rec.pool]?.pillar || 'Home & Living',
        subcategory: rec.subcategory || POOLS[rec.pool]?.subcategory || 'Utilities',
        mcc_code: rec.mcc_code || POOLS[rec.pool]?.mcc_code || '4900',
      });
    });
  }

  if (profile.savings) {
    months.forEach(([year, monthIndex]) => {
      txns.push({
        date: iso(year, monthIndex, profile.savings.day),
        merchant_name: 'TRANSFER TO SAVINGS',
        normalized_merchant: 'Transfer to Savings',
        amount: profile.savings.amount,
        direction: 'debit',
        pillar: 'Financial & Aspirational',
        subcategory: 'Savings & Deposits',
        mcc_code: '6012',
      });
    });
  }

  if (profile.investing) {
    const inv = profile.investing;
    months.forEach(([year, monthIndex], i) => {
      if (inv.startMonth != null && i < inv.startMonth) return;
      txns.push({
        date: iso(year, monthIndex, inv.day),
        merchant_name: inv.merchant,
        normalized_merchant: titleize(inv.merchant),
        amount: inv.amount,
        direction: 'debit',
        pillar: 'Financial & Aspirational',
        subcategory: 'Investments',
        mcc_code: '6211',
      });
    });
  }

  for (const ev of profile.events || []) {
    txns.push({
      date: ev.date,
      merchant_name: ev.merchant,
      normalized_merchant: ev.normalized,
      amount: ev.amount,
      direction: ev.direction || 'debit',
      pillar: ev.pillar,
      subcategory: ev.subcategory,
      mcc_code: ev.mcc_code,
    });
  }

  txns.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const slug = householdKey.replace(/^hh_/, '');
  return txns.map((t, i) => ({
    transaction_id: `txn_${slug}_${String(i + 1).padStart(4, '0')}`,
    ...t,
  }));
}

function titleize(merchant) {
  return String(merchant)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// --- verification ------------------------------------------------------------

const SUBCATEGORY_TO_CATEGORY = {
  Flights: 'travel',
  'Hotels & Lodging': 'travel',
  'Tours & Activities': 'travel',
  'Rideshare & Transit': 'travel',
  'Dining Out': 'dining',
  'Coffee & Cafes': 'dining',
  Grocery: 'grocery',
};

/** Realized debit totals per earn category, to check against the profile target. */
function realizedTotals(txns) {
  const out = { travel: 0, dining: 0, grocery: 0 };
  for (const t of txns) {
    if (t.direction !== 'debit') continue;
    const cat = SUBCATEGORY_TO_CATEGORY[t.subcategory];
    if (cat) out[cat] += t.amount;
  }
  return out;
}

// Money moved rather than consumed. Mirrors NON_CONSUMPTION_SUBCATEGORIES in
// shared/coworker/benefit.mjs, which is what the runtime uses to rank spend.
const NON_CONSUMPTION = new Set([
  'Savings & Deposits',
  'Investments',
  'Transfers',
  'Loan Payments',
  'Banking Fees',
  'Income & Payroll',
]);

/** Consumption spend per pillar, used to check the ledger against the signals. */
function pillarTotals(txns) {
  const out = {};
  for (const t of txns) {
    if (t.direction !== 'debit') continue;
    if (NON_CONSUMPTION.has(t.subcategory)) continue;
    out[t.pillar] = (out[t.pillar] || 0) + t.amount;
  }
  return out;
}

// Households whose lead signal is travel-heavy spend. Their ledger has to back
// that up: if some other pillar outranks travel, the signal is contradicted by
// the very transactions it claims to be derived from, and that is exactly the
// kind of inconsistency a demo audience finds.
const TRAVEL_LED = new Set([
  'hh_okafor',
  'hh_sharma',
  'hh_whitfield',
  'hh_lindqvist',
]);

// --- main --------------------------------------------------------------------

/** Distinct calendar quarters the window covers. Must be exactly 4. */
function windowQuarters() {
  const quarters = new Set(
    windowMonths().map(([y, m]) => `${y}-Q${Math.floor(m / 3) + 1}`)
  );
  return [...quarters];
}

const quarters = windowQuarters();
if (quarters.length !== 4) {
  throw new Error(
    `Window ${WINDOW_START}..${WINDOW_END} spans ${quarters.length} calendar quarters (${quarters.join(', ')}). ` +
      'The card benefit calculator applies a per-calendar-quarter cap, so the window must cover exactly 4.'
  );
}

const transactions = {};
const report = [];

for (const [householdKey, profile] of Object.entries(PROFILES)) {
  const txns = generateHousehold(householdKey, profile);
  transactions[householdKey] = txns;

  const realized = realizedTotals(txns);
  for (const cat of ['travel', 'dining', 'grocery']) {
    const target = profile.annual?.[cat] || 0;
    if (!target) continue;
    const drift = Math.abs(realized[cat] - target) / target;
    if (drift > 0.02) {
      throw new Error(
        `${householdKey} ${cat}: realized $${realized[cat].toFixed(0)} drifts ${(drift * 100).toFixed(1)}% from target $${target}`
      );
    }
  }
  if (TRAVEL_LED.has(householdKey)) {
    const pillars = pillarTotals(txns);
    const top = Object.entries(pillars).sort((a, b) => b[1] - a[1])[0];
    if (top[0] !== 'Travel & Exploration') {
      throw new Error(
        `${householdKey} is described as travel-led but its largest pillar is ${top[0]} ($${Math.round(top[1])}) ahead of Travel & Exploration ($${Math.round(pillars['Travel & Exploration'] || 0)})`
      );
    }
  }

  report.push(
    `${householdKey.padEnd(16)} ${String(txns.length).padStart(4)} txns  travel $${Math.round(realized.travel).toLocaleString('en-US').padStart(7)}  dining $${Math.round(realized.dining).toLocaleString('en-US').padStart(7)}`
  );
}

const payload = {
  version: 2,
  note: `Full 12-month synthetic ledger per household covering ${WINDOW_START} through ${WINDOW_END}, which is exactly four completed calendar quarters. Generated deterministically by backend/scripts/generate-coworker-transactions.mjs; edit the profiles in that script and re-run rather than hand-editing this file. Annual category totals match the figures quoted in signals.json, because the Coworker computes card benefit from these transactions against the published rate card in product-catalog.json.`,
  window: { start: WINDOW_START, end: WINDOW_END, months: 12, quarters },
  transactions,
};

writeFileSync(OUT, `${JSON.stringify(payload, null, 1)}\n`);

const total = Object.values(transactions).reduce((a, t) => a + t.length, 0);
console.log(report.join('\n'));
console.log(`\n${total} transactions across ${Object.keys(transactions).length} households -> ${OUT}`);
