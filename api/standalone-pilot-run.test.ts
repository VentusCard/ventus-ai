import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { afterEach } from "node:test";
import { issueConnectorSession } from "./_connectorAuth.ts";
import { createStandalonePilotActivationHandler } from "./standalone-pilot-activate.ts";
import { createPilotWebhookDelivery, createStandalonePilotHandler } from "./standalone-pilot-run.ts";
import { compileGrowthPlayContract } from "../backend/shared/pilot/growth-play-contract.mjs";
import { createInMemoryGrowthPlayRegistry } from "../backend/shared/pilot/growth-play-registry.mjs";

const SECRET = "connector-session-test-secret-32-characters-minimum";
const NOW = new Date();
const REGISTERED_AT = new Date(NOW.getTime() - 120_000).toISOString();
const APPROVED_AT = new Date(NOW.getTime() - 60_000).toISOString();
const RUN_AT = NOW.toISOString();
const drafts = JSON.parse(readFileSync(
  new URL("../backend/fixtures/evaluation/growth-play-drafts.json", import.meta.url),
  "utf8",
));
type CompiledContract = {
  decision_protocol_id: string;
  growth_play_id: string;
  business_line: string;
  objective: string;
  eligibility: { criteria_version: string };
  policy: { version: string; required_policy_ids: string[] };
  measurement: { holdout_pct: number };
};
type CapturedInput = Record<string, unknown> & {
  tenantId: string;
  sessionId: string;
  growthPlay: CompiledContract;
  objective: string;
  runAt: string;
  experiment?: { experimentId: string; holdoutPct: number };
  destinationEnvironment?: string;
};
const deposit = compileGrowthPlayContract(drafts[0]) as CompiledContract;
const merrill = compileGrowthPlayContract(drafts[1]) as CompiledContract;
const managedVariables = [
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "VENTUS_CONNECTOR_TOKEN",
  "VENTUS_ALLOW_LOCAL_CONNECTORS",
  "VENTUS_LOCAL_CONNECTOR_TENANT_ID",
] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("runtime derives tenant, protocol, experiment, timestamps, and session from trusted server context", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const registry = await approvedRegistry();
  const captured: Record<string, unknown>[] = [];
  const handle = createStandalonePilotHandler({
    protocolRegistry: registry,
    operatingLoop: {
      async runHousehold(input) {
        captured.push(input);
        return { activation: "shadow_only", decisionProtocolId: deposit.decision_protocol_id };
      },
    },
    assignmentSalt: "runtime-assignment-salt-32-characters",
    now: () => RUN_AT,
  });
  const token = runtimeToken("consumer-banking", "runtime_consumer_1");
  const response = await handle(request(token, bodyFor(deposit, "shadow")));
  assert.equal(response.status, 200);
  assert.equal(captured.length, 1);
  const input = captured[0] as CapturedInput;
  assert.equal(input.tenantId, "bank_1");
  assert.equal(input.sessionId, "runtime_consumer_1");
  assert.equal(input.growthPlay.decision_protocol_id, deposit.decision_protocol_id);
  assert.equal(input.objective, deposit.objective);
  assert.equal(input.experiment, undefined);
  assert.ok(Date.parse(input.runAt) > Date.parse(RUN_AT));
});

test("review and assisted runtimes derive a stable protocol-bound experiment and preserve business-line isolation", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const registry = await approvedRegistry();
  const captured: CapturedInput[] = [];
  const handle = createStandalonePilotHandler({
    protocolRegistry: registry,
    operatingLoop: { async runHousehold(input) { captured.push(input as CapturedInput); return { activation: "holdout" }; } },
    assignmentSalt: "runtime-assignment-salt-32-characters",
    now: () => RUN_AT,
  });
  const consumer = runtimeToken("consumer-banking", "runtime_consumer_2");
  assert.equal((await handle(request(consumer, bodyFor(deposit, "sandbox_review")))).status, 200);
  assert.equal(captured[0].experiment.experimentId, `exp_${deposit.decision_protocol_id.slice(4)}`);
  assert.equal(captured[0].experiment.holdoutPct, deposit.measurement.holdout_pct);
  assert.equal(captured[0].destinationEnvironment, "sandbox");
  assert.equal((await handle(request(consumer, bodyFor(deposit, "sandbox_assisted")))).status, 200);
  assert.equal(captured[1].experiment.experimentId, captured[0].experiment.experimentId);
  assert.equal((await handle(request(consumer, bodyFor(merrill, "shadow")))).status, 403);
  assert.equal(captured.length, 2);
});

test("runtime rejects legacy, local-demo, unknown-field, and production activation paths", async () => {
  const registry = await approvedRegistry();
  const handle = createStandalonePilotHandler({
    protocolRegistry: registry,
    operatingLoop: { async runHousehold() { return { activation: "shadow_only" }; } },
    assignmentSalt: "runtime-assignment-salt-32-characters",
    now: () => RUN_AT,
  });
  process.env.VENTUS_CONNECTOR_TOKEN = "legacy-runtime-token";
  assert.equal((await handle(request("legacy-runtime-token", bodyFor(deposit, "shadow")))).status, 403);
  process.env.VENTUS_ALLOW_LOCAL_CONNECTORS = "true";
  const local = new Request("http://local/api/standalone-pilot-run", {
    method: "POST",
    headers: { "x-ventus-client": "web-app", "Content-Type": "application/json" },
    body: JSON.stringify(bodyFor(deposit, "shadow")),
  });
  assert.equal((await handle(local)).status, 403);

  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const token = runtimeToken("consumer-banking", "runtime_consumer_3");
  assert.equal((await handle(request(token, { ...bodyFor(deposit, "shadow"), tenantId: "attacker" }))).status, 400);
  assert.equal((await handle(request(token, bodyFor(deposit, "production_assisted")))).status, 400);
});

test("reviewed activation derives tenant, session, and activation time from its scoped server session", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const captured: Record<string, unknown>[] = [];
  const handle = createStandalonePilotActivationHandler({
    operatingLoop: {
      async activatePreparedDecision(input) {
        captured.push(input);
        return { activation: "delivered", decisionId: input.decisionId };
      },
    },
    now: () => RUN_AT,
  });
  const token = activationToken("consumer-banking", "runtime_activation_1");
  const response = await handle(activationRequest(token, {
    decisionId: "dec_review_001",
    businessLine: "consumer-banking",
    decision: decision(),
  }));
  assert.equal(response.status, 200);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].tenantId, "bank_1");
  assert.equal(captured[0].sessionId, "runtime_activation_1");
  assert.equal(captured[0].activatedAt, RUN_AT);

  const runOnly = runtimeToken("consumer-banking", "runtime_activation_denied");
  assert.equal((await handle(activationRequest(runOnly, {
    decisionId: "dec_review_001",
    businessLine: "consumer-banking",
    decision: decision(),
  }))).status, 403);
  assert.equal((await handle(activationRequest(token, {
    decisionId: "dec_review_001",
    businessLine: "wealth-management",
    decision: decision(),
  }))).status, 403);
  assert.equal(captured.length, 1);
});

test("webhook delivery requires HTTPS and a receipt, and returns a terminal failure otherwise", async () => {
  assert.throws(() => createPilotWebhookDelivery({ url: "http://example.test", bearer: "strong-delivery-bearer" }), /HTTPS/);
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const delivered = createPilotWebhookDelivery({
    url: "https://bank.example.test/ventus",
    bearer: "strong-delivery-bearer",
    fetchImpl: async (url, init) => {
      calls.push({ url: String(url), init });
      return Response.json({ receipt_id: "bank_receipt_001", receipt_url: "https://bank.example.test/receipt/001" });
    },
  });
  const success = await delivered({ input: { tenantId: "bank_1", caseId: "case_1" }, decision: decision() });
  assert.equal(success.status, "delivered");
  assert.equal(success.externalReceiptId, "bank_receipt_001");
  assert.equal(calls[0].init?.headers && (calls[0].init.headers as Record<string, string>).Authorization, "Bearer strong-delivery-bearer");

  const failed = createPilotWebhookDelivery({
    url: "https://bank.example.test/ventus",
    bearer: "strong-delivery-bearer",
    fetchImpl: async () => new Response("unavailable", { status: 503 }),
  });
  assert.equal((await failed({ input: {}, decision: decision() })).errorCode, "destination_http_503");
});

async function approvedRegistry() {
  const registry = createInMemoryGrowthPlayRegistry();
  for (const contract of [deposit, merrill]) {
    await registry.register({
      tenantId: "bank_1", contract, registeredBy: "configurator_1",
      registeredBySessionId: "config_session_1", identityProvider: "bank_sso", registeredAt: REGISTERED_AT,
    });
    await registry.recordApproval({
      tenantId: "bank_1", decisionProtocolId: contract.decision_protocol_id,
      businessLine: contract.business_line, decision: "approved", decidedBy: `${contract.business_line}_owner`,
      decidedBySessionId: `approval_${contract.business_line}`, identityProvider: "bank_sso",
      decidedAt: APPROVED_AT, changeRecordId: `change_${contract.growth_play_id}`,
      reason: "Approved for authenticated standalone runtime evaluation.",
    });
  }
  return registry;
}

function runtimeToken(businessLine: string, sessionId: string): string {
  return issueConnectorSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject: "pilot_source_service",
    scopes: ["growth_play_run"],
    destinations: [businessLine],
    sessionId,
    ttlSeconds: 300,
  });
}

function activationToken(businessLine: string, sessionId: string): string {
  return issueConnectorSession({
    secret: SECRET,
    tenantId: "bank_1",
    subject: "pilot_activation_service",
    scopes: ["growth_play_activate"],
    destinations: [businessLine],
    sessionId,
    ttlSeconds: 300,
  });
}

function bodyFor(contract: CompiledContract, activationMode: string): Record<string, unknown> {
  const merrillPlay = contract.business_line === "wealth-management";
  const records = merrillPlay ? [
    record("tx_acats", "acats", 275000, "merrill_transfer_workflow"),
    record("tx_account", "account", 85000, "merrill_books"),
    record("tx_digital", "digital", 3, "merrill_digital"),
  ] : [
    record("tx_payroll", "ach", -4800, "deposit_core"),
    record("tx_outflow", "p2p", 2100, "payments_core"),
  ];
  return {
    decisionProtocolId: contract.decision_protocol_id,
    businessLine: contract.business_line,
    caseId: `case_${contract.growth_play_id}`,
    householdToken: "tok_household_000001",
    activationMode,
    records,
    sourceReceipt: {
      receiptId: "receipt_source_001", sourceSystem: "partner_sandbox", batchId: "batch_001",
      schemaVersion: "1.0", recordCount: records.length,
      receivedAt: new Date(NOW.getTime() - 20_000).toISOString(), evidenceClass: activationMode === "shadow" ? "synthetic" : "sandbox",
    },
    eligibilityReceipt: {
      receiptId: "eligibility_001", criteriaVersion: contract.eligibility.criteria_version,
      eligible: true, evaluatedAt: new Date(NOW.getTime() - 10_000).toISOString(),
      evidenceTransactionIds: records.map((item) => item.transaction_id),
    },
    policyVersion: contract.policy.version,
    policies: contract.policy.required_policy_ids.map((policyId: string) => ({ policy_id: policyId, verdict: "clear" })),
  };
}

function record(transactionId: string, rail: string, amount: number, sourceSystem: string) {
  return { transaction_id: transactionId, rail, amount, source_system: sourceSystem, occurred_at: new Date(NOW.getTime() - 30_000).toISOString(), merchant_name: transactionId };
}

function request(token: string, body: Record<string, unknown>): Request {
  return new Request("http://local/api/standalone-pilot-run", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function activationRequest(token: string, body: Record<string, unknown>): Request {
  return new Request("http://local/api/standalone-pilot-activate", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function decision(): Record<string, unknown> {
  return {
    decisionId: "dec_001", growthPlayId: "deposit-primacy-defense", actionId: "banker_retention_review",
    ownerRole: "relationship_banker", connector: "bank_workbench", destination: "banker_workbench",
    deliveryPayload: { household_token: "tok_household_000001", action: "banker_retention_review" },
  };
}
