export const DECISION_PACKAGE_VERSION = "1.1" as const;
export const DECISION_PACKAGE_V12_VERSION = "1.2" as const;

export type DecisionAction = {
  id: string;
  title: string;
  instructions: string;
  ownerRole: string;
  destination: string;
  connector?: string;
  destinationKey?: string;
  destinationEnvironment?: "sandbox" | "production";
};

export type DecisionEvidence = {
  id: string;
  label: string;
  confidence: number;
  source: string;
};

export type DecisionOutcomeObservation = {
  eventId: string;
  eventType: string;
  occurredAt: string;
  sourceSystem: string;
  sourceRecordId: string;
  reasonCode?: string;
  value?: {
    metric: string;
    amount: number;
    currency: "USD";
  };
};

export type DecisionPackage = {
  schemaVersion: typeof DECISION_PACKAGE_VERSION;
  decisionId: string;
  tenantId: string;
  createdAt: string;
  evidenceClass: "fixture" | "sandbox" | "sanctioned";
  growthPlay: {
    id: string;
    name: string;
    businessLine: string;
    objective: string;
    primaryMetric: string;
    protocolId: string;
  };
  subject: {
    token: string;
    accountId?: string;
  };
  moment: {
    type: string;
    summary: string;
    confidence: number;
    evidence: DecisionEvidence[];
  };
  recommendation: {
    selectedAction: DecisionAction;
    alternatives: DecisionAction[];
  };
  governance: {
    policyStatus: "cleared" | "suppressed" | "review";
    controls: string[];
    humanReviewRequired: boolean;
    assignmentArm: "treatment" | "holdout";
  };
  decisionMethod: {
    active: "deterministic-baseline" | "model-assisted";
    shadowCandidate?: string;
  };
  response: {
    status: "pending" | "accepted" | "modified" | "deferred" | "declined";
    actor?: string;
    reason?: string;
    recordedAt?: string;
  };
  workflow: {
    connector: string;
    status: "ready" | "delivered" | "failed";
    records?: Record<string, string>;
  };
  outcome: {
    metric: string;
    windowDays: number;
    status: "not-opened" | "measuring" | "measured";
    observation?: DecisionOutcomeObservation;
  };
};

// v1.2 is additive. Existing connector and demo consumers continue to receive
// v1.1 until their server-side parser advertises v1.2 support.
export type DecisionPackageV12 = Omit<
  DecisionPackage,
  "schemaVersion" | "evidenceClass" | "subject" | "moment" | "recommendation" | "governance" | "decisionMethod" | "response" | "workflow" | "outcome"
> & {
  schemaVersion: typeof DECISION_PACKAGE_V12_VERSION;
  evidenceClass: "fixture" | "partner_sandbox" | "sanctioned_pilot";
  subject: DecisionPackage["subject"] & {
    scope: "customer" | "household" | "account" | "business";
    displayReference?: string;
  };
  moment: DecisionPackage["moment"] & {
    confidenceBand: "low" | "medium" | "high";
    observedAt: string;
    expiresAt?: string;
    urgency: "routine" | "time-sensitive" | "urgent";
    evidence: Array<DecisionEvidence & { receiptId?: string; observedAt?: string }>;
  };
  recommendation: DecisionPackage["recommendation"] & {
    rationale: string;
    actionCatalogVersion: string;
  };
  governance: DecisionPackage["governance"] & {
    policyVersion: string | null;
    protocolApprovalId: string | null;
    approvalStatus: "approved" | "not_attested";
    exceptionStatus: "none" | "open" | "resolved";
  };
  decisionMethod: {
    runtimeType: "deterministic" | "model_assisted";
    runtimeVersion: string;
    skillVersions: string[];
    modelInvocation?: {
      provider: string;
      model: string;
      modelArtifactVersion: string;
    };
  };
  workflowIntent: {
    connector: string;
    destination: string;
    ownerRole: string;
  };
  measurementPlan: {
    metric: string;
    outcomeEventTypes: string[];
    outcomeSourceSystems: string[];
    windowDays: number;
  };
  packageDigest: string;
};

export async function decisionPackageV12FromV11(
  decision: DecisionPackage,
  additions: {
    subjectScope: DecisionPackageV12["subject"]["scope"];
    protocolApprovalId?: string | null;
    actionCatalogVersion: string;
    rationale: string;
    observedAt?: string;
    urgency?: DecisionPackageV12["moment"]["urgency"];
    runtimeVersion?: string;
    outcomeEventTypes?: string[];
    outcomeSourceSystems?: string[];
  },
): Promise<DecisionPackageV12> {
  const confidenceBand = decision.moment.confidence >= 80 ? "high" : decision.moment.confidence >= 60 ? "medium" : "low";
  const immutable = {
    schemaVersion: DECISION_PACKAGE_V12_VERSION,
    decisionId: decision.decisionId,
    tenantId: decision.tenantId,
    createdAt: decision.createdAt,
    evidenceClass: decision.evidenceClass === "fixture" ? "fixture" : decision.evidenceClass === "sanctioned" ? "sanctioned_pilot" : "partner_sandbox",
    growthPlay: decision.growthPlay,
    subject: { ...decision.subject, scope: additions.subjectScope },
    moment: {
      ...decision.moment,
      confidenceBand,
      observedAt: additions.observedAt ?? decision.createdAt,
      urgency: additions.urgency ?? "routine",
    },
    recommendation: {
      ...decision.recommendation,
      rationale: additions.rationale,
      actionCatalogVersion: additions.actionCatalogVersion,
    },
    governance: {
      ...decision.governance,
      policyVersion: null,
      protocolApprovalId: additions.protocolApprovalId ?? null,
      approvalStatus: additions.protocolApprovalId ? "approved" : "not_attested",
      exceptionStatus: "none",
    },
    decisionMethod: {
      runtimeType: decision.decisionMethod.active === "model-assisted" ? "model_assisted" : "deterministic",
      runtimeVersion: additions.runtimeVersion ?? "console-runtime-v1",
      skillVersions: [`${decision.growthPlay.id}:${decision.growthPlay.protocolId}`],
    },
    workflowIntent: {
      connector: decision.workflow.connector,
      destination: decision.recommendation.selectedAction.destination,
      ownerRole: decision.recommendation.selectedAction.ownerRole,
    },
    measurementPlan: {
      metric: decision.outcome.metric,
      outcomeEventTypes: additions.outcomeEventTypes ?? [],
      outcomeSourceSystems: additions.outcomeSourceSystems ?? [],
      windowDays: decision.outcome.windowDays,
    },
  };
  return { ...immutable, packageDigest: await digestDecisionPackage(immutable) };
}

async function digestDecisionPackage(value: object): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalJson(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export type DecisionPackageInput = Omit<
  DecisionPackage,
  "schemaVersion" | "response" | "workflow" | "outcome"
> & {
  response?: Partial<DecisionPackage["response"]>;
  workflow?: Partial<DecisionPackage["workflow"]>;
  outcome?: Partial<DecisionPackage["outcome"]>;
};

export function createDecisionPackage(input: DecisionPackageInput): DecisionPackage {
  return {
    ...input,
    schemaVersion: DECISION_PACKAGE_VERSION,
    response: {
      status: "pending",
      ...input.response,
    },
    workflow: {
      connector: "salesforce-fsc",
      status: "ready",
      ...input.workflow,
    },
    outcome: {
      metric: input.growthPlay.primaryMetric,
      windowDays: 30,
      status: "not-opened",
      ...input.outcome,
    },
  };
}

export function respondToDecision(
  decisionPackage: DecisionPackage,
  response: Exclude<DecisionPackage["response"]["status"], "pending">,
  actor: string,
  selectedAction: DecisionAction,
  reason?: string,
): DecisionPackage {
  return {
    ...decisionPackage,
    recommendation: {
      ...decisionPackage.recommendation,
      selectedAction,
    },
    response: {
      status: response,
      actor,
      reason,
      recordedAt: new Date().toISOString(),
    },
  };
}

export function applyOutcomeObservation(
  decisionPackage: DecisionPackage,
  input: {
    response?: Partial<DecisionPackage["response"]>;
    status: DecisionPackage["outcome"]["status"];
    observation?: DecisionOutcomeObservation;
  },
): DecisionPackage {
  const { observation: _previousObservation, ...outcomeWithoutObservation } = decisionPackage.outcome;
  return {
    ...decisionPackage,
    response: input.response
      ? {
          ...decisionPackage.response,
          ...input.response,
        }
      : decisionPackage.response,
    outcome: {
      ...outcomeWithoutObservation,
      status: input.status,
      ...(input.observation ? { observation: input.observation } : {}),
    },
  };
}
