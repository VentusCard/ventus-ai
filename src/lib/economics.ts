// Illustrative pilot economics: turns executive-adjustable assumptions into a
// conservative dollar range. Every output is hypothesis math — the pilot's
// holdout measurement is the only thing that verifies a number. Pure functions
// so the same model runs in the demo, in tests, and in any future pricing tool.

import type { LeadershipPath } from "./leadership.ts";

export type EconomicAssumptions = {
  treatedHouseholds: number; // households receiving the action in the pilot window
  avgValuePerHousehold: number; // $ at stake per household (deposit balance / movable assets)
  baselineRatePct: number; // % of value retained (retention) or converted (growth) without Ventus
  liftLowPct: number; // conservative incremental percentage points
  liftHighPct: number; // upside incremental percentage points
};

export type IllustrativeRange = {
  lowUsd: number;
  highUsd: number;
  midUsd: number;
  treatmentAvgUsd: number; // per-household observed value with the action (midpoint lift)
  holdoutAvgUsd: number; // per-household observed value without it
  formula: string;
};

const clampPct = (value: number) => Math.min(100, Math.max(0, value));

export function normalizeAssumptions(a: EconomicAssumptions): EconomicAssumptions {
  const baselineRatePct = clampPct(a.baselineRatePct);
  const headroom = 100 - baselineRatePct; // baseline + lift can never exceed 100%
  const liftHighPct = Math.min(clampPct(Math.max(a.liftLowPct, a.liftHighPct)), headroom);
  const liftLowPct = Math.min(clampPct(Math.min(a.liftLowPct, a.liftHighPct)), liftHighPct);
  return {
    treatedHouseholds: Math.max(0, Math.round(a.treatedHouseholds)),
    avgValuePerHousehold: Math.max(0, a.avgValuePerHousehold),
    baselineRatePct,
    liftLowPct,
    liftHighPct,
  };
}

export function illustrativeRange(raw: EconomicAssumptions): IllustrativeRange {
  const a = normalizeAssumptions(raw);
  const perHouseholdLow = (a.avgValuePerHousehold * a.liftLowPct) / 100;
  const perHouseholdHigh = (a.avgValuePerHousehold * a.liftHighPct) / 100;
  const liftMidPct = (a.liftLowPct + a.liftHighPct) / 2;
  const holdoutAvgUsd = (a.avgValuePerHousehold * a.baselineRatePct) / 100;
  const treatmentAvgUsd = (a.avgValuePerHousehold * (a.baselineRatePct + liftMidPct)) / 100;
  return {
    lowUsd: perHouseholdLow * a.treatedHouseholds,
    highUsd: perHouseholdHigh * a.treatedHouseholds,
    midUsd: ((perHouseholdLow + perHouseholdHigh) / 2) * a.treatedHouseholds,
    treatmentAvgUsd,
    holdoutAvgUsd,
    formula: `${a.treatedHouseholds.toLocaleString("en-US")} households × ${fmtUsd(a.avgValuePerHousehold)} avg × +${a.liftLowPct}–${a.liftHighPct} pp lift`,
  };
}

// Same per-household lift applied once to a larger eligible population — the
// number an executive can repeat upward. Framing only; still illustrative.
export function scaledAnnualRange(raw: EconomicAssumptions, scaleHouseholds: number): { lowUsd: number; highUsd: number } {
  const a = normalizeAssumptions(raw);
  const households = Math.max(0, Math.round(scaleHouseholds));
  return {
    lowUsd: ((a.avgValuePerHousehold * a.liftLowPct) / 100) * households,
    highUsd: ((a.avgValuePerHousehold * a.liftHighPct) / 100) * households,
  };
}

export function defaultAssumptions(path: LeadershipPath, treatedHouseholds: number): EconomicAssumptions {
  return path === "deposit-retention"
    ? {
        treatedHouseholds,
        avgValuePerHousehold: 18_000, // avg deposit balance at risk
        baselineRatePct: 84, // balance retained without intervention
        liftLowPct: 1,
        liftHighPct: 4,
      }
    : {
        treatedHouseholds,
        avgValuePerHousehold: 210_000, // avg movable / self-directed assets
        baselineRatePct: 9, // converts to advised without intervention
        liftLowPct: 1,
        liftHighPct: 4,
      };
}

export function fmtUsd(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return `$${Math.round(value)}`;
}
