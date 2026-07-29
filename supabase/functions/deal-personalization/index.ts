import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^https:\/\/.*\.ventusai\.com$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((allowed) =>
      typeof allowed === "string" ? allowed === origin : allowed.test(origin)
    );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const buildSystemPrompt = (dealCount: number) => `You personalize retail deal/cashback cards. Generate SHORT messages (15-25 words max).

You will receive ${dealCount} deals. Return EXACTLY ${dealCount} personalized recs.

INPUT:
- deals (id, m=merchant, c=category, r=reward)
- profile (pillars with spend, signals from transactions)
- ctx (optional personal context: demo with occ/fam, persona with traits/interests)

PERSONALIZATION STRATEGY:
- Focus on the ACTUAL REWARD: cashback %, points multiplier, discount amount
- Connect the reward to a relevant lifestyle signal or interest when possible
- Keep it practical and benefit-focused — what does the customer GET?

Examples of GREAT deal personalization:
| Context | Merchant | Reward | Message | CTA |
| Coffee lover | Starbucks | 5% back | "Your daily brew now earns 5% back every visit" | "Fuel Your Mornings" |
| Fitness enthusiast | Lululemon | 15% off | "Gear up for your next workout — 15% off awaits" | "Power Your Workout" |
| Parent + Dining out | DoorDash | $5 off $25+ | "Easy family dinners delivered — save $5 on orders $25+" | "Simplify Family Night" |
| Home cook | Williams-Sonoma | 7% cashback | "Stock your kitchen and earn 7% cashback on every purchase" | "Elevate Your Kitchen" |
| Traveler | Delta | 3x points | "Earn triple points on your next getaway" | "Keep Exploring" |

CTAs — keep them short (2-4 words) and LIFESTYLE-DRIVEN. The CTA should feel like the deal supports how the customer already lives:
Good: "Fuel Your Passion", "Treat the Family", "Elevate Your Style", "Power Your Routine", "Keep Exploring", "Level Up Game Day", "Upgrade Date Night"
Bad: "Shop Now", "Claim Offer", "Get Cashback" (too transactional), "Request Access", "Schedule Consultation" (banking products, NOT deals)

OUTPUT: Valid JSON array with EXACTLY ${dealCount} entries:
{"recs":[{"id":"deal_id","msg":"short personal message","cta":"2-4 word CTA"},...]}

CRITICAL RULES:
- Return one rec for EACH deal - match the input count exactly!
- Under 25 words per message
- Message MUST reference the actual reward (cashback %, discount, points)
- CTA must be retail-appropriate (see good/bad examples above)

PRIVACY RULES (MANDATORY):
- NEVER mention specific numbers (transaction counts, visit counts, exact spend amounts)
- NEVER reference other merchants by name - only personalize for the CURRENT deal's merchant
- NEVER mention exact income levels or specific demographic details
- Reference occupations/family in GENERAL terms only ("busy professional", "family time", "adventure seeker")
- Focus on practical benefits, not data points

ONLY return valid JSON, no markdown.`;

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deals, profile, ctx, txCount } = await req.json();

    console.log(`[deal-personalization] ${deals?.length || 0} deals, ${txCount || 0} txns, ctx: ${ctx ? "yes" : "no"}`);

    if (!deals || deals.length === 0) {
      return new Response(
        JSON.stringify({ error: "No deals", recs: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const dealCount = deals.length;

    const userPrompt = `Personalize ALL ${dealCount} deals. Return exactly ${dealCount} recs.
Deals:${JSON.stringify(deals)}
Profile:${profile ? JSON.stringify(profile) : "none"}
Context:${ctx ? JSON.stringify(ctx) : "none"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          { role: "system", content: buildSystemPrompt(dealCount) },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[deal-personalization] API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited", recs: [] }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required", recs: [] }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error("No AI response");

    // Parse JSON — handle markdown-wrapped responses
    let parsed;
    try {
      let json = content.trim();
      if (json.startsWith("```")) json = json.replace(/```json?\n?/g, "").replace(/```$/g, "");
      parsed = JSON.parse(json.trim());
    } catch {
      console.error("[deal-personalization] Parse error:", content);
      throw new Error("Invalid JSON response");
    }

    const recs = (parsed.recs || parsed.recommendations || []).map((r: any) => ({
      id: r.id || r.deal_id,
      msg: r.msg || r.personalized_message,
      cta: r.cta || r.cta_text || "Claim Now",
    }));

    console.log(`[deal-personalization] Returning ${recs.length} personalized deals`);

    return new Response(JSON.stringify({ recs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[deal-personalization] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed", recs: [] }),
      { headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" }, status: 500 }
    );
  }
});
