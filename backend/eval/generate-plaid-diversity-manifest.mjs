// Generates a LOCAL (git-ignored) Plaid Sandbox custom_user manifest whose goal
// is purely diagnostic: find out how broadly Plaid's enrichment infers distinct
// personal_finance_category (PFC) primaries across descriptions we control.
//
// This does NOT call Plaid and does NOT change any evaluation, normalization,
// routing, taxonomy, or production behavior. It writes one JSON manifest to
// backend/artifacts/plaid-diversity-pilot/ (git-ignored) that the EXISTING
// `plaid:sandbox:pull` script consumes via PLAID_SANDBOX_USERS_PATH.
//
// Why this exists: custom_user transaction overrides accept only
// {amount, description, currency, date_transacted, date_posted}. Plaid infers
// PFC / payment_channel / counterparties from description at retrieval time, so
// we cannot declare a target PFC directly. Before building a 700-1000 row
// evaluation set we must measure how much PFC breadth our descriptions actually
// produce. See docs/engineering/backend-qa-harness.md "Plaid Sandbox Pulls".

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const outputDir = resolve(
  process.env.PLAID_DIVERSITY_OUTPUT_DIR ||
    join(backendRoot, 'artifacts', 'plaid-diversity-pilot')
);

// Account designs deliberately mix credit (-> Ventus card rail) and depository
// (-> ach rail) so rail coverage is exercised alongside PFC coverage. Names are
// human-readable only; Plaid keys accounts by the order/structure we provide.
const ACCOUNT_DESIGNS = [
  { label: 'credit_card', type: 'credit', subtype: 'credit card' },
  { label: 'checking', type: 'depository', subtype: 'checking' },
  { label: 'savings', type: 'depository', subtype: 'savings' },
  { label: 'loan', type: 'loan', subtype: 'student' },
];

// Each row: { description, amount, intended_pfc_primary }.
// `intended_pfc_primary` is OUR hypothesis, recorded so the analyzer can compare
// it against the PFC Plaid actually returns. It is NOT sent to Plaid. Amounts
// follow Plaid sign convention: positive = money out (debit), negative = money in (credit).
//
// Coverage goal: hit the 16 Plaid PFC primaries, especially the consumer-spend
// ones (food / travel / transport / retail / medical / entertainment / personal
// care / home improvement) that the existing 107-row pull entirely lacks.
const TXN_DESIGNS = [
  // --- FOOD_AND_DRINK ---
  { description: 'STARBUCKS STORE #1234', amount: 6.5, intended_pfc_primary: 'FOOD_AND_DRINK' },
  { description: 'CHIPOTLE 3320', amount: 14.2, intended_pfc_primary: 'FOOD_AND_DRINK' },
  { description: 'WHOLEFDS MARKET 10048', amount: 87.35, intended_pfc_primary: 'FOOD_AND_DRINK' },
  { description: 'DOORDASH*MCDONALDS', amount: 22.99, intended_pfc_primary: 'FOOD_AND_DRINK' },
  { description: 'SQ *BLUE BOTTLE COFFEE', amount: 5.25, intended_pfc_primary: 'FOOD_AND_DRINK' },

  // --- TRAVEL ---
  { description: 'DELTA AIR LINES 006', amount: 412.0, intended_pfc_primary: 'TRAVEL' },
  { description: 'MARRIOTT HOTELS', amount: 289.0, intended_pfc_primary: 'TRAVEL' },
  { description: 'AIRBNB * STAY HST-123', amount: 540.0, intended_pfc_primary: 'TRAVEL' },
  { description: 'UBER TRIP 06.05 HELP.UBER', amount: 24.3, intended_pfc_primary: 'TRAVEL' },

  // --- TRANSPORTATION ---
  { description: 'SHELL OIL 573301', amount: 52.1, intended_pfc_primary: 'TRANSPORTATION' },
  { description: 'LYFT *RIDE FRI 8PM', amount: 18.75, intended_pfc_primary: 'TRANSPORTATION' },
  { description: 'PARKING SF METER 44', amount: 6.0, intended_pfc_primary: 'TRANSPORTATION' },

  // --- GENERAL_MERCHANDISE (retail) ---
  { description: 'TARGET 00012345', amount: 64.99, intended_pfc_primary: 'GENERAL_MERCHANDISE' },
  { description: 'WAL-MART #2604', amount: 73.4, intended_pfc_primary: 'GENERAL_MERCHANDISE' },
  { description: 'AMAZON.COM*AG3KD0HJ5', amount: 35.0, intended_pfc_primary: 'GENERAL_MERCHANDISE' },
  { description: 'COSTCO WHSE #442', amount: 188.62, intended_pfc_primary: 'GENERAL_MERCHANDISE' },

  // --- HOME_IMPROVEMENT ---
  { description: 'HOME DEPOT #1234', amount: 234.5, intended_pfc_primary: 'HOME_IMPROVEMENT' },
  { description: 'LOWES #0832', amount: 96.3, intended_pfc_primary: 'HOME_IMPROVEMENT' },
  { description: 'IKEA PURCHASE', amount: 310.0, intended_pfc_primary: 'HOME_IMPROVEMENT' },

  // --- MEDICAL ---
  { description: 'KAISER PERMANENTE', amount: 40.0, intended_pfc_primary: 'MEDICAL' },
  { description: 'CVS PHARMACY #04210', amount: 18.99, intended_pfc_primary: 'MEDICAL' },
  { description: 'DELTA DENTAL OF CA', amount: 65.0, intended_pfc_primary: 'MEDICAL' },

  // --- PERSONAL_CARE ---
  { description: 'DRYBAR #102', amount: 55.0, intended_pfc_primary: 'PERSONAL_CARE' },
  { description: "EQUINOX GYM MEMBERSHIP", amount: 220.0, intended_pfc_primary: 'PERSONAL_CARE' },
  { description: 'SUPERCUTS 0042', amount: 24.0, intended_pfc_primary: 'PERSONAL_CARE' },

  // --- ENTERTAINMENT ---
  { description: 'AMC THEATRES #441', amount: 32.5, intended_pfc_primary: 'ENTERTAINMENT' },
  { description: 'NETFLIX.COM', amount: 22.99, intended_pfc_primary: 'ENTERTAINMENT' },
  { description: 'SPOTIFY USA', amount: 11.99, intended_pfc_primary: 'ENTERTAINMENT' },
  { description: 'STEAM GAMES PURCHASE', amount: 59.99, intended_pfc_primary: 'ENTERTAINMENT' },

  // --- RENT_AND_UTILITIES ---
  { description: 'COMED ELECTRIC BILLPAY', amount: 142.3, intended_pfc_primary: 'RENT_AND_UTILITIES' },
  { description: 'PG&E PAYMENT', amount: 98.7, intended_pfc_primary: 'RENT_AND_UTILITIES' },
  { description: 'RENT APT 4B LANDLORD', amount: 2400.0, intended_pfc_primary: 'RENT_AND_UTILITIES' },

  // --- GENERAL_SERVICES ---
  { description: 'AWS *AMAZON WEB SVCS', amount: 6243.99, intended_pfc_primary: 'GENERAL_SERVICES' },
  { description: 'TWILIO INC.', amount: 1523.52, intended_pfc_primary: 'GENERAL_SERVICES' },
  { description: 'TYPEFORM, S.L.', amount: 42.0, intended_pfc_primary: 'GENERAL_SERVICES' },

  // --- LOAN_PAYMENTS ---
  { description: 'AMEX CREDIT CARD PAYMENT', amount: 10386.06, intended_pfc_primary: 'LOAN_PAYMENTS' },
  { description: 'SALLIE MAE STUDENT LOAN', amount: 350.0, intended_pfc_primary: 'LOAN_PAYMENTS' },
  { description: 'WELLS FARGO AUTO LOAN', amount: 480.0, intended_pfc_primary: 'LOAN_PAYMENTS' },
  { description: 'MORTGAGE PAYMENT CHASE', amount: 2200.0, intended_pfc_primary: 'LOAN_PAYMENTS' },

  // --- INCOME (negative = credit / money in) ---
  { description: 'ACME CORP PAYROLL DIRECT DEP', amount: -4280.15, intended_pfc_primary: 'INCOME' },
  { description: 'IRS TREAS 310 TAX REFUND', amount: -1240.0, intended_pfc_primary: 'INCOME' },
  { description: 'VENMO FROM JANE C', amount: -45.0, intended_pfc_primary: 'INCOME' },

  // --- TRANSFER_IN / TRANSFER_OUT (p2p / wire / internal) ---
  { description: 'ZELLE PAYMENT TO ALEX R', amount: 75.0, intended_pfc_primary: 'TRANSFER_OUT' },
  { description: 'VENMO * CASHOUT TO BANK', amount: -300.0, intended_pfc_primary: 'TRANSFER_IN' },
  { description: 'WIRE TO TITLE CO ESCROW', amount: 25000.0, intended_pfc_primary: 'TRANSFER_OUT' },
  { description: 'TRANSFER TO SAVINGS', amount: 500.0, intended_pfc_primary: 'TRANSFER_OUT' },

  // --- BANK_FEES ---
  { description: 'MONTHLY MAINTENANCE FEE', amount: 12.0, intended_pfc_primary: 'BANK_FEES' },
  { description: 'OVERDRAFT FEE', amount: 35.0, intended_pfc_primary: 'BANK_FEES' },
  { description: 'FOREIGN TRANSACTION FEE', amount: 3.2, intended_pfc_primary: 'BANK_FEES' },

  // --- GOVERNMENT_AND_NON_PROFIT ---
  { description: 'CA DMV REGISTRATION', amount: 210.0, intended_pfc_primary: 'GOVERNMENT_AND_NON_PROFIT' },
  { description: 'IRS TAX PAYMENT', amount: 1500.0, intended_pfc_primary: 'GOVERNMENT_AND_NON_PROFIT' },
  { description: 'GOODWILL DONATION', amount: 40.0, intended_pfc_primary: 'GOVERNMENT_AND_NON_PROFIT' },

  // --- Adversarial / dirty strings (test merchant cleaning + reject paths) ---
  { description: 'SQ *EVANS COFFEE  SAN FRANCISCO CA', amount: 9.75, intended_pfc_primary: 'FOOD_AND_DRINK' },
  { description: 'APPLE.COM/BILL 866-712-7753', amount: 9.99, intended_pfc_primary: 'ENTERTAINMENT' },
  { description: 'TST* SWEETGREEN ON HOWARD', amount: 16.45, intended_pfc_primary: 'FOOD_AND_DRINK' },
  { description: '  extra  spaces   STRIP   ', amount: 5.0, intended_pfc_primary: 'GENERAL_MERCHANDISE' },
  { description: 'GOOGLE *TEMPORARY HOLD', amount: 1.0, intended_pfc_primary: 'GENERAL_SERVICES' },
];

const UNIQUE_TXN_COUNT = TXN_DESIGNS.length;

// Distribute the unique designs across accounts so each account type sees a
// spread of PFCs (card rail sees spend; depository sees income/transfer/loan).
// This guarantees every design appears at least once while staying far under
// Plaid's per-user limits (~250 txns / 55KB).
const DESIGNS_PER_ACCOUNT = Math.ceil(UNIQUE_TXN_COUNT / ACCOUNT_DESIGNS.length);

function buildAccounts() {
  const overrides = [];
  for (const [accountIndex, design] of ACCOUNT_DESIGNS.entries()) {
    const accountId = `diversity_acc_${design.label}`;
    const txns = [];
    for (let i = 0; i < DESIGNS_PER_ACCOUNT; i++) {
      const pick = TXN_DESIGNS[(accountIndex * DESIGNS_PER_ACCOUNT + i) % UNIQUE_TXN_COUNT];
      const dateTransacted = `2026-0${(i % 5) + 1}-1${i % 9}`;
      txns.push({
        // Plaid fields only: no PFC / payment_channel / counterparty controls.
        amount: pick.amount,
        description: pick.description,
        currency: 'USD',
        date_transacted: dateTransacted,
        // Most rows post the same day; a few future-dated rows exercise the
        // pending -> pending_transaction_excluded normalizer path.
        date_posted: i % 11 === 0 ? '2099-01-01' : dateTransacted,
      });
    }
    overrides.push({
      type: design.type,
      subtype: design.subtype,
      // Plaid custom_user transactions live under a per-account `transactions`
      // override key. We also tag an annotation Plaid will ignore.
      transactions: txns,
      _ventus_account_label: design.label,
    });
  }
  return overrides;
}

const accountsOverride = buildAccounts();

const manifest = {
  run_id: 'plaid_diversity_pilot_001',
  institution_id: process.env.PLAID_SANDBOX_INSTITUTION_ID || 'ins_109508',
  products: ['transactions'],
  country_codes: ['US'],
  transactions: {
    start_date: '2026-01-01',
    end_date: '2026-06-05',
  },
  _ventus_purpose:
    'Diversity pilot: measure how broadly Plaid infers distinct PFC primaries from controlled descriptions. Not golden data.',
  _ventus_intended_pfc_primaries: [...new Set(TXN_DESIGNS.map((d) => d.intended_pfc_primary))].sort(),
  _ventus_unique_txn_designs: UNIQUE_TXN_COUNT,
  users: [
    {
      customer_id: 'qa_plaid_diversity_pilot_01',
      // pull-plaid-sandbox-transactions.mjs routes override_password as the
      // JSON-stringified custom_user body; override_username signals custom mode.
      username: 'user_custom',
      custom_user: {
        accounts: accountsOverride,
      },
    },
  ],
};

mkdirSync(outputDir, { recursive: true });
const manifestPath = join(outputDir, 'plaid-diversity-manifest.json');
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

// Also emit the design key (intended PFC per description) so the analyzer can
// pair each returned Plaid txn with our hypothesis without re-deriving it.
const designKey = TXN_DESIGNS.map((d) => ({
  description: d.description,
  intended_pfc_primary: d.intended_pfc_primary,
}));
const designKeyPath = join(outputDir, 'pilot-design-key.json');
writeFileSync(designKeyPath, `${JSON.stringify({ designs: designKey }, null, 2)}\n`);

console.log(`Plaid diversity pilot manifest written: ${manifestPath}`);
console.log(`design key: ${designKeyPath}`);
console.log(`unique txn designs: ${UNIQUE_TXN_COUNT}`);
console.log(`intended PFC primaries: ${manifest._ventus_intended_pfc_primaries.join(', ')}`);
console.log('');
console.log('Next: pull with the EXISTING script:');
console.log(
  `  PLAID_CLIENT_ID=... PLAID_SECRET=... ` +
    `PLAID_SANDBOX_USERS_PATH=${manifestPath} ` +
    `npm run --prefix backend plaid:sandbox:pull`
);
console.log('Then analyze coverage with: npm run --prefix backend plaid:pfc:analyze');
