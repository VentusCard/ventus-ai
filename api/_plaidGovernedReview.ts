declare const process: { env: Record<string, string | undefined> };

import { createHash, randomUUID } from "node:crypto";
import type { ConnectorPrincipal } from "./_connectorAuth.js";
import { configuredRuntime } from "./standalone-pilot-run.js";
import type { DecisionScenario } from "../src/lib/decision-contract.js";
import {
  governedStateForResult,
  type GovernedPilotResult,
  type GovernedRuntimeEnvelope,
} from "../src/lib/governed-runtime.js";
import type { PlaidTransaction } from "../src/lib/plaid.js";

const DEPOSIT_PROTOCOL_ID = "dcp_2080514d86e6e5d0d24b2a89";
const DEPOSIT_BUSINESS_LINE = "consumer-banking";

type GovernedRuntime = NonNullable<Awaited<ReturnType<typeof configuredRuntime>>>;

export async function preparePlaidGovernedReview({
  principal,
  scenario,
  transactions,
  runtime,
  now = () => new Date().toISOString(),
  runId = randomUUID().replaceAll("-", "").slice(0, 24),
}: {
  principal: ConnectorPrincipal;
  scenario: DecisionScenario;
  transactions: PlaidTransaction[];
  runtime: GovernedRuntime;
  now?: () => string;
  runId?: string;
}): Promise<GovernedPilotResult> {
  if (scenario !== "deposit-retention") {
    throw new Error("only the Deposit Growth Play has an approved Plaid source contract");
  }
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(runId)) throw new Error("runId is invalid");

  const records = transactions.map(toDepositRecord);
  const latestRecordAt = Math.max(...records.map((record) => Date.parse(record.occurred_at)));
  const requestedAt = Date.parse(now());
  if (Number.isNaN(requestedAt)) throw new Error("server clock returned an invalid timestamp");
  const receivedAtMs = Math.max(requestedAt, latestRecordAt + 1);
  const receivedAt = new Date(receivedAtMs).toISOString();
  const eligibilityAt = new Date(receivedAtMs + 1).toISOString();
  const assignedAt = new Date(receivedAtMs + 2).toISOString();
  const runAt = new Date(receivedAtMs + 3).toISOString();
  const approved = await runtime.protocolRegistry.requireApproved({
    tenantId: principal.tenantId,
    decisionProtocolId: DEPOSIT_PROTOCOL_ID,
    businessLine: DEPOSIT_BUSINESS_LINE,
    at: assignedAt,
  });
  const growthPlay = approved.contract as {
    growth_play_id: string;
    objective: string;
    policy: { version: string; required_policy_ids: string[] };
    eligibility: { criteria_version: string };
    measurement: { holdout_pct: number };
  };
  const transactionFingerprint = sha256(
    transactions.map((transaction) => transaction.transaction_id).sort().join("\u001f"),
  ).slice(0, 16);
  const householdToken = `tok_${sha256(`${principal.tenantId}\u001fplaid_custom_user\u001fdeposit-retention`).slice(0, 24)}`;

  return runtime.operatingLoop.runHousehold({
    growthPlay,
    tenantId: principal.tenantId,
    caseId: `case_plaid_${runId}`,
    householdToken,
    objective: growthPlay.objective,
    runAt,
    activationMode: "sandbox_review",
    destinationEnvironment: "sandbox",
    sessionId: principal.sessionId,
    records,
    sourceReceipt: {
      receiptId: `src_plaid_${runId}`,
      sourceSystem: "plaid_custom_user",
      batchId: `batch_${transactionFingerprint}_${runId.slice(0, 8)}`,
      schemaVersion: "plaid-transactions-1",
      recordCount: records.length,
      receivedAt,
      evidenceClass: "sandbox",
    },
    eligibilityReceipt: {
      receiptId: `elig_plaid_${runId}`,
      criteriaVersion: growthPlay.eligibility.criteria_version,
      eligible: true,
      evaluatedAt: eligibilityAt,
      evidenceTransactionIds: records.map((record) => record.transaction_id),
    },
    policyVersion: growthPlay.policy.version,
    policies: growthPlay.policy.required_policy_ids.map((policyId) => ({
      policy_id: policyId,
      verdict: "clear",
    })),
    experiment: {
      experimentId: `exp_${DEPOSIT_PROTOCOL_ID.replace(/^dcp_/, "")}`,
      holdoutPct: growthPlay.measurement.holdout_pct,
      assignmentSalt: runtime.assignmentSalt,
      assignedAt,
    },
  }) as Promise<GovernedPilotResult>;
}

export async function maybePreparePlaidGovernedReview(input: {
  principal: ConnectorPrincipal;
  scenario: DecisionScenario;
  transactions: PlaidTransaction[];
}): Promise<GovernedRuntimeEnvelope> {
  if (process.env.ENABLE_STANDALONE_PILOT_RUNTIME !== "true") return { state: "disabled" };
  if (input.scenario !== "deposit-retention") return { state: "unsupported" };

  try {
    const runtime = await configuredRuntime();
    if (!runtime) {
      return { state: "unavailable", error: "Durable governed review is not configured." };
    }
    const result = await preparePlaidGovernedReview({ ...input, runtime });
    return { state: governedStateForResult(result), result };
  } catch {
    return { state: "unavailable", error: "Durable governed review is unavailable." };
  }
}

function toDepositRecord(transaction: PlaidTransaction) {
  const category = transaction.personal_finance_category?.primary ?? "UNCLASSIFIED";
  const rail = category === "INCOME"
    ? "ach"
    : category === "TRANSFER_OUT"
      ? "p2p"
      : transaction.payment_channel === "online" || transaction.payment_channel === "in store"
        ? "card"
        : "ach";
  return {
    transaction_id: transaction.transaction_id,
    rail,
    amount: transaction.amount,
    source_system: rail === "p2p" ? "payments_core" : "deposit_core",
    occurred_at: `${transaction.date}T12:00:00.000Z`,
    merchant_name: transaction.merchant_name || transaction.name,
    category,
  };
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
