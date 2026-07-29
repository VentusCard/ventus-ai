export const DECISION_PACKAGE_VERSION = "1.1" as const;

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
