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

const buildSystemPrompt = (dealCount: number) => `You personalize deal cards. Generate SHORT messages (15-25 words max).

You will receive ${dealCount} deals. Return EXACTLY ${dealCount} personalized recs.

INPUT:
- deals (id, m=merchant, c=category, r=reward)
- profile (pillars with spend, signals from transactions, pillarTiers mapping pillar→dominant spending tier)
- ctx (optional personal context: demo with occ/fam/inc/tier, persona with traits/interests)

PERSONALIZATION STRATEGY:
When ctx is available, COMBINE signals naturally to create emotionally resonant messages:
- Demo (occupation, family status, wealth tier) + Lifestyle signals (activities from transactions) + Merchant benefit
- Focus on EMOTIONAL BENEFITS, not data exposure
- Lifestyle signals may include tier-qualified descriptors like "premium diner", "budget traveler", "standard athlete" — use these to match tone to the customer's spending level in that specific category

TIER-AWARE DIFFERENTIATION (CRITICAL — each tier MUST have a distinct tone and angle):
When ctx.demo.tier is provided, adapt tone and value proposition:
- "Mass Market": Emphasize ACCESSIBILITY, simplicity, getting started, practical everyday benefits. Use approachable language.
- "Affluent": Emphasize GROWTH, optimization, maximizing returns, strategic advantages. Use confident, aspirational language.
- "HNW": Emphasize EXCLUSIVITY, legacy, white-glove service, sophisticated planning, premium access. Use refined, elevated language.

TIER-AWARE CTA DIFFERENTIATION (CRITICAL — CTAs must match tier tone):
- "Mass Market": Simple, approachable CTAs — "Get Started", "Open Now", "Start Saving", "Learn More"
- "Affluent": Growth-oriented CTAs — "Maximize Returns", "Optimize Now", "Unlock Growth", "Start Optimizing"
- "HNW": Premium, elevated CTAs — "Schedule Consultation", "Request Access", "Explore Options", "Speak With an Advisor"

Examples of GREAT tier-differentiated personalization for the SAME life event (New Parent):
| Tier | Product | Message |
| Mass Market | High-Yield Savings | "Start building your baby's future with a simple, high-yield savings account" |
| Affluent | 529 Plan | "Maximize your education savings with tax-advantaged 529 contributions" |
| HNW | Trust Services | "Protect your family's legacy with personalized trust and estate planning" |

Examples of GREAT context-aware personalization:
| Context | Merchant | Message |
| Family + Snowsports spending | GoPro | "Capture precious family moments on the mountain with GoPro" |
| Busy professional + Coffee lover | Starbucks | "Your morning fuel, now with 5% back every visit" |
| Fitness enthusiast + Active lifestyle | Lululemon | "Gear up for your next workout with 15% off" |
| Parent + Dining out | DoorDash | "Easy family dinners delivered - save $5 on orders $25+" |
| Wellness focused + Self-care | Sephora | "Treat yourself to something special with 10% rewards" |

OUTPUT: Valid JSON array with EXACTLY ${dealCount} entries:
{"recs":[{"id":"deal_id","msg":"short personal message","cta":"2-5 word CTA"},...]}

CRITICAL RULES:
- Return one rec for EACH deal - match the input count exactly!
- Under 25 words per message
- CTAs: "Claim Now", "Start Earning", "Grab This", etc.

PRIVACY RULES (MANDATORY):
- NEVER mention specific numbers (transaction counts, visit counts, exact spend amounts)
- NEVER reference other merchants by name - only personalize for the CURRENT deal's merchant
- NEVER mention exact income levels or specific demographic details
- Reference occupations/family in GENERAL terms only ("busy professional", "family time", "adventure seeker")
- Focus on emotional benefits and aspirations, not data points
- Keep personalization warm and inspirational

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
        model: "google/gemini-3-flash-preview",
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
      JSON.stringify({ error: error.message || "Failed", recs: [] }),
      { headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" }, status: 500 }
    );
  }
});
