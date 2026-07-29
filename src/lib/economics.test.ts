import assert from "node:assert/strict";
import test from "node:test";
import { defaultAssumptions, illustrativeRange, normalizeAssumptions, scaledAnnualRange, fmtUsd } from "./economics.ts";

test("zero lift produces zero incremental value", () => {
  const range = illustrativeRange({ treatedHouseholds: 450, avgValuePerHousehold: 18_000, baselineRatePct: 84, liftLowPct: 0, liftHighPct: 0 });
  assert.equal(range.lowUsd, 0);
  assert.equal(range.highUsd, 0);
  assert.equal(range.treatmentAvgUsd, range.holdoutAvgUsd);
});

test("range is monotonic in lift and cohort size", () => {
  const base = defaultAssumptions("deposit-retention", 450);
  const small = illustrativeRange(base);
  const moreLift = illustrativeRange({ ...base, liftHighPct: base.liftHighPct + 2 });
  const moreHouseholds = illustrativeRange({ ...base, treatedHouseholds: base.treatedHouseholds * 2 });
  assert.ok(moreLift.highUsd > small.highUsd);
  assert.ok(moreHouseholds.lowUsd > small.lowUsd);
  assert.ok(small.lowUsd <= small.midUsd && small.midUsd <= small.highUsd);
});

test("normalization clamps inverted and out-of-range inputs", () => {
  const a = normalizeAssumptions({ treatedHouseholds: -5, avgValuePerHousehold: -100, baselineRatePct: 140, liftLowPct: 8, liftHighPct: 2 });
  assert.equal(a.treatedHouseholds, 0);
  assert.equal(a.avgValuePerHousehold, 0);
  assert.equal(a.baselineRatePct, 100);
  assert.ok(a.liftLowPct <= a.liftHighPct);
  assert.ok(a.baselineRatePct + a.liftHighPct <= 100, "combined rate can never exceed 100%");
});

test("default assumptions are conservative and path-specific", () => {
  const retention = defaultAssumptions("deposit-retention", 405);
  const wealth = defaultAssumptions("wealth-growth", 405);
  assert.ok(retention.avgValuePerHousehold < wealth.avgValuePerHousehold);
  assert.ok(retention.liftLowPct <= 2, "conservative floor");
  const range = illustrativeRange(retention);
  assert.ok(range.lowUsd > 0 && range.lowUsd < range.highUsd);
});

test("scaled annual range applies per-household lift to the eligible market", () => {
  const a = defaultAssumptions("deposit-retention", 405);
  const scaled = scaledAnnualRange(a, 40_000);
  const perHouseholdLow = (a.avgValuePerHousehold * a.liftLowPct) / 100;
  assert.equal(scaled.lowUsd, perHouseholdLow * 40_000);
  assert.ok(scaled.highUsd > scaled.lowUsd);
});

test("fmtUsd renders compact currency", () => {
  assert.equal(fmtUsd(950), "$950");
  assert.equal(fmtUsd(18_000), "$18.0K");
  assert.equal(fmtUsd(1_500_000), "$1.5M");
});
