// Generates a LOCAL Plaid Sandbox custom_user manifest for Ventus AI model
// evaluation. This is a benchmark design step only: it does not call Plaid,
// change enrichment behavior, or create golden truth.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const outputDir = resolve(
  process.env.PLAID_BENCHMARK_OUTPUT_DIR || join(backendRoot, 'artifacts', 'plaid-benchmark-manifest')
);
const phase = process.env.PLAID_BENCHMARK_PHASE || 'benchmark';
const phaseMultiplier = Number(process.env.PLAID_BENCHMARK_VARIANTS || { calibration: 1, benchmark: 2, stress: 4 }[phase] || 2);
const transactionsPerMicroUser = Number(process.env.PLAID_BENCHMARK_TXNS_PER_USER || 3);
const maxUsersPerManifest = Number(process.env.PLAID_BENCHMARK_MAX_USERS_PER_MANIFEST || 50);
const institutionId = process.env.PLAID_SANDBOX_INSTITUTION_ID || 'ins_109508';

const ACCOUNT_TEMPLATES = {
  checking: { label: 'checking', type: 'depository', subtype: 'checking' },
  savings: { label: 'savings', type: 'depository', subtype: 'savings' },
  credit: { label: 'credit_card', type: 'credit', subtype: 'credit card' },
  loan: { label: 'loan', type: 'loan', subtype: 'student' },
};

const PERSONAS = [
  persona('consumer_baseline', 'qa_plaid_benchmark_consumer_01', ['checking', 'credit', 'savings'], [
    group('food_drink'), group('groceries_retail'), group('utilities_rent'), group('income_basic'),
    group('p2p_transfer'), group('subscriptions'), group('pets'),
  ]),
  persona('affluent_travel', 'qa_plaid_benchmark_travel_01', ['checking', 'credit', 'savings'], [
    group('travel_air_hotel'), group('transportation'), group('luxury_retail'), group('dining'),
    group('large_legitimate'), group('refunds'),
  ]),
  persona('digital_subscription_household', 'qa_plaid_benchmark_digital_01', ['checking', 'credit', 'savings'], [
    group('subscriptions'), group('general_services'), group('entertainment'), group('ambiguous_digital'),
    group('food_delivery'), group('p2p_transfer'),
  ]),
  persona('family_life_event', 'qa_plaid_benchmark_family_01', ['checking', 'credit', 'savings'], [
    group('child_family'), group('medical'), group('home_move'), group('utilities_rent'),
    group('travel_air_hotel'), group('groceries_retail'), group('pets'),
  ]),
  persona('medical_pharmacy', 'qa_plaid_benchmark_medical_01', ['checking', 'credit', 'savings'], [
    group('medical'), group('personal_care'), group('insurance'), group('income_basic'),
    group('ambiguous_medical'), group('refunds'),
  ]),
  persona('home_move_improvement', 'qa_plaid_benchmark_home_01', ['checking', 'credit', 'savings'], [
    group('home_improvement'), group('home_move'), group('utilities_rent'), group('large_legitimate'),
    group('government'), group('food_drink'),
  ]),
  persona('small_business_ops', 'qa_plaid_benchmark_business_01', ['checking', 'credit', 'savings'], [
    group('business_saas'), group('business_vendor'), group('business_tax'), group('payroll'),
    group('general_services'), group('large_wire'),
  ]),
  persona('contractor_income', 'qa_plaid_benchmark_contractor_01', ['checking', 'credit', 'savings'], [
    group('contractor_income'), group('business_saas'), group('p2p_transfer'), group('tax_payments'),
    group('transportation'), group('food_drink'),
  ]),
  persona('loan_debt_heavy', 'qa_plaid_benchmark_debt_01', ['checking', 'credit', 'loan'], [
    group('loan_payments'), group('bank_fees'), group('income_basic'), group('credit_card_payment'),
    group('utilities_rent'), group('risk_controls'),
  ]),
  persona('transfer_heavy', 'qa_plaid_benchmark_transfer_01', ['checking', 'savings', 'credit'], [
    group('p2p_transfer'), group('large_wire'), group('internal_transfer'), group('income_basic'),
    group('refunds'), group('bank_fees'),
  ]),
  persona('risk_fee_prone', 'qa_plaid_benchmark_risk_01', ['checking', 'credit', 'savings'], [
    group('bank_fees'), group('risk_controls'), group('cash_like'), group('large_legitimate'),
    group('refunds'), group('food_delivery'),
  ]),
  persona('ambiguous_adversarial', 'qa_plaid_benchmark_ambiguous_01', ['checking', 'credit', 'savings'], [
    group('ambiguous_digital'), group('ambiguous_medical'), group('ambiguous_travel'), group('dirty_strings'),
    group('large_legitimate'), group('food_drink'),
  ]),
  persona('student_young_professional', 'qa_plaid_benchmark_student_01', ['checking', 'credit', 'loan'], [
    group('student_life'), group('loan_payments'), group('subscriptions'), group('food_delivery'),
    group('p2p_transfer'), group('transportation'),
  ]),
  persona('senior_fixed_income', 'qa_plaid_benchmark_senior_01', ['checking', 'credit', 'savings'], [
    group('fixed_income'), group('medical'), group('government'), group('utilities_rent'),
    group('personal_care'), group('bank_fees'),
  ]),
  persona('gig_worker_mixed_income', 'qa_plaid_benchmark_gig_01', ['checking', 'credit', 'savings'], [
    group('gig_income'), group('transportation'), group('business_saas'), group('tax_payments'),
    group('food_drink'), group('refunds'),
  ]),
  persona('nonprofit_community', 'qa_plaid_benchmark_nonprofit_01', ['checking', 'credit', 'savings'], [
    group('nonprofit'), group('government'), group('business_vendor'), group('general_services'),
    group('income_basic'), group('bank_fees'),
  ]),
];

const GROUPS = {
  food_drink: [
    tx('STARBUCKS STORE #1234', 6.5, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 1, 1, 'common card dining'),
    tx('CHIPOTLE 3320', 14.2, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 1, 1, 'quick service restaurant'),
    tx('TST* SWEETGREEN ON HOWARD', 16.45, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 2, 2, 'processor prefix merchant cleaning'),
  ],
  food_delivery: [
    tx('DOORDASH*MCDONALDS', 22.99, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 2, 2, 'delivery aggregator merchant'),
    tx('UBER EATS HELP.UBER.COM', 31.4, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 2, 2, 'delivery vs rideshare ambiguity'),
  ],
  groceries_retail: [
    tx('WHOLEFDS MARKET 10048', 87.35, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 1, 1, 'grocery spend'),
    tx('TARGET 00012345', 64.99, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 2, 'mixed-category retailer'),
    tx('WAL-MART #2604', 73.4, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 2, 'mixed-category retailer'),
  ],
  utilities_rent: [
    tx('COMED ELECTRIC BILLPAY', 142.3, 'RENT_AND_UTILITIES', 'ach_utilities', 'ach', 'debit', {}, 1, 1, 'utility ACH bill pay'),
    tx('PG&E PAYMENT', 98.7, 'RENT_AND_UTILITIES', 'ach_utilities', 'ach', 'debit', {}, 1, 1, 'utility payment'),
    tx('RENT APT 4B LANDLORD', 2400, 'RENT_AND_UTILITIES', 'ach_rent', 'ach', 'debit', { life_event_candidate: false }, 2, 1, 'rent control row'),
  ],
  income_basic: [
    tx('ACME CORP PAYROLL DIRECT DEP', -4280.15, 'INCOME', 'ach_income', 'ach', 'credit', {}, 1, 1, 'payroll income'),
    tx('IRS TREAS 310 TAX REFUND', -1240, 'INCOME', 'ach_income', 'ach', 'credit', {}, 2, 1, 'tax refund credit'),
  ],
  contractor_income: [
    tx('STRIPE PAYOUT VENTUS CONSULTING', -3820.44, 'INCOME', 'ach_income', 'ach', 'credit', {}, 2, 2, 'contractor platform payout'),
    tx('UPWORK ESCROW PAYMENT', -940.25, 'INCOME', 'ach_income', 'ach', 'credit', {}, 2, 2, 'freelance marketplace income'),
  ],
  gig_income: [
    tx('UBER TECHNOLOGIES PAYOUT', -612.22, 'INCOME', 'ach_income', 'ach', 'credit', {}, 2, 2, 'gig income'),
    tx('DOORDASH DASHPASS PAYOUT', -488.19, 'INCOME', 'ach_income', 'ach', 'credit', {}, 2, 2, 'gig income with food brand ambiguity'),
  ],
  fixed_income: [
    tx('SSA TREAS 310 SOC SEC', -2210.5, 'INCOME', 'ach_income', 'ach', 'credit', {}, 1, 1, 'fixed income'),
    tx('PENSION BENEFIT GUARANTY', -1840, 'INCOME', 'ach_income', 'ach', 'credit', {}, 1, 1, 'pension income'),
  ],
  p2p_transfer: [
    tx('ZELLE PAYMENT TO ALEX R', 75, 'TRANSFER_OUT', 'p2p_transfer', 'p2p', 'debit', {}, 1, 1, 'P2P transfer out'),
    tx('VENMO FROM JANE C', -45, 'TRANSFER_IN', 'p2p_transfer', 'p2p', 'credit', {}, 1, 1, 'P2P transfer in'),
    tx('CASH APP*MIKE DINNER', 28.5, 'TRANSFER_OUT', 'p2p_transfer', 'p2p', 'debit', {}, 2, 2, 'P2P with memo-like purpose'),
  ],
  internal_transfer: [
    tx('TRANSFER TO SAVINGS', 500, 'TRANSFER_OUT', 'ach_transfer', 'ach', 'debit', {}, 1, 1, 'internal transfer'),
    tx('ONLINE TRANSFER FROM CHECKING', -500, 'TRANSFER_IN', 'ach_transfer', 'ach', 'credit', {}, 1, 1, 'internal transfer in'),
  ],
  large_wire: [
    tx('WIRE TO TITLE CO ESCROW', 25000, 'TRANSFER_OUT', 'wire_transfer', 'wire', 'debit', { life_event_candidate: true }, 3, 2, 'home purchase life-event signal'),
    tx('WIRE TRANSFER FROM INVESTMENT ACCT', -18000, 'TRANSFER_IN', 'wire_transfer', 'wire', 'credit', {}, 3, 2, 'large inbound transfer'),
  ],
  subscriptions: [
    tx('NETFLIX.COM', 22.99, 'ENTERTAINMENT', 'card_entertainment', 'card', 'debit', {}, 1, 1, 'streaming subscription'),
    tx('SPOTIFY USA', 11.99, 'ENTERTAINMENT', 'card_entertainment', 'card', 'debit', {}, 1, 1, 'music subscription'),
    tx('APPLE.COM/BILL 866-712-7753', 9.99, 'ENTERTAINMENT', 'card_entertainment', 'card', 'debit', {}, 3, 3, 'Apple digital vs retail ambiguity'),
  ],
  entertainment: [
    tx('AMC THEATRES #441', 32.5, 'ENTERTAINMENT', 'card_entertainment', 'card', 'debit', {}, 1, 1, 'movie theater'),
    tx('STEAM GAMES PURCHASE', 59.99, 'ENTERTAINMENT', 'card_entertainment', 'card', 'debit', {}, 1, 1, 'gaming purchase'),
  ],
  travel_air_hotel: [
    tx('DELTA AIR LINES 006', 412, 'TRAVEL', 'card_travel', 'card', 'debit', { travel_candidate: true }, 1, 1, 'flight purchase'),
    tx('MARRIOTT HOTELS', 289, 'TRAVEL', 'card_travel', 'card', 'debit', { travel_candidate: true }, 1, 1, 'hotel purchase'),
    tx('AIRBNB * STAY HST-123', 540, 'TRAVEL', 'card_travel', 'card', 'debit', { travel_candidate: true }, 2, 2, 'alternative lodging'),
  ],
  transportation: [
    tx('SHELL OIL 573301', 52.1, 'TRANSPORTATION', 'card_transportation', 'card', 'debit', {}, 1, 1, 'gas station'),
    tx('LYFT *RIDE FRI 8PM', 18.75, 'TRANSPORTATION', 'card_transportation', 'card', 'debit', {}, 1, 1, 'rideshare'),
    tx('PARKING SF METER 44', 6, 'TRANSPORTATION', 'card_transportation', 'card', 'debit', {}, 1, 1, 'parking'),
  ],
  luxury_retail: [
    tx('NORDSTROM #0421', 486.32, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 1, 'higher-spend retail'),
    tx('SAKS FIFTH AVENUE', 1290.2, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 3, 1, 'large legitimate retail'),
  ],
  large_legitimate: [
    tx('COSTCO WHSE #442', 188.62, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', { risk_candidate: false }, 2, 1, 'large normal basket'),
    tx('APPLE STORE #R123', 2199, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', { risk_candidate: false }, 3, 3, 'large legitimate electronics'),
  ],
  refunds: [
    tx('AMAZON.COM REFUND', -35, 'GENERAL_MERCHANDISE', 'card_refund', 'card', 'credit', {}, 2, 1, 'refund credit'),
    tx('TARGET STORE RETURN', -64.99, 'GENERAL_MERCHANDISE', 'card_refund', 'card', 'credit', {}, 2, 1, 'retail return'),
  ],
  home_improvement: [
    tx('HOME DEPOT #1234', 234.5, 'HOME_IMPROVEMENT', 'card_home_improvement', 'card', 'debit', { life_event_candidate: false }, 1, 1, 'home improvement'),
    tx('LOWES #0832', 96.3, 'HOME_IMPROVEMENT', 'card_home_improvement', 'card', 'debit', { life_event_candidate: false }, 1, 1, 'home improvement'),
    tx('IKEA PURCHASE', 310, 'HOME_IMPROVEMENT', 'card_home_improvement', 'card', 'debit', { life_event_candidate: true }, 2, 2, 'possible move/furnishing signal'),
  ],
  home_move: [
    tx('UHAUL MOVING & STORAGE', 164.5, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', { life_event_candidate: true }, 2, 2, 'move signal'),
    tx('USPS CHANGE OF ADDRESS', 1.1, 'GOVERNMENT_AND_NON_PROFIT', 'card_government', 'card', 'debit', { life_event_candidate: true }, 2, 2, 'move signal'),
  ],
  medical: [
    tx('KAISER PERMANENTE', 40, 'MEDICAL', 'card_medical', 'card', 'debit', {}, 1, 1, 'medical copay'),
    tx('CVS PHARMACY #04210', 18.99, 'MEDICAL', 'card_medical', 'card', 'debit', {}, 2, 2, 'pharmacy vs retail ambiguity'),
    tx('QUEST DIAGNOSTICS', 87.15, 'MEDICAL', 'card_medical', 'card', 'debit', {}, 1, 1, 'medical lab'),
  ],
  personal_care: [
    tx('DRYBAR #102', 55, 'PERSONAL_CARE', 'card_personal_care', 'card', 'debit', {}, 1, 1, 'salon'),
    tx('EQUINOX GYM MEMBERSHIP', 220, 'PERSONAL_CARE', 'card_personal_care', 'card', 'debit', {}, 2, 1, 'fitness membership'),
  ],
  pets: [
    tx('CHEWY.COM', 64.5, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 1, 1, 'pet supplies ecommerce'),
    tx('PETCO #1452', 38.2, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 2, 'pet retail vs general merchandise'),
    tx('BANFIELD PET HOSPITAL', 145, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 2, 'veterinary care; must map to Pets, not Health & Wellness'),
  ],
  insurance: [
    tx('BLUE CROSS BLUE SHIELD', 330, 'MEDICAL', 'ach_medical', 'ach', 'debit', {}, 2, 1, 'health insurance premium'),
    tx('STATE FARM INSURANCE', 184.2, 'GENERAL_SERVICES', 'ach_services', 'ach', 'debit', {}, 2, 1, 'insurance service payment'),
  ],
  ambiguous_medical: [
    tx('DELTA DENTAL OF CA', 65, 'MEDICAL', 'card_medical', 'card', 'debit', { travel_candidate: false }, 3, 4, 'Delta Dental must not become airline travel'),
    tx('APPLE DENTAL CLINIC', 125, 'MEDICAL', 'card_medical', 'card', 'debit', {}, 3, 4, 'Apple token but medical category'),
  ],
  ambiguous_digital: [
    tx('AMAZON WEB SERVICES', 6243.99, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', { risk_candidate: false }, 3, 3, 'AWS service vs Amazon retail'),
    tx('AMAZON.COM*AG3KD0HJ5', 35, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 2, 'Amazon retail'),
    tx('GOOGLE *TEMPORARY HOLD', 1, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', { risk_candidate: false }, 3, 3, 'temporary hold control'),
  ],
  ambiguous_travel: [
    tx('DELTA DENTAL PREMIUM', 88, 'MEDICAL', 'ach_medical', 'ach', 'debit', { travel_candidate: false }, 4, 4, 'Delta token but non-travel'),
    tx('SHELL VACATION RENTALS', 900, 'TRAVEL', 'card_travel', 'card', 'debit', { travel_candidate: true }, 4, 4, 'Shell token but travel context'),
  ],
  dirty_strings: [
    tx('SQ *EVANS COFFEE  SAN FRANCISCO CA', 9.75, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 3, 3, 'processor prefix and location suffix'),
    tx('  extra  spaces   STRIP   ', 5, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 3, 3, 'dirty whitespace cleaning'),
    tx('PAYPAL *UNKNOWNSELLER 4029357733', 49.99, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 3, 3, 'payment processor wrapper'),
  ],
  business_saas: [
    tx('TWILIO INC.', 1523.52, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', {}, 2, 1, 'business SaaS'),
    tx('TYPEFORM, S.L.', 42, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', {}, 2, 1, 'business SaaS'),
    tx('OPENAI API PLATFORM', 880.44, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', {}, 2, 1, 'AI/API spend'),
  ],
  business_vendor: [
    tx('GUSTO PAYROLL FEES', 119, 'GENERAL_SERVICES', 'ach_services', 'ach', 'debit', {}, 2, 1, 'business vendor payment'),
    tx('FEDEX SHIPPING 777', 77.32, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', {}, 1, 1, 'shipping service'),
  ],
  business_tax: [
    tx('IRS TAX PAYMENT', 1500, 'GOVERNMENT_AND_NON_PROFIT', 'ach_government', 'ach', 'debit', {}, 2, 1, 'tax payment'),
    tx('CA EDD PAYROLL TAX', 612.45, 'GOVERNMENT_AND_NON_PROFIT', 'ach_government', 'ach', 'debit', {}, 2, 1, 'payroll tax'),
  ],
  payroll: [
    tx('GUSTO PAYROLL ACH', 6200, 'GENERAL_SERVICES', 'ach_services', 'ach', 'debit', {}, 2, 2, 'employer payroll outflow'),
    tx('ADP PAYROLL PROCESSING', 8140, 'GENERAL_SERVICES', 'ach_services', 'ach', 'debit', {}, 2, 2, 'payroll processor'),
  ],
  tax_payments: [
    tx('IRS ESTIMATED TAX PAYMENT', 980, 'GOVERNMENT_AND_NON_PROFIT', 'ach_government', 'ach', 'debit', {}, 2, 1, 'estimated taxes'),
    tx('CA FTB TAX PAYMENT', 420, 'GOVERNMENT_AND_NON_PROFIT', 'ach_government', 'ach', 'debit', {}, 2, 1, 'state taxes'),
  ],
  loan_payments: [
    tx('SALLIE MAE STUDENT LOAN', 350, 'LOAN_PAYMENTS', 'ach_loan', 'ach', 'debit', {}, 1, 1, 'student loan'),
    tx('WELLS FARGO AUTO LOAN', 480, 'LOAN_PAYMENTS', 'ach_loan', 'ach', 'debit', {}, 1, 1, 'auto loan'),
    tx('MORTGAGE PAYMENT CHASE', 2200, 'LOAN_PAYMENTS', 'ach_loan', 'ach', 'debit', { life_event_candidate: false }, 1, 1, 'mortgage payment control'),
  ],
  credit_card_payment: [
    tx('AMEX CREDIT CARD PAYMENT', 10386.06, 'LOAN_PAYMENTS', 'ach_loan', 'ach', 'debit', {}, 2, 1, 'credit card payoff'),
    tx('CHASE CARD AUTOPAY', 2410.14, 'LOAN_PAYMENTS', 'ach_loan', 'ach', 'debit', {}, 2, 1, 'credit card autopay'),
  ],
  bank_fees: [
    tx('MONTHLY MAINTENANCE FEE', 12, 'BANK_FEES', 'bank_fee', 'ach', 'debit', { risk_candidate: false }, 1, 1, 'fee control'),
    tx('OVERDRAFT FEE', 35, 'BANK_FEES', 'bank_fee', 'ach', 'debit', { risk_candidate: true }, 1, 1, 'risk signal'),
    tx('FOREIGN TRANSACTION FEE', 3.2, 'BANK_FEES', 'bank_fee', 'card', 'debit', {}, 1, 1, 'travel-adjacent fee'),
  ],
  risk_controls: [
    tx('CASH ADVANCE FEE', 20, 'BANK_FEES', 'bank_fee', 'card', 'debit', { risk_candidate: true }, 2, 1, 'cash advance risk'),
    tx('RETURNED ITEM FEE', 30, 'BANK_FEES', 'bank_fee', 'ach', 'debit', { risk_candidate: true }, 2, 1, 'payment failure risk'),
  ],
  cash_like: [
    tx('ATM WITHDRAWAL 7 ELEVEN', 120, 'TRANSFER_OUT', 'atm_cash', 'atm', 'debit', {}, 2, 2, 'ATM cash withdrawal'),
    tx('MONEYGRAM TRANSFER', 450, 'TRANSFER_OUT', 'wire_transfer', 'wire', 'debit', { risk_candidate: true }, 3, 2, 'cash-like transfer'),
  ],
  government: [
    tx('CA DMV REGISTRATION', 210, 'GOVERNMENT_AND_NON_PROFIT', 'card_government', 'card', 'debit', {}, 1, 1, 'government payment'),
    tx('USCIS IMMIGRATION FEE', 725, 'GOVERNMENT_AND_NON_PROFIT', 'card_government', 'card', 'debit', {}, 2, 1, 'government fee'),
  ],
  nonprofit: [
    tx('GOODWILL DONATION', 40, 'GOVERNMENT_AND_NON_PROFIT', 'card_government', 'card', 'debit', {}, 1, 1, 'donation'),
    tx('AMERICAN RED CROSS DONATION', 150, 'GOVERNMENT_AND_NON_PROFIT', 'card_government', 'card', 'debit', {}, 1, 1, 'nonprofit donation'),
  ],
  child_family: [
    tx('BRIGHT HORIZONS CHILDCARE', 1400, 'GENERAL_SERVICES', 'ach_services', 'ach', 'debit', { life_event_candidate: true }, 2, 2, 'childcare signal'),
    tx('BUYBUY BABY STORE', 380, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', { life_event_candidate: true }, 2, 2, 'new baby signal'),
  ],
  student_life: [
    tx('UNIVERSITY BOOKSTORE', 245.7, 'GENERAL_MERCHANDISE', 'card_retail', 'card', 'debit', {}, 2, 1, 'student spend'),
    tx('CAMPUS DINING HALL', 18.4, 'FOOD_AND_DRINK', 'card_food', 'card', 'debit', {}, 1, 1, 'student food'),
  ],
  general_services: [
    tx('LEGALZOOM SERVICES', 299, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', {}, 2, 1, 'general service'),
    tx('INTUIT QUICKBOOKS', 85, 'GENERAL_SERVICES', 'card_services', 'card', 'debit', {}, 2, 1, 'financial software service'),
  ],
};

const selectedPersonas = phase === 'calibration' ? PERSONAS.slice(0, 8) : PERSONAS;
const designRows = [];
let scenarioCounter = 0;

const users = selectedPersonas.flatMap((personaDef) => buildMicroUsersForPersona(personaDef));
const manifestBatches = chunk(users, maxUsersPerManifest);
const batchByCustomerId = new Map();
manifestBatches.forEach((batchUsers, batchIndex) => {
  for (const user of batchUsers) batchByCustomerId.set(user.customer_id, batchId(batchIndex));
});
for (const row of designRows) row.batch_id = batchByCustomerId.get(row.customer_id) || null;

const manifests = manifestBatches.map((batchUsers, batchIndex) => buildManifest(batchUsers, batchIndex));

const summary = {
  phase,
  generated_at: new Date().toISOString(),
  batches: manifests.length,
  users: users.length,
  designed_transactions: designRows.length,
  transactions_per_micro_user: transactionsPerMicroUser,
  max_users_per_manifest: maxUsersPerManifest,
  batch_manifests: manifests.map((manifest) => ({
    batch_id: manifest._ventus_batch_id,
    users: manifest.users.length,
    designed_transactions: manifest._ventus_designed_transaction_count,
  })),
  personas: selectedPersonas.map((p) => p.persona_id),
  intended_pfc_primary: tally(designRows, 'intended_pfc_primary'),
  intended_rail: tally(designRows, 'intended_rail'),
  intended_source_profile: tally(designRows, 'intended_source_profile'),
  difficulty_level: tally(designRows, 'difficulty_level'),
  ambiguity_level: tally(designRows, 'ambiguity_level'),
};

mkdirSync(outputDir, { recursive: true });
const manifestPath = join(outputDir, `plaid-benchmark-${phase}-manifest.json`);
const designKeyPath = join(outputDir, `plaid-benchmark-${phase}-design-key.json`);
const summaryPath = join(outputDir, `plaid-benchmark-${phase}-summary.json`);
const manifestIndexPath = join(outputDir, `plaid-benchmark-${phase}-manifest-index.json`);

const manifestPaths = manifests.map((manifest) => {
  const path = join(outputDir, `plaid-benchmark-${phase}-${manifest._ventus_batch_id}-manifest.json`);
  writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
  return path;
});
writeFileSync(manifestPath, `${JSON.stringify(manifests[0], null, 2)}\n`);
writeFileSync(designKeyPath, `${JSON.stringify({ phase, designs: designRows }, null, 2)}\n`);
writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
writeFileSync(
  manifestIndexPath,
  `${JSON.stringify({ phase, generated_at: summary.generated_at, manifests: manifestPaths }, null, 2)}\n`
);

console.log(`Plaid benchmark manifest index written: ${manifestIndexPath}`);
console.log(`design key: ${designKeyPath}`);
console.log(`summary: ${summaryPath}`);
console.log(`phase: ${phase}`);
console.log(`batches: ${manifests.length}`);
console.log(`users: ${users.length}`);
console.log(`designed transactions: ${designRows.length}`);
console.log(`intended rails: ${Object.keys(summary.intended_rail).join(', ')}`);
console.log(`intended PFC primaries: ${Object.keys(summary.intended_pfc_primary).join(', ')}`);
console.log('');
console.log('Next pull commands:');
for (const path of manifestPaths) console.log(`  PLAID_SANDBOX_USERS_PATH=${path} npm run --prefix backend plaid:sandbox:pull`);

function persona(personaId, customerId, accountKeys, selectedGroups) {
  return { persona_id: personaId, customer_id: customerId, account_keys: accountKeys, groups: selectedGroups };
}

function group(name) {
  return { name };
}

function tx(
  description,
  amount,
  intendedPfcPrimary,
  intendedSourceProfile,
  intendedRail,
  intendedTransactionType,
  expectedSignals,
  difficultyLevel,
  ambiguityLevel,
  reasonThisRowExists
) {
  return {
    description,
    amount,
    intended_pfc_primary: intendedPfcPrimary,
    intended_source_profile: intendedSourceProfile,
    intended_rail: intendedRail,
    intended_transaction_type: intendedTransactionType,
    expected_signals: {
      travel_candidate: expectedSignals.travel_candidate ?? false,
      risk_candidate: expectedSignals.risk_candidate ?? false,
      life_event_candidate: expectedSignals.life_event_candidate ?? false,
    },
    difficulty_level: difficultyLevel,
    ambiguity_level: ambiguityLevel,
    reason_this_row_exists: reasonThisRowExists,
  };
}

function expandPersonaRows(personaDef) {
  return personaDef.groups.flatMap((g) =>
    (GROUPS[g.name] || []).flatMap((row) =>
      Array.from({ length: phaseMultiplier }, (_, variantIndex) => ({
        ...row,
        amount: variantAmount(row.amount, variantIndex),
        group_name: g.name,
        variant_id: `v${variantIndex + 1}`,
      }))
    )
  );
}

function buildMicroUsersForPersona(personaDef) {
  return chunk(expandPersonaRows(personaDef), transactionsPerMicroUser).map((rows, microIndex) => {
    const customerId = microCustomerId(personaDef.customer_id, microIndex);
    return {
      customer_id: customerId,
      username: 'user_custom',
      custom_user: {
        override_accounts: buildAccountsForRows(personaDef, customerId, rows),
      },
      _ventus_persona_id: personaDef.persona_id,
      _ventus_micro_user: microIndex + 1,
    };
  });
}

function buildManifest(batchUsers, batchIndex) {
  const id = batchId(batchIndex);
  const designedTransactionCount = batchUsers.reduce(
    (sum, user) => sum + user.custom_user.override_accounts.reduce((a, account) => a + account.transactions.length, 0),
    0
  );
  return {
    run_id: `plaid_benchmark_${phase}_${id}`,
    institution_id: institutionId,
    products: ['transactions'],
    country_codes: ['US'],
    transactions: {
      start_date: '2026-01-01',
      end_date: '2026-06-20',
    },
    _ventus_purpose:
      'Benchmark pull for Ventus AI Plaid and multi-LLM enrichment evaluation. Design key contains intended identity; Plaid PFC is not golden truth.',
    _ventus_phase: phase,
    _ventus_batch_id: id,
    _ventus_batch_count: manifestBatches.length,
    _ventus_user_count: batchUsers.length,
    _ventus_designed_transaction_count: designedTransactionCount,
    users: batchUsers,
  };
}

function chunk(rows, size) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

function buildAccountsForRows(personaDef, customerId, rows) {
  const accountKeys = ['checking', 'credit'];
  const buckets = Object.fromEntries(personaDef.account_keys.map((key) => [key, []]));

  rows.forEach((row, index) => {
    const preferred = preferredAccountKey(row, accountKeys);
    const accountKey = preferred || accountKeys[index % accountKeys.length];
    buckets[accountKey].push(row);
  });

  return accountKeys
    .filter((accountKey) => buckets[accountKey].length > 0)
    .map((accountKey) => {
      const template = ACCOUNT_TEMPLATES[accountKey];
      return {
        type: template.type,
        subtype: template.subtype,
        transactions: buckets[accountKey].map((row, index) =>
          buildPlaidTransaction(row, index, personaDef, customerId, template.label)
        ),
        identity: buildIdentity(personaDef.persona_id),
        _ventus_account_label: template.label,
      };
    });
}

function preferredAccountKey(row, accountKeys) {
  if (row.intended_rail === 'card' && accountKeys.includes('credit')) return 'credit';
  if (row.intended_source_profile.includes('loan') && accountKeys.includes('loan')) return 'loan';
  if (row.intended_transaction_type === 'credit' && accountKeys.includes('checking')) return 'checking';
  if (['ach', 'p2p', 'wire', 'atm'].includes(row.intended_rail) && accountKeys.includes('checking')) return 'checking';
  return null;
}

function buildPlaidTransaction(row, index, personaDef, customerId, accountLabel) {
  const scenarioId = `pbm_${String(++scenarioCounter).padStart(4, '0')}`;
  const dateTransacted = dateForIndex(index + scenarioCounter);
  const postedDate = row.description.includes('TEMPORARY HOLD') ? '2099-01-01' : dateTransacted;
  const description = `${row.description} REF ${scenarioId.toUpperCase()}`;
  const transaction = {
    amount: row.amount,
    description,
    currency: 'USD',
    date_transacted: dateTransacted,
    date_posted: postedDate,
  };

  designRows.push({
    scenario_id: scenarioId,
    persona_id: personaDef.persona_id,
    customer_id: customerId,
    account_label: accountLabel,
    account_type: ACCOUNT_TEMPLATES[accountLabel === 'credit_card' ? 'credit' : 'checking'].type,
    account_subtype: ACCOUNT_TEMPLATES[accountLabel === 'credit_card' ? 'credit' : 'checking'].subtype,
    description,
    base_description: row.description,
    amount: row.amount,
    intended_pfc_primary: row.intended_pfc_primary,
    intended_rail: row.intended_rail,
    intended_source_profile: row.intended_source_profile,
    intended_transaction_type: row.intended_transaction_type,
    expected_signals: row.expected_signals,
    difficulty_level: row.difficulty_level,
    ambiguity_level: row.ambiguity_level,
    reason_this_row_exists: row.reason_this_row_exists,
    source_group: row.group_name,
    variant_id: row.variant_id,
  });

  return transaction;
}

function microCustomerId(baseCustomerId, microIndex) {
  return `${baseCustomerId}_m${String(microIndex + 1).padStart(2, '0')}`;
}

function batchId(batchIndex) {
  return `batch-${String(batchIndex + 1).padStart(2, '0')}`;
}

function variantAmount(amount, variantIndex) {
  if (variantIndex === 0) return amount;
  const direction = amount < 0 ? -1 : 1;
  const adjustment = direction * (variantIndex * 1.37);
  return Number((amount + adjustment).toFixed(2));
}

function buildIdentity(personaId) {
  return {
    names: [`Ventus ${titleCase(personaId)}`],
    addresses: [
      {
        primary: true,
        data: {
          country: 'US',
          city: 'New York',
          street: '10003 Benchmark Ave',
          postal_code: '10003',
          region: 'NY',
        },
      },
    ],
  };
}

function dateForIndex(index) {
  const month = String((index % 6) + 1).padStart(2, '0');
  const day = String((index % 24) + 1).padStart(2, '0');
  return `2026-${month}-${day}`;
}

function tally(rows, key) {
  const map = new Map();
  for (const row of rows) map.set(row[key], (map.get(row[key]) || 0) + 1);
  return Object.fromEntries([...map.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
}

function titleCase(value) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
