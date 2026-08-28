import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-3.1-pro-preview";
// Fast model for copy-heavy generation (behavioral + life-event deals).
const COPY_MODEL = "google/gemini-3.5-flash";
// Output ceilings per copy call. The behavioral call carries the richest deals
// (valueLine + valueMath + signalReason on 5 deals) and was truncating at 4000,
// which dropped the whole cluster, so it gets extra headroom.
const BEHAVIORAL_MAX_TOKENS = 9000;
const EVENT_MAX_TOKENS = 4000;
const SIGNAL_MAX_TOKENS = 4000;

// Only the top-ranked signals per family are sent to the model. Everything below
// the cut never surfaces in the UI, so generating copy for it only adds latency.
// One group per copy family keeps each response inside COPY_MAX_TOKENS — two
// clusters × 5 grounded deals overflowed and truncated the JSON mid-object.
const MAX_BEHAVIORAL_ROLLUPS = 3;
const MAX_LIFE_EVENTS = 1;
const MAX_FINANCIAL_SIGNALS = 1;

const SYSTEM_PROMPT = `You generate personalized retail deal recommendations grouped by behavioral cluster, with intelligent boost signals based on recent spending.

RULES:
1. For EACH behavioral cluster provided, generate exactly 5 ACTIVE deals. ALL 5 deals MUST have signal: "boost" with a meaningful signalReason and boostCategory.
   Do NOT include suppressed deals in the deals array.
   Instead, list any already-covered spending categories in a separate "suppressedCategories" string array on the rollup object.
   CRITICAL: The "rollup" field in your output MUST be the EXACT cluster label string from the input (verbatim, including capitalization and punctuation). Do NOT paraphrase, shorten, rename, or invent new labels.
2. Messages MUST be 8-12 words max. Short, evocative, lifestyle-aligned. NO demographic references (no occupation, family size, age, income).
3. Good message:"Capture precious family moment on the mountain with GoPro"or"Upgrade your travels with sleek, durable luggage from Away"
4. Bad message: "As a Product Director on the move, upgrade your commute"
5. Each deal needs: merchant name, specific product, reward value, short message, a 2-4 word lifestyle CTA, a signal ("boost" or "neutral"), signalReason, and optionally boostCategory.
6. CTAs should be lifestyle-driven: "Fuel Your Mornings", "Elevate Your Kitchen", "Power Your Routine"
7. All deals MUST relate to categories, merchants, or spending patterns present in the BEHAVIORAL CLUSTERS or SPENDING CONTEXT. Do NOT recommend products from categories where the customer has zero spending history. Boost deals should fill gaps WITHIN existing spending areas (e.g., a traveler missing luggage), not introduce entirely new lifestyle categories.

8. DESTINATION & CONTEXT FIT (CRITICAL — destination-tagged rollups only):
   - Match brand AND product to the LITERAL destination, climate, and activity named in the rollup label. Apply the "would a traveler actually pack this for [destination]?" test to every deal. If it fails, pick a different merchant.
   - TROPICAL / BEACH destinations (Hawaii, Caribbean, Mexico, Florida, Bahamas, Maldives, Bali): reef-safe sunscreen, snorkel gear, swimwear, rash guards, sandals/flip-flops, lightweight packable luggage, waterproof phone cases, sun hats, GoPro, polarized sunglasses, beach towels, dry bags, resort-wear. Good brand anchors: Sunbum, Supergoop, Olukai, Reef, Rainbow Sandals, Tommy Bahama, Vuori, Outdoor Voices, Quiksilver, Roxy, Rip Curl, Speedo, Costa Del Mar, Ray-Ban, GoPro, Away (lightweight only), Yeti (soft cooler only).
   - COLD / MOUNTAIN / SKI destinations (Aspen, Tahoe, Vail, Whistler, Alps): cold-weather technical wear is appropriate. Good anchors: Patagonia, Arc'teryx, Smartwool, Helly Hansen, Burton, The North Face, Hydro Flask insulated, Allbirds wool runners.
   - URBAN CITY trips (NYC, Paris, Tokyo, London): travel tech, premium luggage, noise-cancelling headphones, comfortable city-walking shoes, lounge access, packable layers.
   - FORBIDDEN MISMATCHES for tropical/beach rollups (NEVER emit): Allbirds wool shoes, Patagonia fleeces/down/technical shells, Hydro Flask insulated bottles, Smartwool, The North Face fleeces, Arc'teryx, Burton, any insulated/thermal/wool product. These are climate-wrong and break trust.
   - FORBIDDEN MISMATCHES for cold/mountain rollups: reef-safe sunscreen, swimwear, snorkel gear, flip-flops.
   - Every deal in a destination-tagged cluster MUST plausibly improve THAT specific trip. Generic "travel" brands are not enough — climate and activity must align.

SIGNAL LOGIC:
- ALL 5 deals MUST have signal: "boost". Every deal should have a clear signalReason explaining the behavioral gap or opportunity, and a boostCategory (short product-type label like "Headphones", "Luggage").
- NEVER boost a category that has NO related spending in the provided clusters. If the customer has no fitness/sports transactions, do NOT recommend fitness equipment. Every deal must trace back to an observed spending pattern.

suppressedCategories: For each cluster, identify 0-3 broad spending categories the user already covers (e.g., "Hotels", "Airlines", "Ski Passes", "Coffee", "Streaming") and list them in the suppressedCategories array. These are NOT deals — just metadata about what the customer already has.

COLLECTION MESSAGE — STRICT RULES:
- For each cluster, generate a "collectionMessage" framing the deals as small enhancements to the user's existing lifestyle.
- HARD LIMITS: ≤ 10 words AND ≤ 60 characters. No exceptions.
- FRAME AS ENHANCEMENT, NOT COVERAGE: use words like better, sharper, smoother, smarter, ritual, upgrade, picks, gear, little things, small touches, small upgrades.
- ANCHOR TO THE PILL LABEL: echo the literal subject of the rollup (Hawaii → island/Hawaii; Coffee Runs → mornings/coffee/ritual; Ski → slopes/snow).
- WARM, SECOND-PERSON: use "your". Keep it personal, not transactional.
- BANNED VOCABULARY (never emit): "unforgettable", "memories", "essentials", "premium", "indulge", "curated", "exclusive", "next escape", "we've got you", "got covered", "we handle", "we take care", "craft", "elevate".
- Do NOT reference demographics.

FEW-SHOT EXAMPLES (match this tone exactly):
FEW-SHOT EXAMPLES (match this tone exactly):
- "Annual Hawaiian Vacations" → "Little things that make every island trip better." (good brand anchors: Sunbum reef-safe SPF, Olukai sandals, GoPro Hero, Costa polarized shades — NEVER Allbirds, Patagonia, Hydro Flask)
- "Tennis & Ski Seasonal Sports" → "Gear that keeps your seasons sharp." (Patagonia/Burton appropriate here)
- "Weekly Workday Coffee Runs" → "Small upgrades for your morning ritual."

IMAGE SELECTION — REQUIRED on every rollup group:
- "imageCategory": pick ONE from this fixed enum that best matches the LITERAL subject of the rollup label, NOT the pillar:
  ski | beach | tennis | golf | cycling | running | yoga | hiking | camping | boating | wine | coffee | dining | wedding | baby | kids | pet | fashion | beauty | wellness | tech | home | garden | auto | travel-urban | travel-generic | finance | entertainment | grocery | other
- For "Seasonal Ski Trips" use "ski" (NOT "golf", NOT "other"). For "Annual Hawaiian Vacations" use "beach". For "Tennis & Court Sports" use "tennis". For "Weekend Golfer" use "golf". For "Weekly Workday Coffee Runs" use "coffee". For NYC/Paris/Tokyo trips use "travel-urban". For generic flights/luggage rollups use "travel-generic".
- Use "other" ONLY when no listed category fits.
- "imageQuery": 2-4 word visual subject in plain English, used only when imageCategory is "other" (e.g. "pickleball court outdoor", "rock climbing gym"). Always include it as a fallback even when imageCategory is set.

NUMERIC VALUE LINE — REQUIRED on every deal:
- Every deal MUST include a "valueLine" (≤ 18 words) that quantifies the payoff USING NUMBERS FROM THE INPUT (rollup totalSpend, top-merchant $ figures, or simple arithmetic on them).
- Also include a short "valueMath" (≤ 40 chars) that shows the calc, e.g. "3% × $6,200 ≈ $186".
- ROUND to friendly units: nearest $5 under $100, nearest $10 under $1k, nearest $50 at $1k+, whole % only.
- Only use $ / % figures that appear in the input or are simple arithmetic on them. NEVER fabricate spend, balances, or rates.
- If you truly cannot ground a number, set both valueLine and valueMath to null — do not invent.
- Good: "5% back at coffee shops ≈ $9/mo on your ~$180/mo Blue Bottle + Sightglass spend." (math: "5% × $180 ≈ $9/mo")
- Good: "3x points on travel ≈ $186 back on your ~$6,200 Hawaii spend this year." (math: "3% × $6,200 ≈ $186")
- Bad (fabricated): "Save $500 vs the market average." (no market number in input)

BANK NAMING RULE (STRICT): any deal for a bank/deposit/credit/investing product (savings, high-yield/APY, auto-save, round-up, checking, CD, loan, refinance, HELOC, mortgage, credit card, IRA, brokerage) MUST use the bank name given in the user prompt VERBATIM as its "merchant". NEVER invent a lender, issuer, or fintech brand (e.g. "STAR Financial", "Summit Lending", "Apex Capital") and NEVER name a real institution (Chase, Wells Fargo, Bank of America, Citi, SoFi, Marcus, Ally). Third-party retail merchants are allowed ONLY for non-bank products.

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Cluster Label","pillar":"Pillar Name","collectionMessage":"8-15 word lifestyle tagline","imageCategory":"ski","imageQuery":"snowy ski slope","suppressedCategories":["Hotels","Coffee"],"deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","valueLine":"5% back ≈ $9/mo on your ~$180/mo coffee spend.","valueMath":"5% × $180 ≈ $9/mo","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

const LIFE_EVENT_SYSTEM_PROMPT = `You generate retail deal recommendations for customers going through specific life events.

CRITICAL MAPPING RULE:
- The user will provide a numbered list of life events, each with an "id" like LE_1, LE_2.
- For EVERY life event in the input, you MUST output exactly one rollup group.
- Each output group MUST include an "eventId" field that matches the input id verbatim (e.g. "LE_1").
- The "rollup" field MUST be the EXACT event_name string from the input (verbatim — never paraphrase, rename, shorten, or merge events).
- pillar MUST be exactly "Life Event".

DEAL RULES:
- Exactly 5 deals per event, all with signal: "boost".
- 8-12 word messages, no demographic references.
- Lifestyle-driven 2-4 word CTAs (e.g. "Ace the Test", "Move Smarter", "Furnish the Dorm").
- Each deal MUST include: merchant, product, rewardValue, message, cta, signal: "boost", signalReason, AND boostCategory.

REQUIRED FIELDS — STRICT:

1. boostCategory (REQUIRED on every deal):
   - A short 1-3 word product-type label tied to the life event.
   - Examples for College Prep: "Tuition Savings", "Test Prep", "Dorm Essentials", "Laptops", "Textbooks", "Meal Plans".
   - Examples for Home Purchase: "Mortgage Tools", "Moving Services", "Home Insurance", "Furniture", "Appliances", "Closing Costs".
   - Examples for New Baby: "Diapers", "Stroller", "Nursery", "Baby Food", "Childcare", "Pediatric Care".
   - These render as green trend chips in the UI — they MUST be present on every single deal.

2. signalReason (REQUIRED — must be SPECIFIC, never generic):
   - MUST reference an actual evidence merchant from the input OR a concrete behavioral signal tied to the life event.
   - GOOD: "Khan Academy subscription → upgrade to live SAT prep", "3 visits to Zillow → ready for closing-cost coverage", "Recurring Pottery Barn Kids spend → nursery completion".
   - BAD (FORBIDDEN — never emit these): "Merchant evidence for Home Purchase", "Aligned with this life event", "Relevant to your situation", "Matches your profile".
   - If the life event has evidence_merchants, you MUST cite at least one of them by name across the 5 deals.

3. suppressedCategories (REQUIRED at the rollup level — array of 0-3 strings):
   - List broad categories the customer already covers based on the evidence_merchants for this event.
   - Example: for "College Preparation for Dependent" with Khan Academy in evidence, suppress "Online Tutoring".
   - Example: for "Home Purchase" with a Zillow + Redfin pattern, suppress "Home Search Tools".
   - These render as gray "✓ already covered" chips. Empty array [] is allowed only if no evidence supports suppression.

COLLECTION MESSAGE — STRICT RULES:
- "collectionMessage" frames the deals as small enhancements to the user's life during this event — not as the bank handling the event for them.
- HARD LIMITS: ≤ 10 words AND ≤ 60 characters. No exceptions.
- FRAME AS ENHANCEMENT: use words like better, smoother, smarter, easier, picks, gear, little things, small touches, small upgrades, helpful picks.
- ANCHOR TO THE EVENT: echo the literal subject (College Prep → this chapter / the journey; Home Purchase → your new place / move-in; New Baby → those first months).
- WARM, SECOND-PERSON: use "your". Personal, not transactional.
- BANNED VOCABULARY (never emit): "unforgettable", "memories", "essentials", "premium", "indulge", "curated", "exclusive", "we've got you", "got covered", "we handle", "we take care", "craft", "elevate".
- No demographics.

FEW-SHOT EXAMPLES (match this tone exactly):
- "College Preparation for Dependent" → "Helpful picks for this next chapter."
- "Home Purchase" → "Small touches to make your new place yours."
- "New Baby" → "Little things that make those first months smoother."

IMAGE SELECTION — REQUIRED on every rollup group:
- "imageCategory": pick ONE from this enum that best matches the LITERAL subject of the event:
  ski | beach | tennis | golf | cycling | running | yoga | hiking | camping | boating | wine | coffee | dining | wedding | baby | kids | pet | fashion | beauty | wellness | tech | home | garden | auto | travel-urban | travel-generic | finance | entertainment | grocery | other
- For "New Baby" use "baby". For "Home Purchase" use "home". For "Wedding Planning" use "wedding". For "College Preparation for Dependent" use "kids". For "New Pet" use "pet". For "Retirement Planning" use "finance".
- Use "other" only when no listed category fits.
- "imageQuery": 2-4 word visual subject in plain English, always include as a fallback (e.g. "newborn nursery", "house keys handover").

NUMERIC VALUE LINE — REQUIRED on every deal:
- Every deal MUST include a "valueLine" (≤ 18 words) with at least one $ or % figure grounded in the input (evidence merchants, category spend, or a life-event product cost that the LLM can cite from provided context).
- Also include a short "valueMath" (≤ 40 chars) showing the calc, e.g. "15% × $2,400 tuition ≈ $360".
- ROUND to friendly units. NEVER fabricate. If ungrounded, set both to null.
- Good: "10% off closing costs ≈ $500 saved on a $500k home." (math: "0.1% × $500k ≈ $500")

Output valid JSON only, no markdown:
{"rollupOffers":[{"eventId":"LE_1","rollup":"Exact Event Name","pillar":"Life Event","collectionMessage":"8-15 word tagline","imageCategory":"baby","imageQuery":"newborn nursery","suppressedCategories":["Online Tutoring","Test Prep Books"],"deals":[{"id":"le1_d1","merchant":"Brand","product":"Specific product name","rewardValue":"15% Off","message":"8-12 word lifestyle message","valueLine":"15% off dorm essentials ≈ $60 on ~$400 dorm haul.","valueMath":"15% × $400 ≈ $60","cta":"2-4 word CTA","signal":"boost","signalReason":"Khan Academy subscription → upgrade to live SAT prep","boostCategory":"Test Prep"},...]},...]}`;

const FINANCIAL_SIGNAL_SYSTEM_PROMPT = `You generate hyper-personalized bank product offers grounded in a customer's active financial obligations (auto loans, mortgages, leases, student loans, investments, HELOCs).

MAPPING RULE:
- The user provides a numbered list of financial signals, each with an "id" like FS_1, FS_2, plus label, product_family, servicer, monthly_payment, balance, rate, renewal_window.
- For EVERY signal you MUST output exactly one rollup group.
- Each group MUST include "signalId" matching the input id verbatim.
- "rollup" MUST be the signal's label VERBATIM. "pillar" MUST be exactly "Financial Signal".

DEAL RULES:
- Exactly 5 deals per signal, all signal:"boost".
- Product families → offer themes:
  • Auto Loan → auto refinance (rate reduction), lease buyout financing, GAP insurance, extended warranty, trade-in appraisal.
  • Mortgage → mortgage refinance, HELOC, cash-out refi, PMI removal, points buy-down.
  • Student Loan → refi consolidation, income-driven plan review, employer match program, autopay rate discount.
  • Lease → lease buyout loan, purchase-option financing, trade-forward.
  • Investment → IRA rollover, guided investing, portfolio review, tax-loss harvesting, HYSA sweep.
- Merchant is the bank itself (from bankContext) or a first-party product name.
- 8-12 word message. 2-4 word CTA (e.g. "Lock Your Rate", "Refi in Minutes", "Roll It Over").
- boostCategory: short product-type label ("Auto Refi", "HELOC", "IRA Rollover").

NUMERIC VALUE LINE — REQUIRED, this is the whole point:
- valueLine (≤ 22 words) MUST quantify the payoff using the signal's own numbers.
- valueMath (≤ 50 chars) shows the calc.
- Auto refi example: monthly $685, current rate 7.5% → "Refi at 5.99% ≈ ~$50/mo saved, roughly $600/year off your ~$685/mo VW Credit payment." math: "1.5% APR × $685/mo ≈ $50/mo"
- Mortgage refi example: "−1.0% APR ≈ ~$2,750/yr saved per $500k of your mortgage balance." math: "1% × $500k ≈ $5k → net ~$2.75k/yr"
- HELOC example: "Access up to ~$50k of equity at prime+0.5% — no closing costs." math: "0.5% × $50k ≈ $250/yr"
- IRA rollover: "Rolling ~$120k to an IRA could save ~$1,200/yr in fund fees." math: "1% × $120k ≈ $1,200/yr"
- Never invent balances or rates not present in the signal. If a field is missing, ground the calc in what IS present (monthly_payment × 12, or renewal_window urgency) and label the assumption.

Output valid JSON only, no markdown:
{"rollupOffers":[{"signalId":"FS_1","rollup":"Exact Signal Label","pillar":"Financial Signal","collectionMessage":"8-10 word tagline","imageCategory":"auto","imageQuery":"car keys handover","suppressedCategories":[],"deals":[{"id":"fs1_d1","merchant":"Our Bank","product":"Auto Loan Refinance","rewardValue":"−1.5% APR","message":"Lower your monthly payment without extending your term.","valueLine":"Refi at 5.99% ≈ ~$50/mo saved on your ~$685/mo VW Credit payment.","valueMath":"1.5% APR × $685/mo ≈ $50/mo","cta":"Refi in Minutes","signal":"boost","signalReason":"VW Credit auto loan renewal in ~2mo","boostCategory":"Auto Refi"},...]},...]}`;

/** Bank-product detection: these deals must always be branded as the bank itself. */
const BANK_PRODUCT_RE = /\b(loan|refi|refinance|heloc|home equity|mortgage|line of credit|credit card|debit card|savings|checking|cd\b|certificate of deposit|ira|401k|roth|brokerage|investing|investment account|wealth|advisory|overdraft|apr|apy|yield|high[- ]yield|money market|auto[- ]?save|round[- ]?up|deposit account)\b/i;
/** Names that look like a bank/lender brand — used to catch invented issuers. */
const BANKISH_MERCHANT_RE = /\b(bank|banc|bancorp|financial|finance|fintech|credit union|federal credit|lending|lenders?|capital|trust co|savings|mutual|fcu|federal savings)\b/i;

function resolveMerchant(merchant: string, product: string, bankLabel: string): string {
  const m = (merchant || "").trim();
  const p = (product || "").trim();
  if (!m) return bankLabel;
  if (m.toLowerCase() === bankLabel.toLowerCase()) return bankLabel;
  if (BANK_PRODUCT_RE.test(p) || BANKISH_MERCHANT_RE.test(m)) return bankLabel;
  return m;
}

/** Final safety net: every deal on every path gets its merchant sanitized. */
function sanitizeOfferMerchants(groups: any[], bankLabel: string): void {
  for (const g of groups || []) {
    for (const d of g?.deals || []) {
      d.merchant = resolveMerchant(d.merchant || d.brand || "", d.product || d.product_name || "", bankLabel);
    }
  }
}


function parseJsonLoose(raw: string): any {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidates = [
    jsonMatch?.[1]?.trim(),
    raw.trim(),
    raw.match(/(\{[\s\S]*\})/)?.[1]?.trim(),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    try { return JSON.parse(c); } catch { /* try next */ }
  }
  return repairTruncatedJson(raw);
}

/**
 * Salvage a response that was cut off by max_tokens: trim back to the last
 * complete object and close every still-open bracket (string-aware) so a
 * near-miss still yields deals instead of an empty collection.
 */
function repairTruncatedJson(raw: string): any {
  const start = raw.indexOf("{");
  if (start < 0) return null;
  const body = raw.slice(start);

  // Track bracket depth outside of strings so we know exactly how to close.
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  // depthAt[i] = snapshot of the stack right after consuming char i.
  const closeCandidates: { end: number; tail: string }[] = [];

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === "{" || ch === "[") { stack.push(ch === "{" ? "}" : "]"); continue; }
    if (ch === "}" || ch === "]") {
      stack.pop();
      // A complete object/array boundary — record how to close from here.
      closeCandidates.push({ end: i, tail: stack.slice().reverse().join("") });
    }
  }

  for (let c = closeCandidates.length - 1; c >= 0; c--) {
    const { end, tail } = closeCandidates[c];
    try {
      const parsed = JSON.parse(body.slice(0, end + 1) + tail);
      if (parsed && typeof parsed === "object") return parsed;
    } catch { /* try an earlier boundary */ }
  }
  return null;
}

/** True when the parsed payload actually carries at least one usable deal. */
function hasDeals(parsed: any): boolean {
  const groups = parsed?.rollupOffers;
  if (!Array.isArray(groups)) return false;
  return groups.some((g: any) => Array.isArray(g?.deals) && g.deals.length > 0);
}

function describeCompletion(data: any): string {
  const finish = data?.choices?.[0]?.finish_reason ?? "unknown";
  const out = data?.usage?.completion_tokens ?? "?";
  return `finish_reason=${finish} completion_tokens=${out}`;
}

async function callGateway(systemPrompt: string, userPrompt: string, apiKey: string, model: string = MODEL, maxTokens = 8192) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.55,
      max_tokens: maxTokens,
      // Structured output — without it the model sometimes returns reasoning prose.
      response_format: { type: "json_object" },
    }),
  });
  return response;
}

const STOPWORDS = new Set(["the","a","an","of","for","to","and","in","on","at","with","new","my","your"]);
function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/).filter(t => t.length > 2 && !STOPWORDS.has(t));
}
function tokenOverlap(a: string, b: string): number {
  const sa = new Set(tokens(a));
  let n = 0;
  for (const t of tokens(b)) if (sa.has(t)) n++;
  return n;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  console.log(`[NEXT-OFFERS] ▶ invoked: method=${req.method}`);

  try {
    const rawBody = await req.text();
    if (!rawBody || !rawBody.trim()) {
      return new Response(JSON.stringify({ rollupOffers: [], error: "empty body" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error("generate-next-offers: JSON parse failed:", parseErr);
      return new Response(JSON.stringify({ rollupOffers: [], error: "invalid JSON" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { persona, pillars, lifeEvents, bankContext, financial_signals, months_of_data } = body;
    const _bankName = bankContext && typeof bankContext.bankName === "string" ? bankContext.bankName.trim().slice(0, 80) : "";
    if (_bankName) console.log(`[NEXT-OFFERS] customized for bank: ${_bankName}`);
    const bankLabel = _bankName || "Our Bank";
    const months = Math.max(1, Math.min(24, Number(months_of_data) || 12));
    const annualize = (spend: number) => Math.round((spend / months) * 12);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const allRollups = persona?.pillarRollups || [];

    // Cap: only the top behavioral clusters by observed spend are sent to the model.
    const rollups = allRollups
      .filter((r: any) => (r.totalCount ?? 0) > 0)
      .slice()
      .sort((a: any, b: any) => (b.totalSpend ?? 0) - (a.totalSpend ?? 0))
      .slice(0, MAX_BEHAVIORAL_ROLLUPS);

    const rollupList = rollups
      .map((r: any, i: number) => {
        const cats = (r.categories || []).join(", ");
        const merchants = (r.topMerchants || []).slice(0, 6).join(", ");
        const total = Math.round(r.totalSpend ?? 0);
        const annual = annualize(total);
        const monthly = Math.round(total / months);
        return `${i + 1}. "${r.label}" (${r.pillar}) — ${r.totalCount ?? 0} txns · $${total} observed (~$${monthly}/mo, ~$${annual}/yr annualized) — categories: ${cats}${merchants ? ` | recent merchants: ${merchants}` : ""}`;
      })
      .join("\n");

    const pillarContext = (pillars || [])
      .slice(0, 8)
      .map(
        (p: any, i: number) => {
          const total = Math.round(p.totalSpend);
          const annual = annualize(total);
          return `${i + 1}. ${p.pillar} > ${p.label} — $${total} across ${p.count} txns (~$${annual}/yr)${p.topMerchants?.length ? ` (${p.topMerchants.slice(0, 3).join(", ")})` : ""}`;
        },
      )
      .join("\n");

    // Cap: only the highest-confidence life events. Tag AFTER slicing so ids stay
    // aligned with what the model actually receives.
    const lifeEventsTagged = ((lifeEvents || []) as any[])
      .slice()
      .sort((a: any, b: any) => (b?.confidence ?? 0) - (a?.confidence ?? 0))
      .slice(0, MAX_LIFE_EVENTS)
      .map((e: any, i: number) => ({
        id: `LE_${i + 1}`,
        event_name: e.event_name,
        confidence: e.confidence,
        evidence_merchants: e.evidence_merchants,
      }));

    const lifeEventList = lifeEventsTagged
      .map((e: any) => {
        const merchants = (e.evidence_merchants || []).slice(0, 6).join(", ");
        return `id=${e.id} | event_name="${e.event_name}" | confidence=${Math.round((e.confidence || 0) * 100)}%${merchants ? ` | evidence merchants: ${merchants}` : ""}`;
      })
      .join("\n");

    // Cap: hero financial signal only.
    const financialSignalsTagged = (Array.isArray(financial_signals) ? financial_signals : []).slice(0, MAX_FINANCIAL_SIGNALS).map((s: any, i: number) => ({
      id: `FS_${i + 1}`,
      label: s.label,
      product_family: s.product_family,
      servicer: s.servicer,
      monthly_payment: s.monthly_payment,
      balance: s.balance,
      rate: s.rate,
      term_months: s.term_months,
      renewal_window: s.renewal_window,
    }));

    const financialSignalList = financialSignalsTagged
      .map((s: any) => {
        const bits: string[] = [];
        if (s.servicer) bits.push(`servicer=${s.servicer}`);
        if (s.monthly_payment) bits.push(`monthly_payment=$${s.monthly_payment}`);
        if (s.balance) bits.push(`balance=$${s.balance}`);
        if (s.rate) bits.push(`rate=${s.rate}`);
        if (s.term_months) bits.push(`term_months=${s.term_months}`);
        if (s.renewal_window) bits.push(`renewal_window=${s.renewal_window}`);
        return `id=${s.id} | label="${s.label}" | product_family=${s.product_family || "unknown"}${bits.length ? ` | ${bits.join(" · ")}` : ""}`;
      })
      .join("\n");

    let rollupUserPrompt = "";
    if (rollupList) rollupUserPrompt += `BEHAVIORAL CLUSTERS (with spend totals + annualized figures — use these for valueLine math):\n${rollupList}\n\n`;
    if (pillarContext) rollupUserPrompt += `SPENDING CONTEXT (annualized $):\n${pillarContext}\n\n`;
    rollupUserPrompt += `BANK NAMING RULE: for any bank/financial product deal, the "merchant" MUST be "${bankLabel}" verbatim — never invent a lender or issuer brand and never name a real bank.\n\nGenerate exactly 5 boost deals for EACH cluster above. Every deal MUST include a valueLine + valueMath grounded in the numbers above. The "rollup" field MUST be the exact label string in quotes (verbatim). Return valid JSON only.`;

    const lifeEventUserPrompt = lifeEventList
      ? `LIFE EVENTS (generate one rollup group per event, 5 deals each):\n${lifeEventList}\n\nFor EACH event above, produce exactly one rollup group whose "eventId" matches the id (LE_1, LE_2, ...) and whose "rollup" is the exact event_name. Every deal MUST include valueLine + valueMath (life-event product cost benchmarks are OK if you name them). BANK NAMING RULE: for any bank/financial product deal, the "merchant" MUST be "${bankLabel}" verbatim — never invent a lender or issuer brand and never name a real bank. Return valid JSON only.`
      : "";

    const financialSignalUserPrompt = financialSignalList
      ? `BANK: ${bankLabel}\n\nFINANCIAL SIGNALS (generate one rollup group per signal, 5 deals each — this is the hero of hyper-personalization):\n${financialSignalList}\n\nBANK NAMING RULE (STRICT): every deal for a bank product (loan, refinance, HELOC, mortgage, credit card, savings, IRA, investing, line of credit) MUST use "${bankLabel}" VERBATIM as the "merchant". NEVER invent a lender or issuer brand (e.g. "Star Financial", "Summit Lending") and NEVER name a real institution (Chase, Wells Fargo, Bank of America, Citi, SoFi, LightStream, Merrill). Third-party retail merchants are allowed ONLY for non-bank products.\n\nFor EACH signal above, produce exactly one rollup group whose "signalId" matches the id (FS_1, FS_2, ...) and whose "rollup" is the exact label. Every deal MUST include valueLine + valueMath computed from THAT signal's own numbers (monthly_payment, balance, rate). Return valid JSON only.`
      : "";

    const tasks: Promise<Response | null>[] = [];
    tasks.push(rollupList ? callGateway(SYSTEM_PROMPT, rollupUserPrompt, LOVABLE_API_KEY, COPY_MODEL, BEHAVIORAL_MAX_TOKENS) : Promise.resolve(null));
    tasks.push(lifeEventUserPrompt ? callGateway(LIFE_EVENT_SYSTEM_PROMPT, lifeEventUserPrompt, LOVABLE_API_KEY, COPY_MODEL, EVENT_MAX_TOKENS) : Promise.resolve(null));
    tasks.push(financialSignalUserPrompt ? callGateway(FINANCIAL_SIGNAL_SYSTEM_PROMPT, financialSignalUserPrompt, LOVABLE_API_KEY, COPY_MODEL, SIGNAL_MAX_TOKENS) : Promise.resolve(null));

    const [rollupRes, lifeEventRes, financialSignalRes] = await Promise.all(tasks);

    for (const r of [rollupRes, lifeEventRes, financialSignalRes]) {
      if (r && !r.ok) {
        const errText = await r.text();
        console.error("AI gateway error:", r.status, errText);
        if (r.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (r.status === 402) {
          return new Response(JSON.stringify({ error: "Payment required" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${r.status}`);
      }
    }

    const rollupOffers: any[] = [];

    if (rollupRes) {
      const data = await rollupRes.json();
      const raw = data.choices?.[0]?.message?.content || "";
      let parsed = parseJsonLoose(raw);
      if (!hasDeals(parsed)) {
        console.error(
          `[NEXT-OFFERS] behavioral copy unusable (${describeCompletion(data)}) for clusters: ${rollups.map((r: any) => `"${r.label}"`).join(", ")} — retrying compact`,
          raw.slice(0, 300),
        );
        // One bounded retry with terser copy so the JSON fits the ceiling.
        const compactPrompt = `${rollupUserPrompt}\n\nOUTPUT BUDGET (STRICT): keep it terse so the JSON is COMPLETE. message ≤ 9 words, valueLine ≤ 12 words, valueMath ≤ 30 chars, signalReason ≤ 8 words, suppressedCategories ≤ 2 entries. Never stop mid-object — a complete JSON document matters more than long copy.`;
        const retryRes = await callGateway(SYSTEM_PROMPT, compactPrompt, LOVABLE_API_KEY, COPY_MODEL, BEHAVIORAL_MAX_TOKENS);
        if (retryRes?.ok) {
          const retryData = await retryRes.json();
          const retryRaw = retryData.choices?.[0]?.message?.content || "";
          const retryParsed = parseJsonLoose(retryRaw);
          if (hasDeals(retryParsed)) parsed = retryParsed;
          else console.error(`[NEXT-OFFERS] behavioral retry also unusable (${describeCompletion(retryData)})`, retryRaw.slice(0, 300));
        } else if (retryRes) {
          console.error("[NEXT-OFFERS] behavioral retry gateway error:", retryRes.status);
        }
      }
      if (hasDeals(parsed)) {
        rollupOffers.push(...parsed.rollupOffers);
        const dealCount = parsed.rollupOffers.reduce((n: number, g: any) => n + (g?.deals?.length || 0), 0);
        console.log(`[NEXT-OFFERS] behavioral → ${parsed.rollupOffers.length} group(s), ${dealCount} deal(s)`);
      } else {
        console.error("[NEXT-OFFERS] behavioral produced no deals after retry — cluster dropped");
      }
    }

    if (lifeEventRes && lifeEventsTagged.length > 0) {
      const data = await lifeEventRes.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJsonLoose(raw);
      if (!parsed) console.error(`Failed to parse life-event AI response (${describeCompletion(data)}):`, raw.slice(0, 500));

      let lifeEventGroups: any[] = [];
      if (parsed?.rollupOffers && Array.isArray(parsed.rollupOffers)) {
        lifeEventGroups = parsed.rollupOffers;
      } else if (Array.isArray(parsed)) {
        lifeEventGroups = parsed;
      } else if (parsed?.lifeEvents && Array.isArray(parsed.lifeEvents)) {
        lifeEventGroups = parsed.lifeEvents;
      }

      // Normalize all returned groups to canonical shape
      const normalizedGroups = lifeEventGroups.map((g: any) => {
        const normalizedDeals = (g.deals || []).map((d: any, idx: number) => ({
          id: d.id || `le_${idx}`,
          merchant: resolveMerchant(d.merchant || d.brand || "", d.product || d.product_name || "", bankLabel) || "Recommended Partner",
          product: d.product || d.product_name || "",
          rewardValue: d.rewardValue || d.reward || "",
          message: d.message || "",
          valueLine: d.valueLine || d.value_line || null,
          valueMath: d.valueMath || d.value_math || null,
          cta: d.cta || d.call_to_action || d.callToAction || "Learn more",
          signal: d.signal || "boost",
          signalReason: d.signalReason || d.reason || "Aligned with this life event",
          boostCategory: d.boostCategory || d.boost_category,
        }));
        return {
          eventId: g.eventId || g.event_id || g.id,
          rollupRaw: g.rollup || g.event_name || g.eventName || g.label || "",
          collectionMessage: g.collectionMessage || g.collection_message,
          suppressedCategories: g.suppressedCategories || g.suppressed_categories || [],
          imageCategory: g.imageCategory || g.image_category,
          imageQuery: g.imageQuery || g.image_query,
          deals: normalizedDeals,
        };
      });

      // Guarantee 1-to-1 mapping: for every input event, find best match
      for (const evt of lifeEventsTagged) {
        // 1. Match by eventId
        let match = normalizedGroups.find(g => g.eventId === evt.id);
        // 2. Exact label match (case-insensitive)
        if (!match) {
          match = normalizedGroups.find(g => g.rollupRaw.toLowerCase().trim() === evt.event_name.toLowerCase().trim());
        }
        // 3. Token-overlap fuzzy match (≥1 significant token)
        if (!match) {
          let best: any = null;
          let bestScore = 0;
          for (const g of normalizedGroups) {
            const score = tokenOverlap(g.rollupRaw, evt.event_name);
            if (score > bestScore) { bestScore = score; best = g; }
          }
          if (best && bestScore >= 1) match = best;
        }

        if (match) {
          console.log(`[NEXT-OFFERS] life event "${evt.event_name}" (${evt.id}) → matched (deals: ${match.deals.length}, raw label: "${match.rollupRaw}")`);
          rollupOffers.push({
            rollup: evt.event_name,
            pillar: "Life Event",
            collectionMessage: match.collectionMessage,
            suppressedCategories: match.suppressedCategories,
            imageCategory: match.imageCategory,
            imageQuery: match.imageQuery,
            deals: match.deals,
          });
        } else {
          console.warn(`[NEXT-OFFERS] life event "${evt.event_name}" (${evt.id}) → NO MATCH, emitting placeholder. Available raw labels:`, normalizedGroups.map(g => g.rollupRaw));
          rollupOffers.push({
            rollup: evt.event_name,
            pillar: "Life Event",
            collectionMessage: `Curated offers for your ${evt.event_name.toLowerCase()} journey.`,
            suppressedCategories: [],
            deals: [],
          });
        }
      }
    }

    if (financialSignalRes && financialSignalsTagged.length > 0) {
      const data = await financialSignalRes.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJsonLoose(raw);
      if (!parsed) console.error(`Failed to parse financial-signal AI response (${describeCompletion(data)}):`, raw.slice(0, 500));
      let fsGroups: any[] = [];
      if (parsed?.rollupOffers && Array.isArray(parsed.rollupOffers)) fsGroups = parsed.rollupOffers;
      else if (Array.isArray(parsed)) fsGroups = parsed;

      const normalizedFs = fsGroups.map((g: any) => ({
        signalId: g.signalId || g.signal_id || g.id,
        rollupRaw: g.rollup || g.label || "",
        collectionMessage: g.collectionMessage || g.collection_message,
        suppressedCategories: g.suppressedCategories || g.suppressed_categories || [],
        imageCategory: g.imageCategory || g.image_category || "finance",
        imageQuery: g.imageQuery || g.image_query,
        deals: (g.deals || []).map((d: any, idx: number) => ({
          id: d.id || `fs_${idx}`,
          merchant: resolveMerchant(d.merchant, d.product || d.product_name || "", bankLabel),
          product: d.product || d.product_name || "",
          rewardValue: d.rewardValue || d.reward || "",
          message: d.message || "",
          valueLine: d.valueLine || d.value_line || null,
          valueMath: d.valueMath || d.value_math || null,
          cta: d.cta || d.call_to_action || "Learn more",
          signal: d.signal || "boost",
          signalReason: d.signalReason || d.reason || "Financial signal detected",
          boostCategory: d.boostCategory || d.boost_category,
        })),
      }));

      for (const sig of financialSignalsTagged) {
        let match = normalizedFs.find(g => g.signalId === sig.id);
        if (!match) {
          match = normalizedFs.find(g => g.rollupRaw.toLowerCase().trim() === (sig.label || "").toLowerCase().trim());
        }
        if (!match) {
          let best: any = null; let bestScore = 0;
          for (const g of normalizedFs) {
            const score = tokenOverlap(g.rollupRaw, sig.label || "");
            if (score > bestScore) { bestScore = score; best = g; }
          }
          if (best && bestScore >= 1) match = best;
        }
        if (match) {
          rollupOffers.push({
            rollup: sig.label,
            pillar: "Financial Signal",
            collectionMessage: match.collectionMessage,
            suppressedCategories: match.suppressedCategories,
            imageCategory: match.imageCategory,
            imageQuery: match.imageQuery,
            deals: match.deals,
          });
        } else {
          console.warn(`[NEXT-OFFERS] financial signal "${sig.label}" (${sig.id}) → NO MATCH`);
        }
      }
    }

    // Safety net across every generation path (rollup pass isn't sanitized inline).
    sanitizeOfferMerchants(rollupOffers, bankLabel);

    console.log(`[NEXT-OFFERS] ◀ returning ${rollupOffers.length} groups`);
    return new Response(JSON.stringify({ rollupOffers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-next-offers error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
