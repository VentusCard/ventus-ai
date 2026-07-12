// Proves the Plaid source adapter's pure logic without live keys: a Plaid-shaped response
// maps into the loop's tokenized record contract (no direct PII), and the content detector
// selects a liquidity signal citing REAL transaction ids from those records.
//
//   npm run test:plaid-source
//
// The live pull itself is exercised by `npm run pilot:e2e` with PLAID_* set.
import assert from 'node:assert/strict';
import { mapPlaidToLoopRecords, contentDetector, buildPlaidSourceReceipt } from '../shared/plaid-source.mjs';

// A realistic Plaid /transactions/get response for the injected custom user.
const plaidResponse = [
  { transaction_id: 'plaid_tx_1', name: 'FIDELITY ROLLOVER', merchant_name: 'Fidelity', amount: -230000, date: '2026-06-11', personal_finance_category: { primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER' } },
  { transaction_id: 'plaid_tx_2', name: 'GUSTO PAYROLL', merchant_name: 'Gusto', amount: -5100, date: '2026-06-02', personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' } },
  { transaction_id: 'plaid_tx_3', name: 'COSTCO WHOLESALE', merchant_name: 'Costco', amount: 320, date: '2026-06-14', personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_SUPERSTORES' } },
];

const records = mapPlaidToLoopRecords(plaidResponse);

// 1) Mapping produces the loop contract, tokenized, with no direct-PII keys.
const PII_KEYS = ['customer_name', 'name', 'first_name', 'last_name', 'email', 'phone', 'ssn', 'address'];
for (const record of records) {
  assert.ok(record.transaction_id && record.rail && record.source_system, 'record has contract fields');
  assert.equal(record.entity, 'tokenized_counterparty', 'counterparty is tokenized');
  for (const key of PII_KEYS) assert.ok(!(key in record), `no direct-PII key "${key}"`);
}
assert.equal(records.find((r) => r.transaction_id === 'plaid_tx_1').rail, 'wire', 'rollover maps to wire rail');
assert.equal(records.find((r) => r.transaction_id === 'plaid_tx_2').rail, 'ach', 'payroll maps to ach rail');

// 2) The content detector fires liquidity-to-wealth and cites REAL transaction ids present
//    in the records (the loop enforces this grounding downstream).
const decision = contentDetector({ records, policies: [{ policy_id: 'consent', verdict: 'clear' }] });
assert.equal(decision.growthPlayId, 'liquidity-to-wealth');
assert.equal(decision.abstain, false);
assert.equal(decision.connector, 'salesforce');
const citedIds = decision.evidence.map((e) => e.transaction_id);
assert.deepEqual(citedIds.sort(), ['plaid_tx_1', 'plaid_tx_2'], 'cites the rollover + payroll transactions');
for (const id of citedIds) assert.ok(records.some((r) => r.transaction_id === id), 'every cited id exists in source records');

// 3) A blocking policy suppresses before any action.
const blocked = contentDetector({ records, policies: [{ policy_id: 'consent', verdict: 'block' }] });
assert.equal(blocked.abstain, true);
assert.equal(blocked.actionId, null);

// 4) Source receipt is sandbox evidence (outcomes stay simulated).
const receipt = buildPlaidSourceReceipt(records, 'plaid_custom_user');
assert.equal(receipt.evidenceClass, 'sandbox');
assert.equal(receipt.recordCount, records.length);

console.log('Plaid source adapter verified: Plaid schema → tokenized loop records → grounded liquidity decision.');
console.log(` · ${records.length} records mapped, 0 direct-PII keys, counterparties tokenized`);
console.log(` · decision cites real ids: ${citedIds.join(', ')} → salesforce (liquidity-to-wealth)`);
