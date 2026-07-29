import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildDeliveryReservation,
  createConnectorDeliveryRepository,
} from './connector-delivery.mjs';

const REQUESTED_AT = '2026-07-12T12:00:00.000Z';
const COMPLETED_AT = '2026-07-12T12:00:02.000Z';

test('delivery reservation identity is deterministic across payload key order', () => {
  const first = buildDeliveryReservation(request({ payload: { task: 'review', priority: 'high' } }));
  const second = buildDeliveryReservation(request({ payload: { priority: 'high', task: 'review' } }));
  assert.equal(first.deliveryId, second.deliveryId);
  assert.equal(first.requestHash, second.requestHash);
  assert.match(first.deliveryId, /^dlv_[a-f0-9]{24}$/);
  assert.match(first.requestHash, /^[a-f0-9]{64}$/);
});

test('duplicate reservation blocks a second downstream write and flags pending reconciliation', async () => {
  const state = { receipts: [], queries: [] };
  const repository = createConnectorDeliveryRepository({ getDB: async () => fakeDb(state) });
  const first = await repository.reserve(request());
  const duplicate = await repository.reserve(request());
  assert.equal(first.inserted, true);
  assert.equal(first.shouldDeliver, true);
  assert.equal(duplicate.inserted, false);
  assert.equal(duplicate.shouldDeliver, false);
  assert.equal(duplicate.replayed, true);
  assert.equal(duplicate.reconciliationRequired, true);
  assert.equal(state.receipts.length, 1);
  assert.equal(state.queries.filter((entry) => entry.sql.includes('app.current_tenant_id')).length, 2);
});

test('idempotency key reuse with changed content hard-fails', async () => {
  const state = { receipts: [], queries: [] };
  const repository = createConnectorDeliveryRepository({ getDB: async () => fakeDb(state) });
  await repository.reserve(request());
  await assert.rejects(
    () => repository.reserve(request({ payload: { task: 'different' } })),
    /idempotency key reused for a different delivery request/,
  );
});

test('terminal delivery receipt is idempotent and cannot change outcome', async () => {
  const state = { receipts: [], queries: [] };
  const repository = createConnectorDeliveryRepository({ getDB: async () => fakeDb(state) });
  const reservation = await repository.reserve(request());
  const result = {
    tenantId: 'bank_1',
    deliveryId: reservation.record.delivery_id,
    status: 'delivered',
    sessionId: 'session_complete_1',
    externalReceiptId: 'salesforce_task_001',
    externalReceiptUrl: 'https://salesforce.example.test/task/001',
    completedAt: COMPLETED_AT,
  };
  const completed = await repository.complete(result);
  const replay = await repository.complete(result);
  assert.equal(completed.updated, true);
  assert.equal(replay.updated, false);
  assert.equal(replay.record.status, 'delivered');
  await assert.rejects(
    () => repository.complete({
      ...result,
      status: 'failed',
      externalReceiptId: null,
      externalReceiptUrl: null,
      errorCode: 'DOWNSTREAM_REJECTED',
    }),
    /already terminal with a different status/,
  );
});

function request(overrides = {}) {
  return {
    tenantId: 'bank_1',
    idempotencyKey: 'decision_001_salesforce_task',
    connector: 'salesforce',
    destination: 'Salesforce FSC Task',
    decisionId: 'decision_001',
    actionId: 'warm_wealth_referral',
    sessionId: 'session_request_1',
    payload: { task: 'review', priority: 'high' },
    requestedAt: REQUESTED_AT,
    ...overrides,
  };
}

function fakeDb(state) {
  return {
    async connect() {},
    async end() {},
    async query(sql, params = []) {
      state.queries.push({ sql, params });
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql) || sql.includes('set_config')) return { rows: [] };
      if (sql.includes('INSERT INTO connector_delivery_receipts')) {
        const existing = state.receipts.find((row) => row.tenant_id === params[0] && row.idempotency_key === params[2]);
        if (existing) return { rows: [] };
        const row = {
          tenant_id: params[0], delivery_id: params[1], idempotency_key: params[2], connector: params[3],
          destination: params[4], decision_id: params[5], action_id: params[6], requested_by_session_id: params[7],
          request_hash: params[8], status: 'pending', payload: params[9], requested_at: params[10],
          completed_by_session_id: null, external_receipt_id: null, external_receipt_url: null,
          error_code: null, completed_at: null,
        };
        state.receipts.push(row);
        return { rows: [row] };
      }
      if (sql.includes('WHERE tenant_id = $1 AND idempotency_key = $2')) {
        return { rows: state.receipts.filter((row) => row.tenant_id === params[0] && row.idempotency_key === params[1]) };
      }
      if (sql.includes('UPDATE connector_delivery_receipts')) {
        const row = state.receipts.find((item) => item.tenant_id === params[0] && item.delivery_id === params[1]);
        if (!row || row.status !== 'pending') return { rows: [] };
        row.status = params[2];
        row.completed_by_session_id = params[3];
        row.external_receipt_id = params[4];
        row.external_receipt_url = params[5];
        row.error_code = params[6];
        row.completed_at = params[7];
        return { rows: [row] };
      }
      if (sql.includes('WHERE tenant_id = $1 AND delivery_id = $2')) {
        return { rows: state.receipts.filter((row) => row.tenant_id === params[0] && row.delivery_id === params[1]) };
      }
      throw new Error(`unexpected SQL: ${sql}`);
    },
  };
}
