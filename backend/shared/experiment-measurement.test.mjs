import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assignConnectedExpansionExperiment,
  assignExperiment,
  createMeasurementRepository,
  summarizeConnectedExpansionLift,
  summarizeIncrementalLift,
  validateConnectedExposure,
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

test('connected assignment is deterministic, three-arm, and requires active scoped authorization', () => {
  const input = connectedAssignmentInput('tok_connected_000001');
  const first = assignConnectedExpansionExperiment(input);
  assert.deepEqual(first, assignConnectedExpansionExperiment(input));
  assert.ok(['holdout', 'standalone', 'connected'].includes(first.arm));
  assert.equal(first.design, 'connected_incrementality');
  assert.equal(first.authorizationScopeId, 'scope_consumer_wealth_01');
  assert.deepEqual(first.authorizedBusinessLines, ['consumer', 'wealth']);

  const expired = connectedAssignmentInput('tok_connected_000002');
  expired.authorization.expiresAt = '2026-06-30T00:00:00.000Z';
  assert.throws(() => assignConnectedExpansionExperiment(expired), /authorization must be active/);
  const missingLine = connectedAssignmentInput('tok_connected_000003');
  missingLine.authorization.businessLines = ['consumer'];
  assert.throws(() => assignConnectedExpansionExperiment(missingLine), /at least two business lines/);
  assert.throws(
    () => assignConnectedExpansionExperiment({
      ...input,
      holdoutPct: 60,
      standalonePct: 20,
      connectedPct: 20,
    }),
    /holdoutPct must be 5-50/,
  );
});

test('connected experiment isolates standalone lift and incremental connection lift', () => {
  const fixture = connectedMeasurementFixture(40);
  const result = summarizeConnectedExpansionLift({
    ...fixture,
    metric: 'net_new_assets',
    minimumPerArm: 30,
  });
  assert.equal(result.status, 'measured');
  assert.equal(result.arms.holdout.mean, 1000);
  assert.equal(result.arms.standalone.mean, 1200);
  assert.equal(result.arms.connected.mean, 1500);
  assert.equal(result.contrasts.standaloneVsHoldout.absoluteDifference, 200);
  assert.equal(result.contrasts.connectedVsStandalone.absoluteDifference, 300);
  assert.equal(result.contrasts.connectedVsHoldout.absoluteDifference, 500);
  assert.equal(result.contrasts.connectedVsStandalone.inference.signal, 'positive');
  assert.equal(result.connectionRecommendation, 'candidate_for_independent_scale_review');
  assert.equal(result.businessClaimAllowed, false);
  assert.equal(result.causalClaimAllowed, false);
});

test('connected lift is withheld when exposure coverage or arm fidelity fails', () => {
  const incomplete = connectedMeasurementFixture(40);
  incomplete.exposures = [
    ...incomplete.exposures.filter((event) => event.arm !== 'connected'),
    ...incomplete.exposures.filter((event) => event.arm === 'connected').slice(5),
  ];
  const missing = summarizeConnectedExpansionLift({
    ...incomplete,
    metric: 'net_new_assets',
    minimumPerArm: 30,
  });
  assert.equal(missing.status, 'incomplete_exposure_coverage');
  assert.equal(missing.contrasts.connectedVsStandalone.absoluteDifference, null);

  const contaminated = connectedMeasurementFixture(40);
  const standaloneExposure = contaminated.exposures.find((event) => event.arm === 'standalone');
  standaloneExposure.connected_data_used = true;
  const deviated = summarizeConnectedExpansionLift({
    ...contaminated,
    metric: 'net_new_assets',
    minimumPerArm: 30,
    maxDeviationRate: 0.02,
  });
  assert.equal(deviated.status, 'excessive_experiment_deviation');
  assert.ok(deviated.arms.standalone.deviationRate > 0.02);
  assert.equal(deviated.connectionRecommendation, 'not_ready');
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
  assert.equal(measured.treatment.assigned, 40);
  assert.equal(measured.treatment.coverage, 1);
  assert.equal(measured.absoluteLift, 200);
  assert.equal(measured.relativeLiftPct, 20);
  assert.deepEqual(measured.inference.confidenceInterval, { lower: 200, upper: 200 });
  assert.equal(measured.inference.signal, 'positive');
  assert.equal(measured.evidenceStatus, 'statistical_signal_detected');
  assert.equal(measured.evidenceClass, 'synthetic');
  assert.equal(measured.businessClaimAllowed, false);
  assert.equal(measured.causalClaimAllowed, false);
  assert.equal(measured.reviewRequired, 'independent_statistical_and_experiment_review');
});

test('measurement with incomplete outcome coverage withholds lift', () => {
  const fixture = measurementFixture(40, 40);
  fixture.outcomes = fixture.outcomes.filter((event, index) => event.assignment.arm !== 'treatment' || index >= 5);
  const result = summarizeIncrementalLift({
    ...fixture,
    metric: 'deposit_retained',
    minimumPerArm: 30,
    minimumCoverage: 0.9,
  });
  assert.equal(result.treatment.observed, 35);
  assert.equal(result.treatment.coverage, 0.875);
  assert.equal(result.status, 'incomplete_outcome_coverage');
  assert.equal(result.absoluteLift, null);
  assert.equal(result.inference, null);
  assert.equal(result.evidenceStatus, 'not_ready');
});

test('measurement rejects mixed experiments and unmatched target outcomes', () => {
  const mixed = measurementFixture(40, 40);
  mixed.assignments[0] = { ...mixed.assignments[0], experimentId: 'other_experiment' };
  assert.throws(
    () => summarizeIncrementalLift({ ...mixed, metric: 'deposit_retained' }),
    /exactly one experiment/,
  );

  const unmatched = measurementFixture(40, 40);
  const outsider = {
    ...unmatched.assignments[0],
    householdToken: 'tok_outsider_000001',
    assignmentId: 'asn_outsider_000001',
  };
  unmatched.outcomes.push(outcomeFor(outsider, 500, '2026-08-01T00:00:00.000Z'));
  assert.throws(
    () => summarizeIncrementalLift({ ...unmatched, metric: 'deposit_retained' }),
    /has no matching assignment/,
  );
});

test('uncertain lift remains inconclusive rather than promoted as a signal', () => {
  const fixture = measurementFixture(40, 40);
  fixture.outcomes = fixture.outcomes.map((event, index) => ({
    ...event,
    value: {
      ...event.value,
      amount: index % 2 === 0 ? 0 : 2000,
    },
  }));
  const result = summarizeIncrementalLift({ ...fixture, metric: 'deposit_retained' });
  assert.equal(result.status, 'measured');
  assert.equal(result.absoluteLift, 0);
  assert.equal(result.inference.signal, 'inconclusive');
  assert.equal(result.evidenceStatus, 'inconclusive');
  assert.ok(result.inference.confidenceInterval.lower < 0);
  assert.ok(result.inference.confidenceInterval.upper > 0);
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
  await assert.rejects(
    () => repository.recordAssignment({ ...assignment, assignedAt: '2026-07-02T00:00:00.000Z' }),
    /existing assignment timestamp differs/,
  );
  const event = outcomeFor(assignment, 18_400, '2026-08-01T00:00:00.000Z');
  const first = await repository.recordOutcome(event);
  const duplicate = await repository.recordOutcome(event);
  assert.equal(first.inserted, true);
  assert.equal(duplicate.inserted, false);
  assert.equal(state.assignments.length, 1);
  assert.equal(state.outcomes.length, 1);
  assert.equal(duplicate.record.payload.event_id, event.event_id);
  const tenantContexts = state.queries.filter((entry) => entry.sql.includes('app.current_tenant_id'));
  assert.equal(tenantContexts.length, 4);
  assert.ok(tenantContexts.every((entry) => entry.params[0] === 'bank_1'));
  const loaded = await repository.loadExperiment({ tenantId: 'bank_1', experimentId: 'primacy_01' });
  assert.equal(loaded.assignments.length, 1);
  assert.equal(loaded.assignments[0].evidenceClass, 'synthetic');
  assert.equal(loaded.outcomes.length, 1);
  assert.equal(loaded.exposures.length, 0);
  assert.equal(loaded.outcomes[0].event_id, event.event_id);
  await assert.rejects(
    () => repository.recordOutcome({ ...event, value: { ...event.value, amount: 99 } }),
    /idempotency key reused for different event content/,
  );
});

test('repository persists idempotent connected-exposure receipts after assignment', async () => {
  const state = { assignments: [], outcomes: [], exposures: [], queries: [] };
  const repository = createMeasurementRepository({ getDB: async () => fakeDb(state) });
  const assignment = assignConnectedExpansionExperiment(connectedAssignmentInput('tok_connected_900001'));
  await repository.recordAssignment(assignment);
  await assert.rejects(
    () => repository.recordAssignment({ ...assignment, authorizationScopeId: 'scope_changed_after_assignment' }),
    /existing authorization scope differs/,
  );
  const exposure = exposureFor(assignment);
  assert.equal(validateConnectedExposure(exposure, assignment), exposure);
  const first = await repository.recordExposure(exposure);
  const replay = await repository.recordExposure(exposure);
  assert.equal(first.inserted, true);
  assert.equal(replay.inserted, false);
  assert.equal(state.exposures.length, 1);
  await assert.rejects(
    () => repository.recordExposure({ ...exposure, connected_data_used: !exposure.connected_data_used }),
    /idempotency key reused/,
  );
  const outcome = outcomeFor(assignment, 25_000, '2026-08-01T00:00:00.000Z', 'net_new_assets');
  await assert.rejects(
    () => repository.recordOutcome({
      ...outcome,
      assignment: { ...outcome.assignment, authorization_scope_id: 'scope_not_assigned' },
    }),
    /authorization scope does not match assignment/,
  );
  const outcomeWrite = await repository.recordOutcome(outcome);
  assert.equal(outcomeWrite.inserted, true);
  const loaded = await repository.loadExperiment({ tenantId: assignment.tenantId, experimentId: assignment.experimentId });
  assert.equal(loaded.exposures.length, 1);
  assert.equal(loaded.exposures[0].authorization_scope_id, assignment.authorizationScopeId);
  assert.equal(loaded.outcomes.length, 1);
  assert.equal(loaded.outcomes[0].assignment.authorization_scope_id, assignment.authorizationScopeId);
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
        evidenceClass: 'synthetic',
        assignedAt: ASSIGNED_AT,
      };
      assignments.push(assignment);
      outcomes.push(outcomeFor(assignment, amount, '2026-08-01T00:00:00.000Z'));
    }
  }
  return { assignments, outcomes };
}

function connectedAssignmentInput(householdToken) {
  return {
    tenantId: 'bank_1',
    experimentId: 'connected_growth_01',
    householdToken,
    holdoutPct: 10,
    standalonePct: 45,
    connectedPct: 45,
    salt: SALT,
    decisionProtocolId: 'merrill_growth_protocol_v1',
    evidenceClass: 'sandbox',
    assignedAt: ASSIGNED_AT,
    authorization: {
      scopeId: 'scope_consumer_wealth_01',
      approvedAt: '2026-06-15T00:00:00.000Z',
      expiresAt: '2026-12-31T00:00:00.000Z',
      businessLines: ['wealth', 'consumer'],
      signalClasses: ['deposit_behavior', 'wealth_relationship'],
    },
  };
}

function connectedMeasurementFixture(perArm) {
  const assignments = [];
  const outcomes = [];
  const exposures = [];
  for (const [arm, amount] of [['holdout', 1000], ['standalone', 1200], ['connected', 1500]]) {
    for (let index = 0; index < perArm; index += 1) {
      const assignment = {
        ...assignConnectedExpansionExperiment(connectedAssignmentInput(`tok_${arm}_${String(index).padStart(8, '0')}`)),
        arm,
      };
      assignments.push(assignment);
      outcomes.push(outcomeFor(assignment, amount, '2026-08-01T00:00:00.000Z', 'net_new_assets'));
      exposures.push(exposureFor(assignment));
    }
  }
  return { assignments, outcomes, exposures };
}

function exposureFor(assignment) {
  return {
    contract_version: '1.0',
    event_id: `exp_${assignment.householdToken}`,
    tenant_id: assignment.tenantId,
    experiment_id: assignment.experimentId,
    household_token: assignment.householdToken,
    arm: assignment.arm,
    decision_evaluated: assignment.arm !== 'holdout',
    action_delivered: assignment.arm !== 'holdout',
    connected_data_used: assignment.arm === 'connected',
    authorization_scope_id: assignment.authorizationScopeId,
    decision_protocol_id: assignment.decisionProtocolId,
    occurred_at: '2026-07-02T00:00:00.000Z',
  };
}

function outcomeFor(assignment, amount, occurredAt, metric = 'deposit_retained') {
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
      ...(assignment.design === 'connected_incrementality' ? {
        design: assignment.design,
        authorization_scope_id: assignment.authorizationScopeId,
        decision_protocol_id: assignment.decisionProtocolId,
      } : {}),
    },
    value: { metric, amount, currency: 'USD' },
    source_system: 'deposit_core',
    source_record_id: null,
    reason_code: null,
  };
}

function fakeDb(state) {
  state.exposures ??= [];
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
          arm: params[4], experiment_design: params[5], holdout_pct: params[6], standalone_pct: params[7],
          connected_pct: params[8], bucket: params[9], evidence_class: params[10], assigned_at: new Date(params[11]),
          authorization_scope_id: params[12], authorization_approved_at: params[13] ? new Date(params[13]) : null,
          authorization_expires_at: params[14] ? new Date(params[14]) : null,
          authorized_business_lines: params[15] ? JSON.parse(params[15]) : null,
          authorized_signal_classes: params[16] ? JSON.parse(params[16]) : null,
          decision_protocol_id: params[17],
        };
        state.assignments.push(row);
        return { rows: [row] };
      }
      if (sql.includes('SELECT * FROM experiment_assignments')) {
        const rows = state.assignments.filter((row) => (
          row.tenant_id === params[0]
          && row.experiment_id === params[1]
          && (params.length < 3 || row.household_token === params[2])
        ));
        return { rows };
      }
      if (sql.includes('INSERT INTO outcome_events')) {
        if (state.outcomes.some((row) => row.tenant_id === params[0] && row.event_id === params[1])) return { rows: [] };
        const row = { tenant_id: params[0], event_id: params[1], experiment_id: params[2], payload: params[17] };
        state.outcomes.push(row);
        return { rows: [row] };
      }
      if (sql.includes('SELECT * FROM outcome_events') && sql.includes('event_id = $2')) {
        return { rows: state.outcomes.filter((row) => row.tenant_id === params[0] && row.event_id === params[1]) };
      }
      if (sql.includes('SELECT payload FROM outcome_events')) {
        return { rows: state.outcomes.filter((row) => row.tenant_id === params[0] && row.experiment_id === params[1]) };
      }
      if (sql.includes('INSERT INTO connected_exposure_events')) {
        if (state.exposures.some((row) => row.tenant_id === params[0] && row.event_id === params[1])) return { rows: [] };
        const row = { tenant_id: params[0], event_id: params[1], experiment_id: params[2], payload: params[10], decision_protocol_id: params[11] };
        state.exposures.push(row);
        return { rows: [row] };
      }
      if (sql.includes('SELECT * FROM connected_exposure_events')) {
        return { rows: state.exposures.filter((row) => row.tenant_id === params[0] && row.event_id === params[1]) };
      }
      if (sql.includes('SELECT payload FROM connected_exposure_events')) {
        return { rows: state.exposures.filter((row) => row.tenant_id === params[0] && row.experiment_id === params[1]) };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
}
