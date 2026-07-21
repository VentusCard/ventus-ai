import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface Body {
  sql?: string;
  columns?: string[];
  rows?: Record<string, unknown>[];
  dateContext?: { start?: string; end?: string };
}

const SYSTEM = `You are a senior banking analytics analyst writing for a private banker.
Given a SQL query and its result rows, write ONE short paragraph (3-5 sentences) that:
- States the single most important finding in plain English, citing concrete numbers FROM THE ROWS ONLY.
- Notes one runner-up or contrast if the data supports it.
- Ends with one concrete next action (e.g. "Consider exporting the X customers in segment Y for a targeted offer").
Rules:
- Never invent numbers, customers, or merchants not present in the rows.
- No bullet points, no headings, no markdown. Just the paragraph.
- Keep it under 90 words. Banker voice - direct, no hedging.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const sql = (body.sql || "").slice(0, 4000);
    const columns = Array.isArray(body.columns) ? body.columns.slice(0, 30) : [];
    const rows = Array.isArray(body.rows) ? body.rows.slice(0, 100) : [];
    if (!sql || !columns.length) {
      return new Response(JSON.stringify({ error: "sql and columns required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Date context: ${body.dateContext?.start ?? "?"} -> ${body.dateContext?.end ?? "?"}`,
      `SQL:\n${sql}`,
      `Columns: ${columns.join(", ")}`,
      `Rows (${rows.length}):\n${JSON.stringify(rows)}`,
    ].join("\n\n");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      return new Response(JSON.stringify({ error: `AI gateway ${aiRes.status}: ${txt.slice(0, 300)}` }), {
        status: aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const takeaway: string = data?.choices?.[0]?.message?.content?.trim() || "";
    if (!takeaway) {
      return new Response(JSON.stringify({ error: "Empty response from model" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ takeaway }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
