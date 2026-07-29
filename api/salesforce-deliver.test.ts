import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { issueConnectorSession } from "./_connectorAuth.ts";
import {
  buildSalesforceDecisionRecord,
  buildSalesforceReferralRecord,
  buildSalesforceTaskRecord,
  POST as deliverToSalesforce,
} from "./salesforce-deliver.ts";

const SESSION_SECRET = "salesforce-delivery-test-secret-32-characters";
const managedVariables = [
  "ENABLE_LIVE_CONNECTORS",
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "SF_LOGIN_URL",
  "SF_CLIENT_ID",
  "SF_CLIENT_SECRET",
  "SF_DEMO_ACCOUNT_ID",
  "SF_FSC_REFERRAL_ENABLED",
  "SF_FSC_REFERRAL_RECORD_TYPE_ID",
  "SF_VENTUS_DECISION_ENABLED",
] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

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
  assert.match(task.Description, /POLICY CONTROLS/);
  assert.match(task.Description, /Attached for review/);
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

test("FSC Referral maps a governed insight into native structured fields", () => {
  const referral = buildSalesforceReferralRecord({
    subject: "Primary deposit relationship at risk",
    fsc: {
      clientId: "001000000000001AAA",
      estimatedReferralValue: 12500,
      referralRecordTypeId: "012000000000001AAA",
    },
    insight: {
      growthPlay: "Deposit Primacy Defense v1.0.0",
      moment: "Primary deposit relationship at risk",
      whyNow: "Payroll remains active while funds are moving off-bank.",
      recommendedAction: "Review the relationship before the next payroll cycle.",
      expectedOutcome: "Retain the primary deposit relationship.",
      confidence: 91,
      evidence: [{ label: "Repeated external movement indicates increasing primacy risk." }],
      controls: ["Consent", "Eligibility"],
      sourceName: "plaid_custom_user · 4 tokenized records",
      decisionRef: "dec_123",
    },
  }, new Date("2026-07-14T12:00:00Z"));

  assert.ok(referral);
  assert.equal(referral.RecordTypeId, "012000000000001AAA");
  assert.equal(referral.Status, "New");
  assert.equal(referral.Company, "Existing client relationship");
  assert.match(referral.Description, /QUALIFIED MOMENT/);
  assert.match(referral.Description, /RECOMMENDED ACTION/);
  assert.match(referral.Description, /Existing client Account: 001000000000001AAA/);
  assert.match(referral.Description, /Decision reference: dec_123/);
  assert.match(referral.Description, /Controls: Consent · Eligibility/);
});

test("FSC Referral requires an explicit valid client Account id", () => {
  assert.equal(buildSalesforceReferralRecord({
    subject: "Review opportunity",
    fsc: { clientId: "not-an-id" },
    insight: { confidence: 90 },
  }), null);
});

test("Ventus Decision Receipt maps the portable package into FSC fields", () => {
  process.env.SF_DEMO_ACCOUNT_ID = "001000000000001AAA";
  const decision = buildSalesforceDecisionRecord(
    {
      subject: "Primary deposit relationship at risk",
      decisionPackage: decisionPackage(),
    },
    {
      referralId: "00Q000000000001AAA",
      taskId: "00T000000000001AAA",
    },
    new Date("2026-07-27T12:00:00.000Z"),
  );

  assert.ok(decision);
  assert.equal(decision.Decision_Reference__c, "dec_123");
  assert.equal(decision.Growth_Play__c, "Deposit Primacy Defense");
  assert.equal(decision.Business_Objective__c, "Protect primary deposit relationships");
  assert.equal(decision.Human_Response__c, "accepted");
  assert.equal(decision.Outcome_Status__c, "measuring");
  assert.equal(decision.Outcome_Event_Type__c, "deposit_retained");
  assert.equal(decision.Outcome_Metric__c, "deposit_retained");
  assert.equal(decision.Workflow_Record_Id__c, "00Q000000000001AAA");
  assert.equal(decision.Client_Account__c, "001000000000001AAA");
  assert.match(String(decision.Decision_Package__c), /"primaryMetric":"deposit_retained"/);
  assert.doesNotMatch(String(decision.Decision_Package__c), /ACH CREDIT|transaction_id/);
});

test("FSC delivery creates a Decision Receipt, native Referral, and related banker Task", async () => {
  configureSalesforceTestEnvironment();
  const writes: Array<{ url: string; body: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/services/oauth2/token")) {
      return Response.json({
        access_token: "salesforce-access-token",
        instance_url: "https://ventus2.my.salesforce.com",
      });
    }
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    writes.push({ url, body });
    if (url.endsWith("/sobjects/Lead")) return Response.json({ id: "00Q000000000001AAA", success: true });
    if (url.endsWith("/sobjects/Task")) return Response.json({ id: "00T000000000001AAA", success: true });
    if (url.endsWith("/sobjects/Ventus_Decision__c")) return Response.json({ id: "a01000000000001AAA", success: true });
    return new Response("unexpected Salesforce route", { status: 500 });
  };

  const response = await deliverToSalesforce(salesforceRequest());
  const result = await response.json() as {
    object: string;
    id: string;
    records: { decision: { id: string }; referral: { id: string }; task: { id: string } };
    warnings: unknown[];
  };

  assert.equal(response.status, 200);
  assert.equal(result.object, "Lead");
  assert.equal(result.id, "00Q000000000001AAA");
  assert.equal(result.records.referral.id, "00Q000000000001AAA");
  assert.equal(result.records.task.id, "00T000000000001AAA");
  assert.equal(result.records.decision.id, "a01000000000001AAA");
  assert.deepEqual(result.warnings, []);
  assert.equal(writes.length, 3);
  assert.equal(writes[0].body.RecordTypeId, "012000000000001AAA");
  assert.equal(writes[1].body.WhoId, "00Q000000000001AAA");
  assert.equal(writes[1].body.WhatId, undefined);
  assert.match(String(writes[1].body.Description), /FSC LEAD REFERRAL/);
  assert.equal(writes[2].body.Decision_Reference__c, "dec_123");
  assert.equal(writes[2].body.Workflow_Record_Id__c, "00Q000000000001AAA");
  assert.equal(writes[2].body.Outcome_Status__c, "measuring");
});

test("Salesforce delivery rejects a Decision Package from another tenant before authenticating", async () => {
  configureSalesforceTestEnvironment();
  let fetchCalled = false;
  globalThis.fetch = async () => {
    fetchCalled = true;
    return new Response("unexpected", { status: 500 });
  };

  const response = await deliverToSalesforce(salesforceRequest({
    decisionPackage: {
      ...decisionPackage(),
      tenantId: "another_bank",
    },
  }));
  const result = await response.json() as { error?: string };

  assert.equal(response.status, 403);
  assert.match(result.error || "", /tenant does not match/i);
  assert.equal(fetchCalled, false);
});

test("FSC delivery preserves Task delivery when Referral creation fails", async () => {
  configureSalesforceTestEnvironment();
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/services/oauth2/token")) {
      return Response.json({
        access_token: "salesforce-access-token",
        instance_url: "https://ventus2.my.salesforce.com",
      });
    }
    if (url.endsWith("/sobjects/Lead")) {
      return Response.json([{ errorCode: "INVALID_FIELD", message: "Referral unavailable" }], { status: 400 });
    }
    if (url.endsWith("/sobjects/Task")) return Response.json({ id: "00T000000000002AAA", success: true });
    if (url.endsWith("/sobjects/Ventus_Decision__c")) return Response.json({ id: "a01000000000002AAA", success: true });
    return new Response("unexpected Salesforce route", { status: 500 });
  };

  const response = await deliverToSalesforce(salesforceRequest());
  const result = await response.json() as {
    object: string;
    id: string;
    records: { referral: null; task: { id: string } };
    warnings: Array<{ stage: string; message: string }>;
  };

  assert.equal(response.status, 200);
  assert.equal(result.object, "Task");
  assert.equal(result.id, "00T000000000002AAA");
  assert.equal(result.records.referral, null);
  assert.equal(result.warnings[0].stage, "fsc_referral");
  assert.match(result.warnings[0].message, /Referral unavailable/);
});

test("customer-linked onboarding proof skips Lead and relates the Task to the Account", async () => {
  configureSalesforceTestEnvironment();
  process.env.SF_DEMO_ACCOUNT_ID = "001000000000999AAA";
  const writes: Array<{ url: string; body: Record<string, unknown> }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/services/oauth2/token")) {
      return Response.json({
        access_token: "salesforce-access-token",
        instance_url: "https://ventus2.my.salesforce.com",
      });
    }
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    writes.push({ url, body });
    if (url.endsWith("/sobjects/Task")) return Response.json({ id: "00T000000000003AAA", success: true });
    if (url.endsWith("/sobjects/Ventus_Decision__c")) return Response.json({ id: "a01000000000003AAA", success: true });
    return new Response("unexpected Salesforce route", { status: 500 });
  };

  const response = await deliverToSalesforce(salesforceRequest({
    fsc: {
      clientId: "001000000000001AAA",
      createReferral: false,
    },
  }));
  const result = await response.json() as {
    object: string;
    records: { decision: { id: string }; referral: null; task: { id: string } };
  };

  assert.equal(response.status, 200);
  assert.equal(result.object, "Task");
  assert.equal(result.records.referral, null);
  assert.equal(writes.some((write) => write.url.endsWith("/sobjects/Lead")), false);
  assert.equal(writes[0].body.WhatId, "001000000000001AAA");
  assert.equal(writes[1].body.Client_Account__c, "001000000000001AAA");
  assert.equal(writes[1].body.Workflow_Record_Id__c, "00T000000000003AAA");
});

function configureSalesforceTestEnvironment() {
  process.env.ENABLE_LIVE_CONNECTORS = "true";
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SESSION_SECRET;
  process.env.SF_LOGIN_URL = "https://ventus2.my.salesforce.com";
  process.env.SF_CLIENT_ID = "salesforce-client";
  process.env.SF_CLIENT_SECRET = "salesforce-secret";
  process.env.SF_DEMO_ACCOUNT_ID = "001000000000001AAA";
  process.env.SF_FSC_REFERRAL_ENABLED = "true";
  process.env.SF_FSC_REFERRAL_RECORD_TYPE_ID = "012000000000001AAA";
  process.env.SF_VENTUS_DECISION_ENABLED = "true";
}

function salesforceRequest(overrides: Record<string, unknown> = {}) {
  const token = issueConnectorSession({
    secret: SESSION_SECRET,
    tenantId: "bank_1",
    subject: "pilot_e2e",
    scopes: ["salesforce_write"],
    destinations: ["salesforce"],
    sessionId: "session_salesforce_delivery",
  });
  return new Request("http://local/api/salesforce-deliver", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: "Primary deposit relationship at risk",
      whatId: "001000000000001AAA",
      insight: {
        growthPlay: "Deposit Primacy Defense v1.0.0",
        moment: "Primary deposit relationship at risk",
        whyNow: "Payroll remains active while funds are moving off-bank.",
        recommendedAction: "Review before the next payroll cycle.",
        expectedOutcome: "Retain the primary deposit relationship.",
        confidence: 91,
        decisionRef: "dec_123",
      },
      decisionPackage: decisionPackage(),
      ...overrides,
    }),
  });
}

function decisionPackage() {
  return {
    schemaVersion: "1.0",
    decisionId: "dec_123",
    tenantId: "bank_1",
    createdAt: "2026-07-27T11:55:00.000Z",
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
      selectedAction: {
        id: "banker-retention-review",
        title: "Open a banker retention review",
        ownerRole: "Relationship banker",
        destination: "Salesforce FSC",
      },
      alternatives: [],
    },
    governance: {
      policyStatus: "cleared",
      controls: ["Consent", "Eligibility"],
      assignmentArm: "treatment",
    },
    decisionMethod: {
      active: "deterministic-baseline",
      shadowCandidate: "model-assisted-planner",
    },
    response: {
      status: "accepted",
      actor: "operator@bank.com",
      recordedAt: "2026-07-27T12:00:00.000Z",
    },
    outcome: {
      metric: "deposit_retained",
      status: "not-opened",
    },
  };
}
