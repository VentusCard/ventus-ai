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

const CONSUMER_SYSTEM_PROMPT = `You are a friendly, intelligent banking assistant inside a consumer mobile banking app.

IMPORTANT DISCLAIMER (include once at the start of the first message only):
"Note: This chatbot is not connected to a bank at the moment, so we are using Bank of America product information as reference."

Your capabilities:
1. SPENDING ANALYSIS — Answer questions about the customer's spending with specific numbers from their enriched transaction data. Break down by pillar, category, subcategory, merchant, frequency, and spending tier. Example: "Between different sports categories, you spent $420 at Nike, $180 at Dick's Sporting Goods, and $95 on a gym membership — totaling $695."
2. SUBSCRIPTIONS & RECURRING — Identify recurring/monthly/weekly charges and summarize them.
3. OUTFLOW & FREQUENCY — Show where money is going, how often, and which merchants are most frequent.
4. PRODUCT RECOMMENDATIONS — Based on spending patterns and life events, recommend relevant Bank of America products:
   - Customized Cash Rewards: https://www.bankofamerica.com/credit-cards/products/customized-cash-back-credit-card/
   - Travel Rewards: https://www.bankofamerica.com/credit-cards/products/travel-rewards-credit-card/
   - Premium Rewards: https://www.bankofamerica.com/credit-cards/products/premium-rewards-credit-card/
   - Unlimited Cash Rewards: https://www.bankofamerica.com/credit-cards/products/unlimited-cash-back-credit-card/
   - Savings Account: https://www.bankofamerica.com/deposits/savings/savings-account/
   - Advantage Banking: https://www.bankofamerica.com/deposits/checking/advantage-banking/
   - Auto Loans: https://www.bankofamerica.com/auto-loans/
   - Home Mortgage: https://www.bankofamerica.com/mortgage/home-mortgage/
   - Merrill Edge Investing: https://www.merrilledge.com/
5. LIFE EVENT INTELLIGENCE — When life events are detected, subtly surface relevant opportunities: "Based on your recent activity patterns, you might benefit from..."
6. FINANCIAL TIPS — Provide actionable, empowering tips based on spending patterns.

TONE & RULES:
- Be succinct: 2-4 sentences max per response. Use bullet points for lists.
- Never mention anything inappropriate, alarming, or stressful. Frame everything as opportunity.
- Never say "risk", "stress", "danger", or "warning". Use "opportunity", "optimize", "benefit" instead.
- Always cite specific dollar amounts and merchant names when answering spending questions.
- Use markdown formatting for clarity (bold for amounts, bullets for lists).
- Never fabricate transaction data — only reference what's in the provided context.
- If asked about something not in the data, say "I don't have that information in your recent transaction history."

This chatbot also powers the Financial Tips section of the app — it generates proactive coaching tips.`;

const FINANCIAL_TIP_SYSTEM_PROMPT = `You are a friendly, empowering financial coach inside a banking app. The customer just received a financial tip and responded. Help them take action.

RULES:
- Never use words like "stress", "risk", or "danger". Frame everything as opportunity and optimization.
- Keep responses concise (2-3 sentences max).
- Be warm, encouraging, and action-oriented.
- Reference specific spending data when available.
- Suggest concrete next steps.`;

function buildContextPrompt(context: any): string {
  if (!context) return "";

  let prompt = "\n\n=== CUSTOMER DATA ===\n";

  if (context.demographics) {
    const d = context.demographics;
    prompt += `\nCUSTOMER PROFILE:\n`;
    prompt += `- Name: ${d.name}\n`;
    if (d.age) prompt += `- Age: ${d.age}\n`;
    if (d.occupation) prompt += `- Occupation: ${d.occupation}\n`;
    if (d.familyStatus) prompt += `- Family: ${d.familyStatus}\n`;
    if (d.income) prompt += `- Income Range: ${d.income}\n`;
    if (d.segment) prompt += `- Segment: ${d.segment}\n`;
    if (d.holdings) prompt += `- Holdings: ${d.holdings}\n`;
  }

  if (context.spendingSummary) {
    const s = context.spendingSummary;
    prompt += `\nSPENDING OVERVIEW:\n`;
    prompt += `- Total Spend: $${s.totalSpend?.toLocaleString() ?? 0}\n`;
    prompt += `- Transaction Count: ${s.totalTransactions ?? 0}\n`;

    if (s.byPillar && s.byPillar.length > 0) {
      prompt += `\nSPENDING BY PILLAR:\n`;
      for (const p of s.byPillar) {
        prompt += `- ${p.pillar}: $${p.total.toLocaleString()} (${p.count} txns)`;
        if (p.topMerchants?.length) prompt += ` — Top: ${p.topMerchants.join(", ")}`;
        prompt += `\n`;
        if (p.categories?.length) {
          for (const c of p.categories.slice(0, 5)) {
            prompt += `  • ${c.name}: $${c.total.toLocaleString()} (${c.count} txns)\n`;
          }
        }
      }
    }

    if (s.subscriptions && s.subscriptions.length > 0) {
      prompt += `\nRECURRING / SUBSCRIPTIONS:\n`;
      for (const sub of s.subscriptions) {
        prompt += `- ${sub.merchant}: $${sub.amount.toLocaleString()} (${sub.frequency})\n`;
      }
    }

    if (s.topMerchants && s.topMerchants.length > 0) {
      prompt += `\nTOP MERCHANTS:\n`;
      for (const m of s.topMerchants.slice(0, 10)) {
        prompt += `- ${m.merchant}: $${m.total.toLocaleString()} (${m.count} visits)\n`;
      }
    }
  }

  if (context.lifeEvents && context.lifeEvents.length > 0) {
    prompt += `\nDETECTED LIFE EVENTS:\n`;
    for (const e of context.lifeEvents) {
      prompt += `- ${e.name} (${e.confidence}% confidence)`;
      if (e.talkingPoints?.length) prompt += `: ${e.talkingPoints[0]}`;
      prompt += `\n`;
    }
  }

  if (context.deals && context.deals.length > 0) {
    prompt += `\nPERSONALIZED DEALS:\n`;
    for (const d of context.deals.slice(0, 5)) {
      prompt += `- ${d.brand}: ${d.offer} (${d.match}% match)\n`;
    }
  }

  // Financial tip mode extras
  if (context.tipCategory) {
    prompt += `\nFINANCIAL TIP CONTEXT:\n`;
    prompt += `- Tip Category: ${context.tipCategory}\n`;
    if (context.tipMessage) prompt += `- Original Tip: ${context.tipMessage}\n`;
    if (context.customerResponse) prompt += `- Customer Response Type: ${context.customerResponse}\n`;
  }

  return prompt;
}

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

    const { message, conversationHistory = [], context = {} } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isFinancialTipMode = context.mode === "financial-tip-chat";
    const systemPrompt = isFinancialTipMode
      ? FINANCIAL_TIP_SYSTEM_PROMPT
      : CONSUMER_SYSTEM_PROMPT;

    const contextPrompt = buildContextPrompt(context);

    const messages = [
      { role: "system", content: systemPrompt + contextPrompt },
      ...conversationHistory.map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

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
          messages,
          max_tokens: 500,
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
    const aiMessage = data.choices?.[0]?.message?.content ?? "I'm here to help! Could you rephrase that?";

    return new Response(
      JSON.stringify({ message: aiMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("consumer-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
