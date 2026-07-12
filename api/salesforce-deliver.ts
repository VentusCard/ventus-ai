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
import { connectorAuthorized, connectorDisabledResponse, liveConnectorsEnabled } from "./_connectorAuth.ts";

export const maxDuration = 20;

const API_VERSION = "v61.0";

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
  if (!connectorAuthorized(request)) return Response.json({ error: "forbidden" }, { status: 403 });

  const c = creds();
  if (!c) {
    return Response.json(
      { error: "Salesforce not configured — set SF_LOGIN_URL, SF_CLIENT_ID, SF_CLIENT_SECRET (Connected App with Client Credentials Flow)" },
      { status: 503 },
    );
  }

  let body: { subject?: unknown; description?: unknown; priority?: unknown; source?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const subject = typeof body.subject === "string" && body.subject.trim() ? body.subject.slice(0, 255) : "";
  if (!subject) return Response.json({ error: "subject (string) required" }, { status: 400 });
  const description = typeof body.description === "string" ? body.description.slice(0, 4000) : "";
  const priority = body.priority === "Normal" ? "Normal" : "High";

  try {
    const { accessToken, instanceUrl } = await getToken(c);

    // Standard-field Task so any dev org accepts it; Ventus metadata rides in Description.
    const dueDate = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
    const res = await fetch(`${instanceUrl}/services/data/${API_VERSION}/sobjects/Task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        Subject: subject,
        Description: `${description}\n\n— Delivered by Ventus (${typeof body.source === "string" ? body.source : "demo"}) at ${new Date().toISOString()}`,
        Priority: priority,
        Status: "Not Started",
        ActivityDate: dueDate,
      }),
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
    });
  } catch (e) {
    return Response.json({ error: String(e).slice(0, 200) }, { status: 502 });
  }
}
