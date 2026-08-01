import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createMeasurementRepository, summarizeIncrementalLift } from './experiment-measurement.mjs';
import { bundleEvidenceClass, canonicalEvidenceClass, deriveClaimStatus } from './evidence-taxonomy.mjs';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

// A bank-review artifact, generated from the append-only stores at request time.
// It intentionally contains opaque subject references and safe event projections,
// never connector credentials, access tokens, or raw financial account details.
export function createBankReviewBundleService({ ledgerRepository, getDB, measurementRepository = null, now = () => new Date() }) {
  assert.equal(typeof ledgerRepository?.exportTenant, 'function', 'ledgerRepository.exportTenant is required');
  const measurements = measurementRepository ?? createMeasurementRepository({ getDB });

  return {
    async exportBundle({ tenantId, experimentId }) {
      validateTenantId(tenantId);
      assertIdentifier(experimentId, 'experimentId');
      const [experiment, ledger] = await Promise.all([
        measurements.loadExperiment({ tenantId, experimentId }),
        ledgerRepository.exportTenant(tenantId),
      ]);
      assert.ok(experiment.assignments.length > 0, 'experiment evidence was not found');
      const subjects = new Set(experiment.assignments.map((assignment) => assignment.householdToken));
      const events = ledger.events.filter((event) => {
        const payload = event.payload ?? {};
        return payload.experiment_id === experimentId || subjects.has(event.household_token ?? event.householdToken);
      });
      const decisionEvent = events.find((event) => event.event_type === 'decision' || event.eventType === 'decision');
      const decisionPayload = decisionEvent?.payload ?? {};
      const metric = decisionPayload.decision_package?.outcome?.metric
        ?? decisionPayload.decision_package_v12?.outcome?.metric
        ?? null;
      const measurement = metric ? safeMeasurement(experiment, metric) : notReadyMeasurement('metric_unavailable');
      const armCounts = countBy(experiment.assignments, (assignment) => assignment.arm);
      const outcomesByArm = countBy(experiment.outcomes, (outcome) => outcome.assignment?.arm ?? outcome.arm);
      const traces = events.map(projectTrace);
      const holdoutProtection = await verifyHoldoutProtection({
        tenantId,
        assignments: experiment.assignments,
        events,
        getDB,
      });

      const assignments = experiment.assignments.map(projectAssignment);
      const outcomes = experiment.outcomes.map(projectOutcome);
      const decisionPackage = projectDecisionPackage(decisionPayload.decision_package_v12 ?? null);
      const generatedAt = now().toISOString();
      const sourceReceipts = traces.filter((trace) => trace.type === 'signal');
      const responseReceipts = traces.filter((trace) => trace.type === 'response');
      const deliveryReceipts = traces.filter((trace) => trace.type === 'activation');
      const outcomeReceipts = traces.filter((trace) => trace.type === 'outcome');
      const assignmentOrigin = bundleEvidenceClass(assignments);
      const componentOrigins = {
        assignments: assignmentOrigin,
        source: canonicalEvidenceClass(decisionPayload.decision_package_v12?.evidenceClass
          ?? decisionPayload.decision_package?.evidenceClass
          ?? firstEvidenceClass(events), assignmentOrigin),
        decision: canonicalEvidenceClass(decisionPayload.decision_package_v12?.evidenceClass
          ?? decisionPayload.decision_package?.evidenceClass, assignmentOrigin),
        // Delivery and outcome traces inherit the assignment origin unless the
        // immutable receipt itself carries a more specific source label. This
        // avoids presenting a sandbox assumption as provenance in a bank export.
        delivery: deliveryReceipts.length
          ? canonicalEvidenceClass(firstEvidenceClassForTypes(events, ['activation']), assignmentOrigin)
          : null,
        outcomes: outcomes.length
          ? canonicalEvidenceClass(firstEvidenceClassForTypes(events, ['outcome']), assignmentOrigin)
          : null,
      };
      const evidenceClass = bundleEvidenceClass(Object.values(componentOrigins).filter(Boolean));
      const independentReview = claimReviewStatus({
        events,
        experimentId,
        decisionProtocolId: decisionPackage?.growthPlay?.protocolId
          ?? decisionPayload.decision_protocol_id
          ?? null,
      });
      const protocol = {
        decisionProtocolId: decisionPayload.runtime?.protocolId ?? firstPayload(events, 'decision_protocol_id'),
        approvalChronology: decisionPayload.runtime?.protocolApprovalId ? [{
          approvalId: decisionPayload.runtime.protocolApprovalId,
          decision: 'approved',
          decidedAt: decisionPayload.runtime.protocolApprovedAt ?? null,
        }] : [],
        protocolDigest: decisionPayload.runtime?.approvedContract?.protocol_digest ?? null,
        policyVersion: decisionPayload.runtime?.policyVersion ?? null,
      };
      const ledgerVerification = {
        verified: ledger.verified === true,
        eventCount: traces.length,
        headHash: traces.at(-1)?.eventHash ?? null,
      };
      const permissionIsolationEvidence = {
        tenantScopedExport: true,
        reviewerAuthorization: 'risk_reviewer',
        subjectTokensRedacted: true,
        holdoutProtection: holdoutProtection.status,
        runtimeVerifier: ledger.verified === true ? 'ledger_chain_verified' : 'not_verified',
      };
      const completenessChecks = {
        sourceReceipt: sourceReceipts.length > 0,
        protocolApproval: protocol.approvalChronology.length > 0,
        decisionPackageDigest: Boolean(decisionPackage?.packageDigest),
        treatmentAndHoldout: Boolean(armCounts.treatment && armCounts.holdout),
        workflowReceipt: responseReceipts.length > 0 || deliveryReceipts.length > 0,
        outcomeCoverage: outcomes.length > 0,
        ledgerVerified: ledgerVerification.verified,
        holdoutVerified: holdoutProtection.status === 'verified',
      };
      const artifactReferences = Object.entries({
        sourceReceipts,
        protocol,
        assignments,
        decisionPackage,
        responseReceipts,
        deliveryReceipts,
        outcomes,
        measurement,
        ledgerVerification,
        permissionIsolationEvidence,
      }).map(([name, value]) => ({ name, digest: digest(value) }));
      const manifestCore = {
        schemaVersion: 'ventus_bank_review_bundle/v1',
        generatedAt,
        experimentId,
        evidenceClass,
        componentOrigins,
        artifactReferences,
        completeness: {
          complete: Object.values(completenessChecks).every(Boolean),
          checks: completenessChecks,
          missing: Object.entries(completenessChecks).filter(([, passed]) => !passed).map(([name]) => name),
        },
      };

      return {
        schemaVersion: 'ventus_bank_review_bundle/v1',
        compatibility: { replaces: 'ventus_sandbox_evidence_bundle/v1', additive: true },
        manifest: { ...manifestCore, manifestDigest: digest(manifestCore) },
        generatedAt,
        evidenceClass,
        componentOrigins,
        claimEligibility: {
          claimStatus: deriveClaimStatus({
            evidenceClass,
            measurementStatus: measurement.status,
            gatesPassed: measurement.status === 'measured',
            independentReview,
          }),
          businessClaimAllowed: false,
          causalClaimAllowed: false,
          reason: evidenceClass === 'sanctioned_pilot'
            ? 'Sanctioned evidence remains limited to the exact approved measurement and claim review scope.'
            : 'Fixture and partner-sandbox evidence demonstrate the governed mechanism, not bank performance.',
        },
        experiment: {
          experimentId,
          arms: armCounts,
          assignments,
          outcomesByArm,
          outcomes,
          metric,
          measurement,
        },
        protocol,
        claimReview: { status: independentReview },
        decisionPackage,
        receiptChain: {
          ...ledgerVerification,
          eventCount: traces.length,
          sourceReceipts,
          decisionTraces: traces.filter((trace) => trace.type === 'decision'),
          responseTraces: responseReceipts,
          deliveryTraces: deliveryReceipts,
          outcomeTraces: outcomeReceipts,
          counterfactualTraces: traces.filter((trace) => trace.type === 'counterfactual'),
        },
        reconciliation: {
          workflowReceipts: deliveryReceipts,
          outcomeReceipts,
          corrections: outcomes.filter((outcome) => outcome.correctionSequence > 0),
        },
        holdoutProtection,
        permissionIsolationEvidence,
        artifactReferences,
        evidenceLabels: {
          source: 'Plaid sandbox custom users',
          destination: 'Configured sandbox connector when delivery is approved',
          classification: evidenceClass,
          analysisEligibility: evidenceClass === 'sanctioned_pilot' ? 'subject to registered gates' : 'not eligible for business or causal claims',
        },
      };
    },
  };
}

// Compatibility export for callers that have not renamed the service yet.
export const createSandboxEvidenceBundleService = createBankReviewBundleService;

async function verifyHoldoutProtection({ tenantId, assignments, events, getDB }) {
  const holdouts = assignments.filter((assignment) => assignment.arm === 'holdout');
  if (!holdouts.length) {
    return {
      status: 'not_applicable',
      assigned: 0,
      reservationReceipts: 0,
      decisionEvents: 0,
      activationEvents: 0,
      workflowRecords: { status: 'not_checked', count: 0 },
    };
  }

  const holdoutTokens = new Set(holdouts.map((assignment) => assignment.householdToken));
  const assignmentIds = new Set(holdouts.map((assignment) => assignment.assignmentId));
  const holdoutEvents = events.filter((event) => holdoutTokens.has(event.household_token ?? event.householdToken));
  const reservationEvents = holdoutEvents.filter((event) => {
    const payload = event.payload ?? {};
    return (event.event_type ?? event.eventType) === 'counterfactual'
      && payload.experiment_id
      && assignmentIds.has(payload.assignment_id)
      && payload.arm === 'holdout';
  });
  const reservedDecisionIds = new Set(reservationEvents
    .map((event) => event.payload?.decision_id)
    .filter((value) => typeof value === 'string' && value.length > 0));
  const decisionEvents = holdoutEvents.filter((event) => {
    const payload = event.payload ?? {};
    return (event.event_type ?? event.eventType) === 'decision'
      && reservedDecisionIds.has(payload.decision_id);
  }).length;
  const activationEvents = holdoutEvents.filter((event) => {
    const payload = event.payload ?? {};
    return (event.event_type ?? event.eventType) === 'activation'
      && reservedDecisionIds.has(payload.decision_id);
  }).length;
  const workflowRecords = await countWorkflowRecords({ tenantId, decisionIds: [...reservedDecisionIds], getDB });
  const reservationsComplete = reservationEvents.length === holdouts.length;
  const noExposure = decisionEvents === 0 && activationEvents === 0 && workflowRecords.count === 0;

  return {
    status: reservationsComplete && noExposure && workflowRecords.status === 'checked' ? 'verified' : 'attention_required',
    assigned: holdouts.length,
    reservationReceipts: reservationEvents.length,
    decisionEvents,
    activationEvents,
    workflowRecords,
  };
}

async function countWorkflowRecords({ tenantId, decisionIds, getDB }) {
  if (typeof getDB !== 'function') return { status: 'not_checked', count: 0 };
  if (!decisionIds.length) return { status: 'checked', count: 0 };
  const db = await getDB();
  await db.connect();
  try {
    await beginTenantTransaction(db, tenantId);
    const result = await db.query(
      `SELECT count(*)::int AS count
         FROM connector_delivery_receipts
        WHERE tenant_id = $1
          AND decision_id = ANY($2::text[])`,
      [tenantId, decisionIds],
    );
    await db.query('COMMIT');
    return { status: 'checked', count: Number(result.rows[0]?.count ?? 0) };
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await db.end();
  }
}

function projectAssignment(assignment) {
  return {
    assignmentId: assignment.assignmentId,
    arm: assignment.arm,
    bucket: assignment.bucket,
    evidenceClass: canonicalEvidenceClass(assignment.evidenceClass, 'fixture'),
    assignedAt: assignment.assignedAt,
  };
}

function projectOutcome(outcome) {
  return {
    eventId: outcome.event_id ?? outcome.eventId ?? null,
    arm: outcome.assignment?.arm ?? outcome.arm ?? null,
    eventType: outcome.event_type ?? outcome.eventType ?? null,
    occurredAt: outcome.occurred_at ?? outcome.occurredAt ?? null,
    metric: outcome.value?.metric ?? null,
    amountPresent: outcome.value !== null && outcome.value?.amount !== null && outcome.value?.amount !== undefined,
    sourceSystem: outcome.source_system ?? outcome.sourceSystem ?? null,
    sourceVersion: outcome.provenance?.source_version ?? null,
    correctionSequence: Number.isInteger(outcome.provenance?.correction_sequence)
      ? outcome.provenance.correction_sequence : 0,
    artifactDigest: digest({
      eventId: outcome.event_id ?? outcome.eventId ?? null,
      sourceRecordId: outcome.source_record_id ?? outcome.sourceRecordId ?? null,
      correctionSequence: outcome.provenance?.correction_sequence ?? 0,
    }),
  };
}

function projectTrace(event) {
  const payload = event.payload ?? {};
  return {
    sequenceNumber: Number(event.sequence_number ?? event.sequenceNumber),
    type: event.event_type ?? event.eventType,
    status: event.status,
    occurredAt: event.occurred_at ?? event.occurredAt,
    eventHash: event.event_hash ?? event.eventHash,
    previousHash: event.previous_hash ?? event.previousHash,
    references: {
      experimentId: payload.experiment_id ?? payload.source_receipt?.experiment_id ?? null,
      assignmentId: payload.assignment_id ?? payload.source_receipt?.assignment_id ?? null,
      decisionId: payload.decision_id ?? null,
      deliveryId: payload.delivery_id ?? null,
      observationId: payload.observation_id ?? null,
      arm: payload.arm ?? payload.source_receipt?.arm ?? null,
    },
  };
}

function projectDecisionPackage(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    packageDigest: value.packageDigest ?? null,
    decisionId: value.decisionId ?? null,
    growthPlay: value.growthPlay ? {
      id: value.growthPlay.id ?? null,
      protocolId: value.growthPlay.protocolId ?? null,
      businessLine: value.growthPlay.businessLine ?? null,
    } : null,
    decisionMethod: value.decisionMethod ? {
      runtimeVersion: value.decisionMethod.runtimeVersion ?? null,
      skillVersions: value.decisionMethod.skillVersions ?? [],
    } : null,
    governance: value.governance ? {
      policyVersion: value.governance.policyVersion ?? null,
      assignmentArm: value.governance.assignmentArm ?? null,
    } : null,
  };
}

function safeMeasurement(experiment, metric) {
  try {
    const summary = summarizeIncrementalLift({
      assignments: experiment.assignments,
      outcomes: experiment.outcomes,
      metric,
    });
    return {
      status: normalizeMeasurementStatus(summary.status),
      coverage: {
        treatment: summary.treatment?.coverage ?? 0,
        holdout: summary.holdout?.coverage ?? 0,
      },
      sampleReady: summary.status === 'measured',
      claimStatus: deriveClaimStatus({
        evidenceClass: bundleEvidenceClass(experiment.assignments),
        measurementStatus: normalizeMeasurementStatus(summary.status),
        gatesPassed: summary.status === 'measured',
      }),
    };
  } catch {
    return notReadyMeasurement('measurement_not_ready');
  }
}

function notReadyMeasurement(reason) {
  return { status: 'not_started', coverage: { treatment: 0, holdout: 0 }, sampleReady: false, claimStatus: 'not_eligible', reason };
}

function normalizeMeasurementStatus(value) {
  return ['not_started', 'collecting', 'insufficient_sample', 'incomplete_coverage', 'measured'].includes(value)
    ? value
    : value === 'not_ready' ? 'insufficient_sample' : 'not_started';
}

function firstEvidenceClass(events) {
  for (const event of events) {
    const value = event.payload?.evidence_class ?? event.payload?.source_receipt?.evidence_class;
    if (canonicalEvidenceClass(value)) return value;
  }
  return null;
}

function firstEvidenceClassForTypes(events, types) {
  const allowed = new Set(types);
  for (const event of events) {
    if (!allowed.has(event.event_type ?? event.eventType)) continue;
    const value = event.payload?.evidence_class ?? event.payload?.source_receipt?.evidence_class;
    if (canonicalEvidenceClass(value)) return value;
  }
  return null;
}

function digest(value) {
  return createHash('sha256').update(stableJson(value)).digest('hex');
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

function firstPayload(events, field) {
  for (const event of events) {
    if (event.payload?.[field]) return event.payload[field];
  }
  return null;
}

function claimReviewStatus({ events, experimentId, decisionProtocolId }) {
  const receipt = [...events]
    .reverse()
    .find((event) => {
      const payload = event.payload ?? {};
      return (event.event_type ?? event.eventType) === 'gate'
        && payload.gate_type === 'claim_review'
        && payload.experiment_id === experimentId
        && payload.decision_protocol_id === decisionProtocolId;
    });
  const decision = receipt?.payload?.decision;
  return decision === 'approved' ? 'approved' : decision === 'pending' ? 'pending' : 'not_started';
}

function countBy(items, getKey) {
  return items.reduce((counts, item) => {
    const key = getKey(item) || 'unknown';
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{1,127}$/.test(value), `${label} is invalid`);
}
