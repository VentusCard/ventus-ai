import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GENESIS_HASH,
  buildDecisionOutcomeGraph,
  buildLedgerEvent,
  createDecisionLedgerRepository,
  verifyLedgerChain,
} from './decision-ledger.mjs';

const TS = '2026-07-01T00:00:00.000Z';

test('SHA-256 ledger chain detects payload and tenant tampering', () => {
  const first = buildLedgerEvent(draft('evt_1'), { sequenceNumber: 1 });
  const second = buildLedgerEvent(draft('evt_2', { action: 'Advisor referral' }), {
    sequenceNumber: 2,
    previousHash: first.eventHash,
  });
  assert.equal(first.previousHash, GENESIS_HASH);
  assert.equal(verifyLedgerChain([first, second]), true);
  assert.equal(verifyLedgerChain([first, { ...second, payload: { ...second.payload, action: 'Tampered' } }]), false);
  assert.equal(verifyLedgerChain([first, { ...second, tenantId: 'other_bank' }]), false);
});

test('repository serializes per tenant, deduplicates, and exports a verified chain', async () => {
  const state = [];
  const repository = createDecisionLedgerRepository({ getDB: async () => fakeDb(state) });
  const first = await repository.append(draft('evt_1'));
  const duplicate = await repository.append(draft('evt_1'));
  const second = await repository.append(draft('evt_2', { action: 'Advisor referral' }));
  const exported = await repository.exportTenant('bank_1');
  assert.equal(first.inserted, true);
  assert.equal(duplicate.inserted, false);
  assert.equal(second.record.sequence_number, 2);
  assert.equal(exported.verified, true);
  assert.equal(exported.events.length, 2);
  assert.ok(state.some((entry) => entry.sql.includes('pg_advisory_xact_lock')));
  const tenantContexts = state.filter((entry) => entry.sql.includes('app.current_tenant_id'));
  assert.equal(tenantContexts.length, 4);
  assert.ok(tenantContexts.every((entry) => entry.params[0] === 'bank_1'));
});

test('ledger idempotency key cannot hide changed event content', async () => {
  const state = [];
  const repository = createDecisionLedgerRepository({ getDB: async () => fakeDb(state) });
  await repository.append(draft('evt_stable'));
  await assert.rejects(
    () => repository.append(draft('evt_stable', { action: 'Changed action' })),
    /idempotency key reused for different event content/,
  );
});

test('outcome context resolves decision and activation from server evidence', async () => {
  const state = [];
  const repository = createDecisionLedgerRepository({ getDB: async () => fakeDb(state) });
  const base = {
    tenantId: 'bank_1',
    householdToken: 'tok_household_000001',
    growthPlayId: 'deposit-primacy-defense',
    policyVersion: null,
    occurredAt: TS,
  };
  await repository.append({
    ...base,
    idempotencyKey: 'case_1:assignment',
    eventType: 'counterfactual',
    status: 'confirmed',
    payload: {
      decision_id: 'decision_server_001', experiment_id: 'experiment_001',
      assignment_id: 'assignment_001', arm: 'treatment', decision_protocol_id: 'protocol_001',
    },
  });
  await repository.append({
    ...base,
    idempotencyKey: 'case_1:activation',
    eventType: 'activation',
    status: 'confirmed',
    payload: {
      decision_id: 'decision_server_001', activation_id: 'activation_server_001',
      delivery_status: 'delivered',
    },
  });
  const context = await repository.loadOutcomeContext({
    tenantId: 'bank_1', experimentId: 'experiment_001', householdToken: 'tok_household_000001',
  });
  assert.equal(context.decisionId, 'decision_server_001');
  assert.equal(context.activationId, 'activation_server_001');
  assert.equal(context.decisionProtocolId, 'protocol_001');
});

test('prepared decision is loaded from the tenant ledger by its server decision reference', async () => {
  const state = [];
  const repository = createDecisionLedgerRepository({ getDB: async () => fakeDb(state) });
  await repository.append(draft('case_review:decision', {
    decision_id: 'decision_review_001',
    decision_digest: 'a'.repeat(64),
  }));
  const prepared = await repository.loadPreparedDecision({
    tenantId: 'bank_1',
    decisionId: 'decision_review_001',
  });
  assert.equal(prepared.eventType, 'decision');
  assert.equal(prepared.payload.decision_id, 'decision_review_001');
  assert.equal(prepared.householdToken, 'tok_household_000001');
});

test('decision-outcome graph withholds effectiveness until enough outcomes exist', () => {
  const early = graphFixture(10);
  const earlyRow = buildDecisionOutcomeGraph({ ...early, minimumOutcomes: 30 })[0];
  assert.equal(earlyRow.evidenceStatus, 'insufficient_outcomes');
  assert.equal(earlyRow.meanObservedValue, null);
  assert.equal(earlyRow.causalClaimAllowed, false);

  const mature = graphFixture(40);
  const row = buildDecisionOutcomeGraph({ ...mature, minimumOutcomes: 30 })[0];
  assert.equal(row.evidenceStatus, 'descriptive_ready');
  assert.equal(row.decisions, 40);
  assert.equal(row.outcomesObserved, 40);
  assert.equal(row.positiveOutcomeRate, 0.75);
  assert.equal(row.meanObservedValue, 750);
  assert.deepEqual(row.topSignals[0], { signal: 'liquidity_event', count: 40 });
  assert.equal(row.causalClaimAllowed, false);
});

test('only confirmed decisions enter the learning graph', () => {
  const { decisionEvents, outcomeEvents } = graphFixture(1);
  const simulated = { ...decisionEvents[0], status: 'simulated' };
  assert.deepEqual(buildDecisionOutcomeGraph({ decisionEvents: [simulated], outcomeEvents }), []);
  const suppressed = { ...decisionEvents[0], status: 'suppressed' };
  assert.deepEqual(buildDecisionOutcomeGraph({ decisionEvents: [suppressed], outcomeEvents }), []);
  const failed = { ...decisionEvents[0], status: 'failed' };
  assert.deepEqual(buildDecisionOutcomeGraph({ decisionEvents: [failed], outcomeEvents }), []);
});

function draft(idempotencyKey, payloadOverrides = {}) {
  return {
    tenantId: 'bank_1',
    idempotencyKey,
    eventType: 'decision',
    householdToken: 'tok_household_000001',
    growthPlayId: 'liquidity-to-wealth',
    modelProvider: null,
    modelName: null,
    modelVersion: null,
    policyVersion: 'policy_1',
    status: 'confirmed',
    occurredAt: TS,
    payload: {
      decision_id: `decision_${idempotencyKey}`,
      cohort: 'new-liquidity-high-confidence',
      action: 'Warm advisor referral',
      channel: 'CEW',
      signal_types: ['liquidity_event', 'relationship_depth'],
      ...payloadOverrides,
    },
  };
}

function graphFixture(count) {
  const decisionEvents = [];
  const outcomeEvents = [];
  for (let index = 0; index < count; index += 1) {
    const decisionId = `decision_${index}`;
    decisionEvents.push({
      ...buildLedgerEvent({
        ...draft(`evt_${index}`),
        householdToken: `tok_household_${String(index).padStart(8, '0')}`,
        payload: { ...draft(`evt_${index}`).payload, decision_id: decisionId },
      }, { sequenceNumber: index + 1, previousHash: index === 0 ? GENESIS_HASH : 'a'.repeat(64) }),
      status: 'confirmed',
    });
    outcomeEvents.push({
      decision_id: decisionId,
      occurred_at: '2026-08-01T00:00:00.000Z',
      value: { metric: 'net_new_assets', amount: index % 4 === 0 ? 0 : 1000, currency: 'USD' },
    });
  }
  return { decisionEvents, outcomeEvents };
}

function fakeDb(entries) {
  return {
    async connect() {},
    async end() {},
    async query(sql, params = []) {
      entries.push({ sql, params });
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql) || sql.includes('pg_advisory_xact_lock') || sql.includes('set_config')) return { rows: [] };
      if (sql.includes('WHERE tenant_id = $1 AND idempotency_key = $2')) {
        return { rows: entries.filter((entry) => entry.row?.tenant_id === params[0] && entry.row?.idempotency_key === params[1]).map((entry) => entry.row) };
      }
      if (sql.includes("event_type = 'counterfactual'")) {
        const rows = entries
          .filter((entry) => entry.row?.tenant_id === params[0]
            && entry.row?.household_token === params[1]
            && entry.row?.event_type === 'counterfactual'
            && entry.row?.payload?.experiment_id === params[2])
          .map((entry) => ({ growth_play_id: entry.row.growth_play_id, payload: entry.row.payload }));
        return { rows: rows.slice(-1) };
      }
      if (sql.includes("event_type = 'activation'")) {
        const rows = entries
          .filter((entry) => entry.row?.tenant_id === params[0]
            && entry.row?.household_token === params[1]
            && entry.row?.event_type === 'activation'
            && entry.row?.payload?.decision_id === params[2])
          .map((entry) => ({ payload: entry.row.payload }));
        return { rows: rows.slice(-1) };
      }
      if (sql.includes("event_type = 'decision'") && sql.includes("payload->>'decision_id' = $2")) {
        const rows = entries
          .filter((entry) => entry.row?.tenant_id === params[0]
            && entry.row?.event_type === 'decision'
            && entry.row?.payload?.decision_id === params[1])
          .map((entry) => entry.row)
          .sort((a, b) => b.sequence_number - a.sequence_number);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('ORDER BY sequence_number DESC LIMIT 1')) {
        const rows = entries.filter((entry) => entry.row?.tenant_id === params[0]).map((entry) => entry.row).sort((a, b) => b.sequence_number - a.sequence_number);
        return { rows: rows.slice(0, 1) };
      }
      if (sql.includes('INSERT INTO decision_ledger_events')) {
        const row = {
          tenant_id: params[0], sequence_number: params[1], idempotency_key: params[2], event_type: params[3],
          household_token: params[4], growth_play_id: params[5], model_provider: params[6], model_name: params[7],
          model_version: params[8], policy_version: params[9], status: params[10], payload: params[11],
          previous_hash: params[12], event_hash: params[13], occurred_at: new Date(params[14]),
        };
        entries.at(-1).row = row;
        return { rows: [row] };
      }
      if (sql.includes('ORDER BY sequence_number ASC')) {
        return { rows: entries.filter((entry) => entry.row?.tenant_id === params[0]).map((entry) => entry.row).sort((a, b) => a.sequence_number - b.sequence_number) };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
}
