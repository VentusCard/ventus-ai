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

test('product connector performs a safe authenticated Salesforce health check', async () => {
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({
      salesforceLoginUrl: 'https://example.my.salesforce.com', salesforceClientId: 'client', salesforceClientSecret: 'secret',
    }),
    fscService: {
      async deliver() { throw new Error('delivery must not run during a health check'); },
      async healthCheck() { return { instanceDomain: 'example.my.salesforce.com' }; },
    },
  });
  const result = await connector.testConnection();
  assert.equal(result.connector, 'salesforce-fsc');
  assert.match(result.detail, /Authenticated API read succeeded/);
});

test('product connector verifies the approved FSC outcome mapping before it can be activated', async () => {
  const calls = [];
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({
      salesforceLoginUrl: 'https://example.my.salesforce.com', salesforceClientId: 'client', salesforceClientSecret: 'secret',
    }),
    fscService: {
      async deliver() { throw new Error('delivery must not run during a mapping check'); },
      async healthCheck() { throw new Error('mapping checks must not fall back to a generic health check'); },
      async verifyOutcomeMapping(input) { calls.push(input); return { check: 'outcome_mapping_verified', decisionObject: 'Bank_Decision__c', instanceDomain: 'example.my.salesforce.com' }; },
    },
  });
  const result = await connector.testConnection({ mapping: { configuration: { decisionObject: 'Bank_Decision__c' } } });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].mapping.decisionObject, 'Bank_Decision__c');
  assert.equal(result.check, 'outcome_mapping_verified');
  assert.match(result.detail, /Approved outcome mapping verified/);
});

test('product connector passes the approved FSC field mapping only to the server-side outcome reader', async () => {
  const calls = [];
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({
      salesforceLoginUrl: 'https://example.my.salesforce.com', salesforceClientId: 'client', salesforceClientSecret: 'secret',
    }),
    fscService: {
      async deliver() { throw new Error('delivery is not part of outcome readback'); },
      async readOutcome(input) {
        calls.push(input);
        return { decisionId: 'dec_123', outcome: { status: 'measuring' } };
      },
    },
  });
  const mapping = {
    configuration: {
      decisionObject: 'Bank_Decision__c',
      outcomeStatusField: 'Bank_Outcome_Status__c',
    },
  };

  await connector.readOutcome({
    tenantId: 'pilot_bank',
    decisionRecordId: 'a01000000000001',
    mapping,
  });

  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0].mapping, mapping.configuration);
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

test('product connector carries the immutable Decision Package v1.2 identity to FSC', async () => {
  const calls = [];
  const packageV12 = {
    schemaVersion: '1.2',
    tenantId: 'pilot_bank',
    decisionId: 'dec_123',
    packageDigest: `sha256:${'a'.repeat(64)}`,
  };
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({
      salesforceLoginUrl: 'https://example.my.salesforce.com', salesforceClientId: 'client', salesforceClientSecret: 'secret', salesforceCreateReferral: false,
    }),
    fscService: {
      async deliver(input) {
        calls.push(input);
        return { object: 'Task', id: '00T123456789012EAA', url: 'https://example.my.salesforce.com/lightning/r/Task/00T123456789012EAA/view', records: {} };
      },
    },
  });
  await connector.deliver({ tenantId: 'pilot_bank', decisionPackage, decisionPackageV12: packageV12 });
  assert.equal(calls[0].body.decisionPackageV12.packageDigest, packageV12.packageDigest);
  assert.equal(calls[0].body.insight.decisionPackageDigest, packageV12.packageDigest);
});

test('product connector treats authentication failure as terminal configuration failure', async () => {
  const connector = createProductSalesforceConnector({
    getSecrets: async () => ({
      salesforceLoginUrl: 'https://example.my.salesforce.com',
      salesforceClientId: 'client',
      salesforceClientSecret: 'secret',
    }),
    fscService: {
      async deliver() {
        const error = new Error('Salesforce authentication failed (400)');
        error.name = 'SalesforceFscError';
        throw error;
      },
    },
  });
  await assert.rejects(
    connector.deliver({ tenantId: 'pilot_bank', decisionPackage }),
    (error) => error instanceof ProductSalesforceConnectorError && error.code === 'salesforce_auth_invalid' && error.terminalFailure,
  );
});
