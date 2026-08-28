// Builds a deterministic Plaid-compatible synthetic benchmark from the Ventus
// benchmark design key. This creates volume for model evaluation without
// pretending Plaid Sandbox returned every designed transaction.

import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePlaidTransactionsSync } from '../shared/pipeline/plaid-transactions-sync.mjs';
import { validateEnrichTransaction } from '../scripts/lib/qa-validators.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const defaultArtifactRoot = join(backendRoot, 'artifacts', 'plaid-benchmark-manifest');
const designKeyPath = resolve(
  process.env.PLAID_BENCHMARK_DESIGN_KEY_PATH ||
    join(defaultArtifactRoot, 'plaid-benchmark-benchmark-design-key.json')
);
const outputDir = resolve(
  process.env.PLAID_SYNTHETIC_BENCHMARK_OUTPUT_DIR ||
    join(backendRoot, 'artifacts', 'plaid-synthetic-benchmark')
);

const CANONICAL_MERCHANT_NAMES = [
  [/^STARBUCKS\b/i, 'Starbucks'],
  [/^CHIPOTLE\b/i, 'Chipotle'],
  [/SWEETGREEN/i, 'Sweetgreen'],
  [/^WHOLEFDS\b/i, 'Whole Foods'],
  [/^TARGET\b/i, 'Target'],
  [/^WAL-MART\b/i, 'Walmart'],
  [/^COMED\b/i, 'ComEd Electric'],
  [/^PG&E\b/i, 'PG&E'],
  [/^RENT APT/i, 'Rent Payment'],
  [/^ACME CORP PAYROLL/i, 'Acme Corp Payroll'],
  [/^IRS TREAS/i, 'IRS Tax Refund'],
  [/^IRS TAX PAYMENT/i, 'IRS Tax Payment'],
  [/^IRS ESTIMATED TAX/i, 'IRS Estimated Tax Payment'],
  [/^ZELLE PAYMENT TO/i, 'Zelle Payment'],
  [/^VENMO FROM/i, 'Venmo Payment'],
  [/^CASH APP/i, 'Cash App'],
  [/^NETFLIX/i, 'Netflix'],
  [/^SPOTIFY/i, 'Spotify'],
  [/^APPLE\.COM\/BILL/i, 'Apple'],
  [/^APPLE STORE/i, 'Apple Store'],
  [/^APPLE DENTAL/i, 'Apple Dental Clinic'],
  [/^DELTA AIR LINES/i, 'Delta Air Lines'],
  [/^MARRIOTT/i, 'Marriott'],
  [/^AIRBNB/i, 'Airbnb'],
  [/^SHELL OIL/i, 'Shell'],
  [/^SHELL VACATION RENTALS/i, 'Shell Vacation Rentals'],
  [/^LYFT/i, 'Lyft'],
  [/^PARKING/i, 'Parking Meter'],
  [/^NORDSTROM/i, 'Nordstrom'],
  [/^SAKS FIFTH AVENUE/i, 'Saks Fifth Avenue'],
  [/^COSTCO/i, 'Costco'],
  [/^AMAZON\.COM REFUND/i, 'Amazon Refund'],
  [/^AMAZON\.COM/i, 'Amazon'],
  [/^AMAZON WEB SERVICES/i, 'Amazon Web Services'],
  [/^GOOGLE/i, 'Google'],
  [/^DOORDASH/i, 'DoorDash'],
  [/^UBER EATS/i, 'Uber Eats'],
  [/^UBER TECHNOLOGIES/i, 'Uber'],
  [/^BRIGHT HORIZONS/i, 'Bright Horizons'],
  [/^BUYBUY BABY/i, 'Buybuy Baby'],
  [/^KAISER PERMANENTE/i, 'Kaiser Permanente'],
  [/^CVS PHARMACY/i, 'CVS Pharmacy'],
  [/^QUEST DIAGNOSTICS/i, 'Quest Diagnostics'],
  [/^UHAUL/i, 'U-Haul'],
  [/^USPS CHANGE OF ADDRESS/i, 'USPS Change of Address'],
  [/^DRYBAR/i, 'Drybar'],
  [/^EQUINOX/i, 'Equinox'],
  [/^BLUE CROSS BLUE SHIELD/i, 'Blue Cross Blue Shield'],
  [/^STATE FARM/i, 'State Farm'],
  [/^DELTA DENTAL/i, 'Delta Dental'],
  [/^HOME DEPOT/i, 'Home Depot'],
  [/^LOWES/i, "Lowe's"],
  [/^IKEA/i, 'IKEA'],
  [/^CA DMV/i, 'California DMV'],
  [/^USCIS/i, 'USCIS'],
  [/^TWILIO/i, 'Twilio'],
  [/^TYPEFORM/i, 'Typeform'],
  [/^OPENAI/i, 'OpenAI'],
  [/^GUSTO PAYROLL FEES/i, 'Gusto Payroll Fees'],
  [/^GUSTO PAYROLL ACH/i, 'Gusto Payroll'],
  [/^ADP PAYROLL/i, 'ADP Payroll'],
  [/^FEDEX/i, 'FedEx'],
  [/^CA EDD/i, 'California EDD Payroll Tax'],
  [/^CA FTB/i, 'California FTB Tax Payment'],
  [/^WIRE TO TITLE CO/i, 'Title Company Escrow'],
  [/^WIRE TRANSFER FROM INVESTMENT/i, 'Investment Account Transfer'],
  [/^STRIPE PAYOUT/i, 'Stripe Payout'],
  [/^UPWORK ESCROW/i, 'Upwork Escrow'],
  [/^SALLIE MAE/i, 'Sallie Mae Student Loan'],
  [/^WELLS FARGO AUTO LOAN/i, 'Wells Fargo Auto Loan'],
  [/^MORTGAGE PAYMENT CHASE/i, 'Chase Mortgage Payment'],
  [/^MONTHLY MAINTENANCE FEE/i, 'Monthly Maintenance Fee'],
  [/^OVERDRAFT FEE/i, 'Overdraft Fee'],
  [/^FOREIGN TRANSACTION FEE/i, 'Foreign Transaction Fee'],
  [/^AMEX CREDIT CARD PAYMENT/i, 'Amex Credit Card Payment'],
  [/^CHASE CARD AUTOPAY/i, 'Chase Card Autopay'],
  [/^CASH ADVANCE FEE/i, 'Cash Advance Fee'],
  [/^RETURNED ITEM FEE/i, 'Returned Item Fee'],
  [/^TRANSFER TO SAVINGS/i, 'Transfer to Savings'],
  [/^ONLINE TRANSFER FROM CHECKING/i, 'Transfer from Checking'],
  [/^ATM WITHDRAWAL/i, 'ATM Withdrawal'],
  [/^MONEYGRAM/i, 'MoneyGram'],
  [/^SQ \*EVANS COFFEE/i, 'Evans Coffee'],
  [/extra\s+spaces\s+strip/i, 'Strip'],
  [/^PAYPAL \*UNKNOWNSELLER/i, 'PayPal Unknown Seller'],
  [/^UNIVERSITY BOOKSTORE/i, 'University Bookstore'],
  [/^CAMPUS DINING/i, 'Campus Dining Hall'],
  [/^SSA TREAS/i, 'Social Security Administration'],
  [/^PENSION BENEFIT/i, 'Pension Benefit Guaranty Corporation'],
  [/^GOODWILL/i, 'Goodwill'],
  [/^AMERICAN RED CROSS/i, 'American Red Cross'],
  [/^LEGALZOOM/i, 'LegalZoom'],
  [/^INTUIT/i, 'Intuit QuickBooks'],
  [/^AMC THEATRES/i, 'AMC Theatres'],
  [/^STEAM/i, 'Steam'],
  [/^CHEWY/i, 'Chewy'],
  [/^PETCO/i, 'Petco'],
  [/^PETSMART/i, 'PetSmart'],
  [/^BANFIELD/i, 'Banfield Pet Hospital'],
];

const MERCHANT_CATEGORY_RULES = [
  [/STARBUCKS|EVANS COFFEE/i, 'Coffee Shops', ['Coffee Shop']],
  [/CHIPOTLE|SWEETGREEN/i, 'Fast Casual Restaurant', ['Fast Casual Restaurants', 'Restaurant']],
  [/^WAL-MART/i, 'Discount Retail', ['General Merchandise', 'Grocery', 'Retail']],
  [/WHOLEFDS|WAL-MART|COSTCO|CVS PHARMACY/i, 'Grocery', ['Groceries', 'Grocery Store']],
  [/TARGET|AMAZON\.COM\*|AMAZON\.COM REFUND/i, 'General Merchandise', ['General Merchandise Retailer', 'Retail']],
  [/DOORDASH|UBER EATS|CAMPUS DINING/i, 'Food Delivery', ['Restaurants', 'Restaurant']],
  [/COMED|PG&E/i, 'Utilities', ['Utilities - Electric', 'Utilities - Electric & Gas']],
  [/^RENT APT/i, 'Rent', ['Rent Payment', 'Housing']],
  [/PAYROLL DIRECT DEP|STRIPE PAYOUT|UBER TECHNOLOGIES PAYOUT|DOORDASH DASHPASS PAYOUT/i, 'Income', ['Payroll', 'Payroll - Direct Deposit']],
  [/IRS TREAS|SSA TREAS|PENSION BENEFIT/i, 'Government Benefits', ['Government Tax Refund', 'Income']],
  [/ZELLE|VENMO|CASH APP|TRANSFER TO SAVINGS|ONLINE TRANSFER/i, 'Transfers', ['P2P Transfer', 'Peer-to-Peer Transfers']],
  [/NETFLIX|SPOTIFY/i, 'Streaming Subscriptions', ['Streaming Subscription']],
  [/APPLE\.COM\/BILL/i, 'Software & Apps', ['Software Subscription']],
  [/APPLE STORE|BEST BUY/i, 'Electronics', []],
  [/DELTA AIR LINES/i, 'Flights', ['Airlines']],
  [/MARRIOTT|AIRBNB|SHELL VACATION RENTALS/i, 'Hotels & Lodging', ['Lodging']],
  [/SHELL OIL/i, 'Gas Stations', ['Gas']],
  [/LYFT/i, 'Rideshare', ['Taxi & Rideshare']],
  [/PARKING/i, 'Parking', []],
  [/CHEWY|PETCO|PETSMART|BANFIELD|PET HOSPITAL/i, 'Pet Supplies & Veterinary', ['Retail', 'Medical & Healthcare']],
  [/NORDSTROM|SAKS FIFTH AVENUE|DRYBAR|EQUINOX/i, 'Personal Care & Lifestyle', ['Personal Care']],
  [/LEGALZOOM/i, 'Legal Services', []],
  [/INTUIT|AMAZON WEB SERVICES|TWILIO|TYPEFORM|OPENAI|GUSTO PAYROLL FEES|ADP PAYROLL/i, 'Business Software & Services', ['Business Services']],
  [/AMC THEATRES|STEAM/i, 'Entertainment', []],
  [/GOOGLE \*TEMPORARY HOLD/i, 'Temporary Hold', ['Preauthorization']],
  [/BRIGHT HORIZONS|BUYBUY BABY|UNIVERSITY BOOKSTORE|CAMPUS DINING/i, 'Family & Education', ['Childcare & Education']],
  [/KAISER|QUEST DIAGNOSTICS|APPLE DENTAL|DELTA DENTAL/i, 'Medical & Healthcare', ['Medical']],
  [/BLUE CROSS|STATE FARM/i, 'Insurance & Premiums', ['Insurance']],
  [/UHAUL|USPS CHANGE OF ADDRESS/i, 'Moving', ['Moving Services']],
  [/HOME DEPOT|LOWES|IKEA/i, 'Home Improvement', []],
  [/CA DMV|USCIS|IRS TAX PAYMENT|IRS ESTIMATED TAX|CA EDD|CA FTB/i, 'Government & Taxes', ['Taxes']],
  [/FEDEX/i, 'Shipping', []],
  [/WIRE TO TITLE CO|WIRE TRANSFER FROM INVESTMENT|UPWORK ESCROW/i, 'Large Transfers', ['Financial Services']],
  [/SALLIE MAE|WELLS FARGO AUTO LOAN|MORTGAGE PAYMENT/i, 'Loan Payments', ['Financial Services']],
  [/MAINTENANCE FEE|OVERDRAFT FEE|FOREIGN TRANSACTION FEE|CASH ADVANCE FEE|RETURNED ITEM FEE/i, 'Bank Fees', ['Financial Services']],
  [/AMEX CREDIT CARD PAYMENT|CHASE CARD AUTOPAY/i, 'Credit Card Payments', ['Loan Payments']],
  [/ATM WITHDRAWAL|MONEYGRAM/i, 'Cash & Money Transfer', ['Financial Services']],
  [/PAYPAL \*UNKNOWNSELLER/i, 'Ambiguous Merchant', ['Unknown Merchant']],
  [/GOODWILL|AMERICAN RED CROSS/i, 'Charitable Donations', ['Donations']],
];

const designKey = readJson(designKeyPath);
assert.ok(Array.isArray(designKey.designs), 'design key must contain designs[]');

const rows = designKey.designs;
const payload = buildPlaidSyncPayload(rows);
const mappingContext = buildMappingContext(payload);
const normalized = normalizePlaidTransactionsSync({
  payload,
  mapping_context: mappingContext,
});

assert.equal(
  normalized.transactions.length,
  rows.length,
  `expected ${rows.length} synthetic rows to normalize, got ${normalized.transactions.length}`
);
assert.equal(normalized.rejected_records.length, 0, 'synthetic benchmark should not reject designed rows');

const expectations = rows.map((row) => buildExpectation(row, normalized.transactions));
const enrichFixture = {
  fixture_type: 'plaid_synthetic_benchmark_enrich_input',
  source_system: 'plaid_synthetic_benchmark',
  generated_at: new Date().toISOString(),
  design_key_path: designKeyPath,
  transaction_count: normalized.transactions.length,
  transactions: normalized.transactions,
};
enrichFixture.transactions.forEach((transaction, index) =>
  validateEnrichTransaction(transaction, `plaid_synthetic_benchmark.transactions[${index}]`)
);

const expectationSet = {
  fixture_version: new Date().toISOString().slice(0, 10),
  source: {
    type: 'plaid_compatible_synthetic_benchmark',
    design_key_path: designKeyPath,
    generation: 'deterministic_from_benchmark_design_key',
  },
  description:
    'Synthetic Plaid-compatible benchmark expectations for model evaluation. Labels come from the design key and should be human-reviewed before promotion to frozen golden truth.',
  minimum_expected_coverage: {
    plaid_synthetic_benchmark: expectations.length,
  },
  expectations,
};

const summary = {
  generated_at: new Date().toISOString(),
  design_key_path: designKeyPath,
  output_dir: outputDir,
  designed_transactions: rows.length,
  normalized_transactions: normalized.transactions.length,
  rejected_records: normalized.rejected_records.length,
  by_persona: countBy(rows, (row) => row.persona_id),
  by_rail: countBy(rows, (row) => row.intended_rail),
  by_source_profile: countBy(rows, (row) => row.intended_source_profile),
  by_pfc_primary: countBy(rows, (row) => row.intended_pfc_primary),
  by_difficulty: countBy(rows, (row) => String(row.difficulty_level)),
  by_ambiguity: countBy(rows, (row) => String(row.ambiguity_level)),
};

mkdirSync(outputDir, { recursive: true });
writeJson(join(outputDir, 'plaid-compatible-raw-sync.json'), payload);
writeJson(join(outputDir, 'normalized-transactions.json'), { transactions: normalized.transactions });
writeJson(join(outputDir, 'plaid-synthetic-benchmark-expectations.json'), expectationSet);
writeJson(join(outputDir, 'plaid-synthetic-benchmark-enrich-fixture.json'), enrichFixture);
writeJson(join(outputDir, 'summary.json'), summary);

console.log(`Plaid synthetic benchmark written: ${outputDir}`);
console.log(`transactions: ${normalized.transactions.length}`);
console.log(`expectations: ${join(outputDir, 'plaid-synthetic-benchmark-expectations.json')}`);
console.log(`enrich fixture: ${join(outputDir, 'plaid-synthetic-benchmark-enrich-fixture.json')}`);
console.log(`summary: ${join(outputDir, 'summary.json')}`);

function buildPlaidSyncPayload(designs) {
  const accountsByKey = new Map();
  const added = designs.map((row) => {
    const accountId = syntheticAccountId(row);
    accountsByKey.set(accountId, {
      account_id: accountId,
      type: row.account_type,
      subtype: row.account_subtype,
      name: `${row.persona_id} ${row.account_label}`,
      official_name: `${row.persona_id} ${row.account_label}`,
    });

    return {
      transaction_id: row.scenario_id,
      account_id: accountId,
      amount: row.amount,
      date: dateForScenario(row.scenario_id),
      name: row.description,
      original_description: row.description,
      merchant_name: merchantName(row),
      iso_currency_code: 'USD',
      unofficial_currency_code: null,
      pending: false,
      payment_channel: paymentChannel(row),
      personal_finance_category: pfcForRow(row),
      counterparties: counterpartiesForRow(row),
      location: {
        postal_code: '10003',
      },
    };
  });

  return {
    accounts: [...accountsByKey.values()],
    added,
    modified: [],
    removed: [],
    has_more: false,
    next_cursor: 'synthetic-cursor',
    transactions_update_status: 'HISTORICAL_UPDATE_COMPLETE',
    request_id: 'synthetic_plaid_benchmark',
  };
}

function buildMappingContext(payload) {
  const accountCustomerMap = {};
  const accountHomeZipMap = {};
  for (const account of payload.accounts) {
    const customerId = account.account_id.replace(/^synthetic_acc_/, '').replace(/_(checking|credit_card)$/, '');
    accountCustomerMap[account.account_id] = customerId;
    accountHomeZipMap[account.account_id] = '10003';
  }
  return {
    account_customer_map: accountCustomerMap,
    account_home_zip_map: accountHomeZipMap,
  };
}

function buildExpectation(row, normalizedTransactions) {
  const normalized = normalizedTransactions.find((txn) => txn.transaction_id === row.scenario_id);
  assert.ok(normalized, `missing normalized transaction for ${row.scenario_id}`);
  const lifestyle = lifestyleCategory(row);
  const category = merchantCategory(row);
  return {
    transaction_id: row.scenario_id,
    source_system: 'plaid_synthetic_benchmark',
    rail: normalized.rail,
    source_profile: normalized.source_profile,
    transaction_type: normalized.transaction_type,
    expected_clean_merchant_name: canonicalMerchantName(row),
    accepted_clean_merchant_names: acceptedCleanMerchantNames(row),
    expected_lifestyle_category: lifestyle.expected,
    accepted_lifestyle_categories: lifestyle.accepted,
    expected_merchant_category: category.expected,
    accepted_merchant_categories: category.accepted,
    expected_confidence_min: confidenceMin(row),
    expected_signals: row.expected_signals,
    label_status: 'synthetic_design_key_requires_human_review',
    label_rationale: row.reason_this_row_exists,
    persona_id: row.persona_id,
    batch_id: row.batch_id ?? null,
    difficulty_level: row.difficulty_level,
    ambiguity_level: row.ambiguity_level,
  };
}

function syntheticAccountId(row) {
  return `synthetic_acc_${row.customer_id}_${row.account_label}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

function merchantName(row) {
  return row.base_description || row.description.replace(/\s+REF\s+PBM_\d+$/i, '');
}

function canonicalMerchantName(row) {
  const raw = merchantName(row).trim();
  const match = CANONICAL_MERCHANT_NAMES.find(([pattern]) => pattern.test(raw));
  if (match) return match[1];

  return toTitleCase(
    raw
      .replace(/\bREF\s+PBM_\d+\b/gi, '')
      .replace(/\bSTORE\b|\bPAYMENT\b|\bPURCHASE\b|\bBILLPAY\b/gi, '')
      .replace(/[#*]/g, ' ')
      .replace(/\b\d{2,}\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function acceptedCleanMerchantNames(row) {
  const raw = merchantName(row).trim();
  const accepted = [canonicalMerchantName(row)];

  if (/^WHOLEFDS\b/i.test(raw)) accepted.push('Whole Foods Market');
  if (/^RENT APT/i.test(raw)) accepted.push('Apartment 4B Rent');
  if (/^ZELLE PAYMENT TO/i.test(raw)) accepted.push('Zelle Payment to Alex R');
  if (/^VENMO FROM/i.test(raw)) accepted.push('Venmo from Jane C');
  if (/^CASH APP/i.test(raw)) accepted.push('Cash App Mike Dinner');

  return uniqueStrings(accepted);
}

function pfcForRow(row) {
  return {
    primary: row.intended_pfc_primary,
    detailed: detailedPfc(row),
    confidence_level: 'VERY_HIGH',
  };
}

function detailedPfc(row) {
  const pfc = row.intended_pfc_primary;
  const detailByProfile = {
    card_food: 'FOOD_AND_DRINK_RESTAURANTS',
    card_travel: 'TRAVEL_FLIGHTS',
    card_transportation: 'TRANSPORTATION_TAXIS_AND_RIDE_SHARES',
    card_retail: 'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE',
    card_home_improvement: 'HOME_IMPROVEMENT_HARDWARE',
    card_medical: 'MEDICAL_PRIMARY_CARE',
    card_personal_care: 'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS',
    card_entertainment: 'ENTERTAINMENT_TV_AND_MOVIES',
    ach_income: 'INCOME_WAGES',
    ach_loan: 'LOAN_PAYMENTS_OTHER_PAYMENT',
    ach_utilities: 'RENT_AND_UTILITIES_UTILITIES',
    ach_rent: 'RENT_AND_UTILITIES_RENT',
    ach_government: 'GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES',
    bank_fee: 'BANK_FEES_OTHER_BANK_FEES',
  };
  return detailByProfile[row.intended_source_profile] || `${pfc}_OTHER_${pfc}`;
}

function paymentChannel(row) {
  if (row.intended_rail === 'card') return row.account_type === 'credit' ? 'online' : 'in store';
  return 'other';
}

function counterpartiesForRow(row) {
  if (row.intended_rail === 'p2p') {
    return [{ name: merchantName(row), type: 'payment_app' }];
  }
  if (row.intended_rail === 'wire') {
    return [{ name: merchantName(row), type: 'financial_institution' }];
  }
  return [];
}

function dateForScenario(scenarioId) {
  const numeric = Number(scenarioId.replace(/\D/g, '')) || 1;
  const month = String((numeric % 6) + 1).padStart(2, '0');
  const day = String((numeric % 24) + 1).padStart(2, '0');
  return `2026-${month}-${day}`;
}

function lifestyleCategory(row) {
  const rawMerchantName = merchantName(row);
  if (row.expected_signals.travel_candidate || row.intended_pfc_primary === 'TRAVEL') {
    return categoryWithAliases('Travel & Exploration');
  }
  if (row.intended_pfc_primary === 'TRANSPORTATION') {
    return categoryWithAliases('Home & Living', ['Miscellaneous & Unclassified']);
  }
  if (row.intended_pfc_primary === 'FOOD_AND_DRINK') return categoryWithAliases('Food & Dining');
  // Production's 12-pillar taxonomy splits fitness, apparel/beauty, and pets into
  // their own pillars instead of collapsing them into Health & Wellness / Misc.
  // Mirror those boundaries so benchmark expectations score against production.
  // Legacy labels are kept as accepted aliases until the labels are human-reviewed.
  if (/CHEWY|PETCO|PETSMART|BANFIELD|VETERINAR|\bVET\b|PET HOSPITAL|PET SUPPL/i.test(rawMerchantName)) {
    return categoryWithAliases('Pets', ['Miscellaneous & Unclassified', 'Health & Wellness']);
  }
  if (/EQUINOX|\bGYM\b|FITNESS|LULULEMON|\bREI\b/i.test(rawMerchantName)) {
    return categoryWithAliases('Sports & Active Living', ['Health & Wellness']);
  }
  if (/DRYBAR|\bSALON\b|SEPHORA|ULTA|NORDSTROM|SAKS|\bMACY'?S\b/i.test(rawMerchantName)) {
    return categoryWithAliases('Style & Beauty', ['Health & Wellness', 'Miscellaneous & Unclassified', 'Home & Living']);
  }
  if (row.intended_pfc_primary === 'MEDICAL' || row.intended_pfc_primary === 'PERSONAL_CARE') {
    return categoryWithAliases('Health & Wellness');
  }
  if (/BRIGHT HORIZONS|BUYBUY BABY|UNIVERSITY BOOKSTORE|CAMPUS DINING/i.test(rawMerchantName)) {
    return categoryWithAliases('Family & Community', ['Home & Living']);
  }
  if (
    row.intended_pfc_primary === 'HOME_IMPROVEMENT' ||
    row.intended_pfc_primary === 'RENT_AND_UTILITIES' ||
    row.expected_signals.life_event_candidate
  ) {
    return categoryWithAliases('Home & Living');
  }
  if (
    row.intended_pfc_primary === 'INCOME' ||
    row.intended_pfc_primary === 'LOAN_PAYMENTS' ||
    row.intended_pfc_primary === 'TRANSFER_IN' ||
    row.intended_pfc_primary === 'TRANSFER_OUT'
  ) {
    if (/CASH APP/i.test(rawMerchantName) && /DINNER|LUNCH|MEAL|FOOD|RESTAURANT/i.test(row.description)) {
      return categoryWithAliases('Financial & Aspirational', ['Food & Dining']);
    }
    return categoryWithAliases('Financial & Aspirational');
  }
  if (row.intended_pfc_primary === 'ENTERTAINMENT') {
    if (/APPLE\.COM\/BILL|STEAM/i.test(rawMerchantName)) {
      return categoryWithAliases('Entertainment & Culture', ['Technology & Digital Life']);
    }
    return categoryWithAliases('Entertainment & Culture');
  }
  if (row.intended_pfc_primary === 'GENERAL_SERVICES') {
    if (/INTUIT|QUICKBOOKS/i.test(rawMerchantName)) {
      return categoryWithAliases('Technology & Digital Life', ['Financial & Aspirational']);
    }
    return categoryWithAliases('Technology & Digital Life');
  }
  if (row.intended_pfc_primary === 'GENERAL_MERCHANDISE') {
    if (/APPLE STORE/i.test(rawMerchantName)) {
      return categoryWithAliases('Miscellaneous & Unclassified', ['Home & Living', 'Technology & Digital Life']);
    }
    return categoryWithAliases('Miscellaneous & Unclassified', ['Home & Living']);
  }
  return categoryWithAliases('Miscellaneous & Unclassified');
}

function categoryWithAliases(expected, accepted = []) {
  return { expected, accepted: uniqueStrings([expected, ...accepted]) };
}

function merchantCategory(row) {
  const raw = merchantName(row);
  const match = MERCHANT_CATEGORY_RULES.find(([pattern]) => pattern.test(raw));
  if (match) {
    const expected = match[1];
    return {
      expected,
      accepted: uniqueStrings([expected, ...(match[2] || []), pfcMerchantCategory(row)]),
    };
  }
  const expected = pfcMerchantCategory(row);
  return { expected, accepted: [expected] };
}

function pfcMerchantCategory(row) {
  const labels = {
    BANK_FEES: 'Bank Fees',
    ENTERTAINMENT: 'Entertainment',
    FOOD_AND_DRINK: 'Food & Dining',
    GENERAL_MERCHANDISE: 'Retail',
    GENERAL_SERVICES: 'Services',
    GOVERNMENT_AND_NON_PROFIT: 'Government & Nonprofit',
    HOME_IMPROVEMENT: 'Home Improvement',
    INCOME: 'Income & Payroll',
    LOAN_PAYMENTS: 'Loan Payments',
    MEDICAL: 'Medical',
    PERSONAL_CARE: 'Personal Care',
    RENT_AND_UTILITIES: 'Rent & Utilities',
    TRANSFER_IN: 'Transfers',
    TRANSFER_OUT: 'Transfers',
    TRANSPORTATION: 'Transportation',
    TRAVEL: 'Travel',
  };
  return labels[row.intended_pfc_primary] || row.intended_pfc_primary;
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === 'string' && value.length > 0))];
}

function toTitleCase(value) {
  return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function confidenceMin(row) {
  if (row.ambiguity_level >= 4) return 0.65;
  if (row.ambiguity_level >= 3 || row.difficulty_level >= 3) return 0.7;
  return 0.8;
}

function countBy(values, keyFn) {
  return Object.fromEntries(
    [...values.reduce((counts, value) => {
      const key = keyFn(value);
      counts.set(key, (counts.get(key) || 0) + 1);
      return counts;
    }, new Map()).entries()].sort(([left], [right]) => left.localeCompare(right))
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}
