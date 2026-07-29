// Leadership-flow configuration: the boardroom-facing definition of each pilot
// path (objective, metric, boundaries, source/workflow surfaces) and the
// operating controls an executive can set. Pure data + pure functions so the
// same configuration can be tested, reused per institution, and rendered by
// any surface — the demo page is one consumer.

import { DEPOSIT_PRIMACY_SKILL, MERRILL_RELATIONSHIP_GROWTH_SKILL, type SkillArtifact } from "./skills.ts";

export type LeadershipPath = "wealth-growth" | "deposit-retention";
export const LEADERSHIP_PATHS: readonly LeadershipPath[] = ["wealth-growth", "deposit-retention"];

export type OperatingPosture = "precision" | "balanced" | "coverage";
export type ReviewMode = "every-case" | "exceptions";
export type FrontlineDecision = "pending" | "accepted" | "adjusted" | "not-relevant";
export type FrontlineFeedback = "timing" | "already-covered" | "signal-wrong";
export type ExecutiveDecision = "scale" | "refine" | "hold";

export type LeadershipControls = {
  posture: OperatingPosture;
  capacity: 25 | 50 | 100;
  reviewMode: ReviewMode;
};

export const DEFAULT_LEADERSHIP_CONTROLS: LeadershipControls = {
  posture: "balanced",
  capacity: 50,
  reviewMode: "every-case",
};

export const OPERATING_POSTURES: Record<OperatingPosture, { label: string; threshold: number; detail: string }> = {
  precision: { label: "Precision first", threshold: 88, detail: "Fewer, strongest cases" },
  balanced: { label: "Balanced", threshold: 82, detail: "Quality with useful reach" },
  coverage: { label: "Broader coverage", threshold: 75, detail: "More cases for review" },
};

export const EXECUTIVE_DECISION_COPY: Record<ExecutiveDecision, string> = {
  scale: "Advance only after the proposed gates and policy review clear.",
  refine: "Return frontline feedback to the Growth Play and rerun in shadow.",
  hold: "Keep the current scope; no additional activation is released.",
};

// Everything about a path except the exemplar opportunity, which lives with the
// demo page's book data. `book` + `oppId` tell the page where to look it up.
export type LeadershipPathConfig = {
  businessLine: string;
  objective: string;
  primaryMetric: string;
  eligiblePopulation: string;
  pilotWindow: string;
  successGate: string;
  dataBoundary: string;
  exclusions: string;
  coverCopy: string;
  book: "consumer" | "advisor";
  oppId: string;
  playTitle: string;
  skill: SkillArtifact;
  pilotOwner: string;
  sourceLabel: string;
  sourceDetail: string;
  workflowLabel: string;
  workflowDetail: string;
  standaloneProof: string;
  expansionUpside: string;
  actEarlier: string; // division of value: the institution owns the signals; Ventus turns them into action
  scaleHouseholds: number; // illustrative eligible-market size for at-scale framing
  scaleLabel: string;
};

export function leadershipPathConfig(path: LeadershipPath): LeadershipPathConfig {
  if (path === "deposit-retention") {
    return {
      businessLine: "Consumer Banking",
      objective: "Strengthen deposit primacy",
      primaryMetric: "Incremental deposits retained",
      eligiblePopulation: "Primary-checking households with active payroll",
      pilotWindow: "30–60 days after action",
      successGate: "Positive lift vs. holdout after coverage gates",
      dataBoundary: "Consumer-owned data only",
      exclusions: "Ineligible, suppressed, or vulnerable customers",
      coverCopy: "Use Consumer-owned signals to detect relationship erosion and prepare one timely banker action.",
      book: "consumer",
      oppId: "primacy",
      playTitle: "Deposit Primacy Defense",
      skill: DEPOSIT_PRIMACY_SKILL,
      pilotOwner: "Consumer Bank P&L owner",
      sourceLabel: "Consumer data",
      sourceDetail: "Epsilon · deposits · card · P2P",
      workflowLabel: "Banker workflow",
      workflowDetail: "Workbench · email · Salesforce",
      standaloneProof: "No Merrill data required",
      expansionUpside: "Later, authorized wealth signals can improve qualification without changing Consumer ownership.",
      actEarlier: "Consumer Banking owns the payroll, card, and P2P evidence. Ventus turns it into one governed retention action before the second paycheck leaves.",
      scaleHouseholds: 40_000,
      scaleLabel: "one market's primary-checking book",
    };
  }
  return {
    businessLine: "Merrill",
    objective: "Grow qualified wealth relationships",
    primaryMetric: "Incremental advised net new assets",
    eligiblePopulation: "Self-directed households with qualified transfer and engagement evidence",
    pilotWindow: "90 days after advisor action",
    successGate: "Positive NNA lift vs. holdout after coverage gates",
    dataBoundary: "Merrill-owned data only",
    exclusions: "Ineligible, suppressed, or already-covered relationships",
    coverCopy: "Use Merrill-owned signals to convert active demand into qualified NNA and advised relationships.",
    book: "advisor",
    oppId: "merrill-growth",
    playTitle: "Merrill Relationship Growth",
    skill: MERRILL_RELATIONSHIP_GROWTH_SKILL,
    pilotOwner: "Merrill growth P&L owner",
    sourceLabel: "Merrill data",
    sourceDetail: "Books · transfers · digital engagement",
    workflowLabel: "Advisor workflow",
    workflowDetail: "CEW · Book 360 · Salesforce FSC",
    standaloneProof: "No Consumer data required",
    expansionUpside: "Later, authorized Consumer signals can reveal earlier demand and quantify incremental connected lift.",
    actEarlier: "Merrill owns the relationship, transfer, and engagement evidence. Ventus turns it into one governed advisor action before intent goes cold.",
    scaleHouseholds: 6_000,
    scaleLabel: "one market's self-directed segment",
  };
}

export function salesforceCopyFor(path: LeadershipPath): { subject: string; outcome: string } {
  return path === "deposit-retention"
    ? {
        subject: "Primary deposit relationship review",
        outcome: "Protect the primary deposit relationship",
      }
    : {
        subject: "Qualified liquidity opportunity review",
        outcome: "Convert qualified liquidity into advised net new assets",
      };
}

export function actionOptionsFor(path: LeadershipPath): string[] {
  return path === "deposit-retention"
    ? [
        "Contact the customer before the next payroll cycle to review their everyday-banking setup and an approved retention option.",
        "Prepare an approved retention option for banker review before the next payroll cycle.",
        "Monitor through the next payroll cycle and alert the banker if the pattern continues.",
      ]
    : [
        "Assign the best-fit advisor and prepare a consolidation review while the liquidity remains uninvested.",
        "Route the case to a Merrill specialist for a transfer and liquidity review.",
        "Prepare an advisor outreach task and hold the recommendation for same-day review.",
      ];
}

export function activeControlChips(path: LeadershipPath, controls: LeadershipControls): string[] {
  return [
    ...(path === "wealth-growth"
      ? ["Reg BI review", "Consent + eligibility", "Vulnerability suppression"]
      : ["UDAAP review", "Uniform offer criteria", "Financial-health suppression"]),
    `${OPERATING_POSTURES[controls.posture].label} · ${OPERATING_POSTURES[controls.posture].threshold}% threshold`,
    controls.reviewMode === "every-case" ? "Human review required" : "Human review on exceptions",
  ];
}

// The pilot window in review-weeks, used to turn weekly capacity into a cohort.
const PILOT_WEEKS = 9;

export function pilotCohort(controls: LeadershipControls, holdoutPct: number): { total: number; treated: number; holdout: number } {
  const total = controls.capacity * PILOT_WEEKS;
  const holdout = Math.max(1, Math.round((total * holdoutPct) / 100));
  return { total, treated: total - holdout, holdout };
}
