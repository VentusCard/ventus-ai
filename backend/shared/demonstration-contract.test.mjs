import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { compileGrowthPlayContract } from './growth-play-contract.mjs';
import { loadDemonstration, validateDemonstration } from './demonstration-contract.mjs';
import { fitParametersFromDemonstrations } from './parameter-fit.mjs';
import { merrillRelationshipDetector } from './standalone-growth-play-detectors.mjs';

const drafts = JSON.parse(readFileSync(new URL('../fixtures/evaluation/growth-play-drafts.json', import.meta.url), 'utf8'));
const merrill = compileGrowthPlayContract(drafts[1]);
const sample = JSON.parse(readFileSync(new URL('../fixtures/evaluation/demonstration-sample.json', import.meta.url), 'utf8'));

test('a valid demonstration summarizes its own coverage', () => {
  const summary = validateDemonstration(sample);
  assert.equal(summary.growthPlayId, 'merrill-relationship-growth');
  assert.equal(summary.evidenceClass, 'synthetic');
  assert.equal(summary.totalCases, 24);
  assert.equal(summary.exposedCases, 22);
  assert.equal(summary.unexposedCases, 2);
  assert.equal(summary.actedHouseholds, 14);
  assert.equal(summary.distinctExperts, 2);
  assert.ok(summary.selectionRate > 0 && summary.selectionRate < 1);
});

test('unexposed households are excluded from the fit, not scored as declines', () => {
  const loaded = loadDemonstration(sample, { growthPlay: merrill });
  assert.equal(loaded.cases.length, 22, 'only exposed cases are scoreable');
  assert.equal(loaded.demonstratedHouseholds.length, 14);
  const tokens = new Set(loaded.cases.map((item) => item.householdToken));
  for (const token of loaded.demonstratedHouseholds) assert.ok(tokens.has(token));
  assert.ok(!tokens.has('tok_demo_merrill_0003'), 'unexposed household must not reach the fit');
  assert.ok(!tokens.has('tok_demo_merrill_0020'), 'unexposed household must not reach the fit');
});

test('evidence class follows the load so a synthetic fit cannot pass as pilot-ready', () => {
  const loaded = loadDemonstration(sample, { growthPlay: merrill });
  assert.equal(loaded.evidenceClass, 'synthetic');
  assert.equal(loaded.fitUsableForProduction, false);

  const sanctioned = loadDemonstration({ ...sample, evidence_class: 'sanctioned' }, { growthPlay: merrill });
  assert.equal(sanctioned.fitUsableForProduction, true);
});

test('the export is rejected when its own claims contradict each other', () => {
  assert.throws(() => validateDemonstration({
    ...sample,
    cases: sample.cases.map((item) => (
      item.household_token === sample.actions[0].household_token ? { ...item, exposed: false } : item
    )),
  }), /contradicts exposed: false/);

  assert.throws(() => validateDemonstration({
    ...sample,
    actions: [...sample.actions, { ...sample.actions[0], household_token: 'tok_demo_merrill_9999' }],
  }), /has no case in this export/);

  assert.throws(() => validateDemonstration({
    ...sample,
    actions: [{ ...sample.actions[0], acted_at: '2026-09-01T00:00:00.000Z' }],
  }), /outside the declared window/);

  assert.throws(() => validateDemonstration({
    ...sample,
    expert_selection: { ...sample.expert_selection, expert_count: 1 },
  }), /distinct experts but declares 1/);
});

test('an export with no declines cannot be fitted against', () => {
  const actedTokens = new Set(sample.actions.map((action) => action.household_token));
  assert.throws(() => validateDemonstration({
    ...sample,
    cases: sample.cases.filter((item) => actedTokens.has(item.household_token)),
  }), /no negative examples to fit against/);
});

test('household and employee identity must be opaque, and PII is refused', () => {
  assert.throws(() => validateDemonstration({
    ...sample,
    cases: [{ ...sample.cases[0], household_token: 'household_12345678' }, ...sample.cases.slice(1)],
  }), /must be an opaque tok_ identifier/);

  assert.throws(() => validateDemonstration({
    ...sample,
    actions: [{ ...sample.actions[0], expert_token: 'jane.doe@bank.example' }],
  }), /must be an opaque exp_ identifier/);

  assert.throws(() => validateDemonstration({
    ...sample,
    expert_selection: { ...sample.expert_selection, advisor_name: 'J. Doe' },
  }), /direct identity field advisor_name is prohibited/);

  assert.throws(() => validateDemonstration({
    ...sample,
    cases: [
      { ...sample.cases[0], records: [{ ...sample.cases[0].records[0], account_number: '123456789' }] },
      ...sample.cases.slice(1),
    ],
  }), /direct identity field account_number is prohibited/);
});

test('a demonstration is bound to its Growth Play and approved actions', () => {
  assert.throws(
    () => loadDemonstration({ ...sample, growth_play_id: 'deposit-primacy-defense' }, { growthPlay: merrill }),
    /demonstration is for deposit-primacy-defense/,
  );
  assert.throws(
    () => loadDemonstration({ ...sample, business_line: 'consumer-banking' }, { growthPlay: merrill }),
    /business line consumer-banking does not match/,
  );
  assert.throws(
    () => loadDemonstration({
      ...sample,
      actions: [{ ...sample.actions[0], action_id: 'unapproved_outreach' }],
    }, { growthPlay: merrill }),
    /action unapproved_outreach is not approved/,
  );
});

test('the loaded export drives the fit end to end', () => {
  const loaded = loadDemonstration(sample, { growthPlay: merrill });
  const fit = fitParametersFromDemonstrations({
    contract: merrill,
    detector: merrillRelationshipDetector,
    cases: loaded.cases,
    demonstratedHouseholds: loaded.demonstratedHouseholds,
  });
  // Experts acted at 175k and above; the declared trigger is 100k.
  assert.equal(fit.declaredValues.min_transfer_amount, 100_000);
  assert.equal(fit.fittedValues.min_transfer_amount, 175_000);
  assert.equal(fit.fittedScore.f1, 1);
  assert.ok(fit.improvementF1 > 0);
  // This demonstration has a household at every 25k step, so the threshold is identified.
  assert.equal(fit.equivalentValues.min_transfer_amount, undefined);
});

test('a demonstration with a gap at the boundary reports the values it cannot distinguish', () => {
  // Drop the household at 150k: nothing then separates a 150k trigger from a 175k one.
  const gapped = {
    ...sample,
    cases: sample.cases.filter((item) => item.household_token !== 'tok_demo_merrill_0006'),
  };
  const loaded = loadDemonstration(gapped, { growthPlay: merrill });
  const fit = fitParametersFromDemonstrations({
    contract: merrill,
    detector: merrillRelationshipDetector,
    cases: loaded.cases,
    demonstratedHouseholds: loaded.demonstratedHouseholds,
  });
  assert.equal(fit.fittedScore.f1, 1);
  assert.equal(fit.identified, false, 'the gap must be reported, not hidden behind one value');
  assert.deepEqual(fit.equivalentValues.min_transfer_amount, [150_000, 175_000]);
});
