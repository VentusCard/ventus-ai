import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  position: z.string().trim().min(1).max(160),
  contact: z.string().trim().min(3).max(200),
  message: z.string().trim().min(5).max(5000),
  source: z.string().trim().max(200).optional(),
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { name, position, contact, message, source } = parsed.data;
    const submittedAt = new Date().toISOString();

    const row = (label: string, value: string) =>
      `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:6px 0;color:#0f172a;font-size:14px">${escapeHtml(value)}</td></tr>`;

    const html = `<!doctype html><html><body style="font-family:Manrope,Arial,sans-serif;background:#ffffff;padding:24px;color:#0f172a">
<h2 style="margin:0 0 16px;font-size:18px">New Ventus AI feedback</h2>
<table style="border-collapse:collapse;margin-bottom:20px">
${row('Name', name)}
${row('Position', position)}
${row('Contact', contact)}
${source ? row('Source', source) : ''}
${row('Submitted', submittedAt)}
</table>
<div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#f8fafc;white-space:pre-wrap;font-size:14px;line-height:1.5">${escapeHtml(message)}</div>
</body></html>`;

    const text = `New Ventus AI feedback

Name: ${name}
Position: ${position}
Contact: ${contact}
${source ? `Source: ${source}\n` : ''}Submitted: ${submittedAt}

${message}`;

    const payload: Record<string, unknown> = {
      from: 'Ventus Feedback <onboarding@resend.dev>',
      to: ['marco@ventusai.com'],
      subject: `New Ventus feedback from ${name} <${contact}>`,
      html,
      text,
    };

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const respBody = await resp.text();
    if (!resp.ok) {
      console.error('Resend error', resp.status, respBody);
      return new Response(JSON.stringify({ error: 'Failed to send', detail: respBody }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
