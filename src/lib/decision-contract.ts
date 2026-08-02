import type {
  DetectedOpportunity,
  OpportunityPolicyContext,
  OpportunityPolicyDecision,
  PlaidTransaction,
} from "./plaid";

export const DECISION_RUN_SCHEMA = "ventus.decision-run.v1" as const;

export type DecisionScenario = "deposit-retention" | "wealth-growth";
export type DecisionSourceMode = "live" | "fixture";
export type DecisionStatus = "qualified" | "suppressed" | "abstained";

export type DecisionRunRequest = {
  scenario: DecisionScenario;
  transactions: PlaidTransaction[];
  source: {
    mode: DecisionSourceMode;
    name: string;
  };
  policyContext?: OpportunityPolicyContext;
};

export type DecisionRunResult = {
  schemaVersion: typeof DECISION_RUN_SCHEMA;
  decisionId: string;
  tenantId: string;
  scenario: DecisionScenario;
  growthPlay: string;
  generatedAt: string;
  status: DecisionStatus;
  source: {
    mode: DecisionSourceMode;
    name: string;
    recordCount: number;
    transactionRefs: string[];
  };
  runtime: {
    engine: "deterministic-baseline";
    version: "plaid-rules-v1";
    policyVersion: "mvp-policy-v1";
    modelInvocation: null;
  };
  ledgerReceipt?: {
    persisted: true;
    inserted: boolean;
    sequenceNumber: number;
    eventHash: string;
    recordedAt: string;
  };
  opportunity: DetectedOpportunity | null;
  policy: OpportunityPolicyDecision;
};

export function growthPlayForScenario(scenario: DecisionScenario): string {
  return scenario === "deposit-retention"
    ? "Deposit Primacy Defense"
    : "Merrill Relationship Growth";
}
