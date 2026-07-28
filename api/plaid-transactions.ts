// Vercel serverless function — real Plaid ingestion.
//
// Runs the actual Plaid sandbox flow server-side (create a sandbox public token →
// exchange for an access token → pull transactions) and returns them in real Plaid
// schema. Credential-gated: with PLAID_CLIENT_ID + PLAID_SECRET set, this is a genuine
// third-party API round trip. Without them it returns a documented 503 so the frontend
// falls back to Plaid-shaped fixtures — the pipeline logic is identical either way.
//
// Setup (free, ~2 min): create a Plaid account, copy the sandbox client_id + secret, set
//   PLAID_CLIENT_ID=... PLAID_SECRET=... PLAID_ENV=sandbox ENABLE_LIVE_CONNECTORS=true
// The route also requires connector authorization; credentials alone do not expose it.
// No Link UI is needed in sandbox — /sandbox/public_token/create mints a token directly.
declare const process: { env: Record<string, string | undefined> };
import { authorizeConnector, connectorDisabledResponse, liveConnectorsEnabled } from "./_connectorAuth.js";
import { maybePreparePlaidGovernedReview } from "./_plaidGovernedReview.js";
import { executeDecisionRun } from "./_decisionRuntime.js";
import type { DecisionScenario } from "../src/lib/decision-contract.js";
import type { PlaidTransaction } from "../src/lib/plaid.js";

export const maxDuration = 30;

const PLAID_ENV = (process.env.PLAID_ENV || "sandbox").trim();
const PLAID_HOST = `https://${PLAID_ENV}.plaid.com`;

// Scenario-specific custom users let the product demo exercise the same source contract
// for each standalone business line. Amount sign per Plaid: negative = money IN,
// positive = money OUT.
const DEPOSIT_PRIMACY_CUSTOM_USER = {
  override_accounts: [
    {
      type: "depository",
      subtype: "checking",
      starting_balance: 8400,
      transactions: [
        { date_transacted: "2026-06-01", date_posted: "2026-06-01", amount: -4800, description: "ACME PAYROLL", currency: "USD" },
        { date_transacted: "2026-06-15", date_posted: "2026-06-15", amount: -4800, description: "ACME PAYROLL", currency: "USD" },
        { date_transacted: "2026-06-18", date_posted: "2026-06-18", amount: 1850, description: "CHIME TRANSFER", currency: "USD" },
        { date_transacted: "2026-06-26", date_posted: "2026-06-26", amount: 2100, description: "CHIME TRANSFER", currency: "USD" },
        { date_transacted: "2026-06-27", date_posted: "2026-06-27", amount: 146, description: "WHOLE FOODS", currency: "USD" },
      ],
    },
  ],
};

const WEALTH_GROWTH_CUSTOM_USER = {
  override_accounts: [
    {
      type: "depository",
      subtype: "checking",
      starting_balance: 12000,
      transactions: [
        { date_transacted: "2026-06-11", date_posted: "2026-06-11", amount: -230000, description: "FIDELITY 401K ROLLOVER", currency: "USD" },
        { date_transacted: "2026-06-02", date_posted: "2026-06-02", amount: -5100, description: "GUSTO PAYROLL", currency: "USD" },
        { date_transacted: "2026-06-14", date_posted: "2026-06-14", amount: 320, description: "COSTCO WHOLESALE", currency: "USD" },
        { date_transacted: "2026-06-20", date_posted: "2026-06-20", amount: 84, description: "WHOLE FOODS", currency: "USD" },
      ],
    },
  ],
};

const OFFBANK = /chime|cash app|cashapp|venmo|sofi|varo|current|robinhood/i;
const PAYROLL = /gusto|adp|paychex|payroll|direct dep|acme payroll/i;

type PlaidReadinessTxn = { name?: string; amount?: number; personal_finance_category?: { primary?: string } };

function primacyReady(txns: PlaidReadinessTxn[]): boolean {
  const hasPayroll = txns.some((t) => PAYROLL.test(t.name || "") || t.personal_finance_category?.primary === "INCOME");
  const hasOffbank = txns.some((t) => (OFFBANK.test(t.name || "") || t.personal_finance_category?.primary === "TRANSFER_OUT") && (t.amount ?? 0) > 0);
  return hasPayroll && hasOffbank;
}

function wealthReady(txns: PlaidReadinessTxn[]): boolean {
  return txns.some((t) => (
    /rollover|401k|fidelity|vanguard|schwab/i.test(t.name || "")
    || t.personal_finance_category?.primary === "TRANSFER_IN"
  ) && (t.amount ?? 0) <= -50000);
}

export function demoScenarioReady(scenario: DecisionScenario, txns: PlaidReadinessTxn[]): boolean {
  return scenario === "wealth-growth" ? wealthReady(txns) : primacyReady(txns);
}

function creds(): { clientId: string; secret: string } | null {
  const clientId = process.env.PLAID_CLIENT_ID?.trim();
  const secret = process.env.PLAID_SECRET?.trim();
  return clientId && secret ? { clientId, secret } : null;
}

async function plaid(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch(`${PLAID_HOST}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Plaid ${path} ${res.status}: ${text.slice(0, 160)}`);
  }
  return (await res.json()) as Record<string, unknown>;
}

export async function POST(request: Request): Promise<Response> {
  if (!liveConnectorsEnabled()) return connectorDisabledResponse();

  let scenario: DecisionScenario = "deposit-retention";
  try {
    const body = (await request.json()) as { scenario?: unknown };
    if (body.scenario === "wealth-growth" || body.scenario === "deposit-retention") scenario = body.scenario;
  } catch {
    // Empty request bodies retain the Deposit Primacy default for backward compatibility.
  }
  const principal = authorizeConnector(request, { scope: "plaid_read", destination: "plaid" });
  const scenarioScope = scenario === "deposit-retention"
    ? "scenario_deposit_retention"
    : "scenario_wealth_growth";
  if (
    !principal
    || (!principal.scopes.includes("*") && !principal.scopes.includes(scenarioScope))
  ) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const c = creds();
  if (!c) return Response.json({ error: "Plaid not configured — set PLAID_CLIENT_ID and PLAID_SECRET (sandbox)" }, { status: 503 });

  const customUser = scenario === "wealth-growth" ? WEALTH_GROWTH_CUSTOM_USER : DEPOSIT_PRIMACY_CUSTOM_USER;
  const readyWhen = (transactions: PlaidReadinessTxn[]) => demoScenarioReady(scenario, transactions);

  const auth = { client_id: c.clientId, secret: c.secret };

  try {
    // 1) Mint a sandbox public token for the selected standalone Growth Play.
    const pub = (await plaid("/sandbox/public_token/create", {
      ...auth,
      institution_id: "ins_109508", // First Platypus Bank — Plaid's sandbox test institution
      initial_products: ["transactions"],
      options: { override_username: "user_custom", override_password: JSON.stringify(customUser) },
    })) as { public_token?: string };
    if (!pub.public_token) throw new Error("no public_token");

    // 2) Exchange for an access token.
    const exch = (await plaid("/item/public_token/exchange", { ...auth, public_token: pub.public_token })) as {
      access_token?: string;
    };
    if (!exch.access_token) throw new Error("no access_token");

    // 3) Poll transactions until the payroll + off-bank pattern settles (Plaid ingests
    //    custom-user data incrementally), keeping the fullest set as a best-effort fallback.
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
    let best: PlaidTransaction[] = [];
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const data = (await plaid("/transactions/get", {
        ...auth,
        access_token: exch.access_token,
        start_date: start,
        end_date: end,
        options: { count: 100, offset: 0 },
      }).catch(() => ({}))) as { transactions?: PlaidTransaction[] };
      const rows = data.transactions ?? [];
      if (rows.length > best.length || readyWhen(rows)) best = rows;
      if (rows.length && readyWhen(rows)) break;
      await new Promise((r) => setTimeout(r, 1500));
    }

    const decision = best.length
      ? executeDecisionRun({
          tenantId: principal.tenantId,
          request: {
            scenario,
            transactions: best,
            source: { mode: "live", name: `Plaid ${PLAID_ENV} · live pull` },
          },
        })
      : null;
    const governedRuntime = best.length
      ? await maybePreparePlaidGovernedReview({
          principal,
          scenario,
          transactions: best,
        })
      : { state: "disabled" as const };

    return Response.json({
      source: "plaid",
      env: PLAID_ENV,
      scenario,
      ready: readyWhen(best),
      transactions: best,
      count: best.length,
      decision,
      governedRuntime,
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
