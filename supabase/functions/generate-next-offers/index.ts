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

    const systemPrompt = `You are a hyper-personalization engine for a bank's rewards program. 
Given a customer's synthesized persona, spending pillars, demographics, and purchase timeline, generate 4-6 personalized deal recommendations.

RULES:
1. For each top spending pillar, generate 1-2 EXTENDED deals — adjacent products the customer would logically want but hasn't bought yet. Think laterally: a skier needs GoPro, goggles, après-ski gear. A home cook needs premium knives, cooking classes.
2. Generate 1 "discovery" deal from a category the customer doesn't spend in, but would likely enjoy based on their profile.
3. Each deal message MUST be personalized using demographics (family size, occupation, age). E.g. for a family of 4: "Capture precious family moments on the mountain."
4. Messages should be 15-25 words, emotionally resonant, lifestyle-focused. No banking jargon, no "Shop Now" CTAs.
5. Rationale must explain the behavioral inference chain (e.g., "Ski passes + jackets + family of 4 → action camera").
6. Return valid JSON only.`;

    const userPrompt = `CUSTOMER PROFILE:
Persona: ${persona?.headline || "Unknown"}
Insights: ${(persona?.insights || []).join("; ")}

SPENDING PILLARS (ranked by spend):
${(pillars || []).slice(0, 8).map((p: any, i: number) => 
  `${i + 1}. ${p.pillar} > ${p.label} — $${Math.round(p.totalSpend)} across ${p.count} txns${p.topMerchants?.length ? ` (${p.topMerchants.slice(0, 3).join(", ")})` : ""}${p.subcategories?.length ? ` [${p.subcategories.slice(0, 4).join(", ")}]` : ""}`
).join("\n")}

DEMOGRAPHICS:
- Occupation: ${demographics?.occupation || "Professional"}
- Family: ${demographics?.familyStatus || "Unknown"}
- Age: ${demographics?.age || "Unknown"}
- Income: ${demographics?.incomeLevel || "Unknown"}

PILLAR ROLLUPS (behavioral clusters):
${(persona?.pillarRollups || []).map((r: any) => `• ${r.label} (${r.pillar}): ${r.categories?.join(", ") || "N/A"}`).join("\n")}

Generate 4-6 deals as a JSON object with this exact shape:
{
  "offers": [
    {
      "id": "gen_1",
      "merchant": "Brand Name",
      "product": "Specific Product",
      "category": "Pillar Name",
      "rewardType": "discount|cashback|freebie|upgrade",
      "rewardValue": "15% Off",
      "message": "Personalized lifestyle message using demographics",
      "cta": "Lifestyle-driven CTA (3-5 words)",
      "rationale": "Behavioral inference: signal A + signal B + demographic → this product",
      "sourceRollup": "Which rollup/pillar this extends from",
      "isDiscovery": false
    }
  ]
}`;

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

    // Extract JSON from response (may be wrapped in markdown code fence)
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      console.error("Failed to parse AI response:", raw);
      parsed = { offers: [] };
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
