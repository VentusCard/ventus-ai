import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const LIFESTYLE_SIGNAL_TOOL = {
  type: "function",
  function: {
    name: "detect_lifestyle_signals",
    description: "Detect life events and generate financial recommendations based on transaction patterns",
    parameters: {
      type: "object",
      properties: {
        detected_events: {
          type: "array",
          items: {
            type: "object",
            properties: {
              event_name: { 
                type: "string",
                description: "Specific name of the detected event. For standout transactions, prefix with: '[URGENT]' for concerns, '[OPPORTUNITY]' for positive signals, '[NOTABLE]' for major purchases"
              },
              confidence: { 
                type: "number", 
                minimum: 0, 
                maximum: 100,
                description: "Confidence score based on evidence strength"
              },
              evidence: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    merchant: { type: "string" },
                    amount: { type: "number" },
                    date: { type: "string" },
                    relevance: { 
                      type: "string",
                      description: "Explanation of why this transaction is relevant to the detected event"
                    }
                  },
                  required: ["merchant", "amount", "date", "relevance"]
                }
              },
              talking_points: {
                type: "array",
                items: { type: "string" },
                description: "3-5 natural conversation starters for advisor"
              },
              financial_projection: {
                type: "object",
                description: "Detailed financial projection for planning this life event",
                properties: {
                  project_type: { 
                    type: "string", 
                    enum: ["education", "home", "retirement", "business", "wedding", "wealth_transfer", "liquidity_event", "family_formation", "charitable_giving", "elder_care", "other"],
                    description: "Category of the financial project"
                  },
                  estimated_start_year: { 
                    type: "number",
                    description: "When this life event will begin (year)"
                  },
                  duration_years: { 
                    type: "number",
                    description: "How many years this project will span"
                  },
                  estimated_total_cost: { 
                    type: "number",
                    description: "Total estimated cost across all years"
                  },
                  estimated_current_savings: { 
                    type: "number",
                    description: "Estimated current savings based on transaction patterns"
                  },
                  recommended_monthly_contribution: { 
                    type: "number",
                    description: "Suggested monthly savings amount"
                  },
                  cost_breakdown: {
                    type: "array",
                    description: "Breakdown of costs by category and year",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        yearly_amounts: { 
                          type: "object",
                          description: "Amounts by year, e.g., {2026: 15000, 2027: 16000}"
                        }
                      },
                      required: ["category", "yearly_amounts"]
                    }
                  },
                  recommended_funding_sources: {
                    type: "array",
                    description: "Recommended funding strategies",
                    items: {
                      type: "object",
                      properties: {
                        type: { 
                          type: "string",
                          enum: ["529", "gifts", "taxable", "roth_ira", "utma", "loan", "savings", "home_equity", "pension", "social_security", "401k", "ira_traditional", "business_loan", "investor", "grant", "credit", "inheritance", "other"],
                          description: "Type of funding source"
                        },
                        rationale: { 
                          type: "string",
                          description: "Why this funding source is recommended"
                        },
                        suggested_annual_amount: { 
                          type: "number",
                          description: "Recommended annual contribution amount"
                        }
                      },
                      required: ["type", "rationale", "suggested_annual_amount"]
                    }
                  }
                },
                required: ["project_type", "estimated_start_year", "duration_years", "estimated_total_cost", "cost_breakdown", "recommended_funding_sources"]
              }
            },
            required: ["event_name", "confidence", "evidence", "talking_points"]
          }
        }
      },
      required: ["detected_events"]
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { client, transactions, spending_summary } = await req.json();

    console.log('Analyzing lifestyle signals for client:', client.name);
    console.log('Transaction count:', transactions.length);

    // Sort by date (most recent first) to prioritize recent life events
    const sortedTransactions = [...transactions].sort((a: any, b: any) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });

    console.log('Top 10 transactions by date:', 
      sortedTransactions.slice(0, 10).map((t: any) => `${t.date}: ${t.merchant_name || t.merchant}`));

    // Build dynamic prompt based on transaction data
    const transactionSummary = sortedTransactions
      .slice(0, 75) // Increased from 50 to catch more life event clusters
      .map((t: any) => `- ${t.merchant_name || t.merchant}: $${t.amount} (${t.pillar || t.category || 'Unknown'}, ${t.subcategory || ''}) on ${t.date}`)
      .join('\n');

    const systemPrompt = `You are a wealth management AI advisor analyzing client transaction patterns to detect life events with wealth management implications.

## DETECTION METHODOLOGY

### 1. SEMANTIC MERCHANT ANALYSIS
Scan merchant names for keywords that indicate specific life stages (education, baby, wedding, home, business, elder care, career, legal, insurance, investment).

### 2. PATTERN RECOGNITION
Look for clusters of 3+ related transactions within 30 days that together tell a coherent story about a life event.

### 3. AMOUNT ANOMALY DETECTION
Flag transactions that are 3x+ above typical spend, first-time activity in new categories >$500, or large one-time payments >$2000.

### 4. CONFIDENCE SCORING
- 3 related transactions = 70-75% confidence
- 4-5 related transactions = 80-85% confidence  
- 6+ related transactions = 90-95% confidence
- High-value (>$2000), recent (last 30 days), or keyword matches add +5-10%

## CRITICAL: EVIDENCE INCLUSION PRINCIPLES

For EACH transaction you consider including as evidence, you MUST apply these reasoning tests:

### CAUSALITY TEST
Ask: "Is this transaction a DIRECT cause or effect of the life event?"
- ✅ INCLUDE: "STANFORD VISITOR PARKING" → Directly caused by visiting Stanford campus
- ✅ INCLUDE: "KAPLAN TEST PREP" → Direct preparation for college admission
- ❌ EXCLUDE: "DELTA AIR LINES" → Could be for vacation, business, family visit, or anything else
- ❌ EXCLUDE: "MARRIOTT HOTEL" → Generic travel with no inherent connection to any specific event

### SPECIFICITY TEST  
Ask: "Does the merchant name contain SPECIFIC context linking it to this event?"
- ✅ INCLUDE: Merchant contains university/campus/institution name explicitly
- ✅ INCLUDE: Merchant is PURPOSE-BUILT for this life stage (baby store, test prep center, wedding venue)
- ❌ EXCLUDE: Generic service providers (airlines, hotels, restaurants, gas stations) without event-specific context in the name

### REASONABLE PERSON TEST
Ask: "Would an objective, skeptical observer AGREE this transaction proves the event?"
- If you have to "assume", "infer", or "guess" a connection → EXCLUDE
- If the transaction could plausibly be for 3+ unrelated purposes → EXCLUDE
- When in doubt → EXCLUDE. Fewer strong evidence items beat many weak ones.

### RELEVANCE JUSTIFICATION REQUIREMENT
For every evidence transaction you include, you MUST be able to complete this sentence:
"This transaction is evidence of [EVENT] because [DIRECT CAUSAL EXPLANATION]"

BAD: "Delta Airlines is evidence of college prep because the client might have flown to visit a campus"
GOOD: "Stanford Visitor Parking is evidence of college prep because it's a payment directly to Stanford's campus parking system during a college visit"

## FINAL EVIDENCE QUALITY CHECK

Before finalizing each detected event, review your evidence list:
1. Remove any transaction where the connection requires speculation about intent
2. Remove generic travel (airlines, hotels, car rentals) unless the merchant name explicitly contains the destination/purpose
3. Ask: "If I showed only this evidence to an advisor, would they immediately understand why each transaction matters?"

PRECISION OVER RECALL: Missing a weak signal is acceptable. Including irrelevant transactions damages advisor trust.

## WEALTH MANAGEMENT PRODUCT MAPPING
Match detected events to appropriate financial products:

| Life Event | Products | Urgency |
|------------|----------|---------|
| College-bound child | 529 Plan optimization, financial aid strategy, FAFSA prep | 1-4 years |
| New baby expected | 529 Plan setup, life insurance, will/trust, guardian designation | Immediate |
| Wedding/Engagement | Joint financial planning, beneficiary updates, prenup discussion | 6-18 months |
| Home purchase | Mortgage optimization, down payment strategy, homeowner's insurance | 3-6 months |
| Job change + equity | 401k rollover, stock option timing, tax planning, RSU strategy | Immediate |
| Business formation | SEP-IRA, Solo 401k, business succession, liability insurance | 1-2 years |
| Aging parent care | Long-term care insurance, POA, inheritance planning, Medicaid | Varies |
| Empty nest | Downsizing strategy, accelerated retirement savings, estate updates | 2-5 years |
| Inheritance/windfall | Tax planning, trust considerations, philanthropy, debt payoff | Immediate |

## TYPE 2: STANDOUT TRANSACTION SIGNALS
Individual notable transactions as their own events:

🔴 CONCERNING (prefix "[URGENT]"): Gambling, payday loans, crypto losses, unusual withdrawals
🟡 MAJOR PURCHASES (prefix "[NOTABLE]"): 3x+ above typical, vehicles, luxury items, renovations
🟢 POSITIVE (prefix "[OPPORTUNITY]"): Large deposits, investment contributions, debt payoffs

## OUTPUT REQUIREMENTS
- Event names should be specific: "College Preparation for Child" not "Education"
- Include ONLY transactions that pass ALL three evidence tests (causality, specificity, reasonable person)
- For each evidence item, the "relevance" field MUST explain the DIRECT causal connection
- Talking points: 3-5 natural, empathetic conversation starters
- Financial projections with realistic market-rate estimates
- Funding sources matched to event type from the product mapping`;


    const userPrompt = `Analyze this client's transaction patterns and detect life events:

CLIENT PROFILE:
- Name: ${client.name}
- Age: ${client.age || 'Unknown'}
- Occupation: ${client.occupation || 'Unknown'}
- Family Status: ${client.family_status || 'Unknown'}

RECENT TRANSACTIONS (Last 3-6 months):
${transactionSummary}

SPENDING TRENDS:
- Total Spend: $${spending_summary?.total_spend || 0}
- Top Categories: ${spending_summary?.top_categories?.join(', ') || 'N/A'}

Analyze these patterns and detect any significant life events. Use the provided tool to structure your response.`;

    // Call Lovable AI with tool calling
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [LIFESTYLE_SIGNAL_TOOL],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI gateway error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      console.log('No tool call found, returning empty events');
      return new Response(
        JSON.stringify({ detected_events: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiInsights = JSON.parse(toolCall.function.arguments);
    console.log('Detected events:', aiInsights.detected_events.length);

    return new Response(
      JSON.stringify(aiInsights),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-lifestyle-signals:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        detected_events: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
