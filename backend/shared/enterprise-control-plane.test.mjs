import assert from 'node:assert/strict';
import test from 'node:test';
import { createEnterpriseControlPlane, deriveEvidenceClass, fscObservationReceiptId, projectMeasurementReadiness } from './enterprise-control-plane.mjs';

test('evidence class is derived across the package, including mixed experiments', () => {
  assert.equal(deriveEvidenceClass([]), 'none');
  assert.equal(deriveEvidenceClass([{ evidenceClass: 'partner_sandbox' }, { evidenceClass: 'sandbox' }]), 'partner_sandbox');
  assert.equal(deriveEvidenceClass([{ evidenceClass: 'fixture' }, { evidenceClass: 'sandbox' }]), 'mixed');
  assert.equal(deriveEvidenceClass([{ evidenceClass: 'sanctioned' }, { evidenceClass: 'sanctioned_pilot' }]), 'sanctioned_pilot');
});

test('FSC workflow receipt identity is independent from economic corrections', () => {
  const base = {
    tenantId: 'pilot_bank',
    decisionRecordId: 'a09123456789012AAA',
    outcome: {
      outcome: {
        status: 'measured',
        observation: {
          eventType: 'deposit_balance_observed', occurredAt: '2026-07-31T00:00:00.000Z',
          sourceRecordId: 'core_123', metric: 'deposit_retained', amount: 100, currency: 'USD',
        },
      },
    },
  };
  const original = fscObservationReceiptId(base);
  const retry = fscObservationReceiptId(base);
  const correction = fscObservationReceiptId({
    ...base,
    outcome: { outcome: { ...base.outcome.outcome, observation: { ...base.outcome.outcome.observation, amount: 125 } } },
  });
  assert.equal(original, retry);
  assert.equal(original, correction);
  const workflowChange = fscObservationReceiptId({
    ...base,
    outcome: { ...base.outcome, workflow: { status: 'completed', observedAt: '2026-07-31T02:00:00.000Z' } },
  });
  assert.notEqual(original, workflowChange);
});

test('FSC observation retries preserve their original timestamp and recover legacy replay records', async () => {
  const appendCalls = [];
  const controlPlane = createEnterpriseControlPlane({
    growthPlayRegistry: { register() { throw new Error('not used'); } },
    ledgerRepository: {
      async append(draft) {
        appendCalls.push(draft);
        throw new Error('ledger idempotency key reused for different event content + actual - expected');
      },
    },
    getDB: async () => ({
      async connect() {},
      async end() {},
      async query(sql) {
        if (sql.includes('INSERT INTO outcome_observation_receipts')) {
          return {
            rows: [{
              observation_id: 'obs_legacy_001', status: 'measuring', observation: null,
              synced_at: '2026-07-31T00:00:00.000Z',
            }],
          };
        }
        return { rows: [] };
      },
    }),
  });

  const result = await controlPlane.recordFscOutcome({
    tenantId: 'pilot_bank',
    actorId: 'operator_001',
    mapping: { mappingId: 'map_fsc_001', version: 1 },
    moment: {
      decisionPackage: {
        subject: { token: 'tok_abcdefgh' },
        growthPlay: { id: 'deposit-primacy-defense', protocolId: 'dcp_deposit_001' },
      },
    },
    outcome: {
      decisionId: 'dec_legacy_001',
      decisionRecordId: 'a09123456789012AAA',
      outcome: { status: 'measuring', observation: null },
    },
  });

  assert.deepEqual(result.ledgerReceipt, { replayedLegacyObservation: true });
  assert.equal(appendCalls[0].occurredAt, '2026-07-31T00:00:00.000Z');
});

test('FSC mappings default to workflow evidence and certified economic views require a complete contract', async () => {
  const controlPlane = createEnterpriseControlPlane({
    growthPlayRegistry: { register() { throw new Error('not used'); } },
    getDB: async () => { throw new Error('validation should fail before opening the database'); },
  });
  const base = {
    tenantId: 'pilot_bank', mappingId: 'map_fsc_001', connector: 'salesforce-fsc',
    expectedVersion: 0, status: 'draft', actorId: 'admin_001',
  };
  await assert.rejects(() => controlPlane.saveConnection({
    ...base,
    configuration: {
      authorityType: 'certified_economic_view',
      decisionObject: 'Ventus_Decision__c',
      outcomeStatusField: 'Outcome_Status__c',
    },
  }), /certificationId/);
});

test('measurement readiness requires measured outcomes in both arms, not only assignments', () => {
  const readiness = projectMeasurementReadiness({
    treatment_assigned: 30, holdout_assigned: 30,
    treatment_outcomes_observed: 27, holdout_outcomes_observed: 27,
    minimum_per_arm: 30, minimum_coverage: 0.9,
  });
  assert.equal(readiness.coverageReady, true);
  assert.equal(readiness.sampleReady, false);
  assert.equal(readiness.ready, false);
  assert.equal(readiness.claimStatus, 'not_eligible');
});
