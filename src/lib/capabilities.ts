export type CapabilityStatus = "pilot-scope" | "prototype" | "evaluation-locked";

export type CapabilityDefinition = {
  id: string;
  title: string;
  leadershipPromise: string;
  aiRole: string;
  humanControl: string;
  userMoment: string;
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
    aiRole: "Normalize permitted records and infer a time-sensitive financial-state change.",
    humanControl: "Choose the source scope, eligible population, and confidence posture.",
    userMoment: "A ranked case arrives with the evidence that made it qualify.",
    internalReality: "A provider-neutral source-to-outcome operating loop and deterministic synthetic pipeline are implemented. The Plaid custom-user adapter is unit-proven and wired into the loop; its credentialed live run and bank calibration remain pilot work.",
    status: "pilot-scope",
    leadershipVisible: true,
    evidenceGate: ["Golden-set precision >= 90%", "Source provenance complete", "Drift baseline established"],
  },
  {
    id: "decisioning",
    title: "Governed next-best intervention",
    leadershipPromise: "Recommend one explainable action tied to a measurable P&L objective.",
    aiRole: "Rank one eligible action and prepare the supporting rationale.",
    humanControl: "Accept, adjust, or reject the action; policy owners set exclusions.",
    userMoment: "The employee receives one prepared next step instead of an unranked list.",
    internalReality: "Rules and authored scenarios are working. A closed-action, evidence-bound model planner and draft 14-case benchmark are implemented for shadow evaluation only; labels are not independently frozen and no model is approved for runtime use.",
    status: "pilot-scope",
    leadershipVisible: true,
    evidenceGate: ["Action acceptance >= 35%", "Policy owner approves exclusions", "No material fairness exceptions"],
  },
  {
    id: "activation",
    title: "Existing-channel activation",
    leadershipPromise: "Stage decisions into banker, advisor, CRM, and digital channels without a new frontline login.",
    aiRole: "Package the approved decision for the destination and return a delivery receipt.",
    humanControl: "Choose the destination and release mode; employees retain the final action.",
    userMoment: "The work item appears in the CRM or workbench already used that day.",
    internalReality: "A real Salesforce Task write was operator-confirmed in a test org. System-native payloads, short-lived tenant/scope/destination sessions, and an at-most-once receipt contract are implemented; bank identity and a deployed receipt store remain unconnected.",
    status: "pilot-scope",
    leadershipVisible: true,
    evidenceGate: ["Sandbox write succeeds", "Idempotency verified", "Bank identity and authorization integrated"],
  },
  {
    id: "measurement",
    title: "Incremental outcome measurement",
    leadershipPromise: "Measure retention and NNA lift against a governed holdout before scaling.",
    aiRole: "Join outcomes, enforce coverage gates, and calculate incremental lift.",
    humanControl: "Leadership chooses to scale, refine, or hold after reviewing the evidence.",
    userMoment: "A decision-ready result replaces activity and engagement proxies.",
    internalReality: "Deterministic assignment, idempotent outcomes, experiment-integrity checks, coverage gates, and 95% uncertainty intervals are implemented and tested; deployment, a completed bank feed, and independent review remain pilot work.",
    status: "prototype",
    leadershipVisible: true,
    evidenceGate: ["Holdout assigned before activation", "Outcome window completed", "Lift statistically reviewed"],
  },
  {
    id: "skill-compiler",
    title: "Model-assisted Skill compiler",
    leadershipPromise: "Convert approved business objectives into reusable decision packages.",
    aiRole: "Draft triggers, cohorts, interventions, controls, and measurement from an objective.",
    humanControl: "Approve the metric, evidence, policy, owner, and holdout before evaluation.",
    userMoment: "A new objective becomes a reviewable Growth Play, never an automatic campaign.",
    internalReality: "Local deterministic compiler only. External-model compilation remains evaluation-only and disabled.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["BofA sponsor approves evaluation", "Model benchmark beats deterministic baseline", "Structured output validation passes"],
  },
  {
    id: "decision-ledger",
    title: "Decision Ledger",
    leadershipPromise: "Create a traceable record from signal through activation and measured outcome.",
    aiRole: "Record the source, decision, approval, delivery, and outcome as one chain.",
    humanControl: "Set retention, access, and audit policy; investigate any chain break.",
    userMoment: "Every recommendation can be traced back to permitted evidence and ownership.",
    internalReality: "SHA-256 append, idempotency, tenant serialization, integrity export, forced-RLS migrations, and live verification scripts are implemented and tested; a DATABASE_URL-backed store and runtime-role isolation verification are not deployed.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["Deploy append-only store", "Verify RLS and restore integrity", "Approve tenant retention policy"],
  },
  {
    id: "multi-model",
    title: "Multi-model routing",
    leadershipPromise: "Use fit-for-purpose models behind a bank-controlled gateway.",
    aiRole: "Route evaluation tasks by quality, latency, cost, and data-boundary requirements.",
    humanControl: "Approve providers, tasks, quality gates, and runtime promotion.",
    userMoment: "Users see a consistent result while model choice remains governed behind it.",
    internalReality: "Task routing, evaluation rubrics, invocation audit metadata, and a shadow intervention-planning gate exist. Runtime OpenRouter use is disabled for the product demo, and no provider has been selected for bank deployment.",
    status: "evaluation-locked",
    leadershipVisible: false,
    evidenceGate: ["BofA sponsor approves evaluation", "Quality/cost benchmark completed", "Provider and data-boundary review"],
  },
  {
    id: "autonomous-promotion",
    title: "Autonomous Skill promotion",
    leadershipPromise: "Advance proven strategies from shadow to assisted execution under governance.",
    aiRole: "Monitor evidence gates and recommend a safer next operating stage.",
    humanControl: "The accountable owner signs off before any increase in autonomy or reach.",
    userMoment: "Only proven Growth Plays advance; weak ones return for refinement.",
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
