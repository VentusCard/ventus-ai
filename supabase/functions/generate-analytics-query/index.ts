import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM = `You translate plain-English analytics questions into a single safe SQL SELECT statement that runs against an in-browser SQL engine over Ventus banking-enrichment tables.

Output a SQL statement via the deliver_query tool only. No prose, no markdown fences.

Engine capabilities:
- SELECT, WITH (CTEs), JOIN / LEFT JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, OFFSET.
- Aggregates: COUNT, SUM, AVG, MIN, MAX, COUNT(DISTINCT col).
- Functions: ROUND, ABS, COALESCE, IFNULL, CAST, LOWER, UPPER, SUBSTR, LENGTH.
- CASE WHEN … THEN … ELSE … END, IN, BETWEEN, LIKE, subqueries in FROM / WHERE.
- Dates are ISO strings 'YYYY-MM-DD'; compare with string operators (WHERE day >= '2026-05-25').

Hard rules:
- Exactly one statement. Never use ';' to chain statements.
- SELECT or WITH only. Never emit INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, TRUNCATE, MERGE, GRANT.
- Only reference tables and columns from the provided schema. Never invent columns.
- Use enum values exactly as listed (case-sensitive). 'Premium' not 'premium'; 'new_baby' not 'New Baby'.
- For top-N or large result sets, always include ORDER BY and LIMIT.
- Alias every aggregate with AS <snake_case_name>.
- When a question mixes signals across tables, prefer explicit JOINs over subqueries.
- For boolean-int columns like deals.active, compare with 1 or 0 (WHERE active = 1), never TRUE/FALSE.
- Optionally start with a single SQL comment "-- @chart line|bar|area[:column]" to hint the chart type.

Examples:

User: "top 5 brands redeemed by Affluent customers in the last 30 days"
SQL:
-- @chart bar:revenue
SELECT d.brand,
       COUNT(*)                      AS redemptions,
       ROUND(SUM(r.redeemed_amount)) AS revenue
FROM   deal_redemptions r
JOIN   deals     d ON d.deal_id     = r.deal_id
JOIN   customers c ON c.customer_id = r.customer_id
WHERE  c.segment = 'Affluent'
  AND  r.day >= '<start_date>'
GROUP BY d.brand
ORDER BY revenue DESC
LIMIT 5

User: "average Family pillar spend for customers with a new_baby event"
SQL:
SELECT ROUND(AVG(sh.total_spend)) AS avg_family_spend,
       COUNT(DISTINCT sh.customer_id) AS customers
FROM   life_events le
JOIN   shopping_habits sh
  ON   sh.customer_id = le.customer_id
 AND   sh.pillar = 'Family'
WHERE  le.event_type = 'new_baby'`;

function stripLiteralsAndComments(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    if (ch === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }
    if (ch === "'") {
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") { i += 2; continue; }
        if (sql[i] === "'") { i++; break; }
        i++;
      }
      out += "''";
      continue;
    }
    if (ch === '"' || ch === "`") {
      const quote = ch;
      out += ch; i++;
      while (i < sql.length && sql[i] !== quote) { out += sql[i++]; }
      if (i < sql.length) { out += sql[i++]; }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|ATTACH|DETACH|EXEC|MERGE|REPLACE|GRANT|REVOKE)\b/i;

interface ColumnHint {
  name: string;
  type: string;
  enums?: string[];
  note?: string;
}

function renderSchema(
  schema: Record<string, string[]> | undefined,
  hints: Record<string, ColumnHint[]> | undefined,
): string {
  if (hints && Object.keys(hints).length) {
    return Object.entries(hints)
      .map(([table, cols]) => {
        const lines = cols.map((c) => {
          const parts = [`  ${c.name} : ${c.type}`];
          if (c.enums?.length) {
            const sample = c.enums.slice(0, 12).join(", ");
            parts.push(`enum(${sample}${c.enums.length > 12 ? ", …" : ""})`);
          }
          if (c.note) parts.push(`// ${c.note}`);
          return parts.join("  ");
        });
        return `${table}(\n${lines.join("\n")}\n)`;
      })
      .join("\n\n");
  }
  return Object.entries(schema || {})
    .map(([t, cols]) => `- ${t}(${(cols as string[]).join(", ")})`)
    .join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const body = await req.json().catch(() => ({}));
    const { prompt, currentQuery, schema, schemaHints, dateContext } = body ?? {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Prompt too long (2000 chars max)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (currentQuery && typeof currentQuery === "string" && currentQuery.length > 4000) {
      return new Response(JSON.stringify({ error: "Current query too long (4000 chars max)." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schemaText = renderSchema(schema, schemaHints);

    const dateBlock = dateContext?.today
      ? `Date context (resolve ALL relative phrases — "today", "yesterday", "last week", "last month", "last 30 days", "this quarter", etc. — to concrete 'YYYY-MM-DD' literals):
- today: ${dateContext.today}
- dataset spans: ${dateContext.minDay} → ${dateContext.maxDay} (inclusive)
- Never emit a date outside [${dateContext.minDay}, ${dateContext.maxDay}]. Clamp if needed.
- "last month" = previous calendar month relative to today, clamped to the dataset range.
`
      : "";

    const userPrompt = `Schema (table.column : type, with enum samples and notes):
${schemaText}

${dateBlock}
Current query (may be empty — refine when reasonable, otherwise replace):
${currentQuery || "(none)"}

User request:
${prompt.trim()}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
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
                query: { type: "string", description: "Single SQL SELECT/WITH statement, multi-line, no markdown fences, no trailing semicolon." },
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
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "Failed to generate query" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: { query: string; explanation: string };
    try {
      parsed = JSON.parse(toolCall.function.arguments);
    } catch {
      return new Response(JSON.stringify({ error: "Generator returned malformed JSON." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    parsed.query = String(parsed.query || "")
      .replace(/```\w*\n?|```/g, "")
      .replace(/;+\s*$/g, "")
      .trim();

    const scan = stripLiteralsAndComments(parsed.query);
    const head = scan.replace(/^(?:\s*--[^\n]*\n)+/g, "").trimStart();

    if (!/^(SELECT|WITH)\b/i.test(head)) {
      return new Response(JSON.stringify({ error: "Generator returned a non-SELECT statement." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (FORBIDDEN.test(scan)) {
      return new Response(JSON.stringify({ error: "Generator returned a forbidden statement." }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (scan.includes(";")) {
      return new Response(JSON.stringify({ error: "Generator returned multiple statements." }), {
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
