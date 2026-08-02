import { authenticateConsoleUser } from "./_consoleAuth.js";
import { executeDecisionRun } from "./_decisionRuntime.js";
import type {
  DecisionRunRequest,
  DecisionScenario,
  DecisionSourceMode,
} from "../src/lib/decision-contract.js";
import type {
  OpportunityPolicyContext,
  PlaidTransaction,
} from "../src/lib/plaid.js";
import { authorizeScenarioDecision } from "../backend/shared/console-authorization.mjs";

export const maxDuration = 10;

export async function POST(request: Request): Promise<Response> {
  const principal = await authenticateConsoleUser(request);
  if (!principal || principal.status !== "active") {
    return Response.json({ error: "active console access required" }, { status: 401 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const scenario = parseScenario(raw.scenario);
  if (!scenario) return Response.json({ error: "valid scenario required" }, { status: 400 });
  const authorization = authorizeScenarioDecision(principal, scenario);
  if (!authorization.allowed) {
    return Response.json(
      { error: "operator role and business-line access are required for this scenario" },
      { status: 403 },
    );
  }

  const transactions = parseTransactions(raw.transactions);
  if (!transactions) {
    return Response.json({ error: "1-500 valid Plaid transactions required" }, { status: 400 });
  }
  const source = parseSource(raw.source);
  if (!source) return Response.json({ error: "valid source required" }, { status: 400 });

  const decisionRequest: DecisionRunRequest = {
    scenario,
    transactions,
    source,
    policyContext: parsePolicyContext(raw.policyContext),
  };
  const response = Response.json(executeDecisionRun({
    tenantId: principal.tenantId,
    request: decisionRequest,
  }));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function parseScenario(value: unknown): DecisionScenario | null {
  return value === "deposit-retention" || value === "wealth-growth" ? value : null;
}

function parseSource(value: unknown): { mode: DecisionSourceMode; name: string } | null {
  if (!value || typeof value !== "object") return null;
  const source = value as Record<string, unknown>;
  const mode = source.mode === "live" || source.mode === "fixture" ? source.mode : null;
  const name = cleanText(source.name, 160);
  return mode && name ? { mode, name } : null;
}

function parsePolicyContext(value: unknown): OpportunityPolicyContext {
  if (!value || typeof value !== "object") return {};
  const context = value as Record<string, unknown>;
  return {
    ...(typeof context.consent === "boolean" ? { consent: context.consent } : {}),
    ...(typeof context.doNotContact === "boolean" ? { doNotContact: context.doNotContact } : {}),
    ...(typeof context.financiallyVulnerable === "boolean" ? { financiallyVulnerable: context.financiallyVulnerable } : {}),
    ...(typeof context.employeeRelationship === "boolean" ? { employeeRelationship: context.employeeRelationship } : {}),
  };
}

function parseTransactions(value: unknown): PlaidTransaction[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 500) return null;
  const transactions = value.map(parseTransaction);
  return transactions.every((transaction): transaction is PlaidTransaction => transaction !== null)
    ? transactions
    : null;
}

function parseTransaction(value: unknown): PlaidTransaction | null {
  if (!value || typeof value !== "object") return null;
  const transaction = value as Record<string, unknown>;
  const transactionId = cleanText(transaction.transaction_id, 128);
  const name = cleanText(transaction.name, 220);
  const amount = typeof transaction.amount === "number" && Number.isFinite(transaction.amount)
    ? transaction.amount
    : null;
  const date = cleanText(transaction.date, 10);
  if (!transactionId || !name || amount === null || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const category = transaction.personal_finance_category;
  const parsedCategory = category && typeof category === "object"
    ? {
        primary: cleanText((category as Record<string, unknown>).primary, 80),
        detailed: cleanText((category as Record<string, unknown>).detailed, 160),
      }
    : null;
  const channel = transaction.payment_channel;
  const paymentChannel = channel === "online" || channel === "in store" || channel === "other"
    ? channel
    : undefined;

  return {
    transaction_id: transactionId,
    account_id: cleanText(transaction.account_id, 128) || undefined,
    name,
    merchant_name: cleanText(transaction.merchant_name, 220) || null,
    amount,
    iso_currency_code: cleanText(transaction.iso_currency_code, 8) || null,
    date,
    payment_channel: paymentChannel,
    personal_finance_category: parsedCategory?.primary
      ? { primary: parsedCategory.primary, detailed: parsedCategory.detailed || "UNCLASSIFIED" }
      : null,
  };
}

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, maxLength)
    : "";
}
