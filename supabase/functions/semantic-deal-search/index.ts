import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Compact deal catalog embedded server-side — client only sends query
const DEAL_CATALOG: Record<string, { id: string; merchant: string; sub: string }[]> = {
  'Food & Dining': [
    { id: 'deal-1', merchant: 'Starbucks', sub: 'Coffee & Cafes' },
    { id: 'deal-2', merchant: 'Chipotle', sub: 'Fast Casual' },
    { id: 'deal-3', merchant: 'DoorDash', sub: 'Delivery' },
    { id: 'deal-4', merchant: 'Uber Eats', sub: 'Delivery' },
    { id: 'deal-5', merchant: "McDonald's", sub: 'Fast Food' },
    { id: 'deal-6', merchant: 'Panera Bread', sub: 'Fast Casual' },
    { id: 'deal-7', merchant: 'Chick-fil-A', sub: 'Fast Food' },
    { id: 'deal-8', merchant: "Dunkin'", sub: 'Coffee & Cafes' },
    { id: 'deal-9', merchant: 'Subway', sub: 'Fast Food' },
    { id: 'deal-10', merchant: 'Grubhub', sub: 'Delivery' },
    { id: 'deal-11', merchant: 'Olive Garden', sub: 'Casual Dining' },
    { id: 'deal-12', merchant: 'Applebees', sub: 'Casual Dining' },
    { id: 'deal-13', merchant: 'Buffalo Wild Wings', sub: 'Sports Bar' },
    { id: 'deal-14', merchant: 'Taco Bell', sub: 'Fast Food' },
    { id: 'deal-15', merchant: "Wendy's", sub: 'Fast Food' },
    { id: 'deal-16', merchant: 'Dominos', sub: 'Pizza' },
    { id: 'deal-17', merchant: 'Pizza Hut', sub: 'Pizza' },
    { id: 'deal-18', merchant: 'Sweetgreen', sub: 'Healthy Fast Casual' },
    { id: 'deal-19', merchant: 'Shake Shack', sub: 'Fast Casual' },
    { id: 'deal-20', merchant: 'Noodles & Company', sub: 'Fast Casual' },
    { id: 'deal-21', merchant: 'Five Guys', sub: 'Fast Casual' },
    { id: 'deal-22', merchant: 'Instacart', sub: 'Grocery Delivery' },
    { id: 'deal-23', merchant: 'Whole Foods', sub: 'Grocery' },
    { id: 'deal-24', merchant: 'Trader Joes', sub: 'Grocery' },
    { id: 'deal-25', merchant: 'HelloFresh', sub: 'Meal Kits' },
  ],
  'Travel & Exploration': [
    { id: 'deal-26', merchant: 'Delta Airlines', sub: 'Airlines' },
    { id: 'deal-27', merchant: 'United Airlines', sub: 'Airlines' },
    { id: 'deal-28', merchant: 'American Airlines', sub: 'Airlines' },
    { id: 'deal-29', merchant: 'Southwest Airlines', sub: 'Airlines' },
    { id: 'deal-30', merchant: 'Marriott', sub: 'Hotels' },
    { id: 'deal-31', merchant: 'Hilton', sub: 'Hotels' },
    { id: 'deal-32', merchant: 'Hyatt', sub: 'Hotels' },
    { id: 'deal-33', merchant: 'Airbnb', sub: 'Vacation Rentals' },
    { id: 'deal-34', merchant: 'VRBO', sub: 'Vacation Rentals' },
    { id: 'deal-35', merchant: 'Hertz', sub: 'Car Rental' },
    { id: 'deal-36', merchant: 'Enterprise', sub: 'Car Rental' },
    { id: 'deal-37', merchant: 'Expedia', sub: 'Travel Booking' },
    { id: 'deal-38', merchant: 'Booking.com', sub: 'Travel Booking' },
    { id: 'deal-39', merchant: 'Kayak', sub: 'Travel Booking' },
    { id: 'deal-40', merchant: 'Uber', sub: 'Rideshare' },
    { id: 'deal-41', merchant: 'Lyft', sub: 'Rideshare' },
    { id: 'deal-42', merchant: 'Carnival Cruise', sub: 'Cruises' },
    { id: 'deal-43', merchant: 'Royal Caribbean', sub: 'Cruises' },
    { id: 'deal-44', merchant: 'TSA PreCheck', sub: 'Travel Services' },
    { id: 'deal-45', merchant: 'Global Entry', sub: 'Travel Services' },
  ],
  'Style & Beauty': [
    { id: 'deal-46', merchant: 'Sephora', sub: 'Beauty' },
    { id: 'deal-47', merchant: 'ULTA', sub: 'Beauty' },
    { id: 'deal-48', merchant: 'Nordstrom', sub: 'Department Store' },
    { id: 'deal-49', merchant: 'Nike', sub: 'Athletic Wear' },
    { id: 'deal-50', merchant: 'Lululemon', sub: 'Athletic Wear' },
    { id: 'deal-51', merchant: 'H&M', sub: 'Fast Fashion' },
    { id: 'deal-52', merchant: 'Zara', sub: 'Fast Fashion' },
    { id: 'deal-53', merchant: 'Foot Locker', sub: 'Footwear' },
    { id: 'deal-54', merchant: 'Adidas', sub: 'Athletic Wear' },
    { id: 'deal-55', merchant: 'Gap', sub: 'Casual Wear' },
    { id: 'deal-56', merchant: 'Old Navy', sub: 'Family Fashion' },
    { id: 'deal-57', merchant: 'Macys', sub: 'Department Store' },
    { id: 'deal-58', merchant: 'Bloomingdales', sub: 'Department Store' },
    { id: 'deal-59', merchant: 'Anthropologie', sub: 'Lifestyle' },
    { id: 'deal-60', merchant: 'Urban Outfitters', sub: 'Lifestyle' },
    { id: 'deal-61', merchant: 'Glossier', sub: 'Beauty' },
    { id: 'deal-62', merchant: 'Warby Parker', sub: 'Eyewear' },
    { id: 'deal-63', merchant: 'Ray-Ban', sub: 'Eyewear' },
  ],
  'Home & Living': [
    { id: 'deal-64', merchant: 'Home Depot', sub: 'Home Improvement' },
    { id: 'deal-65', merchant: 'Lowes', sub: 'Home Improvement' },
    { id: 'deal-66', merchant: 'Wayfair', sub: 'Furniture' },
    { id: 'deal-67', merchant: 'IKEA', sub: 'Furniture' },
    { id: 'deal-68', merchant: 'Bed Bath & Beyond', sub: 'Home Goods' },
    { id: 'deal-69', merchant: 'Williams-Sonoma', sub: 'Kitchen' },
    { id: 'deal-70', merchant: 'Crate & Barrel', sub: 'Furniture' },
    { id: 'deal-71', merchant: 'West Elm', sub: 'Furniture' },
    { id: 'deal-72', merchant: 'Pottery Barn', sub: 'Furniture' },
    { id: 'deal-73', merchant: 'Restoration Hardware', sub: 'Luxury Home' },
    { id: 'deal-74', merchant: 'Overstock', sub: 'Home Goods' },
    { id: 'deal-75', merchant: 'Ace Hardware', sub: 'Hardware' },
    { id: 'deal-76', merchant: 'Sherwin-Williams', sub: 'Paint' },
    { id: 'deal-77', merchant: 'Casper', sub: 'Mattress' },
    { id: 'deal-78', merchant: 'Purple', sub: 'Mattress' },
    { id: 'deal-79', merchant: 'Dyson', sub: 'Home Appliances' },
  ],
  'Entertainment & Culture': [
    { id: 'deal-80', merchant: 'Spotify', sub: 'Music Streaming' },
    { id: 'deal-81', merchant: 'Netflix', sub: 'Video Streaming' },
    { id: 'deal-82', merchant: 'Disney+', sub: 'Video Streaming' },
    { id: 'deal-83', merchant: 'Hulu', sub: 'Video Streaming' },
    { id: 'deal-84', merchant: 'HBO Max', sub: 'Video Streaming' },
    { id: 'deal-85', merchant: 'AMC Theatres', sub: 'Movie Theaters' },
    { id: 'deal-86', merchant: 'Regal Cinemas', sub: 'Movie Theaters' },
    { id: 'deal-87', merchant: 'Ticketmaster', sub: 'Events' },
    { id: 'deal-88', merchant: 'StubHub', sub: 'Events' },
    { id: 'deal-89', merchant: 'Audible', sub: 'Audiobooks' },
    { id: 'deal-90', merchant: 'Apple Music', sub: 'Music Streaming' },
    { id: 'deal-91', merchant: 'YouTube Premium', sub: 'Video Streaming' },
    { id: 'deal-92', merchant: 'Barnes & Noble', sub: 'Books' },
    { id: 'deal-93', merchant: 'GameStop', sub: 'Gaming' },
    { id: 'deal-94', merchant: 'PlayStation Store', sub: 'Gaming' },
    { id: 'deal-95', merchant: 'Xbox Store', sub: 'Gaming' },
  ],
  'Health & Wellness': [
    { id: 'deal-96', merchant: 'Equinox', sub: 'Gym' },
    { id: 'deal-97', merchant: 'Planet Fitness', sub: 'Gym' },
    { id: 'deal-98', merchant: 'CVS', sub: 'Pharmacy' },
    { id: 'deal-99', merchant: 'Walgreens', sub: 'Pharmacy' },
    { id: 'deal-100', merchant: 'Peloton', sub: 'Fitness Equipment' },
    { id: 'deal-101', merchant: 'GNC', sub: 'Supplements' },
    { id: 'deal-102', merchant: 'Vitamin Shoppe', sub: 'Supplements' },
    { id: 'deal-103', merchant: 'Orangetheory', sub: 'Fitness Classes' },
    { id: 'deal-104', merchant: 'SoulCycle', sub: 'Fitness Classes' },
    { id: 'deal-105', merchant: 'Calm', sub: 'Mental Wellness' },
    { id: 'deal-106', merchant: 'Headspace', sub: 'Mental Wellness' },
    { id: 'deal-107', merchant: 'Massage Envy', sub: 'Spa' },
    { id: 'deal-108', merchant: 'Rite Aid', sub: 'Pharmacy' },
    { id: 'deal-109', merchant: '1-800 Contacts', sub: 'Vision' },
    { id: 'deal-110', merchant: 'Noom', sub: 'Weight Loss' },
    { id: 'deal-111', merchant: 'ClassPass', sub: 'Fitness Classes' },
    { id: 'deal-112', merchant: 'Fitbit', sub: 'Wearables' },
    { id: 'deal-113', merchant: 'Whoop', sub: 'Wearables' },
  ],
  'Sports & Active Living': [
    { id: 'deal-114', merchant: "Dick's Sporting Goods", sub: 'Sporting Goods' },
    { id: 'deal-115', merchant: 'REI', sub: 'Outdoor Gear' },
    { id: 'deal-116', merchant: 'Golf Galaxy', sub: 'Golf' },
    { id: 'deal-117', merchant: 'Callaway Golf', sub: 'Golf' },
    { id: 'deal-118', merchant: 'TaylorMade', sub: 'Golf' },
    { id: 'deal-119', merchant: 'Academy Sports', sub: 'Sporting Goods' },
    { id: 'deal-120', merchant: 'Fanatics', sub: 'Sports Apparel' },
    { id: 'deal-121', merchant: 'NFL Shop', sub: 'Sports Apparel' },
    { id: 'deal-122', merchant: 'NBA Store', sub: 'Sports Apparel' },
    { id: 'deal-123', merchant: 'MLB Shop', sub: 'Sports Apparel' },
    { id: 'deal-124', merchant: 'Patagonia', sub: 'Outdoor Apparel' },
    { id: 'deal-125', merchant: 'The North Face', sub: 'Outdoor Apparel' },
    { id: 'deal-126', merchant: 'Columbia Sportswear', sub: 'Outdoor Apparel' },
    { id: 'deal-127', merchant: 'Under Armour', sub: 'Athletic Wear' },
    { id: 'deal-128', merchant: 'Yeti', sub: 'Outdoor Gear' },
    { id: 'deal-129', merchant: 'Backcountry', sub: 'Outdoor Gear' },
    { id: 'deal-130', merchant: 'Scheels', sub: 'Sporting Goods' },
    { id: 'deal-131', merchant: 'Bass Pro Shops', sub: 'Outdoor Gear' },
  ],
  'Technology & Digital Life': [
    { id: 'deal-132', merchant: 'Apple', sub: 'Electronics' },
    { id: 'deal-133', merchant: 'Best Buy', sub: 'Electronics' },
    { id: 'deal-134', merchant: 'Amazon', sub: 'E-commerce' },
    { id: 'deal-135', merchant: 'Samsung', sub: 'Electronics' },
    { id: 'deal-136', merchant: 'Microsoft', sub: 'Software' },
    { id: 'deal-137', merchant: 'Dell', sub: 'Computers' },
    { id: 'deal-138', merchant: 'HP', sub: 'Computers' },
    { id: 'deal-139', merchant: 'Bose', sub: 'Audio' },
    { id: 'deal-140', merchant: 'Sonos', sub: 'Audio' },
    { id: 'deal-141', merchant: 'Sony', sub: 'Electronics' },
    { id: 'deal-142', merchant: 'Logitech', sub: 'Accessories' },
    { id: 'deal-143', merchant: 'B&H Photo', sub: 'Photography' },
    { id: 'deal-144', merchant: 'Newegg', sub: 'Computer Parts' },
    { id: 'deal-145', merchant: 'Adobe', sub: 'Software' },
    { id: 'deal-146', merchant: 'Dropbox', sub: 'Cloud Storage' },
    { id: 'deal-147', merchant: 'AT&T', sub: 'Telecom' },
    { id: 'deal-148', merchant: 'Verizon', sub: 'Telecom' },
    { id: 'deal-149', merchant: 'T-Mobile', sub: 'Telecom' },
  ],
  'Family & Community': [
    { id: 'deal-150', merchant: 'Target', sub: 'Department Store' },
    { id: 'deal-151', merchant: 'Walmart', sub: 'Department Store' },
    { id: 'deal-152', merchant: 'Costco', sub: 'Warehouse' },
    { id: 'deal-153', merchant: "Sam's Club", sub: 'Warehouse' },
    { id: 'deal-154', merchant: 'BuyBuy Baby', sub: 'Baby' },
    { id: 'deal-155', merchant: "Carter's", sub: 'Kids Clothing' },
    { id: 'deal-156', merchant: 'Gap Kids', sub: 'Kids Clothing' },
    { id: 'deal-157', merchant: 'The Childrens Place', sub: 'Kids Clothing' },
    { id: 'deal-158', merchant: 'LEGO', sub: 'Toys' },
    { id: 'deal-159', merchant: 'Disney Store', sub: 'Entertainment' },
    { id: 'deal-160', merchant: 'Build-A-Bear', sub: 'Toys' },
    { id: 'deal-161', merchant: 'Pottery Barn Kids', sub: 'Kids Home' },
    { id: 'deal-162', merchant: 'American Girl', sub: 'Toys' },
    { id: 'deal-163', merchant: 'Party City', sub: 'Party Supplies' },
    { id: 'deal-164', merchant: 'Hallmark', sub: 'Cards & Gifts' },
    { id: 'deal-165', merchant: '1-800-Flowers', sub: 'Flowers' },
  ],
  'Pets': [
    { id: 'deal-166', merchant: 'Chewy', sub: 'Pet Supplies' },
    { id: 'deal-167', merchant: 'PetSmart', sub: 'Pet Supplies' },
    { id: 'deal-168', merchant: 'Petco', sub: 'Pet Supplies' },
    { id: 'deal-169', merchant: 'BarkBox', sub: 'Pet Subscription' },
    { id: 'deal-170', merchant: 'Rover', sub: 'Pet Services' },
    { id: 'deal-171', merchant: 'Wag', sub: 'Pet Services' },
    { id: 'deal-172', merchant: 'Wisdom Panel', sub: 'Pet Health' },
    { id: 'deal-173', merchant: 'Embark', sub: 'Pet Health' },
    { id: 'deal-174', merchant: 'Furbo', sub: 'Pet Tech' },
    { id: 'deal-175', merchant: 'Fi Collar', sub: 'Pet Tech' },
    { id: 'deal-176', merchant: 'Nom Nom', sub: 'Pet Food' },
    { id: 'deal-177', merchant: "The Farmer's Dog", sub: 'Pet Food' },
    { id: 'deal-178', merchant: 'Petplan', sub: 'Pet Insurance' },
    { id: 'deal-179', merchant: 'Healthy Paws', sub: 'Pet Insurance' },
    { id: 'deal-180', merchant: 'Wild One', sub: 'Pet Accessories' },
  ],
  'Financial & Aspirational': [
    { id: 'deal-181', merchant: 'TurboTax', sub: 'Tax Services' },
    { id: 'deal-182', merchant: 'H&R Block', sub: 'Tax Services' },
    { id: 'deal-183', merchant: 'Credit Karma', sub: 'Credit Services' },
    { id: 'deal-184', merchant: 'Personal Capital', sub: 'Wealth Management' },
    { id: 'deal-185', merchant: 'Mint', sub: 'Budgeting' },
    { id: 'deal-186', merchant: 'Acorns', sub: 'Investing' },
    { id: 'deal-187', merchant: 'Robinhood', sub: 'Investing' },
    { id: 'deal-188', merchant: 'Wealthfront', sub: 'Investing' },
    { id: 'deal-189', merchant: 'LegalZoom', sub: 'Legal Services' },
    { id: 'deal-190', merchant: 'LifeLock', sub: 'Identity Protection' },
  ],
  'Automotive': [
    { id: 'deal-191', merchant: 'Shell', sub: 'Gas Stations' },
    { id: 'deal-192', merchant: 'Exxon Mobil', sub: 'Gas Stations' },
    { id: 'deal-193', merchant: 'BP', sub: 'Gas Stations' },
    { id: 'deal-194', merchant: 'Chevron', sub: 'Gas Stations' },
    { id: 'deal-195', merchant: 'AutoZone', sub: 'Auto Parts' },
    { id: 'deal-196', merchant: "O'Reilly Auto Parts", sub: 'Auto Parts' },
    { id: 'deal-197', merchant: 'Advance Auto Parts', sub: 'Auto Parts' },
    { id: 'deal-198', merchant: 'Jiffy Lube', sub: 'Auto Service' },
    { id: 'deal-199', merchant: 'Firestone', sub: 'Tires' },
    { id: 'deal-200', merchant: 'Discount Tire', sub: 'Tires' },
  ],
};

interface SearchResult {
  matchingDealIds: string[];
  reasoning: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json() as { query: string };

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({ matchingDealIds: [], reasoning: 'Query too short' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const catalogPrompt = Object.entries(DEAL_CATALOG).map(([cat, deals]) =>
      `${cat}:\n${deals.map(d => `  - ${d.id} | ${d.merchant} (${d.sub})`).join('\n')}`
    ).join('\n\n');

    const systemPrompt = `You are a precision semantic deal search assistant. Given a query, return matching deal IDs where the merchant is a credible place to buy the item, service, accessory, or consumable implied by the query.

Match using PURCHASE INTENT first:
1. DIRECT SELLERS: merchants that clearly sell the queried item or service category.
2. RELEVANT GENERAL RETAILERS: Target, Walmart, Costco, Sam's Club, Amazon, Best Buy, and similar stores only when they plausibly stock the queried product.
3. COMPLEMENTARY SELLERS: merchants that sell necessary accessories, refills, parts, or consumables for the queried product only when the connection is explicit in your reasoning.

Do NOT match by loose brand association. Exclude substitute-category merchants: places where a customer would consume the outcome instead of buying the product. Examples: cafes are substitutes for home coffee equipment; streaming services are substitutes for TVs; rideshare is a substitute for car ownership; restaurants are substitutes for cookware.

Return a focused set, usually 5-15 IDs. Prefer precision over breadth. If a merchant is only weakly related, omit it.

Examples:
- "coffee machine" → Williams-Sonoma, Bed Bath & Beyond, Crate & Barrel, Dyson, Amazon, Target, Walmart, Costco, Best Buy. Exclude Starbucks and Dunkin' unless the query asks for coffee beans, pods, drinks, or cafe rewards; they are not coffee-machine sellers.
- "new TV" → Best Buy, Amazon, Walmart, Target, Costco, Samsung, Sony. Exclude Netflix, Hulu, Disney+, HBO Max, and YouTube Premium because they are streaming substitutes, not TV sellers.
- "running shoes" → Nike, Adidas, Under Armour, Foot Locker, Dick's Sporting Goods, REI, Nordstrom, Macys, Amazon, Target.
- "birthday gift" → Target, Walmart, Amazon, Nordstrom, 1-800-Flowers, Hallmark, Party City, Disney Store, LEGO, Build-A-Bear.
- "healthy food" → Whole Foods, Trader Joes, Sweetgreen, HelloFresh, Instacart. Add GNC/Vitamin Shoppe only when the query implies supplements or nutrition products.`;

    const userPrompt = `Query: "${query}"\n\nDeals:\n${catalogPrompt}\n\nReturn matching deal IDs for "${query}".`;

    console.log(`Semantic search for query: "${query}"`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-lite',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'return_matching_deals',
              description: 'Return matching deal IDs',
              parameters: {
                type: 'object',
                properties: {
                  matchingDealIds: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of matching deal IDs'
                  },
                  reasoning: {
                    type: 'string',
                    description: 'Brief explanation'
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

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result: SearchResult = JSON.parse(toolCall.function.arguments);
      console.log(`Found ${result.matchingDealIds.length} matches for "${query}": ${result.reasoning}`);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
