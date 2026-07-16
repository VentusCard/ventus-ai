/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Configuration — one-shot, no batching
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

// Models — flash primary for speed, gpt-5-mini fallback for reliability
const PRIMARY_MODEL = "google/gemini-3.5-flash";
const FALLBACK_MODEL = "openai/gpt-5-mini";

// Allowed origins for CORS
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
    ALLOWED_ORIGINS.some((allowed) => (typeof allowed === "string" ? allowed === origin : allowed.test(origin)));

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Exponential backoff with jitter
function getDelayMs(attempt: number): number {
  const baseDelay = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 0.5 * baseDelay;
  return Math.min(baseDelay + jitter, 8000);
}

// Airline keywords for flight detection
const AIRLINE_KEYWORDS = [
  "airline", "airways", "delta", "united", "southwest", "american airlines", "jetblue",
  "british airways", "air france", "lufthansa", "easyjet", "ryanair",
  "emirates", "qatar airways", "singapore airlines", "cathay", "klm", "virgin atlantic",
  "spirit", "frontier", "alaska air", "hawaiian air", "sun country",
];

// Enhanced Travel Detection Prompt
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

FLIGHT-TO-TRIP MATCHING:
When you see multiple flight/airline charges, you MUST actively assign each to a specific trip:
1. PRICE SIGNAL: International trips (Europe, Asia, Middle East) typically have fares $500+.
   Domestic US trips typically have fares $150-$400.
   Example: Two DELTA charges — $289 and $1,142. The $289 likely = domestic (Florida), $1,142 likely = international (Paris).
2. DATE PROXIMITY: Match each fare to the trip whose start date is closest to the fare's charge date.
   A fare charged on March 1 likely belongs to the trip starting March 3, not the trip starting April 15.
3. FARE PAIRS: Two similar amounts from the same airline within a trip window = round-trip pair.
   Bracket them around the trip they belong to.
4. SURPLUS FARES: If you see more flight charges than trips detected (e.g., 4 flights but only 1 trip
   for the cardholder), mark the extras as third_party_likely: true with fare_match_reason
   explaining "Fare does not match any detected trip window — likely paid for another traveler".
5. SAME-DAY BOOKINGS: If multiple flights are booked on the same day, use PRICE SIGNAL first,
   then DATE PROXIMITY to the nearest trip start, to differentiate them.

For each flight/airline transaction, you MUST set:
- fare_match_confidence: "high" (clear price/date match), "medium" (reasonable inference), or "low" (best guess)
- fare_match_reason: Brief explanation of why this fare was assigned to this trip (or flagged third-party)
- third_party_likely: true if this fare doesn't match any trip the cardholder took

OUTPUT for each transaction:
- is_travel_related: true/false
- travel_period_start/end: ISO dates (REQUIRED if is_travel_related=true)
- travel_destination: Major city name (REQUIRED if is_travel_related=true, e.g., "Miami", "Vermont", "London")
- original_pillar: Pillar before reclassification
- reclassification_reason: Why this was marked travel/non-travel
- reclassified_pillar: New pillar (if reclassified)
- reclassified_subcategory: New subcategory (if reclassified)
- fare_match_confidence: "high" | "medium" | "low" (for flight/airline transactions)
- fare_match_reason: string (for flight/airline transactions)
- third_party_likely: boolean (for flight/airline transactions where fare doesn't match cardholder's trip)`;

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
                fare_match_confidence: { type: "string", enum: ["high", "medium", "low"] },
                fare_match_reason: { type: "string" },
                third_party_likely: { type: "boolean" },
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

// Single AI call — no batching
async function callTravelDetectionAI(
  model: string,
  transactions: any[],
  homeZip: string,
  attempt: number,
): Promise<any[]> {
  const isOpenAI = model.startsWith("openai/");

  const tokenParam = isOpenAI ? { max_completion_tokens: 8000 } : { max_tokens: 8000 };

  const requestBody: any = {
    model,
    ...tokenParam,
    messages: [
      { role: "system", content: TRAVEL_DETECTION_PROMPT.replace("{homeZip}", homeZip) },
      {
        role: "user",
        content: `Analyze these ${transactions.length} PRE-FILTERED travel candidates and call detect_travel_patterns:\n\n${JSON.stringify(transactions, null, 2)}`,
      },
    ],
    tools: TRAVEL_DETECTION_TOOL,
  };

  if (isOpenAI) {
    requestBody.tool_choice = { type: "function", function: { name: "detect_travel_patterns" } };
  } else {
    requestBody.tool_choice = "auto";
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(`[Travel] ${model} failed (${response.status}): ${errorText.slice(0, 200)}`);
    return [];
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  if (choice?.finish_reason === "error" || choice?.native_finish_reason === "MALFORMED_FUNCTION_CALL") {
    console.error(`[Travel] ${model} malformed function call`);
    return [];
  }

  const toolCalls = choice?.message?.tool_calls;
  if (!toolCalls || toolCalls.length === 0) {
    const rawStr = JSON.stringify(data).slice(0, 200);
    console.warn(`[Travel] ${model} no tool calls (attempt ${attempt}): ${rawStr}`);
    return [];
  }

  try {
    const args = toolCalls[0].function.arguments;
    const results = typeof args === "string" ? JSON.parse(args) : args;
    return results.travel_updates || [];
  } catch (parseError: any) {
    console.error(`[Travel] JSON parse error: ${parseError.message}`);
    return [];
  }
}

// Process all transactions with retries and model fallback
async function processTransactions(
  transactions: any[],
  homeZip: string,
  sendEvent: (event: string, data: any) => void,
): Promise<any[]> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    const model = attempt === MAX_RETRIES ? FALLBACK_MODEL : PRIMARY_MODEL;

    if (attempt > 0) {
      const delay = getDelayMs(attempt - 1);
      console.log(`[Travel] Retry ${attempt}/${MAX_RETRIES} (delay: ${Math.round(delay)}ms, model: ${model})`);
      await new Promise((r) => setTimeout(r, delay));
    }

    sendEvent("status", {
      message: `Analyzing ${transactions.length} travel candidates${attempt > 0 ? ` (retry ${attempt})` : ""}...`,
    });

    try {
      const updates = await callTravelDetectionAI(model, transactions, homeZip, attempt);

      if (updates.length === 0) {
        console.warn(`[Travel] Empty results (attempt ${attempt}, model ${model})`);
        continue;
      }

      const elapsed = Date.now() - startTime;
      console.log(`[Travel] ✓ ${updates.length}/${transactions.length} in ${elapsed}ms (model: ${model})`);
      return updates;
    } catch (error: any) {
      console.error(`[Travel] Exception (attempt ${attempt}):`, error.message);
    }
  }

  console.error(`[Travel] All ${MAX_RETRIES + 1} attempts failed`);

  // Return fallback for complete failure
  return transactions.map((t) => ({
    transaction_id: t.id,
    is_travel_related: false,
    travel_destination: null,
    travel_period_start: null,
    travel_period_end: null,
    original_pillar: t.pillar || "Unknown",
    reclassified_pillar: t.pillar || "Unknown",
    reclassified_subcategory: "Unknown",
    reclassification_reason: "AI classification unavailable",
  }));
}

// Post-processing: reconcile orphaned flights with detected trips
function reconcileFlightsWithTrips(updates: any[], originalTransactions: any[]): any[] {
  const txAmountMap = new Map<string, number>();
  const txMerchantMap = new Map<string, string>();
  originalTransactions.forEach((t) => {
    txAmountMap.set(t.id, Math.abs(t.amount || 0));
    txMerchantMap.set(t.id, (t.merchant || "").toLowerCase());
  });

  type Trip = {
    destination: string;
    start: string;
    end: string;
    tripLabel: string;
    isInternational: boolean;
  };
  const trips: Trip[] = [];

  const seenTrips = new Set<string>();
  updates.forEach((u) => {
    if (u.is_travel_related && u.travel_destination && u.travel_period_start) {
      const key = `${u.travel_destination}|${u.travel_period_start}`;
      if (!seenTrips.has(key)) {
        seenTrips.add(key);
        const dest = u.travel_destination.toLowerCase();
        const internationalKeywords = [
          "london", "paris", "rome", "berlin", "tokyo", "sydney", "dubai", "amsterdam",
          "barcelona", "munich", "vienna", "prague", "lisbon", "madrid", "milan", "dublin",
          "brussels", "zurich", "geneva", "singapore", "hong kong", "bangkok", "toronto",
          "vancouver", "montreal", "cancun", "mexico", "caribbean", "bahamas", "jamaica",
          "europe", "asia", "africa", "australia", "south america",
        ];
        const isInternational = internationalKeywords.some((kw) => dest.includes(kw));
        trips.push({
          destination: u.travel_destination,
          start: u.travel_period_start,
          end: u.travel_period_end || u.travel_period_start,
          tripLabel: u.trip_label || "",
          isInternational,
        });
      }
    }
  });

  if (trips.length === 0) return updates;

  return updates.map((u) => {
    const merchant = txMerchantMap.get(u.transaction_id) || "";
    const isAirline = AIRLINE_KEYWORDS.some((kw) => merchant.includes(kw));

    if (!isAirline) return u;
    if (u.is_travel_related && u.travel_destination && u.fare_match_confidence) return u;

    const amount = txAmountMap.get(u.transaction_id) || 0;
    const origTx = originalTransactions.find((t) => t.id === u.transaction_id);
    const txDate = origTx ? new Date(origTx.date).getTime() : 0;

    let bestTrip: Trip | null = null;
    let bestScore = -Infinity;
    let bestReason = "";

    trips.forEach((trip) => {
      let score = 0;
      const reasons: string[] = [];

      if (trip.isInternational && amount >= 500) {
        score += 3;
        reasons.push(`fare $${amount} matches international destination`);
      } else if (!trip.isInternational && amount >= 100 && amount <= 500) {
        score += 3;
        reasons.push(`fare $${amount} matches domestic destination`);
      } else if (trip.isInternational && amount < 300) {
        score -= 2;
        reasons.push(`fare $${amount} unusually low for international`);
      } else if (!trip.isInternational && amount > 800) {
        score -= 2;
        reasons.push(`fare $${amount} unusually high for domestic`);
      }

      if (txDate > 0) {
        const tripStart = new Date(trip.start).getTime();
        const daysDiff = Math.abs(txDate - tripStart) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 7) {
          score += 4;
          reasons.push(`booked ${Math.round(daysDiff)}d before trip`);
        } else if (daysDiff <= 30) {
          score += 2;
          reasons.push(`booked ${Math.round(daysDiff)}d before trip`);
        } else if (daysDiff <= 90) {
          score += 1;
          reasons.push(`booked ${Math.round(daysDiff)}d before trip`);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestTrip = trip;
        bestReason = reasons.join("; ");
      }
    });

    if (bestTrip && bestScore > 0) {
      const matched = bestTrip as Trip;
      const confidence = bestScore >= 5 ? "high" : bestScore >= 3 ? "medium" : "low";
      return {
        ...u,
        is_travel_related: true,
        travel_destination: matched.destination,
        travel_period_start: matched.start,
        travel_period_end: matched.end,
        fare_match_confidence: u.fare_match_confidence || confidence,
        fare_match_reason: u.fare_match_reason || `Reconciled: ${bestReason}`,
        third_party_likely: false,
        reclassification_reason: u.reclassification_reason || `Flight matched to ${matched.destination} trip`,
      };
    }

    const allAirlineIds = updates
      .filter((upd) => {
        const m = txMerchantMap.get(upd.transaction_id) || "";
        return AIRLINE_KEYWORDS.some((kw) => m.includes(kw));
      })
      .map((upd) => upd.transaction_id);

    if (allAirlineIds.length > trips.length * 2) {
      return {
        ...u,
        is_travel_related: false,
        third_party_likely: true,
        fare_match_confidence: "low",
        fare_match_reason: `Surplus fare — ${allAirlineIds.length} flights for ${trips.length} trip(s). Likely paid for another traveler.`,
        reclassification_reason: "Fare does not match any detected trip window",
      };
    }

    return u;
  });
}

// Destination normalization
const DESTINATION_ALIASES: Record<string, string> = {
  "new york city": "New York", "nyc": "New York", "manhattan": "New York",
  "brooklyn": "New York", "queens": "New York", "bronx": "New York",
  "los angeles": "Los Angeles", "la": "Los Angeles", "hollywood": "Los Angeles",
  "san francisco": "San Francisco", "sf": "San Francisco", "san fran": "San Francisco",
  "washington dc": "Washington D.C.", "washington d.c.": "Washington D.C.",
  "washington, d.c.": "Washington D.C.", "dc": "Washington D.C.",
  "las vegas": "Las Vegas", "vegas": "Las Vegas",
  "chicago, il": "Chicago", "miami beach": "Miami", "fort lauderdale": "Fort Lauderdale",
};

function normalizeDestination(dest: string): string {
  return DESTINATION_ALIASES[dest.toLowerCase().trim()] || dest.trim();
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactions } = await req.json();

    if (!Array.isArray(transactions)) {
      return new Response(JSON.stringify({ error: "Invalid input format" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (transactions.length === 0) {
      return new Response(JSON.stringify({ error: "Empty transactions array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (transactions.length > 1000) {
      return new Response(JSON.stringify({ error: "Too many transactions (max 1000)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[Travel Detection] Starting one-shot for ${transactions.length} transactions`);

    const homeZip =
      transactions.find((t) => t.home_zip)?.home_zip || transactions.find((t) => t.zip_code)?.zip_code || "Unknown";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          sendEvent("status", { message: "Analyzing travel patterns..." });
          const startTime = Date.now();

          const transactionSummary = transactions.map((t) => ({
            id: t.transaction_id,
            date: t.date,
            merchant: t.normalized_merchant || t.merchant_name,
            description: t.description || "",
            amount: t.amount,
            pillar: t.pillar,
            zip: t.zip_code || "unknown",
            anchor_type: t.anchor_type || null,
          }));

          console.log(`[Travel Detection] Sending ${transactionSummary.length} transactions in one shot (model: ${PRIMARY_MODEL})`);

          // One-shot processing with retry + model fallback
          let rawUpdates = await processTransactions(transactionSummary, homeZip, sendEvent);

          // Normalize destinations
          rawUpdates.forEach((u: any) => {
            if (u.travel_destination) {
              u.travel_destination = normalizeDestination(u.travel_destination);
            }
          });

          // Reconcile orphaned flights
          sendEvent("status", { message: "Reconciling flight fares with trips..." });
          rawUpdates = reconcileFlightsWithTrips(rawUpdates, transactionSummary);

          // Build trip_label
          const travelUpdates = rawUpdates.map((u: any) => {
            if (!u.is_travel_related || !u.travel_destination || !u.travel_period_start) {
              return { ...u, trip_label: null };
            }
            const start = u.travel_period_start.replace(/-/g, "").slice(2);
            const end = (u.travel_period_end || u.travel_period_start).replace(/-/g, "").slice(2);
            const dest = u.travel_destination;
            return { ...u, trip_label: `${start}:${end} ${dest} Trip` };
          });

          const totalTime = Date.now() - startTime;
          const travelCount = travelUpdates.filter((u: any) => u.is_travel_related).length;
          const thirdPartyCount = travelUpdates.filter((u: any) => u.third_party_likely).length;
          console.log(
            `[Travel Detection] ✓ Completed: ${travelUpdates.length} updates (${travelCount} travel, ${thirdPartyCount} third-party) in ${totalTime}ms`,
          );

          sendEvent("travel_updates", { travel_updates: travelUpdates });
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
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
