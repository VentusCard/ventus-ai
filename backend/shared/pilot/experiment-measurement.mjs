import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { beginTenantTransaction, validateTenantId } from '../platform/tenant-context.mjs';

const ARMS = new Set(['treatment', 'holdout', 'standalone', 'connected']);
const BINARY_ARMS = new Set(['treatment', 'holdout']);
const CONNECTED_ARMS = ['holdout', 'standalone', 'connected'];
const EVIDENCE_CLASSES = new Set(['synthetic', 'sandbox', 'sanctioned']);
const METRICS = new Set([
  'deposit_balance',
  'deposit_retained',
  'net_new_assets',
  'estimated_revenue',
]);

export function assignExperiment({
  tenantId,
  experimentId,
  householdToken,
  holdoutPct,
  salt,
  decisionProtocolId = null,
  evidenceClass = 'synthetic',
  assignedAt = new Date().toISOString(),
}) {
  validateTenantId(tenantId);
  assertIdentifier(experimentId, 'experimentId');
  assert.match(householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  assert.ok(Number.isFinite(holdoutPct) && holdoutPct >= 1 && holdoutPct <= 50, 'holdoutPct must be 1-50');
  assert.ok(typeof salt === 'string' && salt.length >= 16, 'assignment salt must be at least 16 characters');
  if (decisionProtocolId !== null) assertIdentifier(decisionProtocolId, 'decisionProtocolId');
  assert.ok(EVIDENCE_CLASSES.has(evidenceClass), 'evidenceClass is unsupported');
  assertIsoDate(assignedAt, 'assignedAt');

  const identity = `${tenantId}\u001f${experimentId}\u001f${householdToken}`;
  const digest = createHmac('sha256', salt).update(identity).digest('hex');
  const bucket = Number.parseInt(digest.slice(0, 8), 16) % 10_000;
  const arm = bucket < Math.round(holdoutPct * 100) ? 'holdout' : 'treatment';

  return {
    assignmentId: `asn_${digest.slice(0, 24)}`,
    tenantId,
    experimentId,
    householdToken,
    arm,
    holdoutPct,
    bucket,
    evidenceClass,
    assignedAt,
    decisionProtocolId,
  };
}

export function assignConnectedExpansionExperiment({
  tenantId,
  experimentId,
  householdToken,
  holdoutPct,
  standalonePct,
  connectedPct,
  salt,
  decisionProtocolId,
  authorization,
  evidenceClass = 'synthetic',
  assignedAt = new Date().toISOString(),
}) {
  validateTenantId(tenantId);
  assertIdentifier(experimentId, 'experimentId');
  assert.match(householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  assert.ok(Number.isFinite(holdoutPct) && holdoutPct >= 5 && holdoutPct <= 50, 'holdoutPct must be 5-50');
  for (const [label, value] of Object.entries({ standalonePct, connectedPct })) {
    assert.ok(Number.isFinite(value) && value >= 5 && value <= 90, `${label} must be 5-90`);
  }
  assert.ok(Math.abs(holdoutPct + standalonePct + connectedPct - 100) < 0.0001, 'connected experiment arm percentages must total 100');
  assert.ok(typeof salt === 'string' && salt.length >= 16, 'assignment salt must be at least 16 characters');
  assertIdentifier(decisionProtocolId, 'decisionProtocolId');
  assert.ok(EVIDENCE_CLASSES.has(evidenceClass), 'evidenceClass is unsupported');
  assertIsoDate(assignedAt, 'assignedAt');
  const authorized = validateConnectedAuthorization(authorization, assignedAt);

  const identity = `${tenantId}\u001f${experimentId}\u001f${householdToken}`;
  const digest = createHmac('sha256', salt).update(identity).digest('hex');
  const bucket = Number.parseInt(digest.slice(0, 8), 16) % 10_000;
  const holdoutBoundary = Math.round(holdoutPct * 100);
  const standaloneBoundary = holdoutBoundary + Math.round(standalonePct * 100);
  const arm = bucket < holdoutBoundary ? 'holdout' : bucket < standaloneBoundary ? 'standalone' : 'connected';

  return {
    assignmentId: `asn_${digest.slice(0, 24)}`,
    tenantId,
    experimentId,
    householdToken,
    arm,
    design: 'connected_incrementality',
    holdoutPct,
    standalonePct,
    connectedPct,
    bucket,
    evidenceClass,
    assignedAt,
    decisionProtocolId,
    authorizationScopeId: authorized.scopeId,
    authorizationApprovedAt: authorized.approvedAt,
    authorizationExpiresAt: authorized.expiresAt,
    authorizedBusinessLines: authorized.businessLines,
    authorizedSignalClasses: authorized.signalClasses,
  };
}

export function validateOutcomeEvent(event, assignment) {
  assert.ok(event && typeof event === 'object' && !Array.isArray(event), 'outcome event must be an object');
  assertIdentifier(event.event_id, 'event_id');
  assert.equal(event.contract_version, '1.0', 'contract_version must be 1.0');
  assertIdentifier(event.tenant_id, 'tenant_id');
  assert.match(event.household_token, /^tok_[A-Za-z0-9_-]{8,120}$/, 'household_token must be opaque');
  assertIdentifier(event.growth_play_id, 'growth_play_id');
  assertIdentifier(event.decision_id, 'decision_id');
  assertIdentifier(event.source_system, 'source_system');
  assertIsoDate(event.occurred_at, 'occurred_at');
  assert.ok(event.assignment && typeof event.assignment === 'object', 'assignment is required');
  assertIdentifier(event.assignment.experiment_id, 'assignment.experiment_id');
  assert.ok(ARMS.has(event.assignment.arm), 'assignment.arm is unsupported');
  assertIsoDate(event.assignment.assigned_at, 'assignment.assigned_at');

  if (event.value !== null && event.value !== undefined) {
    assert.ok(METRICS.has(event.value.metric), 'value.metric is unsupported');
    assert.ok(Number.isFinite(event.value.amount), 'value.amount must be finite');
    assert.equal(event.value.currency, 'USD', 'value.currency must be USD');
  }

  if (assignment) {
    assert.equal(event.tenant_id, assignment.tenantId, 'event tenant does not match assignment');
    assert.equal(event.household_token, assignment.householdToken, 'event household does not match assignment');
    assert.equal(event.assignment.experiment_id, assignment.experimentId, 'event experiment does not match assignment');
    assert.equal(event.assignment.arm, assignment.arm, 'event arm does not match immutable assignment');
    assert.equal(event.assignment.assigned_at, assignment.assignedAt, 'event assignment timestamp does not match');
    if (assignment.design === 'connected_incrementality') {
      assert.equal(event.assignment.design, assignment.design, 'event experiment design does not match assignment');
      assert.equal(event.assignment.authorization_scope_id, assignment.authorizationScopeId, 'event authorization scope does not match assignment');
      assert.equal(event.assignment.decision_protocol_id, assignment.decisionProtocolId, 'event decision protocol does not match assignment');
    } else if (assignment.decisionProtocolId) {
      assert.equal(event.assignment.decision_protocol_id, assignment.decisionProtocolId, 'event decision protocol does not match assignment');
    }
  }

  assert.ok(
    Date.parse(event.assignment.assigned_at) <= Date.parse(event.occurred_at),
    'assignment must predate the measured event',
  );
  return event;
}

export function summarizeIncrementalLift({
  assignments,
  outcomes,
  metric,
  minimumPerArm = 30,
  minimumCoverage = 0.9,
}) {
  assert.ok(Array.isArray(assignments), 'assignments must be an array');
  assert.ok(Array.isArray(outcomes), 'outcomes must be an array');
  assert.ok(assignments.length > 0, 'assignments must not be empty');
  assert.ok(METRICS.has(metric), 'metric is unsupported');
  assert.ok(Number.isInteger(minimumPerArm) && minimumPerArm > 0, 'minimumPerArm must be positive');
  assert.ok(Number.isFinite(minimumCoverage) && minimumCoverage > 0 && minimumCoverage <= 1, 'minimumCoverage must be 0-1');

  const tenantIds = new Set();
  const experimentIds = new Set();
  const evidenceClasses = new Set();
  const assignmentByHousehold = new Map();
  const assignedCounts = { treatment: 0, holdout: 0 };
  for (const assignment of assignments) {
    validateMeasurementAssignment(assignment);
    assert.ok(BINARY_ARMS.has(assignment.arm), 'binary lift summary only accepts treatment and holdout assignments');
    tenantIds.add(assignment.tenantId);
    experimentIds.add(assignment.experimentId);
    evidenceClasses.add(assignment.evidenceClass);
    const key = assignmentKey(assignment.tenantId, assignment.experimentId, assignment.householdToken);
    assert.ok(!assignmentByHousehold.has(key), `duplicate assignment for ${assignment.householdToken}`);
    assignmentByHousehold.set(key, assignment);
    assignedCounts[assignment.arm] += 1;
  }
  assert.equal(tenantIds.size, 1, 'measurement summary must contain exactly one tenant');
  assert.equal(experimentIds.size, 1, 'measurement summary must contain exactly one experiment');
  assert.equal(evidenceClasses.size, 1, 'measurement summary must contain exactly one evidence class');
  assert.ok(assignedCounts.treatment > 0 && assignedCounts.holdout > 0, 'both experiment arms require assignments');

  const latest = new Map();
  for (const event of outcomes) {
    if (event.value?.metric !== metric) continue;
    const key = assignmentKey(event.tenant_id, event.assignment?.experiment_id, event.household_token);
    const assignment = assignmentByHousehold.get(key);
    assert.ok(assignment, `target outcome ${event.event_id ?? 'unknown'} has no matching assignment`);
    validateOutcomeEvent(event, assignment);
    const previous = latest.get(key);
    if (!previous || Date.parse(event.occurred_at) > Date.parse(previous.occurred_at)) {
      latest.set(key, event);
    }
  }

  const values = { treatment: [], holdout: [] };
  for (const [key, event] of latest) {
    const arm = assignmentByHousehold.get(key).arm;
    values[arm].push(event.value.amount);
  }
  const treatmentMean = mean(values.treatment);
  const holdoutMean = mean(values.holdout);
  const treatmentCoverage = values.treatment.length / assignedCounts.treatment;
  const holdoutCoverage = values.holdout.length / assignedCounts.holdout;
  const sufficientSample = values.treatment.length >= minimumPerArm && values.holdout.length >= minimumPerArm;
  const sufficientCoverage = treatmentCoverage >= minimumCoverage && holdoutCoverage >= minimumCoverage;
  const ready = sufficientSample && sufficientCoverage;
  const absoluteLift = treatmentMean === null || holdoutMean === null ? null : treatmentMean - holdoutMean;
  const relativeLiftPct = absoluteLift === null || holdoutMean === 0 ? null : (absoluteLift / Math.abs(holdoutMean)) * 100;
  const inference = ready ? differenceInMeansInference(values.treatment, values.holdout) : null;
  const status = !sufficientSample
    ? 'insufficient_sample'
    : !sufficientCoverage
      ? 'incomplete_outcome_coverage'
      : 'measured';

  return {
    tenantId: [...tenantIds][0],
    experimentId: [...experimentIds][0],
    evidenceClass: [...evidenceClasses][0],
    metric,
    status,
    minimumPerArm,
    minimumCoverage,
    treatment: {
      assigned: assignedCounts.treatment,
      observed: values.treatment.length,
      coverage: round(treatmentCoverage),
      mean: round(treatmentMean),
    },
    holdout: {
      assigned: assignedCounts.holdout,
      observed: values.holdout.length,
      coverage: round(holdoutCoverage),
      mean: round(holdoutMean),
    },
    absoluteLift: ready ? round(absoluteLift) : null,
    relativeLiftPct: ready ? round(relativeLiftPct) : null,
    inference,
    evidenceStatus: !ready
      ? 'not_ready'
      : inference.signal === 'inconclusive'
        ? 'inconclusive'
        : 'statistical_signal_detected',
    businessClaimAllowed: false,
    causalClaimAllowed: false,
    reviewRequired: 'independent_statistical_and_experiment_review',
  };
}

export function validateConnectedExposure(event, assignment) {
  assert.ok(event && typeof event === 'object' && !Array.isArray(event), 'connected exposure must be an object');
  assert.equal(event.contract_version, '1.0', 'exposure contract_version must be 1.0');
  assertIdentifier(event.event_id, 'exposure.event_id');
  assertIdentifier(event.tenant_id, 'exposure.tenant_id');
  assertIdentifier(event.experiment_id, 'exposure.experiment_id');
  assert.match(event.household_token, /^tok_[A-Za-z0-9_-]{8,120}$/, 'exposure.household_token must be opaque');
  assert.ok(CONNECTED_ARMS.includes(event.arm), 'exposure.arm is unsupported');
  assert.equal(typeof event.decision_evaluated, 'boolean', 'exposure.decision_evaluated must be boolean');
  assert.equal(typeof event.action_delivered, 'boolean', 'exposure.action_delivered must be boolean');
  assert.equal(typeof event.connected_data_used, 'boolean', 'exposure.connected_data_used must be boolean');
  assertIdentifier(event.authorization_scope_id, 'exposure.authorization_scope_id');
  assertIdentifier(event.decision_protocol_id, 'exposure.decision_protocol_id');
  assertIsoDate(event.occurred_at, 'exposure.occurred_at');
  if (assignment) {
    validateMeasurementAssignment(assignment);
    assert.equal(assignment.design, 'connected_incrementality', 'exposure requires a connected-incrementality assignment');
    assert.equal(event.tenant_id, assignment.tenantId, 'exposure tenant does not match assignment');
    assert.equal(event.experiment_id, assignment.experimentId, 'exposure experiment does not match assignment');
    assert.equal(event.household_token, assignment.householdToken, 'exposure household does not match assignment');
    assert.equal(event.arm, assignment.arm, 'exposure arm does not match immutable assignment');
    assert.equal(event.authorization_scope_id, assignment.authorizationScopeId, 'exposure authorization scope does not match assignment');
    assert.equal(event.decision_protocol_id, assignment.decisionProtocolId, 'exposure decision protocol does not match assignment');
    assert.ok(Date.parse(event.occurred_at) >= Date.parse(assignment.assignedAt), 'exposure must occur after assignment');
    assert.ok(Date.parse(event.occurred_at) < Date.parse(assignment.authorizationExpiresAt), 'exposure must occur before authorization expires');
  }
  return event;
}

export function summarizeConnectedExpansionLift({
  assignments,
  outcomes,
  exposures,
  metric,
  minimumPerArm = 30,
  minimumOutcomeCoverage = 0.9,
  minimumExposureCoverage = 0.95,
  maxDeviationRate = 0.02,
}) {
  assert.ok(Array.isArray(assignments) && assignments.length > 0, 'assignments must not be empty');
  assert.ok(Array.isArray(outcomes), 'outcomes must be an array');
  assert.ok(Array.isArray(exposures), 'exposures must be an array');
  assert.ok(METRICS.has(metric), 'metric is unsupported');
  assert.ok(Number.isInteger(minimumPerArm) && minimumPerArm > 0, 'minimumPerArm must be positive');
  for (const [label, value] of Object.entries({ minimumOutcomeCoverage, minimumExposureCoverage })) {
    assert.ok(Number.isFinite(value) && value > 0 && value <= 1, `${label} must be 0-1`);
  }
  assert.ok(Number.isFinite(maxDeviationRate) && maxDeviationRate >= 0 && maxDeviationRate <= 0.25, 'maxDeviationRate must be 0-0.25');

  const tenantIds = new Set();
  const experimentIds = new Set();
  const evidenceClasses = new Set();
  const authorizationScopes = new Set();
  const assignmentByHousehold = new Map();
  const assignedCounts = Object.fromEntries(CONNECTED_ARMS.map((arm) => [arm, 0]));
  for (const assignment of assignments) {
    validateMeasurementAssignment(assignment);
    assert.equal(assignment.design, 'connected_incrementality', 'all assignments must use connected_incrementality design');
    tenantIds.add(assignment.tenantId);
    experimentIds.add(assignment.experimentId);
    evidenceClasses.add(assignment.evidenceClass);
    authorizationScopes.add(assignment.authorizationScopeId);
    const key = assignmentKey(assignment.tenantId, assignment.experimentId, assignment.householdToken);
    assert.ok(!assignmentByHousehold.has(key), `duplicate assignment for ${assignment.householdToken}`);
    assignmentByHousehold.set(key, assignment);
    assignedCounts[assignment.arm] += 1;
  }
  assert.equal(tenantIds.size, 1, 'connected summary must contain exactly one tenant');
  assert.equal(experimentIds.size, 1, 'connected summary must contain exactly one experiment');
  assert.equal(evidenceClasses.size, 1, 'connected summary must contain exactly one evidence class');
  assert.equal(authorizationScopes.size, 1, 'connected summary must contain exactly one authorization scope');
  assert.ok(CONNECTED_ARMS.every((arm) => assignedCounts[arm] > 0), 'all connected experiment arms require assignments');

  const latestOutcomes = new Map();
  for (const event of outcomes) {
    if (event.value?.metric !== metric) continue;
    const key = assignmentKey(event.tenant_id, event.assignment?.experiment_id, event.household_token);
    const assignment = assignmentByHousehold.get(key);
    assert.ok(assignment, `target outcome ${event.event_id ?? 'unknown'} has no matching assignment`);
    validateOutcomeEvent(event, assignment);
    const previous = latestOutcomes.get(key);
    if (!previous || Date.parse(event.occurred_at) > Date.parse(previous.occurred_at)) latestOutcomes.set(key, event);
  }

  const exposureByHousehold = new Map();
  const exposureIds = new Set();
  for (const event of exposures) {
    assert.ok(!exposureIds.has(event.event_id), `duplicate exposure event ${event.event_id}`);
    exposureIds.add(event.event_id);
    const key = assignmentKey(event.tenant_id, event.experiment_id, event.household_token);
    const assignment = assignmentByHousehold.get(key);
    assert.ok(assignment, `exposure ${event.event_id ?? 'unknown'} has no matching assignment`);
    validateConnectedExposure(event, assignment);
    const summary = exposureByHousehold.get(key) ?? { decisionEvaluated: false, actionDelivered: false, connectedDataUsed: false, events: 0 };
    summary.decisionEvaluated ||= event.decision_evaluated;
    summary.actionDelivered ||= event.action_delivered;
    summary.connectedDataUsed ||= event.connected_data_used;
    summary.events += 1;
    exposureByHousehold.set(key, summary);
  }

  const values = Object.fromEntries(CONNECTED_ARMS.map((arm) => [arm, []]));
  const observedExposureCounts = Object.fromEntries(CONNECTED_ARMS.map((arm) => [arm, 0]));
  const deviationCounts = Object.fromEntries(CONNECTED_ARMS.map((arm) => [arm, 0]));
  for (const [key, assignment] of assignmentByHousehold) {
    const outcome = latestOutcomes.get(key);
    if (outcome) values[assignment.arm].push(outcome.value.amount);
    const exposure = exposureByHousehold.get(key);
    if (!exposure) continue;
    observedExposureCounts[assignment.arm] += 1;
    const deviated = assignment.arm === 'holdout'
      ? exposure.decisionEvaluated || exposure.actionDelivered || exposure.connectedDataUsed
      : assignment.arm === 'standalone'
        ? !exposure.decisionEvaluated || exposure.connectedDataUsed
        : !exposure.decisionEvaluated || !exposure.connectedDataUsed;
    if (deviated) deviationCounts[assignment.arm] += 1;
  }

  const armReports = {};
  for (const arm of CONNECTED_ARMS) {
    armReports[arm] = {
      assigned: assignedCounts[arm],
      outcomeObserved: values[arm].length,
      outcomeCoverage: round(values[arm].length / assignedCounts[arm]),
      exposureObserved: observedExposureCounts[arm],
      exposureCoverage: round(observedExposureCounts[arm] / assignedCounts[arm]),
      deviations: deviationCounts[arm],
      deviationRate: round(deviationCounts[arm] / assignedCounts[arm]),
      mean: round(mean(values[arm])),
    };
  }
  const sufficientSample = CONNECTED_ARMS.every((arm) => values[arm].length >= minimumPerArm);
  const sufficientOutcomeCoverage = CONNECTED_ARMS.every((arm) => armReports[arm].outcomeCoverage >= minimumOutcomeCoverage);
  const sufficientExposureCoverage = CONNECTED_ARMS.every((arm) => armReports[arm].exposureCoverage >= minimumExposureCoverage);
  const acceptableDeviation = CONNECTED_ARMS.every((arm) => armReports[arm].deviationRate <= maxDeviationRate);
  const ready = sufficientSample && sufficientOutcomeCoverage && sufficientExposureCoverage && acceptableDeviation;
  const status = !sufficientSample
    ? 'insufficient_sample'
    : !sufficientOutcomeCoverage
      ? 'incomplete_outcome_coverage'
      : !sufficientExposureCoverage
        ? 'incomplete_exposure_coverage'
        : !acceptableDeviation
          ? 'excessive_experiment_deviation'
          : 'measured';
  const standaloneVsHoldout = contrast('standalone', values.standalone, 'holdout', values.holdout, ready);
  const connectedVsStandalone = contrast('connected', values.connected, 'standalone', values.standalone, ready);
  const connectedVsHoldout = contrast('connected', values.connected, 'holdout', values.holdout, ready);
  const connectionSignal = connectedVsStandalone.inference?.signal ?? null;

  return {
    tenantId: [...tenantIds][0],
    experimentId: [...experimentIds][0],
    evidenceClass: [...evidenceClasses][0],
    authorizationScopeId: [...authorizationScopes][0],
    design: 'connected_incrementality',
    metric,
    status,
    minimumPerArm,
    minimumOutcomeCoverage,
    minimumExposureCoverage,
    maxDeviationRate,
    arms: armReports,
    contrasts: { standaloneVsHoldout, connectedVsStandalone, connectedVsHoldout },
    connectionRecommendation: !ready
      ? 'not_ready'
      : connectionSignal === 'positive'
        ? 'candidate_for_independent_scale_review'
        : connectionSignal === 'negative'
          ? 'do_not_scale_connected_data'
          : 'collect_more_evidence_before_scaling',
    evidenceStatus: !ready
      ? 'not_ready'
      : connectionSignal === 'inconclusive'
        ? 'inconclusive'
        : 'statistical_signal_detected',
    businessClaimAllowed: false,
    causalClaimAllowed: false,
    reviewRequired: 'independent_statistical_data-governance_and_experiment_review',
  };
}

export function createMeasurementRepository({ getDB }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');

  return {
    async recordAssignment(assignment) {
      validateMeasurementAssignment(assignment);
      validateTenantId(assignment.tenantId);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, assignment.tenantId);
        const result = await db.query(
          `INSERT INTO experiment_assignments
             (tenant_id, experiment_id, household_token, assignment_id, arm, experiment_design,
              holdout_pct, standalone_pct, connected_pct, bucket, evidence_class, assigned_at,
              authorization_scope_id, authorization_approved_at, authorization_expires_at,
              authorized_business_lines, authorized_signal_classes, decision_protocol_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (tenant_id, experiment_id, household_token) DO NOTHING
           RETURNING *`,
          [assignment.tenantId, assignment.experimentId, assignment.householdToken, assignment.assignmentId,
            assignment.arm, assignment.design ?? 'binary', assignment.holdoutPct,
            assignment.standalonePct ?? null, assignment.connectedPct ?? null, assignment.bucket,
            assignment.evidenceClass, assignment.assignedAt, assignment.authorizationScopeId ?? null,
            assignment.authorizationApprovedAt ?? null, assignment.authorizationExpiresAt ?? null,
            assignment.authorizedBusinessLines ? JSON.stringify(assignment.authorizedBusinessLines) : null,
            assignment.authorizedSignalClasses ? JSON.stringify(assignment.authorizedSignalClasses) : null,
            assignment.decisionProtocolId ?? null],
        );
        let record = result.rows[0];
        if (!record) {
          const existing = await db.query(
            `SELECT * FROM experiment_assignments
             WHERE tenant_id = $1 AND experiment_id = $2 AND household_token = $3`,
            [assignment.tenantId, assignment.experimentId, assignment.householdToken],
          );
          assert.equal(existing.rows.length, 1, 'assignment conflict could not be read back');
          assert.equal(existing.rows[0].arm, assignment.arm, 'existing assignment arm differs');
          assert.equal(existing.rows[0].assignment_id, assignment.assignmentId, 'existing assignment id differs');
          assert.equal(existing.rows[0].experiment_design, assignment.design ?? 'binary', 'existing experiment design differs');
          assert.equal(Number(existing.rows[0].holdout_pct), assignment.holdoutPct, 'existing holdout differs');
          assert.equal(Number(existing.rows[0].bucket), assignment.bucket, 'existing assignment bucket differs');
          assert.equal(existing.rows[0].evidence_class, assignment.evidenceClass, 'existing evidence class differs');
          assert.equal(new Date(existing.rows[0].assigned_at).toISOString(), assignment.assignedAt, 'existing assignment timestamp differs');
          assert.equal(existing.rows[0].decision_protocol_id ?? null, assignment.decisionProtocolId ?? null, 'existing decision protocol differs');
          if (assignment.design === 'connected_incrementality') {
            assert.equal(Number(existing.rows[0].standalone_pct), assignment.standalonePct, 'existing standalone allocation differs');
            assert.equal(Number(existing.rows[0].connected_pct), assignment.connectedPct, 'existing connected allocation differs');
            assert.equal(existing.rows[0].authorization_scope_id, assignment.authorizationScopeId, 'existing authorization scope differs');
            assert.equal(new Date(existing.rows[0].authorization_approved_at).toISOString(), assignment.authorizationApprovedAt, 'existing authorization approval differs');
            assert.equal(new Date(existing.rows[0].authorization_expires_at).toISOString(), assignment.authorizationExpiresAt, 'existing authorization expiry differs');
            assert.deepEqual(existing.rows[0].authorized_business_lines, assignment.authorizedBusinessLines, 'existing authorized business lines differ');
            assert.deepEqual(existing.rows[0].authorized_signal_classes, assignment.authorizedSignalClasses, 'existing authorized signal classes differ');
          }
          record = existing.rows[0];
        }
        await db.query('COMMIT');
        return record;
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async recordExposure(event) {
      validateTenantId(event.tenant_id);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, event.tenant_id);
        const assignmentResult = await db.query(
          `SELECT * FROM experiment_assignments
           WHERE tenant_id = $1 AND experiment_id = $2 AND household_token = $3`,
          [event.tenant_id, event.experiment_id, event.household_token],
        );
        assert.equal(assignmentResult.rows.length, 1, 'exposure has no pre-existing experiment assignment');
        const assignment = normalizeAssignmentRow(assignmentResult.rows[0]);
        validateConnectedExposure(event, assignment);
        const inserted = await db.query(
          `INSERT INTO connected_exposure_events
             (tenant_id, event_id, experiment_id, household_token, arm, action_delivered,
              decision_evaluated, connected_data_used, authorization_scope_id, occurred_at, payload,
              decision_protocol_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
           ON CONFLICT (tenant_id, event_id) DO NOTHING
           RETURNING *`,
          [event.tenant_id, event.event_id, event.experiment_id, event.household_token, event.arm,
            event.action_delivered, event.decision_evaluated, event.connected_data_used,
            event.authorization_scope_id, event.occurred_at, event, event.decision_protocol_id],
        );
        let record = inserted.rows[0];
        if (!record) {
          const existing = await db.query(
            `SELECT * FROM connected_exposure_events
             WHERE tenant_id = $1 AND event_id = $2`,
            [event.tenant_id, event.event_id],
          );
          assert.equal(existing.rows.length, 1, 'exposure conflict could not be read back');
          assert.deepEqual(existing.rows[0].payload, event, 'exposure idempotency key reused for different event content');
          record = existing.rows[0];
        }
        await db.query('COMMIT');
        return { inserted: inserted.rows.length === 1, record };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async recordOutcome(event) {
      validateOutcomeEvent(event);
      validateTenantId(event.tenant_id);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, event.tenant_id);
        const assignmentResult = await db.query(
          `SELECT * FROM experiment_assignments
           WHERE tenant_id = $1 AND experiment_id = $2 AND household_token = $3`,
          [event.tenant_id, event.assignment.experiment_id, event.household_token],
        );
        assert.equal(assignmentResult.rows.length, 1, 'outcome has no pre-existing experiment assignment');
        const assignment = normalizeAssignmentRow(assignmentResult.rows[0]);
        validateOutcomeEvent(event, assignment);
        const inserted = await db.query(
          `INSERT INTO outcome_events
             (tenant_id, event_id, experiment_id, household_token, growth_play_id, decision_id,
              activation_id, event_type, occurred_at, arm, assigned_at, metric, amount, currency,
              source_system, source_record_id, reason_code, payload)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
           ON CONFLICT (tenant_id, event_id) DO NOTHING
           RETURNING *`,
          [event.tenant_id, event.event_id, event.assignment.experiment_id, event.household_token,
            event.growth_play_id, event.decision_id, event.activation_id ?? null, event.event_type,
            event.occurred_at, event.assignment.arm, event.assignment.assigned_at,
            event.value?.metric ?? null, event.value?.amount ?? null, event.value?.currency ?? null,
            event.source_system, event.source_record_id ?? null, event.reason_code ?? null, event],
        );
        let record = inserted.rows[0];
        if (!record) {
          const existing = await db.query(
            `SELECT * FROM outcome_events
             WHERE tenant_id = $1 AND event_id = $2`,
            [event.tenant_id, event.event_id],
          );
          assert.equal(existing.rows.length, 1, 'outcome conflict could not be read back');
          assert.deepEqual(existing.rows[0].payload, event, 'outcome idempotency key reused for different event content');
          record = existing.rows[0];
        }
        const response = { inserted: inserted.rows.length === 1, record };
        await db.query('COMMIT');
        return response;
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },

    async loadExperiment({ tenantId, experimentId }) {
      validateTenantId(tenantId);
      assertIdentifier(experimentId, 'experimentId');
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, tenantId);
        const assignmentRows = await db.query(
          `SELECT * FROM experiment_assignments
           WHERE tenant_id = $1 AND experiment_id = $2
           ORDER BY household_token ASC`,
          [tenantId, experimentId],
        );
        const outcomeRows = await db.query(
          `SELECT payload FROM outcome_events
           WHERE tenant_id = $1 AND experiment_id = $2
           ORDER BY occurred_at ASC, event_id ASC`,
          [tenantId, experimentId],
        );
        const exposureRows = await db.query(
          `SELECT payload FROM connected_exposure_events
           WHERE tenant_id = $1 AND experiment_id = $2
           ORDER BY occurred_at ASC, event_id ASC`,
          [tenantId, experimentId],
        );
        await db.query('COMMIT');
        return {
          assignments: assignmentRows.rows.map(normalizeAssignmentRow),
          outcomes: outcomeRows.rows.map((row) => row.payload),
          exposures: exposureRows.rows.map((row) => row.payload),
        };
      } catch (error) {
        await db.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        await db.end();
      }
    },
  };
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 128, `${label} is invalid`);
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be ISO date-time`);
}

function validateMeasurementAssignment(assignment) {
  assert.ok(assignment && typeof assignment === 'object' && !Array.isArray(assignment), 'assignment must be an object');
  validateTenantId(assignment.tenantId);
  assertIdentifier(assignment.assignmentId, 'assignment.assignmentId');
  assertIdentifier(assignment.experimentId, 'assignment.experimentId');
  assert.match(assignment.householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'assignment.householdToken must be opaque');
  assert.ok(ARMS.has(assignment.arm), 'assignment.arm is unsupported');
  assert.ok(EVIDENCE_CLASSES.has(assignment.evidenceClass), 'assignment.evidenceClass is unsupported');
  assertIsoDate(assignment.assignedAt, 'assignment.assignedAt');
  assert.ok(Number.isInteger(assignment.bucket) && assignment.bucket >= 0 && assignment.bucket <= 9_999, 'assignment.bucket must be 0-9999');
  const design = assignment.design ?? 'binary';
  assert.ok(['binary', 'connected_incrementality'].includes(design), 'assignment.design is unsupported');
  if (design === 'binary') {
    assert.ok(BINARY_ARMS.has(assignment.arm), 'binary assignment arm is unsupported');
    assert.ok(Number.isFinite(assignment.holdoutPct) && assignment.holdoutPct >= 1 && assignment.holdoutPct <= 50, 'binary holdoutPct must be 1-50');
    if (assignment.decisionProtocolId !== null && assignment.decisionProtocolId !== undefined) {
      assertIdentifier(assignment.decisionProtocolId, 'assignment.decisionProtocolId');
    }
  } else {
    assert.ok(CONNECTED_ARMS.includes(assignment.arm), 'connected assignment arm is unsupported');
    assert.ok(Number.isFinite(assignment.holdoutPct) && assignment.holdoutPct >= 5 && assignment.holdoutPct <= 50, 'connected holdoutPct must be 5-50');
    for (const [label, value] of Object.entries({ standalonePct: assignment.standalonePct, connectedPct: assignment.connectedPct })) {
      assert.ok(Number.isFinite(value) && value >= 5 && value <= 90, `connected ${label} must be 5-90`);
    }
    assertIdentifier(assignment.decisionProtocolId, 'assignment.decisionProtocolId');
    assert.ok(
      Math.abs(assignment.holdoutPct + assignment.standalonePct + assignment.connectedPct - 100) < 0.0001,
      'connected assignment percentages must total 100',
    );
    validateConnectedAuthorization({
      scopeId: assignment.authorizationScopeId,
      approvedAt: assignment.authorizationApprovedAt,
      expiresAt: assignment.authorizationExpiresAt,
      businessLines: assignment.authorizedBusinessLines,
      signalClasses: assignment.authorizedSignalClasses,
    }, assignment.assignedAt);
  }
}

function normalizeAssignmentRow(row) {
  return {
    assignmentId: row.assignment_id,
    tenantId: row.tenant_id,
    experimentId: row.experiment_id,
    householdToken: row.household_token,
    arm: row.arm,
    design: row.experiment_design ?? 'binary',
    holdoutPct: Number(row.holdout_pct),
    standalonePct: row.standalone_pct === null || row.standalone_pct === undefined ? null : Number(row.standalone_pct),
    connectedPct: row.connected_pct === null || row.connected_pct === undefined ? null : Number(row.connected_pct),
    bucket: Number(row.bucket),
    evidenceClass: row.evidence_class,
    assignedAt: new Date(row.assigned_at).toISOString(),
    authorizationScopeId: row.authorization_scope_id ?? null,
    authorizationApprovedAt: row.authorization_approved_at ? new Date(row.authorization_approved_at).toISOString() : null,
    authorizationExpiresAt: row.authorization_expires_at ? new Date(row.authorization_expires_at).toISOString() : null,
    authorizedBusinessLines: row.authorized_business_lines ?? null,
    authorizedSignalClasses: row.authorized_signal_classes ?? null,
    decisionProtocolId: row.decision_protocol_id ?? null,
  };
}

function assignmentKey(tenantId, experimentId, householdToken) {
  return `${tenantId}\u001f${experimentId}\u001f${householdToken}`;
}

function differenceInMeansInference(treatment, holdout) {
  const treatmentMean = mean(treatment);
  const holdoutMean = mean(holdout);
  const difference = treatmentMean - holdoutMean;
  const standardError = Math.sqrt(
    sampleVariance(treatment, treatmentMean) / treatment.length
    + sampleVariance(holdout, holdoutMean) / holdout.length,
  );
  const margin = 1.96 * standardError;
  const lower = difference - margin;
  const upper = difference + margin;
  return {
    method: 'difference_in_means_normal_approximation',
    confidenceLevel: 0.95,
    standardError: round(standardError),
    confidenceInterval: { lower: round(lower), upper: round(upper) },
    signal: lower > 0 ? 'positive' : upper < 0 ? 'negative' : 'inconclusive',
    limitations: [
      'Requires valid pre-activation assignment and complete outcome mapping.',
      'Does not adjust for multiple testing, spillovers, noncompliance, or covariate imbalance.',
    ],
  };
}

function contrast(leftLabel, leftValues, rightLabel, rightValues, ready) {
  if (!ready) {
    return { leftArm: leftLabel, rightArm: rightLabel, absoluteDifference: null, relativeDifferencePct: null, inference: null };
  }
  const leftMean = mean(leftValues);
  const rightMean = mean(rightValues);
  const difference = leftMean - rightMean;
  return {
    leftArm: leftLabel,
    rightArm: rightLabel,
    absoluteDifference: round(difference),
    relativeDifferencePct: rightMean === 0 ? null : round((difference / Math.abs(rightMean)) * 100),
    inference: differenceInMeansInference(leftValues, rightValues),
  };
}

function validateConnectedAuthorization(authorization, assignedAt) {
  assert.ok(authorization && typeof authorization === 'object' && !Array.isArray(authorization), 'connected-data authorization is required');
  assertIdentifier(authorization.scopeId, 'authorization.scopeId');
  assertIsoDate(authorization.approvedAt, 'authorization.approvedAt');
  assertIsoDate(authorization.expiresAt, 'authorization.expiresAt');
  assert.ok(Date.parse(authorization.approvedAt) <= Date.parse(assignedAt), 'authorization must be approved before assignment');
  assert.ok(Date.parse(assignedAt) < Date.parse(authorization.expiresAt), 'authorization must be active at assignment');
  assert.ok(Array.isArray(authorization.businessLines) && new Set(authorization.businessLines).size >= 2, 'authorization requires at least two business lines');
  assert.ok(Array.isArray(authorization.signalClasses) && authorization.signalClasses.length > 0, 'authorization requires signal classes');
  for (const value of [...authorization.businessLines, ...authorization.signalClasses]) assertIdentifier(value, 'authorization scope value');
  return {
    scopeId: authorization.scopeId,
    approvedAt: new Date(authorization.approvedAt).toISOString(),
    expiresAt: new Date(authorization.expiresAt).toISOString(),
    businessLines: [...new Set(authorization.businessLines)].sort(),
    signalClasses: [...new Set(authorization.signalClasses)].sort(),
  };
}

function sampleVariance(values, average) {
  if (values.length < 2) return 0;
  return values.reduce((sum, value) => sum + (value - average) ** 2, 0) / (values.length - 1);
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function round(value) {
  return value === null ? null : Number(value.toFixed(4));
}
