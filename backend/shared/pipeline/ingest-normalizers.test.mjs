import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  normalizeIngest,
  isSupportedIngestFormat,
  SUPPORTED_INGEST_FORMATS,
} from './ingest-normalizers.mjs';
import { normalizePlaidTransactionsSync } from './plaid-transactions-sync.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const rawFixture = JSON.parse(
  readFileSync(
    resolve(here, '..', '..', 'fixtures', 'partner-ingest', 'plaid-transactions-sync-raw.json'),
    'utf8'
  )
);

test('normalized format is a passthrough with no report', () => {
  const transactions = [{ transaction_id: 't1', customer_id: 'c1' }];
  const { transactions: out, report } = normalizeIngest('normalized', { transactions });
  assert.equal(out, transactions);
  assert.equal(report, null);
});

test('plaid format normalizes the raw payload via the Plaid normalizer', () => {
  const expected = normalizePlaidTransactionsSync({
    payload: rawFixture.payload,
    mapping_context: rawFixture.mapping_context,
  });
  const { transactions, report } = normalizeIngest('plaid', rawFixture);

  assert.deepEqual(transactions, expected.transactions);
  assert.ok(transactions.length > 0, 'expected at least one accepted transaction');
  assert.deepEqual(report.rejected_records, expected.rejected_records);
  assert.deepEqual(report.removed_records, expected.removed_records);
  assert.deepEqual(report.removed_transaction_ids, expected.removed_transaction_ids);
  assert.deepEqual(report.summary, expected.summary);
  assert.equal(report.next_cursor, expected.next_cursor);
  assert.equal(report.has_more, expected.has_more);
});

test('unsupported format throws', () => {
  assert.throws(() => normalizeIngest('equifax', {}), /unsupported ingest_format: equifax/);
});

test('isSupportedIngestFormat reflects the supported set', () => {
  assert.ok(isSupportedIngestFormat('normalized'));
  assert.ok(isSupportedIngestFormat('plaid'));
  assert.ok(!isSupportedIngestFormat('jack_henry'));
  assert.ok(!isSupportedIngestFormat(undefined));
  assert.deepEqual(SUPPORTED_INGEST_FORMATS, ['normalized', 'plaid']);
});
