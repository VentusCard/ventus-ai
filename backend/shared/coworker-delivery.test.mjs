import assert from 'node:assert/strict';
import test from 'node:test';
import { createCoworkerDeliveryService } from './coworker-delivery.mjs';

function repository() {
  const records = [];
  return {
    records,
    async reserve(request) {
      const record = { delivery_id: `dlv_${String(records.length + 1).padStart(24, '0')}`, status: 'pending', ...request };
      records.push(record);
      return { shouldDeliver: true, record };
    },
    async complete(input) {
      const record = records.find((item) => item.delivery_id === input.deliveryId);
      Object.assign(record, { status: input.status, external_receipt_id: input.externalReceiptId ?? null, external_receipt_url: input.externalReceiptUrl ?? null });
      return { record };
    },
  };
}

const input = {
  tenantId: 'bank_1', channel: 'outlook', role: 'growth_play_owner', sessionId: 'session_1',
  title: 'One decision needs attention', counts: { needsReview: 1, routed: 0, outcomesObserved: 0 },
  decisionIds: ['decision_001'], mapping: { configuration: { recipient: 'ops@example.com' } },
};

test('Coworker sends Outlook only from server-held credentials', async () => {
  const repo = repository();
  const calls = [];
  const service = createCoworkerDeliveryService({
    getSecrets: async () => ({ microsoftTenantId: 'tenant', microsoftClientId: 'id', microsoftClientSecret: 'secret', microsoftSenderUserId: 'sender@example.com' }),
    deliveryRepository: repo,
    consoleBaseUrl: 'https://dev.example.com',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return url.includes('/token')
        ? new Response(JSON.stringify({ access_token: 'token' }), { status: 200 })
        : new Response('', { status: 202 });
    },
  });
  const result = await service.deliver(input);
  assert.equal(result.receipt.status, 'delivered');
  assert.equal(calls.length, 2);
  assert.match(calls[1].url, /graph\.microsoft\.com/);
  assert.doesNotMatch(calls[1].options.body, /secret/);
  assert.match(calls[1].options.body, /https:\/\/dev\.example\.com\/app\/briefings/);
});

test('Coworker fails closed when Slack is not configured', async () => {
  const repo = repository();
  const service = createCoworkerDeliveryService({ getSecrets: async () => ({}), deliveryRepository: repo });
  const result = await service.deliver({ ...input, channel: 'slack', mapping: { configuration: { channelId: 'C123456' } } });
  assert.equal(result.receipt.status, 'failed');
  assert.equal(repo.records[0].external_receipt_id, null);
});

test('Coworker health checks authenticate without sending a briefing', async () => {
  const calls = [];
  const service = createCoworkerDeliveryService({
    getSecrets: async () => ({ slackBotToken: 'xoxb-test' }),
    deliveryRepository: repository(),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ ok: true, team_id: 'T1' }), { status: 200 });
    },
  });
  const result = await service.testConnection({ channel: 'slack', mapping: { configuration: { channelId: 'C123456' } } });
  assert.equal(result.check, 'authenticated_identity_read');
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /auth\.test/);
});
