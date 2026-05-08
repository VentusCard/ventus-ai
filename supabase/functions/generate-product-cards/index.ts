import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { life_events, persona_rollups, pillars, demographics, risk_flags, bankContext } = await req.json();
    const bankName = bankContext && typeof bankContext.bankName === "string" ? bankContext.bankName.trim().slice(0, 80) : "";
    const bankShort = bankContext && typeof bankContext.bankShortName === "string" ? bankContext.bankShortName.trim().slice(0, 40) : "";
    const bankWebsite = bankContext && typeof bankContext.website === "string" ? bankContext.website.trim().slice(0, 200) : "";
    const bankLabel = bankName || "Our Bank";
    const hasRisk = Array.isArray(risk_flags) && risk_flags.length > 0;
    // Pick the top risk (most evidence). Group by category_label and tally.
    let topRisk: { category_group: string; category_label: string; evidence: string[] } | null = null;
    if (hasRisk) {
      const grouped = new Map<string, { category_group: string; category_label: string; evidence: string[] }>();
      for (const f of risk_flags as any[]) {
        const label = String(f.category_label || "Risk");
        const ex = grouped.get(label) || { category_group: f.category_group || "aml", category_label: label, evidence: [] as string[] };
        const ev = String(f.merchant_name || f.description || "").trim();
        if (ev && !ex.evidence.includes(ev)) ex.evidence.push(ev);
        grouped.set(label, ex);
      }
      const sorted = Array.from(grouped.values()).sort((a, b) => b.evidence.length - a.evidence.length);
      topRisk = sorted[0] || null;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a consumer banking product recommendation copywriter for "${bankLabel}". You generate UP TO TWO product recommendation cards (or up to THREE if a RISK CARD is appended) that appear as notifications in a mobile banking app.

CARD ORDER (STRICT INTERLEAVING):
Emit cards in exactly this order, skipping a slot only if the source doesn't exist:
  1. Life Event card based on life_events[0] (first detected life event)
  2. Behavioral card based on persona_rollups[0] (first behavioral habit)
  3. RISK CARD — ONLY if risk_signal is provided in the user prompt. Always last.

If no life events exist → emit 1 behavioral card (behavioral_1) only.
If no rollups exist → emit 1 life event card (life_event_1) only.
Always emit at least 1 card if any source exists. NEVER emit more than 2 non-risk cards.

CRITICAL — signal_label must match source verbatim:
- Behavioral card: signal_label = persona_rollups[i].label EXACTLY (character-for-character, including capitalization)
- Life event card: signal_label = life_events[i].event_name EXACTLY
This enables downstream pill matching. Do NOT paraphrase, shorten, or rewrite the label.

Use "${bankLabel}"-prefixed products for ALL recommendations. Never use real bank brand names other than "${bankLabel}" (no "Bank of America", "Chase", "Merrill", "Wells Fargo", etc.). Examples (substitute "${bankLabel}" wherever you see "Our Bank" below):
- Travel: ${bankLabel} Travel Rewards Card, ${bankLabel} Premium Rewards Card
- Cash back: ${bankLabel} Customized Cash Rewards Card, ${bankLabel} Unlimited Cash Rewards Card
- Savings: ${bankLabel} Advantage Savings, ${bankLabel} SafePass Savings
- Investing: ${bankLabel} Self-Directed Investing, ${bankLabel} Guided Investing
- Home: ${bankLabel} Home Equity Line of Credit, ${bankLabel} Mortgage
- Education: ${bankLabel} 529 College Savings Plan
- Retirement: ${bankLabel} IRA, ${bankLabel} Roth IRA
- Business: ${bankLabel} Business Advantage Card

Every product_name MUST start with or include "${bankLabel}". Keep naming clean and consumer-friendly — no ® or ™ symbols.${bankShort ? `\nIn shorter contexts, "${bankShort}" may be used as a synonym for "${bankLabel}".` : ""}${bankWebsite ? `\nThe bank's official website is ${bankWebsite} — product naming and tone should match a real institution at that domain.` : ""}

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

CARD 5 — RISK CARD (only if risk_signal is present in the user prompt):
- This is NOT a marketing card. It is a wellness, transparency, and customer-care card.
- Tone: caring, calm, non-judgmental, never alarming. Like a trusted advisor quietly checking in.
- type: must be "risk"
- product_name: a non-credit, wellness/safety-themed product. Examples:
   - "${bankLabel} SafeBalance Account Controls"
   - "${bankLabel} Account Wellness Tools"
   - "${bankLabel} Spending Limits & Merchant Controls"
   - "${bankLabel} Confidential Customer Care"
   - For financial-distress signals, prefer hardship-themed products such as: "${bankLabel} Hardship Assistance Program", "${bankLabel} Overdraft Protection & Fee Waivers", "${bankLabel} Confidential Financial Coaching", "${bankLabel} Balance Assist Short-Term Loan", "${bankLabel} Customized Cash Wellness Plan"
- signal_label: MUST equal the risk_signal.category_label verbatim (e.g. "Sports Betting", "High-Risk / Offshore Gambling", "Casino & Table Games", "Lottery & Raffles", "Casual / Social Gaming", "Horse Racing & Pari-mutuel", "Gambling", "Suspicious International", "Adult Entertainment", "AML", "Pawn Shops & Short-Term Credit", "Debt Collection & Debt Relief", "Check Cashing & Money Services", "Subprime Credit & Buy-Here-Pay-Here", "Overdraft & NSF Activity", "Crypto Mixing & High-Risk Crypto", "Financial Distress")
- theme: use "wellness"
- quote: 1-2 sentences framed as care/transparency. Examples:
   - "We make it simple to put guardrails on your spending whenever you want — no questions asked."
   - "Account controls are here to help you stay in charge of your day-to-day banking."
   - For financial-distress signals: "If money's tight, we have programs to help — confidentially and with no judgment." / "A short-term cash crunch shouldn't cost you in fees. We have options."
- offer_headline: focus on tools, not economics. Examples: "Tools to help you stay in control", "Confidential support whenever you need it", "Hardship options — discreet and judgment-free"
- benefits (exactly 3): non-marketing wellness/security features ONLY. Examples:
   - "Set daily and category-level spending limits in seconds"
   - "Block specific merchants or transaction types instantly"
   - "Confidential 24/7 support — talk to a real person"
   - "Pause new charges with one tap from the app"
   - For financial-distress: "Waive your next overdraft fee with one tap", "Free 1-on-1 financial coaching — no upsell, ever", "Short-term hardship plans with no credit-score impact", "Lower-cost alternative to payday — funded in minutes"
- eligibility: trust/availability framing. Examples: "Available to all customers · No fees", "Always on · Adjust anytime", "No credit check · Confidential"
- cta: care-oriented, never "Apply"/"Open". Examples: "Set Up Account Controls", "Talk to Someone Confidentially", "Adjust My Limits", "Explore Hardship Options", "Waive a Fee", "Get Free Coaching"
- cta_sub: reassurance about discretion. Examples: "Confidential · No impact to credit", "Takes under a minute", "Judgment-free · No sales pitch"
- ABSOLUTELY FORBIDDEN: any credit card, investment, loan, or upsell language. No celebratory tone. No "rewards", "earn", "bonus", "miles", "cash back".

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
   - Concrete, bank-grade product features specific to the actual product
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

    const userPrompt = `Generate product recommendation cards based on this customer profile.

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

${topRisk ? `RISK SIGNAL (append a RISK CARD as the LAST card; signal_label MUST equal category_label verbatim):
${JSON.stringify(topRisk, null, 2)}` : "RISK SIGNAL: none — do NOT emit a risk card."}

Return up to ${topRisk ? 3 : 2} cards in the strict interleaved order using the generate_product_cards function.`;

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
              description: "Return up to 2 consumer product recommendation cards in strict interleaved order: life_event_1, behavioral_1 (plus optional risk card as 3rd)",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    minItems: 1,
                    maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["behavioral", "life_event", "risk"],
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
                        offer_headline: {
                          type: "string",
                          description: "Bold offer line tied to product economics, 6-12 words. e.g. 'Earn 2x miles on every purchase' or '4.50% APY — 10x the national average'",
                        },
                        benefits: {
                          type: "array",
                          minItems: 3,
                          maxItems: 3,
                          items: { type: "string" },
                          description: "Exactly 3 concrete bank-grade product features specific to the actual product",
                        },
                        eligibility: {
                          type: "string",
                          description: "One-line eligibility / approval note, ≤14 words",
                        },
                        cta: {
                          type: "string",
                          description: "Personalized button label (3-6 words) that ties to the customer's specific signal. NEVER generic like 'Apply Now' or 'Learn More'",
                        },
                        cta_sub: {
                          type: "string",
                          description: "Small reassurance subtext under the CTA, 4-8 words. e.g. 'Decision in seconds · Use card immediately'",
                        },
                      },
                      required: ["type", "product_name", "quote", "signal_label", "theme", "offer_headline", "benefits", "eligibility", "cta", "cta_sub"],
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
