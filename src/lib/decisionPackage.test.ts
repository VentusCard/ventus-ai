import assert from "node:assert/strict";
import test from "node:test";
import {
  applyOutcomeObservation,
  createDecisionPackage,
  decisionPackageV12FromV11,
  respondToDecision,
} from "./decisionPackage.ts";

const primaryAction = {
  id: "banker-review",
  title: "Open a banker review",
  instructions: "Review before the next payroll cycle.",
  ownerRole: "Relationship banker",
  destination: "Salesforce FSC",
};

test("decision package carries a portable governed decision contract", async () => {
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

  assert.equal(decision.schemaVersion, "1.1");
  assert.equal(decision.response.status, "pending");
  assert.equal(decision.workflow.status, "ready");
  assert.equal(decision.outcome.metric, "deposit_retained");
  assert.equal(decision.outcome.status, "not-opened");

  const accepted = respondToDecision(decision, "accepted", "operator@bank.com", primaryAction);
  assert.equal(accepted.response.status, "accepted");
  assert.equal(accepted.response.actor, "operator@bank.com");
  assert.equal(accepted.recommendation.selectedAction.id, "banker-review");

  const measured = applyOutcomeObservation(accepted, {
    response: {
      status: "accepted",
      actor: "005000000000001AAA",
      recordedAt: "2026-08-27T17:00:00.000Z",
    },
    status: "measured",
    observation: {
      eventId: "sf_a01000000000001AAA_1787850000000",
      eventType: "deposit_retained",
      occurredAt: "2026-08-27T17:00:00.000Z",
      sourceSystem: "salesforce-fsc",
      sourceRecordId: "bank_outcome_123",
      value: {
        metric: "deposit_retained",
        amount: 200,
        currency: "USD",
      },
    },
  });
  assert.equal(measured.outcome.status, "measured");
  assert.equal(measured.outcome.observation?.eventType, "deposit_retained");
  assert.equal(measured.outcome.observation?.value?.amount, 200);

  const reopened = applyOutcomeObservation(measured, {
    status: "measuring",
  });
  assert.equal(reopened.outcome.status, "measuring");
  assert.equal(reopened.outcome.observation, undefined);

  const v12 = await decisionPackageV12FromV11(accepted, {
    subjectScope: "household",
    protocolApprovalId: "approval_123",
    actionCatalogVersion: "deposit-actions-v1",
    rationale: "Payroll and off-bank migration meet the approved play criteria.",
  });
  assert.equal(v12.schemaVersion, "1.2");
  assert.equal(v12.subject.scope, "household");
  assert.equal(v12.moment.confidenceBand, "high");
  assert.equal(v12.workflowIntent.destination, "Salesforce FSC");
  assert.equal(v12.governance.approvalStatus, "approved");
  assert.match(v12.packageDigest, /^sha256:[a-f0-9]{64}$/);
});
