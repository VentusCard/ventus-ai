import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createWebhookDispatcher } from './webhooks.mjs';

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
  assert.equal(deliveryInsert.params[7], 'delivered');
  assert.equal(deliveryInsert.params[8], 204);
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
  assert.equal(deliveryInsert.params[6], 2);
  assert.equal(deliveryInsert.params[7], 'failed');
  assert.equal(deliveryInsert.params[8], 503);
  assert.equal(deliveryInsert.params[9], 'HTTP 503');
});
