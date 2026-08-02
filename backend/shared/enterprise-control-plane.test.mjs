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

test('FSC treatment reconciliation records immutable workflow evidence without lift eligibility', async () => {
  const inserts = [];
  const ledgerEvents = [];
  const getDB = async () => ({
    async connect() {},
    async end() {},
    async query(sql, params = []) {
      if (sql.includes('INSERT INTO outcome_observation_receipts')) {
        inserts.push(params);
        return {
          rows: [{
            observation_id: params[1],
            status: params[7],
            observation: params[8],
            synced_at: '2026-08-01T21:00:00.000Z',
          }],
        };
      }
      return { rows: [] };
    },
  });
  const controlPlane = createEnterpriseControlPlane({
    growthPlayRegistry: { register() { throw new Error('not used'); } },
    getDB,
    ledgerRepository: {
      async append(event) {
        ledgerEvents.push(event);
        return { record: { sequence_number: 41, event_hash: 'a'.repeat(64) } };
      },
    },
  });
  const input = {
    tenantId: 'pilot_bank',
    actorId: 'reviewer_001',
    mapping: {
      mappingId: 'map_fsc_001', version: 3,
      configuration: { authorityType: 'workflow_observation' },
    },
    moment: {
      decisionPackage: {
        subject: { token: 'tok_abcdefgh' },
        growthPlay: {
          id: 'deposit-primacy-defense',
          protocolId: 'dcp_deposit_001',
        },
      },
      decisionPackageV12: {
        packageDigest: 'b'.repeat(64),
        governance: { policyVersion: 'policy_deposit_001' },
      },
    },
    outcome: {
      decisionId: 'dec_treatment_001',
      decisionRecordId: 'a09123456789012AAA',
      response: {
        status: 'accepted',
        actorToken: 'employee_opaque_001',
        recordedAt: '2026-08-01T20:58:00.000Z',
      },
      workflow: {
        taskId: '00T123456789012AAA',
        referralId: '00Q123456789012AAA',
        status: 'completed',
        completedAt: '2026-08-01T20:59:00.000Z',
        observedAt: '2026-08-01T21:00:00.000Z',
        reasonCode: 'customer_contacted',
      },
      outcome: { status: 'completed', observation: null },
    },
  };

  const first = await controlPlane.recordFscOutcome(input);
  const retry = await controlPlane.recordFscOutcome(input);

  assert.equal(first.observation.observation.kind, 'workflow_observation');
  assert.equal(first.observation.observation.response.status, 'accepted');
  assert.equal(first.observation.observation.status, 'completed');
  assert.equal(first.observation.observation.reasonCode, 'customer_contacted');
  assert.equal(first.measurement.status, 'workflow_only');
  assert.equal(first.eligibleForLift, false);
  assert.equal(first.workflowLedgerReceipt.sequenceNumber, 41);
  assert.equal(first.measurementLedgerReceipt, null);
  assert.equal(retry.observation.observationId, first.observation.observationId);
  assert.equal(inserts[0][0], 'pilot_bank');
  assert.equal(inserts[0][2], 'dec_treatment_001');
  assert.equal(inserts[0][4], 'tok_abcdefgh');
  assert.equal(inserts[0][5], 'map_fsc_001');
  assert.equal(inserts[0][6], 3);
  assert.equal(ledgerEvents[0].payload.workflow_observation_only, true);
  assert.equal(ledgerEvents[0].payload.package_digest, 'b'.repeat(64));
  assert.equal(ledgerEvents[0].idempotencyKey, ledgerEvents[1].idempotencyKey);
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
