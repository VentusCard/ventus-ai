import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-3.5-flash";

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

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Cluster Label","pillar":"Pillar Name","collectionMessage":"8-15 word lifestyle tagline","imageCategory":"ski","imageQuery":"snowy ski slope","suppressedCategories":["Hotels","Coffee"],"deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

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

Output valid JSON only, no markdown:
{"rollupOffers":[{"eventId":"LE_1","rollup":"Exact Event Name","pillar":"Life Event","collectionMessage":"8-15 word tagline","imageCategory":"baby","imageQuery":"newborn nursery","suppressedCategories":["Online Tutoring","Test Prep Books"],"deals":[{"id":"le1_d1","merchant":"Brand","product":"Specific product name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Khan Academy subscription → upgrade to live SAT prep","boostCategory":"Test Prep"},...]},...]}`;

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
  return null;
}

async function callGateway(systemPrompt: string, userPrompt: string, apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.55,
      max_tokens: 8192,
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

    const { persona, pillars, lifeEvents, bankContext } = body;
    const _bankName = bankContext && typeof bankContext.bankName === "string" ? bankContext.bankName.trim().slice(0, 80) : "";
    // Note: retail deals reference partner merchants, not the bank. bankContext accepted for forward-compat / logging.
    if (_bankName) console.log(`[NEXT-OFFERS] customized for bank: ${_bankName}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const rollups = persona?.pillarRollups || [];

    const rollupList = rollups
      .filter((r: any) => (r.totalCount ?? 0) > 0)
      .map((r: any, i: number) => {
        const cats = (r.categories || []).join(", ");
        const merchants = (r.topMerchants || []).slice(0, 6).join(", ");
        return `${i + 1}. "${r.label}" (${r.pillar}) — categories: ${cats}${merchants ? ` | recent merchants: ${merchants}` : ""}`;
      })
      .join("\n");

    const pillarContext = (pillars || [])
      .slice(0, 8)
      .map(
        (p: any, i: number) =>
          `${i + 1}. ${p.pillar} > ${p.label} — $${Math.round(p.totalSpend)} across ${p.count} txns${p.topMerchants?.length ? ` (${p.topMerchants.slice(0, 3).join(", ")})` : ""}`,
      )
      .join("\n");

    // Tag each life event with a stable id for deterministic mapping
    const lifeEventsTagged = (lifeEvents || []).map((e: any, i: number) => ({
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

    let rollupUserPrompt = "";
    if (rollupList) rollupUserPrompt += `BEHAVIORAL CLUSTERS (with recent spending/merchants):\n${rollupList}\n\n`;
    if (pillarContext) rollupUserPrompt += `SPENDING CONTEXT:\n${pillarContext}\n\n`;
    rollupUserPrompt += `Generate exactly 5 boost deals for EACH cluster above. The "rollup" field in each output object MUST be the exact label string in quotes from the cluster list (verbatim). Return valid JSON only.`;

    const lifeEventUserPrompt = lifeEventList
      ? `LIFE EVENTS (generate one rollup group per event, 5 deals each):\n${lifeEventList}\n\nFor EACH event above, produce exactly one rollup group whose "eventId" matches the id (LE_1, LE_2, ...) and whose "rollup" is the exact event_name. Return valid JSON only.`
      : "";

    const tasks: Promise<Response | null>[] = [];
    tasks.push(rollupList ? callGateway(SYSTEM_PROMPT, rollupUserPrompt, LOVABLE_API_KEY) : Promise.resolve(null));
    tasks.push(lifeEventUserPrompt ? callGateway(LIFE_EVENT_SYSTEM_PROMPT, lifeEventUserPrompt, LOVABLE_API_KEY) : Promise.resolve(null));

    const [rollupRes, lifeEventRes] = await Promise.all(tasks);

    for (const r of [rollupRes, lifeEventRes]) {
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
      const parsed = parseJsonLoose(raw);
      if (parsed?.rollupOffers) rollupOffers.push(...parsed.rollupOffers);
      else console.error("Failed to parse rollup AI response:", raw.slice(0, 500));
    }

    if (lifeEventRes && lifeEventsTagged.length > 0) {
      const data = await lifeEventRes.json();
      const raw = data.choices?.[0]?.message?.content || "";
      const parsed = parseJsonLoose(raw);

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
          merchant: d.merchant || d.brand || "Recommended Partner",
          product: d.product || d.product_name || "",
          rewardValue: d.rewardValue || d.reward || "",
          message: d.message || "",
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

    console.log(`[NEXT-OFFERS] ◀ returning ${rollupOffers.length} groups (${rollupOffers.filter(g => g.pillar === "Life Event").length} life events, ${rollupOffers.filter(g => g.pillar !== "Life Event").length} behavioral)`);
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
