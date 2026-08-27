import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { life_events, persona_rollups, pillars, demographics, financial_signals, bankContext } = await req.json();
    const bankName = bankContext && typeof bankContext.bankName === "string" ? bankContext.bankName.trim().slice(0, 80) : "";
    const bankShort = bankContext && typeof bankContext.bankShortName === "string" ? bankContext.bankShortName.trim().slice(0, 40) : "";
    const bankWebsite = bankContext && typeof bankContext.website === "string" ? bankContext.website.trim().slice(0, 200) : "";
    const bankLabel = bankName || "Our Bank";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a consumer banking product recommendation copywriter for "${bankLabel}". You generate exactly THREE product recommendation cards that appear as notifications in a mobile banking app.

CARD ORDER (STRICT — one card per family):
Emit exactly 3 cards, one per family, in this fixed order:
  Slot 1 — life_event         (from life_events[0])
  Slot 2 — behavioral         (from persona_rollups[0])
  Slot 3 — financial_signal   (from financial_signals[0])

FALLBACK LADDER — if a family's primary candidate is missing, fill that slot with the next best available candidate from any other family, in this order:
  life_events[1] → financial_signals[1] → persona_rollups[1]

RULES:
- Emit exactly min(3, total_available_candidates). NEVER under-emit.
- Prefer one card per family. Only emit two cards of the same type when the fallback ladder forces it (e.g. no financial signals AND no rollups).
- ABSOLUTELY NEVER emit a risk/vice/gambling/AML/adult/financial-distress card. Risk data (if provided) is context only and must NEVER become a product recommendation. FORBIDDEN copy: "Account Controls", "Account Wellness Tools", "Set Up Account Controls", "stay in charge", "help you stay in control" — do not generate anything resembling these.
- When two cards of the same type must be emitted via fallback, they MUST recommend DIFFERENT products covering DIFFERENT financial needs — do not repeat the same product family.

CRITICAL — signal_label must match source verbatim:
- Behavioral card: signal_label = persona_rollups[i].label EXACTLY (character-for-character, including capitalization)
- Life event card: signal_label = life_events[i].event_name EXACTLY
- Financial signal card: signal_label = financial_signals[0].label EXACTLY
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

Every product_name MUST start with or include "${bankLabel}". NEVER emit a product_name containing the literal phrase "Our Bank" unless "${bankLabel}" is exactly "Our Bank". Keep naming clean and consumer-friendly — no ® or ™ symbols.${bankShort ? `\nIn shorter contexts, "${bankShort}" may be used as a synonym for "${bankLabel}".` : ""}${bankWebsite ? `\nThe bank's official website is ${bankWebsite} — product naming and tone should match a real institution at that domain.` : ""}

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
- Product should be a concrete financial instrument (529, HYSA, Mortgage, HELOC, etc.)
- HOME EVENTS — MATCH THE STAGE (STRICT):
  - Shopping for / buying / moving into a new home, pre-approval, house hunting, closing → PURCHASE FINANCING: "${bankLabel} Preferred Mortgage" (or Mortgage Pre-Approval / Rate Lock). NEVER a HELOC — the customer has no equity yet.
  - Only recommend a HELOC when the customer is an ESTABLISHED homeowner (existing mortgage in financial_signals, renovation/home-improvement behavior, or a home owned for years) and the need is drawing on built-up equity.
  - Refinance only when an existing mortgage signal is present.
- Quote: 1-2 sentences, empathetic, forward-looking
- CRITICAL: The quote must NEVER name the life event directly. Use indirect, euphemistic language instead:
  - "new baby" → "a major family milestone"
  - "college" / "education" → "an upcoming chapter"
  - "retirement" → "the next phase"
  - "home purchase" → "putting down roots"
  - "wedding" → "a big celebration ahead"
  - The reader should feel the card is relevant without the bank explicitly stating what it knows
- The signal_label field MUST still use the explicit event name (e.g. "College Preparation", "New Baby", "Retirement Planning")

CARD 3 (WHEN FINANCIAL SIGNAL PRESENT) — FINANCIAL SIGNAL:
- Based on financial_signals[0] (an existing loan, mortgage, lease, brokerage relationship, or student loan detected from recurring payments or external intelligence).
- Product MUST map to the signal's product_family:
  - Auto Loan → "${bankLabel} Auto Loan Refinance" (or "${bankLabel} Auto Loan Buyout" if signal indicates a lease-end)
  - Mortgage → "${bankLabel} Mortgage Refinance" OR "${bankLabel} Home Equity Line of Credit"
  - Student Loan → "${bankLabel} Student Loan Refinance"
  - Investment / Brokerage → "${bankLabel} Guided Investing" or IRA Rollover
  - Lease → "${bankLabel} Auto Loan" (lease buyout financing)
- offer_headline, benefits, and quote MUST use the signal's numbers (monthly_amount_band, servicer, cadence) to compute a concrete estimated savings.
  - Example (Auto Loan · VW Credit ~$685/mo, renewal ~2mo): headline "Auto refinance from 5.49% APR", quote "Refinancing at today's rates could save you an estimated $180/mo — roughly $2,160/year."
- Reference the incumbent servicer subtly ("your current auto lender", "your existing mortgage") — never quote the servicer name in a way that feels invasive.
- Quote tone: helpful, timing-aware ("Your renewal window is coming up..."), NEVER surveillance-y.




TONE RULES:
- Write like a smart friend who happens to work in finance, not a bank marketing department
- Conversational, warm, never corporate or pushy
- No exclamation marks in quotes
- No urgency tactics ("limited time", "act now")

NUMERIC SPECIFICITY (MANDATORY):
Every card MUST include concrete numbers. Never use vague language like "great rates" or "earn more".

Required by field:
- offer_headline: Include the headline rate/percentage/multiplier.
  GOOD: "Auto refinance from 2.99% APR", "Earn 3x on travel, 2x on dining", "4.50% APY — 10x national average"
  BAD:  "Great auto refi rates", "Earn more when you travel"
- benefits (all 3): Each benefit MUST contain at least one specific number (%, $, x, months, or points).
  GOOD: "$0 annual fee for the first year", "75,000 bonus points after $4K spend in 90 days", "0.25% rate discount for autopay"
  BAD:  "No annual fee", "Big signup bonus", "Autopay discount"
- quote: MUST contain ONE personalized dollar-estimate tied to the customer's actual behavior/signal.
   LENGTH (HARD LIMIT): ONE complete sentence, 90 characters or fewer, ending in a period.
  It must read as a finished thought — NEVER trail off, never continue into a second clause you cannot finish.
  Write it short first, then add the number; do not pad with setup phrases.
  Derive the estimate from persona rollups (totalSpend), life-event financial_projection, or the signal context.
  Format: "You could save an estimated $XXX ..." or "That's roughly $XXX/year back on ..."
  Examples by card type (all inside the character budget):
    - Auto loan renewal (~$485/mo): "Refinancing could save you an estimated $1,400 over the loan."
    - Travel card + tropical rollup ($4,200 travel spend): "At 3x on travel, that's roughly $215 back on your next trip."
    - 529 for college prep: "Saving $250/mo could grow to an estimated $58,000 by college."
    - HYSA: "On a $10K balance, that's about $450 more a year than average."
    - Mortgage for a home purchase: "A relationship rate could save an estimated $2,400 a year."
  The estimate must be plausible and grounded in the input data — do NOT invent unrelated numbers.
- eligibility: When possible include a numeric anchor: "Pre-qualified — rates from 2.99% APR", "FDIC insured up to $250,000", "Open with as little as $25".
- cta_sub: May include a number when relevant: "Funded in under 5 minutes", "Rate locked for 60 days".

Rate/economics guidance (use realistic 2026 figures):
- Auto refi APR: 5.49%–7.99% (well-qualified from 4.99%)
- HYSA APY: 4.00%–4.75%
- 529 avg annual growth: ~6%
- Travel card: 2x–5x travel, 2x–3x dining, 1x other; sign-up 60k–100k pts after $4k in 90 days
- HELOC: prime + 0%–2% variable
- Mortgage: 6.25%–7.25% 30yr fixed
- IRA/Roth contribution limits: $7,000 ($8,000 age 50+)
Never guarantee returns — use "estimated", "roughly", "could", "approximately".


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
${JSON.stringify((persona_rollups || []).slice(0, 2).map((r: any) => ({
  pillar: r.pillar,
  label: r.label,
  categories: r.categories,
  totalSpend: r.totalSpend,
  totalCount: r.totalCount,
})), null, 2)}

SPENDING PILLARS (top categories):
${JSON.stringify((pillars || []).slice(0, 3).map((p: any) => ({
  pillar: p.pillar,
  label: p.label,
  count: p.count,
  totalSpend: p.totalSpend,
  subcategories: p.subcategories?.slice(0, 3),
})), null, 2)}

DETECTED LIFE EVENTS:
${JSON.stringify((life_events || []).slice(0, 2).map((e: any) => ({
  event_name: e.event_name,
  confidence: e.confidence,
  project_type: e.financial_projection?.project_type,
  recommended_funding_sources: e.financial_projection?.recommended_funding_sources?.map((s: any) => s.type),
  talking_points: e.talking_points?.slice(0, 2),
})), null, 2)}

FINANCIAL SIGNALS (existing loans, mortgages, brokerage relationships — HIGHEST PRIORITY for slot 3):
${JSON.stringify((financial_signals || []).slice(0, 2).map((f: any) => ({
  label: f.label,
  product_family: f.product_family,
  servicer: f.servicer,
  monthly_amount_band: f.monthly_amount_band,
  cadence: f.cadence,
  talking_points: (f.talking_points || []).slice(0, 2),
})), null, 2)}

Ground every dollar-estimate in the numbers above (rollup totalSpend, life-event financial_projection, financial-signal monthly_amount_band, demographics income). Do not invent unrelated figures.

CARD ORDER: Slot 1 = life_event (life_events[0]), Slot 2 = behavioral (persona_rollups[0]), Slot 3 = financial_signal (financial_signals[0]). If any primary is missing, fall back via: life_events[1] → financial_signals[1] → persona_rollups[1]. Emit exactly min(3, total_available_candidates) — NEVER fewer. NEVER emit a risk/gambling/vice/AML card.`;


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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_product_cards",
              description: "Return exactly 3 consumer product recommendation cards in strict order: Slot 1 life_event, Slot 2 behavioral, Slot 3 financial_signal. Falls back to alternate candidates within the same family when a primary is missing. Never fewer than min(3, total_candidates).",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    minItems: 1,
                    maxItems: 3,
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["behavioral", "life_event", "financial_signal"],
                          description: "Card type",
                        },
                        product_name: {
                          type: "string",
                          description: "Specific product name e.g. 'Venture X Travel Card', '529 College Savings Plan', 'Auto Loan Refinance'",
                        },
                        quote: {
                          type: "string",
                           description: "ONE complete consumer-facing sentence, 90 characters or fewer, ending in a period — must be a complete sentence and never trail off. MUST include one personalized dollar-estimate (e.g. 'estimated $215', 'roughly $1,400') tied to the customer's actual signal or spending pattern.",
                        },
                        signal_label: {
                          type: "string",
                          description: "For behavioral: the persona rollup label. For life_event: the event name. For financial_signal: financial_signals[0].label EXACTLY.",
                        },
                        theme: {
                          type: "string",
                          enum: ["travel", "dining", "fitness", "shopping", "entertainment", "home", "education", "retirement", "family", "business", "wellness", "lifestyle"],
                          description: "Color/icon theme hint",
                        },
                        offer_headline: {
                          type: "string",
                          description: "Bold offer line tied to product economics, 6-12 words. MUST include a specific rate, percentage, multiplier, or dollar figure. e.g. 'Earn 3x on travel, 2x on dining' or '4.50% APY — 10x the national average' or 'Auto refinance from 2.99% APR'",
                        },
                        benefits: {
                          type: "array",
                          minItems: 3,
                          maxItems: 3,
                          items: { type: "string" },
                          description: "Exactly 3 concrete bank-grade product features. Each benefit MUST contain at least one specific number (%, $, x, months, or points). e.g. '75,000 bonus points after $4K spend in 90 days'",
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
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({
            error:
              response.status === 402
                ? "AI credits exhausted. Add credits in Settings → Workspace → Usage to resume generation."
                : "AI access is blocked by workspace policy.",
          }),
          {
            status: response.status,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
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

    // Safety net: strip invented / real issuer brands out of product naming.
    const BANKISH_RE = /\b(bank|banc|bancorp|financial|finance|fintech|credit union|federal credit|lending|lenders?|capital|mutual|fcu)\b/gi;
    const label = bankLabel;
    const scrub = (v: unknown): string => {
      if (typeof v !== "string" || !v) return v as string;
      // Preserve the configured label; rewrite any other bank-ish brand phrase.
      const parts = v.split(new RegExp(`(${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
      return parts
        .map((part) =>
          part.toLowerCase() === label.toLowerCase()
            ? part
            : part.replace(/\b([A-Z][\w&'-]*\s+)*[A-Z][\w&'-]*\s+(Financial|Bank|Bancorp|Lending|Capital|Credit Union|FCU)\b/g, label),
        )
        .join("");
    };
    if (Array.isArray(cards?.cards)) {
      for (const c of cards.cards) {
        if (typeof c.product_name === "string") {
          c.product_name = scrub(c.product_name);
          if (!c.product_name.toLowerCase().includes(label.toLowerCase()) && BANKISH_RE.test(c.product_name)) {
            c.product_name = `${label} ${c.product_name}`.trim();
          }
        }
        if (typeof c.offer_headline === "string") c.offer_headline = scrub(c.offer_headline);
        if (typeof c.quote === "string") {
          const quote = c.quote.trim().replace(/\s+/g, " ").replace(/^["“”']+|["“”']+$/g, "");
          if (quote.length <= 90 && /[.!?]$/.test(quote)) {
            c.quote = quote;
          } else {
            const sentences = quote.match(/[^.!?]+[.!?]+/g) || [];
            const complete = sentences.map((part: string) => part.trim()).find((part: string) => part.length <= 90);
            const amount = quote.match(/\$[\d,.]+(?:K|M)?/i)?.[0];
            c.quote = complete || (amount
              ? `This option could deliver an estimated ${amount} in value for your next step.`
              : "A tailored option can support your next financial step.");
          }
        }
      }
    }

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
