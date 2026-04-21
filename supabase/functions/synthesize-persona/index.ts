import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Compute a human-readable cadence hint from an array of date strings */
function cadenceHint(dates: string[]): string {
  if (!dates || dates.length < 2) return "";
  const sorted = dates.map(d => new Date(d).getTime()).filter(t => !isNaN(t)).sort((a, b) => a - b);
  if (sorted.length < 2) return "";
  const spanMs = sorted[sorted.length - 1] - sorted[0];
  const spanWeeks = spanMs / (7 * 24 * 60 * 60 * 1000);
  const spanYears = spanMs / (365.25 * 24 * 60 * 60 * 1000);
  const count = sorted.length;

  if (spanWeeks < 1) return `${count}x in one week`;
  if (spanYears >= 1) {
    const perYear = count / spanYears;
    return `~${perYear.toFixed(0)}x/yr over ${Math.round(spanYears)}yr`;
  }
  const perWeek = count / spanWeeks;
  return `~${perWeek.toFixed(1)}x/wk over ${Math.round(spanWeeks)}wk`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pillars, lifeEvents } = await req.json();
    if (!pillars || !Array.isArray(pillars) || pillars.length === 0) {
      return new Response(JSON.stringify({ error: "pillars array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const detectedEventNames: string[] = Array.isArray(lifeEvents)
      ? lifeEvents.map((e: { event_name?: string }) => e?.event_name).filter((n): n is string => !!n)
      : [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const distinctPillars = [...new Set(pillars.map((p: { pillar: string }) => p.pillar))] as string[];

    const pillarSummary = pillars
      .map((p: { pillar: string; label: string; count: number; totalSpend: number; frequency?: string; topMerchants?: string[]; spendingTier?: string; subcategories?: string[]; dates?: string[] }, i: number) => {
        const merchants = p.topMerchants?.length ? ` merchants: ${p.topMerchants.slice(0, 5).join(", ")}` : "";
        const tier = p.spendingTier ? ` [${p.spendingTier}]` : "";
        const subs = p.subcategories?.length ? ` subs: ${p.subcategories.slice(0, 5).join(", ")}` : "";
        const cadence = cadenceHint(p.dates || []);
        const cadenceStr = cadence ? ` (${cadence})` : "";
        return `[${i}] ${p.pillar} > ${p.label}: ${p.count} txns, $${p.totalSpend.toFixed(0)}${tier}${merchants}${subs}${cadenceStr}`;
      })
      .join("\n");

    const lifeEventSuppressionBlock = detectedEventNames.length > 0
      ? `

**CRITICAL — LIFE EVENTS ALWAYS WIN:**
The following life events have already been detected for this customer and will be shown separately: ${detectedEventNames.map(n => `"${n}"`).join(", ")}.

Life events carry richer context (funding sources, timing, product fit) and are surfaced in their own dedicated UI section. When a behavioral pattern thematically overlaps with a detected life event, **DROP the behavioral rollup entirely** — do NOT try to "complement" the life event with a parallel rollup on the same theme. Redundant pills make the UI feel duplicated and dilute both signals.

Examples of forbidden overlaps:
- If "New Home Transition" or any home-purchase event is detected → do NOT produce "Aspiring Homeowner", "Home Buyer", "Nesting Phase", "New Homeowner", or any home-purchase / moving / nesting themed rollup.
- If "College Preparation for Dependent" or any education event is detected → do NOT produce "College Bound", "Education Investor", or similar education-themed rollup.
- If "New Baby" or family-expansion event is detected → do NOT produce "New Parent", "Baby Prep", or similar.
- If "Retirement Planning" is detected → do NOT produce retirement-themed rollups.
- If "Wedding" is detected → do NOT produce engagement / wedding-themed rollups.

When in doubt, skip the rollup. Life events take priority — every time.
`
      : "";

    const systemPrompt = `You are a sharp behavioral analyst at a bank. You look at someone's spending and figure out who they actually are — the way a friend would describe them.

Given aggregated spending signals, produce **pillar_rollups** — vivid behavioral labels that group categories into lifestyle habits.

**Before you write any rollup, scan the merchants in each category — they're your ground truth. Category names lie; merchants don't.**

**How to think about rollups:**

- A rollup describes a *recurring lifestyle habit* — something you'd mention about this person at a dinner party. "She's a total fitness nut" (gym + yoga + supplements + athletic apparel). "He eats out constantly at casual spots" (fast food + casual dining + delivery).

- Only group categories within the SAME pillar. The "pillar" field MUST be one of these exact strings: ${distinctPillars.map(p => `"${p}"`).join(", ")}.

- Ask yourself: "Would a friend describe this person this way?" If someone stays at a Hilton in Dallas and also does Orange Theory, a friend would say "she's really into fitness and she traveled to Dallas" — two separate things, not "strategic domestic traveler."

- Be honest about tier. Look at actual spending levels — frequent fast-casual dining is a "Casual Dining Regular" or "Budget-Friendly Foodie", not a "Premium Gastronome." Describe spending the way the person would describe it themselves.

- Never mention brand or merchant names in rollup labels. Labels should describe the behavior or lifestyle habit, not the stores. Nordstrom + Sephora + Warby Parker = "Style-Conscious Shopper", not "Nordstrom & Sephora Loyalist." If subcategories say "Golf", say "Weekend Golfer", not "Sports Enthusiast."

- When a category shows a clear repeat cadence (shown in parentheses), explicitly encode cadence in the label — "Annual Hawaiian Vacations" (not "Hawaii Vacationer"), "Tennis & Ski Seasonal Sports" (not "Alpine & Court Enthusiast"), "Weekly Workday Coffee Runs". Don't use raw stats like "3.2x/wk".

- **Pattern-forward naming (REQUIRED when cadence is clear):** Labels must explicitly state the behavioral pattern. Use one of these formats:
  - "[Frequency] [Activity]" → "Annual Hawaiian Vacations", "Weekly Workday Coffee Runs", "Monthly Fine Dining Nights"
  - "[Activity] [Pattern]" → "Tennis & Ski Seasonal Sports", "Casual Dining Regular", "Grocery Run Weekly"
  - "[Season] [Activity]" → "Winter Ski Trips", "Summer Coastal Travel"
- **FORBIDDEN abstract descriptors:** Never use "Enthusiast", "Fan", "Lover", "Buff", "Aspirant", "Devotee", "Vacationer", "Junkie", "Aficionado", "Connoisseur". Use concrete activity + cadence terms instead. "Premium Hawaii Vacationer" → "Premium Annual Hawaiian Vacations". "Active Alpine & Court Enthusiast" → "Tennis & Ski Seasonal Sports".

- **SEMANTIC COHERENCE — TRANSACTIONS INSIDE A ROLLUP MUST MATCH ITS MEANING.**

  A rollup is not just a label — it's a *promise* about what kind of activity the contributing transactions represent. Before you add a category index to a rollup, look at the merchants and subcategories listed for that index and ask: "**Do these specific purchases actually fit the lifestyle this rollup describes?**"

  Categories like "Hotels & Lodging", "Airlines", "Restaurants" routinely mix incompatible lifestyles. A single "Hotels & Lodging" row can contain a Hawaii beach resort, a Tahoe ski lodge, and a midtown business hotel — those are **three different lifestyles**, not one. You must NOT bundle them under a single rollup just because they share a category.

  Examples of forbidden mismatches:
  - "Annual Hawaiian Vacations" must NOT include \`PALISADES TAHOE LODGE\`, \`ASPEN MOUNTAIN\`, \`VAIL RESORTS\`, \`WHISTLER\`, \`BRECKENRIDGE\` — those are ski-trip merchants, not Hawaii.
  - "Seasonal Ski Trips" must NOT include \`MAUI HILTON\`, \`KONA VILLAGE\`, \`HAWAIIAN AIRLINES\`, Caribbean resorts — those are tropical-trip merchants, not skiing.
  - "European Getaways" must NOT include domestic-only US merchants.
  - "Premium Fine Dining Nights" must NOT include \`MCDONALD'S\` or \`CHIPOTLE\` even if they live in a "Restaurants" category.

  **What to do instead:**
  1. Read every merchant and subcategory in each candidate category.
  2. If a category cleanly matches one lifestyle, include its index in that rollup.
  3. If a category contains **mixed lifestyles** (some Hawaii merchants, some Tahoe ski merchants; some fine dining, some fast food), emit **separate rollups** for each coherent sub-pattern (e.g. "Annual Hawaiian Vacations" AND "Seasonal Ski Trips"). Both rollups may reference the same category index — downstream UI uses merchant-level signals to display the right transactions under each pill. Do not silently merge incompatible lifestyles to keep your output shorter.
  4. If a single lifestyle clearly dominates a category (e.g. 6 Hawaii merchants and 1 stray ski lodge), name the rollup after the dominant lifestyle and accept that the stray transaction belongs to a separate, ungrouped behavior — do **not** stretch the label to cover both.
  5. Generic merchants without a clear destination/activity signal (e.g. plain "Marriott", "Delta") may be included in a themed rollup only if other transactions on similar dates establish the destination context.

  When in doubt, emit fewer, more honest rollups. A coherent "Annual Hawaiian Vacations" pill containing only Hawaii merchants is worth more than a bloated "Premium Travel" pill that lumps everything together.

- Rollups are optional. If categories don't share a clear habit, leave them ungrouped. One thoughtful rollup is better than three forced ones. A single purchase at one merchant doesn't define a lifestyle.

- **THEMATIC UNIQUENESS — ONE ROLLUP PER THEME:** Each rollup must cover a *distinct* behavioral theme. NEVER emit two rollups that describe the same underlying life pattern under different names. Forbidden duplicate pairs include (but are not limited to):
  - "Aspiring Homeowner" + "New Home Transition" / "Home Buyer" / "Nesting Phase"
  - "College Bound" + "Education Investor" / "Tuition Planner"
  - "New Parent" + "Baby Prep" / "Growing Family"
  - "Frequent Traveler" + "Vacation Planner" / "Jetsetter"
  - "Retirement Saver" + "Pre-Retiree"
  Pick the SINGLE best label and combine all related categories under it. If you find yourself writing two rollups about the same life pattern, merge them into one. (Note: "Annual Hawaiian Vacations" + "Seasonal Ski Trips" are NOT duplicates — they're distinct lifestyles and should remain separate.)

- Include the exact category names combined and the [N] row indices from the input.${lifeEventSuppressionBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Spending signals:\n${pillarSummary}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_persona",
              description: "Return the per-pillar rollup labels",
              parameters: {
                type: "object",
                properties: {
                  pillar_rollups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pillar: { type: "string", enum: distinctPillars, description: "The pillar name — MUST be one of the exact input pillar names" },
                        label: { type: "string", description: "2-4 word vivid rollup label for this pillar" },
                        categories: {
                          type: "array",
                          items: { type: "string" },
                          description: "The category names from this pillar that were combined",
                        },
                        category_indices: {
                          type: "array",
                          items: { type: "number" },
                          description: "The [N] row indices from the numbered input that this rollup covers",
                        },
                      },
                      required: ["pillar", "label", "categories", "category_indices"],
                      additionalProperties: false,
                    },
                    description: "Per-pillar rollup labels. Each rollup MUST describe a distinct behavioral theme — never emit two rollups on the same underlying life pattern (merge them into one). If a theme is already covered by a detected life event, OMIT the behavioral rollup entirely — life events take priority. Return empty array if no coherent groupings exist.",
                  },
                },
                required: ["pillar_rollups"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_persona" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    return new Response(JSON.stringify({
      pillar_rollups: (raw.pillar_rollups || []).map((r: any) => ({
        pillar: r.pillar,
        label: r.label,
        categories: r.categories || [],
        category_indices: r.category_indices || [],
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("synthesize-persona error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
