import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = resolve(infraRoot, 'security', 'tracing-readiness-baseline.json');
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));

const requiredLambdaFunctions = [
  'ventus-api',
  'ventus-ingest-transactions',
  'ventus-classify-transactions',
  'ventus-analyze-pillar-transactions',
  'ventus-analyze-lifestyle-signals',
  'ventus-risk-detection',
  'ventus-travel-detection',
];
const requiredAccessLogFields = [
  'requestId',
  'extendedRequestId',
  'httpMethod',
  'resourcePath',
  'status',
  'integrationLatency',
];

assert.equal(baseline.region, 'us-east-2', 'tracing baseline should target us-east-2');
assert.equal(
  baseline.api_gateway.rest_api_id,
  '97rgw0xjbj',
  'tracing baseline should target the known API Gateway REST API'
);
assert.equal(baseline.api_gateway.stage, 'prod', 'tracing baseline should target the prod stage');
assert.equal(
  baseline.api_gateway.target_tracing_enabled,
  true,
  'API Gateway target posture should enable tracing'
);
assert.equal(
  baseline.api_gateway.target_access_logs_enabled,
  true,
  'API Gateway target posture should enable access logs'
);
assert.equal(
  baseline.target_lambda_tracing_mode,
  'Active',
  'Lambda target tracing mode should be Active'
);

for (const functionName of requiredLambdaFunctions) {
  assert.ok(
    baseline.lambda_functions.includes(functionName),
    `${functionName} should be included in the tracing baseline`
  );
}

for (const field of requiredAccessLogFields) {
  assert.ok(
    baseline.api_gateway.required_access_log_fields.includes(field),
    `API Gateway access logs should include ${field}`
  );
}

assert.equal(
  baseline.target_posture.do_not_log_secret_values_or_raw_bank_payloads,
  true,
  'tracing posture should explicitly forbid logging secrets or raw bank payloads'
);
assert.equal(
  baseline.target_posture.use_sampling_before_high_volume_production_rollout,
  true,
  'tracing posture should require sampling review before high-volume rollout'
);

console.log(
  `Tracing readiness baseline checks passed: ${baseline.lambda_functions.length} Lambda function(s), API stage ${baseline.api_gateway.stage}`
);
