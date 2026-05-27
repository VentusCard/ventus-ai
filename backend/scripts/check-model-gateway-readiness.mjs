import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routing = JSON.parse(
  readFileSync(resolve('../backend/config/model-routing.json'), 'utf8')
);
const rubric = JSON.parse(
  readFileSync(
    resolve('../backend/fixtures/evaluation/model-evaluation-rubric.json'),
    'utf8'
  )
);
const gatewaySource = readFileSync(
  resolve('../backend/shared/model-gateway.mjs'),
  'utf8'
);
const riskDetectionSource = readFileSync(
  resolve('../backend/functions/ventus-risk-detection/index.mjs'),
  'utf8'
);
const lifestyleSignalsSource = readFileSync(
  resolve('../backend/functions/ventus-analyze-lifestyle-signals/index.mjs'),
  'utf8'
);
const travelDetectionSource = readFileSync(
  resolve('../backend/functions/ventus-travel-detection/index.mjs'),
  'utf8'
);
const classificationSource = readFileSync(
  resolve('../backend/functions/ventus-classify-transactions/index.mjs'),
  'utf8'
);

const requiredTasks = [
  'merchant_classification',
  'life_event_detection',
  'risk_detection',
  'travel_detection',
  'enrichment_judge',
];

assert.equal(routing.version, 1, 'model routing config should be versioned');
assert.ok(routing.providers?.gemini, 'Gemini provider should remain configured');

for (const task of requiredTasks) {
  assert.ok(routing.tasks?.[task], `missing model task route: ${task}`);
  assert.ok(routing.tasks[task].provider, `${task} route missing provider`);
  assert.ok(routing.tasks[task].model, `${task} route missing model`);
  assert.equal(
    routing.providers[routing.tasks[task].provider]?.type,
    'openai_compatible',
    `${task} provider should use the gateway-compatible chat shape`
  );
}

assert.equal(
  routing.tasks.enrichment_judge.shadow_only,
  true,
  'judge task should start shadow-only so it cannot alter production output'
);

assert.equal(rubric.version, 1, 'model evaluation rubric should be versioned');
for (const task of requiredTasks) {
  assert.ok(rubric.tasks?.[task], `missing evaluation rubric for ${task}`);
  assert.ok(
    rubric.tasks[task].primary_metrics?.length > 0,
    `${task} should define primary metrics`
  );
  assert.ok(
    rubric.tasks[task].hard_failures?.length > 0,
    `${task} should define hard failure modes`
  );
}
assert.equal(
  rubric.gates.production_route_change.requires_shadow_runs,
  true,
  'production model route changes should require shadow runs first'
);
assert.match(
  gatewaySource,
  /metadata:\s*\{[\s\S]*provider:[\s\S]*model:[\s\S]*role:/,
  'gateway responses should expose task/provider/model metadata for audit and evals'
);
assert.match(
  riskDetectionSource,
  /createModelGateway/,
  'risk detection should use the shared model gateway'
);
assert.match(
  riskDetectionSource,
  /task:\s*'risk_detection'/,
  'risk detection should route through the risk_detection task'
);
assert.match(
  lifestyleSignalsSource,
  /createModelGateway/,
  'lifestyle signals should use the shared model gateway'
);
assert.match(
  lifestyleSignalsSource,
  /task:\s*'life_event_detection'/,
  'lifestyle signals should route through the life_event_detection task'
);
assert.match(
  travelDetectionSource,
  /createModelGateway/,
  'travel detection should use the shared model gateway'
);
assert.match(
  travelDetectionSource,
  /task:\s*'travel_detection'/,
  'travel detection should route through the travel_detection task'
);
assert.match(
  classificationSource,
  /createModelGateway/,
  'classification should use the shared model gateway'
);
assert.match(
  classificationSource,
  /task:\s*'merchant_classification'/,
  'classification should route through the merchant_classification task'
);

console.log(
  `Model gateway readiness ok: ${requiredTasks.length} routed task(s), production model tasks migrated, judge shadow-only`
);
