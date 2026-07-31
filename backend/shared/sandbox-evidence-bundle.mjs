import assert from 'node:assert/strict';
import { createMeasurementRepository, summarizeIncrementalLift } from './experiment-measurement.mjs';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

// A bank-review artifact, generated from the append-only stores at request time.
// It intentionally contains opaque subject references and safe event projections,
// never connector credentials, access tokens, or raw financial account details.
export function createSandboxEvidenceBundleService({ ledgerRepository, getDB, measurementRepository = null, now = () => new Date() }) {
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

      return {
        schemaVersion: 'ventus_sandbox_evidence_bundle/v1',
        generatedAt: now().toISOString(),
        evidenceClass: 'partner_sandbox',
        claimEligibility: {
          businessClaimAllowed: false,
          causalClaimAllowed: false,
          reason: 'Partner-sandbox validation demonstrates the governed mechanism, not bank performance.',
        },
        experiment: {
          experimentId,
          arms: armCounts,
          assignments: experiment.assignments.map(projectAssignment),
          outcomesByArm,
          metric,
          measurement,
        },
        protocol: {
          decisionProtocolId: decisionPayload.runtime?.protocolId ?? firstPayload(events, 'decision_protocol_id'),
          approvalId: decisionPayload.runtime?.protocolApprovalId ?? null,
          protocolDigest: decisionPayload.runtime?.approvedContract?.protocol_digest ?? null,
          policyVersion: decisionPayload.runtime?.policyVersion ?? null,
        },
        decisionPackage: projectDecisionPackage(decisionPayload.decision_package_v12 ?? null),
        receiptChain: {
          verified: ledger.verified === true,
          eventCount: traces.length,
          sourceReceipts: traces.filter((trace) => trace.type === 'signal'),
          decisionTraces: traces.filter((trace) => trace.type === 'decision'),
          responseTraces: traces.filter((trace) => trace.type === 'response'),
          deliveryTraces: traces.filter((trace) => trace.type === 'activation'),
          outcomeTraces: traces.filter((trace) => trace.type === 'outcome'),
          counterfactualTraces: traces.filter((trace) => trace.type === 'counterfactual'),
        },
        holdoutProtection,
        evidenceLabels: {
          source: 'Plaid sandbox custom users',
          destination: 'Configured sandbox connector when delivery is approved',
          classification: 'partner_sandbox',
          analysisEligibility: 'not eligible for business or causal claims',
        },
      };
    },
  };
}

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
    evidenceClass: assignment.evidenceClass,
    assignedAt: assignment.assignedAt,
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
      status: summary.status,
      coverage: {
        treatment: summary.treatment?.coverage ?? 0,
        holdout: summary.holdout?.coverage ?? 0,
      },
      sampleReady: summary.status === 'measured',
      claimStatus: 'not_eligible_partner_sandbox',
    };
  } catch {
    return notReadyMeasurement('measurement_not_ready');
  }
}

function notReadyMeasurement(reason) {
  return { status: 'not_ready', coverage: { treatment: 0, holdout: 0 }, sampleReady: false, claimStatus: 'not_eligible_partner_sandbox', reason };
}

function firstPayload(events, field) {
  for (const event of events) {
    if (event.payload?.[field]) return event.payload[field];
  }
  return null;
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
