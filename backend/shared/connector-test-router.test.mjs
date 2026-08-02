import assert from 'node:assert/strict';
import test from 'node:test';
import { testConfiguredConnector } from './connector-test-router.mjs';

test('connector test routing derives the connector from a persisted mapping', async () => {
  const calls = [];
  const mapping = { connector: 'salesforce-fsc', configuration: { decisionObject: 'Ventus_Decision__c' } };
  const result = await testConfiguredConnector({
    mapping,
    testSalesforce: async (input) => { calls.push(input); return { check: 'outcome_mapping_verified' }; },
    testCoworker: async () => { throw new Error('coworker should not be selected'); },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].mapping, mapping);
  assert.equal(result.check, 'outcome_mapping_verified');
});
