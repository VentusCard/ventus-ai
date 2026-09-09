// backend/shared/platform/gemini.mjs
// Gemini 429 rate-limit utilities + fire-and-forget CloudWatch metric publish.
// Pure helpers below; CloudWatch SDK is lazy-imported on first 429 hit so
// functions that never trip a rate limit pay zero cold-start cost.

const METRIC_NAMESPACE = 'Ventus/Pipeline';
const METRIC_NAME = 'GeminiRateLimitHit';

export function is429(status) {
  return status === 429;
}

// Distinct 429 backoff: 10s, 20s, 40s with 30% jitter, capped at 60s.
// attempt is 0-indexed (0 → ~10s, 1 → ~20s, 2 → ~40s, 3+ → 60s).
export function get429DelayMs(attempt) {
  const base = 10000 * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * base;
  return Math.min(base + jitter, 60000);
}

// Parses an HTTP Retry-After header (seconds or HTTP-date) into ms.
// Returns null if the header is missing/unparseable. Capped at 60s so a
// misbehaving upstream can't park a Lambda for its whole timeout window.
export function parseRetryAfterMs(retryAfter) {
  if (!retryAfter) return null;
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, 60000);
  }
  const ts = Date.parse(retryAfter);
  if (!Number.isFinite(ts)) return null;
  return Math.min(Math.max(ts - Date.now(), 0), 60000);
}

let cachedClient = null;
let cachedCommandCtor = null;

// Fire-and-forget. Never throws. Logs a warning if publish fails so the
// retry loop is never blocked by CloudWatch.
export async function publishGeminiRateLimit(functionName) {
  try {
    if (!cachedClient || !cachedCommandCtor) {
      const mod = await import('@aws-sdk/client-cloudwatch');
      cachedClient =
        cachedClient ||
        new mod.CloudWatchClient({
          region: process.env.AWS_REGION || 'us-east-2',
        });
      cachedCommandCtor = mod.PutMetricDataCommand;
    }
    // Publish two datapoints in one call: one with FunctionName dimension for
    // per-Lambda dashboards, one without so the aggregate alarm in
    // ventus-existing-infra-stack.ts (no dimensionsMap) can match it.
    await cachedClient.send(
      new cachedCommandCtor({
        Namespace: METRIC_NAMESPACE,
        MetricData: [
          {
            MetricName: METRIC_NAME,
            Dimensions: [
              {
                Name: 'FunctionName',
                Value: functionName || 'unknown',
              },
            ],
            Unit: 'Count',
            Value: 1,
          },
          {
            MetricName: METRIC_NAME,
            Unit: 'Count',
            Value: 1,
          },
        ],
      })
    );
  } catch (err) {
    console.warn(
      `[GEMINI] Failed to publish ${METRIC_NAME} metric: ${err?.message || err}`
    );
  }
}
