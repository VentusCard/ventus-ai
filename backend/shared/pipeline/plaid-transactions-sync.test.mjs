import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizePlaidTransactionsSync,
  derivePlaidRail,
  derivePlaidMerchantName,
  derivePlaidSourceProfile,
  derivePlaidTransactionType,
  titleCase,
  RAILS,
} from './plaid-transactions-sync.mjs';
import { validateEnrichTransaction } from '../../scripts/lib/qa-validators.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const partnerIngestRoot = resolve(here, '..', '..', 'fixtures', 'partner-ingest');

function readFixture(name) {
  return JSON.parse(readFileSync(join(partnerIngestRoot, name), 'utf8'));
}

const rawFixture = readFixture('plaid-transactions-sync-raw.json');
const normalizedFixture = readFixture('plaid-transactions-sync-normalized.json');
const rejectReport = readFixture('plaid-transactions-sync-reject-report.json');

const result = normalizePlaidTransactionsSync({
  payload: rawFixture.payload,
  mapping_context: rawFixture.mapping_context,
});

test('accepted transactions exactly match the normalized fixture', () => {
  assert.deepEqual(result.transactions, normalizedFixture.transactions);
});

test('every accepted transaction satisfies the enrichment input contract', () => {
  for (const [index, txn] of result.transactions.entries()) {
    validateEnrichTransaction(txn, `normalized[${index}]`);
  }
});

test('rejected records match the reject report fixture', () => {
  assert.deepEqual(result.rejected_records, rejectReport.rejected_records);
});

test('removed Plaid transactions are held back from enrichment', () => {
  assert.deepEqual(result.removed_transaction_ids, ['plaid_pending_streaming_0001']);
  const acceptedIds = new Set(result.transactions.map((t) => t.transaction_id));
  for (const removedId of result.removed_transaction_ids) {
    assert.ok(!acceptedIds.has(removedId), `${removedId} must not be enriched`);
  }
});

test('summary reconciles with the reject report and raw counts', () => {
  assert.deepEqual(result.summary, {
    total_raw_records: rejectReport.summary.total_raw_records,
    accepted_records: rejectReport.summary.accepted_records,
    rejected_records: rejectReport.summary.rejected_records,
    removed_records: rejectReport.summary.removed_records,
  });
  assert.equal(
    result.summary.total_raw_records,
    result.summary.accepted_records +
      result.summary.rejected_records +
      result.summary.removed_records
  );
});

test('cursor and has_more are surfaced for incremental sync', () => {
  assert.equal(result.next_cursor, rawFixture.payload.next_cursor);
  assert.equal(result.has_more, rawFixture.payload.has_more);
});

test('Plaid amount sign convention maps to Ventus transaction_type', () => {
  // Positive Plaid amounts are money out (debit / spend); negatives are inflow (credit).
  assert.equal(derivePlaidTransactionType(5.75), 'debit');
  assert.equal(derivePlaidTransactionType(-4280.15), 'credit');
  assert.equal(derivePlaidTransactionType(0), 'debit');
});

test('rail derivation covers card, ach, p2p, and wire', () => {
  const credit = { type: 'credit' };
  const depository = { type: 'depository' };
  assert.equal(
    derivePlaidRail({ name: 'STARBUCKS', payment_channel: 'in store' }, credit),
    RAILS.CARD
  );
  assert.equal(
    derivePlaidRail(
      { name: 'ACME CORP PAYROLL', personal_finance_category: { primary: 'INCOME' } },
      depository
    ),
    RAILS.ACH
  );
  assert.equal(
    derivePlaidRail(
      { name: 'ZELLE PAYMENT', counterparties: [{ type: 'payment_app', name: 'Zelle' }] },
      depository
    ),
    RAILS.P2P
  );
  assert.equal(
    derivePlaidRail({ name: 'WIRE TRANSFER TITLE COMPANY ESCROW' }, depository),
    RAILS.WIRE
  );
});

test('source_profile combines rail with the personal finance category', () => {
  assert.equal(
    derivePlaidSourceProfile(RAILS.CARD, {
      personal_finance_category: { primary: 'FOOD_AND_DRINK', detailed: 'FOOD_AND_DRINK_COFFEE' },
    }),
    'card_dining'
  );
  // Detailed override wins over the broad primary bucket.
  assert.equal(
    derivePlaidSourceProfile(RAILS.ACH, {
      personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' },
    }),
    'ach_payroll'
  );
  assert.equal(
    derivePlaidSourceProfile(RAILS.CARD, {
      personal_finance_category: { primary: 'ENTERTAINMENT', detailed: 'ENTERTAINMENT_TV_AND_MOVIES' },
    }),
    'card_subscription'
  );
});

test('expanded PFC map covers Plaid primary categories instead of collapsing to _general', () => {
  const cases = [
    ['TRANSPORTATION', 'card_transport'],
    ['TRAVEL', 'card_travel'],
    ['GENERAL_MERCHANDISE', 'card_retail'],
    ['LOAN_PAYMENTS', 'ach_loan'],
    ['RENT_AND_UTILITIES', 'ach_utilities'],
    ['PERSONAL_CARE', 'card_personal_care'],
    ['MEDICAL', 'card_medical'],
    ['BANK_FEES', 'ach_fees'],
  ];
  for (const [primary, expected] of cases) {
    const rail = expected.split('_')[0];
    assert.equal(
      derivePlaidSourceProfile(rail, { personal_finance_category: { primary, detailed: `${primary}_OTHER` } }),
      expected
    );
  }
});

test('unmapped/absent categories still fall back to _general safely', () => {
  assert.equal(derivePlaidSourceProfile('card', {}), 'card_general');
  assert.equal(
    derivePlaidSourceProfile('card', { personal_finance_category: { primary: 'NOT_A_REAL_CATEGORY' } }),
    'card_general'
  );
});

test('real Plaid sandbox sample normalizes with no rejects and no _general profiles', () => {
  const realFixture = JSON.parse(
    readFileSync(resolve(here, '..', '..', 'fixtures', 'plaid-sandbox-sample', 'plaid-transactions-sync-real.json'), 'utf8')
  );
  const out = normalizePlaidTransactionsSync({
    payload: realFixture.payload,
    mapping_context: realFixture.mapping_context,
  });
  assert.equal(out.rejected_records.length, 0, 'real mapped accounts should produce no rejects');
  assert.ok(out.transactions.length > 0);
  for (const txn of out.transactions) {
    validateEnrichTransaction(txn, `real[${txn.transaction_id}]`);
    assert.ok(
      !txn.source_profile.endsWith('_general'),
      `${txn.transaction_id} collapsed to ${txn.source_profile}; PFC ${txn.partner_metadata.personal_finance_category} is unmapped`
    );
  }
  const transport = out.transactions.find((t) => t.merchant_name === 'Uber');
  assert.ok(transport && transport.source_profile.endsWith('_transport'));
});

test('merchant_name falls back through clean Plaid sources', () => {
  assert.equal(derivePlaidMerchantName({ merchant_name: 'Starbucks', name: 'STARBUCKS 123' }), 'Starbucks');
  assert.equal(
    derivePlaidMerchantName({ merchant_name: null, name: 'ACME CORP PAYROLL' }),
    'Acme Corp Payroll'
  );
  assert.equal(
    derivePlaidMerchantName({
      merchant_name: null,
      name: 'WIRE TRANSFER TITLE COMPANY ESCROW',
      counterparties: [{ name: 'Title Company Escrow', type: 'financial_institution' }],
    }),
    'Title Company Escrow'
  );
  assert.equal(derivePlaidMerchantName({ merchant_name: null }), null);
});

test('titleCase normalizes upper-case raw descriptions', () => {
  assert.equal(titleCase('ZELLE PAYMENT TO ALEX R'), 'Zelle Payment To Alex R');
});

test('records with unmapped accounts are rejected, not enriched', () => {
  const out = normalizePlaidTransactionsSync({
    payload: {
      accounts: [],
      added: [
        { transaction_id: 't1', account_id: 'unknown', amount: 10, date: '2026-05-01', name: 'SHOP' },
      ],
      modified: [],
      removed: [],
    },
    mapping_context: { account_customer_map: {}, account_home_zip_map: {} },
  });
  assert.equal(out.transactions.length, 0);
  assert.equal(out.rejected_records.length, 1);
  assert.deepEqual(out.rejected_records[0].reason_codes, [
    'missing_account_customer_mapping',
    'missing_home_zip_mapping',
  ]);
  assert.equal(out.rejected_records[0].retryable, true);
});

test('throws when payload is missing', () => {
  assert.throws(() => normalizePlaidTransactionsSync({}), TypeError);
});

function singleTxnPayload(overrides) {
  return {
    payload: {
      accounts: [{ account_id: 'acc1', name: 'Checking', type: 'depository' }],
      added: [
        {
          transaction_id: 't1',
          account_id: 'acc1',
          amount: 10,
          date: '2026-05-01',
          name: 'SHOP',
          iso_currency_code: 'USD',
          pending: false,
          ...overrides,
        },
      ],
      modified: [],
      removed: [],
    },
    mapping_context: {
      account_customer_map: { acc1: 'cust1' },
      account_home_zip_map: { acc1: '10003' },
    },
  };
}

test('pending transactions are held back by default', () => {
  const out = normalizePlaidTransactionsSync(singleTxnPayload({ pending: true }));
  assert.equal(out.transactions.length, 0);
  assert.equal(out.rejected_records.length, 1);
  assert.deepEqual(out.rejected_records[0].reason_codes, ['pending_transaction_excluded']);
  assert.equal(out.rejected_records[0].retryable, true);
});

test('pending transactions can be opted in via excludePending: false', () => {
  const out = normalizePlaidTransactionsSync(singleTxnPayload({ pending: true }), {
    excludePending: false,
  });
  assert.equal(out.transactions.length, 1);
  assert.equal(out.rejected_records.length, 0);
});

test('the golden fixture is unaffected by default options (no pending records)', () => {
  assert.deepEqual(result.transactions, normalizedFixture.transactions);
});

test('non-USD currencies are rejected as unsupported by default', () => {
  const out = normalizePlaidTransactionsSync(singleTxnPayload({ iso_currency_code: 'EUR' }));
  assert.equal(out.transactions.length, 0);
  assert.deepEqual(out.rejected_records[0].reason_codes, ['unsupported_currency']);
  assert.equal(out.rejected_records[0].retryable, false);
});

test('unofficial (e.g. crypto) currencies are rejected as unsupported', () => {
  const out = normalizePlaidTransactionsSync(
    singleTxnPayload({ iso_currency_code: null, unofficial_currency_code: 'BTC' })
  );
  assert.deepEqual(out.rejected_records[0].reason_codes, ['unsupported_currency']);
});

test('currency guard can be widened via allowedCurrencies', () => {
  const out = normalizePlaidTransactionsSync(singleTxnPayload({ iso_currency_code: 'EUR' }), {
    allowedCurrencies: ['USD', 'EUR'],
  });
  assert.equal(out.transactions.length, 1);
});

test('currency guard can be disabled with allowedCurrencies: null', () => {
  const out = normalizePlaidTransactionsSync(singleTxnPayload({ iso_currency_code: 'EUR' }), {
    allowedCurrencies: null,
  });
  assert.equal(out.transactions.length, 1);
});

test('removed transactions produce structured supersede instructions', () => {
  assert.deepEqual(result.removed_records, [
    {
      source_transaction_id: 'plaid_pending_streaming_0001',
      account_id: 'plaid_acc_credit_001',
      reason_code: 'removed_transaction_not_enriched',
    },
  ]);
  assert.deepEqual(result.removed_transaction_ids, ['plaid_pending_streaming_0001']);
});
