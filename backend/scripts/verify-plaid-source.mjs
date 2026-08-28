// Proves the Plaid source adapter's pure logic without live keys: a Plaid-shaped response
// maps into the loop's tokenized record contract (no direct PII), and both standalone
// Deposit Primacy and expansion detectors cite real transaction ids from those records.
//
//   npm run test:plaid-source
//
// The live pull itself is exercised by `npm run pilot:e2e` with PLAID_* set.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileGrowthPlayContract } from '../shared/pilot/growth-play-contract.mjs';
import { buildPlaidSourceReceipt, contentDetector, depositPrimacyDetector, mapPlaidToLoopRecords } from '../shared/pilot/plaid-source.mjs';

// A realistic Plaid /transactions/get response for the injected custom user.
const plaidResponse = [
  { transaction_id: 'plaid_tx_1', name: 'FIDELITY ROLLOVER', merchant_name: 'Fidelity', amount: -230000, date: '2026-06-11', personal_finance_category: { primary: 'TRANSFER_IN', detailed: 'TRANSFER_IN_ACCOUNT_TRANSFER' } },
  { transaction_id: 'plaid_tx_2', name: 'GUSTO PAYROLL', merchant_name: 'Gusto', amount: -5100, date: '2026-06-02', personal_finance_category: { primary: 'INCOME', detailed: 'INCOME_WAGES' } },
  { transaction_id: 'plaid_tx_3', name: 'COSTCO WHOLESALE', merchant_name: 'Costco', amount: 320, date: '2026-06-14', personal_finance_category: { primary: 'GENERAL_MERCHANDISE', detailed: 'GENERAL_MERCHANDISE_SUPERSTORES' } },
  { transaction_id: 'plaid_tx_4', name: 'CHIME TRANSFER', merchant_name: 'Chime', amount: 2100, date: '2026-06-20', personal_finance_category: { primary: 'TRANSFER_OUT', detailed: 'TRANSFER_OUT_ACCOUNT_TRANSFER' } },
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

// 4) The standalone Consumer detector uses the compiled Growth Play and cites payroll +
//    off-bank outflow without relying on Merrill or cross-business data.
const playDrafts = JSON.parse(readFileSync(new URL('../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const depositPlay = compileGrowthPlayContract(playDrafts.find((play) => play.growth_play_id === 'deposit-primacy-defense'));
const depositDecision = depositPrimacyDetector({
  records,
  policies: depositPlay.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' })),
  growthPlay: depositPlay,
  householdToken: 'tok_plaid_household_001',
});
assert.equal(depositDecision.growthPlayId, 'deposit-primacy-defense');
assert.equal(depositDecision.abstain, false);
assert.deepEqual(depositDecision.evidence.map((item) => item.transaction_id).sort(), ['plaid_tx_2', 'plaid_tx_4']);
assert.equal(depositDecision.deliveryPayload.household_token, 'tok_plaid_household_001');

// 5) Source receipt is sandbox evidence (outcomes stay simulated).
const receipt = buildPlaidSourceReceipt(records, 'plaid_custom_user');
assert.equal(receipt.evidenceClass, 'sandbox');
assert.equal(receipt.recordCount, records.length);

console.log('Plaid source adapter verified: Plaid schema → tokenized loop records → grounded standalone and expansion decisions.');
console.log(` · ${records.length} records mapped, 0 direct-PII keys, counterparties tokenized`);
console.log(` · decision cites real ids: ${citedIds.join(', ')} → salesforce (liquidity-to-wealth)`);
console.log(' · Deposit Primacy cites payroll + off-bank transfer using the compiled Consumer protocol');
