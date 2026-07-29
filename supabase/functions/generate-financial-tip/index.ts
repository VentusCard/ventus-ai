import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { transactions, customer } = await req.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "No transactions provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a compact transaction summary for the prompt
    const pillarMap = new Map<string, { total: number; count: number; merchants: Set<string>; tiers: Set<string>; frequencies: Set<string> }>();
    for (const t of transactions) {
      const entry = pillarMap.get(t.pillar) || { total: 0, count: 0, merchants: new Set(), tiers: new Set(), frequencies: new Set() };
      entry.total += Math.abs(t.amount);
      entry.count += 1;
      entry.merchants.add(t.normalized_merchant || t.merchant_name);
      if (t.spending_tier) entry.tiers.add(t.spending_tier);
      if (t.purchase_frequency) entry.frequencies.add(t.purchase_frequency);
      pillarMap.set(t.pillar, entry);
    }

    const spendingSummary = Array.from(pillarMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([pillar, d]) => ({
        pillar,
        totalSpend: Math.round(d.total),
        transactionCount: d.count,
        topMerchants: Array.from(d.merchants).slice(0, 5),
        spendingTiers: Array.from(d.tiers),
        frequencies: Array.from(d.frequencies),
      }));

    const totalSpend = spendingSummary.reduce((s, p) => s + p.totalSpend, 0);

    let customerContext = "";
    if (customer) {
      const parts: string[] = [];
      if (customer.name) parts.push(`Name: ${customer.name}`);
      if (customer.lifestyleType) parts.push(`Lifestyle: ${customer.lifestyleType}`);
      if (customer.segment) parts.push(`Segment: ${customer.segment}`);
      if (customer.demographics?.age) parts.push(`Age: ${customer.demographics.age}`);
      if (customer.demographics?.occupation) parts.push(`Occupation: ${customer.demographics.occupation}`);
      if (customer.demographics?.familyStatus) parts.push(`Family: ${customer.demographics.familyStatus}`);
      if (customer.demographics?.incomeLevel) parts.push(`Income: ${customer.demographics.incomeLevel}`);
      if (customer.holdings) {
        const h = customer.holdings;
        parts.push(`Holdings — Deposits: ${h.deposit}, Credit: ${h.credit}, Mortgage: ${h.mortgage}, Investments: ${h.investments}`);
      }
      if (parts.length > 0) {
        customerContext = `\n\nCustomer profile:\n${parts.join("\n")}`;
      }
    }

    const systemPrompt = `You are a bank's financial coaching engine embedded in a mobile banking app. Generate exactly ONE short, actionable financial tip for the customer.

RULES — strictly follow:
1. Base the tip ONLY on observable banking data: transaction amounts, merchant names, spending frequencies, pillar distribution, spending tiers (Budget/Standard/Premium), and trends.
2. NEVER reference: app usage, screen time, whether they "used" a service, external account balances, credit scores, or anything not visible from their bank transactions.
3. When customer demographics are provided, use them to make the tip more relevant (e.g., family-related advice for married customers with children, career investment tips for young professionals, retirement planning for older customers).
4. The tip should feel like helpful advice from a knowledgeable financial advisor — specific, citing real numbers from their data.
5. Keep the message under 120 characters. Be conversational, not robotic.
6. Choose the most impactful insight — look for patterns like: recurring charges that could be consolidated, high concentration in one spending category, opportunities for rewards optimization, spending tier mismatches, or seasonal patterns.`;

    const userPrompt = `Here is the customer's spending data:

Total spend: $${totalSpend.toLocaleString()}
Transaction count: ${transactions.length}

Spending by pillar:
${spendingSummary.map((p) => `- ${p.pillar}: $${p.totalSpend.toLocaleString()} (${p.transactionCount} txns, merchants: ${p.topMerchants.join(", ")}, tiers: ${p.spendingTiers.join("/")}, freq: ${p.frequencies.join("/")})`).join("\n")}${customerContext}

Generate one coaching tip.`;

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
              name: "deliver_financial_tip",
              description: "Return a single financial coaching tip for display in a banking app.",
              parameters: {
                type: "object",
                properties: {
                  message: { type: "string", description: "The coaching tip message, under 120 chars" },
                  category: { type: "string", enum: ["Saving", "Spending", "Budgeting", "Rewards", "Investment", "Planning"], description: "Tip category" },
                  potentialSavings: { type: "string", description: "Estimated savings amount like '$45/mo', or null if not applicable" },
                  icon: { type: "string", enum: ["PiggyBank", "Shield", "TrendingDown", "LayoutGrid", "Plane", "Heart", "Lightbulb", "Trophy", "Star"], description: "Icon name for the tip" },
                },
                required: ["message", "category", "icon"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "deliver_financial_tip" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(result));
      return new Response(JSON.stringify({ error: "Failed to generate tip" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tip = JSON.parse(toolCall.function.arguments);
    tip.id = `ai-tip-${Date.now()}`;

    return new Response(JSON.stringify(tip), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-financial-tip error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
