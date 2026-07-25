// Validate and load a Growth Play demonstration export.
//
// The export carries what a set of experts actually did: the households they saw, and the
// ones they acted on. It initializes a parameter vector (see parameter-fit.mjs) so a play
// starts near a workable command instead of cold.
//
// Three rules here are not expressible in the JSON schema and are the ones that decide
// whether a fit means anything:
//
//   1. Exposure. A household the expert never saw is not a decline. Only exposed cases are
//      scoreable; unexposed ones are carried for coverage reporting and excluded from the fit.
//   2. Action integrity. Every action must reference an exposed case in the same export, and
//      must fall inside the declared window.
//   3. Evidence class. A vector fitted from synthetic or sandbox behaviour is not an
//      initialization for a production pilot, and the class follows the loaded result so
//      downstream reporting cannot lose it.

import assert from 'node:assert/strict';

const EVIDENCE_CLASSES = new Set(['synthetic', 'sandbox', 'sanctioned']);
const HOUSEHOLD_TOKEN = /^tok_[A-Za-z0-9_-]{8,120}$/;
const EXPERT_TOKEN = /^exp_[A-Za-z0-9_-]{6,120}$/;
const DIRECT_PII_KEY = /^(first_name|last_name|full_name|customer_name|customer_email|email|customer_phone|phone|customer_address|street_address|address|ssn|pan|cvv|card_number|account_number|routing_number|advisor_name|banker_name|employee_name|employee_id|employee_email|nmls_id)$/;

export function validateDemonstration(demonstration) {
  assert.ok(demonstration && typeof demonstration === 'object' && !Array.isArray(demonstration), 'demonstration must be an object');
  assert.equal(demonstration.contract_version, '1.0', 'demonstration contract_version must be 1.0');
  assertText(demonstration.demonstration_id, 'demonstration_id', 8, 128);
  assertText(demonstration.tenant_id, 'tenant_id', 2, 64);
  assertIdentifier(demonstration.growth_play_id, 'growth_play_id');
  assertIdentifier(demonstration.business_line, 'business_line');
  assert.ok(EVIDENCE_CLASSES.has(demonstration.evidence_class), 'evidence_class must be synthetic, sandbox, or sanctioned');
  assertIsoDate(demonstration.captured_at, 'captured_at');
  assertNoDirectPiiKeys(demonstration);

  const window = demonstration.window;
  assert.ok(window && typeof window === 'object', 'window is required');
  assertIsoDate(window.from, 'window.from');
  assertIsoDate(window.to, 'window.to');
  const windowFrom = Date.parse(window.from);
  const windowTo = Date.parse(window.to);
  assert.ok(windowFrom < windowTo, 'window.from must precede window.to');

  const selection = demonstration.expert_selection;
  assert.ok(selection && typeof selection === 'object', 'expert_selection is required');
  assertText(selection.basis, 'expert_selection.basis', 8, 300);
  assert.ok(
    Number.isInteger(selection.expert_count) && selection.expert_count >= 1,
    'expert_selection.expert_count must be a positive integer',
  );

  assert.ok(Array.isArray(demonstration.cases) && demonstration.cases.length > 0, 'cases are required');
  const byHousehold = new Map();
  for (const item of demonstration.cases) {
    assert.ok(HOUSEHOLD_TOKEN.test(item?.household_token ?? ''), `case household_token ${item?.household_token} must be an opaque tok_ identifier`);
    assert.ok(!byHousehold.has(item.household_token), `duplicate case for ${item.household_token}`);
    assert.equal(typeof item.exposed, 'boolean', `case ${item.household_token} must declare exposed`);
    assert.ok(Array.isArray(item.records) && item.records.length > 0, `case ${item.household_token} requires records`);
    const recordIds = new Set();
    for (const record of item.records) {
      assertText(record?.transaction_id, 'record.transaction_id', 2, 256);
      assert.ok(!recordIds.has(record.transaction_id), `duplicate record ${record.transaction_id} in ${item.household_token}`);
      recordIds.add(record.transaction_id);
      assertText(record.source_system, 'record.source_system', 2, 80);
      assertText(record.rail, 'record.rail', 2, 64);
      assert.ok(Number.isFinite(record.amount), `record ${record.transaction_id} amount must be finite`);
      assertIsoDate(record.occurred_at, 'record.occurred_at');
    }
    for (const policy of item.policies ?? []) {
      assertText(policy?.policy_id, 'policy.policy_id', 2, 128);
      assert.ok(['clear', 'block', 'review'].includes(policy.verdict), `policy ${policy.policy_id} verdict is invalid`);
    }
    byHousehold.set(item.household_token, item);
  }

  assert.ok(Array.isArray(demonstration.actions) && demonstration.actions.length > 0, 'actions are required');
  const actedHouseholds = new Set();
  const experts = new Set();
  for (const action of demonstration.actions) {
    assert.ok(HOUSEHOLD_TOKEN.test(action?.household_token ?? ''), `action household_token ${action?.household_token} must be an opaque tok_ identifier`);
    assert.ok(EXPERT_TOKEN.test(action?.expert_token ?? ''), `action expert_token ${action?.expert_token} must be an opaque exp_ identifier`);
    assertIdentifier(action.action_id, 'action.action_id');
    assertIsoDate(action.acted_at, 'action.acted_at');
    const acted = Date.parse(action.acted_at);
    assert.ok(acted >= windowFrom && acted <= windowTo, `action on ${action.household_token} falls outside the declared window`);

    const item = byHousehold.get(action.household_token);
    assert.ok(item, `action references ${action.household_token}, which has no case in this export`);
    // An action on an unexposed household is a contradiction: the export claims the expert
    // never saw a household they demonstrably acted on.
    assert.equal(item.exposed, true, `action on ${action.household_token} contradicts exposed: false`);
    actedHouseholds.add(action.household_token);
    experts.add(action.expert_token);
  }
  assert.ok(
    experts.size <= selection.expert_count,
    `export contains ${experts.size} distinct experts but declares ${selection.expert_count}`,
  );

  const exposed = [...byHousehold.values()].filter((item) => item.exposed);
  assert.ok(exposed.length > 0, 'at least one exposed case is required');
  assert.ok(
    actedHouseholds.size < exposed.length,
    'every exposed household was acted on, so the export contains no negative examples to fit against',
  );

  return {
    demonstrationId: demonstration.demonstration_id,
    tenantId: demonstration.tenant_id,
    growthPlayId: demonstration.growth_play_id,
    businessLine: demonstration.business_line,
    evidenceClass: demonstration.evidence_class,
    window: { from: window.from, to: window.to },
    expertSelection: { ...selection },
    distinctExperts: experts.size,
    totalCases: byHousehold.size,
    exposedCases: exposed.length,
    unexposedCases: byHousehold.size - exposed.length,
    actedHouseholds: actedHouseholds.size,
    selectionRate: round(actedHouseholds.size / exposed.length),
  };
}

// Returns the scoreable inputs for parameter-fit.mjs. Only exposed cases are returned: fitting
// against households the expert never saw would count non-exposure as a decline.
export function loadDemonstration(demonstration, { growthPlay } = {}) {
  const summary = validateDemonstration(demonstration);
  if (growthPlay) {
    assert.equal(
      summary.growthPlayId, growthPlay.growth_play_id,
      `demonstration is for ${summary.growthPlayId}, not ${growthPlay.growth_play_id}`,
    );
    assert.equal(
      summary.businessLine, growthPlay.business_line,
      `demonstration business line ${summary.businessLine} does not match the Growth Play`,
    );
    const approved = new Set(growthPlay.actions.map((action) => action.action_id));
    for (const action of demonstration.actions) {
      assert.ok(approved.has(action.action_id), `demonstrated action ${action.action_id} is not approved by the Growth Play`);
    }
  }

  const acted = new Set(demonstration.actions.map((action) => action.household_token));
  const cases = demonstration.cases
    .filter((item) => item.exposed)
    .map((item) => ({
      householdToken: item.household_token,
      records: item.records,
      policies: item.policies ?? [],
    }));

  return {
    summary,
    cases,
    demonstratedHouseholds: [...acted],
    // Carried so a fit report cannot present a synthetic demonstration as pilot-ready.
    evidenceClass: summary.evidenceClass,
    fitUsableForProduction: summary.evidenceClass === 'sanctioned',
  };
}

function assertNoDirectPiiKeys(value) {
  const stack = [value];
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== 'object') continue;
    for (const [key, child] of Object.entries(item)) {
      assert.ok(!DIRECT_PII_KEY.test(key.toLowerCase()), `direct identity field ${key} is prohibited in a demonstration export`);
      if (child && typeof child === 'object') stack.push(child);
    }
  }
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{1,127}$/.test(value), `${label} is invalid`);
}

function assertText(value, label, minimum, maximum) {
  assert.ok(
    typeof value === 'string' && value.trim().length >= minimum && value.trim().length <= maximum,
    `${label} is invalid`,
  );
}

function assertIsoDate(value, label) {
  assert.ok(typeof value === 'string' && !Number.isNaN(Date.parse(value)), `${label} must be an ISO date-time`);
}

function round(value) {
  return Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}
