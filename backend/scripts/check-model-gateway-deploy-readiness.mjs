import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const checklist = readFileSync(
  resolve('../docs/runbooks/model-gateway-deployment-checklist.md'),
  'utf8'
);
const packageJson = JSON.parse(readFileSync(resolve('../backend/package.json'), 'utf8'));
const gatewaySource = readFileSync(resolve('../backend/shared/platform/model-gateway.mjs'), 'utf8');
const evaluationSql = readFileSync(
  resolve('../backend/sql/model-evaluation-runs.sql'),
  'utf8'
);

for (const functionName of [
  'ventus-classify-transactions',
  'ventus-analyze-lifestyle-signals',
  'ventus-risk-detection',
  'ventus-travel-detection',
]) {
  assert.match(
    checklist,
    new RegExp(functionName),
    `deployment checklist should name ${functionName}`
  );
}

for (const requiredPhrase of [
  'Do not apply `backend/sql/model-evaluation-runs.sql` unless shadow evaluation persistence is being enabled.',
  'MODEL_GATEWAY_AUDIT_LOGS=false',
  '[MODEL_GATEWAY_AUDIT]',
  'does not log prompts, transaction contents, tool outputs, or model response content',
]) {
  assert.ok(
    checklist.includes(requiredPhrase),
    `deployment checklist missing: ${requiredPhrase}`
  );
}

assert.equal(
  packageJson.scripts['check:model-gateway'],
  'node ./scripts/check-model-gateway-readiness.mjs',
  'package.json should expose check:model-gateway'
);
assert.match(
  gatewaySource,
  /MODEL_GATEWAY_AUDIT_LOGS === 'false'/,
  'gateway should support audit log disable switch'
);
assert.match(
  evaluationSql,
  /CREATE TABLE IF NOT EXISTS model_evaluation_runs/,
  'evaluation SQL should create model_evaluation_runs'
);

console.log('Model gateway deploy readiness checklist ok');
