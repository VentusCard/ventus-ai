import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { life_events, persona_rollups, pillars, demographics } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a consumer banking product recommendation copywriter for "TCBY Bank". You generate exactly TWO product recommendation cards that appear as notifications in a mobile banking app.

Use real Bank of America products as reference for recommendations. Examples:
- Travel: Bank of America® Travel Rewards credit card, Bank of America® Premium Rewards® credit card
- Cash back: Bank of America® Customized Cash Rewards credit card, Bank of America® Unlimited Cash Rewards credit card
- Savings: Bank of America Advantage Savings, Bank of America Advantage SafePass® Savings
- Investing: Merrill Edge® Self-Directed, Merrill Guided Investing
- Home: Bank of America home equity line of credit, Bank of America mortgage
- Education: Merrill 529 College Savings Plan
- Retirement: Merrill IRA, Merrill Roth IRA
- Business: Bank of America® Business Advantage credit cards

Adapt the product name to match what Bank of America actually offers. Use their real product naming conventions.

VENTUS THESIS — THE GOLDEN RULE:
The customer should read the card and think "huh, that's actually relevant to me right now" — never "the bank is watching my transactions." It should feel like good timing, not surveillance.

CARD 1 — BEHAVIORAL:
- Based on spending patterns and lifestyle habits (persona rollups)
- Use a "vaguely specific" descriptor: specific enough to feel personal, vague enough to not feel creepy
  - GOOD: "tropical getaways", "your coffee ritual", "weekend adventures", "home improvement projects"
  - BAD: "your 3 trips to Maui", "your daily Starbucks order", "your Home Depot purchases"
- Never mention merchant names, transaction counts, or dollar amounts
- Product should genuinely match the behavior pattern
- Quote: 1-2 sentences, conversational, aspirational

CARD 2 — LIFE EVENT:
- Based on a detected life event (education, home, retirement, etc.)
- Frame as a general financial wellness tip, not "we detected X"
- Never say "we noticed", "based on your transactions", "our data shows"
- Product should be a concrete financial instrument (529, HYSA, HELOC, etc.)
- Quote: 1-2 sentences, empathetic, forward-looking

TONE RULES:
- Write like a smart friend who happens to work in finance, not a bank marketing department
- Conversational, warm, never corporate or pushy
- No exclamation marks in quotes
- No urgency tactics ("limited time", "act now")`;

    const userPrompt = `Generate two product recommendation cards based on this customer profile.

DEMOGRAPHICS:
${JSON.stringify(demographics || {}, null, 2)}

BEHAVIORAL PERSONA ROLLUPS:
${JSON.stringify((persona_rollups || []).map((r: any) => ({
  pillar: r.pillar,
  label: r.label,
  categories: r.categories,
  totalSpend: r.totalSpend,
  totalCount: r.totalCount,
})), null, 2)}

SPENDING PILLARS (top categories):
${JSON.stringify((pillars || []).slice(0, 8).map((p: any) => ({
  pillar: p.pillar,
  label: p.label,
  count: p.count,
  totalSpend: p.totalSpend,
  subcategories: p.subcategories?.slice(0, 5),
})), null, 2)}

DETECTED LIFE EVENTS:
${JSON.stringify((life_events || []).map((e: any) => ({
  event_name: e.event_name,
  confidence: e.confidence,
  project_type: e.financial_projection?.project_type,
  recommended_funding_sources: e.financial_projection?.recommended_funding_sources?.map((s: any) => s.type),
  talking_points: e.talking_points?.slice(0, 2),
})), null, 2)}

Return exactly 2 cards using the generate_product_cards function.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_product_cards",
              description: "Return exactly 2 consumer product recommendation cards",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    minItems: 2,
                    maxItems: 2,
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["behavioral", "life_event"],
                          description: "Card type — first should be behavioral, second life_event",
                        },
                        product_name: {
                          type: "string",
                          description: "Specific product name e.g. 'Venture X Travel Card', '529 College Savings Plan', 'High-Yield Savings Account'",
                        },
                        quote: {
                          type: "string",
                          description: "1-2 sentence consumer-facing copy following the Ventus thesis tone",
                        },
                        signal_label: {
                          type: "string",
                          description: "For behavioral: the vaguely-specific descriptor (e.g. 'Tropical getaways'). For life_event: the event name (e.g. 'College Preparation')",
                        },
                        theme: {
                          type: "string",
                          enum: ["travel", "dining", "fitness", "shopping", "entertainment", "home", "education", "retirement", "family", "business", "wellness", "lifestyle"],
                          description: "Color/icon theme hint",
                        },
                      },
                      required: ["type", "product_name", "quote", "signal_label", "theme"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["cards"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_product_cards" } },
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
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "No tool call returned" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cards = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(cards), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-product-cards error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
