import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://ventuscard.com",
  "https://ventusai.com",
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^http:\/\/localhost:\d+$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((allowed) => (typeof allowed === "string" ? allowed === origin : allowed.test(origin)));
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Dynamic prompt - handles any deal count with privacy guardrails and personal context
const buildSystemPrompt = (dealCount: number) => `You personalize deal cards. Generate SHORT messages (15-25 words max).

You will receive ${dealCount} deals. Return EXACTLY ${dealCount} personalized recs.

INPUT:
- deals (id, m=merchant, c=category, r=reward)
- profile (pillars with spend, signals from transactions)
- ctx (optional personal context: demo with occ/fam/inc, persona with traits/interests)

PERSONALIZATION STRATEGY:
When ctx is available, COMBINE signals naturally to create emotionally resonant messages:
- Demo (occupation, family status) + Lifestyle signals (activities from transactions) + Merchant benefit
- Focus on EMOTIONAL BENEFITS, not data exposure

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

GOOD examples:
- "Capture precious family moments on the mountain" (combines family + activity)
- "Perfect for busy professionals - earn 5% on every visit"
- "Fuel your active lifestyle with 10% rewards"
- "More family adventures with 10% back on dining"

BAD examples (NEVER DO):
- "Your 26 annual coffee stops..." (specific count - creepy)
- "After your Barry's workout..." (mentions other merchant)
- "Based on your $4,500 dining spend..." (specific amount)
- "As a Senior Product Manager at a tech company..." (too specific occupation)

ONLY return valid JSON, no markdown.`;

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deals, profile, ctx, txCount } = await req.json();
    
    console.log(`[personalize] ${deals?.length || 0} deals, ${txCount || 0} txns, ctx: ${ctx ? 'yes' : 'no'}`);

    if (!deals || deals.length === 0) {
      return new Response(
        JSON.stringify({ error: "No deals", recs: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const dealCount = deals.length;

    // Compact prompt with explicit count and personal context
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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[personalize] API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited", recs: [] }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) throw new Error("No AI response");

    // Parse JSON
    let parsed;
    try {
      let json = content.trim();
      if (json.startsWith("```")) json = json.replace(/```json?\n?/g, "").replace(/```$/g, "");
      parsed = JSON.parse(json.trim());
    } catch {
      console.error("[personalize] Parse error:", content);
      throw new Error("Invalid JSON response");
    }

    const recs = (parsed.recs || parsed.recommendations || []).map((r: any) => ({
      id: r.id || r.deal_id,
      msg: r.msg || r.personalized_message,
      cta: r.cta || r.cta_text || "Claim Now"
    }));

    console.log(`[personalize] Returning ${recs.length} personalized deals`);

    return new Response(JSON.stringify({ recs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[personalize] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed", recs: [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
