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
const modelEvaluationSql = readFileSync(
  resolve('../backend/sql/model-evaluation-runs.sql'),
  'utf8'
);
const gatewaySource = readFileSync(
  resolve('../backend/shared/platform/model-gateway.mjs'),
  'utf8'
);
const interventionPlannerSource = readFileSync(
  resolve('../backend/shared/pilot/intervention-planner.mjs'),
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
// The classification lambda delegates the routed model call to the shared
// classify-core module, so the merchant_classification task string lives there.
const classifyCoreSource = readFileSync(
  resolve('../backend/shared/pipeline/classify-core.mjs'),
  'utf8'
);

const requiredTasks = [
  'merchant_classification',
  'life_event_detection',
  'life_event_detection_shadow',
  'risk_detection',
  'travel_detection',
  'enrichment_judge',
  'intervention_planning_shadow',
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
  routing.tasks.life_event_detection_shadow.shadow_only,
  true,
  'life event shadow route should start shadow-only'
);
assert.equal(
  routing.tasks.life_event_detection_shadow.compares_to,
  'life_event_detection',
  'life event shadow route should declare the production route it compares to'
);
assert.equal(
  routing.tasks.enrichment_judge.shadow_only,
  true,
  'judge task should start shadow-only so it cannot alter production output'
);
assert.equal(
  routing.tasks.intervention_planning_shadow.shadow_only,
  true,
  'intervention planner should remain shadow-only'
);
assert.equal(
  routing.tasks.intervention_planning_shadow.compares_to,
  'deterministic_intervention_baseline',
  'intervention planner should declare its deterministic baseline'
);

assert.equal(rubric.version, 1, 'model evaluation rubric should be versioned');
for (const task of requiredTasks.filter((item) => !item.endsWith('_shadow'))) {
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
assert.ok(
  rubric.tasks?.intervention_planning_shadow,
  'intervention planner should define an evaluation rubric'
);
assert.match(
  interventionPlannerSource,
  /fabricated_evidence_transaction_id/,
  'intervention planner should reject fabricated evidence lineage'
);
assert.match(
  interventionPlannerSource,
  /action_despite_blocking_policy/,
  'intervention planner should enforce blocking policy verdicts'
);
assert.match(
  interventionPlannerSource,
  /runtimePromotionAllowed:\s*false/,
  'intervention planner should remain ineligible for runtime promotion'
);
assert.match(
  interventionPlannerSource,
  /comparePlannerRuns/,
  'intervention planner should compare candidates with a baseline'
);
assert.equal(
  rubric.gates.production_route_change.requires_shadow_runs,
  true,
  'production model route changes should require shadow runs first'
);
assert.match(
  modelEvaluationSql,
  /CREATE TABLE IF NOT EXISTS model_evaluation_runs/,
  'model evaluation ledger schema should exist'
);
assert.match(
  modelEvaluationSql,
  /cost_estimate_usd/,
  'model evaluation ledger should capture cost estimates'
);
assert.match(
  modelEvaluationSql,
  /judge_verdict/,
  'model evaluation ledger should capture judge verdicts'
);
assert.match(
  gatewaySource,
  /logModelInvocationAudit/,
  'gateway should emit non-client-facing invocation audit metadata'
);
assert.match(
  gatewaySource,
  /invocation_id:[\s\S]*task:[\s\S]*provider:[\s\S]*model:[\s\S]*duration_ms:/,
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
  classifyCoreSource,
  /task:\s*'merchant_classification'/,
  'classification should route through the merchant_classification task'
);

console.log(
  `Model gateway readiness ok: ${requiredTasks.length} routed task(s), production tasks migrated, judge and intervention planner shadow-only`
);
