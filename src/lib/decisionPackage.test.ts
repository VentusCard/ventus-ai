import assert from "node:assert/strict";
import test from "node:test";
import { createDecisionPackage, respondToDecision } from "./decisionPackage.ts";

const primaryAction = {
  id: "banker-review",
  title: "Open a banker review",
  instructions: "Review before the next payroll cycle.",
  ownerRole: "Relationship banker",
  destination: "Salesforce FSC",
};

test("decision package carries a portable governed decision contract", () => {
  const decision = createDecisionPackage({
    decisionId: "dec_123",
    tenantId: "bank_1",
    createdAt: "2026-07-27T12:00:00.000Z",
    evidenceClass: "sandbox",
    growthPlay: {
      id: "deposit-retention",
      name: "Deposit Primacy Defense",
      businessLine: "Consumer Banking",
      objective: "Protect primary deposit relationships",
      primaryMetric: "deposit_retained",
      protocolId: "deposit-retention-v1",
    },
    subject: { token: "household-token" },
    moment: {
      type: "Checking primacy at risk",
      summary: "Payroll remains while balances move off-bank.",
      confidence: 91,
      evidence: [{ id: "payroll", label: "Direct deposit", confidence: 100, source: "Plaid sandbox" }],
    },
    recommendation: {
      selectedAction: primaryAction,
      alternatives: [],
    },
    governance: {
      policyStatus: "cleared",
      controls: ["Consent", "Eligibility"],
      humanReviewRequired: true,
      assignmentArm: "treatment",
    },
    decisionMethod: {
      active: "deterministic-baseline",
      shadowCandidate: "model-assisted-planner",
    },
  });

  assert.equal(decision.schemaVersion, "1.0");
  assert.equal(decision.response.status, "pending");
  assert.equal(decision.workflow.status, "ready");
  assert.equal(decision.outcome.metric, "deposit_retained");
  assert.equal(decision.outcome.status, "not-opened");

  const accepted = respondToDecision(decision, "accepted", "operator@bank.com", primaryAction);
  assert.equal(accepted.response.status, "accepted");
  assert.equal(accepted.response.actor, "operator@bank.com");
  assert.equal(accepted.recommendation.selectedAction.id, "banker-review");
});
