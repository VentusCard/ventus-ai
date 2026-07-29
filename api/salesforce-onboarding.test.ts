import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { issueConnectorSession } from "./_connectorAuth.ts";
import { buildFscSchemaSummary, POST } from "./salesforce-onboarding.ts";

const SESSION_SECRET = "salesforce-onboarding-test-secret-32-chars";
const ACCOUNT_ID = "001000000000001AAA";
const originalFetch = globalThis.fetch;
const managedVariables = [
  "ENABLE_LIVE_CONNECTORS",
  "VENTUS_CONNECTOR_SESSION_SECRET",
  "SF_LOGIN_URL",
  "SF_CLIENT_ID",
  "SF_CLIENT_SECRET",
] as const;
const originalEnvironment = Object.fromEntries(managedVariables.map((name) => [name, process.env[name]]));

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const name of managedVariables) {
    const original = originalEnvironment[name];
    if (original === undefined) delete process.env[name];
    else process.env[name] = original;
  }
});

test("FSC onboarding requires the administrator schema-read scope", async () => {
  configure();
  const token = issueConnectorSession({
    secret: SESSION_SECRET,
    tenantId: "bank_1",
    subject: "operator_1",
    scopes: ["salesforce_write"],
    destinations: ["salesforce"],
    sessionId: "session_without_schema",
  });
  const response = await POST(request(token, { action: "discover" }));
  assert.equal(response.status, 401);
});

test("FSC schema discovery exposes only the bounded operating contract", async () => {
  configure();
  const fieldsByObject: Record<string, string[]> = {
    Account: ["Id", "IsPersonAccount", "PersonContactId", "RecordTypeId", "Name"],
    Contact: ["Id", "AccountId", "RecordTypeId", "Email"],
    Task: ["Id", "WhoId", "WhatId", "OwnerId", "Subject", "Status", "ActivityDate", "Priority", "Description"],
    Lead: ["Id", "RecordTypeId", "OwnerId", "Status", "Description", "Company"],
    FinServ__FinancialAccount__c: ["Id", "FinServ__PrimaryOwner__c", "FinServ__Household__c", "FinServ__RecordTypeName__c", "FinServ__Balance__c"],
    Ventus_Decision__c: [
      "Id",
      "Client_Account__c",
      "Decision_Reference__c",
      "Growth_Play__c",
      "Business_Objective__c",
      "Policy_Status__c",
      "Human_Response__c",
      "Outcome_Status__c",
      "Outcome_Metric__c",
      "Outcome_Amount__c",
      "Decision_Package__c",
    ],
  };
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/services/oauth2/token")) return authResponse();
    if (url.endsWith("/sobjects/")) {
      return Response.json({
        sobjects: Object.keys(fieldsByObject).map((name) => ({
          name,
          queryable: true,
          createable: true,
          updateable: true,
        })),
      });
    }
    const match = url.match(/\/sobjects\/([^/]+)\/describe$/);
    if (match) {
      const name = decodeURIComponent(match[1]);
      return Response.json({
        name,
        fields: fieldsByObject[name].map((field) => ({
          name: field,
          label: field,
          type: "string",
          createable: true,
          updateable: true,
        })),
      });
    }
    return new Response("unexpected route", { status: 500 });
  };

  const response = await POST(request(adminToken(), { action: "discover" }));
  const body = await response.json() as {
    requiredMappingsReady: boolean;
    objects: Array<{ name: string; fields: Array<{ name: string }> }>;
    capabilities: { decisionReceipt: boolean; outcomeReturn: boolean };
  };
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(body.requiredMappingsReady, true);
  assert.equal(body.capabilities.decisionReceipt, true);
  assert.equal(body.capabilities.outcomeReturn, true);
  assert.deepEqual(body.objects.map((object) => object.name).sort(), Object.keys(fieldsByObject).sort());
  assert.equal(body.objects.find((object) => object.name === "Account")?.fields.some((field) => field.name === "Name"), false);
  assert.equal(body.objects.find((object) => object.name === "Contact")?.fields.some((field) => field.name === "Email"), false);
  assert.equal(body.objects.find((object) => object.name === "FinServ__FinancialAccount__c")?.fields.some((field) => field.name === "FinServ__Balance__c"), false);
});

test("FSC account verification returns relationship flags without customer profile data", async () => {
  configure();
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.endsWith("/services/oauth2/token")) return authResponse();
    if (url.includes(`/sobjects/Account/${ACCOUNT_ID}?fields=`)) {
      return Response.json({
        Id: ACCOUNT_ID,
        IsPersonAccount: true,
        PersonContactId: "003000000000001AAA",
        RecordTypeId: "012000000000001AAA",
        Name: "Must not leave Salesforce",
      });
    }
    return new Response("unexpected route", { status: 500 });
  };

  const response = await POST(request(adminToken(), {
    action: "verify-account",
    accountId: ACCOUNT_ID,
  }));
  const body = await response.json() as Record<string, unknown> & {
    account: Record<string, unknown>;
  };
  assert.equal(response.status, 200);
  assert.deepEqual(body.account, {
    id: ACCOUNT_ID,
    verified: true,
    personAccount: true,
    hasPersonContact: true,
    hasRecordType: true,
  });
  assert.equal(JSON.stringify(body).includes("Must not leave Salesforce"), false);
});

test("FSC account verification rejects malformed identifiers before reading Salesforce", async () => {
  configure();
  let calls = 0;
  globalThis.fetch = async (input) => {
    calls += 1;
    if (String(input).endsWith("/services/oauth2/token")) return authResponse();
    return new Response("unexpected route", { status: 500 });
  };
  const response = await POST(request(adminToken(), {
    action: "verify-account",
    accountId: "not-an-account",
  }));
  assert.equal(response.status, 400);
  assert.equal(calls, 1);
});

test("schema summary fails closed when a required outcome field is missing", () => {
  const summary = buildFscSchemaSummary(
    [
      { name: "Account", queryable: true },
      { name: "Task", createable: true },
      { name: "Ventus_Decision__c", createable: true },
    ],
    {
      Account: { fields: [{ name: "Id" }] },
      Task: { fields: [{ name: "WhatId" }] },
      Ventus_Decision__c: {
        fields: [
          { name: "Client_Account__c" },
          { name: "Decision_Reference__c" },
          { name: "Outcome_Status__c" },
        ],
      },
    },
  );
  assert.equal(summary.requiredMappingsReady, false);
  assert.equal(summary.capabilities.outcomeReturn, false);
});

function configure() {
  process.env.ENABLE_LIVE_CONNECTORS = "true";
  process.env.VENTUS_CONNECTOR_SESSION_SECRET = SESSION_SECRET;
  process.env.SF_LOGIN_URL = "https://example.my.salesforce.com";
  process.env.SF_CLIENT_ID = "salesforce-client";
  process.env.SF_CLIENT_SECRET = "salesforce-secret";
}

function adminToken() {
  return issueConnectorSession({
    secret: SESSION_SECRET,
    tenantId: "bank_1",
    subject: "admin_1",
    scopes: ["salesforce_schema_read"],
    destinations: ["salesforce"],
    sessionId: "session_with_schema",
  });
}

function request(token: string, body: Record<string, unknown>) {
  return new Request("http://local/api/salesforce-onboarding", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function authResponse() {
  return Response.json({
    access_token: "salesforce-access-token",
    instance_url: "https://example.my.salesforce.com",
  });
}
