import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { preparePlaidGovernedReview } from "./_plaidGovernedReview.ts";
import { compileGrowthPlayContract } from "../backend/shared/pilot/growth-play-contract.mjs";
import type { ConnectorPrincipal } from "./_connectorAuth.ts";
import type { PlaidTransaction } from "../src/lib/plaid.ts";

const drafts = JSON.parse(readFileSync(
  new URL("../backend/fixtures/evaluation/growth-play-drafts.json", import.meta.url),
  "utf8",
));
const deposit = compileGrowthPlayContract(
  drafts.find((draft: { growth_play_id?: string }) => draft.growth_play_id === "deposit-primacy-defense"),
);
const principal: ConnectorPrincipal = {
  tenantId: "bank_1",
  subject: "operator_1",
  scopes: ["plaid_read", "growth_play_activate"],
  destinations: ["plaid", "consumer-banking"],
  sessionId: "session_1",
  expiresAt: Math.floor(Date.now() / 1000) + 300,
  authMode: "session",
};
const transactions: PlaidTransaction[] = [
  {
    transaction_id: "tx_payroll_1",
    account_id: "account_1",
    name: "ACME PAYROLL",
    merchant_name: "ACME PAYROLL",
    amount: -4800,
    date: "2026-07-01",
    payment_channel: "other",
    personal_finance_category: { primary: "INCOME", detailed: "INCOME_WAGES" },
  },
  {
    transaction_id: "tx_offbank_1",
    account_id: "account_1",
    name: "CHIME TRANSFER",
    merchant_name: "CHIME",
    amount: 2100,
    date: "2026-07-05",
    payment_channel: "online",
    personal_finance_category: { primary: "TRANSFER_OUT", detailed: "TRANSFER_OUT_ACCOUNT_TRANSFER" },
  },
];

test("live Plaid preparation derives the approved, treatment-ready runtime input server-side", async () => {
  const approvals: Array<Record<string, unknown>> = [];
  const runs: Array<Record<string, unknown>> = [];
  const expected = {
    tenantId: "bank_1",
    caseId: "case_plaid_run_00000001",
    householdToken: "tok_opaque_household",
    evidenceClass: "sandbox",
    growthPlayId: deposit.growth_play_id,
    growthPlayVersion: deposit.version,
    decisionProtocolId: deposit.decision_protocol_id,
    decisionId: "dec_prepared_1",
    decision: {
      growthPlayId: deposit.growth_play_id,
      abstain: false,
      confidence: 0.91,
      evidence: [
        { transaction_id: "tx_payroll_1", signal_type: "payroll_present", summary: "Payroll remains active." },
        { transaction_id: "tx_offbank_1", signal_type: "offbank_outflow", summary: "Money is moving off-bank." },
      ],
      actionId: "banker_retention_review",
      ownerRole: "relationship_banker",
      connector: "bank_workbench",
      destination: "banker_workbench",
      cohort: "primary_deposit_at_risk",
      deliveryPayload: { household_token: "tok_opaque_household", action: "banker_retention_review" },
    },
    assignment: { experimentId: `exp_${deposit.decision_protocol_id.slice(4)}`, arm: "treatment" },
    activation: "review_required",
    receipt: null,
    businessClaimAllowed: false,
  };
  const runtime = {
    assignmentSalt: "assignment-salt-at-least-16-characters",
    deliveryConfigured: true,
    protocolRegistry: {
      async requireApproved(input: Record<string, unknown>) {
        approvals.push(input);
        return { contract: deposit };
      },
    },
    operatingLoop: {
      async runHousehold(input: Record<string, unknown>) {
        runs.push(input);
        return expected;
      },
    },
  };

  const result = await preparePlaidGovernedReview({
    principal,
    scenario: "deposit-retention",
    transactions,
    runtime: runtime as never,
    now: () => "2026-07-28T12:00:00.000Z",
    runId: "run_00000001",
  });

  assert.equal(result, expected);
  assert.equal(approvals[0].decisionProtocolId, deposit.decision_protocol_id);
  assert.equal(approvals[0].businessLine, "consumer-banking");
  const input = runs[0] as {
    tenantId: string;
    sessionId: string;
    activationMode: string;
    records: Array<Record<string, unknown>>;
    sourceReceipt: Record<string, unknown>;
    eligibilityReceipt: Record<string, unknown>;
    experiment: Record<string, unknown>;
    policies: Array<Record<string, unknown>>;
  };
  assert.equal(input.tenantId, principal.tenantId);
  assert.equal(input.sessionId, principal.sessionId);
  assert.equal(input.activationMode, "sandbox_review");
  assert.deepEqual(
    input.records.map((record) => [record.transaction_id, record.rail, record.source_system]),
    [
      ["tx_payroll_1", "ach", "deposit_core"],
      ["tx_offbank_1", "p2p", "payments_core"],
    ],
  );
  assert.equal(input.sourceReceipt.sourceSystem, "plaid_custom_user");
  assert.equal(input.sourceReceipt.evidenceClass, "sandbox");
  assert.equal(input.eligibilityReceipt.eligible, true);
  assert.equal(input.experiment.holdoutPct, deposit.measurement.holdout_pct);
  assert.deepEqual(
    input.policies.map((policy) => policy.policy_id).sort(),
    deposit.policy.required_policy_ids,
  );
  assert.equal(JSON.stringify(input).includes("account_1"), false);
});

test("Plaid-only preparation refuses to fabricate Merrill-side evidence", async () => {
  await assert.rejects(
    () => preparePlaidGovernedReview({
      principal,
      scenario: "wealth-growth",
      transactions,
      runtime: {} as never,
      runId: "run_00000002",
    }),
    /only the Deposit Growth Play/,
  );
});
