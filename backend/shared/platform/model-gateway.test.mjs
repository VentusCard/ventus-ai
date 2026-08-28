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
    'intervention_planning_shadow',
  ]) {
    const route = resolveModelRoute(config, task);
    assert.equal(route.provider, 'gemini');
    assert.match(route.model, /^gemini-/);
    assert.equal(route.apiKeySecretField, 'GEMINI_API_KEY');
  }

  assert.equal(resolveModelRoute(config, 'enrichment_judge').shadowOnly, true);
  assert.equal(resolveModelRoute(config, 'intervention_planning_shadow').shadowOnly, true);

  const benchmarkRoute = resolveModelRoute(config, 'benchmark_enrichment');
  assert.equal(benchmarkRoute.provider, 'openrouter');
  assert.equal(benchmarkRoute.providerType, 'openai_compatible');
  assert.equal(benchmarkRoute.model, 'z-ai/glm-5.2');
  assert.equal(benchmarkRoute.apiKeySecretField, 'OPENROUTER_API_KEY');
  assert.equal(benchmarkRoute.shadowOnly, true);

  const signalRoute = resolveModelRoute(config, 'eval_enterprise_signal_extraction');
  assert.equal(signalRoute.provider, 'openrouter');
  assert.equal(signalRoute.model, 'openai/gpt-4.1-mini');
  assert.equal(signalRoute.role, 'enterprise_fast_structured_worker');

  const reasoningRoute = resolveModelRoute(config, 'eval_enterprise_opportunity_reasoning');
  assert.equal(reasoningRoute.provider, 'openrouter');
  assert.equal(reasoningRoute.model, 'z-ai/glm-5.2');
  assert.equal(reasoningRoute.role, 'enterprise_deep_reasoning_worker');

  const qaRoute = resolveModelRoute(config, 'eval_enterprise_opportunity_qa');
  assert.equal(qaRoute.provider, 'openrouter');
  assert.equal(qaRoute.model, 'openai/gpt-4.1-mini');
  assert.equal(qaRoute.role, 'enterprise_consistency_judge');
});

test('model gateway sends OpenAI-compatible chat completions with route metadata', async () => {
  const calls = [];
  const auditLogs = [];
  const gateway = createModelGateway({
    getSecrets: async () => ({ GEMINI_API_KEY: 'test-key' }),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ choices: [] }), { status: 200 });
    },
    logger: {
      info(...args) {
        auditLogs.push(args);
      },
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
  assert.equal(result.metadata.model, 'gemini-2.5-flash');
  assert.equal(result.metadata.ok, true);
  assert.equal(result.metadata.status, 200);
  assert.match(result.metadata.invocation_id, /^[0-9a-f-]{36}$/);
  assert.ok(result.metadata.duration_ms >= 0);
  assert.equal(result.response.status, 200);

  assert.equal(auditLogs.length, 1);
  assert.equal(auditLogs[0][0], '[MODEL_GATEWAY_AUDIT]');
  assert.equal(auditLogs[0][1].task, 'merchant_classification');
  assert.equal(auditLogs[0][1].ok, true);
  assert.doesNotMatch(JSON.stringify(auditLogs), /classify this/);
});

test('model gateway fails closed when a routed secret field is missing', async () => {
  const auditLogs = [];
  const gateway = createModelGateway({
    getSecrets: async () => ({}),
    fetchImpl: async () => {
      throw new Error('fetch should not be called');
    },
    logger: {
      info(...args) {
        auditLogs.push(args);
      },
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
  assert.equal(auditLogs.length, 1);
  assert.equal(auditLogs[0][1].task, 'risk_detection');
  assert.equal(auditLogs[0][1].ok, false);
  assert.equal(auditLogs[0][1].error, 'missing_api_key');
});

test('model gateway can route benchmark enrichment through OpenRouter', async () => {
  const calls = [];
  const gateway = createModelGateway({
    getSecrets: async () => ({ OPENROUTER_API_KEY: 'or-test-key' }),
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return new Response(JSON.stringify({ choices: [{ message: { content: '{}' } }] }), {
        status: 200,
      });
    },
    logger: { info() {} },
  });

  const result = await gateway.chatCompletion({
    task: 'benchmark_enrichment',
    messages: [{ role: 'user', content: 'benchmark this' }],
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer or-test-key');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'z-ai/glm-5.2');
  assert.equal(body.temperature, 0);
  assert.equal(body.max_tokens, 8000);
  assert.equal(result.metadata.provider, 'openrouter');
  assert.equal(result.metadata.model, 'z-ai/glm-5.2');
});
