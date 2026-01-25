import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const CATEGORY_PROMPTS: Record<string, string> = {
  artCulture: "arts, culture, museums, theaters, symphony orchestras, galleries, and cultural institutions",
  entertainment: "entertainment venues, sports stadiums, arenas, fitness centers, gyms, and recreation facilities",
  dining: "restaurants, dining establishments, bars, cafes, and food venues",
  shopping: "shopping districts, malls, boutiques, markets, and retail areas",
  travelMobility: "airports, transportation hubs, tourist attractions, landmarks, and transit services",
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { city, category } = await req.json();

    // Input validation
    if (!city || typeof city !== "string" || city.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid city parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!category || typeof category !== "string" || category.length > 50) {
      return new Response(JSON.stringify({ error: "Invalid category parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const categoryDescription = CATEGORY_PROMPTS[category] || "local venues and services";

    const prompt = `Generate 3 realistic, well-known ${categoryDescription} in ${city}. 
    
Return ONLY a JSON array with this exact structure:
[
  {"type": "deal type description", "merchantExample": "actual venue name(s)"},
  {"type": "deal type description", "merchantExample": "actual venue name(s)"},
  {"type": "deal type description", "merchantExample": "actual venue name(s)"}
]

Requirements:
- Use real, well-known venues that actually exist in ${city}
- Be specific with venue names (e.g., "The Art Institute of Chicago", not "Art Museum")
- merchantExample can list 2-3 venues separated by commas
- type should be a short benefit description (e.g., "Free museum admission", "Pre-game dining deals")
- Return ONLY valid JSON, no markdown or extra text`;

    console.log(`[CITY DEALS] Generating for ${city} / ${category}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are a local city expert. Generate realistic venue examples for deal categories. Always return valid JSON arrays only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CITY DEALS] AI API error:`, response.status, errorText);

      // Return generic fallback on error
      return new Response(
        JSON.stringify({
          deals: [
            { type: "Local attractions", merchantExample: `${city} area venues` },
            { type: "Neighborhood favorites", merchantExample: `Popular ${city} locations` },
            { type: "City highlights", merchantExample: `${city} landmarks` },
          ],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log(`[CITY DEALS] Raw AI response:`, content);

    // Parse JSON from response (handle markdown code fences)
    let deals;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        deals = JSON.parse(jsonMatch[0]);
      } else {
        deals = JSON.parse(content);
      }
    } catch (parseError) {
      console.error(`[CITY DEALS] Parse error:`, parseError);
      // Return generic fallback
      deals = [
        { type: "Local attractions", merchantExample: `${city} area venues` },
        { type: "Neighborhood favorites", merchantExample: `Popular ${city} locations` },
        { type: "City highlights", merchantExample: `${city} landmarks` },
      ];
    }

    console.log(`[CITY DEALS] Generated ${deals.length} deals for ${city}/${category}`);

    return new Response(JSON.stringify({ deals }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("[CITY DEALS] Error:", error);
    return new Response(JSON.stringify({ error: "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
