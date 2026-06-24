import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You translate plain-English analytics questions into a small ShopifyQL-style DSL used by an in-memory query engine.

Output ONLY a valid query in this dialect — no prose, no markdown.

Grammar (one clause per line, keywords UPPERCASE):
  FROM <table>
  SHOW <metric>[, <metric>...]               -- metrics: count | sum(col) | avg(col) | min(col) | max(col) | <col>
  TIMESERIES <day|week|month> [WITH TOTALS, PERCENT_CHANGE]
  GROUP BY <col>[, <col>...]                 -- DO NOT combine with TIMESERIES
  WHERE <col> <op> <value> [AND <col> <op> <value>...]   -- op: = != > >= < <= IN
  SINCE <startOfDay(-Nd) | YYYY-MM-DD | today>
  UNTIL <startOfDay(-Nd) | YYYY-MM-DD | today>
  COMPARE TO previous_period
  ORDER BY <col> [ASC|DESC]
  LIMIT <n>
  VISUALIZE <metric_alias> TYPE <line|bar|area>

Rules:
- Use only the tables and columns provided in the schema. Reject anything else.
- Metric aliases are auto-named "<fn>_<col>" (e.g. sum(amount) -> sum_amount). Use that alias in ORDER BY and VISUALIZE.
- Use TIMESERIES for time trends; use GROUP BY for breakdowns; never both.
- Always include SINCE/UNTIL. Default window: last 30 days (SINCE startOfDay(-30d) UNTIL today).
- Always include VISUALIZE (pick "line" for timeseries, "bar" for group-by, "area" if asked).
- Always include LIMIT (default 1000).
- Cap the result with a reasonable ORDER BY.`;

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

    const userPrompt = `Schema (table → columns):
${Object.entries(schema || {}).map(([t, cols]) => `- ${t}: ${(cols as string[]).join(", ")}`).join("\n")}

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
            description: "Return the generated DSL query plus a one-line explanation.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "The full DSL query, multi-line, no markdown fences." },
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
    // Strip accidental markdown fences
    parsed.query = String(parsed.query || "").replace(/```\w*\n?|```/g, "").trim();

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
