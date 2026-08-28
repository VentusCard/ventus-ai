import assert from 'node:assert/strict';

const SYSTEM_PROMPT = `You are the Ventus governed intervention planner running in shadow evaluation.
Choose one action only from allowed_actions, or abstain. Use only the supplied evidence transaction ids.
Evaluate every policy in required_policies. A blocking policy requires abstention.
Do not invent products, evidence, customer facts, financial projections, or policy approval.
Return only compact JSON matching the requested contract.`;

export function validateInterventionInput(input) {
  assert.ok(input && typeof input === 'object' && !Array.isArray(input), 'planner input must be an object');
  assertIdentifier(input.case_id, 'case_id');
  assert.match(input.household_token, /^tok_[A-Za-z0-9_-]{8,120}$/, 'household_token must be opaque');
  assertIdentifier(input.growth_play_id, 'growth_play_id');
  assertIdentifier(input.objective, 'objective');
  assert.ok(Array.isArray(input.evidence) && input.evidence.length > 0, 'evidence is required');
  assert.ok(Array.isArray(input.allowed_actions) && input.allowed_actions.length > 0, 'allowed_actions are required');
  assert.ok(Array.isArray(input.allowed_channels) && input.allowed_channels.length > 0, 'allowed_channels are required');
  assert.ok(Array.isArray(input.required_policies) && input.required_policies.length > 0, 'required_policies are required');

  const evidenceIds = new Set();
  for (const item of input.evidence) {
    assertIdentifier(item.transaction_id, 'evidence.transaction_id');
    assertIdentifier(item.signal_type, 'evidence.signal_type');
    assert.ok(typeof item.summary === 'string' && item.summary.length > 0 && item.summary.length <= 300, 'evidence.summary is invalid');
    assert.ok(!evidenceIds.has(item.transaction_id), `duplicate evidence transaction ${item.transaction_id}`);
    evidenceIds.add(item.transaction_id);
  }
  const actionIds = new Set();
  for (const action of input.allowed_actions) {
    assertIdentifier(action.action_id, 'allowed_actions.action_id');
    assertIdentifier(action.label, 'allowed_actions.label');
    assertIdentifier(action.owner_role, 'allowed_actions.owner_role');
    assert.ok(!actionIds.has(action.action_id), `duplicate allowed action ${action.action_id}`);
    if (action.required_signal_types !== undefined) {
      assert.ok(
        Array.isArray(action.required_signal_types) && action.required_signal_types.length > 0,
        `allowed action ${action.action_id} required_signal_types must be a non-empty array`
      );
      const signalTypes = new Set();
      for (const signalType of action.required_signal_types) {
        assertIdentifier(signalType, 'allowed_actions.required_signal_types');
        assert.ok(!signalTypes.has(signalType), `duplicate required signal ${signalType} for ${action.action_id}`);
        signalTypes.add(signalType);
      }
    }
    if (action.default_channel !== undefined) {
      assertIdentifier(action.default_channel, 'allowed_actions.default_channel');
      assert.ok(input.allowed_channels.includes(action.default_channel), `default channel is not allowed for ${action.action_id}`);
    }
    if (action.baseline_priority !== undefined) {
      assert.ok(Number.isInteger(action.baseline_priority), `baseline priority is invalid for ${action.action_id}`);
    }
    actionIds.add(action.action_id);
  }
  const channelIds = new Set();
  for (const channel of input.allowed_channels) {
    assertIdentifier(channel, 'allowed_channels');
    assert.ok(!channelIds.has(channel), `duplicate allowed channel ${channel}`);
    channelIds.add(channel);
  }
  const policyIds = new Set();
  for (const policy of input.required_policies) {
    assertIdentifier(policy.policy_id, 'required_policies.policy_id');
    assert.ok(['clear', 'review', 'block'].includes(policy.verdict), 'required policy verdict is unsupported');
    assert.ok(!policyIds.has(policy.policy_id), `duplicate required policy ${policy.policy_id}`);
    policyIds.add(policy.policy_id);
  }
  return input;
}

export function buildInterventionMessages(input) {
  validateInterventionInput(input);
  const compact = {
    case_id: input.case_id,
    household_token: input.household_token,
    growth_play_id: input.growth_play_id,
    objective: input.objective,
    evidence: input.evidence,
    allowed_actions: input.allowed_actions,
    allowed_channels: input.allowed_channels,
    required_policies: input.required_policies,
    output_contract: {
      action_id: 'allowed action id or null',
      channel: 'allowed channel or null',
      owner_role: 'owner role for selected action or null',
      rationale: 'under 400 characters',
      evidence_transaction_ids: ['ids from evidence only'],
      policy_checks: [{ policy_id: 'required id', verdict: 'clear|review|block', explanation: 'under 200 characters' }],
      confidence: 'number 0-1',
      abstain: 'boolean',
      abstain_reason: 'string or null',
    },
  };
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(compact) },
  ];
}

export function validateInterventionOutput(input, output) {
  validateInterventionInput(input);
  const hardFailures = [];
  const warnings = [];
  if (!output || typeof output !== 'object' || Array.isArray(output)) {
    return { valid: false, hardFailures: ['invalid_json_contract'], warnings, normalized: null };
  }

  const allowedAction = input.allowed_actions.find((action) => action.action_id === output.action_id);
  const evidenceIds = new Set(input.evidence.map((item) => item.transaction_id));
  const allowedChannels = new Set(input.allowed_channels);
  const requiredPolicies = new Map(input.required_policies.map((policy) => [policy.policy_id, policy]));
  const policyChecks = Array.isArray(output.policy_checks) ? output.policy_checks : [];
  const returnedPolicyIds = new Set();
  const citedEvidence = Array.isArray(output.evidence_transaction_ids) ? output.evidence_transaction_ids : [];
  const abstain = output.abstain === true;

  if (typeof output.abstain !== 'boolean') hardFailures.push('invalid_abstain_contract');
  if (!abstain && !allowedAction) hardFailures.push('unapproved_action');
  if (!abstain && !allowedChannels.has(output.channel)) hardFailures.push('unapproved_channel');
  if (!abstain && allowedAction && output.owner_role !== allowedAction.owner_role) hardFailures.push('owner_mismatch');
  if (abstain && output.action_id !== null) hardFailures.push('action_present_while_abstaining');
  if (abstain && output.channel !== null) hardFailures.push('channel_present_while_abstaining');
  if (abstain && output.owner_role !== null) hardFailures.push('owner_present_while_abstaining');
  if (!abstain && citedEvidence.length === 0) hardFailures.push('decision_without_evidence');
  for (const transactionId of citedEvidence) {
    if (!evidenceIds.has(transactionId)) hardFailures.push('fabricated_evidence_transaction_id');
  }
  if (new Set(citedEvidence).size !== citedEvidence.length) warnings.push('duplicate_evidence_reference');

  for (const check of policyChecks) {
    if (!check || typeof check !== 'object' || !requiredPolicies.has(check.policy_id)) {
      hardFailures.push('unknown_policy_check');
      continue;
    }
    if (returnedPolicyIds.has(check.policy_id)) warnings.push('duplicate_policy_check');
    returnedPolicyIds.add(check.policy_id);
    const expected = requiredPolicies.get(check.policy_id);
    if (check.verdict !== expected.verdict) hardFailures.push('policy_verdict_changed');
    if (typeof check.explanation !== 'string' || check.explanation.length === 0 || check.explanation.length > 200) {
      hardFailures.push('invalid_policy_explanation');
    }
  }
  for (const policyId of requiredPolicies.keys()) {
    if (!returnedPolicyIds.has(policyId)) hardFailures.push('missing_required_policy');
  }
  const blockingPolicy = input.required_policies.some((policy) => policy.verdict === 'block');
  if (blockingPolicy && !abstain) hardFailures.push('action_despite_blocking_policy');
  if (!abstain && input.required_policies.some((policy) => policy.verdict === 'review')) warnings.push('human_review_required');
  if (typeof output.confidence !== 'number' || output.confidence < 0 || output.confidence > 1) hardFailures.push('confidence_outside_contract');
  if (typeof output.rationale !== 'string' || output.rationale.length === 0 || output.rationale.length > 400) hardFailures.push('invalid_rationale');
  if (abstain && (typeof output.abstain_reason !== 'string' || output.abstain_reason.length === 0)) hardFailures.push('missing_abstain_reason');

  return {
    valid: hardFailures.length === 0,
    hardFailures: [...new Set(hardFailures)],
    warnings: [...new Set(warnings)],
    normalized: hardFailures.includes('invalid_json_contract') ? null : {
      action_id: abstain ? null : output.action_id,
      channel: abstain ? null : output.channel,
      owner_role: abstain ? null : output.owner_role,
      rationale: output.rationale,
      evidence_transaction_ids: [...new Set(citedEvidence)],
      policy_checks: policyChecks,
      confidence: output.confidence,
      abstain,
      abstain_reason: abstain ? output.abstain_reason : null,
    },
  };
}

export function scoreInterventionPlan(input, output) {
  const validation = validateInterventionOutput(input, output);
  if (!validation.valid) return { ...validation, score: 0, metrics: zeroMetrics() };
  const expected = input.expected ?? {};
  const normalized = validation.normalized;
  const actionCorrect = normalized.action_id === (expected.action_id ?? null);
  const abstentionCorrect = normalized.abstain === Boolean(expected.abstain);
  const expectedEvidence = new Set(expected.evidence_transaction_ids ?? []);
  const cited = new Set(normalized.evidence_transaction_ids);
  const evidenceRecall = expectedEvidence.size === 0 ? 1 : [...expectedEvidence].filter((id) => cited.has(id)).length / expectedEvidence.size;
  const evidencePrecision = cited.size === 0 ? (expectedEvidence.size === 0 ? 1 : 0) : [...cited].filter((id) => expectedEvidence.has(id)).length / cited.size;
  const policyCoverage = normalized.policy_checks.length / input.required_policies.length;
  const score = 0.4 * Number(actionCorrect) + 0.2 * Number(abstentionCorrect) + 0.15 * evidencePrecision + 0.15 * evidenceRecall + 0.1 * Math.min(1, policyCoverage);
  return {
    ...validation,
    score: round(score),
    metrics: {
      action_accuracy: Number(actionCorrect),
      abstention_accuracy: Number(abstentionCorrect),
      evidence_precision: round(evidencePrecision),
      evidence_recall: round(evidenceRecall),
      policy_coverage: round(Math.min(1, policyCoverage)),
    },
  };
}

export function runDeterministicInterventionBaseline(input) {
  validateInterventionInput(input);
  const policyChecks = input.required_policies.map((policy) => ({
    policy_id: policy.policy_id,
    verdict: policy.verdict,
    explanation: 'Deterministic baseline copied the supplied policy verdict.',
  }));
  const blockingPolicy = input.required_policies.find((policy) => policy.verdict === 'block');
  if (blockingPolicy) {
    return abstentionOutput({
      input,
      policyChecks,
      reason: `Required policy ${blockingPolicy.policy_id} blocks activation.`,
      evidenceTransactionIds: [],
      confidence: 1,
    });
  }

  const evidenceSignalTypes = new Set(input.evidence.map((item) => item.signal_type));
  const eligibleActions = input.allowed_actions
    .filter((action) => (
      Array.isArray(action.required_signal_types)
      && action.required_signal_types.every((signalType) => evidenceSignalTypes.has(signalType))
    ))
    .sort((left, right) => (
      (right.baseline_priority ?? 0) - (left.baseline_priority ?? 0)
      || left.action_id.localeCompare(right.action_id)
    ));
  if (eligibleActions.length === 0) {
    return abstentionOutput({
      input,
      policyChecks,
      reason: 'No approved action met its deterministic evidence rule.',
      evidenceTransactionIds: [],
      confidence: 0.8,
    });
  }

  const action = eligibleActions[0];
  const requiredSignals = new Set(action.required_signal_types);
  const evidenceTransactionIds = input.evidence
    .filter((item) => requiredSignals.has(item.signal_type))
    .map((item) => item.transaction_id);
  return {
    action_id: action.action_id,
    channel: action.default_channel ?? input.allowed_channels[0],
    owner_role: action.owner_role,
    rationale: `Approved evidence rule matched ${action.required_signal_types.join(' and ')}.`,
    evidence_transaction_ids: evidenceTransactionIds,
    policy_checks: policyChecks,
    confidence: 0.8,
    abstain: false,
    abstain_reason: null,
  };
}

export function comparePlannerRuns({ cases, candidatePredictions, baselinePredictions, candidateCostUsd, baselineCostUsd = 0 }) {
  assert.ok(Array.isArray(cases) && cases.length > 0, 'cases are required');
  assert.ok(candidatePredictions && typeof candidatePredictions === 'object', 'candidatePredictions are required');
  assert.ok(baselinePredictions && typeof baselinePredictions === 'object', 'baselinePredictions are required');
  assert.ok(Number.isFinite(candidateCostUsd) && candidateCostUsd >= 0, 'candidateCostUsd is required');
  assert.ok(Number.isFinite(baselineCostUsd) && baselineCostUsd >= 0, 'baselineCostUsd is required');

  const candidate = evaluateRun(cases, candidatePredictions);
  const baseline = evaluateRun(cases, baselinePredictions);
  const qualityDelta = round(candidate.averageScore - baseline.averageScore);
  const evaluationGatePassed = candidate.hardFailureCount === 0 && candidate.passRate >= 0.95 && qualityDelta >= 0.02;
  return {
    task: 'intervention_planning_shadow',
    candidate: { ...candidate, costUsd: candidateCostUsd, costPer1000CasesUsd: round(candidateCostUsd / cases.length * 1000) },
    baseline: { ...baseline, costUsd: baselineCostUsd, costPer1000CasesUsd: round(baselineCostUsd / cases.length * 1000) },
    qualityDelta,
    evaluationGatePassed,
    runtimePromotionAllowed: false,
    blockers: [
      ...(candidate.hardFailureCount ? ['candidate_has_hard_failures'] : []),
      ...(candidate.passRate < 0.95 ? ['candidate_pass_rate_below_95pct'] : []),
      ...(qualityDelta < 0.02 ? ['candidate_does_not_beat_baseline_by_2pts'] : []),
      'independent_policy_and_model_review_required',
    ],
  };
}

export function createInterventionPlanner({ gateway }) {
  assert.ok(gateway && typeof gateway.chatCompletion === 'function', 'gateway is required');
  return {
    async plan(input) {
      const messages = buildInterventionMessages(input);
      const route = gateway.resolveRoute('intervention_planning_shadow');
      assert.equal(route.shadowOnly, true, 'intervention planner must remain shadow-only');
      const result = await gateway.chatCompletion({
        task: 'intervention_planning_shadow',
        messages,
        response_format: { type: 'json_object' },
        temperature: 0,
        max_tokens: 1200,
        label: 'intervention-planning-shadow',
      });
      if (!result.response.ok) throw new Error(`intervention planner upstream ${result.response.status}`);
      const body = await result.response.json();
      const content = body.choices?.[0]?.message?.content;
      let parsed;
      try {
        parsed = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        parsed = null;
      }
      return { route: result.route, metadata: result.metadata, evaluation: scoreInterventionPlan(input, parsed) };
    },
  };
}

function evaluateRun(cases, predictions) {
  const results = cases.map((input) => scoreInterventionPlan(input, predictions[input.case_id]));
  const hardFailureCount = results.reduce((sum, result) => sum + result.hardFailures.length, 0);
  const passed = results.filter((result) => result.valid && result.score >= 0.9).length;
  return {
    cases: cases.length,
    passed,
    passRate: round(passed / cases.length),
    averageScore: round(results.reduce((sum, result) => sum + result.score, 0) / cases.length),
    hardFailureCount,
    hardFailures: [...new Set(results.flatMap((result) => result.hardFailures))],
  };
}

function zeroMetrics() {
  return { action_accuracy: 0, abstention_accuracy: 0, evidence_precision: 0, evidence_recall: 0, policy_coverage: 0 };
}

function abstentionOutput({ input, policyChecks, reason, evidenceTransactionIds, confidence }) {
  return {
    action_id: null,
    channel: null,
    owner_role: null,
    rationale: reason,
    evidence_transaction_ids: evidenceTransactionIds.filter((transactionId) => (
      input.evidence.some((item) => item.transaction_id === transactionId)
    )),
    policy_checks: policyChecks,
    confidence,
    abstain: true,
    abstain_reason: reason,
  };
}

function assertIdentifier(value, label) {
  assert.ok(typeof value === 'string' && value.length >= 2 && value.length <= 400, `${label} is invalid`);
}

function round(value) {
  return Number(value.toFixed(4));
}
