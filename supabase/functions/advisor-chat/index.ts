import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://ventuscard.com",
  "https://ventusai.com",
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^http:\/\/localhost:\d+$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((allowed) => (typeof allowed === "string" ? allowed === origin : allowed.test(origin)));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ClientProfile {
  name: string;
  segment: string;
  aum: string;
  tenure: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  demographics: {
    age: string;
    occupation: string;
    familyStatus: string;
  };
  holdings: {
    deposit: string;
    credit: string;
    mortgage: string;
    investments: string;
  };
  holdingsChange?: {
    deposit: { percent: number; direction: "up" | "down" };
    credit: { percent: number; direction: "up" | "down" };
    mortgage: { percent: number; direction: "down" };
    investments: { percent: number; direction: "up" | "down" };
  };
  compliance: {
    kycStatus: string;
    lastReview: string;
    nextReview: string;
    riskProfile: string;
  };
  milestones: Array<{
    event: string;
    date: string;
  }>;
}

interface AdvisorContext {
  overview: {
    totalTransactions: number;
    totalSpend: number;
    dateRange: { start: string; end: string };
    avgTransactionAmount: number;
  };
  topPillars: Array<{
    pillar: string;
    totalSpend: number;
    percentage: number;
    transactionCount: number;
    topSubcategories: Array<{ name: string; spend: number }>;
  }>;
  travelAnalysis?: {
    totalTravelSpend: number;
    travelTransactions: number;
    destinations: string[];
    travelPeriods: Array<{ start: string; end: string; destination: string }>;
  };
  lifeEvents: Array<{
    event: string;
    confidence: number;
    evidenceCount: number;
    products: string[];
    keyInsights: string[];
  }>;
  topMerchants: Array<{
    merchant: string;
    totalSpend: number;
    visits: number;
    category: string;
  }>;
  sampleTransactions: Array<{
    date: string;
    merchant: string;
    amount: number;
    category: string;
    subcategory: string;
  }>;
  spendingTrends?: {
    monthlyAverage: number;
    highestSpendMonth?: string;
  };
  clientPsychology?: Array<{
    aspect: string;
    assessment: string;
    confidence: number;
    sliderValue?: number;
    actionTip?: string;
  }>;
  clientProfile?: ClientProfile;
  financialPlan?: {
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRate: number;
    currentNetWorth: number;
    goals: Array<{
      name: string;
      type: string;
      targetAmount: number;
      currentAmount: number;
      targetDate: string;
      monthlyContribution: number;
      progressPercent: number;
      timeHorizon: string;
    }>;
    retirementProfile: {
      currentAge: number;
      retirementAge: number;
      yearsToRetirement: number;
      desiredRetirementIncome: number;
      socialSecurityEstimate: number;
      currentRetirementSavings: number;
    };
    taxAdvantagedAccounts: Array<{
      type: string;
      label: string;
      currentBalance: number;
      annualContribution: number;
      maxContribution: number;
      utilizationPercent: number;
    }>;
    assetAllocation: {
      current: { stocks: number; bonds: number; cash: number; realEstate: number };
      target: { stocks: number; bonds: number; cash: number; realEstate: number };
    };
    monteCarloResults?: {
      successRate: number;
      medianOutcome: number;
      worstCase: number;
      bestCase: number;
      targetGoal: number;
    };
    rmdEstimate?: {
      clientAge: number;
      totalRMDBalance: number;
      estimatedAnnualRMD: number;
    };
  };
}

const SYSTEM_PROMPT = `You are Ventus AI, an expert wealth management advisor assistant for financial advisors at major banks and wealth management firms.

Your role is to help advisors:
- Analyze client portfolios and spending patterns
- Identify opportunities for product recommendations
- Prepare for client meetings with actionable talking points
- Understand lifestyle signals and life events
- Draft professional communications
- Suggest next best actions

You have access to comprehensive client data including:
- Complete enriched transaction history with AI categorization
- Spending breakdowns by category, subcategory, and merchant
- Travel patterns and destinations
- AI-detected life events with confidence scores
- Product recommendations based on life events
- Portfolio holdings and relationship data
- Client psychology profile (when available)
- Financial planning data: goals, retirement profile, tax-advantaged accounts
- Monte Carlo simulation results and success probability
- RMD estimates for clients approaching or in retirement
- Asset allocation current vs target with rebalancing needs
- Professional but conversational
- Extremely concise and actionable
- Always cite specific data when making recommendations (e.g., "Based on $15,234 in travel spending...")
- Focus on business impact and client value
- Be extremely brief - responses should be 50% shorter than typical AI responses
- Lead with the most important insight first
- Eliminate pleasantries and filler phrases

CRITICAL FORMATTING RULES:
- For INFORMATIONAL content (data, insights, spending breakdowns): Use regular bullets (• or -) or numbered lists (1., 2., 3.)
- For ACTIONABLE ITEMS (things the advisor should DO): ALWAYS use checkbox format: "- [ ] action item text"

Example of CORRECT formatting:
"Based on John's spending patterns:
• Total travel: $12,450 (25% of spend)
• Top merchants: Delta ($4,200), Marriott ($3,100)
• Travel frequency: 8 trips this quarter

Recommended actions:
- [ ] Discuss premium travel rewards card upgrade
- [ ] Review current credit card benefits vs spending patterns
- [ ] Schedule annual portfolio review for Q1"

The checkbox format "- [ ]" is the ONLY format that will be extracted as action items. Regular bullets and numbered lists are for information display only.

When CLIENT PSYCHOLOGY PROFILE is provided, adapt ALL responses accordingly:
- **Decision Style**: Analytical → lead with data/numbers; Intuitive → lead with big picture vision
- **Risk Tolerance**: Conservative → emphasize safety, stability, protection; Aggressive → highlight growth opportunities
- **Emotional State**: Anxious → provide reassurance first, be gentler; Confident → be more direct and bold
- **Trust Level**: Low → cite more evidence, build credibility; High → be concise, assume alignment
- **Communication Style**: Detail-oriented → thorough explanations; Big-picture → executive summaries only

Apply these psychological adaptations to every response including:
- How you phrase recommendations
- What level of detail you provide
- How you frame risks vs opportunities
- Your tone and word choice
- Meeting prep talking points and phrasing suggestions

When answering questions:
1. Reference specific numbers, dates, merchants, or categories from the data
2. Explain the "why" behind recommendations
3. Consider the client's full financial picture
4. Suggest specific next steps or actions using checkbox format (- [ ])
5. Keep responses extremely concise and under 150 words
6. When asked for a specific number of items (e.g., "5 talking points"), provide EXACTLY that many using checkbox format
7. ACTION ITEM COMMANDS: When the user message starts with action item phrases (add action item:, todo:, task:, etc.), respond with ONLY:
   "- [ ] the item text"
   No commentary or explanation - just the single checkbox item.

You are speaking to a financial advisor who needs quick, actionable insights to serve their client better.`;

function formatContextForPrompt(context: AdvisorContext): string {
  let prompt = `\n\n=== CLIENT DATA SUMMARY ===\n\n`;

  // Client Profile (if available)
  if (context.clientProfile) {
    const cp = context.clientProfile;
    prompt += `CLIENT PROFILE:\n`;
    prompt += `- Name: ${cp.name}\n`;
    prompt += `- Segment: ${cp.segment}\n`;
    prompt += `- AUM: ${cp.aum}\n`;
    prompt += `- Tenure: ${cp.tenure}\n`;
    prompt += `- Age: ${cp.demographics.age}\n`;
    prompt += `- Occupation: ${cp.demographics.occupation}\n`;
    prompt += `- Family Status: ${cp.demographics.familyStatus}\n`;
    prompt += `- Risk Profile: ${cp.compliance.riskProfile}\n`;
    prompt += `- Holdings: Deposits ${cp.holdings.deposit}, Credit ${cp.holdings.credit}, Mortgage ${cp.holdings.mortgage}, Investments ${cp.holdings.investments}\n`;
    if (cp.holdingsChange) {
      const hc = cp.holdingsChange;
      prompt += `- Holdings Changes (Recent Trend):\n`;
      prompt += `  * Deposits: ${hc.deposit.direction === "up" ? "↑" : "↓"} ${hc.deposit.percent}%\n`;
      prompt += `  * Credit Usage: ${hc.credit.direction === "up" ? "↑" : "↓"} ${hc.credit.percent}%\n`;
      prompt += `  * Mortgage: ↓ ${hc.mortgage.percent}% (paydown)\n`;
      prompt += `  * Investments: ${hc.investments.direction === "up" ? "↑" : "↓"} ${hc.investments.percent}%\n`;
    }
    prompt += `- KYC Status: ${cp.compliance.kycStatus}, Last Review: ${cp.compliance.lastReview}, Next Review: ${cp.compliance.nextReview}\n`;
    if (cp.milestones && cp.milestones.length > 0) {
      prompt += `- Recent Milestones: ${cp.milestones
        .slice(0, 3)
        .map((m) => `${m.event} (${m.date})`)
        .join(", ")}\n`;
    }
    prompt += `\n`;
  }

  // Overview (only if transaction data available)
  if (context.overview) {
    prompt += `TRANSACTION OVERVIEW:\n`;
    prompt += `- Total Transactions: ${context.overview.totalTransactions}\n`;
    prompt += `- Total Spend: $${context.overview.totalSpend.toLocaleString()}\n`;
    prompt += `- Date Range: ${context.overview.dateRange.start} to ${context.overview.dateRange.end}\n`;
    prompt += `- Avg Transaction: $${context.overview.avgTransactionAmount}\n\n`;
  }

  // Top Spending Categories (only if available)
  if (context.topPillars && context.topPillars.length > 0) {
    prompt += `TOP SPENDING CATEGORIES:\n`;
    context.topPillars.slice(0, 5).forEach((p, i) => {
      prompt += `${i + 1}. ${p.pillar}: $${p.totalSpend.toLocaleString()} (${p.percentage}%, ${p.transactionCount} transactions)\n`;
      if (p.topSubcategories.length > 0) {
        prompt += `   Top subcategories: ${p.topSubcategories.map((s) => `${s.name} ($${s.spend.toLocaleString()})`).join(", ")}\n`;
      }
    });
    prompt += `\n`;
  }

  // Travel Analysis
  if (context.travelAnalysis && context.travelAnalysis.travelTransactions > 0) {
    prompt += `TRAVEL ANALYSIS:\n`;
    prompt += `- Total Travel Spend: $${context.travelAnalysis.totalTravelSpend.toLocaleString()}\n`;
    prompt += `- Travel Transactions: ${context.travelAnalysis.travelTransactions}\n`;
    prompt += `- Destinations: ${context.travelAnalysis.destinations.join(", ")}\n`;
    if (context.travelAnalysis.travelPeriods.length > 0) {
      prompt += `- Travel Periods:\n`;
      context.travelAnalysis.travelPeriods.forEach((period) => {
        prompt += `  * ${period.start} to ${period.end}: ${period.destination}\n`;
      });
    }
    prompt += `\n`;
  }

  // Life Events
  if (context.lifeEvents && context.lifeEvents.length > 0) {
    prompt += `AI-DETECTED LIFE EVENTS:\n`;
    context.lifeEvents.forEach((event, i) => {
      prompt += `${i + 1}. ${event.event} (${event.confidence}% confidence)\n`;
      if (event.evidenceCount) {
        prompt += `   - Evidence: ${event.evidenceCount} indicators\n`;
      }
      if (event.products && event.products.length > 0) {
        prompt += `   - Recommended Products: ${event.products.join(", ")}\n`;
      }
      if (event.keyInsights && event.keyInsights.length > 0) {
        prompt += `   - Key Insights: ${event.keyInsights.join("; ")}\n`;
      }
    });
    prompt += `\n`;
  }

  // Top Merchants
  if (context.topMerchants && context.topMerchants.length > 0) {
    prompt += `TOP MERCHANTS:\n`;
    context.topMerchants.slice(0, 10).forEach((m, i) => {
      prompt += `${i + 1}. ${m.merchant}: $${m.totalSpend.toLocaleString()} (${m.visits} visits) - ${m.category}\n`;
    });
    prompt += `\n`;
  }

  // Sample Significant Transactions
  if (context.sampleTransactions && context.sampleTransactions.length > 0) {
    prompt += `SAMPLE SIGNIFICANT TRANSACTIONS (Top 10):\n`;
    context.sampleTransactions.slice(0, 10).forEach((t, i) => {
      prompt += `${i + 1}. ${t.date} - ${t.merchant}: $${t.amount.toLocaleString()} [${t.category} - ${t.subcategory}]\n`;
    });
    prompt += `\n`;
  }

  // Spending Trends
  if (context.spendingTrends) {
    prompt += `SPENDING TRENDS:\n`;
    prompt += `- Monthly Average: $${context.spendingTrends.monthlyAverage.toLocaleString()}\n`;
    if (context.spendingTrends.highestSpendMonth) {
      prompt += `- Highest Spend Month: ${context.spendingTrends.highestSpendMonth}\n`;
    }
    prompt += `\n`;
  }

  // Client Psychology Profile
  if (context.clientPsychology && context.clientPsychology.length > 0) {
    prompt += `CLIENT PSYCHOLOGY PROFILE:\n`;
    prompt += `(Adapt ALL responses to match this client's psychological profile)\n`;
    context.clientPsychology.forEach((p) => {
      const scaleInfo = p.sliderValue ? ` (${p.sliderValue}/5 scale)` : "";
      prompt += `- ${p.aspect}: ${p.assessment}${scaleInfo}\n`;
    });
    prompt += `\nUSE THIS PROFILE TO:\n`;
    prompt += `- Tailor communication style and tone\n`;
    prompt += `- Frame recommendations based on decision style\n`;
    prompt += `- Adjust detail level per communication preferences\n`;
    prompt += `- Address concerns aligned with emotional state\n`;
    prompt += `- Provide evidence appropriate to trust level\n`;
  }

  // Financial Planning Data
  if (context.financialPlan) {
    const fp = context.financialPlan;
    prompt += `\n=== FINANCIAL PLANNING DATA ===\n`;
    prompt += `Monthly Income: $${fp.monthlyIncome.toLocaleString()}\n`;
    prompt += `Monthly Expenses: $${fp.monthlyExpenses.toLocaleString()}\n`;
    prompt += `Savings Rate: ${fp.savingsRate.toFixed(1)}%\n`;
    prompt += `Current Net Worth: $${fp.currentNetWorth.toLocaleString()}\n\n`;

    if (fp.retirementProfile) {
      const rp = fp.retirementProfile;
      prompt += `RETIREMENT PROFILE:\n`;
      prompt += `- Current Age: ${rp.currentAge}, Retirement Age: ${rp.retirementAge}\n`;
      prompt += `- Years to Retirement: ${rp.yearsToRetirement}\n`;
      prompt += `- Desired Retirement Income: $${rp.desiredRetirementIncome.toLocaleString()}/year\n`;
      prompt += `- Social Security Estimate: $${rp.socialSecurityEstimate.toLocaleString()}/year\n`;
      prompt += `- Current Retirement Savings: $${rp.currentRetirementSavings.toLocaleString()}\n\n`;
    }

    if (fp.goals && fp.goals.length > 0) {
      prompt += `FINANCIAL GOALS:\n`;
      fp.goals.forEach((g, i) => {
        prompt += `${i + 1}. ${g.name} (${g.type}, ${g.timeHorizon}): $${g.currentAmount.toLocaleString()} of $${g.targetAmount.toLocaleString()} (${g.progressPercent}%) - Target: ${g.targetDate}\n`;
      });
      prompt += `\n`;
    }

    if (fp.taxAdvantagedAccounts && fp.taxAdvantagedAccounts.length > 0) {
      prompt += `TAX-ADVANTAGED ACCOUNTS:\n`;
      fp.taxAdvantagedAccounts.forEach((a) => {
        prompt += `- ${a.label}: $${a.currentBalance.toLocaleString()} balance, $${a.annualContribution.toLocaleString()}/$${a.maxContribution.toLocaleString()} contributed (${a.utilizationPercent}% utilized)\n`;
      });
      prompt += `\n`;
    }

    if (fp.assetAllocation) {
      const curr = fp.assetAllocation.current;
      const tgt = fp.assetAllocation.target;
      prompt += `ASSET ALLOCATION:\n`;
      prompt += `- Current: Stocks ${curr.stocks}%, Bonds ${curr.bonds}%, Cash ${curr.cash}%, Real Estate ${curr.realEstate}%\n`;
      prompt += `- Target: Stocks ${tgt.stocks}%, Bonds ${tgt.bonds}%, Cash ${tgt.cash}%, Real Estate ${tgt.realEstate}%\n`;
      const needsRebalance = Math.abs(curr.stocks - tgt.stocks) > 5 || Math.abs(curr.bonds - tgt.bonds) > 5;
      if (needsRebalance) {
        prompt += `- NOTE: Portfolio needs rebalancing to match target allocation\n`;
      }
      prompt += `\n`;
    }

    if (fp.monteCarloResults) {
      const mc = fp.monteCarloResults;
      prompt += `MONTE CARLO SIMULATION RESULTS:\n`;
      prompt += `- Success Rate: ${mc.successRate.toFixed(1)}% probability of reaching $${mc.targetGoal.toLocaleString()} goal\n`;
      prompt += `- Median Outcome: $${mc.medianOutcome.toLocaleString()}\n`;
      prompt += `- Range: $${mc.worstCase.toLocaleString()} (10th %ile) to $${mc.bestCase.toLocaleString()} (90th %ile)\n`;
      if (mc.successRate < 80) {
        prompt += `- WARNING: Success rate below 80% - consider increasing contributions or adjusting goals\n`;
      }
      prompt += `\n`;
    }

    if (fp.rmdEstimate && fp.retirementProfile?.currentAge >= 70) {
      const rmd = fp.rmdEstimate;
      prompt += `RMD ESTIMATES:\n`;
      prompt += `- Client Age: ${rmd.clientAge}\n`;
      prompt += `- Total RMD-Eligible Balance: $${rmd.totalRMDBalance.toLocaleString()}\n`;
      if (rmd.estimatedAnnualRMD > 0) {
        prompt += `- Estimated Annual RMD: $${rmd.estimatedAnnualRMD.toLocaleString()}\n`;
      }
      prompt += `\n`;
    }
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

    // Input validation
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Invalid message format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 5000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build messages array
    const messages: Array<{ role: string; content: string }> = [{ role: "system", content: SYSTEM_PROMPT }];

    // Add context as system message
    if (context) {
      const contextPrompt = formatContextForPrompt(context);
      messages.push({
        role: "system",
        content: contextPrompt,
      });
    }

    // Add conversation history (last 10 messages)
    const recentHistory = (conversationHistory || []).slice(-10);
    messages.push(...recentHistory);

    // Add current user message
    messages.push({
      role: "user",
      content: message,
    });

    console.log("Calling Lovable AI with context...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
    console.error("Advisor chat error:", error);
    return new Response(JSON.stringify({ error: "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
