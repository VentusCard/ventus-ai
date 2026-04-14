import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { persona, pillars, demographics, timeline } = await req.json();

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

    const pillarContext = (pillars || []).slice(0, 8).map((p: any, i: number) =>
      `${i + 1}. ${p.pillar} > ${p.label} — $${Math.round(p.totalSpend)} across ${p.count} txns${p.topMerchants?.length ? ` (${p.topMerchants.slice(0, 3).join(", ")})` : ""}`
    ).join("\n");

    const systemPrompt = `You generate personalized retail deal recommendations grouped by behavioral cluster, with intelligent boost/suppress signals based on recent spending.

RULES:
1. For EACH behavioral cluster provided, generate exactly 5 deals. Some should be BOOSTED (gaps in their spending journey), some SUPPRESSED (already purchased), and some NEUTRAL.
2. Messages MUST be 8-12 words max. Short, evocative, lifestyle-aligned. NO demographic references (no occupation, family size, age, income).
3. Good message: "Upgrade your travels with sleek, durable luggage from Away"
4. Bad message: "As a Product Director on the move, upgrade your commute"
5. Each deal needs: merchant name, specific product, reward value, short message, a 2-4 word lifestyle CTA, a signal, signalReason, and CATEGORY LABELS (see below).
6. CTAs should be lifestyle-driven: "Fuel Your Mornings", "Elevate Your Kitchen", "Power Your Routine"
7. Think laterally: a skier needs goggles, après-ski gear, action cameras. A foodie needs cookware, cooking classes, specialty ingredients.

SIGNAL LOGIC:
- "boost": The customer has NOT purchased this type of item but their behavior suggests they need it. signalReason should explain the gap (e.g., "No action cam in purchase history")
- "suppress": The customer has ALREADY purchased something similar recently. signalReason should reference what was found (e.g., "Ski pass purchased in Feb")
- "neutral": Standard relevance, no strong signal either way. signalReason can be brief (e.g., "Complements lifestyle")

CATEGORY LABELS:
- For SUPPRESSED deals: add "suppressedCategory" — a broad spending category the user already covers (e.g., "Hotels", "Airlines", "Ski Passes", "Coffee", "Streaming"). NOT a brand name.
- For BOOSTED deals: add "boostCategory" — a short product-type label for the opportunity (e.g., "Headphones", "Luggage", "Action Cameras", "Cookware"). NOT a brand name.
- Neutral deals: omit both fields.

AIM for 0-2 suppressed, 1-2 boosted, and the rest neutral per cluster. Most deals should be neutral — only suppress when there's a clear recent purchase match.

COLLECTION MESSAGE:
- For each cluster, generate a "collectionMessage" — a short, inspiring 8-15 word lifestyle tagline that introduces the collection of deals (e.g., "Travel smarter and in style with new gear and perks", "Elevate your mornings with bold flavors and smooth brews").
- Do NOT reference demographics. Keep it aspirational and lifestyle-focused.

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Cluster Label","pillar":"Pillar Name","collectionMessage":"8-15 word lifestyle tagline","deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

    const userPrompt = `BEHAVIORAL CLUSTERS (with recent spending/merchants):
${rollupList}

SPENDING CONTEXT:
${pillarContext}

Generate exactly 5 deals for EACH cluster above with boost/suppress/neutral signals. Return valid JSON only.`;

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
        temperature: 0.8,
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

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      console.error("Failed to parse AI response:", raw);
      parsed = { rollupOffers: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-next-offers error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
