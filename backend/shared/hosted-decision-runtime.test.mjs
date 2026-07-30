import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DecisionRequestError,
  executeHostedDecision,
  requiredEntitlementForScenario,
} from './hosted-decision-runtime.mjs';

test('hosted decision runtime qualifies deposit primacy from tokenized Plaid evidence', () => {
  const result = executeHostedDecision({
    tenantId: 'ventus',
    now: new Date('2026-07-30T00:00:00.000Z'),
    body: {
      scenario: 'deposit-retention',
      source: { mode: 'live', name: 'Plaid sandbox' },
      transactions: [
        transaction('tx_payroll', 'PAYROLL', 'ADP', -4200, 'INCOME'),
        transaction('tx_transfer', 'CHIME TRANSFER', 'Chime', 1800, 'TRANSFER_OUT'),
      ],
    },
  });
  assert.equal(result.status, 'qualified');
  assert.equal(result.opportunity.type, 'Checking primacy at risk');
  assert.equal(result.runtime.modelInvocation, null);
  assert.deepEqual(result.source.transactionRefs, ['tx_payroll', 'tx_transfer']);
});

test('hosted decision runtime suppresses under policy and validates requests', () => {
  const body = {
    scenario: 'wealth-growth',
    source: { mode: 'fixture', name: 'Plaid-shaped fixture' },
    policyContext: { doNotContact: true },
    transactions: [
      transaction('tx_rollover', 'FIDELITY ROLLOVER', 'Fidelity', -230000, 'TRANSFER_IN'),
    ],
  };
  assert.equal(executeHostedDecision({ tenantId: 'ventus', body }).status, 'suppressed');
  assert.equal(requiredEntitlementForScenario('wealth-growth'), 'wealth_demo');
  assert.throws(
    () => executeHostedDecision({ tenantId: 'ventus', body: { ...body, transactions: [] } }),
    DecisionRequestError,
  );
});

function transaction(transaction_id, name, merchant_name, amount, primary) {
  return {
    transaction_id,
    name,
    merchant_name,
    amount,
    date: '2026-07-01',
    personal_finance_category: { primary, detailed: `${primary}_DETAIL` },
  };
}
