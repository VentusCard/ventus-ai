import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "google/gemini-2.5-flash";

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

SIGNAL LOGIC:
- ALL 5 deals MUST have signal: "boost". Every deal should have a clear signalReason explaining the behavioral gap or opportunity, and a boostCategory (short product-type label like "Headphones", "Luggage").
- NEVER boost a category that has NO related spending in the provided clusters. If the customer has no fitness/sports transactions, do NOT recommend fitness equipment. Every deal must trace back to an observed spending pattern.

suppressedCategories: For each cluster, identify 0-3 broad spending categories the user already covers (e.g., "Hotels", "Airlines", "Ski Passes", "Coffee", "Streaming") and list them in the suppressedCategories array. These are NOT deals — just metadata about what the customer already has.

COLLECTION MESSAGE:
- For each cluster, generate a "collectionMessage" — a short, inspiring 8-15 word lifestyle tagline that introduces the collection of deals.
- Do NOT reference demographics. Keep it aspirational and lifestyle-focused.

OUTPUT: Valid JSON only, no markdown. Exact shape:
{"rollupOffers":[{"rollup":"Cluster Label","pillar":"Pillar Name","collectionMessage":"8-15 word lifestyle tagline","suppressedCategories":["Hotels","Coffee"],"deals":[{"id":"r1_d1","merchant":"Brand","product":"Product Name","rewardValue":"15% Off","message":"8-12 word lifestyle message","cta":"2-4 word CTA","signal":"boost","signalReason":"Short reason","boostCategory":"Headphones"},...]},...]}`;

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
- Lifestyle-driven 2-4 word CTAs.
- Each deal: merchant, product, rewardValue, message, cta, signal, signalReason, optional boostCategory.

Output valid JSON only:
{"rollupOffers":[{"eventId":"LE_1","rollup":"Exact Event Name","pillar":"Life Event","collectionMessage":"8-15 word tagline","deals":[{"id":"le1_d1","merchant":"Brand","product":"...","rewardValue":"...","message":"...","cta":"...","signal":"boost","signalReason":"...","boostCategory":"..."},...]},...]}`;

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

    const { persona, pillars, lifeEvents } = body;

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
