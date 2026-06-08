import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productId, productName, productCategory, productPositioning, curatedSignals } = await req.json();

    if (!productId || !productName) {
      return new Response(JSON.stringify({ error: "productId and productName are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");



    const curatedBlock = Array.isArray(curatedSignals) && curatedSignals.length
      ? curatedSignals
          .map((s: any, i: number) => `  ${i + 1}. ${s.label} — evidence: ${s.evidence}`)
          .join("\n")
      : "  (none provided)";

    const LIFE_EVENT_VOCAB = [
      { id: "retirement", name: "Retirement Planning" },
      { id: "education", name: "Education Funding" },
      { id: "family", name: "Family Formation" },
      { id: "home", name: "Home Purchase" },
      { id: "elder_care", name: "Elder Care" },
      { id: "business", name: "Business Liquidity" },
      { id: "wealth_transfer", name: "Wealth Transfer" },
    ];
    const lifeEventVocabBlock = LIFE_EVENT_VOCAB.map((e) => `  - ${e.id} (${e.name})`).join("\n");

    const userPrompt = `Generate 8–10 Lifestyle Asset Signals that predict strong fit for THIS SPECIFIC product, AND decide which life events are meaningful targeting levers for it.

PRODUCT
- Name: ${productName}
- Category: ${productCategory ?? "n/a"}
- What it does: ${productPositioning ?? "n/a"}

REFERENCE SIGNALS (curated examples of the level of product-specificity required — match this concreteness, do not copy verbatim):
${curatedBlock}

REQUIRED ORDERING FOR SIGNALS:
- The FIRST 2–3 signals MUST be the most obvious, top-of-mind consumer spending categories this product directly rewards or serves (the basics any customer would expect). Lead with these baselines, then layer in more nuanced/behavioral signals.
- Travel rewards card baselines: flights booked, hotel stays, rental cars, rideshare/taxis to airport, restaurant spend abroad
- HELOC baselines: home improvement spend, contractor payments, big-box hardware runs
- 529 plan baselines: daycare/tuition payments, kids' activity spend, pediatric copays
- Auto loan baselines: dealer visits, vehicle service spend, gas stations
- Cashback card baselines: grocery spend, gas stations, streaming subscriptions
- Mortgage baselines: rent payments, real estate agent fees, moving/storage spend
- Checking upgrade baselines: direct deposit payroll, recurring bill autopay

APPLICABLE LIFE EVENTS:
- Canonical vocabulary (use these ids exactly, or an empty array):
${lifeEventVocabBlock}
- Return ONLY the life events that are a clear, meaningful targeting lever for THIS product. Return an empty array when none truly apply.
- Examples: travel rewards card → []; cashback card → []; personal loan → []; auto loan → []; 529 → ["family","education"]; HELOC → ["home","family"]; mortgage → ["home","family"]; wealth management → ["retirement","business","wealth_transfer"]; life insurance → ["family","retirement","wealth_transfer","elder_care"]; high-yield savings → ["retirement","education","home"]; small business loan → ["business"].
- Do NOT pad the list. Empty is the right answer for many cards/loans.

For each signal you emit, silently verify:
1. Does the label name a concrete merchant category, transaction archetype, account flow, or life-stage event tied to ${productName}?
2. Would a customer who needs a DIFFERENT product (e.g., auto loan vs. 529 vs. HELOC vs. travel card) NOT trigger this signal?
3. Does the description name the evidence type (merchant category, ACH counterparty, deposit/withdrawal pattern, cadence) AND why it predicts fit for ${productName} specifically?
4. Does this set INCLUDE the obvious top-of-mind spending categories a customer would expect this product to reward? If not, add them FIRST before any nuanced signals.

If a signal could plausibly apply to 3+ unrelated products, throw it out and generate a more specific one.`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a bank marketing data strategist. You generate CONSUMER SPENDING signals a bank can detect from transaction data, tightly anchored to a specific product.

ABSOLUTE RULES:
1. CONSUMER PERSPECTIVE ONLY. Every signal describes something the CUSTOMER does, buys, travels to, pays for, or lives through. Never describe bank-side outcomes, fees, leakage, revenue gaps, attach rates, wallet-share loss, or product underutilization. Reframing examples:
   - WRONG: "Foreign transaction fee leakage"  RIGHT: "Foreign travel spend"
   - WRONG: "Low-yield checking erosion"        RIGHT: "Idle paychecks accumulating"
   - WRONG: "Mortgage payoff revenue loss"      RIGHT: "Mortgage paid in full"
   - WRONG: "Missed travel insurance attach"    RIGHT: "Frequent international flights"
   - WRONG: "Underutilized rewards category"    RIGHT: "Heavy dining spend"
2. PRODUCT-SPECIFIC OR NOTHING. Every signal must reference a concrete merchant category, transaction archetype, ACH counterparty, deposit/withdrawal pattern, or life-stage event that is materially more common among buyers of this product than buyers of other banking products.
3. BANNED PHRASES (never emit these words or close rewordings): "fee leakage", "interchange", "revenue at risk", "wallet share gap", "underutilized", "missed cross-sell", "attach rate", "yield erosion", "Sustained idle checking balance", "Multi-carrier travel pattern", "High discretionary spend", "Recurring premium subscriptions", "Affluent lifestyle indicators", "Established banking relationship", "Stable deposit pattern", "Diversified merchant mix".
4. Each label MUST name a real-world consumer thing (merchant type, place, ticket, life event, asset). Examples:
   - HELOC: "Home improvement spend", "Contractor payments", "Property tax payments", "Pool/landscaping vendors"
   - Travel card: "Foreign travel spend", "Frequent international flights", "Lounge purchases", "Hotel chain loyalty spend"
   - 529 plan: "Daycare payments", "Pediatric copays", "SAT/ACT fees", "College tour travel"
   - Auto loan: "Used dealer visits", "Aging vehicle service spend", "DMV/registration fees", "Rising auto insurance premium"
5. NEVER use em dashes (—). Use commas or short dashes (-).
6. NEVER include specific dollar amounts or exact transaction counts. "Vaguely specific" behavioral phrasing only.
7. NEVER mention competitor brand names (Plaid, MX, etc.) or risk/stress terminology. Frame as opportunity / fit.
8. Labels: 2–5 words, consumer-behavior tone.
9. Descriptions: ≤18 words. Describe WHAT THE CUSTOMER DOES (merchants paid, places visited, life event), then briefly why it predicts fit for ${"${productName}"}.
10. detectionRate: realistic share of US bank base, between 0.003 and 0.20.
11. id: short kebab-case, prefixed with the productId.`,
          },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "emit_signals",
              description: "Emit 8–10 product-anchored lifestyle asset signals plus the life events applicable to this product.",
              parameters: {
                type: "object",
                properties: {
                  signals: {
                    type: "array",
                    minItems: 8,
                    maxItems: 10,
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        label: { type: "string" },
                        description: { type: "string" },
                        detectionRate: { type: "number" },
                      },
                      required: ["id", "label", "description", "detectionRate"],
                      additionalProperties: false,
                    },
                  },
                  applicableLifeEvents: {
                    type: "array",
                    description: "Subset of canonical life-event ids relevant to this product. Empty when none apply.",
                    items: {
                      type: "string",
                      enum: ["retirement", "education", "family", "home", "elder_care", "business", "wealth_transfer"],
                    },
                  },
                },
                required: ["signals", "applicableLifeEvents"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "emit_signals" } },
      }),
    });


    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      if (status === 429 || status === 402) {
        return new Response(JSON.stringify({ error: status === 429 ? "Rate limit exceeded" : "Payment required", status }), {
          status: 200,
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
    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "No structured output from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const parsed = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    // Light normalization to keep IDs unique and detectionRate in range
    const seen = new Set<string>();
    const signals = (parsed.signals ?? []).map((s: any, i: number) => {
      let id = String(s.id ?? `${productId}-sig-${i}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");
      if (seen.has(id)) id = `${id}-${i}`;
      seen.add(id);
      const rate = Math.max(0.003, Math.min(0.20, Number(s.detectionRate) || 0.02));
      return { id, label: String(s.label ?? "Signal"), description: String(s.description ?? ""), detectionRate: rate };
    });

    return new Response(JSON.stringify({ signals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-lifestyle-signals error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
