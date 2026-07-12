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
import { authorizeConnector, connectorDisabledResponse, liveConnectorsEnabled } from "./_connectorAuth.ts";

export const maxDuration = 20;

const PLAID_ENV = (process.env.PLAID_ENV || "sandbox").trim();
const PLAID_HOST = `https://${PLAID_ENV}.plaid.com`;

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
  const principal = authorizeConnector(request, { scope: "plaid_read", destination: "plaid" });
  if (!principal) return Response.json({ error: "forbidden" }, { status: 403 });

  const c = creds();
  if (!c) return Response.json({ error: "Plaid not configured — set PLAID_CLIENT_ID and PLAID_SECRET (sandbox)" }, { status: 503 });

  const auth = { client_id: c.clientId, secret: c.secret };

  try {
    // 1) Mint a sandbox public token for a test institution with transactions.
    const pub = (await plaid("/sandbox/public_token/create", {
      ...auth,
      institution_id: "ins_109508", // First Platypus Bank — Plaid's sandbox test institution
      initial_products: ["transactions"],
    })) as { public_token?: string };
    if (!pub.public_token) throw new Error("no public_token");

    // 2) Exchange for an access token.
    const exch = (await plaid("/item/public_token/exchange", { ...auth, public_token: pub.public_token })) as {
      access_token?: string;
    };
    if (!exch.access_token) throw new Error("no access_token");

    // 3) Pull transactions over a real date window.
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 180 * 864e5).toISOString().slice(0, 10);
    const txns = (await plaid("/transactions/get", {
      ...auth,
      access_token: exch.access_token,
      start_date: start,
      end_date: end,
      options: { count: 100, offset: 0 },
    })) as { transactions?: unknown[] };

    return Response.json({
      source: "plaid",
      env: PLAID_ENV,
      transactions: txns.transactions ?? [],
      count: Array.isArray(txns.transactions) ? txns.transactions.length : 0,
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
