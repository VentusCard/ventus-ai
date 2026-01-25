import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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

// Enhanced Travel Detection Prompt with trip examples
const TRAVEL_DETECTION_PROMPT = `You are analyzing PRE-FILTERED transactions that were flagged as potential travel because they:
1. Have zip codes different from home (home zip: {homeZip})
2. Are travel anchors (hotels, flights, car rentals)
3. Occur within ±2 days of travel anchors AND have non-home zip codes

YOUR JOB: Identify COMPLETE TRIPS by looking at temporal and geographic clustering.

EXAMPLE TRIPS TO RECOGNIZE:

MIAMI TRIP (June 12-15, home zip 10001):
- ALAMO MIAMI (car rental, zip 33142) → Travel anchor
- SHELL MIAMI (gas, zip 33139) → Part of trip (same dates, Miami area)
- MARRIOTT SOUTH BEACH (hotel, zip 33139) → Travel anchor
- PUBLIX MIAMI (groceries, zip 33139) → Part of trip
- SOUTH BEACH RESTAURANT (dinner, zip 33139) → Part of trip
- WYNWOOD WALLS (tour, zip 33127) → Part of trip (Miami area)
- JETBLUE (return flight) → Travel anchor
ALL should be marked travel-related with destination "Miami"

VERMONT TRIP (Sept 18-21, home zip 10001):
- ENTERPRISE BURLINGTON (car rental, zip 05401) → Travel anchor
- GREEN MOUNTAIN INN (hotel, zip 05672) → Travel anchor
- SHELL VERMONT (gas, zip 05401) → Part of trip
- VERMONT GENERAL STORE (groceries, zip 05672) → Part of trip
- HIKING TRAIL CAFE (lunch, zip 05672) → Part of trip
- FALL FOLIAGE TOUR (tour, zip 05672) → Part of trip
- AMTRAK (return train, zip 05401) → Travel anchor
ALL should be marked travel-related with destination "Vermont"

LONDON TRIP (International):
- BRITISH AIRWAYS (flight) → Travel anchor
- PREMIER INN LONDON (hotel) → Travel anchor
- TESCO LONDON (groceries) → Part of trip
- LONDON RESTAURANT (dinner) → Part of trip
ALL should be marked travel-related with destination "London"

KEY INSIGHT: When you see a travel anchor (hotel, flight, car rental), look for ALL surrounding transactions in the same date range (±3 days) with non-home zip codes and mark them as part of the trip.

RULES FOR TRANSACTIONS WITH ZIP='unknown':
- Mark travel-related ONLY if obvious travel merchant (hotel, airline, car rental, airport) AND you can determine a destination
- Regular merchants (Under Armour, Starbucks, retail) with zip='unknown' → NOT travel-related
- When in doubt about location, mark as NOT travel-related

**CRITICAL RULE - NO ORPHAN TRANSACTIONS**:
If you mark is_travel_related: true, you MUST ALSO provide ALL of these:
- travel_destination (REQUIRED - must be a real city/region name, NEVER "Unknown" or empty)
- travel_period_start (REQUIRED - ISO date)
- travel_period_end (REQUIRED - ISO date)

If a standalone transaction (like a flight booking) cannot be grouped into a complete trip with a known destination, mark it as:
- is_travel_related: false
- reclassification_reason: "Standalone transaction - cannot determine trip destination"

RECLASSIFY CATEGORIES AT DESTINATION:
- Gas stations → "Travel Transportation"
- Restaurants → "Dining Away"
- Rideshares/Uber → "Local Transportation"
- Grocery/convenience stores → "Travel Essentials"

OUTPUT for each transaction:
- is_travel_related: true/false
- travel_period_start/end: ISO dates (REQUIRED if is_travel_related=true)
- travel_destination: Major city name (REQUIRED if is_travel_related=true, e.g., "Miami", "Vermont", "London")
- original_pillar: Pillar before reclassification
- reclassification_reason: Why this was marked travel/non-travel
- reclassified_pillar: New pillar (if reclassified)
- reclassified_subcategory: New subcategory (if reclassified)`;

const TRAVEL_DETECTION_TOOL = [
  {
    type: "function",
    function: {
      name: "detect_travel_patterns",
      description: "Identify travel periods and reclassify transactions within travel windows",
      parameters: {
        type: "object",
        properties: {
          travel_updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                transaction_id: { type: "string" },
                is_travel_related: { type: "boolean" },
                travel_period_start: { type: "string" },
                travel_period_end: { type: "string" },
                travel_destination: { type: "string" },
                original_pillar: { type: "string" },
                reclassified_pillar: { type: "string" },
                reclassified_subcategory: { type: "string" },
                reclassification_reason: { type: "string" },
              },
              required: ["transaction_id", "is_travel_related"],
            },
          },
        },
        required: ["travel_updates"],
      },
    },
  },
];

// Helper function to call AI with a specific model
async function callTravelDetectionAI(model: string, transactionSummary: any[], homeZip: string): Promise<any[]> {
  console.log(`[Travel Detection] Calling AI with model: ${model}`);

  // Use correct token parameter based on model type
  // OpenAI GPT-5 models require max_completion_tokens and need more tokens for reasoning
  const isOpenAI = model.startsWith("openai/");
  const tokenParam = isOpenAI
    ? { max_completion_tokens: 16000 } // Higher limit for reasoning + output
    : { max_tokens: 4000 };

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      ...tokenParam,
      messages: [
        { role: "system", content: TRAVEL_DETECTION_PROMPT.replace("{homeZip}", homeZip) },
        {
          role: "user",
          content: `Analyze these PRE-FILTERED travel candidates:\n\n${JSON.stringify(transactionSummary, null, 2)}`,
        },
      ],
      tools: TRAVEL_DETECTION_TOOL,
      tool_choice: { type: "function", function: { name: "detect_travel_patterns" } },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Travel Detection] ${model} failed (${response.status}):`, errorText);
    throw new Error(`AI API failed: ${response.status}`);
  }

  const data = await response.json();
  console.log(`[Travel Detection] ${model} raw response:`, JSON.stringify(data, null, 2));

  // Check for API errors
  const choice = data.choices?.[0];
  if (choice?.error) {
    console.error(`[Travel Detection] ${model} API error:`, choice.error);
    throw new Error(`AI API error: ${choice.error.message || "Unknown error"}`);
  }

  const toolCalls = choice?.message?.tool_calls;
  if (!toolCalls || toolCalls.length === 0) {
    console.warn(`[Travel Detection] ${model} returned no tool calls`);
    return [];
  }

  try {
    const args = toolCalls[0].function.arguments;
    const results = typeof args === "string" ? JSON.parse(args) : args;
    return results.travel_updates || [];
  } catch (parseError: any) {
    console.error(`[Travel Detection] Failed to parse ${model} response:`, parseError.message);
    return [];
  }
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions } = await req.json();

    // Input validation
    if (!Array.isArray(transactions)) {
      return new Response(JSON.stringify({ error: "Invalid input format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (transactions.length === 0) {
      return new Response(JSON.stringify({ error: "Empty transactions array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (transactions.length > 1000) {
      return new Response(JSON.stringify({ error: "Too many transactions (max 1000)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Travel Detection] Starting for ${transactions.length} pre-classified transactions`);

    // Extract home ZIP code
    const homeZip =
      transactions.find((t) => t.home_zip)?.home_zip || transactions.find((t) => t.zip_code)?.zip_code || "Unknown";

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          sendEvent("status", { message: "Analyzing travel patterns with AI..." });
          const startTime = Date.now();

          // Enhanced payload with amount and description for better context
          const transactionSummary = transactions.map((t) => ({
            id: t.transaction_id,
            date: t.date,
            merchant: t.normalized_merchant || t.merchant_name,
            description: t.description || "",
            amount: t.amount,
            pillar: t.pillar,
            zip: t.zip_code || "unknown",
          }));

          let travelUpdates: any[] = [];
          const PRIMARY_MODEL = "google/gemini-2.5-flash";
          const BACKUP_MODEL = "openai/gpt-5-mini";

          // Try primary model first
          try {
            travelUpdates = await callTravelDetectionAI(PRIMARY_MODEL, transactionSummary, homeZip);
            console.log(`[Travel Detection] Primary model returned ${travelUpdates.length} updates`);
          } catch (primaryError: any) {
            console.warn(`[Travel Detection] Primary model (${PRIMARY_MODEL}) failed:`, primaryError.message);
          }

          // Retry with backup model if primary failed or returned no results
          if (travelUpdates.length === 0) {
            console.log(`[Travel Detection] Retrying with backup model (${BACKUP_MODEL})...`);
            sendEvent("status", { message: "Retrying with backup AI model..." });

            try {
              travelUpdates = await callTravelDetectionAI(BACKUP_MODEL, transactionSummary, homeZip);
              console.log(`[Travel Detection] Backup model returned ${travelUpdates.length} updates`);
            } catch (backupError: any) {
              console.error(`[Travel Detection] Backup model (${BACKUP_MODEL}) also failed:`, backupError.message);
            }
          }

          // If both models failed, return unclassified (no keyword guessing)
          if (travelUpdates.length === 0) {
            console.warn("[Travel Detection] Both AI models failed - returning unclassified");
            travelUpdates = transactions.map((t) => ({
              transaction_id: t.transaction_id,
              is_travel_related: false,
              travel_destination: null,
              travel_period_start: null,
              travel_period_end: null,
              original_pillar: t.pillar || "Unknown",
              reclassified_pillar: t.pillar || "Unknown",
              reclassified_subcategory: t.subcategory || "Unknown",
              reclassification_reason: "AI classification unavailable - unable to determine travel status",
            }));
          }

          // Send travel updates
          sendEvent("travel_updates", { travel_updates: travelUpdates });

          // Signal completion
          const totalTime = Date.now() - startTime;
          console.log(`[Travel Detection] Completed in ${totalTime}ms`);
          sendEvent("done", { message: "Travel detection complete" });
          controller.close();
        } catch (error: any) {
          console.error("[Travel Detection] Error:", error);
          sendEvent("error", { message: "Travel detection failed" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[Travel Detection] Error:", error);
    return new Response(JSON.stringify({ error: "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
