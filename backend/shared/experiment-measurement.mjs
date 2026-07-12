import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

const ARMS = new Set(['treatment', 'holdout']);
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
  assignedAt = new Date().toISOString(),
}) {
  assertIdentifier(tenantId, 'tenantId');
  assertIdentifier(experimentId, 'experimentId');
  assert.match(householdToken, /^tok_[A-Za-z0-9_-]{8,120}$/, 'householdToken must be opaque');
  assert.ok(Number.isFinite(holdoutPct) && holdoutPct >= 1 && holdoutPct <= 50, 'holdoutPct must be 1-50');
  assert.ok(typeof salt === 'string' && salt.length >= 16, 'assignment salt must be at least 16 characters');
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

export function summarizeIncrementalLift({ assignments, outcomes, metric, minimumPerArm = 30 }) {
  assert.ok(Array.isArray(assignments), 'assignments must be an array');
  assert.ok(Array.isArray(outcomes), 'outcomes must be an array');
  assert.ok(METRICS.has(metric), 'metric is unsupported');
  assert.ok(Number.isInteger(minimumPerArm) && minimumPerArm > 0, 'minimumPerArm must be positive');

  const assignmentByHousehold = new Map(assignments.map((assignment) => [assignment.householdToken, assignment]));
  const latest = new Map();
  for (const event of outcomes) {
    if (event.value?.metric !== metric) continue;
    const assignment = assignmentByHousehold.get(event.household_token);
    if (!assignment) continue;
    validateOutcomeEvent(event, assignment);
    const previous = latest.get(event.household_token);
    if (!previous || Date.parse(event.occurred_at) > Date.parse(previous.occurred_at)) {
      latest.set(event.household_token, event);
    }
  }

  const values = { treatment: [], holdout: [] };
  for (const [householdToken, event] of latest) {
    const arm = assignmentByHousehold.get(householdToken).arm;
    values[arm].push(event.value.amount);
  }
  const treatmentMean = mean(values.treatment);
  const holdoutMean = mean(values.holdout);
  const sufficient = values.treatment.length >= minimumPerArm && values.holdout.length >= minimumPerArm;
  const absoluteLift = treatmentMean === null || holdoutMean === null ? null : treatmentMean - holdoutMean;
  const relativeLiftPct = absoluteLift === null || holdoutMean === 0 ? null : (absoluteLift / Math.abs(holdoutMean)) * 100;

  return {
    metric,
    status: sufficient ? 'measured' : 'insufficient_sample',
    minimumPerArm,
    treatment: { observed: values.treatment.length, mean: round(treatmentMean) },
    holdout: { observed: values.holdout.length, mean: round(holdoutMean) },
    absoluteLift: sufficient ? round(absoluteLift) : null,
    relativeLiftPct: sufficient ? round(relativeLiftPct) : null,
  };
}

export function createMeasurementRepository({ getDB }) {
  assert.equal(typeof getDB, 'function', 'getDB is required');

  return {
    async recordAssignment(assignment) {
      const db = await getDB();
      await db.connect();
      try {
        const result = await db.query(
          `INSERT INTO experiment_assignments
             (tenant_id, experiment_id, household_token, assignment_id, arm, holdout_pct, bucket, assigned_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (tenant_id, experiment_id, household_token) DO NOTHING
           RETURNING *`,
          [assignment.tenantId, assignment.experimentId, assignment.householdToken, assignment.assignmentId,
            assignment.arm, assignment.holdoutPct, assignment.bucket, assignment.assignedAt],
        );
        if (result.rows[0]) return result.rows[0];
        const existing = await db.query(
          `SELECT * FROM experiment_assignments
           WHERE tenant_id = $1 AND experiment_id = $2 AND household_token = $3`,
          [assignment.tenantId, assignment.experimentId, assignment.householdToken],
        );
        assert.equal(existing.rows.length, 1, 'assignment conflict could not be read back');
        assert.equal(existing.rows[0].arm, assignment.arm, 'existing assignment arm differs');
        assert.equal(Number(existing.rows[0].holdout_pct), assignment.holdoutPct, 'existing holdout differs');
        return existing.rows[0];
      } finally {
        await db.end();
      }
    },

    async recordOutcome(event) {
      validateOutcomeEvent(event);
      const db = await getDB();
      await db.connect();
      try {
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
        return { inserted: inserted.rows.length === 1, record: inserted.rows[0] ?? null };
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

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function round(value) {
  return value === null ? null : Number(value.toFixed(4));
}
