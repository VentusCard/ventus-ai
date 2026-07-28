import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { issueConnectorSession } from "./_connectorAuth.ts";
import {
  normalizeSalesforceOutcome,
  POST as readSalesforceOutcome,
} from "./salesforce-outcomes.ts";

const SESSION_SECRET = "salesforce-outcome-test-secret-32-characters";
const managedVariables = [
  "ENABLE_LIVE_CONNECTORS",
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "SF_LOGIN_URL",
  "SF_CLIENT_ID",
  "SF_CLIENT_SECRET",
] as const;
const originalEnvironment = Object.fromEntries(
  managedVariables.map((name) => [name, process.env[name]]),
);
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("Salesforce outcome read maps a measured record without unlocking claims", async () => {
  configureEnvironment();
  const requests: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requests.push(url);
    if (url.endsWith("/services/oauth2/token")) {
      return Response.json({
        access_token: "salesforce-access-token",
        instance_url: "https://ventus2.my.salesforce.com",
      });
    }
    return Response.json(measuredRecord());
  };

  const response = await readSalesforceOutcome(requestWithScope());
  const body = await response.json() as {
    decisionId: string;
    measurementStatus: string;
    outcome: {
      status: string;
      observation: {
        eventId: string;
        eventType: string;
        value: { metric: string; amount: number; currency: string };
      };
    };
    businessClaimAllowed: boolean;
    causalClaimAllowed: boolean;
  };

  assert.equal(response.status, 200);
  assert.equal(body.decisionId, "dec_123");
  assert.equal(body.measurementStatus, "observed_unmeasured");
  assert.equal(body.outcome.status, "measured");
  assert.equal(body.outcome.observation.eventType, "deposit_retained");
  assert.equal(body.outcome.observation.value.metric, "deposit_retained");
  assert.equal(body.outcome.observation.value.amount, 200);
  assert.equal(body.outcome.observation.value.currency, "USD");
  assert.equal(body.businessClaimAllowed, false);
  assert.equal(body.causalClaimAllowed, false);
  assert.equal(requests.length, 2);
  assert.match(requests[1], /sobjects\/Ventus_Decision__c\/a01000000000001AAA\?fields=/);
  assert.doesNotMatch(requests[1], /SELECT|WHERE/);
});

test("Salesforce outcome read returns an awaiting state before an outcome is posted", () => {
  const normalized = normalizeSalesforceOutcome({
    ...baseRecord(),
    Outcome_Status__c: "measuring",
    Outcome_Event_Type__c: null,
    Outcome_Occurred_At__c: null,
  }, "bank_1");

  assert.equal(normalized.measurementStatus, "awaiting_outcome");
  assert.equal(normalized.outcome.status, "measuring");
  assert.equal(normalized.outcome.observation, null);
});

test("Salesforce outcome read rejects a cross-tenant Decision Receipt", () => {
  assert.throws(
    () => normalizeSalesforceOutcome(baseRecord(), "another_bank"),
    /belongs to another tenant/,
  );
});

test("Salesforce outcome read rejects an incomplete measured outcome", () => {
  assert.throws(
    () => normalizeSalesforceOutcome({
      ...baseRecord(),
      Outcome_Status__c: "measured",
      Outcome_Event_Type__c: null,
      Outcome_Occurred_At__c: null,
    }, "bank_1"),
    /outcome event type is invalid/,
  );
});

test("Salesforce outcome read requires the dedicated read scope", async () => {
  configureEnvironment();
  const response = await readSalesforceOutcome(requestWithScope(["salesforce_write"]));
  assert.equal(response.status, 403);
});

function configureEnvironment() {
  process.env.ENABLE_LIVE_CONNECTORS = "true";
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SESSION_SECRET;
  process.env.SF_LOGIN_URL = "https://ventus2.my.salesforce.com";
  process.env.SF_CLIENT_ID = "salesforce-client";
  process.env.SF_CLIENT_SECRET = "salesforce-secret";
}

function requestWithScope(scopes = ["salesforce_outcome_read"]) {
  const token = issueConnectorSession({
    secret: SESSION_SECRET,
    tenantId: "bank_1",
    subject: "operator_1",
    scopes,
    destinations: ["salesforce"],
    sessionId: "session_salesforce_outcome",
  });
  return new Request("http://local/api/salesforce-outcomes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ decisionRecordId: "a01000000000001AAA" }),
  });
}

function baseRecord() {
  return {
    Id: "a01000000000001AAA",
    Decision_Reference__c: "dec_123",
    Decision_Package__c: JSON.stringify({
      schemaVersion: "1.0",
      decisionId: "dec_123",
      tenantId: "bank_1",
      evidenceClass: "sandbox",
      response: { status: "accepted" },
      outcome: { metric: "deposit_retained", status: "measuring" },
    }),
    Human_Response__c: "accepted",
    Outcome_Status__c: "measuring",
    LastModifiedById: "005000000000001AAA",
    LastModifiedDate: "2026-07-28T17:00:00.000Z",
  };
}

function measuredRecord() {
  return {
    ...baseRecord(),
    Outcome_Status__c: "measured",
    Outcome_Event_Type__c: "deposit_retained",
    Outcome_Metric__c: "deposit_retained",
    Outcome_Amount__c: 200,
    Outcome_Occurred_At__c: "2026-08-27T17:00:00.000Z",
    Outcome_Source_Record_Id__c: "bank_outcome_123",
    Outcome_Reason_Code__c: "relationship_retained",
  };
}
