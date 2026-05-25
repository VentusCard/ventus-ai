import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { afterEach, test } from 'node:test';
import { buildWebhookBody, createWebhookDispatcher, recordWebhookDelivery } from './webhooks.mjs';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function createMockDb() {
  const queries = [];

  return {
    queries,
    async query(sql, params) {
      queries.push({ sql, params });
      if (sql.includes('FROM webhook_registrations')) {
        return {
          rows: [
            {
              webhook_id: 'wh_test_1',
              url: 'https://partner.example.test/webhook',
              secret: 'test-secret',
            },
          ],
        };
      }
      return { rows: [] };
    },
  };
}

test('createWebhookDispatcher records delivered webhook attempts', async () => {
  const db = createMockDb();
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 204 };
  };

  const fireWebhook = createWebhookDispatcher({ maxRetries: 1 });
  await fireWebhook(db, 'bank_123', 'batch_complete', { batch_id: 'batch_123' });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://partner.example.test/webhook');
  assert.equal(requests[0].options.headers['x-ventus-event'], 'batch_complete');
  assert.ok(requests[0].options.headers['x-ventus-delivery-id']);
  assert.match(requests[0].options.headers['x-ventus-signature'], /^[a-f0-9]{64}$/);

  const payload = JSON.parse(requests[0].options.body);
  assert.equal(payload.event, 'batch_complete');
  assert.equal(payload.bank_id, 'bank_123');
  assert.equal(payload.delivery_id, requests[0].options.headers['x-ventus-delivery-id']);

  const deliveryInsert = db.queries.find((query) =>
    query.sql.includes('INSERT INTO webhook_delivery_attempts')
  );
  assert.ok(deliveryInsert);
  assert.equal(deliveryInsert.params[1], 'wh_test_1');
  assert.equal(deliveryInsert.params[2], 'bank_123');
  assert.equal(deliveryInsert.params[3], 'batch_complete');
  assert.deepEqual(JSON.parse(deliveryInsert.params[6]).data, { batch_id: 'batch_123' });
  assert.equal(deliveryInsert.params[8], 1);
  assert.equal(deliveryInsert.params[9], 'delivered');
  assert.equal(deliveryInsert.params[10], 204);
});

test('createWebhookDispatcher records failed webhook attempts after retries', async () => {
  const db = createMockDb();
  globalThis.fetch = async () => ({ ok: false, status: 503 });

  const fireWebhook = createWebhookDispatcher({
    maxRetries: 2,
    includeUrlInFinalError: false,
  });
  await fireWebhook(db, 'bank_123', 'batch_complete', { batch_id: 'batch_123' });

  const deliveryInsert = db.queries.find((query) =>
    query.sql.includes('INSERT INTO webhook_delivery_attempts')
  );
  assert.ok(deliveryInsert);
  assert.equal(deliveryInsert.params[8], 2);
  assert.equal(deliveryInsert.params[9], 'failed');
  assert.equal(deliveryInsert.params[10], 503);
  assert.equal(deliveryInsert.params[11], 'HTTP 503');
});

test('buildWebhookBody creates replayable payload envelopes', () => {
  const body = buildWebhookBody({
    eventType: 'risk_detected',
    bankId: 'bank_123',
    deliveryId: '00000000-0000-4000-8000-000000000000',
    payload: {
      schema_version: 1,
      customer_id: 'cust_123',
      batch_id: 'batch_1',
      risk_factor_ids: ['99'],
    },
  });
  const parsed = JSON.parse(body);

  assert.equal(parsed.event, 'risk_detected');
  assert.equal(parsed.data.schema_version, 1);
  assert.deepEqual(parsed.data.risk_factor_ids, ['99']);
  assert.ok(parsed.timestamp);
});

test('buildWebhookBody supports thin trip_detected id payloads', () => {
  const body = buildWebhookBody({
    eventType: 'trip_detected',
    bankId: 'bank_123',
    deliveryId: '00000000-0000-4000-8000-000000000002',
    payload: {
      schema_version: 1,
      customer_id: 'cust_abc',
      batch_id: 'batch_xyz',
      trip_ids: ['trip_cust_paris_20250101'],
    },
  });
  const parsed = JSON.parse(body);

  assert.equal(parsed.event, 'trip_detected');
  assert.deepEqual(parsed.data.trip_ids, ['trip_cust_paris_20250101']);
});

test('buildWebhookBody supports batch_partial outcome payloads', () => {
  const body = buildWebhookBody({
    eventType: 'batch_partial',
    bankId: 'bank_123',
    deliveryId: '00000000-0000-4000-8000-000000000003',
    payload: {
      schema_version: 1,
      batch_id: 'batch_xyz',
      customers_processed: 3,
      customers_failed: 1,
      status: 'partial',
    },
  });
  const parsed = JSON.parse(body);

  assert.equal(parsed.event, 'batch_partial');
  assert.equal(parsed.data.status, 'partial');
  assert.equal(parsed.data.customers_failed, 1);
});

test('buildWebhookBody supports batch_stuck payloads', () => {
  const body = buildWebhookBody({
    eventType: 'batch_stuck',
    bankId: 'bank_123',
    deliveryId: '00000000-0000-4000-8000-000000000004',
    payload: {
      schema_version: 1,
      batch_id: 'batch_xyz',
      status: 'stuck',
      sla_minutes: 20,
      stuck_customer_ids: ['cust_a'],
      customers_complete: 5,
      customers_failed: 0,
      customers_in_progress: 1,
    },
  });
  const parsed = JSON.parse(body);

  assert.equal(parsed.event, 'batch_stuck');
  assert.equal(parsed.data.status, 'stuck');
  assert.deepEqual(parsed.data.stuck_customer_ids, ['cust_a']);
});

test('buildWebhookBody supports thin life_event_detected id payloads', () => {
  const body = buildWebhookBody({
    eventType: 'life_event_detected',
    bankId: 'bank_star',
    deliveryId: '00000000-0000-4000-8000-000000000001',
    payload: {
      schema_version: 1,
      customer_id: 'cust_abc',
      batch_id: 'batch_xyz',
      life_event_ids: ['101', '102'],
    },
  });
  const parsed = JSON.parse(body);

  assert.equal(parsed.event, 'life_event_detected');
  assert.equal(parsed.data.schema_version, 1);
  assert.deepEqual(parsed.data.life_event_ids, ['101', '102']);
  assert.equal(parsed.data.behavioral_signal_ids, undefined);
});

test('buildWebhookBody timestamp is ISO 8601 UTC', () => {
  const body = buildWebhookBody({
    eventType: 'batch_complete',
    bankId: 'bank_123',
    deliveryId: '00000000-0000-4000-8000-000000000001',
    payload: {},
  });
  const { timestamp } = JSON.parse(body);
  assert.match(timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/);
  assert.ok(!isNaN(new Date(timestamp).getTime()));
});

test('createWebhookDispatcher sends correct HMAC-SHA256 signature', async () => {
  const db = createMockDb();
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200 };
  };

  const fireWebhook = createWebhookDispatcher({ maxRetries: 1 });
  await fireWebhook(db, 'bank_123', 'batch_complete', { batch_id: 'batch_123' });

  assert.equal(requests.length, 1);
  const { body, headers } = requests[0].options;
  const expected = crypto.createHmac('sha256', 'test-secret').update(body).digest('hex');
  assert.equal(headers['x-ventus-signature'], expected);
});

test('createWebhookDispatcher omits signature header when webhook has no secret', async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200 };
  };

  const unsignedDb = {
    queries: [],
    async query(sql, params) {
      this.queries.push({ sql, params });
      if (sql.includes('FROM webhook_registrations')) {
        return {
          rows: [
            {
              webhook_id: 'wh_unsigned',
              url: 'https://partner.example.test/webhook',
              secret: null,
            },
          ],
        };
      }
      return { rows: [] };
    },
  };

  const fireWebhook = createWebhookDispatcher({ maxRetries: 1 });
  await fireWebhook(unsignedDb, 'bank_123', 'batch_complete', { batch_id: 'batch_123' });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.headers['x-ventus-signature'], undefined);
});

test('createWebhookDispatcher persists correct payload SHA-256', async () => {
  const db = createMockDb();
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, status: 200 };
  };

  const fireWebhook = createWebhookDispatcher({ maxRetries: 1 });
  await fireWebhook(db, 'bank_123', 'batch_complete', { batch_id: 'batch_123' });

  const deliveryInsert = db.queries.find((q) =>
    q.sql.includes('INSERT INTO webhook_delivery_attempts')
  );
  assert.ok(deliveryInsert);
  const expectedSha256 = crypto
    .createHash('sha256')
    .update(requests[0].options.body)
    .digest('hex');
  assert.equal(deliveryInsert.params[5], expectedSha256);
});

test('recordWebhookDelivery persists replay_of_delivery_id', async () => {
  const insertedParams = [];
  const db = {
    async query(sql, params) {
      if (sql.includes('INSERT INTO webhook_delivery_attempts')) insertedParams.push(params);
      return { rows: [] };
    },
  };

  await recordWebhookDelivery({
    db,
    deliveryId: 'new-delivery-id',
    webhookId: 'wh_test_1',
    bankId: 'bank_123',
    eventType: 'batch_complete',
    targetUrl: 'https://partner.example.test/webhook',
    payloadBody: '{"event":"batch_complete"}',
    attemptCount: 1,
    status: 'delivered',
    statusCode: 200,
    replayOfDeliveryId: 'original-delivery-id',
  });

  assert.equal(insertedParams.length, 1);
  assert.equal(insertedParams[0][7], 'original-delivery-id');
});

test('recordWebhookDelivery stores null for non-replay deliveries', async () => {
  const insertedParams = [];
  const db = {
    async query(sql, params) {
      if (sql.includes('INSERT INTO webhook_delivery_attempts')) insertedParams.push(params);
      return { rows: [] };
    },
  };

  await recordWebhookDelivery({
    db,
    deliveryId: 'delivery-id',
    webhookId: 'wh_test_1',
    bankId: 'bank_123',
    eventType: 'batch_complete',
    targetUrl: 'https://partner.example.test/webhook',
    payloadBody: '{"event":"batch_complete"}',
    attemptCount: 1,
    status: 'delivered',
    statusCode: 200,
  });

  assert.equal(insertedParams[0][7], null);
});
