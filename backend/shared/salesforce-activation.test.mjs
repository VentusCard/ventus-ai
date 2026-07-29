import assert from 'node:assert/strict';
import test from 'node:test';
import { buildDepositRetentionSalesforceBody } from './salesforce-activation.mjs';

test('deposit activation becomes a banker-ready Salesforce brief', () => {
  const body = buildDepositRetentionSalesforceBody({
    input: {
      householdToken: 'tok_household_00000042',
      growthPlay: { version: '1.0.0' },
      records: [
        { rail: 'ach', amount: -4800, category: 'INCOME', merchant_name: 'ACME PAYROLL' },
        { rail: 'ach', amount: -4800, category: 'INCOME', merchant_name: 'ACME PAYROLL' },
        { rail: 'p2p', amount: 1850, category: 'TRANSFER_OUT', merchant_name: 'CHIME TRANSFER' },
        { rail: 'p2p', amount: 2100, category: 'TRANSFER_OUT', merchant_name: 'CHIME TRANSFER' },
      ],
      policies: [
        { policy_id: 'consent', verdict: 'clear' },
        { policy_id: 'eligibility', verdict: 'clear' },
      ],
      sourceReceipt: { sourceSystem: 'plaid_custom_user', recordCount: 4 },
    },
    decision: {
      confidence: 0.91,
      decisionId: 'dec_123',
      evidence: [
        { summary: 'Payroll remains in the primary checking relationship.' },
        { summary: 'Repeated external movement indicates increasing primacy risk.' },
      ],
    },
    contactId: '003000000000001AAA',
    accountId: '001000000000001AAA',
  });

  assert.equal(body.subject, 'Primary deposit relationship at risk');
  assert.equal(body.insight.confidence, 91);
  assert.match(body.insight.whyNow, /\$3,950 moved off-bank across 2 recent transfers/);
  assert.match(body.insight.recommendedAction, /before the next payroll cycle/);
  assert.deepEqual(body.insight.controls, ['Consent', 'Eligibility']);
  assert.equal(body.whoId, '003000000000001AAA');
  assert.equal(body.whatId, '001000000000001AAA');
});
