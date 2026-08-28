import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { merrillRelationshipDetector, standaloneGrowthPlayDetector } from './standalone-growth-play-detectors.mjs';

const drafts = JSON.parse(readFileSync(new URL('../../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const deposit = compileGrowthPlayContract(drafts[0]);
const merrill = compileGrowthPlayContract(drafts[1]);
const clear = merrill.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' }));
const householdToken = 'tok_household_000001';
const records = [
  record('tx_acats', 'acats', 275000, 'merrill_transfer_workflow'),
  record('tx_account', 'account', 85000, 'merrill_books'),
  record('tx_digital', 'digital', 3, 'merrill_digital'),
];

test('Merrill detector creates an evidence-grounded approved action without Consumer records', () => {
  const decision = merrillRelationshipDetector({ records, policies: clear, growthPlay: merrill, householdToken });
  assert.equal(decision.actionId, 'assign_advisor_consolidation_review');
  assert.equal(decision.connector, 'salesforce');
  assert.equal(decision.deliveryPayload.household_token, householdToken);
  assert.deepEqual(decision.evidence.map((item) => item.transaction_id), ['tx_acats', 'tx_account', 'tx_digital']);
  assert.ok(records.every((item) => item.source_system.startsWith('merrill_')));
});

test('Merrill detector abstains on incomplete evidence and policy blocks', () => {
  const incomplete = merrillRelationshipDetector({ records: records.slice(0, 2), policies: clear, growthPlay: merrill, householdToken });
  assert.equal(incomplete.abstain, true);
  assert.equal(incomplete.actionId, null);
  const blocked = merrillRelationshipDetector({
    records,
    policies: clear.map((policy) => policy.policy_id === 'consent' ? { ...policy, verdict: 'block' } : policy),
    growthPlay: merrill,
    householdToken,
  });
  assert.equal(blocked.abstain, true);
  assert.equal(blocked.actionId, null);
});

test('standalone dispatcher fails closed for unpromoted plays', () => {
  assert.equal(standaloneGrowthPlayDetector({ records, policies: clear, growthPlay: merrill, householdToken }).growthPlayId, merrill.growth_play_id);
  assert.throws(() => standaloneGrowthPlayDetector({ records, policies: clear, growthPlay: { ...deposit, growth_play_id: 'unknown-play' }, householdToken }), /no promoted standalone detector/);
});

function record(transactionId, rail, amount, sourceSystem) {
  return {
    transaction_id: transactionId,
    rail,
    amount,
    source_system: sourceSystem,
    occurred_at: '2026-07-10T00:00:00.000Z',
    merchant_name: 'Tokenized evidence',
  };
}
