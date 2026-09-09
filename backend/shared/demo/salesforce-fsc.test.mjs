import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFscSchemaSummary,
  createSalesforceFscService,
  SalesforceFscError,
} from './salesforce-fsc.mjs';
import { buildSalesforceTaskRecord } from './demo-connectors.mjs';

const config = {
  salesforceLoginUrl: 'https://login.salesforce.com',
  salesforceClientId: 'client-id',
  salesforceClientSecret: 'client-secret',
};

test('FSC schema discovery distinguishes native workflow support from the Ventus extension', () => {
  const globalObjects = [
    { name: 'Account', queryable: true, createable: true, updateable: true },
    { name: 'Task', queryable: true, createable: true, updateable: true },
    { name: 'Ventus_Decision__c', queryable: true, createable: true, updateable: true },
  ];
  const summary = buildFscSchemaSummary(globalObjects, {
    Account: { fields: [{ name: 'Id', type: 'id' }] },
    Task: { fields: [{ name: 'WhatId', type: 'reference', referenceTo: ['Account'] }] },
    Ventus_Decision__c: {
      fields: [
        { name: 'Client_Account__c', type: 'reference', referenceTo: ['Account'] },
        { name: 'Decision_Reference__c', type: 'string' },
        { name: 'Outcome_Status__c', type: 'picklist' },
        { name: 'Outcome_Metric__c', type: 'string' },
      ],
    },
  });

  assert.equal(summary.capabilities.customerAnchor, true);
  assert.equal(summary.capabilities.employeeTask, true);
  assert.equal(summary.capabilities.decisionReceipt, true);
  assert.equal(summary.capabilities.outcomeReturn, true);
  assert.equal(summary.capabilities.referral, false);
  assert.equal(summary.requiredMappingsReady, true);
});

test('FSC outcome mapping verification checks the approved object and fields without customer reads', async () => {
  const requested = [];
  const service = createSalesforceFscService({
    buildTaskRecord: buildSalesforceTaskRecord,
    fetchImpl: async (url) => {
      if (url.endsWith('/services/oauth2/token')) {
        return json({ access_token: 'salesforce-access', instance_url: 'https://instance.salesforce.com' });
      }
      requested.push(url);
      return json({ fields: Object.values({
        decisionReferenceField: 'Bank_Decision_Reference__c', decisionPackageField: 'Bank_Decision_Snapshot__c',
        humanResponseField: 'Bank_Response__c', outcomeStatusField: 'Bank_Outcome_Status__c',
        outcomeEventTypeField: 'Bank_Outcome_Event__c', outcomeMetricField: 'Bank_Outcome_Metric__c',
        outcomeAmountField: 'Bank_Outcome_Amount__c', outcomeOccurredAtField: 'Bank_Outcome_At__c',
        outcomeSourceRecordIdField: 'Bank_Outcome_Source__c', outcomeReasonCodeField: 'Bank_Outcome_Reason__c',
      }).map((name) => ({ name })) });
    },
  });
  const result = await service.verifyOutcomeMapping({
    config,
    mapping: {
      decisionObject: 'Bank_Decision__c', decisionReferenceField: 'Bank_Decision_Reference__c',
      decisionPackageField: 'Bank_Decision_Snapshot__c', humanResponseField: 'Bank_Response__c',
      outcomeStatusField: 'Bank_Outcome_Status__c', outcomeEventTypeField: 'Bank_Outcome_Event__c',
      outcomeMetricField: 'Bank_Outcome_Metric__c', outcomeAmountField: 'Bank_Outcome_Amount__c',
      outcomeOccurredAtField: 'Bank_Outcome_At__c', outcomeSourceRecordIdField: 'Bank_Outcome_Source__c',
      outcomeReasonCodeField: 'Bank_Outcome_Reason__c',
    },
  });

  assert.match(requested[0], /sobjects\/Bank_Decision__c\/describe$/);
  assert.equal(result.check, 'outcome_mapping_verified');
  assert.equal(result.mappedFieldCount, 10);
});

test('FSC outcome mapping verification refuses a missing approved field', async () => {
  const service = createSalesforceFscService({
    buildTaskRecord: buildSalesforceTaskRecord,
    fetchImpl: async (url) => url.endsWith('/services/oauth2/token')
      ? json({ access_token: 'salesforce-access', instance_url: 'https://instance.salesforce.com' })
      : json({ fields: [{ name: 'Decision_Reference__c' }] }),
  });
  await assert.rejects(
    service.verifyOutcomeMapping({ config }),
    (error) => error instanceof SalesforceFscError && /missing fields/.test(error.message),
  );
});

test('FSC delivery writes a linked Task and a structured Decision Receipt', async () => {
  const writes = [];
  const service = createSalesforceFscService({
    buildTaskRecord: buildSalesforceTaskRecord,
    fetchImpl: async (url, options = {}) => {
      if (url.endsWith('/services/oauth2/token')) {
        return json({
          access_token: 'salesforce-access',
          instance_url: 'https://instance.salesforce.com',
        });
      }
      if (url.endsWith('/sobjects/Task')) {
        writes.push({ object: 'Task', body: JSON.parse(options.body) });
        return json({ id: '00T000000000001', success: true });
      }
      if (url.endsWith('/sobjects/Ventus_Decision__c')) {
        writes.push({ object: 'Ventus_Decision__c', body: JSON.parse(options.body) });
        return json({ id: 'a01000000000001', success: true });
      }
      throw new Error(`unexpected URL ${url}`);
    },
  });

  const result = await service.deliver({
    config,
    tenantId: 'demo_bank',
    now: new Date('2026-07-29T20:00:00Z'),
    body: decisionDeliveryBody(),
  });

  assert.equal(result.object, 'Ventus_Decision__c');
  assert.equal(result.records.task.id, '00T000000000001');
  assert.equal(result.records.decision.id, 'a01000000000001');
  assert.equal(result.records.referral, null);
  assert.equal(writes[0].body.WhatId, '001000000000001');
  assert.equal(writes[1].body.Client_Account__c, '001000000000001');
  assert.equal(writes[1].body.Decision_Reference__c, 'dec_fsc_001');
  assert.equal(JSON.parse(writes[1].body.Decision_Package__c).tenantId, 'demo_bank');
});

test('FSC delivery preserves the Task when the optional Decision Receipt is unavailable', async () => {
  const service = createSalesforceFscService({
    buildTaskRecord: buildSalesforceTaskRecord,
    fetchImpl: async (url) => {
      if (url.endsWith('/services/oauth2/token')) {
        return json({
          access_token: 'salesforce-access',
          instance_url: 'https://instance.salesforce.com',
        });
      }
      if (url.endsWith('/sobjects/Task')) return json({ id: '00T000000000001', success: true });
      if (url.endsWith('/sobjects/Ventus_Decision__c')) {
        return json([{ errorCode: 'NOT_FOUND', message: 'object is not installed' }], 404);
      }
      throw new Error(`unexpected URL ${url}`);
    },
  });

  const result = await service.deliver({
    config,
    tenantId: 'demo_bank',
    body: decisionDeliveryBody(),
  });

  assert.equal(result.object, 'Task');
  assert.equal(result.id, '00T000000000001');
  assert.equal(result.records.decision, null);
  assert.equal(result.warnings[0].stage, 'decision_receipt');
});

test('FSC outcome return honors an institution-approved Decision Receipt mapping', async () => {
  const requested = [];
  const service = createSalesforceFscService({
    buildTaskRecord: buildSalesforceTaskRecord,
    fetchImpl: async (url) => {
      if (url.endsWith('/services/oauth2/token')) {
        return json({
          access_token: 'salesforce-access',
          instance_url: 'https://instance.salesforce.com',
        });
      }
      requested.push(url);
      return json({
        Id: 'a01000000000001',
        Bank_Decision_Reference__c: 'dec_fsc_001',
        Bank_Decision_Snapshot__c: JSON.stringify({
          schemaVersion: '1.0',
          tenantId: 'demo_bank',
          decisionId: 'dec_fsc_001',
          evidenceClass: 'sandbox',
          response: { status: 'accepted' },
          outcome: { status: 'measuring', metric: 'deposit_retained' },
        }),
        Bank_Response__c: 'accepted',
        Bank_Outcome_Status__c: 'measured',
        Bank_Outcome_Event__c: 'deposit_balance_observed',
        Bank_Outcome_Metric__c: 'deposit_retained',
        Bank_Outcome_Amount__c: '18400',
        Bank_Outcome_At__c: '2026-08-01T00:00:00.000Z',
        Bank_Outcome_Source__c: 'core_123',
        Bank_Outcome_Reason__c: 'balance_retained',
        LastModifiedById: '005000000000001',
        LastModifiedDate: '2026-08-01T01:00:00.000Z',
      });
    },
  });

  const result = await service.readOutcome({
    config,
    tenantId: 'demo_bank',
    decisionRecordId: 'a01000000000001',
    mapping: {
      decisionObject: 'Bank_Decision__c',
      decisionReferenceField: 'Bank_Decision_Reference__c',
      decisionPackageField: 'Bank_Decision_Snapshot__c',
      humanResponseField: 'Bank_Response__c',
      outcomeStatusField: 'Bank_Outcome_Status__c',
      outcomeEventTypeField: 'Bank_Outcome_Event__c',
      outcomeMetricField: 'Bank_Outcome_Metric__c',
      outcomeAmountField: 'Bank_Outcome_Amount__c',
      outcomeOccurredAtField: 'Bank_Outcome_At__c',
      outcomeSourceRecordIdField: 'Bank_Outcome_Source__c',
      outcomeReasonCodeField: 'Bank_Outcome_Reason__c',
    },
  });

  assert.match(requested[0], /sobjects\/Bank_Decision__c/);
  assert.equal(result.decisionId, 'dec_fsc_001');
  assert.equal(result.recordUrl, 'https://instance.salesforce.com/lightning/r/a01000000000001/view');
  assert.equal(result.outcome.status, 'measured');
  assert.equal(result.outcome.observation.metric, 'deposit_retained');
  assert.equal(result.outcome.observation.amount, 18400);
});

test('FSC delivery rejects a Decision Package from another tenant before Salesforce is called', async () => {
  let called = false;
  const service = createSalesforceFscService({
    buildTaskRecord: buildSalesforceTaskRecord,
    fetchImpl: async () => {
      called = true;
      throw new Error('should not be called');
    },
  });

  await assert.rejects(
    service.deliver({
      config,
      tenantId: 'demo_bank',
      body: {
        ...decisionDeliveryBody(),
        decisionPackage: {
          ...decisionDeliveryBody().decisionPackage,
          tenantId: 'other_bank',
        },
      },
    }),
    (error) => error instanceof SalesforceFscError && error.status === 403,
  );
  assert.equal(called, false);
});

function decisionDeliveryBody() {
  return {
    subject: 'Review qualified deposit moment',
    whatId: '001000000000001',
    fsc: { clientId: '001000000000001', createReferral: false },
    insight: {
      growthPlay: 'Deposit Primacy Defense',
      moment: 'Payroll split',
      recommendedAction: 'Review the relationship before the next payroll cycle.',
      confidence: 93,
    },
    decisionPackage: {
      schemaVersion: '1.0',
      decisionId: 'dec_fsc_001',
      tenantId: 'demo_bank',
      createdAt: '2026-07-29T20:00:00.000Z',
      evidenceClass: 'sandbox',
      growthPlay: {
        id: 'deposit-primacy-defense',
        name: 'Deposit Primacy Defense',
        businessLine: 'consumer-banking',
        objective: 'Protect primary deposit relationships',
        primaryMetric: 'deposit_retained',
      },
      subject: { token: 'household_demo_001' },
      moment: {
        type: 'payroll_split',
        summary: 'Payroll is stable while off-bank transfers are increasing.',
        confidence: 93,
      },
      recommendation: {
        selectedAction: {
          id: 'banker-review',
          title: 'Banker relationship review',
          destination: 'salesforce-fsc',
        },
      },
      governance: {
        policyStatus: 'cleared',
        controls: ['Human review required'],
        assignmentArm: 'treatment',
      },
      response: { status: 'accepted' },
      outcome: { metric: 'deposit_retained', status: 'measuring' },
    },
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
