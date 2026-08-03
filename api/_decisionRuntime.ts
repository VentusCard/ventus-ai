import { createHash } from "node:crypto";
import {
  DECISION_RUN_SCHEMA,
  growthPlayForScenario,
  type DecisionRunRequest,
  type DecisionRunResult,
} from "../src/lib/decision-contract.js";
import {
  applyOpportunityPolicy,
  buildOpportunityFromPlaid,
} from "../src/lib/plaid.js";

export function executeDecisionRun({
  tenantId,
  request,
  now = new Date(),
}: {
  tenantId: string;
  request: DecisionRunRequest;
  now?: Date;
}): DecisionRunResult {
  const opportunity = buildOpportunityFromPlaid(request.transactions);
  const policy = applyOpportunityPolicy(opportunity, request.policyContext);
  const decisionId = stableDecisionId(tenantId, request);
  const status = !opportunity
    ? "abstained"
    : policy.allowed
      ? "qualified"
      : "suppressed";

  return {
    schemaVersion: DECISION_RUN_SCHEMA,
    decisionId,
    tenantId,
    scenario: request.scenario,
    growthPlay: growthPlayForScenario(request.scenario),
    generatedAt: now.toISOString(),
    status,
    source: {
      mode: request.source.mode,
      name: request.source.name,
      recordCount: request.transactions.length,
      transactionRefs: request.transactions.map((transaction) => transaction.transaction_id),
    },
    runtime: {
      engine: "deterministic-baseline",
      version: "plaid-rules-v1",
      policyVersion: "mvp-policy-v1",
      modelInvocation: null,
    },
    opportunity,
    policy,
  };
}

function stableDecisionId(tenantId: string, request: DecisionRunRequest): string {
  const input = JSON.stringify({
    tenantId,
    scenario: request.scenario,
    transactions: request.transactions.map((transaction) => ({
      id: transaction.transaction_id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.personal_finance_category,
    })),
    policyContext: request.policyContext ?? {},
  });
  return `dec_${createHash("sha256").update(input).digest("hex").slice(0, 24)}`;
}
