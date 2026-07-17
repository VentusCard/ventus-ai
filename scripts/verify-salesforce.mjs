// Verifies the Salesforce connector two ways:
//
//   Unconfigured (no env): exercises the handler directly and asserts the documented
//   503 + guard behavior — proves the module is sound without credentials.
//
//   Configured (SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET set): performs the REAL
//   flow — OAuth client-credentials token → create a Task in your org → read it back —
//   and prints the record id + Lightning URL. That Task is visible in the Salesforce UI.
//
// Run: npm run test:salesforce

import assert from "node:assert/strict";
import { POST, buildSalesforceTaskRecord } from "../api/salesforce-deliver.ts";

process.env.VENTUS_CONNECTOR_TOKEN ||= "ventus-connector-test-token";

const configured = !!(process.env.SF_LOGIN_URL && process.env.SF_CLIENT_ID && process.env.SF_CLIENT_SECRET);

const request = (body, headers = { Authorization: `Bearer ${process.env.VENTUS_CONNECTOR_TOKEN}` }) =>
  new Request("http://local/api/salesforce-deliver", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

const fixedNow = new Date("2026-07-13T12:00:00.000Z");
const structured = buildSalesforceTaskRecord(
  {
    subject: "Primary deposit relationship review",
    dueInDays: 2,
    source: "leadership-demo-plaid",
    insight: {
      businessLine: "Consumer Banking",
      growthPlay: "Deposit Primacy Defense",
      customerRef: "household-primacy",
      moment: "Checking primacy at risk",
      whyNow: "Direct deposit remains here while balances are moving off-bank.",
      recommendedAction: "Contact the customer before the next payroll cycle.",
      expectedOutcome: "Protect the primary deposit relationship",
      confidence: 91,
      destination: "Banker workbench",
      evidence: [
        { label: "Direct-deposit relationship", confidence: 100 },
        { label: "Spend migrating off-bank", confidence: 92 },
      ],
      controls: ["UDAAP review", "Uniform offer criteria"],
      sourceName: "Plaid custom-user sandbox",
      decisionRef: "deposit-retention:primacy",
    },
  },
  fixedNow,
);
assert.equal(structured.task.Subject, "Primary deposit relationship review");
assert.equal(structured.task.Priority, "High", "high-confidence activation is prioritized");
assert.equal(structured.task.ActivityDate, "2026-07-15", "requested service window becomes the due date");
assert.match(structured.task.Description, /WHY THIS NEEDS ATTENTION/);
assert.match(structured.task.Description, /RECOMMENDED NEXT STEP/);
assert.match(structured.task.Description, /BUSINESS OUTCOME/);
assert.match(structured.task.Description, /Direct-deposit relationship \(100% confidence\)/);
assert.match(structured.task.Description, /POLICY CONTROLS/);
assert.match(structured.task.Description, /Attached for review: UDAAP review · Uniform offer criteria/);
assert.match(structured.task.Description, /Consumer Banking → Banker workbench/);
assert.match(structured.task.Description, /Decision reference: deposit-retention:primacy/);
assert.doesNotMatch(structured.task.Description, /ACH CREDIT|account_id|transaction_id/, "raw transaction data does not enter the Task");

const legacy = buildSalesforceTaskRecord({ subject: "Legacy delivery", description: "Existing payload remains supported." }, fixedNow);
assert.match(legacy.task.Description, /Existing payload remains supported/);
assert.equal(legacy.task.Priority, "Normal");

// The credentialed route is invisible until explicitly enabled.
delete process.env.ENABLE_LIVE_CONNECTORS;
const disabled = await POST(request({ subject: "x" }));
assert.equal(disabled.status, 404, "connector is disabled by default");

process.env.ENABLE_LIVE_CONNECTORS = "true";

// A browser-spoofable header is never sufficient in production.
process.env.VERCEL_ENV = "production";
const spoofed = await POST(request({ subject: "x" }, { "x-ventus-client": "web-app" }));
assert.equal(spoofed.status, 403, "production rejects the local demo header");
delete process.env.VERCEL_ENV;

// Guard behavior holds in both configured and unconfigured modes.
const forbidden = await POST(request({ subject: "x" }, {}));
assert.equal(forbidden.status, 403, "non-app clients are rejected");

if (!configured) {
  const res = await POST(request({ subject: "Ventus verify" }));
  assert.equal(res.status, 503, "unconfigured connector returns documented 503");
  const data = await res.json();
  assert.match(data.error, /SF_LOGIN_URL/, "503 explains exactly what to set");
  console.log("Salesforce connector verified (unconfigured mode): guard + documented 503 fallback.");
  console.log("Set SF_LOGIN_URL / SF_CLIENT_ID / SF_CLIENT_SECRET to run the live write.");
} else {
  // Live path: validation first, then a real Task create.
  const badReq = await POST(request({}));
  assert.equal(badReq.status, 400, "missing subject is rejected");

  const res = await POST(
    request({
      subject: "Ventus connector verification — safe to delete",
      description: "Created by scripts/verify-salesforce.mjs to prove the live route.",
      source: "verify-script",
    }),
  );
  const data = await res.json();
  assert.equal(res.status, 200, `live create failed: ${JSON.stringify(data)}`);
  assert.match(data.id, /^00T/, "Salesforce Task ids start with 00T");

  // Read it back through the same org to prove it truly exists.
  const token = await fetch(`${process.env.SF_LOGIN_URL.replace(/\/$/, "")}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.SF_CLIENT_ID,
      client_secret: process.env.SF_CLIENT_SECRET,
    }).toString(),
  }).then((r) => r.json());
  const readBack = await fetch(`${data.instanceUrl}/services/data/v61.0/sobjects/Task/${data.id}`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  }).then((r) => r.json());
  assert.equal(readBack.Id, data.id, "created Task reads back from the org");

  console.log("Salesforce connector verified LIVE: real Task created and read back.");
  console.log(` · record: ${data.id}`);
  console.log(` · open:   ${data.url}`);
}
