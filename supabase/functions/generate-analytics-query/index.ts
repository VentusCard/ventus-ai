import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You translate plain-English analytics questions into standard SQL that runs in alasql (in-browser SQL engine).

Output ONLY a valid SELECT statement — no prose, no markdown fences.

Engine notes:
- alasql implements a wide subset of standard SQL: SELECT, FROM, JOIN/LEFT JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, COUNT/SUM/AVG/MIN/MAX, COUNT(DISTINCT col), ROUND, CASE WHEN, IN, BETWEEN, LIKE, subqueries.
- Dates (column "day") are plain ISO strings 'YYYY-MM-DD'. Compare with string operators: WHERE day >= '2026-05-25'.
- Always alias aggregate columns with AS.
- Always include ORDER BY when results are ranked.
- Always include LIMIT when results could be large (top-N queries).
- Optionally start with a SQL comment "-- @chart line|bar|area[:column]" to hint the chart type.

Rules:
- SELECT only. Never emit INSERT/UPDATE/DELETE/CREATE/DROP/ALTER.
- Only reference tables and columns listed in the schema.
- Prefer JOINs across tables when the question mixes signals (e.g. life_events + shopping_habits, deal_redemptions + customers + deals).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { prompt, currentQuery, schema } = await req.json();
    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schemaText = Object.entries(schema || {})
      .map(([t, cols]) => `- ${t}(${(cols as string[]).join(", ")})`)
      .join("\n");

    const userPrompt = `Schema:
${schemaText}

Current query (may be empty):
${currentQuery || "(none)"}

User request:
${prompt}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "deliver_query",
            description: "Return the generated SQL plus a one-line explanation.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "Full SQL SELECT statement, multi-line, no markdown fences." },
                explanation: { type: "string", description: "Plain-English summary of what the query computes, under 140 chars." },
              },
              required: ["query", "explanation"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "deliver_query" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Top up your workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "Failed to generate query" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    parsed.query = String(parsed.query || "").replace(/```\w*\n?|```/g, "").trim();

    // Reject anything other than SELECT
    if (!/^\s*(--[^\n]*\n\s*)*SELECT\b/i.test(parsed.query)) {
      return new Response(JSON.stringify({ error: "Generator returned a non-SELECT statement." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b/i.test(parsed.query)) {
      return new Response(JSON.stringify({ error: "Generator returned a forbidden statement." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-analytics-query error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
