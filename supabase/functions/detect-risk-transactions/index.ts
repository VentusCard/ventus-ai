import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const ALLOWED_ORIGINS = [
  "https://ventuscard.com",
  "https://ventusai.com",
  "https://staging.d1gaewa028qzng.amplifyapp.com",
  /^https:\/\/.*\.ventusai\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^http:\/\/localhost:\d+$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((a) =>
      typeof a === "string" ? a === origin : a.test(origin)
    );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

const SYSTEM_PROMPT = `You are a banking risk analysis engine. Analyze the provided transaction data and detect potential risk factors across four categories:

1. **FRAUD** — Unusual merchants, duplicate charges within short timeframes, geo anomalies (transactions far from home zip), card-not-present indicators, unusually large amounts relative to the customer's spending pattern.

2. **AML (Anti-Money Laundering)** — Structuring patterns (multiple transactions just below reporting thresholds like $10,000), round-number deposits/withdrawals, rapid movement of funds, layering patterns, unusual international transactions.

3. **VICE** — Gambling merchants/casinos, adult content merchants, payday loans, cash advance services, debt consolidation services, pawn shops, cryptocurrency exchanges used for mixing.

4. **HABIT_SHIFT** — Sudden spikes in a category (e.g. 3x normal spending), new high-frequency merchants appearing, dramatic change in spending tier (Budget→Premium or reverse), disappearance of regular subscriptions, shift in geographic spending patterns.

For each flagged transaction or pattern, provide:
- transaction_id (or "pattern" if it spans multiple transactions)
- category: "fraud" | "aml" | "vice" | "habit_shift"
- severity: "low" | "medium" | "high"
- merchant: the merchant name
- amount: the dollar amount
- date: the transaction date
- reason: a clear one-sentence explanation

Also provide a brief overall summary (2-3 sentences) of the risk profile.

You MUST respond with valid JSON only, no markdown fences. Use this exact structure:
{
  "flags": [...],
  "summary": "..."
}

If no risks are detected, return {"flags":[],"summary":"No significant risk factors detected in the analyzed transactions."}`;

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { transactions } = await req.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "transactions array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a compact representation of transactions for the prompt
    const txSummary = transactions.map((t: any) => ({
      id: t.transaction_id,
      merchant: t.normalized_merchant || t.merchant_name,
      amount: t.amount,
      date: t.date,
      pillar: t.pillar,
      category: t.category,
      subcategory: t.subcategories?.[0] || t.subcategory,
      frequency: t.purchase_frequency,
      tier: t.spending_tier,
      zip: t.zip_code,
      home_zip: t.home_zip,
    }));

    const userPrompt = `Analyze these ${txSummary.length} transactions for risk factors:\n\n${JSON.stringify(txSummary, null, 1)}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "{}";

    // Parse the JSON response, stripping markdown fences if present
    let parsed;
    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      parsed = { flags: [], summary: "Unable to analyze transactions at this time." };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-risk-transactions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
