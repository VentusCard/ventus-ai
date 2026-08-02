export type GovernedDecision = {
  growthPlayId: string;
  abstain: boolean;
  abstainReason?: string | null;
  confidence: number;
  evidence: Array<{
    transaction_id: string;
    signal_type: string;
    summary: string;
  }>;
  actionId: string | null;
  ownerRole: string | null;
  connector: string | null;
  destination: string | null;
  cohort: string | null;
  deliveryPayload: Record<string, unknown> | null;
};

export type GovernedPilotResult = {
  tenantId: string;
  caseId: string;
  householdToken: string;
  evidenceClass: "sandbox" | "sanctioned";
  growthPlayId: string;
  growthPlayVersion: string;
  decisionProtocolId: string;
  decisionId: string;
  decision: GovernedDecision | null;
  assignment: {
    experimentId: string;
    arm: "treatment" | "holdout";
  } | null;
  activation: "review_required" | "holdout" | "suppressed";
  receipt: null;
  businessClaimAllowed: false;
};

export type GovernedRuntimeEnvelope =
  | { state: "disabled" | "unsupported" }
  | { state: "unavailable"; error: string }
  | {
      state: "prepared" | "holdout" | "suppressed";
      result: GovernedPilotResult;
    };

export type GovernedActivationResult = Omit<GovernedPilotResult, "activation" | "receipt"> & {
  decision: GovernedDecision;
  activation: "delivered" | "failed" | "reconciliation_required";
  receipt: {
    delivery_id?: string;
    deliveryId?: string;
    external_receipt_id?: string | null;
    externalReceiptId?: string | null;
    external_receipt_url?: string | null;
    externalReceiptUrl?: string | null;
    status?: string;
  } | null;
};

export function governedStateForResult(
  result: GovernedPilotResult,
): "prepared" | "holdout" | "suppressed" {
  if (result.activation === "review_required") return "prepared";
  return result.activation;
}
