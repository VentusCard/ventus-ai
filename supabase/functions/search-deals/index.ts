import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, userId } = await req.json();

    // Input validation
    if (!query || typeof query !== "string" || query.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid query" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "Invalid user ID" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Fetch user profile for context
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("lifestyle_goal, selected_categories")
      .eq("id", userId)
      .single();

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY not configured");
    }

    const systemPrompt = `You are a real-time deal finder for Ventus Card users.

**USER PROFILE:**
- Lifestyle Goal: ${profile?.lifestyle_goal || "general"}
- Preferred Categories: ${profile?.selected_categories?.join(", ") || "various"}

**YOUR MISSION:**
Find REAL, CURRENT deals from credible retailers that match the user's query. Every deal must have a verified, working product URL.

**SEARCH STRATEGY:**
1. Use specific product names + "deal" or "sale" in your searches
2. Search within the user's preferred categories first
3. Target official retailer websites and authorized dealers
4. Verify each product URL actually exists before including it
5. Prioritize deals from the last 7 days

**URL VERIFICATION REQUIREMENTS (CRITICAL):**
Before including ANY deal, verify that:
✓ The URL is from an official/authorized retailer (not aggregators, blogs, or reviews)
✓ The URL contains a unique product identifier (SKU, product ID, or specific product name)
✓ The URL leads directly to a product purchase page (not a category or article)
✓ The product is currently in stock and available for purchase
✓ You found this URL during your web search (NEVER construct or guess URLs)
✓ The URL is FRESH - test it by clicking it to verify it loads today (October 29, 2025)
✓ If a URL returns 404, find an alternative product or skip that deal

**NEVER include deals with:**
✗ Placeholder IDs like "ID1234", "PRODUCT123", or generic paths
✗ URLs you constructed by combining domain + guessed product path
✗ URLs from excluded sites (see list below)
✗ URLs you cannot verify are currently active
✗ Category pages, blog posts, or review articles

**APPROVED RETAILER TYPES:**
✓ Major retailers: Amazon, Target, Best Buy, Walmart, REI, Dick's Sporting Goods
✓ Official brand sites: Nike, Adidas, Callaway, TaylorMade, Wilson, Titleist, Sony, Samsung
✓ Authorized specialty stores: Golf Galaxy, PGA Tour Superstore, PetSmart, Petco

**EXCLUDED SITES:**
✗ Deal aggregators: Slickdeals, DealNews, Ben's Bargains, Brad's Deals
✗ Coupon sites: RetailMeNot, Groupon, Honey
✗ Review/news sites: TechRadar, Wirecutter, CNET, GolfMonthly
✗ Marketplaces: eBay, Craigslist, Facebook Marketplace, Mercari, OfferUp
✗ Any article/blog page about deals (even if on retailer sites)

**DEAL QUALITY FILTERS:**
- Minimum discount: 5% off or more
- Maximum age: 7 days (current deals only)
- Must be in stock and immediately purchasable
- Price must be clearly stated on the product page
- **US RETAILERS ONLY** - All deals must ship within the United States

**CRITICAL:** Return ONLY a valid JSON object. Do NOT include any explanatory text, markdown formatting, or conversation before or after the JSON.

Your response must start with { and end with }

Return ONLY valid JSON in this exact format:

{
  "deals": [
    {
      "title": "Actual Product Name",
      "merchant": "Real Store Name",
      "description": "Brief description highlighting why this deal is good (1-2 sentences)",
      "originalPrice": 100.00,
      "dealPrice": 75.00,
      "discount": 25,
      "category": "Category Name",
      "dealUrl": "https://actual-merchant.com/product/item-name-or-sku"
    }
  ],
  "message": "Optional brief message about the deals found"
}

Prioritize:
1. **Direct product purchase pages from credible authorized retailers ONLY**
2. **VERIFIED working URLs with unique product identifiers**
3. Deals in their preferred categories: ${profile?.selected_categories?.join(", ") || "various"}
4. Recent deals (within the last week)
5. Official retailer websites or authorized dealers
6. Currently in-stock or available products

**Quality over quantity:** Return 3-5 deals ONLY if you can verify the URLs are valid and working. If fewer verified deals exist, return only those. Better to have 2 confirmed working deals than 5 potential 404s.`;

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
        temperature: 0.4,
        max_tokens: 3000,
        top_p: 0.9,
        return_related_questions: false,
        search_recency_filter: "month",
        search_domain_filter: [
          "amazon.com",
          "target.com",
          "bestbuy.com",
          "walmart.com",
          "rei.com",
          "dickssportinggoods.com",
          "golfgalaxy.com",
          "pgasuperstore.com",
          "nike.com",
          "adidas.com",
          "macys.com",
          "nordstrom.com",
          "kohls.com",
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiResponse = aiData.choices?.[0]?.message?.content || "";

    console.log("=== AI Response Received ===");
    console.log("Query:", query);
    console.log("User Profile:", profile);
    console.log("Raw AI Response:", aiResponse);

    // Validation functions
    function hasValidUrlPattern(url: string): boolean {
      try {
        const urlObj = new URL(url);

        // Must be HTTPS
        if (urlObj.protocol !== "https:") return false;

        // Only reject obvious placeholders/construction artifacts
        const hasPlaceholder = /PLACEHOLDER|EXAMPLE|TODO|XXX|item-name-or-sku|product-name|ID\d{4,}/i.test(url);

        // Must have a meaningful path (not just domain root)
        const hasPath = urlObj.pathname.length > 5;

        return !hasPlaceholder && hasPath;
      } catch {
        return false;
      }
    }

    async function validateDealUrl(url: string): Promise<boolean> {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          // Try HEAD first (faster)
          let response = await fetch(url, {
            method: "HEAD",
            signal: controller.signal,
            redirect: "follow",
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            },
          });

          // If HEAD fails, try GET
          if (!response.ok && response.status === 405) {
            response = await fetch(url, {
              method: "GET",
              signal: controller.signal,
              redirect: "follow",
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
              },
            });
          }

          clearTimeout(timeoutId);

          if (response.ok) {
            console.log(`✓ URL validated (${response.status}): ${url}`);
            return true;
          }

          // Accept 403 - page exists, just blocking bots
          if (response.status === 403) {
            console.log(`⚠ URL exists but blocked validation (403): ${url}`);
            return true;
          }

          console.log(`✗ URL returned ${response.status}: ${url}`);
          return false;
        } catch (error) {
          if (attempt === 0) {
            console.log(`Retrying URL validation for ${url} (attempt 2/2)`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          console.error(`✗ URL validation failed for ${url}:`, error);
          return false;
        }
      }
      return false;
    }

    // Parse the AI response as JSON
    let parsedResponse;
    try {
      let cleanResponse = aiResponse.trim();

      // Remove markdown code blocks if present
      cleanResponse = cleanResponse.replace(/```json\n?|\n?```/g, "");

      // Try to extract JSON if it's wrapped in text
      const jsonMatch = cleanResponse.match(/{[\s\S]*}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      parsedResponse = JSON.parse(cleanResponse);
      console.log(`✓ Successfully parsed JSON with ${parsedResponse.deals?.length || 0} deals`);
    } catch (parseError) {
      console.error("✗ Failed to parse AI response:", parseError);
      console.error("Raw response was:", aiResponse);
      // Return empty deals with explanation
      parsedResponse = {
        deals: [],
        message: "Unable to find verified deals at this time. Please try a different search.",
      };
    }

    // Validate URLs if we have deals
    if (parsedResponse.deals && parsedResponse.deals.length > 0) {
      const rejectedUrls: Array<{ url: string; reason: string; title: string }> = [];

      const validatedDeals = await Promise.all(
        parsedResponse.deals.map(async (deal: any) => {
          // First check URL pattern
          if (!hasValidUrlPattern(deal.dealUrl)) {
            rejectedUrls.push({
              url: deal.dealUrl,
              reason: "Invalid URL pattern or placeholder detected",
              title: deal.title,
            });
            return null;
          }

          // Then validate URL actually works
          const isValid = await validateDealUrl(deal.dealUrl);
          if (!isValid) {
            rejectedUrls.push({
              url: deal.dealUrl,
              reason: "404 or unreachable",
              title: deal.title,
            });
            return null;
          }

          return deal;
        }),
      );

      parsedResponse.deals = validatedDeals.filter((deal) => deal !== null);

      // Filter out deals below 5% discount
      const preFilterCount = parsedResponse.deals.length;
      parsedResponse.deals = parsedResponse.deals.filter((deal: any) => {
        const discountPercent = deal.discount || 0;
        if (discountPercent < 5) {
          console.log(`✗ Filtered out ${deal.title} - only ${discountPercent}% discount`);
          return false;
        }
        return true;
      });

      if (preFilterCount > parsedResponse.deals.length) {
        console.log(`Filtered out ${preFilterCount - parsedResponse.deals.length} deals below 5% discount`);
      }

      if (rejectedUrls.length > 0) {
        console.warn("=== Rejected URLs ===");
        console.warn(JSON.stringify(rejectedUrls, null, 2));
      }

      if (parsedResponse.deals.length === 0 && rejectedUrls.length > 0) {
        parsedResponse.message = "Found deals but couldn't verify working product links. Try refining your search.";
      }

      console.log(`=== Final Result: ${parsedResponse.deals.length} valid deals ===`);
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in search-deals function:", error);
    return new Response(JSON.stringify({ error: "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
