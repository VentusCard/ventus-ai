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
