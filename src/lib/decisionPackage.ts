export const DECISION_PACKAGE_VERSION = "1.1" as const;
export const DECISION_PACKAGE_V12_VERSION = "1.2" as const;

export type DecisionAction = {
  id: string;
  title: string;
  instructions: string;
  ownerRole: string;
  destination: string;
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
  "schemaVersion" | "subject" | "moment" | "recommendation" | "governance" | "workflow" | "outcome"
> & {
  schemaVersion: typeof DECISION_PACKAGE_V12_VERSION;
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
    protocolApprovalId: string;
    exceptionStatus: "none" | "open" | "resolved";
  };
  workflow: Omit<DecisionPackage["workflow"], "status"> & {
    destination: string;
    ownerRole: string;
    status: "ready" | "reserved" | "delivered" | "failed" | "reconciled";
    deliveryId?: string;
  };
  outcome: DecisionPackage["outcome"] & {
    coverageStatus: "pending" | "insufficient" | "passed";
    claimStatus: "blocked" | "observational" | "measured";
  };
};

export function decisionPackageV12FromV11(
  decision: DecisionPackage,
  additions: {
    subjectScope: DecisionPackageV12["subject"]["scope"];
    protocolApprovalId: string;
    actionCatalogVersion: string;
    rationale: string;
    observedAt?: string;
    urgency?: DecisionPackageV12["moment"]["urgency"];
    workflow?: Partial<DecisionPackageV12["workflow"]>;
    outcome?: Partial<Pick<DecisionPackageV12["outcome"], "coverageStatus" | "claimStatus">>;
  },
): DecisionPackageV12 {
  const confidenceBand = decision.moment.confidence >= 80 ? "high" : decision.moment.confidence >= 60 ? "medium" : "low";
  return {
    ...decision,
    schemaVersion: DECISION_PACKAGE_V12_VERSION,
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
      protocolApprovalId: additions.protocolApprovalId,
      exceptionStatus: "none",
    },
    workflow: {
      ...decision.workflow,
      destination: decision.recommendation.selectedAction.destination,
      ownerRole: decision.recommendation.selectedAction.ownerRole,
      ...additions.workflow,
    },
    outcome: {
      ...decision.outcome,
      coverageStatus: additions.outcome?.coverageStatus ?? "pending",
      claimStatus: additions.outcome?.claimStatus ?? "blocked",
    },
  };
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
