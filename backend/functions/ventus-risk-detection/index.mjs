// lambdas/analyze-risk-factors/index.mjs
// Triggered by SQS ventus-risk-queue
// Reads from transactions_enriched + transactions_raw
// → runs deterministic risk detection + model-routed AML analysis
// → writes to customer_risk_factors → fires risk_detected webhook if high severity

import { createDbFactory } from '../../shared/platform/db.mjs';
import { createModelGateway } from '../../shared/platform/model-gateway.mjs';
import { createSecretsProvider, resolveSecretId } from '../../shared/platform/secrets.mjs';
import { checkAndEmitBatchOutcome, markCustomerPipelineFailed } from '../../shared/platform/batch-outcome.mjs';
import { createWebhookDispatcher } from '../../shared/platform/webhooks.mjs';

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const MODEL_PROVIDER_SECRET_ID = resolveSecretId({
  envVar: 'MODEL_PROVIDER_SECRET_ID',
});
const getDbSecrets = createSecretsProvider({ secretId: DATABASE_SECRET_ID });
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
});
const modelGateway = createModelGateway({
  getSecrets: getModelSecrets,
  functionName: process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-risk-detection',
});

// ─── DB ───────────────────────────────────────────────────────────────────────
const getDB = createDbFactory({ getSecrets: getDbSecrets });

// ─── FIRE WEBHOOK ─────────────────────────────────────────────────────────────
const fireWebhook = createWebhookDispatcher({ includeUrlInFinalError: false });

// ─── FETCH TRANSACTIONS ───────────────────────────────────────────────────────
async function fetchTransactions(db, customerId) {
  const res = await db.query(
    `SELECT 
       te.transaction_id,
       te.customer_id,
       te.bank_id,
       te.clean_merchant_name AS merchant_name,
       te.amount,
       te.transaction_date AS date,
       te.zip_code,
       tr.mcc_code AS mcc,
       tr.home_zip
     FROM transactions_enriched te
     LEFT JOIN transactions_raw tr ON tr.transaction_id = te.transaction_id
     WHERE te.customer_id = $1
     ORDER BY te.transaction_date DESC`,
    [customerId]
  );
  return res.rows;
}

// ─── KEYWORD ARRAYS ───────────────────────────────────────────────────────────
const REAL_ESTATE_KEYWORDS = [
  'DOWN PAYMENT',
  'DOWNPAYMENT',
  'TITLE CO',
  'TITLE COMPANY',
  'ESCROW',
  'MORTGAGE',
  'INSPECTION',
  'HOME PURCHASE',
  'REAL ESTATE',
  'REALTY',
  'CLOSING COST',
  'EARNEST MONEY',
  'HOA',
  'PROPERTY TAX',
];

const INTL_KEYWORDS = [
  'INTL',
  'INTERNATIONAL',
  'FOREIGN',
  'OVERSEAS',
  'OFFSHORE',
];

const ADULT_STREAMING_KEYWORDS = [
  'ONLYFANS',
  'FENIX INTL',
  'FENIX INTERNATIONAL',
  'FANSLY',
  'MANYVIDS',
  'JUSTFORFANS',
  'MINDGEEK',
  'MG BILLING',
  'PORNHUB',
  'BRAZZERS',
  'ADULT TIME',
  'REALITY KINGS',
  'DIGITAL PLAYGROUND',
];
const ADULT_CAMSITE_KEYWORDS = [
  'CHATURBATE',
  'STRIPCHAT',
  'CAMSODA',
  'LIVEJASMIN',
  'BONGACAMS',
  'MYFREECAMS',
  'CAM4',
  'FLIRT4FREE',
  'STREAMATE',
];
const ADULT_PROCESSOR_KEYWORDS = [
  'CCBILL',
  'EPOCH.COM',
  'SEGPAY',
  'ROCKETGATE',
  'NETBILLING',
  'VENDO',
  'VERIFCARD',
  'PROBILLER',
];
const STRIP_CLUB_KEYWORDS = [
  'STRIP CLUB',
  'GENTLEMENS CLUB',
  "GENTLEMEN'S CLUB",
  'CABARET',
  'SPEARMINT RHINO',
  "RICK'S CABARET",
  'RICKS CABARET',
  'SAPPHIRE GENTLEMENS',
  'SCORES',
  'CRAZY HORSE',
  'PENTHOUSE CLUB',
  'CHEETAHS',
  'FOLLIES',
  'DEJA VU SHOWGIRLS',
  'TOOTSIES CABARET',
];
const ESCORT_KEYWORDS = [
  'ESCORT SVC',
  'ESCORT SERVICE',
  'ESCORT AGENCY',
  'COMPANION SERVICES',
  'COMPANION SVC',
  'VIP COMPANIONS',
];

const GAMBLING_OFFSHORE_KEYWORDS = [
  'BOVADA',
  'BETONLINE',
  'MYBOOKIE',
  'SPORTSBETTING.AG',
  'BOOKMAKER.EU',
  'BETUS',
  'XBET',
  '5DIMES',
  'HERITAGE SPORTS',
  'JAZZ SPORTS',
  'NITROGEN SPORTS',
  'STAKE.COM',
  'ROOBET',
  'CLOUDBET',
  'CRYPTO SPORTSBOOK',
  'OFFSHORE GAMING',
  'CURACAO GAMING',
  'WAGERWEB',
  'INTERTOPS',
];
const GAMBLING_SPORTS_KEYWORDS = [
  'DRAFTKINGS SPORTSBOOK',
  'DRAFTKINGS SB',
  'DK SPORTSBOOK',
  'FANDUEL SPORTSBOOK',
  'FANDUEL SB',
  'FD SPORTSBOOK',
  'BETMGM',
  'BET MGM',
  'CAESARS SPORTSBOOK',
  'POINTSBET',
  'BETRIVERS',
  'BET RIVERS',
  'WYNNBET',
  'WYNN BET',
  'BARSTOOL SPORTSBOOK',
  'FANATICS SPORTSBOOK',
  'ESPN BET',
  'ESPNBET',
  'HARD ROCK BET',
  'HARDROCK BET',
  'PRIZEPICKS',
  'UNDERDOG FANTASY',
  'SPORTSBOOK',
  'SB DEPOSIT',
];
const GAMBLING_CASINO_KEYWORDS = [
  'MGM GRAND',
  'MGM RESORTS',
  'MGM CASINO',
  'BELLAGIO',
  'ARIA RESORT',
  'MANDALAY BAY',
  'LUXOR HOTEL',
  'EXCALIBUR HOTEL',
  'PARK MGM',
  'CAESARS PALACE',
  'HARRAHS',
  "HARRAH'S",
  'HORSESHOE CASINO',
  'WYNN LAS VEGAS',
  'WYNN CASINO',
  'ENCORE CASINO',
  'VENETIAN RESORT',
  'PALAZZO RESORT',
  'COSMOPOLITAN LAS VEGAS',
  'FOXWOODS',
  'MOHEGAN SUN',
  'BORGATA',
  'OCEAN CASINO',
  'TROPICANA CASINO',
  'PARX CASINO',
  'SUGARHOUSE',
  'RIVERS CASINO',
  'MOTORCITY CASINO',
  'GREEKTOWN CASINO',
  'PECHANGA',
  'BARONA CASINO',
  'AGUA CALIENTE',
  'BETMGM CASINO',
  'CAESARS CASINO',
  'DRAFTKINGS CASINO',
  'FANDUEL CASINO',
  'GOLDEN NUGGET CASINO',
  'BORGATA ONLINE',
  'RESORTS CASINO',
];
const GAMBLING_CASUAL_KEYWORDS = [
  'DRAFTKINGS DFS',
  'DRAFTKINGS DAILY',
  'DRAFTKINGS FANTASY',
  'FANDUEL DFS',
  'FANDUEL FANTASY',
  'FANDUEL DAILY',
  'YAHOO FANTASY',
  'SLEEPER FANTASY',
  'CHUMBA CASINO',
  'STAKE.US',
  'LUCKYLAND SLOTS',
  'FUNZPOINTS',
  'GLOBAL POKER',
  'PULSZ',
  'HIGH 5 CASINO',
  'WOW VEGAS',
  'MCLUCK',
  'ZYNGA POKER',
  'WSOP APP',
  'POKERSTARS PLAY',
  'JACKPOT.COM',
];
const GAMBLING_LOTTERY_KEYWORDS = [
  'LOTTERY',
  'LOTTO',
  'POWERBALL',
  'MEGA MILLIONS',
  'SCRATCH OFF',
  'SCRATCH-OFF',
  'SCRATCHER',
  'STATE LOTTERY',
  'JACKPOCKET',
];
const GAMBLING_HORSE_KEYWORDS = [
  'TVG',
  'TWINSPIRES',
  'TWIN SPIRES',
  'XPRESSBET',
  'NYRA BETS',
  'NYRABETS',
  'AMWAGER',
  'BETAMERICA',
  'DERBYWARS',
  'CHURCHILL DOWNS',
  'BELMONT PARK',
  'SARATOGA RACE',
  'SANTA ANITA',
  'DEL MAR RACE',
  'GULFSTREAM PARK',
  'AQUEDUCT',
  'PIMLICO RACE',
  'OFF TRACK BETTING',
  'OTB ',
  'PARI-MUTUEL',
  'PARIMUTUEL',
];
const GAMBLING_GENERIC_KEYWORDS = [
  'CASINO',
  'POKER',
  'BLACKJACK',
  'BACCARAT',
  'ROULETTE',
  'SLOTS ',
  'WAGER',
  'BETTING',
  'BOOKIE',
  'BOOKMAKER',
  'TURF CLUB',
];

const DISTRESS_PAWN_PAYDAY_KEYWORDS = [
  'CHECK INTO CASH',
  'ACE CASH EXPRESS',
  'ACE CASH',
  'ADVANCE AMERICA',
  'SPEEDY CASH',
  'MONEYMUTUAL',
  'CASHNETUSA',
  'CASH NET USA',
  'CHECK N GO',
  "CHECK 'N GO",
  'LENDUP',
  'CASH STORE',
  'RISE CREDIT',
  'OPPLOANS',
  'OPP LOANS',
  'NETCREDIT',
  'BIG PICTURE LOANS',
  'PLAIN GREEN LOANS',
  'SPOTLOAN',
  'TITLEMAX',
  'TITLE MAX',
  'LOANMAX',
  'LOAN MAX',
  'TMX FINANCE',
  '1-800LOANMART',
  '1800LOANMART',
  'TITLE LOAN',
  'TITLE LOANS',
  'EZPAWN',
  'EZ PAWN',
  'CASH AMERICA PAWN',
  'CASH AMERICA',
  'FIRST CASH PAWN',
  'FIRSTCASH',
  'PAWN AMERICA',
  'PAWN SHOP',
  'PAWNBROKER',
  'PAWN-1',
  'MAX PAWN',
  'SUPERPAWN',
  'EARNIN',
  'EARN IN',
  'DAVE INC',
  'DAVE.COM',
  'BRIGIT',
  'MONEYLION',
  'INSTACASH',
  'EMPOWER FINANCE',
  'ALBERT SAVINGS',
  'KLOVER',
  'B9 BANK',
  'CASH ADVANCE',
  'PAYDAY LOAN',
  'PAYDAY ADVANCE',
];
const DISTRESS_DEBT_KEYWORDS = [
  'PORTFOLIO RECOVERY',
  'MIDLAND CREDIT',
  'MIDLAND FUNDING',
  'ENCORE CAPITAL',
  'LVNV FUNDING',
  'CAVALRY PORTFOLIO',
  'CAVALRY SPV',
  'ERC ',
  'CONVERGENT OUTSOURCING',
  'RESURGENT CAPITAL',
  'ENHANCED RECOVERY',
  'TRANSWORLD SYSTEMS',
  'ALLIED INTERSTATE',
  'I.C. SYSTEM',
  'IC SYSTEM',
  'AFNI INC',
  'DIVERSIFIED CONSULTANTS',
  'COLLECTION AGENCY',
  'COLLECTIONS DEPT',
  'DEBT COLLECTION',
  'NATIONAL DEBT RELIEF',
  'FREEDOM DEBT RELIEF',
  'ACCREDITED DEBT RELIEF',
  'CURADEBT',
  'CLEARONE ADVANTAGE',
  'PACIFIC DEBT',
  'DEBT SETTLEMENT',
  'BEYOND FINANCE',
  'AMERICOR',
  'TURNBULL LAW',
  'BANKRUPTCY ATTY',
  'BANKRUPTCY ATTORNEY',
  'BANKRUPTCY LAW',
  'CH 7 ATTORNEY',
  'CH 13 ATTORNEY',
  'CHAPTER 7 ATTORNEY',
  'CHAPTER 13 ATTORNEY',
  'UPSOLVE',
];
const DISTRESS_CHECK_CASHING_KEYWORDS = [
  'ACE CHECK CASHING',
  'PLS CHECK CASHING',
  'PLS FINANCIAL',
  'CHECK CASHING',
  'CHECK CASHERS',
  'MONEY MART',
  'INSTA CASH',
  'WESTERN UNION',
  'WESTERNUNION',
  'MONEYGRAM',
  'MONEY GRAM',
  'RIA MONEY TRANSFER',
  'RIA FINANCIAL',
  'XOOM ',
  'REMITLY',
  'WORLDREMIT',
  'WORLD REMIT',
  'WISE TRANSFER',
  'TRANSFERWISE',
  'MONEYPAK',
  'RELOADIT',
  'VANILLA RELOAD',
  'GREENDOT RELOAD',
  'GREEN DOT RELOAD',
  'NETSPEND RELOAD',
  'MONEY ORDER',
];
const DISTRESS_OVERDRAFT_KEYWORDS = [
  'OVERDRAFT FEE',
  'OVERDRAFT CHARGE',
  'OD FEE',
  'NSF FEE',
  'NSF CHARGE',
  'INSUFFICIENT FUNDS FEE',
  'INSUFFICIENT FUNDS',
  'RETURNED ITEM FEE',
  'RETURNED CHECK FEE',
  'EXTENDED OVERDRAFT',
  'SUSTAINED OVERDRAFT',
  'UNCOLLECTED FUNDS FEE',
];
const DISTRESS_SUBPRIME_KEYWORDS = [
  'CREDIT ONE BANK',
  'CREDITONE BANK',
  'FIRST PREMIER BANK',
  'FIRSTPREMIER',
  'MISSION LANE',
  'OPENSKY',
  'OPEN SKY',
  'INDIGO CARD',
  'MILESTONE CARD',
  'REFLEX CARD',
  'SURGE CARD',
  'FIT MASTERCARD',
  'FORTIVA',
  'PETAL CARD',
  'SELF FINANCIAL',
  'BUY HERE PAY HERE',
  'BUYHEREPAYHERE',
  'BHPH',
  'DRIVETIME',
  'DRIVE TIME',
  'J.D. BYRIDER',
  'JD BYRIDER',
  'BYRIDER',
  'RENT-A-CENTER',
  'RENT A CENTER',
  "AARON'S",
  'AARONS RENT',
  "BUDDY'S HOME",
  'BUDDYS HOME',
  'RENT TO OWN',
  'RENT-TO-OWN',
];
const DISTRESS_CRYPTO_MIXING_KEYWORDS = [
  'TORNADO CASH',
  'WASABI WALLET',
  'SAMOURAI WALLET',
  'COINJOIN',
  'BITCOIN MIXER',
  'BTC MIXER',
  'CRYPTO MIXER',
  'TUMBLER',
  'LOCALBITCOINS',
  'LOCAL BITCOINS',
  'PAXFUL',
  'BISQ',
  'MONERO EXCHANGE',
  'PRIVACY COIN',
];

// ─── DETECTION HELPERS ────────────────────────────────────────────────────────
function matchesAny(text, keywords) {
  const t = (text || '').toUpperCase();
  for (const kw of keywords) {
    if (t.includes(kw)) return kw;
  }
  return null;
}

function isRealEstate(merchant) {
  return REAL_ESTATE_KEYWORDS.some((kw) =>
    (merchant || '').toUpperCase().includes(kw)
  );
}

function looksInternational(merchant) {
  return INTL_KEYWORDS.some((kw) =>
    (merchant || '').toUpperCase().includes(kw)
  );
}

function nonUsZip(zip, homeZip) {
  if (!zip) return true;
  const trimmed = zip.trim();
  if (!/^\d{5}(-\d{4})?$/.test(trimmed)) return true;
  if (homeZip && trimmed.startsWith(homeZip.trim().substring(0, 3)))
    return false;
  return false;
}

function detectGambling(merchant, mcc) {
  const m = (merchant || '').toUpperCase();
  if (!m)
    return mcc === '7995'
      ? {
          label: 'Gambling',
          kind: 'MCC 7995',
          matched: 'MCC 7995',
          riskWeight: 2,
        }
      : null;

  let hit = matchesAny(m, GAMBLING_OFFSHORE_KEYWORDS);
  if (hit)
    return {
      label: 'High-Risk / Offshore Gambling',
      kind: 'Offshore sportsbook',
      matched: hit,
      riskWeight: 5,
    };
  hit = matchesAny(m, GAMBLING_SPORTS_KEYWORDS);
  if (hit)
    return {
      label: 'Sports Betting',
      kind: 'Regulated sportsbook',
      matched: hit,
      riskWeight: 3,
    };
  hit = matchesAny(m, GAMBLING_CASINO_KEYWORDS);
  if (hit)
    return {
      label: 'Casino & Table Games',
      kind: 'Casino property',
      matched: hit,
      riskWeight: 3,
    };
  hit = matchesAny(m, GAMBLING_HORSE_KEYWORDS);
  if (hit)
    return {
      label: 'Horse Racing & Pari-mutuel',
      kind: 'Track wagering',
      matched: hit,
      riskWeight: 2,
    };
  hit = matchesAny(m, GAMBLING_CASUAL_KEYWORDS);
  if (hit)
    return {
      label: 'Casual / Social Gaming',
      kind: 'DFS or sweepstakes',
      matched: hit,
      riskWeight: 1,
    };
  hit = matchesAny(m, GAMBLING_LOTTERY_KEYWORDS);
  if (hit)
    return {
      label: 'Lottery & Raffles',
      kind: 'Lottery',
      matched: hit,
      riskWeight: 1,
    };
  if (mcc === '7995') {
    hit = matchesAny(m, GAMBLING_GENERIC_KEYWORDS);
    if (hit)
      return {
        label: 'Gambling',
        kind: 'Generic gambling MCC 7995',
        matched: hit,
        riskWeight: 2,
      };
    return {
      label: 'Gambling',
      kind: 'MCC 7995 unrecognized merchant',
      matched: 'MCC 7995',
      riskWeight: 2,
    };
  }
  return null;
}

function detectAdultEntertainment(merchant, mcc) {
  const m = (merchant || '').toUpperCase();
  if (!m) return null;
  let hit = matchesAny(m, ADULT_STREAMING_KEYWORDS);
  if (hit) return { kind: 'Adult streaming subscription', matched: hit };
  hit = matchesAny(m, ADULT_CAMSITE_KEYWORDS);
  if (hit) return { kind: 'Cam-site billing', matched: hit };
  hit = matchesAny(m, ADULT_PROCESSOR_KEYWORDS);
  if (hit) return { kind: 'Adult content processor', matched: hit };
  hit = matchesAny(m, ESCORT_KEYWORDS);
  if (hit) return { kind: 'Escort-adjacent service', matched: hit };
  if (mcc === '5813' || mcc === '7299') {
    hit = matchesAny(m, STRIP_CLUB_KEYWORDS);
    if (hit) return { kind: 'Strip-club venue', matched: hit };
  }
  if (mcc === '5967')
    return { kind: 'MCC 5967 adult-content processor', matched: 'MCC 5967' };
  return null;
}

function detectFinancialDistress(merchant, mcc) {
  const m = (merchant || '').toUpperCase();
  let hit = matchesAny(m, DISTRESS_OVERDRAFT_KEYWORDS);
  if (hit)
    return {
      label: 'Overdraft & NSF Activity',
      kind: 'Overdraft/NSF fee',
      matched: hit,
      riskWeight: 4,
    };
  hit = matchesAny(m, DISTRESS_DEBT_KEYWORDS);
  if (hit)
    return {
      label: 'Debt Collection & Debt Relief',
      kind: 'Debt collector or bankruptcy',
      matched: hit,
      riskWeight: 5,
    };
  hit = matchesAny(m, DISTRESS_PAWN_PAYDAY_KEYWORDS);
  if (hit)
    return {
      label: 'Pawn Shops & Short-Term Credit',
      kind: 'Payday/pawn/title/early-wage',
      matched: hit,
      riskWeight: 5,
    };
  hit = matchesAny(m, DISTRESS_CRYPTO_MIXING_KEYWORDS);
  if (hit)
    return {
      label: 'Crypto Mixing & High-Risk Crypto',
      kind: 'Mixer/tumbler',
      matched: hit,
      riskWeight: 4,
    };
  hit = matchesAny(m, DISTRESS_CHECK_CASHING_KEYWORDS);
  if (hit)
    return {
      label: 'Check Cashing & Money Services',
      kind: 'Check cashing or remittance',
      matched: hit,
      riskWeight: 4,
    };
  hit = matchesAny(m, DISTRESS_SUBPRIME_KEYWORDS);
  if (hit)
    return {
      label: 'Subprime Credit & Buy-Here-Pay-Here',
      kind: 'Subprime card or BHPH',
      matched: hit,
      riskWeight: 3,
    };
  if (mcc === '6051')
    return {
      label: 'Financial Distress',
      kind: 'MCC 6051 quasi-cash',
      matched: 'MCC 6051',
      riskWeight: 2,
    };
  if (mcc === '4829')
    return {
      label: 'Financial Distress',
      kind: 'MCC 4829 wire/money order',
      matched: 'MCC 4829',
      riskWeight: 2,
    };
  return null;
}

// ─── DETERMINISTIC FLAGS ──────────────────────────────────────────────────────
function deterministicFlags(transactions) {
  const flags = [];
  const adultFlaggedIds = new Set();
  const gamblingFlaggedIds = new Set();
  const distressFlaggedIds = new Set();

  // ── Adult pre-pass ──
  const adultHits = transactions
    .filter((t) => !isRealEstate(t.merchant_name || ''))
    .map((t) => {
      const hit = detectAdultEntertainment(t.merchant_name || '', t.mcc || '');
      return hit ? { tx: t, hit } : null;
    })
    .filter(Boolean);

  const adultTotal = adultHits.reduce(
    (s, h) => s + Number(h.tx.amount || 0),
    0
  );
  const adultSeverity =
    adultHits.length >= 3 || adultTotal >= 500 ? 'high' : 'medium';

  for (const { tx, hit } of adultHits) {
    flags.push({
      transaction_id: tx.transaction_id,
      category_group: 'vice',
      category_label: 'Adult Entertainment',
      severity: adultSeverity,
      merchant: tx.merchant_name || '',
      amount: tx.amount,
      date: tx.date,
      reason: `${hit.kind} — matched "${hit.matched}".`,
    });
    adultFlaggedIds.add(tx.transaction_id);
  }

  // ── Gambling pre-pass ──
  const gamblingHits = transactions
    .filter(
      (t) =>
        !isRealEstate(t.merchant_name || '') &&
        !adultFlaggedIds.has(t.transaction_id)
    )
    .map((t) => {
      const hit = detectGambling(t.merchant_name || '', t.mcc || '');
      return hit ? { tx: t, hit } : null;
    })
    .filter(Boolean);

  const gamblingTotal = gamblingHits.reduce(
    (s, h) => s + Number(h.tx.amount || 0),
    0
  );
  const subCounts = new Map();
  for (const { hit } of gamblingHits)
    subCounts.set(hit.label, (subCounts.get(hit.label) || 0) + 1);
  const weightedScore =
    gamblingHits.reduce((s, { hit }) => s + hit.riskWeight, 0) +
    gamblingTotal / 500;

  for (const { tx, hit } of gamblingHits) {
    const subCount = subCounts.get(hit.label) || 1;
    let severity = 'low';
    if (hit.label === 'High-Risk / Offshore Gambling') severity = 'high';
    else if (weightedScore >= 12 || gamblingTotal >= 2000) severity = 'high';
    else if (weightedScore >= 4 || gamblingTotal >= 500) severity = 'medium';
    else if (
      subCount >= 2 &&
      (hit.label === 'Sports Betting' || hit.label === 'Casino & Table Games')
    )
      severity = 'medium';

    flags.push({
      transaction_id: tx.transaction_id,
      category_group: 'vice',
      category_label: hit.label,
      severity,
      merchant: tx.merchant_name || '',
      amount: tx.amount,
      date: tx.date,
      reason: `${hit.label} — ${hit.kind}. Matched "${hit.matched}". ${gamblingHits.length} gambling transactions ($${gamblingTotal.toFixed(2)} total).`,
    });
    gamblingFlaggedIds.add(tx.transaction_id);
  }

  // ── Financial distress pre-pass ──
  const distressHits = transactions
    .filter((t) => {
      if (isRealEstate(t.merchant_name || '')) return false;
      if (adultFlaggedIds.has(t.transaction_id)) return false;
      if (gamblingFlaggedIds.has(t.transaction_id)) return false;
      return true;
    })
    .map((t) => {
      const hit = detectFinancialDistress(t.merchant_name || '', t.mcc || '');
      return hit ? { tx: t, hit } : null;
    })
    .filter(Boolean);

  const distressTotal = distressHits.reduce(
    (s, h) => s + Number(h.tx.amount || 0),
    0
  );
  const distressSubCounts = new Map();
  for (const { hit } of distressHits)
    distressSubCounts.set(
      hit.label,
      (distressSubCounts.get(hit.label) || 0) + 1
    );
  const hasDebtCollection = distressSubCounts.has(
    'Debt Collection & Debt Relief'
  );
  const hasPawnPayday = distressSubCounts.has('Pawn Shops & Short-Term Credit');
  const distressWeighted =
    distressHits.reduce((s, { hit }) => s + hit.riskWeight, 0) +
    distressTotal / 250 +
    (hasPawnPayday ? 3 : 0) +
    (hasDebtCollection ? 5 : 0);

  // Collapse overdraft into single aggregated flag
  const overdraftHits = distressHits.filter(
    (h) => h.hit.label === 'Overdraft & NSF Activity'
  );
  if (overdraftHits.length > 0) {
    const overdraftTotal = overdraftHits.reduce(
      (s, h) => s + Number(h.tx.amount || 0),
      0
    );
    const sev = overdraftHits.length >= 5 ? 'medium' : 'low';
    const last = overdraftHits[overdraftHits.length - 1];
    flags.push({
      transaction_id: last.tx.transaction_id,
      category_group: 'financial_distress',
      category_label: 'Overdraft & NSF Activity',
      severity: sev,
      merchant: 'Bank-issued fee',
      amount: overdraftTotal,
      date: last.tx.date,
      reason: `${overdraftHits.length} overdraft/NSF fees totaling $${overdraftTotal.toFixed(2)}.`,
    });
    for (const h of overdraftHits) distressFlaggedIds.add(h.tx.transaction_id);
  }

  for (const { tx, hit } of distressHits) {
    if (hit.label === 'Overdraft & NSF Activity') continue;
    if (distressFlaggedIds.has(tx.transaction_id)) continue;
    const subCount = distressSubCounts.get(hit.label) || 1;
    let sev = 'low';
    if (hit.label === 'Debt Collection & Debt Relief') sev = 'high';
    else if (distressWeighted >= 10) sev = 'high';
    else if (hit.label === 'Pawn Shops & Short-Term Credit' && subCount >= 3)
      sev = 'high';
    else if (distressWeighted >= 4 || subCount >= 2) sev = 'medium';

    flags.push({
      transaction_id: tx.transaction_id,
      category_group: 'financial_distress',
      category_label: hit.label,
      severity: sev,
      merchant: tx.merchant_name || '',
      amount: tx.amount,
      date: tx.date,
      reason: `${hit.label} — matched "${hit.matched}". ${subCount} of ${distressHits.length} distress transactions ($${distressTotal.toFixed(2)} total).`,
    });
    distressFlaggedIds.add(tx.transaction_id);
  }

  // ── Suspicious international ──
  for (const t of transactions) {
    if (isRealEstate(t.merchant_name || '')) continue;
    if (adultFlaggedIds.has(t.transaction_id)) continue;
    if (gamblingFlaggedIds.has(t.transaction_id)) continue;
    if (distressFlaggedIds.has(t.transaction_id)) continue;
    if (
      looksInternational(t.merchant_name || '') &&
      nonUsZip(t.zip_code || '', t.home_zip || '')
    ) {
      flags.push({
        transaction_id: t.transaction_id,
        category_group: 'suspicious_international',
        category_label: 'Suspicious International',
        severity: 'medium',
        merchant: t.merchant_name || '',
        amount: t.amount,
        date: t.date,
        reason: 'International merchant with missing or non-US zip code.',
      });
    }
  }

  return flags;
}

// ─── GEMINI AML ANALYSIS ──────────────────────────────────────────────────────
const AML_SYSTEM_PROMPT = `You are a banking AML analyst. Analyze transaction patterns ONLY for:

1. STRUCTURING — multiple deposits/withdrawals just below $10,000 thresholds
2. RAPID ROUND-NUMBER LAYERING — repeated round-number cash-equivalent transactions
3. SUSPICIOUS INTERNATIONAL — cross-border wires inconsistent with home zip

Return flags ONLY for clear multi-transaction patterns. A single large legitimate purchase is NEVER flagged.

NEVER flag: real estate (escrow, title, mortgage, down payment), normal travel, routine spending.

Respond with valid JSON only, no markdown:
{
  "flags": [
    {
      "transaction_id": "pattern",
      "category_group": "aml",
      "category_label": "Structuring",
      "severity": "high",
      "merchant": "",
      "amount": 0,
      "date": "",
      "reason": "one sentence"
    }
  ]
}

If no AML patterns found return: {"flags":[]}`;

async function callModelForAML(transactions, alreadyFlaggedIds) {
  const txSummary = transactions
    .filter((t) => !alreadyFlaggedIds.has(t.transaction_id))
    .map((t) => ({
      id: t.transaction_id,
      merchant: t.merchant_name,
      mcc: t.mcc,
      amount: t.amount,
      date: t.date,
      zip: t.zip_code,
      home_zip: t.home_zip,
    }));

  if (txSummary.length === 0) return [];

  try {
    const { response: res, metadata } = await modelGateway.chatCompletion({
      task: 'risk_detection',
      label: 'RISK',
      maxRetries: 3,
      messages: [
        { role: 'system', content: AML_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze ${txSummary.length} transactions for AML patterns:\n${JSON.stringify(txSummary, null, 1)}`,
        },
      ],
    });

    if (!res.ok) {
      console.warn(
        `[RISK] ${metadata.provider}/${metadata.model} AML error ${res.status}`
      );
      return [];
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    let clean = content.trim();
    if (clean.startsWith('```json')) clean = clean.slice(7);
    if (clean.startsWith('```')) clean = clean.slice(3);
    if (clean.endsWith('```')) clean = clean.slice(0, -3);

    const parsed = JSON.parse(clean.trim());
    return Array.isArray(parsed.flags) ? parsed.flags : [];
  } catch (e) {
    console.error('[RISK] Model-routed AML exception:', e.message);
    return [];
  }
}

// ─── WRITE RISK FACTORS ───────────────────────────────────────────────────────
async function writeRiskFactors(db, customerId, bankId, batchId, flags) {
  const webhookRiskFactorIds = [];

  await db.query(
    `DELETE FROM customer_risk_factors
     WHERE customer_id = $1 AND batch_id = $2`,
    [customerId, batchId]
  );

  for (const flag of flags) {
    const inserted = await db.query(
      `INSERT INTO customer_risk_factors
        (customer_id, bank_id, batch_id, transaction_id,
         category_group, category_label, severity,
         merchant, amount, transaction_date, reason, detected_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
       RETURNING id`,
      [
        customerId,
        bankId,
        batchId,
        flag.transaction_id || null,
        flag.category_group,
        flag.category_label,
        flag.severity,
        flag.merchant || null,
        flag.amount || null,
        flag.date || null,
        flag.reason || null,
      ]
    );
    const riskFactorId = inserted.rows[0]?.id;
    if (flag.severity === 'high' && riskFactorId) {
      const marked = await db.query(
        `UPDATE customer_risk_factors
         SET webhook_fired_at = NOW()
         WHERE id = $1 AND webhook_fired_at IS NULL
         RETURNING id`,
        [riskFactorId]
      );
      if (marked.rows.length > 0) {
        webhookRiskFactorIds.push(String(riskFactorId));
      }
    }
  }
  console.log(`[RDS] ✓ Wrote ${flags.length} risk factors`);
  return { webhookRiskFactorIds };
}

// ─── UPDATE PIPELINE_RUNS ─────────────────────────────────────────────────────
async function updatePipelineRuns(db, batchId, customerId) {
  const result = await db.query(
    `UPDATE pipeline_runs
     SET risk_analyzed_at = NOW(),
         stages_complete = stages_complete + 1,
         status = CASE WHEN stages_complete + 1 >= 4 THEN 'complete' ELSE 'risk_analyzed' END,
         completed_at = CASE WHEN stages_complete + 1 >= 4 THEN NOW() ELSE completed_at END
     WHERE batch_id = $1 AND customer_id = $2
     RETURNING stages_complete`,
    [batchId, customerId]
  );
  return result.rows[0]?.stages_complete;
}

// ─── BATCH COMPLETE CHECK ─────────────────────────────────────────────────────
// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  for (const record of event.Records) {
    const { batch_id, customer_id, bank_id } = JSON.parse(record.body);
    console.log(`[RISK] Processing customer ${customer_id} batch ${batch_id}`);

    const db = await getDB();
    await db.connect();

    try {
      const transactions = await fetchTransactions(db, customer_id);
      if (transactions.length === 0) {
        console.warn(`[RISK] No transactions for ${customer_id}`);
        continue;
      }
      console.log(`[RISK] Found ${transactions.length} transactions`);

      // Step 1 — deterministic flags
      const detFlags = deterministicFlags(transactions);
      console.log(`[RISK] Deterministic flags: ${detFlags.length}`);

      // Step 2 — model-routed AML analysis
      const alreadyFlaggedIds = new Set(detFlags.map((f) => f.transaction_id));
      const amlFlags = await callModelForAML(transactions, alreadyFlaggedIds);
      console.log(`[RISK] AML flags: ${amlFlags.length}`);

      // Step 3 — merge, deterministic wins
      const seenKeys = new Set();
      const allFlags = [];
      for (const f of [...detFlags, ...amlFlags]) {
        const key = `${f.transaction_id}::${f.category_group}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        allFlags.push(f);
      }

      console.log(`[RISK] Total merged flags: ${allFlags.length}`);

      if (allFlags.length > 0) {
        const { webhookRiskFactorIds } = await writeRiskFactors(
          db,
          customer_id,
          bank_id,
          batch_id,
          allFlags
        );

        if (webhookRiskFactorIds.length > 0) {
          await fireWebhook(db, bank_id, 'risk_detected', {
            schema_version: 1,
            customer_id,
            batch_id,
            risk_factor_ids: webhookRiskFactorIds,
          });
          console.log(
            `[WEBHOOK] risk_detected: ${webhookRiskFactorIds.length} high-severity factor(s) for ${customer_id}`
          );
        }
      } else {
        console.log(`[RISK] No risk factors for ${customer_id}`);
      }

      const stagesComplete = await updatePipelineRuns(
        db,
        batch_id,
        customer_id
      );
      console.log(
        `[RISK] stages_complete: ${stagesComplete}/4 for ${customer_id}`
      );

      if (stagesComplete >= 4) {
        await checkAndEmitBatchOutcome(db, batch_id, bank_id, fireWebhook);
      }

      console.log(`[RISK] ✓ Done for customer ${customer_id}`);
    } catch (err) {
      console.error(`[RISK] Error for customer ${customer_id}:`, err);
      await markCustomerPipelineFailed(
        db,
        { batchId: batch_id, customerId: customer_id, bankId: bank_id, errorMessage: err.message },
        fireWebhook
      );
      throw err;
    } finally {
      await db.end();
    }
  }

  return { statusCode: 200 };
};
