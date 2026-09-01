import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  workEmail: z.string().trim().email().max(200),
  institution: z.string().trim().min(1).max(200),
  role: z.string().trim().min(1).max(160),
  decision: z.string().trim().max(1200).optional(),
  website: z.string().max(200).optional(),
  source: z.string().trim().max(200).optional(),
});

const allowedOrigins = new Set([
  "https://ventusai.com",
  "https://www.ventusai.com",
  "https://dev.d1gaewa028qzng.amplifyapp.com",
  "https://staging.d1gaewa028qzng.amplifyapp.com",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:8081",
  "http://localhost:8080",
  "http://localhost:8081",
]);

const isAllowedOrigin = (origin: string | null) =>
  !origin || allowedOrigins.has(origin) || /^https:\/\/[^/]+\.amplifyapp\.com$/.test(origin);

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && isAllowedOrigin(origin) ? origin : "https://ventusai.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  try {
    const parsed = BodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    if (parsed.data.website) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Request service not configured" }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    const { name, workEmail, institution, role, decision, source } = parsed.data;
    const submittedAt = new Date().toISOString();
    const row = (label: string, value: string) =>
      `<tr><td style="padding:6px 14px 6px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#0f172a;font-size:14px">${escapeHtml(value)}</td></tr>`;

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#ffffff;padding:24px;color:#0f172a">
<h2 style="margin:0 0 16px;font-size:18px">New Ventus AI access request</h2>
<table style="border-collapse:collapse;margin-bottom:20px">
${row("Name", name)}
${row("Work email", workEmail)}
${row("Institution", institution)}
${row("Role", role)}
${source ? row("Source", source) : ""}
${row("Submitted", submittedAt)}
</table>
${decision ? `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#f8fafc;white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(decision)}</div>` : ""}
</body></html>`;

    const text = `New Ventus AI access request

Name: ${name}
Work email: ${workEmail}
Institution: ${institution}
Role: ${role}
${source ? `Source: ${source}\n` : ""}Submitted: ${submittedAt}
${decision ? `\nCustomer decision:\n${decision}` : ""}`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: "Ventus Access <marco@ventusai.com>",
        to: ["info@ventusai.com"],
        reply_to: workEmail,
        subject: `Ventus AI access request — ${institution}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      console.error("Resend access-request error", response.status, await response.text());
      return new Response(JSON.stringify({ error: "Failed to send request" }), {
        status: 502,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...headers, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("request-access error", error);
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
});
