import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const SOURCE_SYSTEMS = new Set([
  'fis',
  'fiserv',
  'jack_henry',
  'generic_bank_export',
  'adversarial',
  'plaid',
  'generic_fintech_sandbox_partner',
]);
export const MOCK_BANK_SOURCE_SYSTEMS = new Set([
  'fis',
  'fiserv',
  'jack_henry',
  'generic_bank_export',
  'adversarial',
]);
export const PARTNER_SOURCE_SYSTEMS = new Set(['plaid', 'generic_fintech_sandbox_partner']);
export const PARTNER_FIXTURE_TYPES = new Set([
  'raw_partner_payload',
  'normalized_enrichment_input',
  'partner_reject_report',
]);
export const PARTNER_REJECT_REASON_CODES = new Set([
  'missing_account_customer_mapping',
  'missing_home_zip_mapping',
  'missing_transaction_id',
  'missing_account_id',
  'missing_date',
  'invalid_date',
  'missing_amount',
  'invalid_amount',
  'missing_merchant_or_counterparty',
  'ambiguous_amount_direction',
  'unsupported_currency',
  'removed_transaction_not_enriched',
  'pending_transaction_excluded',
  'unsupported_record_shape',
]);
export const SIGNAL_KEYS = ['travel_candidate', 'risk_candidate', 'life_event_candidate'];
export const GOLDEN_EXPECTATION_EQUIVALENCE_GROUPS = {
  clean_merchant_name: [
    ['Chipotle', 'Chipotle Mexican Grill'],
    ['ComEd Electric', 'ComEd', 'COMED'],
    ['Intuit QuickBooks', 'QuickBooks', 'Quickbooks'],
    ['IRS Tax Refund', 'IRS Treasury'],
    ['LegalZoom', 'LegalZoom Services'],
    ['Steam', 'Steam Games'],
    ['Venmo Payment', 'Venmo'],
    ['Walmart', 'WAL-MART', 'Wal-Mart'],
    ['Zelle Payment', 'Zelle'],
  ],
  merchant_category: [
    ['Coffee Shops', 'Coffee Shop', 'Coffee & Café'],
    ['Discount Retail', 'Discount Store', 'Retail / Superstore', 'General Merchandise / Retail'],
    [
      'Fast Casual Restaurant',
      'Fast Casual Restaurants',
      'Healthy Fast Casual',
      'Healthy Fast Casual Restaurant',
      'Healthy Restaurant',
      'Healthy Restaurants',
      'Salad Restaurant',
      'Salad Shop',
    ],
    ['General Merchandise', 'General Merchandise Retailer', 'General Merchandise & Mass Retail'],
    ['Government Benefits', 'Government Tax Refund', 'Tax Refund'],
    ['Grocery', 'Groceries', 'Grocery Store', 'Grocery Stores', 'Grocery & Natural Foods'],
    ['Income', 'Payroll', 'Payroll - Direct Deposit', 'Income & Payroll', 'Payroll / Wages', 'Payroll Deposit', 'Payroll / Income'],
    ['Rent', 'Rent Payment', 'Housing', 'Rent & Utilities', 'Rent / Housing'],
    ['Software & Apps', 'Software Subscription', 'Streaming Subscriptions'],
    ['Transfers', 'P2P Transfer', 'Peer-to-Peer Transfer', 'Peer-to-Peer Transfers', 'Cash & Money Transfer', 'P2P Payment', 'p2p payment'],
    ['Utilities', 'Utilities - Electric', 'Utilities - Electric & Gas', 'Electric Utility', 'Gas & Electric Utility', 'Utility Company', 'utilities_gas_and_electric'],
  ],
  lifestyle_category: [],
};
export const ADVERSARIAL_CATEGORIES = new Set([
  'lookalike',
  'ambiguous_brand',
  'large_legitimate',
  'garbled_merchant',
  'dual_category',
  'missing_field',
]);
export const TRANSACTION_TYPES = new Set(['debit', 'credit', 'signal']);
export const TERMINAL_JOB_STATUSES = new Set(['complete', 'failed']);
export const JOB_STATUSES = new Set([
  'ingested',
  'classified',
  'pillar_analyzed',
  'travel_detected',
  'lifestyle_analyzed',
  'risk_analyzed',
  'complete',
  'failed',
]);
export const WEBHOOK_EVENTS = new Set([
  'batch_started',
  'batch_complete',
  'batch_partial',
  'batch_failed',
  'batch_stuck',
  'life_event_detected',
  'trip_detected',
  'risk_detected',
  'behavioral_signal_detected',
]);
export const RISK_SEVERITIES = new Set(['high', 'medium', 'low']);
export const LIFESTYLE_CATEGORIES = new Set([
  'Sports & Active Living',
  'Health & Wellness',
  'Food & Dining',
  'Travel & Exploration',
  'Home & Living',
  'Style & Beauty',
  'Pets',
  'Entertainment & Culture',
  'Technology & Digital Life',
  'Family & Community',
  'Financial & Aspirational',
  'Miscellaneous & Unclassified',
]);

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isString(value) {
  return typeof value === 'string' && value.length > 0;
}

export function isInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNumberLike(value) {
  if (isFiniteNumber(value)) return true;
  if (typeof value !== 'string' || value.trim() === '') return false;
  return Number.isFinite(Number(value));
}

export function isDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isIsoOrDateLike(value) {
  return (
    value === null ||
    isDate(value) ||
    (typeof value === 'string' && !Number.isNaN(Date.parse(value)))
  );
}

export function isZip(value) {
  return value === null || (typeof value === 'string' && /^\d{5}(-\d{4})?$/.test(value));
}

export function isMcc(value) {
  return value === null || (typeof value === 'string' && /^\d{4}$/.test(value));
}

export function assertObject(value, label) {
  assert.ok(isObject(value), `${label} should be an object`);
}

export function assertString(value, label) {
  assert.ok(isString(value), `${label} should be a non-empty string`);
}

export function assertArray(value, label) {
  assert.ok(Array.isArray(value), `${label} should be an array`);
}

export function assertNumberLike(value, label) {
  assert.ok(isNumberLike(value), `${label} should be numeric`);
}

export function assertConfidence(value, label) {
  assert.ok(isFiniteNumber(value), `${label} should be a number`);
  assert.ok(value >= 0 && value <= 1, `${label} should be between 0 and 1`);
}

export function validateEnrichTransaction(txn, label = 'transaction') {
  assertObject(txn, label);
  assertString(txn.transaction_id, `${label}.transaction_id`);
  assertString(txn.customer_id, `${label}.customer_id`);
  assertString(txn.merchant_name, `${label}.merchant_name`);
  assert.ok(isFiniteNumber(txn.amount), `${label}.amount should be a finite number`);
  assert.ok(isDate(txn.date), `${label}.date should use YYYY-MM-DD`);
  assert.ok(isMcc(txn.mcc_code ?? null), `${label}.mcc_code should be a four digit MCC`);
  assert.ok(isZip(txn.zip_code ?? null), `${label}.zip_code should be a ZIP code`);
  assert.ok(isZip(txn.home_zip ?? null), `${label}.home_zip should be a ZIP code`);
  if (txn.rail !== undefined) assertString(txn.rail, `${label}.rail`);
  if (txn.source_profile !== undefined) assertString(txn.source_profile, `${label}.source_profile`);
  if (txn.transaction_type !== undefined) {
    assert.ok(
      TRANSACTION_TYPES.has(txn.transaction_type),
      `${label}.transaction_type ${txn.transaction_type} is unsupported`
    );
  }
}

export function validateMockBankFixtures(mockBankRoot) {
  const seenIds = new Set();
  const files = readdirSync(mockBankRoot).filter((name) => name.endsWith('.json')).sort();
  assert.ok(files.length >= 3, 'expected mock-bank fixtures for multiple core processors');
  const taxonomy = readJson(join(mockBankRoot, '..', 'evaluation', 'multirail-profile-taxonomy.json'));

  for (const fileName of files) {
    const fixture = readJson(join(mockBankRoot, fileName));
    assertString(fixture.fixture_version, `${fileName}.fixture_version`);
    assert.ok(MOCK_BANK_SOURCE_SYSTEMS.has(fixture.source_system), `${fileName}.source_system is unsupported`);
    assertString(fixture.description, `${fileName}.description`);
    assertArray(fixture.transactions, `${fileName}.transactions`);
    assert.ok(fixture.transactions.length > 0, `${fileName}.transactions should not be empty`);

    for (const [index, txn] of fixture.transactions.entries()) {
      validateEnrichTransaction(txn, `${fileName}.transactions[${index}]`);
      validateTransactionProfile(txn, taxonomy, `${fileName}.transactions[${index}]`);
      assert.ok(!seenIds.has(txn.transaction_id), `duplicate transaction_id ${txn.transaction_id}`);
      seenIds.add(txn.transaction_id);
    }
  }

  return { files, transactionCount: seenIds.size };
}

export function validatePartnerIngestContracts(contracts) {
  assertObject(contracts, 'partner ingest contracts');
  assertString(contracts.contract_version, 'partner ingest contracts.contract_version');
  assertString(contracts.description, 'partner ingest contracts.description');
  assertObject(contracts.partners, 'partner ingest contracts.partners');

  const partners = Object.entries(contracts.partners);
  assert.ok(partners.length > 0, 'partner ingest contracts.partners should not be empty');

  for (const [partnerKey, partner] of partners) {
    const label = `partner ingest contracts.partners.${partnerKey}`;
    assertObject(partner, label);
    assertString(partner.source_system, `${label}.source_system`);
    assert.ok(
      PARTNER_SOURCE_SYSTEMS.has(partner.source_system),
      `${label}.source_system ${partner.source_system} is unsupported`
    );
    assertString(partner.display_name, `${label}.display_name`);
    assertArray(partner.endpoints, `${label}.endpoints`);
    assertArray(partner.required_raw_fields, `${label}.required_raw_fields`);
    assertArray(partner.recommended_raw_fields, `${label}.recommended_raw_fields`);
    assertString(partner.amount_sign_convention, `${label}.amount_sign_convention`);
    assertObject(partner.normalized_mapping, `${label}.normalized_mapping`);
    assertArray(partner.normalized_mapping.required_output_fields, `${label}.normalized_mapping.required_output_fields`);
    assertObject(partner.normalized_mapping.rail_rules, `${label}.normalized_mapping.rail_rules`);
    assertArray(partner.qa_gates, `${label}.qa_gates`);
  }

  return { partnerCount: partners.length };
}

export function validatePartnerIngestFixtures(partnerRoot) {
  const contracts = readJson(join(partnerRoot, '..', 'evaluation', 'partner-ingest-contracts.json'));
  const contractsResult = validatePartnerIngestContracts(contracts);
  const taxonomy = readJson(join(partnerRoot, '..', 'evaluation', 'multirail-profile-taxonomy.json'));

  const files = readdirSync(partnerRoot).filter((name) => name.endsWith('.json')).sort();
  assert.ok(files.length > 0, 'expected partner ingest fixtures');

  const normalizedByFile = new Map();
  const rejectReportByFile = new Map();
  const rawFixtures = [];
  const normalizedFixtures = [];
  const rejectReports = [];
  let normalizedTransactionCount = 0;
  let rejectedRecordCount = 0;

  for (const fileName of files) {
    const fixture = readJson(join(partnerRoot, fileName));
    assertObject(fixture, fileName);
    assert.ok(
      PARTNER_FIXTURE_TYPES.has(fixture.fixture_type),
      `${fileName}.fixture_type ${fixture.fixture_type} is unsupported`
    );
    assert.ok(
      PARTNER_SOURCE_SYSTEMS.has(fixture.source_system),
      `${fileName}.source_system ${fixture.source_system} is unsupported`
    );

    if (fixture.fixture_type === 'raw_partner_payload') {
      validateRawPartnerPayloadFixture(fixture, `${fileName}`);
      rawFixtures.push({ fileName, fixture });
    } else if (fixture.fixture_type === 'normalized_enrichment_input') {
      validatePartnerNormalizedFixture(fixture, taxonomy, `${fileName}`);
      normalizedByFile.set(fileName, fixture);
      normalizedFixtures.push(fileName);
      normalizedTransactionCount += fixture.transactions.length;
    } else {
      validatePartnerRejectReportFixture(fixture, `${fileName}`);
      rejectReportByFile.set(fileName, fixture);
      rejectReports.push(fileName);
      rejectedRecordCount += fixture.rejected_records.length;
    }
  }

  for (const { fileName, fixture } of rawFixtures) {
    const normalizedFixtureName = fixture.mapping_expectations?.normalized_fixture;
    assertString(normalizedFixtureName, `${fileName}.mapping_expectations.normalized_fixture`);
    assert.ok(
      normalizedByFile.has(normalizedFixtureName),
      `${fileName}.mapping_expectations.normalized_fixture ${normalizedFixtureName} was not found`
    );
    validateRawToNormalizedCoverage(
      fixture,
      normalizedByFile.get(normalizedFixtureName),
      `${fileName} -> ${normalizedFixtureName}`
    );

    const rejectReportName = fixture.mapping_expectations?.reject_report;
    if (rejectReportName !== undefined) {
      assertString(rejectReportName, `${fileName}.mapping_expectations.reject_report`);
      assert.ok(
        rejectReportByFile.has(rejectReportName),
        `${fileName}.mapping_expectations.reject_report ${rejectReportName} was not found`
      );
      validateRawToRejectReportCoverage(
        fixture,
        rejectReportByFile.get(rejectReportName),
        `${fileName} -> ${rejectReportName}`
      );
    }
  }

  return {
    contractPartnerCount: contractsResult.partnerCount,
    rawFixtureCount: rawFixtures.length,
    normalizedFixtureCount: normalizedFixtures.length,
    rejectReportCount: rejectReports.length,
    normalizedTransactionCount,
    rejectedRecordCount,
  };
}

function validateRawPartnerPayloadFixture(fixture, label) {
  assertString(fixture.fixture_version, `${label}.fixture_version`);
  assert.equal(fixture.fixture_type, 'raw_partner_payload', `${label}.fixture_type`);
  assertString(fixture.description, `${label}.description`);
  assertObject(fixture.mapping_context, `${label}.mapping_context`);
  assertObject(fixture.payload, `${label}.payload`);
  assertObject(fixture.mapping_expectations, `${label}.mapping_expectations`);

  if (fixture.source_system === 'plaid') {
    validatePlaidTransactionsSyncFixture(fixture, label);
  } else if (fixture.source_system === 'generic_fintech_sandbox_partner') {
    validateGenericPartnerPayloadFixture(fixture, label);
  }
}

function validatePlaidTransactionsSyncFixture(fixture, label) {
  assert.equal(fixture.endpoint, '/transactions/sync', `${label}.endpoint`);
  assertObject(fixture.mapping_context.account_customer_map, `${label}.mapping_context.account_customer_map`);
  assertObject(fixture.mapping_context.account_home_zip_map, `${label}.mapping_context.account_home_zip_map`);
  assertArray(fixture.payload.accounts, `${label}.payload.accounts`);
  assertArray(fixture.payload.added, `${label}.payload.added`);
  assertArray(fixture.payload.modified, `${label}.payload.modified`);
  assertArray(fixture.payload.removed, `${label}.payload.removed`);
  assertString(fixture.payload.next_cursor, `${label}.payload.next_cursor`);
  assert.equal(typeof fixture.payload.has_more, 'boolean', `${label}.payload.has_more`);

  for (const [index, account] of fixture.payload.accounts.entries()) {
    const accountLabel = `${label}.payload.accounts[${index}]`;
    assertObject(account, accountLabel);
    assertString(account.account_id, `${accountLabel}.account_id`);
    assertString(account.name, `${accountLabel}.name`);
    assertString(account.type, `${accountLabel}.type`);
    assert.ok(
      fixture.mapping_context.account_customer_map[account.account_id],
      `${accountLabel}.account_id missing from account_customer_map`
    );
    assert.ok(
      fixture.mapping_context.account_home_zip_map[account.account_id],
      `${accountLabel}.account_id missing from account_home_zip_map`
    );
  }

  const expectedRejectedIds = new Set(fixture.mapping_expectations?.expected_rejected_record_ids ?? []);
  [...fixture.payload.added, ...fixture.payload.modified].forEach((txn, index) => {
    const txnLabel = `${label}.payload.transaction[${index}]`;
    if (expectedRejectedIds.has(txn.transaction_id)) {
      validateExpectedRejectedPlaidTransaction(txn, txnLabel);
      return;
    }
    validatePlaidTransaction(txn, fixture.mapping_context, txnLabel);
  });

  for (const [index, removed] of fixture.payload.removed.entries()) {
    const removedLabel = `${label}.payload.removed[${index}]`;
    if (isObject(removed)) {
      assertString(removed.transaction_id, `${removedLabel}.transaction_id`);
      assertString(removed.account_id, `${removedLabel}.account_id`);
    } else {
      assertString(removed, removedLabel);
    }
  }
}

function validateExpectedRejectedPlaidTransaction(txn, label) {
  assertObject(txn, label);
  assertString(txn.transaction_id, `${label}.transaction_id`);
}

function validatePlaidTransaction(txn, mappingContext, label) {
  assertObject(txn, label);
  assertString(txn.transaction_id, `${label}.transaction_id`);
  assertString(txn.account_id, `${label}.account_id`);
  assert.ok(mappingContext.account_customer_map[txn.account_id], `${label}.account_id missing customer mapping`);
  assert.ok(mappingContext.account_home_zip_map[txn.account_id], `${label}.account_id missing home ZIP mapping`);
  assert.ok(isFiniteNumber(txn.amount), `${label}.amount should be a finite number`);
  assert.ok(isDate(txn.date), `${label}.date should use YYYY-MM-DD`);
  assert.equal(typeof txn.pending, 'boolean', `${label}.pending`);
  assert.ok(
    isString(txn.merchant_name) || isString(txn.name) || isString(txn.original_description),
    `${label} should include merchant_name, name, or original_description`
  );
  if (txn.iso_currency_code !== undefined && txn.iso_currency_code !== null) {
    assertString(txn.iso_currency_code, `${label}.iso_currency_code`);
  }
  if (txn.unofficial_currency_code !== undefined && txn.unofficial_currency_code !== null) {
    assertString(txn.unofficial_currency_code, `${label}.unofficial_currency_code`);
  }
  assert.ok(
    !txn.iso_currency_code || !txn.unofficial_currency_code,
    `${label} should not include both iso_currency_code and unofficial_currency_code`
  );
  if (txn.personal_finance_category !== undefined && txn.personal_finance_category !== null) {
    assertObject(txn.personal_finance_category, `${label}.personal_finance_category`);
    assertString(txn.personal_finance_category.primary, `${label}.personal_finance_category.primary`);
    assertString(txn.personal_finance_category.detailed, `${label}.personal_finance_category.detailed`);
  }
  if (txn.location !== undefined && txn.location !== null) {
    assertObject(txn.location, `${label}.location`);
    assert.ok(isZip(txn.location.postal_code ?? null), `${label}.location.postal_code should be ZIP-like`);
  }
  if (txn.counterparties !== undefined) {
    assertArray(txn.counterparties, `${label}.counterparties`);
    txn.counterparties.forEach((counterparty, index) => {
      const counterpartyLabel = `${label}.counterparties[${index}]`;
      assertObject(counterparty, counterpartyLabel);
      assertString(counterparty.name, `${counterpartyLabel}.name`);
      assertString(counterparty.type, `${counterpartyLabel}.type`);
    });
  }
}

function validateGenericPartnerPayloadFixture(fixture, label) {
  assertString(fixture.partner_name, `${label}.partner_name`);
  assertArray(fixture.payload.records, `${label}.payload.records`);
  assertObject(fixture.mapping_context.account_customer_map, `${label}.mapping_context.account_customer_map`);

  for (const [index, record] of fixture.payload.records.entries()) {
    const recordLabel = `${label}.payload.records[${index}]`;
    assertObject(record, recordLabel);
    assertString(record.record_id, `${recordLabel}.record_id`);
    assertString(record.account_id, `${recordLabel}.account_id`);
    assert.ok(fixture.mapping_context.account_customer_map[record.account_id], `${recordLabel}.account_id missing mapping`);
    assert.ok(isDate(record.posted_date), `${recordLabel}.posted_date should use YYYY-MM-DD`);
    assert.ok(
      isString(record.raw_description) || isString(record.counterparty_name),
      `${recordLabel} should include raw_description or counterparty_name`
    );
    assertObject(record.amount, `${recordLabel}.amount`);
    assert.ok(isFiniteNumber(record.amount.value), `${recordLabel}.amount.value should be finite`);
    assert.ok(['debit', 'credit'].includes(record.amount.direction), `${recordLabel}.amount.direction`);
    assertString(record.amount.currency, `${recordLabel}.amount.currency`);
  }
}

function validatePartnerNormalizedFixture(fixture, taxonomy, label) {
  assertString(fixture.fixture_version, `${label}.fixture_version`);
  assert.equal(fixture.fixture_type, 'normalized_enrichment_input', `${label}.fixture_type`);
  assertString(fixture.description, `${label}.description`);
  assertArray(fixture.transactions, `${label}.transactions`);
  assert.ok(fixture.transactions.length > 0, `${label}.transactions should not be empty`);

  const seenIds = new Set();
  for (const [index, txn] of fixture.transactions.entries()) {
    const txnLabel = `${label}.transactions[${index}]`;
    validateEnrichTransaction(txn, txnLabel);
    validateTransactionProfile(txn, taxonomy, txnLabel);
    assert.ok(!seenIds.has(txn.transaction_id), `${txnLabel}.transaction_id is duplicated`);
    seenIds.add(txn.transaction_id);
    assertObject(txn.partner_metadata, `${txnLabel}.partner_metadata`);
    assert.equal(txn.partner_metadata.source_system, fixture.source_system, `${txnLabel}.partner_metadata.source_system`);
    assertString(txn.partner_metadata.source_transaction_id, `${txnLabel}.partner_metadata.source_transaction_id`);
  }
}

function validatePartnerRejectReportFixture(fixture, label) {
  assertString(fixture.report_version, `${label}.report_version`);
  assert.equal(fixture.fixture_type, 'partner_reject_report', `${label}.fixture_type`);
  assert.ok(
    PARTNER_SOURCE_SYSTEMS.has(fixture.source_system),
    `${label}.source_system ${fixture.source_system} is unsupported`
  );
  assertString(fixture.description, `${label}.description`);
  assertString(fixture.raw_fixture, `${label}.raw_fixture`);
  assertObject(fixture.summary, `${label}.summary`);
  assert.ok(isInteger(fixture.summary.total_raw_records), `${label}.summary.total_raw_records`);
  assert.ok(isInteger(fixture.summary.accepted_records), `${label}.summary.accepted_records`);
  assert.ok(isInteger(fixture.summary.rejected_records), `${label}.summary.rejected_records`);
  assert.ok(isInteger(fixture.summary.removed_records), `${label}.summary.removed_records`);
  assert.equal(
    fixture.summary.total_raw_records,
    fixture.summary.accepted_records + fixture.summary.rejected_records + fixture.summary.removed_records,
    `${label}.summary counts should reconcile`
  );
  assertArray(fixture.rejected_records, `${label}.rejected_records`);
  assert.equal(
    fixture.rejected_records.length,
    fixture.summary.rejected_records,
    `${label}.rejected_records length should match summary`
  );

  const seenSourceIds = new Set();
  for (const [index, rejected] of fixture.rejected_records.entries()) {
    const rejectedLabel = `${label}.rejected_records[${index}]`;
    assertObject(rejected, rejectedLabel);
    assertString(rejected.source_record_id, `${rejectedLabel}.source_record_id`);
    assert.ok(!seenSourceIds.has(rejected.source_record_id), `${rejectedLabel}.source_record_id duplicated`);
    seenSourceIds.add(rejected.source_record_id);
    assert.ok(
      rejected.account_id === null || typeof rejected.account_id === 'string',
      `${rejectedLabel}.account_id should be null or string`
    );
    assertArray(rejected.reason_codes, `${rejectedLabel}.reason_codes`);
    assert.ok(rejected.reason_codes.length > 0, `${rejectedLabel}.reason_codes should not be empty`);
    for (const reasonCode of rejected.reason_codes) {
      assert.ok(
        PARTNER_REJECT_REASON_CODES.has(reasonCode),
        `${rejectedLabel}.reason_codes contains unsupported ${reasonCode}`
      );
    }
    assertString(rejected.reason, `${rejectedLabel}.reason`);
    assert.equal(typeof rejected.retryable, 'boolean', `${rejectedLabel}.retryable`);
    assert.ok(isObject(rejected.raw_excerpt), `${rejectedLabel}.raw_excerpt should be an object`);
  }
}

function validateRawToNormalizedCoverage(rawFixture, normalizedFixture, label) {
  assert.equal(
    normalizedFixture.source_system,
    rawFixture.source_system,
    `${label}: normalized fixture source_system should match raw fixture`
  );

  const normalizedSourceIds = new Set(
    normalizedFixture.transactions.map((txn) => txn.partner_metadata.source_transaction_id)
  );
  const rejectedIds = new Set(
    rawFixture.mapping_expectations?.expected_rejected_record_ids ?? []
  );
  const expectedIds =
    rawFixture.source_system === 'plaid'
      ? [...rawFixture.payload.added, ...rawFixture.payload.modified].map((txn) => txn.transaction_id)
      : rawFixture.payload.records.map((record) => record.record_id);

  for (const sourceId of expectedIds) {
    if (rejectedIds.has(sourceId)) continue;
    assert.ok(normalizedSourceIds.has(sourceId), `${label}: missing normalized transaction for ${sourceId}`);
  }

  const expectedCount = rawFixture.mapping_expectations.expected_normalized_transaction_count;
  if (expectedCount !== undefined) {
    assert.equal(
      normalizedFixture.transactions.length,
      expectedCount,
      `${label}: normalized transaction count`
    );
  }

  for (const rail of rawFixture.mapping_expectations.expected_rails ?? []) {
    assert.ok(
      normalizedFixture.transactions.some((txn) => txn.rail === rail),
      `${label}: expected normalized rail ${rail}`
    );
  }

  for (const profile of rawFixture.mapping_expectations.expected_source_profiles ?? []) {
    assert.ok(
      normalizedFixture.transactions.some((txn) => txn.source_profile === profile),
      `${label}: expected normalized source_profile ${profile}`
    );
  }
}

function validateRawToRejectReportCoverage(rawFixture, rejectReport, label) {
  assert.equal(rejectReport.raw_fixture, rawFixture.mapping_expectations.reject_report_raw_fixture ?? label.split(' -> ')[0], `${label}: raw_fixture`);
  const rejectedIds = new Set(rejectReport.rejected_records.map((record) => record.source_record_id));

  for (const sourceId of rawFixture.mapping_expectations.expected_rejected_record_ids ?? []) {
    assert.ok(rejectedIds.has(sourceId), `${label}: missing rejected record for ${sourceId}`);
  }

  const expectedRejectCount = rawFixture.mapping_expectations.expected_rejected_record_count;
  if (expectedRejectCount !== undefined) {
    assert.equal(rejectReport.summary.rejected_records, expectedRejectCount, `${label}: rejected record count`);
  }
}

export function validateEnrichResponse(value, label = 'enrich_response') {
  assertObject(value, label);
  assertString(value.batch_id, `${label}.batch_id`);
  assert.equal(value.status, 'ingested', `${label}.status`);
  assert.ok(isInteger(value.transaction_count), `${label}.transaction_count`);
  assert.ok(isInteger(value.customers), `${label}.customers`);
  assertString(value.message, `${label}.message`);
}

export function validateJobResponse(value, label = 'job_response') {
  assertObject(value, label);
  assertString(value.job_id, `${label}.job_id`);
  assert.ok(JOB_STATUSES.has(value.status), `${label}.status ${value.status} is unsupported`);
  assertString(value.bank_id, `${label}.bank_id`);
  assert.ok(isInteger(value.transaction_count), `${label}.transaction_count`);
  assertString(value.source_file, `${label}.source_file`);
  assertArray(value.customers, `${label}.customers`);

  for (const [index, customer] of value.customers.entries()) {
    const customerLabel = `${label}.customers[${index}]`;
    assertString(customer.customer_id, `${customerLabel}.customer_id`);
    assert.ok(JOB_STATUSES.has(customer.status), `${customerLabel}.status is unsupported`);
    assert.ok(
      customer.error_message === null || typeof customer.error_message === 'string',
      `${customerLabel}.error_message should be null or string`
    );
    assertObject(customer.timestamps, `${customerLabel}.timestamps`);
    for (const key of [
      'ingested_at',
      'classified_at',
      'pillar_analyzed_at',
      'travel_detected_at',
      'lifestyle_analyzed_at',
      'risk_analyzed_at',
      'completed_at',
    ]) {
      assert.ok(isIsoOrDateLike(customer.timestamps[key]), `${customerLabel}.timestamps.${key} should be date-like`);
    }
  }
}

export function validateEnrichedTransaction(txn, label = 'enriched_transaction') {
  assertObject(txn, label);
  assertString(txn.transaction_id, `${label}.transaction_id`);
  assertString(txn.clean_merchant_name, `${label}.clean_merchant_name`);
  assertString(txn.lifestyle_category, `${label}.lifestyle_category`);
  assertString(txn.merchant_category, `${label}.merchant_category`);
  assertNumberLike(txn.amount, `${label}.amount`);
  assert.ok(txn.pre_tax_amount === null || isNumberLike(txn.pre_tax_amount), `${label}.pre_tax_amount`);
  assert.ok(txn.tax_amount === null || isNumberLike(txn.tax_amount), `${label}.tax_amount`);
  assert.ok(txn.tax_rate === null || typeof txn.tax_rate === 'string', `${label}.tax_rate`);
  assert.ok(txn.tax_state === null || typeof txn.tax_state === 'string', `${label}.tax_state`);
  assert.ok(isIsoOrDateLike(txn.transaction_date), `${label}.transaction_date`);
  assertConfidence(txn.confidence_score, `${label}.confidence_score`);
  assert.ok(txn.inferred_purchase === null || typeof txn.inferred_purchase === 'string', `${label}.inferred_purchase`);
  assert.ok(txn.trip_id === null || typeof txn.trip_id === 'string', `${label}.trip_id`);
  assert.ok(isZip(txn.zip_code ?? null), `${label}.zip_code`);
}

export function validateTransactionsResponse(value, label = 'transactions_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assert.ok(isInteger(value.total), `${label}.total`);
  assert.ok(isInteger(value.limit), `${label}.limit`);
  assert.ok(isInteger(value.offset), `${label}.offset`);
  assertArray(value.transactions, `${label}.transactions`);
  assert.ok(value.total >= value.transactions.length, `${label}.total should cover returned rows`);
  value.transactions.forEach((txn, index) =>
    validateEnrichedTransaction(txn, `${label}.transactions[${index}]`)
  );
}

export function validateEvidence(evidence, label = 'evidence') {
  assertObject(evidence, label);
  assertString(evidence.transaction_id, `${label}.transaction_id`);
  assertString(evidence.merchant, `${label}.merchant`);
  assertNumberLike(evidence.amount, `${label}.amount`);
  assert.ok(isIsoOrDateLike(evidence.date), `${label}.date`);
  assert.ok(evidence.relevance === null || typeof evidence.relevance === 'string', `${label}.relevance`);
}

export function validateLifeEventsResponse(value, label = 'life_events_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assertArray(value.life_events, `${label}.life_events`);
  assertArray(value.behavioral_signals, `${label}.behavioral_signals`);

  for (const [index, event] of value.life_events.entries()) {
    const eventLabel = `${label}.life_events[${index}]`;
    assertObject(event, eventLabel);
    assert.ok(event.id !== undefined, `${eventLabel}.id should be present`);
    assertString(event.event_name, `${eventLabel}.event_name`);
    assertString(event.event_type, `${eventLabel}.event_type`);
    assertConfidence(event.confidence, `${eventLabel}.confidence`);
    assertString(event.urgency_timeline, `${eventLabel}.urgency_timeline`);
    assertString(event.status, `${eventLabel}.status`);
    assertArray(event.evidence, `${eventLabel}.evidence`);
    event.evidence.forEach((evidence, evidenceIndex) =>
      validateEvidence(evidence, `${eventLabel}.evidence[${evidenceIndex}]`)
    );
  }

  for (const [index, signal] of value.behavioral_signals.entries()) {
    const signalLabel = `${label}.behavioral_signals[${index}]`;
    assertObject(signal, signalLabel);
    assert.ok(signal.id !== undefined, `${signalLabel}.id should be present`);
    assertString(signal.signal_category, `${signalLabel}.signal_category`);
    assertString(signal.signal_name, `${signalLabel}.signal_name`);
    assertConfidence(signal.confidence, `${signalLabel}.confidence`);
    assertString(signal.status, `${signalLabel}.status`);
    assertArray(signal.evidence, `${signalLabel}.evidence`);
  }
}

export function validateTripsResponse(value, label = 'trips_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assertArray(value.trips, `${label}.trips`);
  for (const [index, trip] of value.trips.entries()) {
    const tripLabel = `${label}.trips[${index}]`;
    assertString(trip.trip_id, `${tripLabel}.trip_id`);
    assertString(trip.destination, `${tripLabel}.destination`);
    assert.ok(isIsoOrDateLike(trip.trip_start), `${tripLabel}.trip_start`);
    assert.ok(isIsoOrDateLike(trip.trip_end), `${tripLabel}.trip_end`);
    assertNumberLike(trip.trip_duration_days, `${tripLabel}.trip_duration_days`);
    assertNumberLike(trip.total_trip_spend, `${tripLabel}.total_trip_spend`);
    assertNumberLike(trip.transaction_count, `${tripLabel}.transaction_count`);
    assert.equal(typeof trip.is_upcoming, 'boolean', `${tripLabel}.is_upcoming`);
  }
}

export function validateRiskFactorsResponse(value, label = 'risk_factors_response') {
  assertObject(value, label);
  assertString(value.customer_id, `${label}.customer_id`);
  assertArray(value.risk_factors, `${label}.risk_factors`);
  assertObject(value.summary, `${label}.summary`);

  const severityCounts = { high: 0, medium: 0, low: 0 };
  for (const [index, risk] of value.risk_factors.entries()) {
    const riskLabel = `${label}.risk_factors[${index}]`;
    assert.ok(risk.id !== undefined, `${riskLabel}.id should be present`);
    assertString(risk.transaction_id, `${riskLabel}.transaction_id`);
    assertString(risk.category_group, `${riskLabel}.category_group`);
    assertString(risk.category_label, `${riskLabel}.category_label`);
    assert.ok(RISK_SEVERITIES.has(risk.severity), `${riskLabel}.severity is unsupported`);
    severityCounts[risk.severity] += 1;
    assertString(risk.merchant, `${riskLabel}.merchant`);
    assertNumberLike(risk.amount, `${riskLabel}.amount`);
    assert.ok(isIsoOrDateLike(risk.transaction_date), `${riskLabel}.transaction_date`);
    assertString(risk.reason, `${riskLabel}.reason`);
    assert.ok(isIsoOrDateLike(risk.detected_at), `${riskLabel}.detected_at`);
  }

  assert.equal(value.summary.total, value.risk_factors.length, `${label}.summary.total`);
  assert.equal(value.summary.high, severityCounts.high, `${label}.summary.high`);
  assert.equal(value.summary.medium, severityCounts.medium, `${label}.summary.medium`);
  assert.equal(value.summary.low, severityCounts.low, `${label}.summary.low`);
}

export function validateAnalyticsResponse(value, label = 'analytics_response') {
  assertObject(value, label);
  assertString(value.bank_id, `${label}.bank_id`);
  assert.ok(isIsoOrDateLike(value.generated_at), `${label}.generated_at`);
  assertObject(value.overview, `${label}.overview`);
  for (const key of [
    'total_customers',
    'total_transactions',
    'total_spend',
    'avg_transaction',
    'avg_confidence',
  ]) {
    assert.ok(isFiniteNumber(value.overview[key]), `${label}.overview.${key}`);
  }
  for (const key of [
    'pillar_distribution',
    'life_event_summary',
    'behavioral_signal_summary',
    'risk_summary',
    'top_merchants',
    'segments',
  ]) {
    assertArray(value[key], `${label}.${key}`);
  }
}

export function validateWebhookRegistrationResponse(value, label = 'webhook_registration_response') {
  assertObject(value, label);
  assertString(value.webhook_id, `${label}.webhook_id`);
  assertString(value.bank_id, `${label}.bank_id`);
  assertString(value.url, `${label}.url`);
  assertArray(value.events, `${label}.events`);
  value.events.forEach((event) =>
    assert.ok(WEBHOOK_EVENTS.has(event), `${label}.events contains unsupported ${event}`)
  );
  assert.equal(typeof value.is_active, 'boolean', `${label}.is_active`);
  assert.ok(isIsoOrDateLike(value.created_at), `${label}.created_at`);
  assertString(value.message, `${label}.message`);
}

export function validateContractExamples(examples) {
  validateEnrichResponse(examples.enrich_response);
  validateJobResponse(examples.job_response);
  validateTransactionsResponse(examples.transactions_response);
  validateLifeEventsResponse(examples.life_events_response);
  validateTripsResponse(examples.trips_response);
  validateRiskFactorsResponse(examples.risk_factors_response);
  validateAnalyticsResponse(examples.analytics_response);
  validateWebhookRegistrationResponse(examples.webhook_registration_response);
}

export function validateGoldenEnrichmentExpectations(expectations, mockBankRoot, partnerIngestRoot = null) {
  assertObject(expectations, 'golden expectations');
  assertString(expectations.fixture_version, 'golden expectations.fixture_version');
  assertObject(expectations.minimum_expected_coverage, 'golden expectations.minimum_expected_coverage');
  assertObject(expectations.minimum_profile_coverage, 'golden expectations.minimum_profile_coverage');
  assertArray(expectations.expectations, 'golden expectations.expectations');

  const fixtureById = new Map();
  const sourceCounts = new Map();
  const profileCounts = new Map();
  const taxonomy = readJson(join(mockBankRoot, '..', 'evaluation', 'multirail-profile-taxonomy.json'));
  const files = readdirSync(mockBankRoot).filter((name) => name.endsWith('.json')).sort();
  for (const fileName of files) {
    const fixture = readJson(join(mockBankRoot, fileName));
    for (const txn of fixture.transactions) {
      fixtureById.set(txn.transaction_id, {
        ...txn,
        source_system: fixture.source_system,
      });
    }
  }
  if (partnerIngestRoot) {
    const partnerFiles = readdirSync(partnerIngestRoot).filter((name) => name.endsWith('.json')).sort();
    for (const fileName of partnerFiles) {
      const fixture = readJson(join(partnerIngestRoot, fileName));
      if (fixture.fixture_type !== 'normalized_enrichment_input') continue;
      for (const txn of fixture.transactions) {
        fixtureById.set(txn.transaction_id, {
          ...txn,
          source_system: fixture.source_system,
        });
      }
    }
  }

  const seen = new Set();
  for (const [index, expectation] of expectations.expectations.entries()) {
    const label = `golden expectations.expectations[${index}]`;
    assertObject(expectation, label);
    assertString(expectation.transaction_id, `${label}.transaction_id`);
    assert.ok(!seen.has(expectation.transaction_id), `${label}.transaction_id is duplicated`);
    seen.add(expectation.transaction_id);

    const fixtureTxn = fixtureById.get(expectation.transaction_id);
    assert.ok(fixtureTxn, `${label}.transaction_id does not exist in mock-bank fixtures`);
    assert.equal(expectation.source_system, fixtureTxn.source_system, `${label}.source_system`);
    sourceCounts.set(expectation.source_system, (sourceCounts.get(expectation.source_system) || 0) + 1);
    const profile = expectation.source_profile ?? fixtureTxn.source_profile;
    const rail = expectation.rail ?? fixtureTxn.rail;
    const transactionType = expectation.transaction_type ?? fixtureTxn.transaction_type;
    validateExpectationProfile(
      { rail, source_profile: profile, transaction_type: transactionType },
      taxonomy,
      label
    );
    const profileKey = `${rail}/${profile}`;
    profileCounts.set(profileKey, (profileCounts.get(profileKey) || 0) + 1);

    assertString(expectation.expected_clean_merchant_name, `${label}.expected_clean_merchant_name`);
    assert.ok(
      LIFESTYLE_CATEGORIES.has(expectation.expected_lifestyle_category),
      `${label}.expected_lifestyle_category is unsupported`
    );
    assertOptionalStringArray(
      expectation.accepted_lifestyle_categories,
      `${label}.accepted_lifestyle_categories`
    );
    assertString(expectation.expected_merchant_category, `${label}.expected_merchant_category`);
    assertOptionalStringArray(
      expectation.accepted_clean_merchant_names,
      `${label}.accepted_clean_merchant_names`
    );
    assertOptionalStringArray(
      expectation.accepted_merchant_categories,
      `${label}.accepted_merchant_categories`
    );
    assertConfidenceFloor(expectation.expected_confidence_min, `${label}.expected_confidence_min`);
    assertObject(expectation.expected_signals, `${label}.expected_signals`);
    for (const signal of SIGNAL_KEYS) {
      assert.equal(typeof expectation.expected_signals[signal], 'boolean', `${label}.expected_signals.${signal}`);
    }

    if (expectation.source_system === 'adversarial') {
      assert.ok(
        ADVERSARIAL_CATEGORIES.has(expectation.category),
        `${label}.category should be one of ${[...ADVERSARIAL_CATEGORIES].join(', ')}`
      );
      assertString(expectation.rationale, `${label}.rationale`);
    }
  }

  for (const [sourceSystem, minimum] of Object.entries(expectations.minimum_expected_coverage)) {
    assert.ok(
      (sourceCounts.get(sourceSystem) || 0) >= minimum,
      `expected at least ${minimum} golden expectations for ${sourceSystem}`
    );
  }

  for (const [profileKey, minimum] of Object.entries(expectations.minimum_profile_coverage)) {
    assert.ok(
      (profileCounts.get(profileKey) || 0) >= minimum,
      `expected at least ${minimum} golden expectations for ${profileKey}`
    );
  }

  return {
    expectationCount: expectations.expectations.length,
    sourceSystems: [...sourceCounts.keys()].sort(),
    profiles: [...profileCounts.keys()].sort(),
  };
}

export function validateGoldenPredictionResults(expectations, predictions) {
  const report = evaluateGoldenPredictionResults(expectations, predictions);

  return {
    checked: report.summary.total_expectations,
    failures: report.failures.map((failure) => failure.message),
  };
}

export function evaluateGoldenPredictionResults(expectations, predictions, metadata = {}) {
  const predictionRows = Array.isArray(predictions) ? predictions : predictions.predictions;
  assertArray(predictionRows, 'golden predictions');

  const predictionsById = new Map();
  for (const [index, prediction] of predictionRows.entries()) {
    assertObject(prediction, `golden predictions[${index}]`);
    assertString(prediction.transaction_id, `golden predictions[${index}].transaction_id`);
    predictionsById.set(prediction.transaction_id, prediction);
  }

  const expectationIds = new Set(expectations.expectations.map((expectation) => expectation.transaction_id));
  const failures = [];
  const bySourceSystem = new Map();
  const byRail = new Map();
  const byProfile = new Map();
  const byTransactionType = new Map();
  const fieldStats = new Map();
  let passedExpectations = 0;
  let checkedExpectations = 0;
  let missingPredictions = 0;

  for (const expectation of expectations.expectations) {
    const prediction = predictionsById.get(expectation.transaction_id);
    const groups = [
      bySourceSystem,
      byRail,
      byProfile,
      byTransactionType,
    ];
    const groupKeys = [
      expectation.source_system,
      expectation.rail,
      `${expectation.rail}/${expectation.source_profile}`,
      expectation.transaction_type,
    ];
    groups.forEach((group, index) => incrementGroup(group, groupKeys[index], 'total'));

    if (!prediction) {
      missingPredictions += 1;
      addFailure(failures, expectation, 'prediction', 'missing_prediction', 'missing prediction');
      groups.forEach((group, index) => incrementGroup(group, groupKeys[index], 'failed'));
      incrementField(fieldStats, 'prediction', 'failed');
      continue;
    }

    checkedExpectations += 1;
    const before = failures.length;
    comparePredictionField(failures, fieldStats, expectation, prediction, {
      predictionKey: 'clean_merchant_name',
      expectationKey: 'expected_clean_merchant_name',
    });
    comparePredictionField(failures, fieldStats, expectation, prediction, {
      predictionKey: 'lifestyle_category',
      expectationKey: 'expected_lifestyle_category',
    });
    comparePredictionField(failures, fieldStats, expectation, prediction, {
      predictionKey: 'merchant_category',
      expectationKey: 'expected_merchant_category',
    });
    compareConfidencePrediction(failures, fieldStats, expectation, prediction);
    compareSignalPredictions(failures, expectation, prediction, fieldStats);

    if (failures.length === before) {
      passedExpectations += 1;
      groups.forEach((group, index) => incrementGroup(group, groupKeys[index], 'passed'));
    } else {
      groups.forEach((group, index) => incrementGroup(group, groupKeys[index], 'failed'));
    }
  }

  const extraPredictionIds = [...predictionsById.keys()]
    .filter((transactionId) => !expectationIds.has(transactionId))
    .sort();
  const totalExpectations = expectations.expectations.length;

  return {
    report_type: 'golden_model_output_evaluation',
    report_version: 1,
    generated_at: new Date().toISOString(),
    metadata,
    summary: {
      total_expectations: totalExpectations,
      checked_predictions: checkedExpectations,
      passed_expectations: passedExpectations,
      failed_expectations: totalExpectations - passedExpectations,
      missing_predictions: missingPredictions,
      extra_predictions: extraPredictionIds.length,
      pass_rate: totalExpectations === 0 ? 0 : roundRate(passedExpectations / totalExpectations),
      contract_repairs: summarizeContractRepairs(predictionRows),
    },
    breakdowns: {
      by_source_system: mapToSortedObject(bySourceSystem),
      by_rail: mapToSortedObject(byRail),
      by_profile: mapToSortedObject(byProfile),
      by_transaction_type: mapToSortedObject(byTransactionType),
      by_field: mapToSortedObject(fieldStats),
    },
    failures,
    extra_prediction_ids: extraPredictionIds,
  };
}

function summarizeContractRepairs(predictionRows) {
  const summary = {
    repaired_predictions: 0,
    repair_count: 0,
    violation_predictions: 0,
    violation_count: 0,
    by_code: {},
  };

  for (const prediction of predictionRows) {
    const repairs = Array.isArray(prediction.contract_repair?.repairs) ? prediction.contract_repair.repairs : [];
    const violations = Array.isArray(prediction.contract_repair?.violations)
      ? prediction.contract_repair.violations
      : [];
    if (repairs.length > 0) summary.repaired_predictions += 1;
    if (violations.length > 0) summary.violation_predictions += 1;
    summary.repair_count += repairs.length;
    summary.violation_count += violations.length;

    for (const item of [...repairs, ...violations]) {
      const code = item?.code || 'unknown_contract_issue';
      summary.by_code[code] = (summary.by_code[code] || 0) + 1;
    }
  }

  return summary;
}

function compareSignalPredictions(failures, expectation, prediction, fieldStats = null) {
  const predictedSignals = prediction.signals ?? prediction.expected_signals ?? prediction;
  for (const signal of SIGNAL_KEYS) {
    const field = `signals.${signal}`;
    const expected = expectation.expected_signals[signal];
    const actual = predictedSignals[signal];
    if (typeof actual !== 'boolean') {
      incrementField(fieldStats, field, 'failed');
      addFailure(
        failures,
        expectation,
        field,
        'missing_or_invalid_signal',
        `${signal} missing or non-boolean in prediction (got ${JSON.stringify(actual)})`,
        expected,
        actual
      );
      continue;
    }
    if (actual !== expected) {
      const direction = expected ? 'expected to be flagged' : 'must not be flagged';
      incrementField(fieldStats, field, 'failed');
      addFailure(
        failures,
        expectation,
        field,
        'signal_mismatch',
        `${signal} ${direction} (expected ${expected}, got ${actual})`,
        expected,
        actual
      );
      continue;
    }
    incrementField(fieldStats, field, 'passed');
  }
}

function assertConfidenceFloor(value, label) {
  assert.ok(isFiniteNumber(value), `${label} should be a number`);
  assert.ok(value >= 0.4 && value <= 0.9, `${label} should be between 0.4 and 0.9`);
}

function assertOptionalStringArray(value, label) {
  if (value === undefined) return;
  assertArray(value, label);
  for (const [index, item] of value.entries()) {
    assertString(item, `${label}[${index}]`);
  }
}

function compareStringPrediction(failures, expectation, prediction, predictionKey, expectationKey) {
  const actual = String(prediction[predictionKey] || '').toLowerCase();
  const expected = String(expectation[expectationKey] || '').toLowerCase();
  if (actual !== expected) {
    failures.push(
      `${expectation.transaction_id}: ${predictionKey} expected "${expectation[expectationKey]}", got "${prediction[predictionKey]}"`
    );
  }
}

function comparePredictionField(failures, fieldStats, expectation, prediction, { predictionKey, expectationKey }) {
  const actual = normalizeComparableString(prediction[predictionKey]);
  const expectedValues = acceptedExpectationValues(expectation, predictionKey, expectationKey);
  if (!expectedValues.includes(actual)) {
    incrementField(fieldStats, predictionKey, 'failed');
    addFailure(
      failures,
      expectation,
      predictionKey,
      'field_mismatch',
      `${predictionKey} expected "${expectation[expectationKey]}", got "${prediction[predictionKey]}"`,
      expectedDisplayValue(expectation, predictionKey, expectationKey),
      prediction[predictionKey]
    );
    return;
  }
  incrementField(fieldStats, predictionKey, 'passed');
}

function acceptedExpectationValues(expectation, predictionKey, expectationKey) {
  const acceptedKeyByPredictionKey = {
    clean_merchant_name: 'accepted_clean_merchant_names',
    merchant_category: 'accepted_merchant_categories',
    lifestyle_category: 'accepted_lifestyle_categories',
  };
  const acceptedKey = acceptedKeyByPredictionKey[predictionKey];
  const expectedValues = [
    expectation[expectationKey],
    ...(Array.isArray(expectation[acceptedKey]) ? expectation[acceptedKey] : []),
  ];
  return expandEquivalentValues(predictionKey, expectedValues);
}

function expectedDisplayValue(expectation, predictionKey, expectationKey) {
  const acceptedKeyByPredictionKey = {
    clean_merchant_name: 'accepted_clean_merchant_names',
    merchant_category: 'accepted_merchant_categories',
    lifestyle_category: 'accepted_lifestyle_categories',
  };
  const acceptedKey = acceptedKeyByPredictionKey[predictionKey];
  const accepted = Array.isArray(expectation[acceptedKey]) ? expectation[acceptedKey] : [];
  if (accepted.length === 0) return expectation[expectationKey];
  return [expectation[expectationKey], ...accepted].join(' | ');
}

function normalizeComparableString(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandEquivalentValues(predictionKey, values) {
  const normalizedValues = new Set(values.map(normalizeComparableString));
  const equivalenceGroups = GOLDEN_EXPECTATION_EQUIVALENCE_GROUPS[predictionKey] || [];

  for (const group of equivalenceGroups) {
    const normalizedGroup = group.map(normalizeComparableString);
    if (!normalizedGroup.some((value) => normalizedValues.has(value))) continue;
    for (const value of normalizedGroup) {
      normalizedValues.add(value);
    }
  }

  return [...normalizedValues];
}

function compareConfidencePrediction(failures, fieldStats, expectation, prediction) {
  const confidence = Number(prediction.confidence_score);
  if (!Number.isFinite(confidence) || confidence < expectation.expected_confidence_min) {
    incrementField(fieldStats, 'confidence_score', 'failed');
    addFailure(
      failures,
      expectation,
      'confidence_score',
      'confidence_below_floor',
      `confidence_score ${prediction.confidence_score} below ${expectation.expected_confidence_min}`,
      expectation.expected_confidence_min,
      prediction.confidence_score
    );
    return;
  }
  incrementField(fieldStats, 'confidence_score', 'passed');
}

function addFailure(failures, expectation, field, reasonCode, detail, expected = undefined, actual = undefined) {
  failures.push({
    transaction_id: expectation.transaction_id,
    source_system: expectation.source_system,
    rail: expectation.rail,
    source_profile: expectation.source_profile,
    transaction_type: expectation.transaction_type,
    field,
    reason_code: reasonCode,
    expected,
    actual,
    message: `${expectation.transaction_id}: ${detail}`,
  });
}

function incrementField(stats, field, outcome) {
  if (!stats) return;
  incrementGroup(stats, field, 'total');
  incrementGroup(stats, field, outcome);
}

function incrementGroup(group, key, outcome) {
  const value = group.get(key) ?? { total: 0, passed: 0, failed: 0, pass_rate: 0 };
  value[outcome] += 1;
  value.pass_rate = value.total === 0 ? 0 : roundRate(value.passed / value.total);
  group.set(key, value);
}

function mapToSortedObject(map) {
  return Object.fromEntries(
    [...map.entries()]
      .sort(([left], [right]) => String(left).localeCompare(String(right)))
      .map(([key, value]) => [key, value])
  );
}

function roundRate(value) {
  return Number(value.toFixed(4));
}

function validateTransactionProfile(txn, taxonomy, label) {
  if (txn.rail === undefined && txn.source_profile === undefined && txn.transaction_type === undefined) return;
  validateExpectationProfile(txn, taxonomy, label);
}

function validateExpectationProfile(value, taxonomy, label) {
  assertString(value.rail, `${label}.rail`);
  assertString(value.source_profile, `${label}.source_profile`);
  assert.ok(taxonomy.rails[value.rail], `${label}.rail ${value.rail} is not in taxonomy`);
  assert.ok(
    taxonomy.rails[value.rail].profiles[value.source_profile],
    `${label}.source_profile ${value.source_profile} is not in taxonomy rail ${value.rail}`
  );
  assert.ok(
    TRANSACTION_TYPES.has(value.transaction_type),
    `${label}.transaction_type ${value.transaction_type} is unsupported`
  );
}
