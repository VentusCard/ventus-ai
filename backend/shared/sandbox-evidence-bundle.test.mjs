import assert from 'node:assert/strict';
import test from 'node:test';
import { createSandboxEvidenceBundleService } from './sandbox-evidence-bundle.mjs';

test('sandbox evidence bundle exports an opaque, receipt-backed and claim-gated review artifact', async () => {
  const service = createSandboxEvidenceBundleService({
    ledgerRepository: {
      async exportTenant() {
        return {
          verified: true,
          events: [
            trace(1, 'counterfactual', { experiment_id: 'exp_001', assignment_id: 'asn_treatment', arm: 'treatment' }),
            trace(2, 'counterfactual', { experiment_id: 'exp_001', assignment_id: 'asn_holdout', decision_id: 'dec_holdout', arm: 'holdout' }, 'tok_subject_000002'),
            trace(3, 'signal', { source_receipt: { experiment_id: 'exp_001', assignment_id: 'asn_treatment', arm: 'treatment' } }),
            trace(4, 'decision', {
              decision_id: 'dec_001',
              runtime: { protocolId: 'dcp_001', protocolApprovalId: 'gpa_001', policyVersion: 'policy_001', approvedContract: { protocol_digest: 'a'.repeat(64) } },
              decision_package_v12: { packageDigest: 'b'.repeat(64), decisionId: 'dec_001', growthPlay: { id: 'deposit-primacy-defense', protocolId: 'dcp_001', businessLine: 'consumer-banking' }, governance: { policyVersion: 'policy_001', assignmentArm: 'treatment' } },
              decision_package: { outcome: { metric: 'deposit_retained' } },
            }),
            trace(5, 'gate', {
              gate_type: 'claim_review', experiment_id: 'exp_001',
              decision_protocol_id: 'dcp_001', decision: 'approved',
            }),
          ],
        };
      },
    },
    measurementRepository: {
      async loadExperiment() {
        return {
          assignments: [
            assignment('asn_treatment', 'tok_subject_000001', 'treatment'),
            assignment('asn_holdout', 'tok_subject_000002', 'holdout'),
          ],
          outcomes: [],
          exposures: [],
        };
      },
    },
    getDB: async () => ({
      async connect() {},
      async end() {},
      async query(sql) {
        if (sql.includes('connector_delivery_receipts')) return { rows: [{ count: 0 }] };
        return { rows: [] };
      },
    }),
    now: () => new Date('2026-07-31T15:00:00.000Z'),
  });

  const bundle = await service.exportBundle({ tenantId: 'ventus', experimentId: 'exp_001' });
  assert.equal(bundle.schemaVersion, 'ventus_bank_review_bundle/v1');
  assert.equal(bundle.evidenceClass, 'partner_sandbox');
  assert.match(bundle.manifest.manifestDigest, /^[a-f0-9]{64}$/);
  assert.equal(bundle.receiptChain.verified, true);
  assert.equal(bundle.experiment.arms.treatment, 1);
  assert.equal(bundle.experiment.arms.holdout, 1);
  assert.equal(bundle.claimEligibility.businessClaimAllowed, false);
  assert.equal(bundle.protocol.decisionProtocolId, 'dcp_001');
  assert.equal(bundle.decisionPackage.packageDigest, 'b'.repeat(64));
  assert.equal(bundle.generatedAt, bundle.manifest.generatedAt);
  assert.equal(bundle.claimReview.status, 'approved');
  assert.equal(bundle.holdoutProtection.assigned, 1);
  assert.equal(bundle.holdoutProtection.status, 'verified');
  assert.equal(bundle.holdoutProtection.reservationReceipts, 1);
  assert.equal(bundle.holdoutProtection.decisionEvents, 0);
  assert.equal(bundle.holdoutProtection.activationEvents, 0);
  assert.equal(bundle.holdoutProtection.workflowRecords.status, 'checked');
  assert.equal(JSON.stringify(bundle).includes('tok_subject'), false);
});

function assignment(assignmentId, householdToken, arm) {
  return {
    tenantId: 'ventus', experimentId: 'exp_001', assignmentId, householdToken, arm,
    bucket: arm === 'treatment' ? 1000 : 50, evidenceClass: 'sandbox', holdoutPct: 20,
    assignedAt: '2026-07-31T12:00:00.000Z', decisionProtocolId: 'dcp_001',
  };
}

function trace(sequenceNumber, eventType, payload, householdToken = 'tok_subject_000001') {
  return {
    sequence_number: sequenceNumber,
    event_type: eventType,
    status: 'confirmed',
    occurred_at: '2026-07-31T12:00:00.000Z',
    event_hash: String(sequenceNumber).repeat(64).slice(0, 64),
    previous_hash: '0'.repeat(64),
    household_token: householdToken,
    payload,
  };
}
