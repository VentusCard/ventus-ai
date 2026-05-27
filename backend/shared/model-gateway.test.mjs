import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createModelGateway,
  loadModelRoutingConfig,
  resolveModelRoute,
} from './model-gateway.mjs';

test('model routing config defines required enrichment tasks', () => {
  const config = loadModelRoutingConfig();

  for (const task of [
    'merchant_classification',
    'life_event_detection',
    'risk_detection',
    'travel_detection',
    'enrichment_judge',
  ]) {
    const route = resolveModelRoute(config, task);
    assert.equal(route.provider, 'gemini');
    assert.match(route.model, /^gemini-/);
    assert.equal(route.apiKeySecretField, 'GEMINI_API_KEY');
  }

  assert.equal(resolveModelRoute(config, 'enrichment_judge').shadowOnly, true);
});

test('model gateway sends OpenAI-compatible chat completions with route metadata', async () => {
  const calls = [];
  const gateway = createModelGateway({
    getSecrets: async () => ({ GEMINI_API_KEY: 'test-key' }),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ choices: [] }), { status: 200 });
    },
  });

  const result = await gateway.chatCompletion({
    task: 'merchant_classification',
    messages: [{ role: 'user', content: 'classify this' }],
    tools: [{ type: 'function', function: { name: 'classify_batch' } }],
    tool_choice: { type: 'function', function: { name: 'classify_batch' } },
  });

  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions'
  );
  assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key');

  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'gemini-2.5-flash');
  assert.equal(body.temperature, 0);
  assert.equal(body.max_tokens, 4000);
  assert.equal(body.messages[0].content, 'classify this');
  assert.equal(result.metadata.task, 'merchant_classification');
  assert.equal(result.metadata.provider, 'gemini');
  assert.equal(result.response.status, 200);
});

test('model gateway fails closed when a routed secret field is missing', async () => {
  const gateway = createModelGateway({
    getSecrets: async () => ({}),
    fetchImpl: async () => {
      throw new Error('fetch should not be called');
    },
  });

  await assert.rejects(
    () =>
      gateway.chatCompletion({
        task: 'risk_detection',
        messages: [{ role: 'user', content: 'risk' }],
      }),
    /Missing model API key field GEMINI_API_KEY/
  );
});
