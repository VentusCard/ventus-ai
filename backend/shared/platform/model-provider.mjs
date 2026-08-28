import {
  is429,
  get429DelayMs,
  parseRetryAfterMs,
  publishGeminiRateLimit,
} from './gemini.mjs';

const DEFAULT_TRANSIENT_STATUSES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

export function getRetryDelayMs(attempt, { baseDelayMs = 1000, maxDelayMs = 15000 } = {}) {
  const base = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.5 * base;
  return Math.min(base + jitter, maxDelayMs);
}

export function isTransientModelProviderStatus(status) {
  return DEFAULT_TRANSIENT_STATUSES.has(status);
}

export async function fetchGeminiChatCompletion({
  apiKey,
  body,
  label,
  maxRetries = 3,
  baseDelayMs = 1000,
  maxDelayMs = 15000,
}) {
  if (!apiKey) throw new Error('Gemini API key is required');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = getRetryDelayMs(attempt - 1, { baseDelayMs, maxDelayMs });
      console.log(`[${label}] Gemini retry ${attempt} (delay: ${Math.round(delay)}ms)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (res.ok || !isTransientModelProviderStatus(res.status) || attempt === maxRetries) {
        return res;
      }

      const err = await res.text().catch(() => '');
      if (is429(res.status)) {
        console.warn(`[GEMINI] 429 rate limit hit on ${label}`);
        publishGeminiRateLimit(process.env.AWS_LAMBDA_FUNCTION_NAME);
        const retryAfterMs = parseRetryAfterMs(res.headers.get('retry-after'));
        const delay = retryAfterMs ?? get429DelayMs(attempt);
        console.log(`[${label}] Gemini 429 backoff ${Math.round(delay)}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        console.warn(`[${label}] Transient Gemini ${res.status}: ${err.slice(0, 200)}`);
      }
    } catch (error) {
      if (attempt === maxRetries) throw error;
      console.warn(`[${label}] Transient Gemini exception: ${error.message}`);
    }
  }

  throw new Error(`[${label}] Gemini request exhausted retries`);
}
