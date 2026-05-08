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

Your capabilities:
1. SPENDING ANALYSIS — Answer questions about the customer's spending with specific numbers from their enriched transaction data. Break down by pillar, category, subcategory, merchant, frequency, and spending tier. Example: "Between different sports categories, you spent $420 at Nike, $180 at Dick's Sporting Goods, and $95 on a gym membership — totaling $695."
2. SUBSCRIPTIONS & RECURRING — Identify recurring/monthly/weekly charges and summarize them.
3. OUTFLOW & FREQUENCY — Show where money is going, how often, and which merchants are most frequent.
4. PRODUCT RECOMMENDATIONS — ONLY recommend products when:
   a) The user explicitly asks for product recommendations or suggestions, OR
   b) A detected life event strongly signals a product need (e.g., home purchase → mortgage).
   Do NOT append product suggestions to spending analysis answers. If the user asks "how much did I spend on X", just answer the question.
   IMPORTANT: If the customer asks about offers/deals/products, prioritize what's listed in PERSONALIZED DEALS or PRODUCT RECOMMENDATIONS in the customer data — these are pre-generated specifically for this customer. Surface them directly with their actual headlines, merchants, and benefits. Do not invent new offers when these exist.
   When recommending generic products, always use markdown hyperlinks (never show raw URLs):
   - [Customized Cash Rewards](https://www.bankofamerica.com/credit-cards/products/customized-cash-back-credit-card/)
   - [Travel Rewards](https://www.bankofamerica.com/credit-cards/products/travel-rewards-credit-card/)
   - [Premium Rewards](https://www.bankofamerica.com/credit-cards/products/premium-rewards-credit-card/)
   - [Unlimited Cash Rewards](https://www.bankofamerica.com/credit-cards/products/unlimited-cash-back-credit-card/)
   - [Savings Account](https://www.bankofamerica.com/deposits/savings/savings-account/)
   - [Advantage Banking](https://www.bankofamerica.com/deposits/checking/advantage-banking/)
   - [Auto Loans](https://www.bankofamerica.com/auto-loans/)
   - [Home Mortgage](https://www.bankofamerica.com/mortgage/home-mortgage/)
   - [Merrill Edge Investing](https://www.merrilledge.com/)
5. LIFE EVENT INTELLIGENCE — When life events are detected, subtly surface relevant opportunities: "Based on your recent activity patterns, you might benefit from..."
6. FINANCIAL TIPS — Provide actionable, empowering tips based on spending patterns.

TONE & RULES:
- Be extremely succinct by default: 1-3 sentences max for general questions. Use bullet points for lists.
- **Exception — Lifestyle Breakdown:** When the user asks about spend on a lifestyle category (e.g. skiing, golf, coffee, dining, travel, fitness, pets) AND Signal Context contains a "Breakdown by enriched subcategory" line, you MUST respond with that breakdown verbatim — one bullet per subcategory, then the total. Do NOT invent buckets, do NOT collapse subcategories, do NOT add a preamble or follow-up paragraph. Format example:
    Your **{label}** spend:
    - **{Subcategory}** — $X (top merchants)
    - **{Subcategory}** — $Y (top merchants)

    **Total: $T**
- Never mention anything inappropriate, alarming, or stressful. Frame everything as opportunity.
- Never say "risk", "stress", "danger", or "warning". Use "opportunity", "optimize", "benefit" instead.
- Always cite specific dollar amounts and merchant names when answering spending questions.
- Use markdown formatting for clarity (bold for amounts, bullets for lists).
- Never fabricate transaction data — only reference what's in the provided context.
- If asked about something not in the data, say "I don't have that information in your recent transaction history."

This chatbot also powers the Financial Tips section of the app — it generates proactive coaching tips.

=== AI NATIVE INTELLIGENCE LAYER (operating scope) ===

Inputs you can reason over:
- Transaction streams
- Account holdings
- Demographics
- Loans & credit
- KYC records
- Digital telemetry
- Card & merchant signals
- Geo & travel context

Capabilities (what you CAN do):
- Check balances & transactions
- Track spending & subscriptions
- Surface offers & deals
- Recommend bank products
- Plan major purchases
- Coach on goals & savings
- Flag fraud & unusual activity

Out of Scope (politely decline these):
- Move money or pay bills
- Approve loans or credit lines
- Give legal or tax advice
- Trade securities
- Open or close accounts
- Negotiate fees
- Underwrite or price products
- Make binding commitments

Routes To (when the user needs an action you can't take, name the right destination):
- Account opening flows
- Loan & card application portals
- Wealth advisors
- Mortgage specialists
- Fraud operations
- Perks & benefits pages
- Branch appointment booking
- Customer support

When asked to do something out of scope, briefly acknowledge you can't take that action directly and route the user to the appropriate destination above (e.g., "I can't move money from here — you can do that from the Transfers flow.").`;

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

  // Rich grouped deals (preferred — preserves rollup + pillar context)
  if (context.dealGroups && context.dealGroups.length > 0) {
    prompt += `\nPERSONALIZED DEALS (grouped by behavioral collection):\n`;
    for (const g of context.dealGroups) {
      prompt += `\n● ${g.rollupLabel} (${g.pillar} pillar)`;
      if (g.collectionMessage) prompt += ` — ${g.collectionMessage}`;
      prompt += `\n`;
      for (const d of g.deals) {
        prompt += `  - ${d.merchant} [${d.product}] (${d.type}): ${d.message}`;
        if (d.rewardValue) prompt += ` — Reward: ${d.rewardValue}`;
        prompt += `\n`;
      }
    }
  } else if (context.deals && context.deals.length > 0) {
    prompt += `\nPERSONALIZED DEALS:\n`;
    for (const d of context.deals.slice(0, 5)) {
      prompt += `- ${d.brand}: ${d.offer} (${d.match}% match)\n`;
    }
  }

  if (context.productRecommendations && context.productRecommendations.length > 0) {
    prompt += `\nPRODUCT RECOMMENDATIONS (pre-generated for this customer):\n`;
    for (const p of context.productRecommendations) {
      prompt += `\n● ${p.productName} (${p.type === "life_event" ? "Life Event" : "Behavioral"} — ${p.theme})\n`;
      if (p.signal) prompt += `  Triggered by: ${p.signal}\n`;
      if (p.quote) prompt += `  Insight: "${p.quote}"\n`;
      if (p.headline) prompt += `  Headline: ${p.headline}\n`;
      if (p.benefits?.length) prompt += `  Benefits: ${p.benefits.join("; ")}\n`;
      if (p.eligibility) prompt += `  Eligibility: ${p.eligibility}\n`;
      if (p.cta) prompt += `  CTA: ${p.cta}\n`;
    }
  }

  // Financial tip mode extras
  if (context.tipCategory) {
    prompt += `\nFINANCIAL TIP CONTEXT:\n`;
    prompt += `- Tip Category: ${context.tipCategory}\n`;
    if (context.tipMessage) prompt += `- Original Tip: ${context.tipMessage}\n`;
    if (context.customerResponse) prompt += `- Customer Response Type: ${context.customerResponse}\n`;
  }

  // Hidden signal context attached to a specific user question (e.g. lifestyle pill click).
  // Provides ground-truth aggregates the user did not type out loud.
  if (context.signalContext) {
    prompt += `\n## Signal Context (ground-truth aggregates for the user's current question — use these exact figures, do not recompute)\n${context.signalContext}\n`;
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

    const { message, conversationHistory = [], context = {}, kind = "general", bankContext = null } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isFinancialTipMode = context.mode === "financial-tip-chat";
    const baseSystemPrompt = isFinancialTipMode
      ? FINANCIAL_TIP_SYSTEM_PROMPT
      : CONSUMER_SYSTEM_PROMPT;

    // Kind-specific guidance for the 2 follow-up action button labels
    const kindGuidance: Record<string, string> = {
      lifestyle: `The user clicked a LIFESTYLE/SHOPPING-PATTERN signal. The 2 action labels should be navigational shortcuts inside the banking app, e.g. "Go to Account Profile", "Go to Deals", "View Spending", "See Merchants".`,
      lifeEvent: `The user clicked a LIFE-EVENT signal. The 2 action labels should be product/advisor calls-to-action, e.g. "Apply Today", "See Details", "Talk to Advisor", "Learn More".`,
      risk: `The user clicked a RISK/ALERT signal. The 2 action labels should be safety-oriented, e.g. "Report This Transaction", "This Is Fine", "Freeze Card", "Contact Support".`,
      general: `The user asked a general question. The 2 action labels should be helpful generic follow-ups, e.g. "Tell Me More", "Got It", "Show Examples", "What's Next?".`,
    };
    const followupGuidance = `\n\n=== FOLLOW-UP ACTIONS ===\nAfter your reply, you MUST also propose exactly 2 short follow-up action button labels (each ≤4 words, Title Case, no punctuation). ${kindGuidance[kind] || kindGuidance.general} Return BOTH the message and the 2 action labels via the respond_with_actions tool.`;

    // Bank customization prefix — when set, the assistant speaks as that bank's assistant.
    const bankName = bankContext && typeof bankContext.bankName === "string" ? bankContext.bankName.trim().slice(0, 80) : "";
    const bankShort = bankContext && typeof bankContext.bankShortName === "string" ? bankContext.bankShortName.trim().slice(0, 40) : "";
    const bankWebsite = bankContext && typeof bankContext.website === "string" ? bankContext.website.trim().slice(0, 200) : "";
    const bankPrefix = bankName
      ? `\n\n=== BANK IDENTITY ===\nYou are the AI banking assistant for ${bankName}${bankShort ? ` ("${bankShort}")` : ""}. When referring to the bank, say "${bankName}" or "${bankShort || bankName}" — never "your bank" or a generic placeholder. Frame product recommendations as ${bankName} products where appropriate.${bankWebsite ? ` Official site: ${bankWebsite} — you may reference this URL when pointing customers to bank products, account pages, or contact info.` : ""}\n`
      : "";

    const systemPrompt = bankPrefix + baseSystemPrompt + followupGuidance;

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
          max_tokens: 600,
          tools: [
            {
              type: "function",
              function: {
                name: "respond_with_actions",
                description: "Return the assistant's reply along with exactly 2 follow-up action button labels.",
                parameters: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      description: "The assistant's reply to the user (markdown allowed).",
                    },
                    actions: {
                      type: "array",
                      description: "Exactly 2 short button labels (≤4 words each).",
                      items: { type: "string" },
                      minItems: 2,
                      maxItems: 2,
                    },
                  },
                  required: ["message", "actions"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "respond_with_actions" } },
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
    const choice = data.choices?.[0]?.message;
    let aiMessage = "I'm here to help! Could you rephrase that?";
    let actions: string[] = [];

    const toolCall = choice?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        if (typeof parsed.message === "string") aiMessage = parsed.message;
        if (Array.isArray(parsed.actions)) {
          actions = parsed.actions.filter((a: any) => typeof a === "string").slice(0, 2);
        }
      } catch (e) {
        console.error("Failed to parse tool_call arguments:", e);
        if (choice?.content) aiMessage = choice.content;
      }
    } else if (choice?.content) {
      aiMessage = choice.content;
    }

    return new Response(
      JSON.stringify({ message: aiMessage, actions }),
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
