import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LIFESTYLE_PILLARS = [
  "Travel & Exploration", "Food & Dining", "Health & Wellness",
  "Sports & Active Living", "Entertainment & Media", "Fashion & Beauty",
  "Home & Garden", "Pets", "Education & Learning", "Family & Kids",
  "Technology & Gaming", "Financial & Aspirational",
];

const LIFE_EVENT_IDS = [
  "retirement", "education", "family", "home", "elder_care", "business", "wealth_transfer",
];

const PRODUCT_NAMES = [
  "Cashback", "Custom Cashback", "Travel", "Airline", "Hotel", "Premium Travel",
  "Student", "Secured", "Business", "Co-Branded Retail",
  "Checking", "Savings", "High-Yield Savings", "Money Market", "CD",
  "Business Checking", "Business Savings", "Youth/Teen",
  "Personal Loan", "Auto Loan", "Home Mortgage", "HELOC",
  "Student Loan Refi", "Small Business Loan", "Line of Credit", "Debt Consolidation",
  "Brokerage", "Traditional IRA", "Roth IRA", "529 Plan",
  "Robo-Advisor", "Managed Portfolio", "Trust Account",
  "Life Insurance", "Home Insurance", "Auto Insurance", "Travel Insurance", "Identity Theft Protection",
  "Mobile Banking Active", "Digital Wallet", "Zelle/P2P Active",
  "Direct Deposit Active", "Bill Pay Active", "Overdraft Protection",
];

const CROSS_SELL_IDS = [
  "basic_to_premium", "cards_no_deposit", "deposit_no_cards",
  "personal_no_business", "single_product", "dormant_reactivation",
];

const UPSELL_IDS = [
  "tier_upgrade", "balance_growth", "fee_waiver", "loyalty_advancement", "annual_fee_justify",
];

const CAMPAIGN_GOAL_IDS = [
  "acquisition", "cross_sell", "upsell", "retention",
  "reactivation", "seasonal", "life_event", "brand_awareness",
];

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "West", "Northwest"];
const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const INCOME_BANDS = ["under_50k", "50k_100k", "100k_150k", "over_150k"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { intent } = await req.json();
    if (!intent || typeof intent !== "string") {
      return new Response(JSON.stringify({ error: "Missing intent text" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a banking campaign targeting assistant. Parse the user's natural language campaign description and extract structured targeting dimensions. Map fuzzy language to exact catalog values.

Valid values:
- campaign_goal: ${JSON.stringify(CAMPAIGN_GOAL_IDS)}
- lifestyle_pillars: ${JSON.stringify(LIFESTYLE_PILLARS)}
- life_events: ${JSON.stringify(LIFE_EVENT_IDS)}
- products (for products_has and products_lacks): ${JSON.stringify(PRODUCT_NAMES)}
- cross_sell_strategies: ${JSON.stringify(CROSS_SELL_IDS)}
- upsell_strategies: ${JSON.stringify(UPSELL_IDS)}
- regions: ${JSON.stringify(REGIONS)}
- age_ranges: ${JSON.stringify(AGE_RANGES)}
- income_bands: ${JSON.stringify(INCOME_BANDS)}

Rules:
- "cross sell X with Y" means the user HAS X (products_has) and LACKS Y (products_lacks)
- "high spenders" or "affluent" maps to income_bands ["100k_150k", "over_150k"]
- "wealth management" maps to products like "Managed Portfolio", "Brokerage", "Trust Account"
- "financial wellness" maps to pillar "Financial & Aspirational"
- Only include dimensions explicitly or strongly implied by the user's text
- Return empty arrays for dimensions not mentioned`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: intent },
        ],
        tools: [{
          type: "function",
          function: {
            name: "parse_intent",
            description: "Extract structured campaign targeting dimensions from natural language",
            parameters: {
              type: "object",
              properties: {
                campaign_goal: { type: "string", enum: CAMPAIGN_GOAL_IDS, description: "Primary campaign goal" },
                lifestyle_pillars: { type: "array", items: { type: "string", enum: LIFESTYLE_PILLARS } },
                life_events: { type: "array", items: { type: "string", enum: LIFE_EVENT_IDS } },
                products_has: { type: "array", items: { type: "string", enum: PRODUCT_NAMES }, description: "Products the target audience currently holds" },
                products_lacks: { type: "array", items: { type: "string", enum: PRODUCT_NAMES }, description: "Products to cross-sell (audience doesn't have)" },
                cross_sell_strategies: { type: "array", items: { type: "string", enum: CROSS_SELL_IDS } },
                upsell_strategies: { type: "array", items: { type: "string", enum: UPSELL_IDS } },
                regions: { type: "array", items: { type: "string", enum: REGIONS } },
                age_ranges: { type: "array", items: { type: "string", enum: AGE_RANGES } },
                income_bands: { type: "array", items: { type: "string", enum: INCOME_BANDS } },
                summary: { type: "string", description: "One-line summary of the interpreted intent" },
              },
              required: ["campaign_goal", "lifestyle_pillars", "life_events", "products_has", "products_lacks", "cross_sell_strategies", "upsell_strategies", "regions", "age_ranges", "income_bands", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "parse_intent" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded", status: 429 }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached", status: 402 }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured output returned" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("parse-campaign-intent error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
