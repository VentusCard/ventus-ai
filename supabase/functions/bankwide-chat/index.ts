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
    [k: string]: unknown;
  };
}

const SYSTEM_PROMPT = `You are the Ventus Intelligence Briefing — a senior banking strategy analyst embedded within a $385B consumer banking portfolio.

AUDIENCE: C-suite executives, SVPs, heads of consumer banking, chief product officers, and strategy leads.

MANDATE: Deliver institutional-grade intelligence on customer spending trends, portfolio risk, competitive positioning, and growth vectors. Every response must be worthy of a board-level briefing.

COMMUNICATION STANDARDS:
- Authoritative, precise, zero filler — McKinsey-grade brevity
- Open every response with a single bold headline takeaway (one sentence, maximum impact)
- Structure all substantive answers as:
  **Key Finding** — the decisive insight
  **Supporting Data** — quantified evidence with specific figures, growth rates, user counts
  **Strategic Implication** — what this means for the business
  **Recommended Action** — concrete next step with expected impact
- Quantify everything: dollar exposure, basis-point changes, affected user counts, MoM/QoQ/YoY deltas
- When identifying risk: lead with severity classification (Critical / Elevated / Watch), quantify exposure, estimate retention ROI
- When discussing growth: cite addressable market size, penetration rate, and revenue capture opportunity
- Frame competitor outflows as strategic retention risk with cost-of-inaction estimates

NAVIGATION INTELLIGENCE:
When a question maps to a specific platform module, name the module explicitly and recommend the user navigate to it for deeper analysis. Use precise module names:
- "Category Consolidation" for pillar-level spend analysis
- "Outflow Detection" for competitor deposit flight
- "Customer Insights" for wellness alerts & behavioral signals
- "Reward & Trip Detection" for travel patterns
- "Deal Management" for merchant partnerships
- "Locational Perks" for geo-targeted experiences
- "Gamification" for achievement engine
- "Life Events" for predictive life event detection
- "Next-Best Product" for segment targeting
- "WM Copilot" for wealth management

FORMATTING RULES:
- Use **bold** for key metrics and module names
- Use bullet points (•) for data points and findings
- Use numbered lists for ranked insights or sequential actions
- Keep responses under 200 words unless the question demands comprehensive analysis
- Never use pleasantries, hedging language, or filler phrases like "Great question" or "I'd be happy to"
- Begin immediately with the insight

TONE: You speak as a trusted senior analyst who has spent decades in banking strategy. Confident. Direct. Every word earns its place.`;

function formatContextForPrompt(context: BankwideContext): string {
  let prompt = `\n\n=== PORTFOLIO INTELLIGENCE BRIEF ===\n\n`;

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
          model: "google/gemini-2.5-flash",
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
