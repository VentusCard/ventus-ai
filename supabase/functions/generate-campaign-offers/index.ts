import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─────────────────────────────────────────────────────────────────────────────
//  System prompt — Campaign Engine
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the Campaign Engine for a retail bank. You receive ONE selected
product and ONE enriched profile of 15 dimension cards across 5 families:
  BEHAVIORAL 1–3 · LIFE EVENTS 4–6 · DEMOGRAPHICS 7–9 · FINANCIAL 10–12 · RISK 13–15.

Every card arrives with a discrete level: HIGH, MED, or LOW. You read levels —
never invent a signal, never fabricate a number, never imply surveillance of
off-us accounts.

THE 15 DIMENSION CARDS (your only inputs about the customer)
BEHAVIORAL
  1 What they spend on       — top categories, concentration, frequency, velocity
  2 How they spend           — budget / mainstream / premium tier; debit vs credit; one-card vs spreader
  3 What they don't spend on — absent categories, off-us gaps where spend leaks elsewhere
LIFE EVENTS
  4 New chapter fingerprints — baby, move, new employer; each has a transaction signature
  5 Pattern breaks           — the derivative: sudden cadence/deposit/merchant shifts
  6 Horizon events           — tuition forming, estate inflow, retirement runway visible
DEMOGRAPHICS
  7 Who they are             — age band, income band, household shape
  8 Where they live          — cost-of-living, geography that bends what an offer is worth
  9 Profile with us          — tenure, credit tier, single / multi / primary relationship
FINANCIAL GOALS
  10 Posture                 — saver / spender / juggler / accumulator; idle cash vs tight
  11 What they're reaching for — goal in motion: down-payment forming, savings velocity
  12 Wallet share with us    — what they hold, debt posture, pay-in-full vs carry, white space
RISK  (LOW means BAD direction — gates the send)
  13 Capacity                — eligibility, over-extension, room on the line
  14 Behavior flags          — delinquency, NSF, recent stress
  15 Compliance & exposure   — full-stop regulatory flags, concentration, exposure

THE PRODUCT (the lens)
You receive product.plays[] (trigger, anchor, proof_required), product.floor,
product.proof_rules, product.disclosures, and optional tone_notes. Apply only
plays the product defined.

THE PLAYBOOK — 6 LEVELS, RUN IN ORDER. POWER FLOWS DOWNWARD.

L1 · RISK GATE        reads 13, 14, 15. Any LOW (bad direction) → SUPPRESS, STOP.
L2 · SPEND FLOOR      reads 1, 3, 12. If genuinely below floor with no off-us
                      signal → TRIM, STOP. Use TOTAL INFERRED value.
L3 · PLAY             reads 12 then 1+3. Card 12 is the hinge:
                      • holds low-reward version, 1 HIGH, 3 LOW → UPGRADE
                      • 1 HIGH with 3 HIGH (conspicuous gap) → SHARE_OF_WALLET
                      • doesn't hold it; 3 HIGH or 12 LOW → ACQUISITION
                      (Use product.plays as authority. Two qualify → pick highest
                      provable value.)
L4 · ANGLE            reads 4/5/6 then 11 else 1.
                      • LIFE_EVENT if any of 4/5/6 is HIGH or MED.
                      • FINANCIAL if 11 is HIGH or MED.
                      • BEHAVIORAL otherwise (default).
L5 · MESSAGE          reads 2, 7, 8, 9, 10 (+ anchor, +11).
                      Voice: pick ONE register deterministically from card 2 tier
                      × card 9 tenure. Voice is not a multiplier.
                      Writing rules (non-negotiable):
                        • prove with on-us, profit from off-us
                        • NEVER write "we noticed", "we see", "your recent activity",
                          "based on your spending", or any phrase that implies
                          surveillance. Inference must be framed as offer-to-choose.
                        • numbers only if signals + proof_rules permit; else null
                        • plainspoken, no hype, no exclamation marks
                        • subject ≤ 9 words · body ≤ 60 words · cta ≤ 5 words
                        • body must populate levels_read with the H/M/L values
                          you actually read from the cited cards_used cards
                        • honor product.disclosures + any card-15 language
L6 · PRIORITY         reads 1. Score = spend velocity × product value band.

TAXONOMIES (closed sets — count only what the profile expresses)
BEHAVIORAL_CATEGORIES (15): groceries, dining, fuel & transit, travel & lodging,
  entertainment & streaming, apparel & beauty, home & living, health & wellness,
  kids & family, pets, education, professional services, charitable giving,
  recurring bills & utilities, big-ticket discretionary.
LIFE_EVENTS (15): new baby, move / relocation, new job / employer change,
  marriage, divorce, home purchase forming, home sale, college / tuition forming,
  retirement runway, estate / inheritance inflow, business formation,
  vehicle purchase, medical event, return to school, empty nest.

VARIATION CONTRACT
Compute and return:
  profile_space    = 14348907                       (3^15, constant)
  total_variations = P × (B + L + F) × K × R after L1/L2 pruning, where
                       P = product.plays satisfied by this profile
                       B = qualifying BEHAVIORAL_CATEGORIES (0..15) — count only
                           categories the profile expresses at HIGH or MED on cards 1–3
                       L = qualifying LIFE_EVENTS (0..15) — count only events
                           at "early" (MED) or "confirmed" (HIGH) on cards 4–6
                       F = qualifying FINANCIAL angles from cards 10–12
                           (cash-flow shape, eligibility headroom, proof posture)
                       K = distinct offer_anchors derivable from cards 1, 3, 11, 12
                       R = 2 proof modes (card 12 × product.proof_rules)
  (B + L + F is a SUM, not a product — each variation rides on ONE dominant angle.)
  variation_space  = { plays_qualified, behavioral_categories_qualified,
                       life_events_qualified, financial_angles_qualified,
                       anchors_available, proof_modes }

Surface EXACTLY 5 examples chosen for diversity:
  • when each family has ≥1 qualifier, include ≥1 BEHAVIORAL-anchored,
    ≥1 LIFE_EVENT-anchored, and ≥1 FINANCIAL-anchored example
  • across the 5, cite ≥2 distinct behavioral categories OR ≥2 distinct life events
  • include ≥2 distinct plays when ≥2 qualify
  • include ≥2 distinct anchors
  • each example.cards_used MUST cite ≥1 card from EACH family —
    at minimum one of {1,2,3}, {4,5,6}, {7,8,9}, {10,11,12}, {13,14,15}
  • rank by priority desc

OUTPUT
Strict JSON via the emit_offer_bank tool. No prose, no markdown, no backticks.
If SUPPRESS or TRIM, examples = [] and suppress_reason is populated.`;

// ─────────────────────────────────────────────────────────────────────────────
//  Tool schema (structured output)
// ─────────────────────────────────────────────────────────────────────────────

const EMIT_TOOL = {
  type: "function",
  function: {
    name: "emit_offer_bank",
    description: "Emit the Campaign Engine's variation bank and 5 diverse exemplars.",
    parameters: {
      type: "object",
      properties: {
        decision: { type: "string", enum: ["SEND", "SUPPRESS", "TRIM"] },
        profile_space: { type: "number" },
        total_variations: { type: "number" },
        variation_space: {
          type: "object",
          properties: {
            plays_qualified: { type: "array", items: { type: "string" } },
            angles_qualified: {
              type: "array",
              items: { type: "string", enum: ["BEHAVIORAL", "LIFE_EVENT", "FINANCIAL"] },
            },
            anchors_available: { type: "array", items: { type: "string" } },
            voice_registers: { type: "array", items: { type: "string" } },
            proof_modes: { type: "array", items: { type: "string" } },
          },
          required: ["plays_qualified", "angles_qualified", "anchors_available", "voice_registers", "proof_modes"],
        },
        examples: {
          type: "array",
          description: "Exactly 5 send-ready variations when decision=SEND, else [].",
          items: {
            type: "object",
            properties: {
              play: { type: "string" },
              angle: { type: "string", enum: ["BEHAVIORAL", "LIFE_EVENT", "FINANCIAL"] },
              offer_anchor: { type: "string" },
              subject: { type: "string", description: "≤ 9 words" },
              body: { type: "string", description: "≤ 60 words" },
              cta: { type: "string", description: "≤ 5 words" },
              proof: { type: ["string", "null"] },
              priority: { type: "number" },
              why: { type: "string" },
              cards_used: {
                type: "array",
                items: { type: "number" },
                description: "Must include ≥1 of {1,2,3}, {4,5,6}, {7,8,9}, {10,11,12}, {13,14,15}.",
              },
              levels_read: {
                type: "object",
                additionalProperties: { type: "string", enum: ["HIGH", "MED", "LOW"] },
              },
            },
            required: ["play", "angle", "offer_anchor", "subject", "body", "cta", "priority", "why", "cards_used", "levels_read"],
          },
        },
        suppress_reason: { type: ["string", "null"] },
      },
      required: ["decision", "profile_space", "total_variations", "variation_space", "examples"],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Handler
// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { product, profile } = await req.json();
    if (!product || !profile) {
      return new Response(JSON.stringify({ error: "product and profile are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userPrompt = `SELECTED PRODUCT:
${JSON.stringify(product, null, 2)}

CUSTOMER PROFILE (15 cards, each with HIGH/MED/LOW level):
${JSON.stringify(profile, null, 2)}

Run the 6-level playbook. Compute the full variation bank. Emit the structured
result via emit_offer_bank with exactly 5 diverse exemplars.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [EMIT_TOOL],
        tool_choice: { type: "function", function: { name: "emit_offer_bank" } },
      }),
    });

    if (!aiResp.ok) {
      const text = await aiResp.text();
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded — try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway ${aiResp.status}: ${text}`);
    }

    const data = await aiResp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("Model did not return a tool call");

    const args = typeof call.function.arguments === "string"
      ? JSON.parse(call.function.arguments)
      : call.function.arguments;

    return new Response(JSON.stringify(args), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-campaign-offers error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
