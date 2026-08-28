import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { afterEach } from "node:test";
import { issueConnectorSession } from "./_connectorAuth.ts";
import { createPilotOutcomeHandler } from "./pilot-outcomes.ts";
import { compileGrowthPlayContract } from "../backend/shared/pilot/growth-play-contract.mjs";
import { createInMemoryGrowthPlayRegistry } from "../backend/shared/pilot/growth-play-registry.mjs";

const SECRET = "connector-session-test-secret-32-characters-minimum";
const ASSIGNED_AT = "2026-07-12T12:00:00.000Z";
const OUTCOME_AT = "2026-08-01T12:00:00.000Z";
const drafts = JSON.parse(readFileSync(
  new URL("../backend/fixtures/evaluation/growth-play-drafts.json", import.meta.url),
  "utf8",
));
const deposit = compileGrowthPlayContract(drafts[0]);
const EXPERIMENT_ID = `exp_${deposit.decision_protocol_id.slice(4)}`;
const assignments = [
  assignment("tok_household_000001", "assignment_treatment_001", "treatment"),
  assignment("tok_household_000002", "assignment_holdout_001", "holdout"),
];
type CapturedOutcome = Record<string, unknown> & {
  tenant_id: string;
  decision_id: string;
  activation_id: string | null;
  assignment: { experiment_id: string; arm: string; decision_protocol_id: string };
};
const managedVariables = ["VENTUS_CONNECTOR_SESSION_SECRET", "VENTUS_CONNECTOR_TOKEN"] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));

afterEach(() => {
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("outcome endpoint derives assignment, decision, activation, tenant, and protocol context server-side", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const captured: Record<string, unknown>[] = [];
  const handle = createPilotOutcomeHandler(await dependencies(captured));
  const token = serviceToken("growth_play_outcome_write", "outcome_writer_001");
  const response = await handle(jsonRequest(token, recordBody("tok_household_000001")));
  assert.equal(response.status, 201);
  const event = captured[0] as CapturedOutcome;
  assert.equal(event.tenant_id, "bank_1");
  assert.equal(event.decision_id, "decision_treatment_001");
  assert.equal(event.activation_id, "activation_treatment_001");
  assert.equal(event.assignment.experiment_id, EXPERIMENT_ID);
  assert.equal(event.assignment.arm, "treatment");
  assert.equal(event.assignment.decision_protocol_id, deposit.decision_protocol_id);
  const receipt = await response.json() as Record<string, unknown>;
  assert.equal(receipt.businessClaimAllowed, false);
  assert.equal(receipt.causalClaimAllowed, false);
});

test("holdout outcome resolves its server decision context without inventing an activation", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const captured: Record<string, unknown>[] = [];
  const handle = createPilotOutcomeHandler(await dependencies(captured));
  const response = await handle(jsonRequest(
    serviceToken("growth_play_outcome_write", "outcome_writer_002"),
    recordBody("tok_household_000002"),
  ));
  assert.equal(response.status, 201);
  const event = captured[0] as CapturedOutcome;
  assert.equal(event.decision_id, "decision_holdout_001");
  assert.equal(event.activation_id, null);
  assert.equal(event.assignment.arm, "holdout");
});

test("measurement endpoint returns only coverage-gated non-claim output", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const handle = createPilotOutcomeHandler(await dependencies([]));
  const response = await handle(jsonRequest(serviceToken("growth_play_measure_read", "measure_reader_001"), {
    operation: "measure",
    decisionProtocolId: deposit.decision_protocol_id,
    businessLine: deposit.business_line,
  }));
  assert.equal(response.status, 200);
  const result = await response.json() as Record<string, unknown>;
  assert.equal(result.status, "insufficient_sample");
  assert.equal(result.businessClaimAllowed, false);
  assert.equal(result.causalClaimAllowed, false);
  assert.equal((result.authorization as Record<string, unknown>).sessionId, "measure_reader_001");
});

test("outcome endpoint rejects caller-supplied lineage, wrong scopes, legacy auth, and mismatched context", async () => {
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const handle = createPilotOutcomeHandler(await dependencies([]));
  const writer = serviceToken("growth_play_outcome_write", "outcome_writer_003");
  assert.equal((await handle(jsonRequest(writer, { ...recordBody("tok_household_000001"), decisionId: "fabricated" }))).status, 400);
  assert.equal((await handle(jsonRequest(writer, {
    ...recordBody("tok_household_000001"),
    value: { metric: "deposit_retained", amount: 200, currency: "USD", customer_name: "prohibited" },
  }))).status, 400);
  assert.equal((await handle(jsonRequest(serviceToken("growth_play_measure_read", "wrong_scope_001"), recordBody("tok_household_000001")))).status, 403);
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = undefined;
  process.env.VENTUS_CONNECTOR_TOKEN = "legacy-outcome-token";
  assert.equal((await handle(jsonRequest("legacy-outcome-token", recordBody("tok_household_000001")))).status, 403);

  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SECRET;
  const mismatched = await dependencies([]);
  mismatched.ledgerRepository.loadOutcomeContext = async () => ({
    growthPlayId: deposit.growth_play_id,
    decisionId: "decision_treatment_001",
    assignmentId: "different_assignment",
    arm: "treatment",
    decisionProtocolId: deposit.decision_protocol_id,
    activationId: null,
  });
  const mismatchResponse = await createPilotOutcomeHandler(mismatched)(jsonRequest(writer, recordBody("tok_household_000001")));
  assert.equal(mismatchResponse.status, 400);
  assert.match((await mismatchResponse.json() as { error: string }).error, /assignment ID/);
});

async function dependencies(captured: Record<string, unknown>[]) {
  const protocolRegistry = createInMemoryGrowthPlayRegistry();
  await protocolRegistry.register({
    tenantId: "bank_1", contract: deposit, registeredBy: "configurator_1",
    registeredBySessionId: "config_session_1", identityProvider: "bank_sso",
    registeredAt: "2026-07-12T10:00:00.000Z",
  });
  await protocolRegistry.recordApproval({
    tenantId: "bank_1", decisionProtocolId: deposit.decision_protocol_id,
    businessLine: deposit.business_line, decision: "approved", decidedBy: "consumer_owner_1",
    decidedBySessionId: "approval_session_1", identityProvider: "bank_sso",
    decidedAt: "2026-07-12T11:00:00.000Z", changeRecordId: "pilot_change_001",
    reason: "Approved before assignment for standalone outcome evaluation.",
  });
  await protocolRegistry.recordApproval({
    tenantId: "bank_1", decisionProtocolId: deposit.decision_protocol_id,
    businessLine: deposit.business_line, decision: "revoked", decidedBy: "consumer_owner_1",
    decidedBySessionId: "revocation_session_1", identityProvider: "bank_sso",
    decidedAt: "2026-07-13T00:00:00.000Z", changeRecordId: "pilot_change_revoke_001",
    reason: "Revoked for future assignments while preserving outcome collection.",
  });
  const measurementRepository = {
    async loadExperiment() { return { assignments, outcomes: [] }; },
  };
  const ledgerRepository = {
    async loadOutcomeContext({ householdToken }: { householdToken: string }) {
      const treatment = householdToken === "tok_household_000001";
      return {
        growthPlayId: deposit.growth_play_id,
        decisionId: treatment ? "decision_treatment_001" : "decision_holdout_001",
        assignmentId: treatment ? "assignment_treatment_001" : "assignment_holdout_001",
        arm: treatment ? "treatment" : "holdout",
        decisionProtocolId: deposit.decision_protocol_id,
        activationId: treatment ? "activation_treatment_001" : null,
      };
    },
  };
  const operatingLoop = {
    async recordOutcome(event: Record<string, unknown>) {
      captured.push(event);
      return { inserted: true, evidenceClass: "sandbox", businessClaimAllowed: false };
    },
    async measureExperiment() {
      return {
        status: "insufficient_sample", businessClaimAllowed: false, causalClaimAllowed: false,
        treatment: { assigned: 1, observed: 0 }, holdout: { assigned: 1, observed: 0 },
      };
    },
  };
  return { protocolRegistry, measurementRepository, ledgerRepository, operatingLoop };
}

function assignment(householdToken: string, assignmentId: string, arm: string) {
  return {
    assignmentId, tenantId: "bank_1", experimentId: EXPERIMENT_ID, householdToken, arm,
    design: "binary", evidenceClass: "sandbox", assignedAt: ASSIGNED_AT,
    decisionProtocolId: deposit.decision_protocol_id,
  };
}

function recordBody(householdToken: string): Record<string, unknown> {
  return {
    operation: "record",
    decisionProtocolId: deposit.decision_protocol_id,
    businessLine: deposit.business_line,
    eventId: `outcome_${householdToken.slice(-6)}`,
    householdToken,
    eventType: "deposit_balance_observed",
    occurredAt: OUTCOME_AT,
    value: { metric: "deposit_retained", amount: householdToken.endsWith("1") ? 200 : 100, currency: "USD" },
    sourceSystem: "deposit_core_sandbox",
    sourceRecordId: null,
    reasonCode: null,
  };
}

function serviceToken(scope: string, sessionId: string): string {
  return issueConnectorSession({
    secret: SECRET, tenantId: "bank_1", subject: "bank_outcome_service",
    scopes: [scope], destinations: [deposit.business_line], sessionId, ttlSeconds: 300,
  });
}

function jsonRequest(token: string, body: Record<string, unknown>): Request {
  return new Request("http://local/api/pilot-outcomes", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
