// Reads a single Ventus Decision Receipt from Salesforce and maps bank-entered
// disposition/outcome fields into a provider-neutral observation. It never
// accepts arbitrary SOQL and never treats one observed outcome as measured lift.
declare const process: { env: Record<string, string | undefined> };
import {
  authorizeConnector,
  connectorDisabledResponse,
  liveConnectorsEnabled,
} from "./_connectorAuth.js";

export const maxDuration = 20;

const API_VERSION = "v61.0";
const REQUEST_KEYS = new Set(["decisionRecordId"]);
const SALESFORCE_ID = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;
const RESPONSE_STATUSES = new Set(["pending", "accepted", "modified", "deferred", "declined"]);
const OUTCOME_STATUSES = new Set(["not-opened", "measuring", "measured"]);
const OUTCOME_METRICS = new Set([
  "deposit_balance",
  "deposit_retained",
  "net_new_assets",
  "estimated_revenue",
]);
const DECISION_FIELDS = [
  "Id",
  "Decision_Reference__c",
  "Decision_Package__c",
  "Human_Response__c",
  "Outcome_Status__c",
  "Outcome_Event_Type__c",
  "Outcome_Metric__c",
  "Outcome_Amount__c",
  "Outcome_Occurred_At__c",
  "Outcome_Source_Record_Id__c",
  "Outcome_Reason_Code__c",
  "LastModifiedById",
  "LastModifiedDate",
];

type SalesforceDecisionRecord = {
  Id?: unknown;
  Decision_Reference__c?: unknown;
  Decision_Package__c?: unknown;
  Human_Response__c?: unknown;
  Outcome_Status__c?: unknown;
  Outcome_Event_Type__c?: unknown;
  Outcome_Metric__c?: unknown;
  Outcome_Amount__c?: unknown;
  Outcome_Occurred_At__c?: unknown;
  Outcome_Source_Record_Id__c?: unknown;
  Outcome_Reason_Code__c?: unknown;
  LastModifiedById?: unknown;
  LastModifiedDate?: unknown;
};

class SalesforceOutcomeError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
    this.name = "SalesforceOutcomeError";
  }
}

export function normalizeSalesforceOutcome(
  record: SalesforceDecisionRecord,
  expectedTenantId: string,
) {
  const decisionRecordId = requiredSalesforceId(record.Id, "Salesforce decision record");
  const packageSnapshot = parsePackage(record.Decision_Package__c);
  const packageTenantId = requiredOpaqueText(packageSnapshot.tenantId, "Decision Package tenant", 128);
  if (packageTenantId !== expectedTenantId) {
    throw new SalesforceOutcomeError("Decision Receipt belongs to another tenant", 403);
  }

  const decisionId = requiredOpaqueText(packageSnapshot.decisionId, "Decision Package decision", 160);
  const decisionReference = requiredOpaqueText(
    record.Decision_Reference__c,
    "Salesforce decision reference",
    160,
  );
  if (decisionReference !== decisionId) {
    throw new SalesforceOutcomeError("Salesforce decision reference does not match its Decision Package", 409);
  }

  const packageResponse = asRecord(packageSnapshot.response);
  const responseStatus = enumText(
    record.Human_Response__c ?? packageResponse.status ?? "pending",
    RESPONSE_STATUSES,
    "human response",
  );
  const packageOutcome = asRecord(packageSnapshot.outcome);
  const outcomeStatus = enumText(
    record.Outcome_Status__c ?? packageOutcome.status ?? "not-opened",
    OUTCOME_STATUSES,
    "outcome status",
  );
  const evidenceClass = enumText(
    packageSnapshot.evidenceClass,
    new Set(["fixture", "sandbox", "sanctioned"]),
    "evidence class",
  );

  const base = {
    decisionRecordId,
    decisionId,
    schemaVersion: requiredOpaqueText(packageSnapshot.schemaVersion, "schema version", 20),
    evidenceClass,
    response: {
      status: responseStatus,
      actorToken: nullableOpaqueText(record.LastModifiedById, 32),
      recordedAt: nullableDate(record.LastModifiedDate),
    },
    outcome: {
      status: outcomeStatus,
      observation: null as null | ReturnType<typeof measuredObservation>,
    },
    measurementStatus: outcomeStatus === "measured"
      ? "observed_unmeasured"
      : "awaiting_outcome",
    businessClaimAllowed: false,
    causalClaimAllowed: false,
  };

  if (outcomeStatus !== "measured") return base;
  return {
    ...base,
    outcome: {
      status: outcomeStatus,
      observation: measuredObservation(record, decisionRecordId, packageOutcome),
    },
  };
}

function measuredObservation(
  record: SalesforceDecisionRecord,
  decisionRecordId: string,
  packageOutcome: Record<string, unknown>,
) {
  const eventType = requiredOpaqueText(record.Outcome_Event_Type__c, "outcome event type", 128);
  const metric = enumText(
    record.Outcome_Metric__c ?? packageOutcome.metric,
    OUTCOME_METRICS,
    "outcome metric",
  );
  const occurredAt = requiredDate(record.Outcome_Occurred_At__c, "outcome occurred at");
  const amount = nullableFiniteNumber(record.Outcome_Amount__c, "outcome amount");
  const sourceRecordId = nullableOpaqueText(record.Outcome_Source_Record_Id__c, 128)
    ?? decisionRecordId;
  const reasonCode = nullableOpaqueText(record.Outcome_Reason_Code__c, 128);
  return {
    eventId: `sf_${decisionRecordId}_${Date.parse(occurredAt)}`,
    eventType,
    occurredAt,
    sourceSystem: "salesforce-fsc",
    sourceRecordId,
    ...(reasonCode ? { reasonCode } : {}),
    ...(amount === null
      ? {}
      : {
          value: {
            metric,
            amount,
            currency: "USD" as const,
          },
        }),
  };
}

function credentials() {
  const loginUrl = process.env.SF_LOGIN_URL?.trim().replace(/\/$/, "");
  const clientId = process.env.SF_CLIENT_ID?.trim();
  const clientSecret = process.env.SF_CLIENT_SECRET?.trim();
  return loginUrl && clientId && clientSecret ? { loginUrl, clientId, clientSecret } : null;
}

async function getToken(config: NonNullable<ReturnType<typeof credentials>>) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const response = await fetch(`${config.loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Salesforce auth ${response.status}: ${text.slice(0, 160)}`);
  }
  const data = await response.json() as { access_token?: string; instance_url?: string };
  if (!data.access_token || !data.instance_url) throw new Error("Salesforce auth: missing token/instance_url");
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url.replace(/\/$/, ""),
  };
}

async function readDecisionRecord({
  instanceUrl,
  accessToken,
  decisionRecordId,
}: {
  instanceUrl: string;
  accessToken: string;
  decisionRecordId: string;
}) {
  const fields = encodeURIComponent(DECISION_FIELDS.join(","));
  const response = await fetch(
    `${instanceUrl}/services/data/${API_VERSION}/sobjects/Ventus_Decision__c/${decisionRecordId}?fields=${fields}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (response.status === 404) throw new SalesforceOutcomeError("Salesforce Decision Receipt was not found", 404);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Salesforce Decision Receipt read ${response.status}: ${text.slice(0, 200)}`);
  }
  return response.json() as Promise<SalesforceDecisionRecord>;
}

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();
  const principal = authorizeConnector(request, {
    scope: "salesforce_outcome_read",
    destination: "salesforce",
  });
  if (!principal) return Response.json({ error: "forbidden" }, { status: 403 });
  const config = credentials();
  if (!config) return Response.json({ error: "Salesforce is not configured" }, { status: 503 });

  try {
    const body = await request.json() as Record<string, unknown>;
    assertExactKeys(body, REQUEST_KEYS);
    const decisionRecordId = requiredSalesforceId(body.decisionRecordId, "decisionRecordId");
    const { accessToken, instanceUrl } = await getToken(config);
    const record = await readDecisionRecord({
      instanceUrl,
      accessToken,
      decisionRecordId,
    });
    return Response.json({
      ...normalizeSalesforceOutcome(record, principal.tenantId),
      authorization: {
        tenantId: principal.tenantId,
        sessionId: principal.sessionId,
        mode: principal.authMode,
      },
    });
  } catch (error) {
    if (error instanceof SalesforceOutcomeError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof SyntaxError) {
      return Response.json({ error: "invalid JSON" }, { status: 400 });
    }
    return Response.json({ error: String(error).slice(0, 220) }, { status: 502 });
  }
}

function parsePackage(value: unknown): Record<string, unknown> {
  if (typeof value !== "string" || value.length < 2 || value.length > 32_000) {
    throw new SalesforceOutcomeError("Decision Receipt does not contain a valid Decision Package", 409);
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid");
    return parsed as Record<string, unknown>;
  } catch {
    throw new SalesforceOutcomeError("Decision Receipt contains malformed Decision Package JSON", 409);
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function assertExactKeys(body: Record<string, unknown>, allowed: Set<string>) {
  for (const key of Object.keys(body)) {
    if (!allowed.has(key)) throw new SalesforceOutcomeError(`unknown field ${key}`);
  }
}

function requiredSalesforceId(value: unknown, label: string): string {
  if (typeof value !== "string" || !SALESFORCE_ID.test(value)) {
    throw new SalesforceOutcomeError(`${label} is invalid`);
  }
  return value;
}

function requiredOpaqueText(value: unknown, label: string, maxLength: number): string {
  if (
    typeof value !== "string"
    || value.length < 1
    || value.length > maxLength
    || !/^[A-Za-z0-9][A-Za-z0-9_.:@-]*$/.test(value)
  ) {
    throw new SalesforceOutcomeError(`${label} is invalid`);
  }
  return value;
}

function nullableOpaqueText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  return requiredOpaqueText(value, "optional outcome field", maxLength);
}

function enumText(value: unknown, allowed: Set<string>, label: string): string {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new SalesforceOutcomeError(`${label} is invalid`, 409);
  }
  return value;
}

function requiredDate(value: unknown, label: string): string {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    throw new SalesforceOutcomeError(`${label} must be an ISO date-time`, 409);
  }
  return new Date(value).toISOString();
}

function nullableDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return requiredDate(value, "last modified date");
}

function nullableFiniteNumber(value: unknown, label: string): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new SalesforceOutcomeError(`${label} must be finite`, 409);
  }
  return value;
}
