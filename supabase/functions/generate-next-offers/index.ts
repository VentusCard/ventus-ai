import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You generate personalized retail deal recommendations grouped by rollup, with intelligent boost signals based on recent spending and life context.

RULES:
1. For EACH rollup provided, generate exactly 5 ACTIVE deals. ALL 5 deals MUST have signal: "boost" with a meaningful signalReason and boostCategory.
   Do NOT include suppressed deals in the deals array.
   Instead, list any already-covered spending categories in a separate "suppressedCategories" string array on the rollup object.
   CRITICAL: The "rollup" field in your output MUST be the EXACT label string from the input (verbatim, including capitalization and punctuation). Do NOT paraphrase, shorten, rename, or invent new labels.
   CRITICAL: The "pillar" field in your output MUST be the EXACT pillar string from the input rollup (verbatim). Do NOT change it.
2. Messages MUST be 8-12 words max. Short, evocative, lifestyle-aligned. NO demographic references (no occupation, family size, age, income).
3. Good message:"Capture precious family moment on the mountain with GoPro"or"Upgrade your travels with sleek, durable luggage from Away"
4. Bad message: "As a Product Director on the move, upgrade your commute"
5. Each deal needs: merchant name, specific product, reward value, short message, a 2-4 word lifestyle CTA, signal: "boost", signalReason, and boostCategory.
6. CTAs should be lifestyle-driven: "Fuel Your Mornings", "Elevate Your Kitchen", "Power Your Routine"
7. All deals MUST relate to categories, merchants, or spending patterns present in the rollup's context. Do NOT recommend products from categories where the customer has zero relevant signal. Boost deals should fill gaps WITHIN the rollup's theme.

SIGNAL LOGIC:
- ALL 5 deals MUST have signal: "boost". Every deal needs a clear signalReason explaining the behavioral gap or opportunity, and a boostCategory (short product-type label like "Headphones", "Luggage").
- NEVER boost a category that has NO related signal in the rollup. Every deal must trace back to the rollup's theme, merchants, or categories.

suppressedCategories: For each rollup, identify 0-3 broad spending categories the user already covers (e.g., "Hotels", "Airlines", "Coffee", "Streaming") and list them in the suppressedCategories array. These are NOT deals — just metadata about what the customer already has.

COLLECTION MESSAGE:
- For each rollup, generate a "collectionMessage" — a short, inspiring 8-15 word lifestyle tagline introducing the collection.
- Do NOT reference demographics. Keep it aspirational and lifestyle-focused.

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Exact Input Label","pillar":"Exact Input Pillar","collectionMessage":"8-15 word lifestyle tagline","suppressedCategories":["Hotels","Coffee"],"deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

function parseJsonLoose(raw: string): any {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidates = [
    jsonMatch?.[1]?.trim(),
    raw.trim(),
    raw.match(/(\{[\s\S]*\})/)?.[1]?.trim(),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    try { return JSON.parse(c); } catch { /* try next */ }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const rawBody = await req.text();
    if (!rawBody || !rawBody.trim()) {
      console.warn("generate-next-offers: empty request body");
      return new Response(JSON.stringify({ rollupOffers: [], error: "empty body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error("generate-next-offers: JSON parse failed:", parseErr);
      return new Response(JSON.stringify({ rollupOffers: [], error: "invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { rollups } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const validRollups = (rollups || []).filter((r: any) => r && r.label && r.pillar);

    if (validRollups.length === 0) {
      return new Response(JSON.stringify({ rollupOffers: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rollupList = validRollups
      .map((r: any, i: number) => {
        const cats = (r.categories || []).join(", ");
        const merchants = (r.topMerchants || []).slice(0, 6).join(", ");
        const parts = [
          `${i + 1}. label: "${r.label}" | pillar: "${r.pillar}"`,
        ];
        if (cats) parts.push(`categories: ${cats}`);
        if (merchants) parts.push(`recent merchants: ${merchants}`);
        return parts.join(" — ");
      })
      .join("\n");

    const userPrompt = `ROLLUPS (generate exactly 5 boost deals for EACH):
${rollupList}

In the output, the "rollup" field MUST be the exact label string in quotes from each rollup, and the "pillar" field MUST be the exact pillar string in quotes (verbatim, no changes).
If the input pillar is "Life Event", the rollup label is a SHORT EVENT NAME (e.g., "Home Purchase", "New Baby", "Retirement Planning") — output it character-for-character; do NOT paraphrase, expand, or rename it.
Return valid JSON only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.55,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    const parsed = parseJsonLoose(raw);

    const rollupOffers = parsed?.rollupOffers && Array.isArray(parsed.rollupOffers)
      ? parsed.rollupOffers
      : [];

    if (rollupOffers.length === 0) {
      console.error("Failed to parse AI response:", raw.slice(0, 500));
    }

    return new Response(JSON.stringify({ rollupOffers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-next-offers error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
