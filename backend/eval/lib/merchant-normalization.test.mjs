import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCleanMerchantName } from './merchant-normalization.mjs';

test('clean merchant normalizer maps raw processor strings to canonical names', () => {
  assert.equal(
    normalizeCleanMerchantName({
      predictedName: 'ComEd',
      rawMerchantName: 'COMED ELECTRIC BILLPAY',
    }),
    'ComEd Electric'
  );
  assert.equal(
    normalizeCleanMerchantName({
      predictedName: 'WAL-MART',
      rawMerchantName: 'WAL-MART #2604',
    }),
    'Walmart'
  );
  assert.equal(
    normalizeCleanMerchantName({
      predictedName: 'IRS TREAS',
      rawMerchantName: 'IRS TREAS 310 TAX REFUND',
    }),
    'IRS Tax Refund'
  );
});

test('clean merchant normalizer preserves useful payment app canonical labels', () => {
  assert.equal(
    normalizeCleanMerchantName({
      predictedName: 'Zelle - Alex R',
      rawMerchantName: 'ZELLE PAYMENT TO ALEX R',
    }),
    'Zelle Payment'
  );
  assert.equal(
    normalizeCleanMerchantName({
      predictedName: 'Cash App - Mike',
      rawMerchantName: 'CASH APP*MIKE DINNER',
    }),
    'Cash App'
  );
});

test('clean merchant normalizer falls back to readable title case', () => {
  assert.equal(
    normalizeCleanMerchantName({
      predictedName: 'unknown merchant #12345',
      rawMerchantName: null,
    }),
    'Unknown Merchant'
  );
});
