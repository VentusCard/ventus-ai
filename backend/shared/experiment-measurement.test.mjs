import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assignExperiment,
  createMeasurementRepository,
  summarizeIncrementalLift,
  validateOutcomeEvent,
} from './experiment-measurement.mjs';

const SALT = 'ventus-test-assignment-salt-2026';
const ASSIGNED_AT = '2026-07-01T00:00:00.000Z';

test('assignment is deterministic, opaque, and stable across reruns', () => {
  const input = {
    tenantId: 'bank_1',
    experimentId: 'primacy_01',
    householdToken: 'tok_household_000001',
    holdoutPct: 10,
    salt: SALT,
    assignedAt: ASSIGNED_AT,
  };
  const first = assignExperiment(input);
  const second = assignExperiment(input);
  assert.deepEqual(first, second);
  assert.match(first.assignmentId, /^asn_[a-f0-9]{24}$/);
  assert.ok(['treatment', 'holdout'].includes(first.arm));
  assert.ok(first.bucket >= 0 && first.bucket <= 9999);
});

test('salted assignment approximates the configured holdout without exposing identity', () => {
  const assignments = Array.from({ length: 10_000 }, (_, index) =>
    assignExperiment({
      tenantId: 'bank_1',
      experimentId: 'primacy_01',
      householdToken: `tok_household_${String(index).padStart(8, '0')}`,
      holdoutPct: 10,
      salt: SALT,
      assignedAt: ASSIGNED_AT,
    })
  );
  const holdout = assignments.filter((assignment) => assignment.arm === 'holdout').length;
  assert.ok(holdout >= 900 && holdout <= 1100, `expected ~10% holdout, received ${holdout / 100}%`);
});

test('outcomes require immutable pre-activation assignment', () => {
  const assignment = assignExperiment({
    tenantId: 'bank_1',
    experimentId: 'primacy_01',
    householdToken: 'tok_household_000001',
    holdoutPct: 10,
    salt: SALT,
    assignedAt: ASSIGNED_AT,
  });
  const event = outcomeFor(assignment, 18_400, '2026-08-01T00:00:00.000Z');
  assert.equal(validateOutcomeEvent(event, assignment), event);
  assert.throws(
    () => validateOutcomeEvent({ ...event, assignment: { ...event.assignment, arm: assignment.arm === 'holdout' ? 'treatment' : 'holdout' } }, assignment),
    /immutable assignment/,
  );
  assert.throws(
    () => validateOutcomeEvent({ ...event, occurred_at: '2026-06-01T00:00:00.000Z' }, assignment),
    /assignment must predate/,
  );
});

test('incremental lift remains unavailable until both arms satisfy sample gates', () => {
  const { assignments, outcomes } = measurementFixture(20, 20);
  const early = summarizeIncrementalLift({ assignments, outcomes, metric: 'deposit_retained', minimumPerArm: 30 });
  assert.equal(early.status, 'insufficient_sample');
  assert.equal(early.absoluteLift, null);

  const complete = measurementFixture(40, 40);
  const measured = summarizeIncrementalLift({ ...complete, metric: 'deposit_retained', minimumPerArm: 30 });
  assert.equal(measured.status, 'measured');
  assert.equal(measured.treatment.mean, 1200);
  assert.equal(measured.holdout.mean, 1000);
  assert.equal(measured.absoluteLift, 200);
  assert.equal(measured.relativeLiftPct, 20);
});

test('repository records assignment before accepting an idempotent outcome', async () => {
  const state = { assignments: [], outcomes: [], queries: [] };
  const repository = createMeasurementRepository({ getDB: async () => fakeDb(state) });
  const assignment = assignExperiment({
    tenantId: 'bank_1',
    experimentId: 'primacy_01',
    householdToken: 'tok_household_000001',
    holdoutPct: 10,
    salt: SALT,
    assignedAt: ASSIGNED_AT,
  });
  await repository.recordAssignment(assignment);
  const event = outcomeFor(assignment, 18_400, '2026-08-01T00:00:00.000Z');
  const first = await repository.recordOutcome(event);
  const duplicate = await repository.recordOutcome(event);
  assert.equal(first.inserted, true);
  assert.equal(duplicate.inserted, false);
  assert.equal(state.assignments.length, 1);
  assert.equal(state.outcomes.length, 1);
  const tenantContexts = state.queries.filter((entry) => entry.sql.includes('app.current_tenant_id'));
  assert.equal(tenantContexts.length, 3);
  assert.ok(tenantContexts.every((entry) => entry.params[0] === 'bank_1'));
});

function measurementFixture(treatmentCount, holdoutCount) {
  const assignments = [];
  const outcomes = [];
  for (const [arm, count, amount] of [['treatment', treatmentCount, 1200], ['holdout', holdoutCount, 1000]]) {
    for (let index = 0; index < count; index += 1) {
      const assignment = {
        assignmentId: `asn_${arm}_${index}`,
        tenantId: 'bank_1',
        experimentId: 'primacy_01',
        householdToken: `tok_${arm}_${String(index).padStart(8, '0')}`,
        arm,
        holdoutPct: 10,
        bucket: index,
        assignedAt: ASSIGNED_AT,
      };
      assignments.push(assignment);
      outcomes.push(outcomeFor(assignment, amount, '2026-08-01T00:00:00.000Z'));
    }
  }
  return { assignments, outcomes };
}

function outcomeFor(assignment, amount, occurredAt) {
  return {
    contract_version: '1.0',
    event_id: `evt_${assignment.householdToken}_${occurredAt.slice(0, 10)}`,
    tenant_id: assignment.tenantId,
    household_token: assignment.householdToken,
    growth_play_id: 'deposit-primacy-defense',
    decision_id: `decision_${assignment.householdToken}`,
    activation_id: `activation_${assignment.householdToken}`,
    event_type: 'deposit_balance_observed',
    occurred_at: occurredAt,
    assignment: {
      experiment_id: assignment.experimentId,
      arm: assignment.arm,
      assigned_at: assignment.assignedAt,
    },
    value: { metric: 'deposit_retained', amount, currency: 'USD' },
    source_system: 'deposit_core',
    source_record_id: null,
    reason_code: null,
  };
}

function fakeDb(state) {
  return {
    async connect() {},
    async end() {},
    async query(sql, params = []) {
      state.queries.push({ sql, params });
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql) || sql.includes('set_config')) return { rows: [] };
      if (sql.includes('INSERT INTO experiment_assignments')) {
        const existing = state.assignments.find((row) => row.tenant_id === params[0] && row.experiment_id === params[1] && row.household_token === params[2]);
        if (existing) return { rows: [] };
        const row = {
          tenant_id: params[0], experiment_id: params[1], household_token: params[2], assignment_id: params[3],
          arm: params[4], holdout_pct: params[5], bucket: params[6], assigned_at: new Date(params[7]),
        };
        state.assignments.push(row);
        return { rows: [row] };
      }
      if (sql.includes('SELECT * FROM experiment_assignments')) {
        return { rows: state.assignments.filter((row) => row.tenant_id === params[0] && row.experiment_id === params[1] && row.household_token === params[2]) };
      }
      if (sql.includes('INSERT INTO outcome_events')) {
        if (state.outcomes.some((row) => row.tenant_id === params[0] && row.event_id === params[1])) return { rows: [] };
        const row = { tenant_id: params[0], event_id: params[1] };
        state.outcomes.push(row);
        return { rows: [row] };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
}
