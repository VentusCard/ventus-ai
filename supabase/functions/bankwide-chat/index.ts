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
    ALLOWED_ORIGINS.some((allowed) =>
      typeof allowed === "string" ? allowed === origin : allowed.test(origin)
    );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

interface BankwideContext {
  bankwideMetrics?: {
    totalAccounts: string;
    totalUsers: string;
    totalAnnualSpend: string;
    avgAccountsPerUser: number;
    activeAccountRate: string;
    crossSellRate: string;
    topSpendingPillar: string;
  };
  hotTrends?: string[];
  modules?: Record<string, string>;
  cardProducts?: string[];
  role?: string;
  platformDescription?: string;
  currentModule?: string;
  currentModuleContext?: {
    tabKey?: string;
    summary?: string;
    keyData?: string[];
    suggestedNav?: string[];
    onScreenItems?: unknown;
    [k: string]: unknown;
  };
}

const SYSTEM_PROMPT = `You are Ventus AI — an embedded co-pilot inside a bank-wide customer intelligence and personalization platform. You help operators, product leaders, advisors, and executives make sense of what they're currently looking at.

TOP PRIORITY — ANSWER ABOUT THE CURRENT VIEW:
- When the prompt contains a "CURRENT VIEW" block, that view IS the primary subject of the answer. Answer directly about what is on screen.
- If an "ON-SCREEN ITEMS" block is present, treat it as ground truth for questions like "what's here", "what am I looking at", "list the X on this page", "what products/reports/deals are here", "show me the options". List the actual items — do NOT substitute the platform module list or a generic portfolio brief.
- Only fall back to the bank-wide portfolio brief when the user's question is clearly about the whole book (e.g. "summarize the portfolio", "what's the biggest risk across the book") or when the current view has no relevant on-screen data.

RESPONSE SHAPE:
- For "what's here / list / show me" style questions: answer directly. Group by category when the on-screen data is grouped. Use short bullets. Skip the executive-briefing scaffold.
- For strategy / analysis / decision questions: use the executive briefing structure:
  **Key Finding** — the decisive insight
  **Supporting Data** — quantified evidence
  **Strategic Implication** — what it means
  **Recommended Action** — concrete next step
- Reference the CURRENT VIEW by name when relevant. Suggest a RELATED MODULE only when it genuinely helps the user's next step.

STYLE:
- Direct, precise, zero filler. No "Great question", no hedging.
- Bold key metrics and product/module names.
- Bullets (•) for lists; numbered lists for ranked or sequential items.
- Under 200 words unless the question demands more.
- Quantify when data supports it; do not fabricate numbers.

TONE: Confident senior analyst. Every word earns its place.`;


function formatContextForPrompt(context: BankwideContext): string {
  let prompt = `\n\n=== PORTFOLIO INTELLIGENCE BRIEF ===\n\n`;

  if (context.currentModule || context.currentModuleContext) {
    prompt += `CURRENT VIEW: ${context.currentModule ?? context.currentModuleContext?.tabKey ?? "Unknown"}\n`;
    const cmc = context.currentModuleContext;
    if (cmc?.summary) prompt += `WHAT THE USER IS LOOKING AT: ${cmc.summary}\n`;
    if (cmc?.keyData?.length) {
      prompt += `ON-SCREEN DATA:\n`;
      cmc.keyData.forEach((d) => (prompt += `• ${d}\n`));
    }
    if (cmc?.suggestedNav?.length) {
      prompt += `RELATED MODULES TO REFERENCE: ${cmc.suggestedNav.join(", ")}\n`;
    }
    if (cmc?.onScreenItems !== undefined && cmc?.onScreenItems !== null) {
      let serialized = JSON.stringify(cmc.onScreenItems, null, 2);
      const MAX = 8000;
      if (serialized.length > MAX) serialized = serialized.slice(0, MAX) + "\n… (truncated)";
      prompt += `\nON-SCREEN ITEMS (ground truth — quote from this when the user asks what is on this page):\n${serialized}\n`;
    }
    // Surface any extra context payload (e.g. selectedOpportunityId) verbatim.
    if (cmc) {
      const extras = Object.entries(cmc).filter(
        ([k]) => !["tabKey", "summary", "keyData", "suggestedNav", "onScreenItems"].includes(k),
      );
      if (extras.length) {
        prompt += `VIEW STATE:\n`;
        extras.forEach(([k, v]) => (prompt += `• ${k}: ${JSON.stringify(v)}\n`));
      }
    }
    prompt += `\nWhen the user says "this", "here", or "what am I looking at", refer to the CURRENT VIEW above.\n\n`;
  }


  if (context.bankwideMetrics) {
    const m = context.bankwideMetrics;
    prompt += `PORTFOLIO OVERVIEW:\n`;
    prompt += `• Total Accounts: ${m.totalAccounts}\n`;
    prompt += `• Unique Users: ${m.totalUsers}\n`;
    prompt += `• Annual Card Spend: ${m.totalAnnualSpend}\n`;
    prompt += `• Avg Accounts/User: ${m.avgAccountsPerUser}\n`;
    prompt += `• Active Account Rate: ${m.activeAccountRate}\n`;
    prompt += `• Cross-Sell Penetration: ${m.crossSellRate}\n`;
    prompt += `• Dominant Spending Pillar: ${m.topSpendingPillar}\n\n`;
  }

  if (context.hotTrends && context.hotTrends.length > 0) {
    prompt += `CURRENT TRENDS & ALERTS:\n`;
    context.hotTrends.forEach((trend, i) => {
      prompt += `${i + 1}. ${trend}\n`;
    });
    prompt += `\n`;
  }

  if (context.cardProducts && context.cardProducts.length > 0) {
    prompt += `PRODUCT DISTRIBUTION:\n`;
    context.cardProducts.forEach((product) => {
      prompt += `• ${product}\n`;
    });
    prompt += `\n`;
  }

  if (context.modules) {
    prompt += `PLATFORM MODULES (available for deep-dive analysis):\n`;
    Object.entries(context.modules).forEach(([key, desc]) => {
      prompt += `• ${key}: ${desc}\n`;
    });
    prompt += `\n`;
  }

  return prompt;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, context } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid message format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message too long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (context) {
      messages.push({
        role: "system",
        content: formatContextForPrompt(context),
      });
    }

    const recentHistory = (conversationHistory || []).slice(-10);
    messages.push(...recentHistory);
    messages.push({ role: "user", content: message });

    console.log("Bankwide-chat: calling Lovable AI...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.5-flash",
          messages,
          temperature: 0.5,
          max_tokens: 1200,
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
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

    if (!aiMessage) {
      throw new Error("No response from AI");
    }

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Bankwide chat error:", error);
    return new Response(JSON.stringify({ error: "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
