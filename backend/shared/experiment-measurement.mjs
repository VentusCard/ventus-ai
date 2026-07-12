import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { beginTenantTransaction, validateTenantId } from './tenant-context.mjs';

const ARMS = new Set(['treatment', 'holdout']);
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
  evidenceClass = 'synthetic',
  assignedAt = new Date().toISOString(),
}) {
  validateTenantId(tenantId);
  assertIdentifier(experimentId, 'experimentId');
  assert.match(householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  assert.ok(Number.isFinite(holdoutPct) && holdoutPct >= 1 && holdoutPct <= 50, 'holdoutPct must be 1-50');
  assert.ok(typeof salt === 'string' && salt.length >= 16, 'assignment salt must be at least 16 characters');
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

export function createMeasurementRepository({ getDB }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');

  return {
    async recordAssignment(assignment) {
      validateTenantId(assignment.tenantId);
      const db = await getDB();
      await db.connect();
      try {
        await beginTenantTransaction(db, assignment.tenantId);
        const result = await db.query(
          `INSERT INTO experiment_assignments
             (tenant_id, experiment_id, household_token, assignment_id, arm, holdout_pct, bucket,
              evidence_class, assigned_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (tenant_id, experiment_id, household_token) DO NOTHING
           RETURNING *`,
          [assignment.tenantId, assignment.experimentId, assignment.householdToken, assignment.assignmentId,
            assignment.arm, assignment.holdoutPct, assignment.bucket, assignment.evidenceClass,
            assignment.assignedAt],
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
          assert.equal(Number(existing.rows[0].holdout_pct), assignment.holdoutPct, 'existing holdout differs');
          assert.equal(Number(existing.rows[0].bucket), assignment.bucket, 'existing assignment bucket differs');
          assert.equal(existing.rows[0].evidence_class, assignment.evidenceClass, 'existing evidence class differs');
          assert.equal(new Date(existing.rows[0].assigned_at).toISOString(), assignment.assignedAt, 'existing assignment timestamp differs');
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
        const row = assignmentResult.rows[0];
        validateOutcomeEvent(event, {
          tenantId: row.tenant_id,
          experimentId: row.experiment_id,
          householdToken: row.household_token,
          arm: row.arm,
          assignedAt: new Date(row.assigned_at).toISOString(),
        });
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
        await db.query('COMMIT');
        return {
          assignments: assignmentRows.rows.map(normalizeAssignmentRow),
          outcomes: outcomeRows.rows.map((row) => row.payload),
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
  assertIdentifier(assignment.experimentId, 'assignment.experimentId');
  assert.match(assignment.householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'assignment.householdToken must be opaque');
  assert.ok(ARMS.has(assignment.arm), 'assignment.arm is unsupported');
  assert.ok(EVIDENCE_CLASSES.has(assignment.evidenceClass), 'assignment.evidenceClass is unsupported');
  assertIsoDate(assignment.assignedAt, 'assignment.assignedAt');
}

function normalizeAssignmentRow(row) {
  return {
    assignmentId: row.assignment_id,
    tenantId: row.tenant_id,
    experimentId: row.experiment_id,
    householdToken: row.household_token,
    arm: row.arm,
    holdoutPct: Number(row.holdout_pct),
    bucket: Number(row.bucket),
    evidenceClass: row.evidence_class,
    assignedAt: new Date(row.assigned_at).toISOString(),
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
