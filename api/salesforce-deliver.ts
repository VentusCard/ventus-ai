// Vercel serverless function — the real Salesforce connector.
//
// Authenticates to an actual Salesforce org via the OAuth2 client-credentials flow and
// creates a real Task record through the REST API. In an FSC org it can also create a
// Lead with the bank's Referral record type before the Task, keeping the insight
// structured and routable in FSC.
// The receipt returned is a genuine Salesforce record id plus a Lightning URL.
//
// Disabled by default and server-authorized. Credentials alone do not expose the route.
// Local browser testing requires the explicit non-production connector exception.
//
// Setup (~5 min, free Developer Edition org):
//   1. developer.salesforce.com/signup → create a Developer Edition org.
//   2. Setup → App Manager → New Connected App → enable OAuth ("api" scope),
//      enable Client Credentials Flow, assign a run-as user.
//   3. Set env: SF_LOGIN_URL=https://<yourdomain>.my.salesforce.com
//               SF_CLIENT_ID=<consumer key>  SF_CLIENT_SECRET=<consumer secret>
// Uses only STANDARD Task fields, so any untouched dev org accepts the write.
declare const process: { env: Record<string, string | undefined> };
import { authorizeConnector, connectorDisabledResponse, liveConnectorsEnabled } from "./_connectorAuth.js";

export const maxDuration = 20;

const API_VERSION = "v61.0";

type SalesforceEvidenceInput = {
  label?: unknown;
  confidence?: unknown;
};

type SalesforceInsightInput = {
  businessLine?: unknown;
  growthPlay?: unknown;
  customerRef?: unknown;
  moment?: unknown;
  whyNow?: unknown;
  recommendedAction?: unknown;
  expectedOutcome?: unknown;
  confidence?: unknown;
  destination?: unknown;
  evidence?: unknown;
  controls?: unknown;
  sourceName?: unknown;
  decisionRef?: unknown;
};

type SalesforceFscInput = {
  clientId?: unknown;
  estimatedReferralValue?: unknown;
  referralRecordTypeId?: unknown;
};

type SalesforceDeliveryBody = {
  subject?: unknown;
  description?: unknown;
  priority?: unknown;
  source?: unknown;
  dueInDays?: unknown;
  whoId?: unknown;
  whatId?: unknown;
  insight?: SalesforceInsightInput;
  fsc?: SalesforceFscInput;
  decisionPackage?: unknown;
};

const cleanText = (value: unknown, maxLength: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "";

const cleanSalesforceId = (value: unknown) => {
  const id = cleanText(value, 18);
  return /^[a-zA-Z0-9]{15}(?:[a-zA-Z0-9]{3})?$/.test(id) ? id : "";
};

const cleanList = (value: unknown, maxItems: number, maxLength: number) =>
  Array.isArray(value)
    ? value.map((item) => cleanText(item, maxLength)).filter(Boolean).slice(0, maxItems)
    : [];

const cleanConfidence = (value: unknown): number | null => {
  const number = typeof value === "number" ? value : Number.NaN;
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : null;
};

const cleanCurrency = (value: unknown): number | null => {
  const number = typeof value === "number" ? value : Number.NaN;
  return Number.isFinite(number) && number >= 0
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.round(number))
    : null;
};

const cleanEvidence = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const evidence = item && typeof item === "object" ? (item as SalesforceEvidenceInput) : {};
      return { label: cleanText(evidence.label, 140), confidence: cleanConfidence(evidence.confidence) };
    })
    .filter((item) => item.label)
    .slice(0, 4);
};

const section = (heading: string, lines: string[]) =>
  lines.length ? `${heading}\n${lines.join("\n")}` : "";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

export function buildSalesforceTaskRecord(body: SalesforceDeliveryBody, now = new Date()) {
  const subject = cleanText(body.subject, 255);
  const insight = body.insight && typeof body.insight === "object" ? body.insight : undefined;
  const confidence = cleanConfidence(insight?.confidence);
  const controls = cleanList(insight?.controls, 6, 100);
  const evidence = cleanEvidence(insight?.evidence);
  const businessLine = cleanText(insight?.businessLine, 100);
  const growthPlay = cleanText(insight?.growthPlay, 120);
  const customerRef = cleanText(insight?.customerRef, 120);
  const moment = cleanText(insight?.moment, 180);
  const whyNow = cleanText(insight?.whyNow, 700);
  const recommendedAction = cleanText(insight?.recommendedAction, 700);
  const expectedOutcome = cleanText(insight?.expectedOutcome, 220);
  const destination = cleanText(insight?.destination, 160);
  const sourceName = cleanText(insight?.sourceName, 160);
  const decisionRef = cleanText(insight?.decisionRef, 160);
  const connectorSource = cleanText(body.source, 100) || "salesforce-connector";
  const whoId = cleanSalesforceId(body.whoId);
  const whatId = cleanSalesforceId(body.whatId);

  const structuredDescription = insight
    ? [
        section("WHY THIS NEEDS ATTENTION", [whyNow || moment].filter(Boolean)),
        section("RECOMMENDED NEXT STEP", [recommendedAction].filter(Boolean)),
        section("BUSINESS OUTCOME", [expectedOutcome].filter(Boolean)),
        section(
          "SUPPORTING SIGNALS",
          evidence.map((item) => `• ${item.label}${item.confidence === null ? "" : ` (${item.confidence}% confidence)`}`),
        ),
        section("POLICY CONTROLS", controls.length ? [`Attached for review: ${controls.join(" · ")}`] : []),
        section("ROUTING", [businessLine && destination ? `${businessLine} → ${destination}` : destination || businessLine].filter(Boolean)),
        section(
          "AUDIT",
          [
            growthPlay ? `Growth Play: ${growthPlay}` : "",
            customerRef ? `Customer reference: ${customerRef}` : "",
            decisionRef ? `Decision reference: ${decisionRef}` : "",
            sourceName ? `Evidence source: ${sourceName}` : "",
            confidence === null ? "" : `Decision confidence: ${confidence}%`,
          ].filter(Boolean),
        ),
      ]
        .filter(Boolean)
        .join("\n\n")
    : cleanText(body.description, 7000);

  const dueInDays = typeof body.dueInDays === "number" && Number.isFinite(body.dueInDays)
    ? Math.max(1, Math.min(30, Math.round(body.dueInDays)))
    : 3;
  const dueDate = new Date(now.getTime() + dueInDays * 864e5).toISOString().slice(0, 10);
  const priority = body.priority === "Normal" || body.priority === "High"
    ? body.priority
    : confidence !== null && confidence >= 85
      ? "High"
      : "Normal";
  const auditFooter = `Connector: Ventus · ${connectorSource} · ${now.toISOString()}`;

  return {
    task: {
      Subject: subject,
      Description: `${structuredDescription}${structuredDescription ? "\n\n" : ""}${auditFooter}`.slice(0, 8000),
      Priority: priority,
      Status: "Not Started",
      ActivityDate: dueDate,
      ...(whoId ? { WhoId: whoId } : {}),
      ...(whatId ? { WhatId: whatId } : {}),
    },
    activation: {
      subject,
      businessLine,
      growthPlay,
      moment,
      recommendedAction,
      expectedOutcome,
      destination,
      confidence,
    },
  };
}

export function buildSalesforceReferralRecord(body: SalesforceDeliveryBody, now = new Date()) {
  const insight = body.insight && typeof body.insight === "object" ? body.insight : undefined;
  const fsc = body.fsc && typeof body.fsc === "object" ? body.fsc : undefined;
  const clientId = cleanSalesforceId(fsc?.clientId);
  const recordTypeId = cleanSalesforceId(fsc?.referralRecordTypeId);
  if (!insight || !clientId || !recordTypeId) return null;

  const confidence = cleanConfidence(insight.confidence);
  const estimatedReferralValue = cleanCurrency(fsc?.estimatedReferralValue);
  const growthPlay = cleanText(insight.growthPlay, 120);
  const customerRef = cleanText(insight.customerRef, 80);
  const moment = cleanText(insight.moment, 180) || cleanText(body.subject, 255);
  const whyNow = cleanText(insight.whyNow, 1200);
  const recommendedAction = cleanText(insight.recommendedAction, 1200);
  const expectedOutcome = cleanText(insight.expectedOutcome, 500);
  const decisionRef = cleanText(insight.decisionRef, 160);
  const sourceName = cleanText(insight.sourceName, 160);
  const controls = cleanList(insight.controls, 6, 100);
  const evidence = cleanEvidence(insight.evidence);

  const description = [
    section("QUALIFIED MOMENT", [moment].filter(Boolean)),
    section("WHY NOW", [whyNow].filter(Boolean)),
    section("RECOMMENDED ACTION", [recommendedAction].filter(Boolean)),
    section("EXPECTED OUTCOME", [expectedOutcome].filter(Boolean)),
    section("RELATIONSHIP CONTEXT", [
      `Existing client Account: ${clientId}`,
      estimatedReferralValue === null ? "" : `Estimated opportunity value: $${estimatedReferralValue.toLocaleString("en-US")}`,
    ].filter(Boolean)),
  ].filter(Boolean).join("\n\n");

  const audit = [
    growthPlay ? `Growth Play: ${growthPlay}` : "",
    decisionRef ? `Decision reference: ${decisionRef}` : "",
    confidence === null ? "" : `Decision confidence: ${confidence}%`,
    sourceName ? `Evidence source: ${sourceName}` : "",
    evidence.length ? `Signals: ${evidence.map((item) => item.label).join(" · ")}` : "",
    controls.length ? `Controls: ${controls.join(" · ")}` : "",
    `Created by Ventus connector at ${now.toISOString()}`,
  ].filter(Boolean).join("\n");

  return {
    RecordTypeId: recordTypeId,
    LastName: customerRef || "Existing Client",
    Company: "Existing client relationship",
    Status: "New",
    Description: `${description}\n\nAUDIT\n${audit}`.slice(0, 32000),
  };
}

export function buildSalesforceDecisionRecord(
  body: SalesforceDeliveryBody,
  workflow: { referralId?: string; taskId?: string },
  now = new Date(),
) {
  const decisionPackage = asRecord(body.decisionPackage);
  const growthPlay = asRecord(decisionPackage.growthPlay);
  const moment = asRecord(decisionPackage.moment);
  const recommendation = asRecord(decisionPackage.recommendation);
  const selectedAction = asRecord(recommendation.selectedAction);
  const governance = asRecord(decisionPackage.governance);
  const response = asRecord(decisionPackage.response);
  const outcome = asRecord(decisionPackage.outcome);
  const decisionMethod = asRecord(decisionPackage.decisionMethod);
  const subject = asRecord(decisionPackage.subject);

  const decisionId = cleanText(decisionPackage.decisionId, 160);
  if (!decisionId) return null;

  const confidence = cleanConfidence(moment.confidence);
  const clientId = cleanSalesforceId(
    process.env.SF_DEMO_ACCOUNT_ID || asRecord(body.fsc).clientId,
  );
  const workflowRecordId = cleanSalesforceId(workflow.referralId || workflow.taskId);
  const evidence = Array.isArray(moment.evidence)
    ? moment.evidence
        .map((item) => cleanText(asRecord(item).label, 140))
        .filter(Boolean)
        .slice(0, 6)
    : [];
  const outcomeMetric = cleanText(outcome.metric, 100);
  const outcomeStatus = cleanText(outcome.status, 40) === "not-opened"
    ? "measuring"
    : cleanText(outcome.status, 40);
  const packageSnapshot = {
    schemaVersion: cleanText(decisionPackage.schemaVersion, 20),
    decisionId,
    tenantId: cleanText(decisionPackage.tenantId, 100),
    createdAt: cleanText(decisionPackage.createdAt, 40),
    evidenceClass: cleanText(decisionPackage.evidenceClass, 40),
    growthPlay: {
      id: cleanText(growthPlay.id, 100),
      name: cleanText(growthPlay.name, 120),
      businessLine: cleanText(growthPlay.businessLine, 100),
      objective: cleanText(growthPlay.objective, 180),
      primaryMetric: cleanText(growthPlay.primaryMetric, 100),
      protocolId: cleanText(growthPlay.protocolId, 100),
    },
    subject: {
      token: cleanText(subject.token, 160),
    },
    moment: {
      type: cleanText(moment.type, 180),
      summary: cleanText(moment.summary, 700),
      confidence,
      evidence,
    },
    recommendation: {
      actionId: cleanText(selectedAction.id, 100),
      title: cleanText(selectedAction.title, 180),
      ownerRole: cleanText(selectedAction.ownerRole, 100),
      destination: cleanText(selectedAction.destination, 120),
    },
    governance: {
      policyStatus: cleanText(governance.policyStatus, 40),
      controls: cleanList(governance.controls, 8, 100),
      assignmentArm: cleanText(governance.assignmentArm, 40),
    },
    decisionMethod: {
      active: cleanText(decisionMethod.active, 80),
      shadowCandidate: cleanText(decisionMethod.shadowCandidate, 100),
    },
    response: {
      status: cleanText(response.status, 40),
      actor: cleanText(response.actor, 160),
      reason: cleanText(response.reason, 500),
      recordedAt: cleanText(response.recordedAt, 40),
    },
    outcome: {
      metric: outcomeMetric,
      status: outcomeStatus,
    },
    workflow: {
      referralId: cleanSalesforceId(workflow.referralId),
      taskId: cleanSalesforceId(workflow.taskId),
    },
    mirroredAt: now.toISOString(),
  };

  return {
    Decision_Reference__c: decisionId,
    Schema_Version__c: packageSnapshot.schemaVersion || "1.0",
    Growth_Play__c: packageSnapshot.growthPlay.name,
    Business_Objective__c: packageSnapshot.growthPlay.objective,
    Customer_Moment__c: packageSnapshot.moment.type,
    Recommended_Action__c: packageSnapshot.recommendation.title,
    Confidence__c: confidence,
    Evidence_Class__c: packageSnapshot.evidenceClass,
    Policy_Status__c: packageSnapshot.governance.policyStatus,
    Human_Response__c: packageSnapshot.response.status,
    Outcome_Status__c: packageSnapshot.outcome.status,
    Outcome_Event_Type__c: outcomeMetric,
    Outcome_Metric__c: outcomeMetric,
    Workflow_Record_Id__c: workflowRecordId,
    Decision_Package__c: JSON.stringify(packageSnapshot).slice(0, 32_000),
    ...(clientId ? { Client_Account__c: clientId } : {}),
  };
}

function creds(): { loginUrl: string; clientId: string; clientSecret: string } | null {
  const loginUrl = process.env.SF_LOGIN_URL?.trim().replace(/\/$/, "");
  const clientId = process.env.SF_CLIENT_ID?.trim();
  const clientSecret = process.env.SF_CLIENT_SECRET?.trim();
  return loginUrl && clientId && clientSecret ? { loginUrl, clientId, clientSecret } : null;
}

const fscReferralEnabled = () => process.env.SF_FSC_REFERRAL_ENABLED?.trim().toLowerCase() === "true";
const decisionReceiptEnabled = () => process.env.SF_VENTUS_DECISION_ENABLED?.trim().toLowerCase() === "true";

async function getToken(c: { loginUrl: string; clientId: string; clientSecret: string }): Promise<{ accessToken: string; instanceUrl: string }> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: c.clientId,
    client_secret: c.clientSecret,
  });
  const res = await fetch(`${c.loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Salesforce auth ${res.status}: ${text.slice(0, 160)}`);
  }
  const data = (await res.json()) as { access_token?: string; instance_url?: string };
  if (!data.access_token || !data.instance_url) throw new Error("Salesforce auth: missing token/instance_url");
  return { accessToken: data.access_token, instanceUrl: data.instance_url.replace(/\/$/, "") };
}

async function createRecord({
  instanceUrl,
  accessToken,
  objectName,
  record,
}: {
  instanceUrl: string;
  accessToken: string;
  objectName: string;
  record: Record<string, unknown>;
}) {
  const res = await fetch(`${instanceUrl}/services/data/${API_VERSION}/sobjects/${objectName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Salesforce ${objectName} create ${res.status}: ${text.slice(0, 200)}`);
  }
  const created = (await res.json()) as { id?: string; success?: boolean };
  if (!created.id) throw new Error(`Salesforce ${objectName} create: no id returned`);
  return created.id;
}

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();
  const principal = authorizeConnector(request, { scope: "salesforce_write", destination: "salesforce" });
  if (!principal) return Response.json({ error: "forbidden" }, { status: 403 });

  const c = creds();
  if (!c) {
    return Response.json(
      { error: "Salesforce not configured — set SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET (Connected App with Client Credentials Flow)" },
      { status: 503 },
    );
  }

  let body: SalesforceDeliveryBody;
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const subject = cleanText(body.subject, 255);
  if (!subject) return Response.json({ error: "subject (string) required" }, { status: 400 });
  const { task, activation } = buildSalesforceTaskRecord(body);
  const configuredClientId = cleanSalesforceId(process.env.SF_DEMO_ACCOUNT_ID);
  const configuredReferralRecordTypeId = cleanSalesforceId(process.env.SF_FSC_REFERRAL_RECORD_TYPE_ID);
  const referralBody = configuredClientId && configuredReferralRecordTypeId
    ? {
        ...body,
        fsc: {
          ...body.fsc,
          clientId: configuredClientId,
          referralRecordTypeId: configuredReferralRecordTypeId,
        },
      }
    : body;
  const referralRecord = fscReferralEnabled() ? buildSalesforceReferralRecord(referralBody) : null;

  try {
    const { accessToken, instanceUrl } = await getToken(c);
    const warnings: Array<{ stage: string; message: string }> = [];
    let referral: { id: string; url: string } | null = null;

    if (fscReferralEnabled()) {
      if (!referralRecord) {
        warnings.push({
          stage: "fsc_referral",
          message: "FSC Referral skipped because a valid client Account id or Lead Referral record type id was unavailable.",
        });
      } else {
        try {
          const id = await createRecord({
            instanceUrl,
            accessToken,
            objectName: "Lead",
            record: referralRecord,
          });
          referral = {
            id,
            url: `${instanceUrl}/lightning/r/Lead/${id}/view`,
          };
        } catch (error) {
          warnings.push({
            stage: "fsc_referral",
            message: String(error).slice(0, 240),
          });
        }
      }
    }

    const taskRecord = referral
      ? {
          ...task,
          WhoId: referral.id,
          WhatId: undefined,
          Description: `FSC LEAD REFERRAL\nLead referral: ${referral.id}\n\n${task.Description}`.slice(0, 8000),
        }
      : task;
    const taskId = await createRecord({
      instanceUrl,
      accessToken,
      objectName: "Task",
      record: taskRecord,
    });
    const taskReceipt = {
      id: taskId,
      url: `${instanceUrl}/lightning/r/Task/${taskId}/view`,
    };
    let decision: { id: string; url: string } | null = null;
    if (decisionReceiptEnabled()) {
      const decisionRecord = buildSalesforceDecisionRecord(body, {
        referralId: referral?.id,
        taskId,
      });
      if (!decisionRecord) {
        warnings.push({
          stage: "decision_receipt",
          message: "Ventus Decision Receipt skipped because the request did not contain a valid Decision Package.",
        });
      } else {
        try {
          const id = await createRecord({
            instanceUrl,
            accessToken,
            objectName: "Ventus_Decision__c",
            record: decisionRecord,
          });
          decision = {
            id,
            url: `${instanceUrl}/lightning/r/Ventus_Decision__c/${id}/view`,
          };
        } catch (error) {
          warnings.push({
            stage: "decision_receipt",
            message: String(error).slice(0, 240),
          });
        }
      }
    }
    const primary = referral
      ? { object: "Lead", ...referral }
      : { object: "Task", ...taskReceipt };

    return Response.json({
      system: "Salesforce",
      object: primary.object,
      id: primary.id,
      url: primary.url,
      instanceUrl,
      activation,
      records: {
        decision,
        referral,
        task: taskReceipt,
      },
      warnings,
      authorization: {
        tenantId: principal.tenantId,
        sessionId: principal.sessionId,
        mode: principal.authMode,
      },
    });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 200) }, { status: 502 });
  }
}
