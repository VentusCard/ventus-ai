import { createHash } from 'node:crypto';
import { assignExperiment, createMeasurementRepository } from './experiment-measurement.mjs';
import { decisionScopeForScenario } from './hosted-decision-runtime.mjs';

// A deliberately narrow adapter for the protected Plaid sandbox. Production
// ingestion replaces this adapter with a bank-approved source receipt and an
// opaque bank-issued household token.
export function createControlledSandboxRunner({
  pullPlaidScenario,
  growthPlayRegistry,
  ledgerRepository,
  getDB,
  assignmentSalt,
  executeDecision,
  appendDecision,
}) {
  if (typeof pullPlaidScenario !== 'function' || typeof assignmentSalt !== 'string' || assignmentSalt.length < 16) {
    throw new Error('controlled sandbox source and assignment secret are required');
  }
  const measurementRepository = createMeasurementRepository({ getDB });

  return async ({ tenantId, scenario, requestId, runAt = new Date() }) => {
    const scope = decisionScopeForScenario(scenario);
    const approval = await growthPlayRegistry.requireLatestApproved({
      tenantId, growthPlayId: scope.growthPlayId, businessLine: scope.businessLine, at: runAt.toISOString(),
    });
    const source = await pullPlaidScenario({ scenario });
    if (!source.ready || !source.transactions.length) throw new Error('Plaid sandbox did not return the approved scenario evidence');
    const householdToken = `tok_${digest(`${tenantId}:${scenario}:${approval.protocolDigest}`).slice(0, 24)}`;
    const experimentId = `exp_${digest(`${tenantId}:${approval.decisionProtocolId}`).slice(0, 24)}`;
    const assignedAt = approval.decidedAt;
    const assignment = assignExperiment({
      tenantId, experimentId, householdToken, holdoutPct: approval.contract.measurement.holdout_pct,
      salt: assignmentSalt, decisionProtocolId: approval.decisionProtocolId, evidenceClass: 'sandbox', assignedAt,
    });
    await measurementRepository.recordAssignment(assignment);
    await ledgerRepository.append({
      tenantId, idempotencyKey: `sandbox-assignment:${experimentId}:${householdToken}`,
      eventType: 'counterfactual', householdToken, growthPlayId: scope.growthPlayId,
      policyVersion: approval.contract.policy.version, status: 'confirmed', occurredAt: assignedAt,
      payload: { decision_id: `sandbox_${digest(`${experimentId}:${householdToken}`).slice(0, 24)}`, assignment_id: assignment.assignmentId,
        experiment_id: experimentId, arm: assignment.arm, decision_protocol_id: approval.decisionProtocolId,
        evidence_class: 'sandbox', source_system: 'plaid_custom_user' },
    });
    const sourceReceipt = { evidenceClass: 'sandbox', sourceSystem: 'plaid_custom_user', recordCount: source.count };
    if (assignment.arm === 'holdout') return { status: 'holdout', assignment, sourceReceipt, businessClaimAllowed: false };
    const decision = executeDecision({
      tenantId, now: runAt, protocolApproval: approval, trustedSubjectToken: householdToken,
      body: { scenario, source: { mode: 'live', name: 'Plaid sandbox' }, transactions: source.transactions,
        policyContext: { consent: true } },
    });
    const recorded = await appendDecision({ decision, requestId });
    return { status: decision.status, assignment, sourceReceipt, decision, ...recorded, businessClaimAllowed: false };
  };
}

function digest(value) { return createHash('sha256').update(value).digest('hex'); }
