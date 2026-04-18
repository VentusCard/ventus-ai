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

const SYSTEM_PROMPT = `You are a banking risk analysis engine. Analyze the provided transaction data and detect risk factors across THREE categories only:

1. **VICE** — Gambling merchants, casinos, sports betting, adult content/media merchants, payday/predatory loan services, cash advance services, pawn shops, cryptocurrency mixing services.
   - **MCC is authoritative.** ALWAYS flag transactions with these MCCs regardless of merchant name:
     • 7995 = Betting, Casino Gambling, Lottery, Sports Forecasting → vice (gambling)
     • 5967 = Direct Marketing — Inbound Teleservices / Adult Content → vice (adult content)
     • 7273 = Dating Services → vice (adult content) when amount is recurring/elevated
     • 6051 (cash-like) combined with crypto exchange names → vice (crypto)
   - Also flag when the merchant name clearly indicates one of these categories (e.g., "CASINO", "BET", "POKER", "ADULT", "PAYDAY LOAN", "PAWN").

2. **SUSPICIOUS_INTERNATIONAL** — International payment processors, cross-border wires, or transactions in high-risk jurisdictions (OFAC-sanctioned countries), unusual currency conversion patterns, international transfers to unfamiliar destinations.
   - ALWAYS flag merchants whose name contains "INTL", "INTERNATIONAL", "FOREIGN", "OVERSEAS", "OFFSHORE", or numeric processor IDs (e.g., "INTL PAYMENT PROC 8742") combined with a missing or non-US zip code → suspicious_international (severity: medium).
   - Flag wires/ACH to countries inconsistent with the customer's home zip and normal travel patterns.

3. **AML** — Structuring patterns (multiple transactions just below $10,000 reporting thresholds), rapid round-number deposits/withdrawals, layering patterns across accounts.

IMPORTANT RULES:
- MCC codes 7995 and 5967 are DEFINITIVE vice indicators — flag them every time, even if the merchant name is generic (e.g., "DIGITAL ENT SVCS", "PRIVATE MEDIA GRP").
- For non-MCC categories, be conservative: if unsure, do NOT flag.
- Do NOT flag normal spending variations, routine travel, everyday purchases, or changes in spending habits.
- Do NOT flag generic fraud patterns like duplicate charges or geo anomalies from normal travel.
- Do NOT flag a large legitimate purchase (e.g., a single home down-payment wire clearly labeled as such) as AML — structuring requires a PATTERN of multiple transactions deliberately staying below reporting thresholds.
- USE the provided category and pillar context. A merchant name containing words like "consulting", "services", or "group" is NOT suspicious if the transaction's category clearly maps to a benign domain (e.g., Childcare & Education, Healthcare, Home Improvement) AND the MCC is not one of the definitive vice MCCs above.

For each flagged transaction or pattern, provide:
- transaction_id (or "pattern" if it spans multiple transactions)
- category: "vice" | "suspicious_international" | "aml"
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
