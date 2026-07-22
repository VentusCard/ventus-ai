// The learning loop — the mechanism that makes a Skill improve with usage.
//
// Every decision writes to the ledger, and a human accepts or rejects it (and later a
// customer outcome lands). This module reads those accumulated events back and produces a
// per-signal-type weight: signal types that keep getting accepted and converting are
// trusted more; ones that get rejected are trusted less. The next scoring pass uses those
// weights, so the same raw data yields a better-ranked result over time.
//
// This is deliberately simple and inspectable — a real closed loop, not a black box or a
// slide. It is honest about being a v1: it re-weights signal trust from outcomes; it does
// not retrain a model. Pure and dependency-free.

import type { SignalType } from "./plaid";

// Feedback the loop consumes. In the app these are derived from ledger events; here they
// are a plain list so the loop is testable in isolation.
export type Feedback = {
  signalType: SignalType;
  decision: "accept" | "reject";
  converted?: boolean; // measured customer outcome, when the window has closed
};

export type SignalWeight = {
  signalType: SignalType;
  weight: number; // multiplier applied to a signal's contribution (starts at 1.0)
  accepts: number;
  rejects: number;
  conversions: number;
  samples: number;
};

const BASE_WEIGHT = 1.0;
const MIN_WEIGHT = 0.4;
const MAX_WEIGHT = 1.8;

// Laplace-smoothed accept rate → weight. Conversions count double (an accepted rec that
// actually moved the number is the strongest possible signal of trust).
export function computeWeights(feedback: Feedback[]): Record<string, SignalWeight> {
  const byType = new Map<SignalType, Feedback[]>();
  for (const f of feedback) {
    const list = byType.get(f.signalType) ?? [];
    list.push(f);
    byType.set(f.signalType, list);
  }

  const out: Record<string, SignalWeight> = {};
  for (const [signalType, list] of byType) {
    const accepts = list.filter((f) => f.decision === "accept").length;
    const rejects = list.filter((f) => f.decision === "reject").length;
    const conversions = list.filter((f) => f.converted).length;
    // Smoothed positive rate in [0,1]; conversions add extra positive mass.
    const positive = accepts + conversions;
    const total = accepts + rejects;
    const rate = (positive + 1) / (total + 2); // Laplace smoothing
    // Map rate (0..1, neutral at 0.5) onto the weight band around BASE_WEIGHT.
    const weight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, BASE_WEIGHT + (rate - 0.5) * 1.6));
    out[signalType] = { signalType, weight: Number(weight.toFixed(3)), accepts, rejects, conversions, samples: total };
  }
  return out;
}

// Apply learned weights to a set of detected signals to produce an adjusted score.
// baseScore is the pre-loop confidence (0-100); each present signal nudges it by how much
// that signal type is currently trusted. Clamped to a sane band.
export function applyLoop(
  baseScore: number,
  signalTypes: SignalType[],
  weights: Record<string, SignalWeight>,
): { score: number; delta: number; applied: { signalType: SignalType; weight: number }[] } {
  if (!signalTypes.length) return { score: baseScore, delta: 0, applied: [] };
  const applied = signalTypes.map((signalType) => ({
    signalType,
    weight: weights[signalType]?.weight ?? BASE_WEIGHT,
  }));
  const avgWeight = applied.reduce((s, a) => s + a.weight, 0) / applied.length;
  // avgWeight 1.0 = no change; >1 lifts, <1 dampens. Scale the effect gently.
  const adjusted = Math.round(Math.max(0, Math.min(100, baseScore * (1 + (avgWeight - 1) * 0.5))));
  return { score: adjusted, delta: adjusted - baseScore, applied };
}

// Convenience: turn raw ledger-style feedback into weights and re-rank a scored list.
export function relearnAndRank<T extends { score: number; signalTypes: SignalType[] }>(
  items: T[],
  feedback: Feedback[],
): (T & { adjustedScore: number; delta: number })[] {
  const weights = computeWeights(feedback);
  return items
    .map((item) => {
      const { score, delta } = applyLoop(item.score, item.signalTypes, weights);
      return { ...item, adjustedScore: score, delta };
    })
    .sort((a, b) => b.adjustedScore - a.adjustedScore);
}

// Human-readable summary of what the loop has learned — for the demo's "why did the
// ranking change" moment.
export function summarizeLearning(weights: Record<string, SignalWeight>): string[] {
  return Object.values(weights)
    .filter((w) => w.samples > 0)
    .sort((a, b) => b.weight - a.weight)
    .map((w) => {
      const dir = w.weight > 1.02 ? "trusted more" : w.weight < 0.98 ? "trusted less" : "unchanged";
      return `${w.signalType.replace(/_/g, " ")} — ${dir} (${w.accepts}✓ / ${w.rejects}✗${w.conversions ? ` · ${w.conversions} converted` : ""})`;
    });
}
