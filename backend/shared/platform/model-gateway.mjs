import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  get429DelayMs,
  is429,
  parseRetryAfterMs,
  publishGeminiRateLimit,
} from './gemini.mjs';
import {
  getRetryDelayMs,
  isTransientModelProviderStatus,
} from './model-provider.mjs';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const defaultRoutingPath = resolve(backendRoot, 'config', 'model-routing.json');

export function loadModelRoutingConfig(path = defaultRoutingPath) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function resolveModelRoute(config, taskName, overrides = {}) {
  const task = config.tasks?.[taskName] || {};
  const providerName =
    overrides.provider || task.provider || config.default_provider;
  const provider = config.providers?.[providerName];
  if (!provider) throw new Error(`Unknown model provider: ${providerName}`);

  return {
    task: taskName,
    provider: providerName,
    providerType: provider.type,
    endpoint: overrides.endpoint || provider.endpoint,
    apiKeySecretField:
      overrides.apiKeySecretField || provider.api_key_secret_field,
    model: overrides.model || task.model || config.default_model,
    role: task.role || 'worker',
    temperature: overrides.temperature ?? task.temperature,
    maxTokens: overrides.maxTokens ?? task.max_tokens,
    shadowOnly: Boolean(task.shadow_only),
  };
}

export function createModelGateway({
  routingConfig = loadModelRoutingConfig(),
  getSecrets,
  fetchImpl = globalThis.fetch,
  functionName = process.env.AWS_LAMBDA_FUNCTION_NAME,
  logger = console,
} = {}) {
  if (!getSecrets) throw new Error('getSecrets is required');
  if (!fetchImpl) throw new Error('fetch implementation is required');

  return {
    resolveRoute(taskName, overrides) {
      return resolveModelRoute(routingConfig, taskName, overrides);
    },

    async chatCompletion({
      task,
      messages,
      tools,
      tool_choice,
      response_format,
      temperature,
      max_tokens,
      model,
      provider,
      label = task,
      maxRetries = 3,
      baseDelayMs = 1000,
      maxDelayMs = 15000,
      extraBody = {},
    }) {
      const route = resolveModelRoute(routingConfig, task, {
        model,
        provider,
        temperature,
        maxTokens: max_tokens,
      });
      const invocation = createModelInvocationMetadata({
        route,
        label,
        functionName,
      });
      const secrets = await getSecrets();
      const apiKey = secrets[route.apiKeySecretField];
      if (!apiKey) {
        finalizeModelInvocationMetadata(invocation, {
          ok: false,
          error: 'missing_api_key',
        });
        logModelInvocationAudit(logger, invocation);
        throw new Error(
          `Missing model API key field ${route.apiKeySecretField} for task ${task}`
        );
      }

      const body = {
        model: route.model,
        messages,
        ...(tools ? { tools } : {}),
        ...(tool_choice ? { tool_choice } : {}),
        ...(response_format ? { response_format } : {}),
        ...(route.temperature !== undefined
          ? { temperature: route.temperature }
          : {}),
        ...(route.maxTokens !== undefined ? { max_tokens: route.maxTokens } : {}),
        ...extraBody,
      };

      let response;
      try {
        response = await fetchOpenAiCompatible({
          route,
          apiKey,
          body,
          fetchImpl,
          label,
          maxRetries,
          baseDelayMs,
          maxDelayMs,
          functionName,
        });
        finalizeModelInvocationMetadata(invocation, {
          ok: response.ok,
          status: response.status,
        });
      } catch (error) {
        finalizeModelInvocationMetadata(invocation, {
          ok: false,
          error: error?.name || 'model_gateway_error',
        });
        throw error;
      } finally {
        logModelInvocationAudit(logger, invocation);
      }

      return {
        response,
        route,
        metadata: invocation,
      };
    },
  };
}

export function createModelInvocationMetadata({ route, label, functionName }) {
  const startedAtMs = Date.now();
  return {
    invocation_id: randomUUID(),
    task: route.task,
    provider: route.provider,
    model: route.model,
    role: route.role,
    shadow_only: route.shadowOnly,
    label,
    function_name: functionName || 'unknown',
    started_at: new Date(startedAtMs).toISOString(),
    completed_at: null,
    duration_ms: null,
    status: null,
    ok: null,
    error: null,
    audit_schema_version: 1,
    _started_at_ms: startedAtMs,
  };
}

export function finalizeModelInvocationMetadata(
  metadata,
  { ok, status = null, error = null }
) {
  const completedAtMs = Date.now();
  metadata.completed_at = new Date(completedAtMs).toISOString();
  metadata.duration_ms = Math.max(completedAtMs - metadata._started_at_ms, 0);
  metadata.status = status;
  metadata.ok = ok;
  metadata.error = error;
  delete metadata._started_at_ms;
  return metadata;
}

export function logModelInvocationAudit(logger, metadata) {
  if (process.env.MODEL_GATEWAY_AUDIT_LOGS === 'false') return;
  logger.info?.('[MODEL_GATEWAY_AUDIT]', metadata);
}

async function fetchOpenAiCompatible({
  route,
  apiKey,
  body,
  fetchImpl,
  label,
  maxRetries,
  baseDelayMs,
  maxDelayMs,
  functionName,
}) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = getRetryDelayMs(attempt - 1, { baseDelayMs, maxDelayMs });
      console.log(
        `[${label}] ${route.provider} retry ${attempt} (delay: ${Math.round(delay)}ms)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const response = await fetchImpl(route.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (
        response.ok ||
        !isTransientModelProviderStatus(response.status) ||
        attempt === maxRetries
      ) {
        return response;
      }

      const err = await response.text().catch(() => '');
      if (route.provider === 'gemini' && is429(response.status)) {
        console.warn(`[GEMINI] 429 rate limit hit on ${label}`);
        publishGeminiRateLimit(functionName);
        const retryAfterMs = parseRetryAfterMs(response.headers.get('retry-after'));
        const delay = retryAfterMs ?? get429DelayMs(attempt);
        console.log(`[${label}] Gemini 429 backoff ${Math.round(delay)}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.warn(
          `[${label}] Transient ${route.provider} ${response.status}: ${err.slice(0, 200)}`
        );
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.warn(
        `[${label}] Transient ${route.provider} exception: ${error.message}`
      );
    }
  }

  throw new Error(`[${label}] Model request exhausted retries`);
}
