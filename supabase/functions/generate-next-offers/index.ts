import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You generate personalized retail deal recommendations grouped by behavioral cluster, with intelligent boost signals based on recent spending.

RULES:
1. For EACH behavioral cluster provided, generate exactly 5 ACTIVE deals. ALL 5 deals MUST have signal: "boost" with a meaningful signalReason and boostCategory.
   Do NOT include suppressed deals in the deals array.
   Instead, list any already-covered spending categories in a separate "suppressedCategories" string array on the rollup object.
2. Messages MUST be 8-12 words max. Short, evocative, lifestyle-aligned. NO demographic references (no occupation, family size, age, income).
3. Good message:"Capture precious family moment on the mountain with GoPro"or"Upgrade your travels with sleek, durable luggage from Away"
4. Bad message: "As a Product Director on the move, upgrade your commute"
5. Each deal needs: merchant name, specific product, reward value, short message, a 2-4 word lifestyle CTA, a signal ("boost" or "neutral"), signalReason, and optionally boostCategory.
6. CTAs should be lifestyle-driven: "Fuel Your Mornings", "Elevate Your Kitchen", "Power Your Routine"
7. All deals MUST relate to categories, merchants, or spending patterns present in the BEHAVIORAL CLUSTERS or SPENDING CONTEXT. Do NOT recommend products from categories where the customer has zero spending history. Boost deals should fill gaps WITHIN existing spending areas (e.g., a traveler missing luggage), not introduce entirely new lifestyle categories.

SIGNAL LOGIC:
- ALL 5 deals MUST have signal: "boost". Every deal should have a clear signalReason explaining the behavioral gap or opportunity, and a boostCategory (short product-type label like "Headphones", "Luggage").
- NEVER boost a category that has NO related spending in the provided clusters. If the customer has no fitness/sports transactions, do NOT recommend fitness equipment. Every deal must trace back to an observed spending pattern.

suppressedCategories: For each cluster, identify 0-3 broad spending categories the user already covers (e.g., "Hotels", "Airlines", "Ski Passes", "Coffee", "Streaming") and list them in the suppressedCategories array. These are NOT deals — just metadata about what the customer already has.

COLLECTION MESSAGE:
- For each cluster, generate a "collectionMessage" — a short, inspiring 8-15 word lifestyle tagline that introduces the collection of deals.
- Do NOT reference demographics. Keep it aspirational and lifestyle-focused.

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Cluster Label","pillar":"Pillar Name","collectionMessage":"8-15 word lifestyle tagline","suppressedCategories":["Hotels","Coffee"],"deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

const LIFE_EVENT_SYSTEM_PROMPT = `You generate retail deal recommendations for customers going through specific life events. Same rules as above: exactly 5 boost deals per event, 8-12 word messages, no demographic references, lifestyle-driven CTAs. Each life event becomes one rollup with pillar="Life Event" and the event name as the rollup label. Output valid JSON only with the same shape.`;

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

async function callGateway(systemPrompt: string, userPrompt: string, apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.55,
      max_tokens: 4096,
    }),
  });
  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Guard: empty/malformed body
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

    const { persona, pillars, lifeEvents } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const rollups = persona?.pillarRollups || [];

    const rollupList = rollups
      .filter((r: any) => (r.totalCount ?? 0) > 0)
      .map((r: any, i: number) => {
        const cats = (r.categories || []).join(", ");
        const merchants = (r.topMerchants || []).slice(0, 6).join(", ");
        return `${i + 1}. "${r.label}" (${r.pillar}) — categories: ${cats}${merchants ? ` | recent merchants: ${merchants}` : ""}`;
      })
      .join("\n");

    const pillarContext = (pillars || [])
      .slice(0, 8)
      .map(
        (p: any, i: number) =>
          `${i + 1}. ${p.pillar} > ${p.label} — $${Math.round(p.totalSpend)} across ${p.count} txns${p.topMerchants?.length ? ` (${p.topMerchants.slice(0, 3).join(", ")})` : ""}`,
      )
      .join("\n");

    const lifeEventList = (lifeEvents || [])
      .map((e: any, i: number) => {
        const merchants = (e.evidence_merchants || []).slice(0, 6).join(", ");
        return `${i + 1}. "${e.event_name}" (confidence: ${Math.round((e.confidence || 0) * 100)}%)${merchants ? ` — evidence merchants: ${merchants}` : ""}`;
      })
      .join("\n");

    // Build the rollup user prompt
    let rollupUserPrompt = "";
    if (rollupList) rollupUserPrompt += `BEHAVIORAL CLUSTERS (with recent spending/merchants):\n${rollupList}\n\n`;
    if (pillarContext) rollupUserPrompt += `SPENDING CONTEXT:\n${pillarContext}\n\n`;
    rollupUserPrompt += `Generate exactly 5 boost deals for EACH cluster above. Return valid JSON only.`;

    const lifeEventUserPrompt = lifeEventList
      ? `LIFE EVENT CLUSTERS (generate 5 deals per event):\n${lifeEventList}\n\nReturn valid JSON only.`
      : "";

    // PARALLELIZE: rollups and life events in concurrent gateway calls
    const tasks: Promise<Response | null>[] = [];
    tasks.push(rollupList ? callGateway(SYSTEM_PROMPT, rollupUserPrompt, LOVABLE_API_KEY) : Promise.resolve(null));
    tasks.push(lifeEventUserPrompt ? callGateway(LIFE_EVENT_SYSTEM_PROMPT, lifeEventUserPrompt, LOVABLE_API_KEY) : Promise.resolve(null));

    const [rollupRes, lifeEventRes] = await Promise.all(tasks);

    // Surface gateway errors
    for (const r of [rollupRes, lifeEventRes]) {
      if (r && !r.ok) {
        const errText = await r.text();
        console.error("AI gateway error:", r.status, errText);
        if (r.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (r.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${r.status}`);
      }
    }

    const rollupOffers: any[] = [];

    if (rollupRes) {
      const data = await rollupRes.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJsonLoose(raw);
      if (parsed?.rollupOffers) rollupOffers.push(...parsed.rollupOffers);
      else console.error("Failed to parse rollup AI response:", raw.slice(0, 500));
    }

    if (lifeEventRes) {
      const data = await lifeEventRes.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJsonLoose(raw);
      if (parsed?.rollupOffers) rollupOffers.push(...parsed.rollupOffers);
      else console.error("Failed to parse life-event AI response:", raw.slice(0, 500));
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
