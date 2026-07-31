import { createHash } from 'node:crypto';
import { assignExperiment, createMeasurementRepository } from './experiment-measurement.mjs';
import { decisionScopeForScenario } from './hosted-decision-runtime.mjs';

const MAX_COHORT_CANDIDATES = 512;

// This runner proves the complete partner-sandbox mechanism, not a bank result.
// Subjects are opaque, generated only on the server, and never sent to the browser.
export function createControlledSandboxRunner({
  pullPlaidScenario,
  growthPlayRegistry,
  ledgerRepository,
  getDB,
  assignmentSalt,
  executeDecision,
  appendDecision,
  measurementRepository = null,
}) {
  if (typeof pullPlaidScenario !== 'function' || typeof assignmentSalt !== 'string' || assignmentSalt.length < 16) {
    throw new Error('controlled sandbox source and assignment secret are required');
  }
  if (typeof executeDecision !== 'function' || typeof appendDecision !== 'function') {
    throw new Error('controlled sandbox decision runtime is required');
  }
  const measurements = measurementRepository ?? createMeasurementRepository({ getDB });

  return async ({ tenantId, scenario, requestId, runAt = new Date() }) => {
    const scope = decisionScopeForScenario(scenario);
    const approval = await growthPlayRegistry.requireLatestApproved({
      tenantId, growthPlayId: scope.growthPlayId, businessLine: scope.businessLine, at: runAt.toISOString(),
    });
    const experimentId = `exp_${digest(`${tenantId}:${approval.decisionProtocolId}`).slice(0, 24)}`;
    const cohort = buildSandboxValidationCohort({
      tenantId,
      scenario,
      experimentId,
      decisionProtocolId: approval.decisionProtocolId,
      holdoutPct: approval.contract.measurement.holdout_pct,
      salt: assignmentSalt,
      selectionKey: requestId,
      assignedAt: approval.decidedAt,
    });

    const participants = [];
    let treatmentResult = null;
    let treatmentSource = null;
    for (const member of cohort) {
      const assignment = member.assignment;
      await measurements.recordAssignment(assignment);
      await ledgerRepository.append({
        tenantId,
        idempotencyKey: `sandbox-assignment:${experimentId}:${member.memberId}`,
        eventType: 'counterfactual',
        householdToken: assignment.householdToken,
        growthPlayId: scope.growthPlayId,
        policyVersion: approval.contract.policy.version,
        status: 'confirmed',
        occurredAt: approval.decidedAt,
        payload: {
          decision_id: `sandbox_${digest(`${experimentId}:${member.memberId}`).slice(0, 24)}`,
          assignment_id: assignment.assignmentId,
          experiment_id: experimentId,
          arm: assignment.arm,
          decision_protocol_id: approval.decisionProtocolId,
          evidence_class: 'sandbox',
          source_system: 'plaid_custom_user',
          sandbox_validation_member: member.memberId,
        },
      });

      // Assignment happens first. A holdout may receive the same sanctioned input,
      // but it cannot enter detection, Moment creation, or any delivery route.
      const source = await pullPlaidScenario({ scenario, cohortMemberId: member.memberId });
      if (!source.ready || !source.transactions.length) {
        throw new Error('Plaid sandbox did not return the approved scenario evidence');
      }
      const sourceReceipt = {
        evidence_class: 'sandbox',
        source_system: 'plaid_custom_user',
        record_count: source.count,
        safe_activity: safeActivitySummary(source.transactions),
        experiment_id: experimentId,
        assignment_id: assignment.assignmentId,
        arm: assignment.arm,
        decision_protocol_id: approval.decisionProtocolId,
      };
      await ledgerRepository.append({
        tenantId,
        idempotencyKey: `sandbox-source:${experimentId}:${member.memberId}`,
        eventType: 'signal',
        householdToken: assignment.householdToken,
        growthPlayId: scope.growthPlayId,
        policyVersion: approval.contract.policy.version,
        status: 'confirmed',
        occurredAt: approval.decidedAt,
        payload: { source_receipt: sourceReceipt },
      });
      participants.push({
        arm: assignment.arm,
        assignmentId: assignment.assignmentId,
        bucket: assignment.bucket,
        sourceRecordsProcessed: source.count,
        status: assignment.arm === 'holdout' ? 'withheld' : 'evaluated',
      });
      if (assignment.arm === 'holdout') continue;

      const decision = executeDecision({
        tenantId,
        now: runAt,
        protocolApproval: approval,
        trustedSubjectToken: assignment.householdToken,
        body: {
          scenario,
          source: { mode: 'live', name: 'Plaid sandbox' },
          transactions: source.transactions,
          policyContext: { consent: true },
        },
      });
      const recorded = await appendDecision({ decision, requestId: `${requestId}:treatment` });
      treatmentResult = { decision, ...recorded, assignment };
      treatmentSource = source;
    }

    if (!treatmentResult || !treatmentSource) throw new Error('controlled sandbox cohort did not produce a treatment path');
    const sourceReceipt = {
      evidenceClass: 'sandbox',
      sourceSystem: 'plaid_custom_user',
      recordCount: treatmentSource.count,
      safeActivity: safeActivitySummary(treatmentSource.transactions),
    };
    return {
      status: treatmentResult.decision.status,
      assignment: publicAssignment(treatmentResult.assignment),
      sourceReceipt,
      decision: treatmentResult.decision,
      persisted: treatmentResult.persisted,
      inserted: treatmentResult.inserted,
      sequenceNumber: treatmentResult.sequenceNumber,
      eventHash: treatmentResult.eventHash,
      recordedAt: treatmentResult.recordedAt,
      moment: treatmentResult.moment,
      cohort: {
        kind: 'controlled_partner_sandbox_validation',
        experimentId,
        decisionProtocolId: approval.decisionProtocolId,
        participants,
        treatmentAssigned: participants.filter((participant) => participant.arm === 'treatment').length,
        holdoutAssigned: participants.filter((participant) => participant.arm === 'holdout').length,
        analysisEligible: false,
      },
      evidenceLabels: {
        evidenceClass: 'partner_sandbox',
        businessClaimAllowed: false,
        causalClaimAllowed: false,
        label: 'Partner-sandbox validation',
      },
      businessClaimAllowed: false,
      causalClaimAllowed: false,
    };
  };
}

export function buildSandboxValidationCohort({
  tenantId,
  scenario,
  experimentId,
  decisionProtocolId,
  holdoutPct,
  salt,
  selectionKey,
  assignedAt,
}) {
  const candidates = [];
  for (let index = 0; index < MAX_COHORT_CANDIDATES; index += 1) {
    const memberId = `sbx_${digest(`${tenantId}:${scenario}:${decisionProtocolId}:${selectionKey}:${index}`).slice(0, 20)}`;
    const householdToken = `tok_${digest(`${tenantId}:${scenario}:${decisionProtocolId}:${memberId}`).slice(0, 24)}`;
    const assignment = assignExperiment({
      tenantId,
      experimentId,
      householdToken,
      holdoutPct,
      salt,
      decisionProtocolId,
      evidenceClass: 'sandbox',
      assignedAt,
    });
    candidates.push({ memberId, assignment });
    if (candidates.some((candidate) => candidate.assignment.arm === 'treatment')
      && candidates.some((candidate) => candidate.assignment.arm === 'holdout')) break;
  }
  const treatment = candidates.find((candidate) => candidate.assignment.arm === 'treatment');
  const holdout = candidates.find((candidate) => candidate.assignment.arm === 'holdout');
  if (!treatment || !holdout) throw new Error('sandbox cohort could not satisfy both experiment arms');
  return [treatment, holdout];
}

function publicAssignment(assignment) {
  return {
    assignmentId: assignment.assignmentId,
    experimentId: assignment.experimentId,
    arm: assignment.arm,
    bucket: assignment.bucket,
    assignedAt: assignment.assignedAt,
    evidenceClass: assignment.evidenceClass,
  };
}

function safeActivitySummary(transactions) {
  const summaries = new Set();
  for (const transaction of transactions) {
    const description = String(transaction?.name ?? transaction?.merchant_name ?? '').toLowerCase();
    const amount = Number(transaction?.amount ?? 0);
    if (/payroll|gusto|adp|paychex|direct dep/.test(description)) summaries.add('income pattern');
    else if (/transfer|fidelity|venmo|zelle|chime/.test(description)) summaries.add('external movement');
    else if (amount > 0) summaries.add('outflow activity');
    else summaries.add('spend activity');
    if (summaries.size >= 3) break;
  }
  return [...summaries];
}

function digest(value) { return createHash('sha256').update(value).digest('hex'); }
