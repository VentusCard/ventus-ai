import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Deal {
  id: string;
  merchantName: string;
  category: string;
  subcategory: string;
  dealTitle: string;
  rewardValue: string;
}

interface SearchRequest {
  query: string;
  deals: Deal[];
}

interface SearchResult {
  matchingDealIds: string[];
  reasoning: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, deals } = await req.json() as SearchRequest;

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ matchingDealIds: [], reasoning: 'Query too short' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build a concise deal summary for the AI
    const dealSummary = deals.reduce((acc, deal) => {
      if (!acc[deal.category]) {
        acc[deal.category] = [];
      }
      acc[deal.category].push({
        id: deal.id,
        merchant: deal.merchantName,
        subcategory: deal.subcategory,
        title: deal.dealTitle,
      });
      return acc;
    }, {} as Record<string, Array<{ id: string; merchant: string; subcategory: string; title: string }>>);

    const systemPrompt = `You are a semantic search assistant for a deal matching system. Given a user's search query, identify which deals from the library are semantically relevant.

Think about what the user is looking for:
- "t-shirt" → apparel stores like Nike, Gap, H&M, Nordstrom, Adidas, Old Navy, etc.
- "coffee" → coffee shops like Starbucks, Dunkin', Panera, etc.
- "gym" or "workout" → fitness stores like Nike, Lululemon, Dick's Sporting Goods, Peloton, etc.
- "vacation" → travel services like airlines, hotels, Airbnb, car rentals, etc.
- "pizza" → pizza places like Domino's, Pizza Hut, or delivery services
- "phone" or "tech" → technology stores like Apple, Best Buy, Samsung, etc.

Consider:
1. Direct matches (merchant name contains search term)
2. Category matches (search term relates to the product category)
3. Semantic matches (search term implies products the merchant sells)

Return ONLY deal IDs that are genuinely relevant. Quality over quantity.`;

    const userPrompt = `Search Query: "${query}"

Available Deals by Category:
${Object.entries(dealSummary).map(([category, categoryDeals]) => 
  `${category}:\n${categoryDeals.map(d => `  - ID: ${d.id} | ${d.merchant} (${d.subcategory}) - ${d.title}`).join('\n')}`
).join('\n\n')}

Identify deals that match the search query "${query}". Consider what products/services the user is looking for and which merchants would offer them.`;

    console.log(`Semantic search for query: "${query}"`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_matching_deals',
              description: 'Return the list of deal IDs that match the search query semantically',
              parameters: {
                type: 'object',
                properties: {
                  matchingDealIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of deal IDs that match the search query'
                  },
                  reasoning: {
                    type: 'string',
                    description: 'Brief explanation of why these deals match'
                  }
                },
                required: ['matchingDealIds', 'reasoning'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'return_matching_deals' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result: SearchResult = JSON.parse(toolCall.function.arguments);
      console.log(`Found ${result.matchingDealIds.length} matching deals for "${query}": ${result.reasoning}`);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: return empty results
    return new Response(JSON.stringify({ matchingDealIds: [], reasoning: 'No matches found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      matchingDealIds: [],
      reasoning: 'Search error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
