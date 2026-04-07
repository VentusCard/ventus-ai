import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pillars } = await req.json();
    if (!pillars || !Array.isArray(pillars) || pillars.length === 0) {
      return new Response(JSON.stringify({ error: "pillars array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Extract distinct pillar names from input for strict enum enforcement
    const distinctPillars = [...new Set(pillars.map((p: { pillar: string }) => p.pillar))] as string[];

    const pillarSummary = pillars
      .map((p: { pillar: string; label: string; count: number; totalSpend: number; frequency?: string; topMerchants?: string[]; spendingTier?: string; subcategories?: string[] }, i: number) => {
        const merchants = p.topMerchants?.length ? ` merchants: ${p.topMerchants.slice(0, 5).join(", ")}` : "";
        const tier = p.spendingTier ? ` [${p.spendingTier}]` : "";
        const subs = p.subcategories?.length ? ` subs: ${p.subcategories.slice(0, 5).join(", ")}` : "";
        return `[${i}] ${p.pillar} > ${p.label}: ${p.count} txns, $${p.totalSpend.toFixed(0)}${tier}${merchants}${subs}${p.frequency ? `, ${p.frequency}` : ""}`;
      })
      .join("\n");

    const systemPrompt = `You are a behavioral analytics engine for a bank. Given aggregated spending signal data, produce:

1. **headline**: A punchy 3-5 word persona archetype (e.g., "The Globe-Trotting Foodie", "Wellness-Driven Professional", "Adventure-Seeking Family"). Be specific and vivid, not generic.

2. **insights**: Exactly 3 short insight sentences (each 10-20 words). Each should surface a non-obvious behavioral pattern, cross-sell opportunity, or life-stage signal. Use specific dollar amounts and frequencies from the data. Be concrete, not vague.

3. **pillar_rollups**: Optionally group categories within the same pillar into vivid rollup labels. Rules:
   - CRITICAL: The "pillar" field MUST be one of these EXACT strings from the input data: ${distinctPillars.map(p => `"${p}"`).join(", ")}. Do NOT paraphrase, rename, or abbreviate pillar names.
   - ONLY combine categories within the SAME pillar. NEVER mix categories from different pillars.
   - **ROLLUPS ARE OPTIONAL.** Only create a rollup when the categories genuinely share a behavioral theme.
   - You may return ZERO rollups for a pillar, ONE rollup, or MULTIPLE smaller rollups within the same pillar.
   - **NEVER force unrelated categories into a single rollup just because they share a pillar.** Gas/commuting and kids/nursery are NOT related. Grocery and streaming are NOT related. If categories don't belong together, leave them as separate signals — do NOT roll them up.
   - **LIFE-STAGE LABELS require strong evidence.** Never use labels like "Suburban Nursery", "New Parent", "Family Setup", "Nesting" etc. unless there are at least 3 corroborating categories clearly about that theme (e.g., baby store + pediatric + childcare). A single merchant like Pottery Barn Kids does NOT justify a nursery/family label.
   - **ONE-OFF purchases should NOT define a rollup.** A single high-ticket purchase at one merchant does not warrant grouping with unrelated recurring transactions.
   - CRITICAL TIER ACCURACY: Look at the [Budget/Standard/Premium] tier tag AND the actual merchant names provided. Do NOT use "Premium", "Luxury", or "Elite" unless the tier is explicitly [Premium] AND the merchants confirm it (e.g. Nobu, Four Seasons, Gucci). Chipotle + Olive Garden + Trader Joe's = NOT premium. Be honest about the spending level.
   - USE SUBCATEGORY SIGNALS for specificity when available. If subcategories include "Golf", say "Avid Golfer" not "Sports Enthusiast". If merchants are Netflix + Hulu + Spotify, say "Streaming Entertainment Buff" not "Digital Subscriber". Always prefer the most specific, descriptive label.
   - Prefer descriptive, intuitive labels that capture WHAT the person actually does, not corporate jargon.
   - Good: "Streaming Entertainment Buff", "Casual Dining Regular", "Weekend Golfer", "Boutique Fitness Fan", "Budget-Friendly Foodie"
   - Bad: "Connected Digital Subscriber", "Premium Urban Gastronome", "Holistic Wellness Advocate", "Integrated Lifestyle Curator", "Suburban Nursery Setup"
   - Include the exact category names that were combined.
   - CRITICAL: For "category_indices", return the [N] row indices from the input that this rollup covers. Every listed category MUST have its index included.

Rules:
- Never use generic phrases like "diverse spending" or "various categories"
- Each insight should feel like a human analyst's observation
- Reference specific spending patterns, merchant names, and subcategories — not just categories
- Make the headline memorable and specific to THIS person
- Use merchant names and subcategories to be as specific as possible`;

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
          { role: "user", content: `Spending signals:\n${pillarSummary}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_persona",
              description: "Return the synthesized persona headline, insights, and per-pillar rollup labels",
              parameters: {
                type: "object",
                properties: {
                  headline: {
                    type: "string",
                    description: "3-5 word persona archetype headline",
                  },
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 insight sentences",
                  },
                  pillar_rollups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pillar: { type: "string", enum: distinctPillars, description: "The pillar name — MUST be one of the exact input pillar names" },
                        label: { type: "string", description: "2-4 word vivid rollup label for this pillar" },
                        categories: {
                          type: "array",
                          items: { type: "string" },
                          description: "The category names from this pillar that were combined",
                        },
                        category_indices: {
                          type: "array",
                          items: { type: "number" },
                          description: "The [N] row indices from the numbered input that this rollup covers",
                        },
                      },
                      required: ["pillar", "label", "categories", "category_indices"],
                      additionalProperties: false,
                    },
                    description: "Optional per-pillar rollup labels. Only group categories that genuinely share a behavioral theme. Return empty array if no coherent groupings exist.",
                  },
                },
                required: ["headline", "insights", "pillar_rollups"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_persona" } },
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
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    return new Response(JSON.stringify({
      headline: raw.headline || "Dynamic Persona",
      insights: (raw.insights || []).slice(0, 3),
      pillar_rollups: (raw.pillar_rollups || []).map((r: any) => ({
        pillar: r.pillar,
        label: r.label,
        categories: r.categories || [],
        category_indices: r.category_indices || [],
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("synthesize-persona error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
