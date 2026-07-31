import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import {
  DecisionRequestError,
  executeHostedDecision,
  requiredEntitlementForScenario,
} from './hosted-decision-runtime.mjs';

test('hosted decision runtime qualifies deposit primacy from tokenized Plaid evidence', () => {
  const contract = approvedDepositContract();
  const result = executeHostedDecision({
    tenantId: 'ventus',
    now: new Date('2026-07-30T00:00:00.000Z'),
    protocolApproval: {
      approvalEventId: 'gpa_approved_123',
      decisionProtocolId: contract.decision_protocol_id,
      growthPlayId: contract.growth_play_id,
      businessLine: contract.business_line,
      protocolDigest: contract.protocol_digest,
      contract,
      decidedAt: '2026-07-29T12:00:00.000Z',
    },
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
  assert.equal(result.runtime.protocolApprovalId, 'gpa_approved_123');
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
  assert.throws(
    () => executeHostedDecision({
      tenantId: 'ventus',
      body: {
        ...body,
        scenario: 'deposit-retention',
        source: { mode: 'live', name: 'Plaid sandbox' },
        policyContext: {},
        transactions: [transaction('tx_payroll', 'PAYROLL', 'ADP', -4200, 'INCOME')],
      },
    }),
    /independently approved Growth Play protocol/,
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

function approvedDepositContract() {
  return compileGrowthPlayContract({
    contract_version: '1.0',
    growth_play_id: 'deposit-primacy-defense',
    version: '1.0.0',
    business_line: 'consumer-banking',
    objective: 'Retain primary deposit relationships through governed banker review',
    source: {
      receipt_source_systems: ['plaid_custom_user'],
      schema_versions: ['plaid-transactions-1'],
      record_sources: [{ source_system: 'deposit_core', allowed_rails: ['ach', 'card', 'p2p', 'wire'] }],
    },
    eligibility: { criteria_version: 'deposit-primacy-eligibility-v1' },
    policy: { version: 'mvp-policy-v1', required_policy_ids: ['consent', 'eligibility', 'vulnerability'] },
    actions: [{
      action_id: 'banker_retention_review',
      owner_role: 'relationship_banker',
      connector: 'salesforce-fsc',
      destination: 'fsc_task',
      destination_environment: 'sandbox',
    }],
    measurement: {
      metric: 'deposit_retained',
      outcome_event_types: ['deposit_balance_observed'],
      outcome_source_systems: ['deposit_core_sandbox'],
      outcome_window_days: 31,
      holdout_pct: 10,
      minimum_per_arm: 30,
      minimum_coverage: 0.9,
    },
  });
}
