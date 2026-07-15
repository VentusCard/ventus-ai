import assert from "node:assert/strict";
import test from "node:test";
import { buildSalesforceTaskRecord } from "./salesforce-deliver.ts";

test("Salesforce delivery maps a governed insight and optional relationship IDs", () => {
  const { task } = buildSalesforceTaskRecord({
    subject: "Primary deposit relationship at risk",
    whoId: "003000000000001AAA",
    whatId: "001000000000001AAA",
    insight: {
      businessLine: "Consumer Banking",
      growthPlay: "Deposit Primacy Defense v1.0.0",
      whyNow: "Payroll remains active while funds are moving off-bank.",
      recommendedAction: "Review the relationship before the next payroll cycle.",
      expectedOutcome: "Retain the primary deposit relationship.",
      confidence: 91,
      destination: "Salesforce FSC",
      evidence: [{ label: "Repeated external movement indicates increasing primacy risk." }],
      controls: ["Consent", "Eligibility"],
      sourceName: "plaid_custom_user · 4 tokenized records",
      decisionRef: "dec_123",
    },
  }, new Date("2026-07-14T12:00:00Z"));

  assert.equal(task.WhoId, "003000000000001AAA");
  assert.equal(task.WhatId, "001000000000001AAA");
  assert.equal(task.Priority, "High");
  assert.match(task.Description, /WHY THIS NEEDS ATTENTION/);
  assert.match(task.Description, /RECOMMENDED NEXT STEP/);
  assert.match(task.Description, /POLICY STATUS/);
  assert.match(task.Description, /Decision confidence: 91%/);
});

test("Salesforce delivery drops malformed relationship IDs", () => {
  const { task } = buildSalesforceTaskRecord({
    subject: "Review opportunity",
    whoId: "not-an-id",
    whatId: "001-too-short",
  }, new Date("2026-07-14T12:00:00Z"));

  assert.equal("WhoId" in task, false);
  assert.equal("WhatId" in task, false);
});
