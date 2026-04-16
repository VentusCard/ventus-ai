import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { persona, pillars, demographics, timeline, lifeEvents } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const rollups = persona?.pillarRollups || [];

    // Build per-rollup spending context so AI knows what's already purchased
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

    // Build life event context if provided
    const lifeEventList = (lifeEvents || [])
      .map((e: any, i: number) => {
        const merchants = (e.evidence_merchants || []).slice(0, 6).join(", ");
        return `${i + 1}. "${e.event_name}" (confidence: ${Math.round((e.confidence || 0) * 100)}%)${merchants ? ` — evidence merchants: ${merchants}` : ""}`;
      })
      .join("\n");

    const systemPrompt = `You generate personalized retail deal recommendations grouped by behavioral cluster, with intelligent boost signals based on recent spending.

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

LIFE EVENT CLUSTERS:
- If LIFE EVENT CLUSTERS are provided, generate an additional rollup group for EACH life event with 5 deals that support that life transition.
- Use the life event name as the rollup label and "Life Event" as the pillar.
- Deals should be products/services that help someone going through that specific life event.
- Example: "Moving to New Home" → furniture, moving supplies, home insurance, smart home devices, cleaning services.

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Cluster Label","pillar":"Pillar Name","collectionMessage":"8-15 word lifestyle tagline","suppressedCategories":["Hotels","Coffee"],"deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

    let userPrompt = "";

    if (rollupList) {
      userPrompt += `BEHAVIORAL CLUSTERS (with recent spending/merchants):\n${rollupList}\n\n`;
    }

    if (pillarContext) {
      userPrompt += `SPENDING CONTEXT:\n${pillarContext}\n\n`;
    }

    if (lifeEventList) {
      userPrompt += `LIFE EVENT CLUSTERS (generate 5 deals per event):\n${lifeEventList}\n\n`;
    }

    userPrompt += `Generate exactly 5 deals for EACH cluster above with boost/neutral signals. Return valid JSON only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.55,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";

    // Try multiple extraction strategies
    let parsed;
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidates = [
      jsonMatch?.[1]?.trim(),
      raw.trim(),
      // Try extracting the outermost { ... } object
      raw.match(/(\{[\s\S]*\})/)?.[1]?.trim(),
    ].filter(Boolean);

    for (const candidate of candidates) {
      try {
        parsed = JSON.parse(candidate!);
        break;
      } catch {
        // try next candidate
      }
    }
    if (!parsed) {
      console.error("Failed to parse AI response:", raw.slice(0, 500));
      parsed = { rollupOffers: [] };
    }

    return new Response(JSON.stringify(parsed), {
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
