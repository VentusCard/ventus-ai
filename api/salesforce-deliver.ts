// Vercel serverless function — the real Salesforce connector.
//
// Authenticates to an actual Salesforce org via the OAuth2 client-credentials flow and
// creates a real Task record through the REST API. The receipt returned is the genuine
// Salesforce record id, plus a Lightning URL you can open in the org's UI — delivery
// demonstrated, not asserted.
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

type SalesforceDeliveryBody = {
  subject?: unknown;
  description?: unknown;
  priority?: unknown;
  source?: unknown;
  dueInDays?: unknown;
  whoId?: unknown;
  whatId?: unknown;
  insight?: SalesforceInsightInput;
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

function creds(): { loginUrl: string; clientId: string; clientSecret: string } | null {
  const loginUrl = process.env.SF_LOGIN_URL?.trim().replace(/\/$/, "");
  const clientId = process.env.SF_CLIENT_ID?.trim();
  const clientSecret = process.env.SF_CLIENT_SECRET?.trim();
  return loginUrl && clientId && clientSecret ? { loginUrl, clientId, clientSecret } : null;
}

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

  try {
    const { accessToken, instanceUrl } = await getToken(c);

    // Standard fields keep the proof portable. A bank deployment maps the same activation
    // contract into its approved owner, household, workbench, and custom-object model.
    const res = await fetch(`${instanceUrl}/services/data/${API_VERSION}/sobjects/Task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(task),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return Response.json({ error: `Salesforce create ${res.status}: ${text.slice(0, 200)}` }, { status: 502 });
    }
    const created = (await res.json()) as { id?: string; success?: boolean };
    if (!created.id) return Response.json({ error: "Salesforce create: no id returned" }, { status: 502 });

    return Response.json({
      system: "Salesforce",
      object: "Task",
      id: created.id,
      url: `${instanceUrl}/lightning/r/Task/${created.id}/view`,
      instanceUrl,
      activation,
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
