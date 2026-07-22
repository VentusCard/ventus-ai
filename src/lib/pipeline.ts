// Synthetic evaluation pipeline used by the demo.
//
// Authored sample records exercise the intended stage contract: ingest → enrich →
// score → gate → route. Inputs already contain illustrative classification labels and
// confidence values, so this proves UI and contract behavior, not model accuracy.

import type { LedgerDraft } from "./ledger";
import type { PnlMetric } from "./skills";

export type PipelineTxn = { conf: number; pillar: string; tag: string; src?: string };

export type PipelineInput = {
  id: string;
  client: string;
  type: string;
  value: string;
  valueLabel: string;
  lob?: "consumer" | "wealth";
  destination: string;
  goals: string[];
  rawTransactions: PipelineTxn[];
};

export type PipelineDerived = {
  confidence: number; // derived from classifier confidences + corroboration
  score: number; // 0-100 rank score = confidence × value weight
  pnlMetric: PnlMetric;
  skillSlug: string;
  provenance: { ingested: number; classified: number; signals: number; rails: number; synthetic: true };
};

// Deterministic pseudo-count so the same household always ingests the same volume.
function seededCount(id: string, base: number, span: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return base + (h % span);
}

function valueWeight(value: string): number {
  const m = value.match(/([\d.]+)\s*([MK])?/i);
  if (!m) return 0.3;
  let n = parseFloat(m[1]);
  const u = (m[2] || "").toUpperCase();
  if (u === "M") n *= 1_000_000;
  else if (u === "K") n *= 1_000;
  return Math.min(1, n / 1_500_000);
}

function pnlFor(input: PipelineInput): PnlMetric {
  const g = input.goals;
  if (input.lob === "consumer") {
    if (g.includes("retention")) return "Deposit balances retained ($)";
    if (input.destination === "lending") return "Incremental loan originations ($)";
    if (g.includes("nna") || input.destination === "merrill") return "Net new assets to Merrill ($)";
    if (g.includes("deepen")) return "Products per household (#)";
    return "Primary-checking households retained (#)";
  }
  if (g.includes("nna")) return "Net new assets to Merrill ($)";
  if (g.includes("deepen")) return "Products per household (#)";
  return "Net new assets to Merrill ($)";
}

function skillFor(input: PipelineInput, pnl: PnlMetric): string {
  if (input.destination === "merrill") return "consumer-to-merrill-handoff";
  if (pnl === "Deposit balances retained ($)" || pnl === "Primary-checking households retained (#)") return "deposit-primacy-defense";
  if (pnl === "Net new assets to Merrill ($)") {
    return input.lob === "wealth" ? "merrill-relationship-growth" : "consumer-to-merrill-handoff";
  }
  return input.lob === "consumer" ? "deposit-primacy-defense" : "consumer-to-merrill-handoff";
}

// Score = classifier confidence, lifted by corroboration across distinct rails, clamped.
export function runPipeline(input: PipelineInput): PipelineDerived {
  const txns = input.rawTransactions;
  const rails = new Set(txns.map((t) => t.src).filter(Boolean)).size || 1;
  const mean = txns.reduce((s, t) => s + t.conf, 0) / Math.max(1, txns.length);
  const corroboration = Math.min(0.06, (rails - 1) * 0.02); // more independent rails → more confident
  const confidence = Math.max(70, Math.min(97, Math.round((mean + corroboration) * 100)));
  const pnlMetric = pnlFor(input);
  const score = Math.round(confidence * (0.6 + 0.4 * valueWeight(input.value)));
  const signals = txns.length;
  const ingested = seededCount(input.id, 40, 200);
  return {
    confidence,
    score,
    pnlMetric,
    skillSlug: skillFor(input, pnlMetric),
    provenance: { ingested, classified: ingested, signals, rails, synthetic: true },
  };
}

// The ledger trail one household writes as it passes through the pipeline.
export function pipelineEvents(input: PipelineInput, d: PipelineDerived): LedgerDraft[] {
  return [
    {
      kind: "signal",
      title: `Signal detected — ${input.type}`,
      detail: `${d.provenance.signals} corroborating signals across ${d.provenance.rails} data rails`,
      ref: input.client,
      skill: d.skillSlug,
      status: "simulated",
      eventKey: `${input.id}:signal`,
    },
    {
      kind: "enrich",
      title: `Enriched ${d.provenance.ingested} transactions`,
      detail: `Classified to ${d.provenance.signals} signal, ${d.provenance.ingested - d.provenance.signals} noise`,
      ref: input.client,
      skill: d.skillSlug,
      status: "simulated",
      eventKey: `${input.id}:enrich`,
    },
    {
      kind: "score",
      title: `Scored — confidence ${d.confidence}%`,
      detail: `Moves: ${d.pnlMetric}`,
      ref: input.client,
      skill: d.skillSlug,
      status: "simulated",
      eventKey: `${input.id}:score`,
    },
    {
      kind: "gate",
      title: "Policy pack pre-screened",
      detail: `Eligibility + suppression checked before surfacing`,
      ref: input.client,
      skill: d.skillSlug,
      status: "simulated",
      eventKey: `${input.id}:gate`,
    },
  ];
}

// Run a whole book: derive every household and collect the pipeline ledger trail.
export function deriveBook(inputs: PipelineInput[]): { derived: Record<string, PipelineDerived>; events: LedgerDraft[] } {
  const derived: Record<string, PipelineDerived> = {};
  const events: LedgerDraft[] = [];
  for (const input of inputs) {
    const d = runPipeline(input);
    derived[input.id] = d;
    events.push(...pipelineEvents(input, d));
  }
  return { derived, events };
}
