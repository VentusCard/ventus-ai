// Bounded FSC onboarding endpoint. It discovers only the objects and fields
// Ventus supports and verifies one explicit Account anchor. It never exposes
// arbitrary SOQL or returns customer names.
declare const process: { env: Record<string, string | undefined> };

import {
  authorizeConnector,
  connectorDisabledResponse,
  liveConnectorsEnabled,
} from "./_connectorAuth.js";

export const maxDuration = 20;

const API_VERSION = "v61.0";
const SALESFORCE_ID = /^[A-Za-z0-9]{15}(?:[A-Za-z0-9]{3})?$/;

type SalesforceObjectSummary = {
  name?: unknown;
  label?: unknown;
  queryable?: unknown;
  createable?: unknown;
  updateable?: unknown;
};

type SalesforceField = {
  name?: unknown;
  label?: unknown;
  type?: unknown;
  createable?: unknown;
  updateable?: unknown;
  nillable?: unknown;
  referenceTo?: unknown;
};

type SalesforceObjectDescribe = {
  name?: unknown;
  label?: unknown;
  fields?: unknown;
};

type ObjectDefinition = {
  key: string;
  label: string;
  name: string;
  purpose: string;
  fields: string[];
};

const OBJECT_DEFINITIONS: ObjectDefinition[] = [
  {
    key: "client",
    label: "Client relationship",
    name: "Account",
    purpose: "Anchor a Ventus decision to the institution's customer record.",
    fields: ["Id", "IsPersonAccount", "PersonContactId", "RecordTypeId"],
  },
  {
    key: "contact",
    label: "Client contact",
    name: "Contact",
    purpose: "Route a permitted employee interaction to a person record.",
    fields: ["Id", "AccountId", "RecordTypeId"],
  },
  {
    key: "financial_account",
    label: "Financial account",
    name: "FinServ__FinancialAccount__c",
    purpose: "Reference FSC financial-account context without copying balances into Salesforce.",
    fields: [
      "Id",
      "FinServ__PrimaryOwner__c",
      "FinServ__Household__c",
      "FinServ__RecordTypeName__c",
    ],
  },
  {
    key: "referral",
    label: "Referral workflow",
    name: "Lead",
    purpose: "Route an institution-approved referral when the bank uses an FSC referral record type.",
    fields: ["Id", "RecordTypeId", "OwnerId", "Status", "Description"],
  },
  {
    key: "task",
    label: "Employee task",
    name: "Task",
    purpose: "Place a concise next action in the employee's existing workflow.",
    fields: ["Id", "WhoId", "WhatId", "OwnerId", "Subject", "Status", "ActivityDate", "Priority"],
  },
  {
    key: "decision",
    label: "Ventus decision receipt",
    name: "Ventus_Decision__c",
    purpose: "Mirror governed evidence, approval, workflow, and outcome references.",
    fields: [
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
    ],
  },
];

const CANONICAL_MAPPINGS = [
  {
    key: "subject.account_id",
    label: "Customer account anchor",
    object: "Account",
    field: "Id",
    required: true,
  },
  {
    key: "subject.person_contact_id",
    label: "Person-contact anchor",
    object: "Account",
    field: "PersonContactId",
    required: false,
  },
  {
    key: "workflow.task_account",
    label: "Employee task relationship",
    object: "Task",
    field: "WhatId",
    required: true,
  },
  {
    key: "workflow.task_person",
    label: "Employee task person",
    object: "Task",
    field: "WhoId",
    required: false,
  },
  {
    key: "decision.account",
    label: "Decision-to-customer relationship",
    object: "Ventus_Decision__c",
    field: "Client_Account__c",
    required: true,
  },
  {
    key: "decision.reference",
    label: "Ventus decision reference",
    object: "Ventus_Decision__c",
    field: "Decision_Reference__c",
    required: true,
  },
  {
    key: "outcome.status",
    label: "Outcome status",
    object: "Ventus_Decision__c",
    field: "Outcome_Status__c",
    required: true,
  },
  {
    key: "outcome.metric",
    label: "Outcome metric",
    object: "Ventus_Decision__c",
    field: "Outcome_Metric__c",
    required: true,
  },
] as const;

export function buildFscSchemaSummary(
  globalObjects: SalesforceObjectSummary[],
  describes: Record<string, SalesforceObjectDescribe>,
) {
  const availableObjects = new Map(
    globalObjects
      .map((object) => [cleanText(object.name), object] as const)
      .filter(([name]) => Boolean(name)),
  );
  const objects = OBJECT_DEFINITIONS.map((definition) => {
    const summary = availableObjects.get(definition.name);
    const describe = describes[definition.name];
    const fields = Array.isArray(describe?.fields)
      ? (describe.fields as SalesforceField[])
      : [];
    const availableFields = new Map(
      fields
        .map((field) => [cleanText(field.name), field] as const)
        .filter(([name]) => Boolean(name)),
    );
    return {
      key: definition.key,
      label: definition.label,
      name: definition.name,
      purpose: definition.purpose,
      available: Boolean(summary && describe),
      queryable: summary?.queryable === true,
      createable: summary?.createable === true,
      updateable: summary?.updateable === true,
      fields: definition.fields.map((name) => {
        const field = availableFields.get(name);
        return {
          name,
          label: cleanText(field?.label) || name,
          type: cleanText(field?.type) || "unknown",
          available: Boolean(field),
          createable: field?.createable === true,
          updateable: field?.updateable === true,
          nillable: field?.nillable === true,
          referenceTo: Array.isArray(field?.referenceTo)
            ? field.referenceTo.filter((item): item is string => typeof item === "string")
            : [],
        };
      }),
    };
  });
  const fieldIndex = new Set(
    objects.flatMap((object) =>
      object.fields
        .filter((field) => object.available && field.available)
        .map((field) => `${object.name}.${field.name}`),
    ),
  );
  const mappings = CANONICAL_MAPPINGS.map((mapping) => ({
    ...mapping,
    status: fieldIndex.has(`${mapping.object}.${mapping.field}`) ? "ready" : "missing",
  }));
  const requiredMappingsReady = mappings
    .filter((mapping) => mapping.required)
    .every((mapping) => mapping.status === "ready");
  return {
    objects,
    mappings,
    capabilities: {
      customerAnchor: fieldIndex.has("Account.Id"),
      employeeTask: fieldIndex.has("Task.WhatId"),
      referral: fieldIndex.has("Lead.Id"),
      financialAccountContext: fieldIndex.has("FinServ__FinancialAccount__c.Id"),
      decisionReceipt: fieldIndex.has("Ventus_Decision__c.Decision_Reference__c")
        && fieldIndex.has("Ventus_Decision__c.Client_Account__c"),
      outcomeReturn: fieldIndex.has("Ventus_Decision__c.Outcome_Status__c")
        && fieldIndex.has("Ventus_Decision__c.Outcome_Metric__c"),
    },
    requiredMappingsReady,
  };
}

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();
  const principal = authorizeConnector(request, {
    scope: "salesforce_schema_read",
    destination: "salesforce",
  });
  if (!principal) return Response.json({ error: "unauthorized" }, { status: 401 });

  const config = credentials();
  if (!config) {
    return Response.json(
      { error: "Salesforce is not configured for this environment." },
      { status: 503 },
    );
  }

  let body: { action?: unknown; accountId?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  try {
    const auth = await getToken(config);
    if (body.action === "discover") {
      const globalDescribe = await salesforceJson<{ sobjects?: SalesforceObjectSummary[] }>({
        auth,
        path: `/services/data/${API_VERSION}/sobjects/`,
      });
      const globalObjects = Array.isArray(globalDescribe.sobjects)
        ? globalDescribe.sobjects
        : [];
      const availableNames = new Set(
        globalObjects.map((object) => cleanText(object.name)).filter(Boolean),
      );
      const names = OBJECT_DEFINITIONS
        .map((definition) => definition.name)
        .filter((name) => availableNames.has(name));
      const descriptions = await Promise.all(
        names.map(async (name) => [
          name,
          await salesforceJson<SalesforceObjectDescribe>({
            auth,
            path: `/services/data/${API_VERSION}/sobjects/${encodeURIComponent(name)}/describe`,
          }),
        ] as const),
      );
      const schema = buildFscSchemaSummary(
        globalObjects,
        Object.fromEntries(descriptions),
      );
      return noStore({
        system: "Salesforce FSC",
        tenantId: principal.tenantId,
        sessionId: principal.sessionId,
        instanceDomain: new URL(auth.instanceUrl).hostname,
        apiVersion: API_VERSION,
        ...schema,
      });
    }

    if (body.action === "verify-account") {
      const accountId = cleanSalesforceId(body.accountId);
      if (!accountId) {
        return Response.json({ error: "A valid 15- or 18-character Salesforce Account ID is required." }, { status: 400 });
      }
      const account = await salesforceJson<Record<string, unknown>>({
        auth,
        path: `/services/data/${API_VERSION}/sobjects/Account/${accountId}?fields=Id,IsPersonAccount,PersonContactId,RecordTypeId`,
      });
      return noStore({
        system: "Salesforce FSC",
        tenantId: principal.tenantId,
        account: {
          id: cleanSalesforceId(account.Id),
          verified: cleanSalesforceId(account.Id) === accountId,
          personAccount: account.IsPersonAccount === true,
          hasPersonContact: Boolean(cleanSalesforceId(account.PersonContactId)),
          hasRecordType: Boolean(cleanSalesforceId(account.RecordTypeId)),
        },
      });
    }

    return Response.json({ error: "unsupported onboarding action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Salesforce onboarding failed";
    const status = /not found/i.test(message) ? 404 : 502;
    return Response.json({ error: message.slice(0, 220) }, { status });
  }
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
  if (!data.access_token || !data.instance_url) {
    throw new Error("Salesforce auth did not return a usable session.");
  }
  return {
    accessToken: data.access_token,
    instanceUrl: data.instance_url.replace(/\/$/, ""),
  };
}

async function salesforceJson<T>({
  auth,
  path,
}: {
  auth: Awaited<ReturnType<typeof getToken>>;
  path: string;
}): Promise<T> {
  const response = await fetch(`${auth.instanceUrl}${path}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      response.status === 404
        ? "Salesforce record or schema was not found."
        : `Salesforce schema read ${response.status}: ${text.slice(0, 180)}`,
    );
  }
  return response.json() as Promise<T>;
}

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, 160) : "";
}

function cleanSalesforceId(value: unknown): string | null {
  const candidate = typeof value === "string" ? value.trim() : "";
  return SALESFORCE_ID.test(candidate) ? candidate : null;
}

function noStore(body: Record<string, unknown>): Response {
  const response = Response.json(body);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
