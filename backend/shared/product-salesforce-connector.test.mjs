import assert from 'node:assert/strict';
import test from 'node:test';
import { createProductSalesforceConnector, ProductSalesforceConnectorError } from './product-salesforce-connector.mjs';

const decisionPackage = {
  tenantId: 'pilot_bank',
  decisionId: 'dec_123',
  growthPlay: { name: 'Deposit Primacy Defense', businessLine: 'consumer-banking', primaryMetric: 'deposit_retained' },
  subject: { token: 'tok_123' },
  moment: { type: 'Checking primacy at risk', summary: 'Spend is moving off-bank.', confidence: 90, evidence: [{ label: 'Payroll relationship', confidence: 90 }] },
  recommendation: { selectedAction: { id: 'banker-retention-review', title: 'Open a banker retention review', instructions: 'Review the relationship.', destination: 'Salesforce FSC' } },
  governance: { policyStatus: 'cleared', controls: ['MVP policy checks cleared'] },
  response: { status: 'accepted' },
  outcome: { windowDays: 30 },
};

test('product connector fails clearly when server-only Salesforce configuration is unset', async () => {
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({ salesforceLoginUrl: 'CONFIGURE_SALESFORCE_LOGIN_URL' }),
    fscService: { deliver: async () => { throw new Error('should not deliver'); } },
  });
  await assert.rejects(
    connector.deliver({ tenantId: 'pilot_bank', decisionPackage }),
    (error) => error instanceof ProductSalesforceConnectorError && error.code === 'salesforce_connector_unconfigured' && error.terminalFailure,
  );
});

test('product connector derives the Salesforce payload from the Decision Package only', async () => {
  const calls = [];
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({
      salesforceLoginUrl: 'https://example.my.salesforce.com',
      salesforceClientId: 'client',
      salesforceClientSecret: 'secret',
      salesforceCreateReferral: false,
    }),
    fscService: {
      async deliver(input) {
        calls.push(input);
        return {
          object: 'Task',
          id: '00T123456789012EAA',
          url: 'https://example.my.salesforce.com/lightning/r/Task/00T123456789012EAA/view',
          records: { task: { id: '00T123456789012EAA', url: 'https://example.my.salesforce.com/lightning/r/Task/00T123456789012EAA/view' }, decision: null, referral: null },
        };
      },
    },
  });
  const result = await connector.deliver({ tenantId: 'pilot_bank', decisionPackage });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.insight.customerRef, 'tok_123');
  assert.equal(calls[0].body.whoId, undefined);
  assert.equal(calls[0].body.whatId, undefined);
  assert.equal(calls[0].body.decisionPackage, decisionPackage);
  assert.equal(result.records.task.id, '00T123456789012EAA');
});
