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
    const { pillars } = await req.json();
    if (!pillars || !Array.isArray(pillars) || pillars.length === 0) {
      return new Response(JSON.stringify({ error: "pillars array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const systemPrompt = `You are a sharp behavioral analyst at a bank. You look at someone's spending and figure out who they actually are — the way a friend would describe them.

Given aggregated spending signals, produce **pillar_rollups** — vivid behavioral labels that group categories into lifestyle habits.

**The test for every rollup: one activity, one tier, repeated behavior.** If a rollup fails any of these three, don't make it.

**Rule 1 — One activity per rollup.**
Categories in a rollup must share a *single behavioral activity*, not just a pillar.
- ✅ Gym + yoga + athletic apparel → one activity (fitness)
- ✅ Golf course + pro shop + golf apparel → one activity (golf)
- ✅ Coffee shops + bakeries + breakfast spots → one activity (morning coffee/breakfast habit)
- ❌ Grocery + dining out → two activities (cooking at home vs eating out)
- ❌ Coffee runs + fine dining → two activities (caffeine habit vs special occasions)
- ❌ Hotel + destination gym → two activities (travel vs fitness)

**Rule 2 — Tier homogeneity.**
Every category in a rollup MUST share the same spending tier (shown as [Budget]/[Standard]/[Premium] in the input). NEVER mix Premium with Standard or Budget. A $7 coffee and a $215 fine-dining meal cannot live in the same rollup.

**Rule 3 — Repetition threshold (evidence of a habit).**
A rollup needs evidence of a recurring *habit*, not isolated purchases. To group categories:
- At least 2 categories AND
- Each included category has ≥2 transactions, OR the combined rollup has ≥4 transactions across categories
Single-transaction categories must be left ungrouped — they don't prove a habit.

**Bad example (do NOT do this):**
Grocery [Premium] 1 txn $162 (Whole Foods) + Coffee & Cafes [Budget] 1 txn $7 (Starbucks) + Dining Out [Premium] 1 txn $215 (Mama's Fish House) → ❌ "Premium Organic & Fine Dining"
Why it's wrong: three different activities, mixed tiers, single transactions. Leave them as 3 separate chips.

**Good examples:**
- Gym [Standard] 6 txns + Yoga Studio [Standard] 4 txns + Athletic Apparel [Standard] 2 txns → ✅ "Fitness Regular"
- Coffee Shops [Standard] 8 txns + Bakeries [Standard] 3 txns → ✅ "Daily Coffee & Breakfast Habit"

**Other constraints:**
- The "pillar" field MUST be one of these exact strings: ${distinctPillars.map(p => `"${p}"`).join(", ")}. Only group categories within the SAME pillar.
- Be honest about tier. Frequent fast-casual dining is a "Casual Dining Regular," not a "Premium Gastronome."
- Never mention brand or merchant names in rollup labels. Describe the behavior, not the stores.
- When a category shows a clear repeat cadence (shown in parentheses), bake it into the label naturally — "workday coffee runs", "weekly grocery runs". Don't use raw stats.
- Include the exact category names combined and the [N] row indices from the input.

**If in doubt, leave categories ungrouped. Individual chips are better than a forced rollup.** Return an empty pillar_rollups array if nothing genuinely qualifies.`;

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
                    description: "Per-pillar rollup labels. Only group categories that genuinely share a behavioral theme. Return empty array if no coherent groupings exist.",
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

    const rawRollups = (raw.pillar_rollups || []) as Array<{
      pillar: string;
      label: string;
      categories?: string[];
      category_indices?: number[];
    }>;

    // Server-side validator: enforce tier homogeneity + repetition threshold
    const validatedRollups = rawRollups
      .map((r) => {
        const indices = (r.category_indices || []).filter(
          (i) => Number.isInteger(i) && i >= 0 && i < pillars.length
        );

        if (indices.length < 2) {
          console.log(`[validator] dropped "${r.label}" — fewer than 2 categories`);
          return null;
        }

        const indexInfo = indices.map((i) => ({
          i,
          count: pillars[i]?.count ?? 0,
          tier: pillars[i]?.spendingTier ?? "N/A",
        }));

        const totalTxns = indexInfo.reduce((s, x) => s + x.count, 0);
        const allCategoriesRepeat = indexInfo.every((x) => x.count >= 2);
        const meetsThreshold = allCategoriesRepeat || totalTxns >= 4;

        if (!meetsThreshold) {
          console.log(
            `[validator] dropped "${r.label}" — insufficient repetition (total=${totalTxns}, perCat=${indexInfo.map((x) => x.count).join(",")})`
          );
          return null;
        }

        // Tier homogeneity — ignore "N/A", require remaining tiers to match
        const knownTiers = [...new Set(indexInfo.map((x) => x.tier).filter((t) => t && t !== "N/A"))];
        if (knownTiers.length > 1) {
          console.log(`[validator] dropped "${r.label}" — mixed tiers: ${knownTiers.join(", ")}`);
          return null;
        }

        return {
          pillar: r.pillar,
          label: r.label,
          categories: r.categories || [],
          category_indices: indices,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    return new Response(JSON.stringify({ pillar_rollups: validatedRollups }), {
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
