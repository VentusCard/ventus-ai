export type CapabilityStatus = "pilot-scope" | "prototype" | "evaluation-locked";

export type CapabilityDefinition = {
  id: string;
  title: string;
  leadershipPromise: string;
  internalReality: string;
  status: CapabilityStatus;
  leadershipVisible: boolean;
  evidenceGate: string[];
};

// One registry drives both surfaces. The BofA demo reads only leadershipVisible
// capabilities; the internal console reads the implementation truth and evidence gates.
export const CAPABILITIES: readonly CapabilityDefinition[] = [
  {
    id: "financial-state",
    title: "Financial-state intelligence",
    leadershipPromise: "Recognize timely relationship changes across sanctioned bank data.",
    internalReality: "A provider-neutral source-to-outcome operating loop and deterministic synthetic pipeline are implemented. Live partner adapters and bank calibration remain pilot work.",
    status: "pilot-scope",
    leadershipVisible: true,
    evidenceGate: ["Golden-set precision >= 90%", "Source provenance complete", "Drift baseline established"],
  },
  {
    id: "decisioning",
    title: "Governed next-best intervention",
    leadershipPromise: "Recommend one explainable action tied to a measurable P&L objective.",
    internalReality: "Rules and authored scenarios are working. A closed-action, evidence-bound model planner and draft 14-case benchmark are implemented for shadow evaluation only; labels are not independently frozen and no model is approved for runtime use.",
    status: "pilot-scope",
    leadershipVisible: true,
    evidenceGate: ["Action acceptance >= 35%", "Policy owner approves exclusions", "No material fairness exceptions"],
  },
  {
    id: "activation",
    title: "Existing-channel activation",
    leadershipPromise: "Stage decisions into banker, advisor, CRM, and digital channels without a new frontline login.",
    internalReality: "System-native payloads, short-lived tenant/scope/destination session checks, and an at-most-once persistent receipt contract exist. Bank identity, the receipt store, and authenticated sandbox delivery are not connected.",
    status: "pilot-scope",
    leadershipVisible: true,
    evidenceGate: ["Sandbox write succeeds", "Idempotency verified", "Bank identity and authorization integrated"],
  },
  {
    id: "measurement",
    title: "Incremental outcome measurement",
    leadershipPromise: "Measure retention and NNA lift against a governed holdout before scaling.",
    internalReality: "Deterministic assignment, idempotent outcomes, experiment-integrity checks, coverage gates, and 95% uncertainty intervals are implemented and tested; deployment, a completed bank feed, and independent review remain pilot work.",
    status: "prototype",
    leadershipVisible: true,
    evidenceGate: ["Holdout assigned before activation", "Outcome window completed", "Lift statistically reviewed"],
  },
  {
    id: "skill-compiler",
    title: "Model-assisted Skill compiler",
    leadershipPromise: "Convert approved business objectives into reusable decision packages.",
    internalReality: "Local deterministic compiler only. External-model compilation remains evaluation-only and disabled.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["BofA sponsor approves evaluation", "Model benchmark beats deterministic baseline", "Structured output validation passes"],
  },
  {
    id: "decision-ledger",
    title: "Decision Ledger",
    leadershipPromise: "Create a traceable record from signal through activation and measured outcome.",
    internalReality: "SHA-256 append, idempotency, tenant serialization, integrity export, transaction-scoped tenant context, forced-RLS migrations, and rollback-only probes are implemented and tested; the store and isolation policy are not deployed.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["Deploy append-only store", "Verify RLS and restore integrity", "Approve tenant retention policy"],
  },
  {
    id: "multi-model",
    title: "Multi-model routing",
    leadershipPromise: "Use fit-for-purpose models behind a bank-controlled gateway.",
    internalReality: "Task routing, evaluation rubrics, invocation audit metadata, and a shadow intervention-planning gate exist. Runtime OpenRouter use is disabled for the product demo, and no provider has been selected for bank deployment.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["BofA sponsor approves evaluation", "Quality/cost benchmark completed", "Provider and data-boundary review"],
  },
  {
    id: "autonomous-promotion",
    title: "Autonomous Skill promotion",
    leadershipPromise: "Advance proven strategies from shadow to assisted execution under governance.",
    internalReality: "Promotion is locked until real sample, precision, fairness, approval, holdout, and lift evidence exist.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["Minimum sample satisfied", "Policy approval recorded", "Positive incremental lift", "Human owner signs off"],
  },
] as const;

export const leadershipCapabilities = () => CAPABILITIES.filter((capability) => capability.leadershipVisible);

export function capabilityStatusLabel(status: CapabilityStatus): string {
  if (status === "pilot-scope") return "Pilot scope";
  if (status === "prototype") return "Prototype";
  return "Locked pending approval";
}
