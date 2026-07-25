import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { fitParametersFromDemonstrations, parameterGrid, scoreAgainstDemonstrations } from './parameter-fit.mjs';
import { merrillRelationshipDetector } from './standalone-growth-play-detectors.mjs';

const drafts = JSON.parse(readFileSync(new URL('../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const merrill = compileGrowthPlayContract(drafts[1]);

// A synthetic demonstration: the expert acted on every household transferring at least
// 150k, which is stricter than the play's declared 100k trigger.
const EXPERT_THRESHOLD = 150_000;
const cases = buildCases();
const demonstrated = cases
  .filter((replayCase) => replayCase.transferAmount >= EXPERT_THRESHOLD)
  .map((replayCase) => replayCase.householdToken);

test('parameter grid walks the approved box at approved step resolution', () => {
  const grid = parameterGrid(merrill.parameters.min_transfer_amount);
  assert.equal(grid[0], 25_000);
  assert.equal(grid.at(-1), 500_000);
  assert.ok(grid.includes(100_000));
  assert.ok(grid.includes(EXPERT_THRESHOLD));

  const integerGrid = parameterGrid(merrill.parameters.min_corroborating_signals);
  assert.deepEqual(integerGrid, [2, 3]);
});

test('declared thresholds under-fit the demonstration before fitting', () => {
  const baseline = scoreAgainstDemonstrations({
    contract: merrill, detector: merrillRelationshipDetector, cases, demonstratedHouseholds: demonstrated,
  });
  // 100k qualifies households the expert declined, so recall is perfect and precision is not.
  assert.equal(baseline.recall, 1);
  assert.ok(baseline.precision < 1, 'declared trigger should over-select against the demonstration');
  assert.ok(baseline.falsePositives > 0);
  assert.equal(baseline.errors, 0);
});

test('fitting recovers the expert threshold and reports the improvement', () => {
  const fit = fitParametersFromDemonstrations({
    contract: merrill, detector: merrillRelationshipDetector, cases, demonstratedHouseholds: demonstrated,
  });

  assert.equal(fit.fittedValues.min_transfer_amount, EXPERT_THRESHOLD);
  assert.equal(fit.fittedScore.f1, 1);
  assert.equal(fit.fittedScore.precision, 1);
  assert.equal(fit.fittedScore.recall, 1);
  assert.ok(fit.improvementF1 > 0);
  assert.deepEqual(fit.changedParameters, ['min_transfer_amount']);
  assert.equal(fit.declaredValues.min_transfer_amount, 100_000);
  assert.ok(fit.converged);
  assert.equal(fit.approvalRequired, 'growth_play_protocol_approval');
});

test('fitting stays inside the approved box and never mints a protocol', () => {
  const fit = fitParametersFromDemonstrations({
    contract: merrill, detector: merrillRelationshipDetector, cases, demonstratedHouseholds: demonstrated,
  });
  for (const [name, value] of Object.entries(fit.fittedValues)) {
    const spec = merrill.parameters[name];
    assert.ok(value >= spec.min && value <= spec.max, `${name} left its approved bounds`);
  }
  assert.equal(fit.decision_protocol_id, undefined);
  assert.throws(
    () => fitParametersFromDemonstrations({
      contract: merrill, detector: merrillRelationshipDetector, cases, demonstratedHouseholds: [],
    }),
    /at least one demonstrated household/,
  );
});

test('detector failures are counted, not silently scored as selections', () => {
  const broken = [...cases, { householdToken: 'tok_household_empty', records: [], policies: [] }];
  const score = scoreAgainstDemonstrations({
    contract: merrill, detector: merrillRelationshipDetector, cases: broken, demonstratedHouseholds: demonstrated,
  });
  assert.equal(score.errors, 1);
  assert.equal(score.evaluated, broken.length);
});

function buildCases() {
  const built = [];
  for (let step = 1; step <= 20; step += 1) {
    const transferAmount = step * 25_000;
    const householdToken = `tok_household_${String(step).padStart(6, '0')}`;
    built.push({
      householdToken,
      transferAmount,
      policies: merrill.policy.required_policy_ids.map((policyId) => ({ policy_id: policyId, verdict: 'clear' })),
      records: [
        {
          transaction_id: `tx_transfer_${step}`,
          source_system: 'merrill_transfer_workflow',
          rail: 'acats',
          amount: transferAmount,
        },
        {
          transaction_id: `tx_books_${step}`,
          source_system: 'merrill_books',
          rail: 'account',
          amount: 0,
        },
        {
          transaction_id: `tx_digital_${step}`,
          source_system: 'merrill_digital',
          rail: 'digital',
          amount: 1,
        },
      ],
    });
  }
  return built;
}
