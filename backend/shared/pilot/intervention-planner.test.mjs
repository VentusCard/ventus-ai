import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildInterventionMessages,
  comparePlannerRuns,
  createInterventionPlanner,
  runDeterministicInterventionBaseline,
  scoreInterventionPlan,
  validateInterventionOutput,
} from './intervention-planner.mjs';

test('planner messages contain an opaque, closed-world decision contract', () => {
  const messages = buildInterventionMessages(clearCase());
  assert.equal(messages.length, 2);
  assert.match(messages[0].content, /Choose one action only from allowed_actions/);
  assert.match(messages[0].content, /Do not invent products, evidence/);
  assert.match(messages[1].content, /tok_household_000001/);
  assert.doesNotMatch(messages[1].content, /email|phone|street address/i);
});

test('valid plan selects an approved action with complete evidence and policy lineage', () => {
  const input = clearCase();
  const result = scoreInterventionPlan(input, validOutput(input));
  assert.equal(result.valid, true);
  assert.equal(result.score, 1);
  assert.equal(result.metrics.action_accuracy, 1);
  assert.equal(result.metrics.policy_coverage, 1);
});

test('planner hard-fails fabricated evidence and unapproved actions', () => {
  const input = clearCase();
  const output = {
    ...validOutput(input),
    action_id: 'invented_private_credit_fund',
    evidence_transaction_ids: ['tx_fabricated'],
  };
  const result = validateInterventionOutput(input, output);
  assert.equal(result.valid, false);
  assert.ok(result.hardFailures.includes('unapproved_action'));
  assert.ok(result.hardFailures.includes('fabricated_evidence_transaction_id'));
});

test('planner rejects ambiguous input taxonomies and malformed abstentions', () => {
  const input = clearCase();
  assert.throws(
    () => buildInterventionMessages({ ...input, allowed_channels: ['CEW', 'CEW'] }),
    /duplicate allowed channel CEW/
  );

  const malformed = validateInterventionOutput(blockedCase(), {
    ...validOutput(blockedCase()),
    owner_role: 'Relationship banker',
    policy_checks: blockedCase().required_policies.map((policy) => ({ ...policy, explanation: '' })),
  });
  assert.equal(malformed.valid, false);
  assert.ok(malformed.hardFailures.includes('owner_present_while_abstaining'));
  assert.ok(malformed.hardFailures.includes('invalid_policy_explanation'));
});

test('blocking policy forces a grounded abstention', () => {
  const input = blockedCase();
  const valid = scoreInterventionPlan(input, validOutput(input));
  assert.equal(valid.valid, true);
  assert.equal(valid.normalized.abstain, true);
  assert.equal(valid.score, 1);

  const unsafe = validateInterventionOutput(input, {
    ...validOutput(clearCase()),
    policy_checks: input.required_policies.map((policy) => ({ ...policy, explanation: 'Copied from policy context' })),
  });
  assert.equal(unsafe.valid, false);
  assert.ok(unsafe.hardFailures.includes('action_despite_blocking_policy'));
});

test('run comparison requires candidate to beat deterministic baseline and still blocks runtime promotion', () => {
  const cases = [clearCase(), blockedCase()];
  const candidate = Object.fromEntries(cases.map((input) => [input.case_id, validOutput(input)]));
  const baseline = {
    clear_case: validOutput(clearCase()),
    blocked_case: {
      ...validOutput(blockedCase()),
      rationale: 'Abstain pending policy review',
      evidence_transaction_ids: [],
      confidence: 0.6,
    },
  };
  // Make the baseline valid but miss the expected evidence on one case.
  baseline.blocked_case.evidence_transaction_ids = [];
  const report = comparePlannerRuns({
    cases,
    candidatePredictions: candidate,
    baselinePredictions: baseline,
    candidateCostUsd: 0.02,
  });
  assert.equal(report.candidate.hardFailureCount, 0);
  assert.equal(report.evaluationGatePassed, true);
  assert.equal(report.runtimePromotionAllowed, false);
  assert.ok(!report.blockers.includes('candidate_does_not_beat_baseline_by_2pts'));
  assert.ok(report.blockers.includes('independent_policy_and_model_review_required'));
});

test('deterministic baseline selects only an evidence-eligible action', () => {
  const input = clearCase();
  input.allowed_actions = input.allowed_actions.map((action, index) => ({
    ...action,
    required_signal_types: index === 0 ? ['liquidity_event', 'relationship_depth'] : ['advisor_relationship'],
    default_channel: index === 0 ? 'CEW' : 'Salesforce FSC',
    baseline_priority: index === 0 ? 100 : 50,
  }));
  const output = runDeterministicInterventionBaseline(input);
  assert.equal(output.action_id, 'warm_merrill_referral');
  assert.equal(output.channel, 'CEW');
  assert.deepEqual(output.evidence_transaction_ids, ['tx_001', 'tx_002']);
  assert.equal(validateInterventionOutput(input, output).valid, true);
});

test('deterministic baseline abstains on policy blocks or missing evidence rules', () => {
  const blocked = blockedCase();
  blocked.allowed_actions = blocked.allowed_actions.map((action) => ({
    ...action,
    required_signal_types: ['liquidity_event'],
  }));
  const blockedOutput = runDeterministicInterventionBaseline(blocked);
  assert.equal(blockedOutput.abstain, true);
  assert.match(blockedOutput.abstain_reason, /consent blocks activation/);

  const unmatched = clearCase();
  unmatched.allowed_actions = unmatched.allowed_actions.map((action) => ({
    ...action,
    required_signal_types: ['advisor_relationship'],
  }));
  const unmatchedOutput = runDeterministicInterventionBaseline(unmatched);
  assert.equal(unmatchedOutput.abstain, true);
  assert.match(unmatchedOutput.abstain_reason, /No approved action met/);
});

test('gateway planner refuses a non-shadow route and validates model output', async () => {
  const input = clearCase();
  const output = validOutput(input);
  const gateway = {
    resolveRoute(task) {
      return { task, shadowOnly: true };
    },
    async chatCompletion() {
      return {
        route: { task: 'intervention_planning_shadow', shadowOnly: true },
        metadata: { invocation_id: 'inv_1' },
        response: new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(output) } }] }), { status: 200 }),
      };
    },
  };
  const result = await createInterventionPlanner({ gateway }).plan(input);
  assert.equal(result.route.shadowOnly, true);
  assert.equal(result.evaluation.valid, true);

  const unsafeGateway = { ...gateway, resolveRoute: () => ({ shadowOnly: false }) };
  await assert.rejects(() => createInterventionPlanner({ gateway: unsafeGateway }).plan(input), /must remain shadow-only/);
});

function clearCase() {
  return {
    case_id: 'clear_case',
    household_token: 'tok_household_000001',
    growth_play_id: 'liquidity-to-wealth',
    objective: 'Convert evidenced liquidity into qualified NNA',
    evidence: [
      { transaction_id: 'tx_001', signal_type: 'liquidity_event', summary: 'Large retirement rollover landed on-bank' },
      { transaction_id: 'tx_002', signal_type: 'relationship_depth', summary: 'Long-standing deposit relationship with no advisor' },
    ],
    allowed_actions: [
      { action_id: 'warm_merrill_referral', label: 'Warm Merrill referral', owner_role: 'Relationship banker' },
      { action_id: 'advisor_review_only', label: 'Advisor review without outreach', owner_role: 'Merrill advisor' },
    ],
    allowed_channels: ['CEW', 'Salesforce FSC'],
    required_policies: [
      { policy_id: 'consent', verdict: 'clear' },
      { policy_id: 'vulnerability', verdict: 'clear' },
      { policy_id: 'reg_bi', verdict: 'review' },
    ],
    expected: {
      action_id: 'warm_merrill_referral',
      abstain: false,
      evidence_transaction_ids: ['tx_001', 'tx_002'],
    },
  };
}

function blockedCase() {
  return {
    ...clearCase(),
    case_id: 'blocked_case',
    household_token: 'tok_household_000002',
    required_policies: [
      { policy_id: 'consent', verdict: 'block' },
      { policy_id: 'vulnerability', verdict: 'clear' },
      { policy_id: 'reg_bi', verdict: 'review' },
    ],
    expected: { action_id: null, abstain: true, evidence_transaction_ids: ['tx_001'] },
  };
}

function validOutput(input) {
  const blocked = input.required_policies.some((policy) => policy.verdict === 'block');
  return {
    action_id: blocked ? null : input.expected.action_id,
    channel: blocked ? null : 'CEW',
    owner_role: blocked ? null : 'Relationship banker',
    rationale: blocked ? 'Abstain because required consent is blocked.' : 'Liquidity and relationship evidence support a warm review.',
    evidence_transaction_ids: input.expected.evidence_transaction_ids,
    policy_checks: input.required_policies.map((policy) => ({ ...policy, explanation: 'Copied from supplied policy context' })),
    confidence: blocked ? 0.98 : 0.86,
    abstain: blocked,
    abstain_reason: blocked ? 'Required consent policy blocks activation.' : null,
  };
}
