import assert from "node:assert/strict";
import test from "node:test";
import {
  LEADERSHIP_PATHS,
  OPERATING_POSTURES,
  DEFAULT_LEADERSHIP_CONTROLS,
  leadershipPathConfig,
  salesforceCopyFor,
  actionOptionsFor,
  activeControlChips,
  pilotCohort,
} from "./leadership.ts";

test("every path config is complete and bound to a valid skill", () => {
  for (const path of LEADERSHIP_PATHS) {
    const config = leadershipPathConfig(path);
    assert.ok(config.objective.length > 0);
    assert.ok(config.primaryMetric.toLowerCase().includes("incremental"), "metric must be an incremental P&L number");
    assert.ok(config.oppId.length > 0);
    assert.ok(config.skill.measurement.holdoutPct > 0, "every path must carry a holdout by construction");
    assert.ok(config.scaleHouseholds > 0);
    assert.ok(["consumer", "advisor"].includes(config.book));
  }
});

test("operating postures order reach against precision", () => {
  assert.ok(OPERATING_POSTURES.precision.threshold > OPERATING_POSTURES.balanced.threshold);
  assert.ok(OPERATING_POSTURES.balanced.threshold > OPERATING_POSTURES.coverage.threshold);
});

test("control chips reflect posture threshold and review mode", () => {
  const chips = activeControlChips("deposit-retention", { posture: "precision", capacity: 25, reviewMode: "exceptions" });
  assert.ok(chips.some((chip) => chip.includes("88%")));
  assert.ok(chips.includes("Human review on exceptions"));
  assert.ok(chips.includes("UDAAP review"));
  const wealthChips = activeControlChips("wealth-growth", DEFAULT_LEADERSHIP_CONTROLS);
  assert.ok(wealthChips.includes("Reg BI review"));
  assert.ok(wealthChips.includes("Human review required"));
});

test("pilot cohort converts weekly capacity into treated + holdout", () => {
  const cohort = pilotCohort({ posture: "balanced", capacity: 50, reviewMode: "every-case" }, 10);
  assert.equal(cohort.total, 450);
  assert.equal(cohort.holdout, 45);
  assert.equal(cohort.treated, 405);
  const small = pilotCohort({ posture: "balanced", capacity: 25, reviewMode: "every-case" }, 10);
  assert.ok(small.holdout >= 1);
  assert.equal(small.total, small.treated + small.holdout);
});

test("salesforce copy and action options exist for both paths", () => {
  for (const path of LEADERSHIP_PATHS) {
    assert.ok(salesforceCopyFor(path).subject.length > 0);
    const options = actionOptionsFor(path);
    assert.equal(options.length, 3);
    assert.ok(new Set(options).size === 3, "options must be distinct");
  }
});
