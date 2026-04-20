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

    const systemPrompt = `You are a consumer banking product recommendation copywriter for "TCBY Bank". You generate UP TO FOUR product recommendation cards that appear as notifications in a mobile banking app.

CARD ORDER (STRICT INTERLEAVING):
Emit cards in exactly this order, skipping a slot only if the source doesn't exist:
  1. Life Event card based on life_events[0] (first detected life event)
  2. Behavioral card based on persona_rollups[0] (first behavioral habit)
  3. Life Event card based on life_events[1] (second detected life event, if present)
  4. Behavioral card based on persona_rollups[1] (second behavioral habit, if present)

If only 1 life event exists → emit 3 cards (life_event_1, behavioral_1, behavioral_2).
If only 1 rollup exists → emit 3 cards (life_event_1, behavioral_1, life_event_2).
Always emit at least 1 card if any source exists.

CRITICAL — signal_label must match source verbatim:
- Behavioral card: signal_label = persona_rollups[i].label EXACTLY (character-for-character, including capitalization)
- Life event card: signal_label = life_events[i].event_name EXACTLY
This enables downstream pill matching. Do NOT paraphrase, shorten, or rewrite the label.

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
- CRITICAL: The quote must NEVER name the life event directly. Use indirect, euphemistic language instead:
  - "new baby" → "a major family milestone"
  - "college" / "education" → "an upcoming chapter"
  - "retirement" → "the next phase"
  - "home purchase" → "putting down roots"
  - "wedding" → "a big celebration ahead"
  - The reader should feel the card is relevant without the bank explicitly stating what it knows
- The signal_label field MUST still use the explicit event name (e.g. "College Preparation", "New Baby", "Retirement Planning")

TONE RULES:
- Write like a smart friend who happens to work in finance, not a bank marketing department
- Conversational, warm, never corporate or pushy
- No exclamation marks in quotes
- No urgency tactics ("limited time", "act now")

OFFER DETAIL FIELDS (REQUIRED — must be personalized to THIS customer's signal):

1. offer_headline (string, 6-12 words):
   - The bold offer hook tied to the actual product economics
   - Specific and quantitative when possible: rates, points, percentages, dollar amounts
   - Examples: "Earn 2x miles on every purchase", "4.50% APY — 10x the national average", "Tax-free growth on qualified education expenses"

2. benefits (array, EXACTLY 3 strings, each 6-14 words):
   - Concrete, BoA-style product features specific to the actual product
   - Mix economics + qualitative perks (e.g., "75,000 bonus miles after $4K spend in 3 months", "No foreign transaction fees", "Priority Pass lounge access")
   - For 529: tax growth + state deduction + flexibility
   - For HYSA: APY + FDIC + no fees
   - For HELOC: borrow %, rates, draw period
   - Avoid vague phrases like "great benefits" or "rewards on spending"

3. eligibility (string, ≤14 words):
   - One-line eligibility / approval note
   - When customer is likely an existing relationship, prefer: "Pre-approved · No impact to credit score", "Pre-qualified based on relationship", "Preferred Rewards eligible — earn 25-75% more"
   - Otherwise: "Open with as little as $25", "FDIC insured up to $250,000", etc.

4. cta (string, 3-6 words) — CRITICAL, MUST BE SIGNAL-PERSONALIZED:
   - The button label MUST tie back to the customer's specific signal_label, NOT generic ("Apply Now", "Learn More", "Get Started" are FORBIDDEN)
   - For LIFE EVENT cards, mirror the euphemistic life-event framing:
     - College / Education signal → "Start Their Tuition Fund", "Build the College Fund"
     - Retirement signal → "Build Your Next Chapter", "Plan the Next Phase"
     - New Baby / Family signal → "Prepare for the Milestone", "Plan for What's Next"
     - Home Purchase signal → "Unlock Your Home's Value", "Put Down Roots"
     - Wedding signal → "Plan the Big Day", "Fund the Celebration"
   - For BEHAVIORAL cards, tie to the vaguely-specific habit:
     - Tropical getaways → "Plan Your Next Escape", "Pack for the Next Trip"
     - Coffee ritual / Dining → "Make Mornings More Rewarding", "Earn on Every Sip"
     - Weekend adventures → "Fuel the Next Adventure"
     - Home improvement → "Power Your Next Project"
     - Fitness → "Reward Your Routine"
   - The CTA should feel like a natural extension of the signal_label

5. cta_sub (string, 4-8 words):
   - Small reassurance line under the CTA — speed, friction, or trust
   - Examples: "Decision in seconds · Use card immediately", "Funded in under 5 minutes", "Soft credit check only · Instant pre-qualification", "Set up automatic contributions"`;

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

Return up to 4 cards in the strict interleaved order using the generate_product_cards function.`;

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
              description: "Return up to 4 consumer product recommendation cards in strict interleaved order: life_event_1, behavioral_1, life_event_2, behavioral_2",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    minItems: 1,
                    maxItems: 4,
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["behavioral", "life_event"],
                          description: "Card type",
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
