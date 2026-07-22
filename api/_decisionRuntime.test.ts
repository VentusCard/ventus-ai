import assert from "node:assert/strict";
import test from "node:test";
import { PLAID_FIXTURE_PRIMACY, PLAID_FIXTURE_ROLLOVER } from "../src/lib/plaid.ts";
import { executeDecisionRun } from "./_decisionRuntime.ts";

test("server runtime produces a stable, model-free deposit decision", () => {
  const request = {
    scenario: "deposit-retention" as const,
    transactions: PLAID_FIXTURE_PRIMACY,
    source: { mode: "fixture" as const, name: "Plaid-shaped fixture" },
  };
  const first = executeDecisionRun({ tenantId: "pilot_bank", request });
  const second = executeDecisionRun({ tenantId: "pilot_bank", request });

  assert.equal(first.decisionId, second.decisionId);
  assert.equal(first.status, "qualified");
  assert.equal(first.growthPlay, "Deposit Primacy Defense");
  assert.equal(first.opportunity?.type, "Checking primacy at risk");
  assert.equal(first.runtime.engine, "deterministic-baseline");
  assert.equal(first.runtime.modelInvocation, null);
  assert.equal(first.source.recordCount, PLAID_FIXTURE_PRIMACY.length);
});

test("server runtime produces a qualified wealth decision", () => {
  const result = executeDecisionRun({
    tenantId: "pilot_bank",
    request: {
      scenario: "wealth-growth",
      transactions: PLAID_FIXTURE_ROLLOVER,
      source: { mode: "fixture", name: "Plaid-shaped fixture" },
    },
  });

  assert.equal(result.status, "qualified");
  assert.equal(result.growthPlay, "Merrill Relationship Growth");
  assert.equal(result.opportunity?.type, "Retirement rollover — uninvested");
});

test("policy context suppresses an otherwise qualified moment", () => {
  const result = executeDecisionRun({
    tenantId: "pilot_bank",
    request: {
      scenario: "deposit-retention",
      transactions: PLAID_FIXTURE_PRIMACY,
      source: { mode: "fixture", name: "Plaid-shaped fixture" },
      policyContext: { doNotContact: true },
    },
  });

  assert.equal(result.status, "suppressed");
  assert.equal(result.policy.allowed, false);
  assert.equal(result.policy.reason, "Do-not-contact suppression");
});
