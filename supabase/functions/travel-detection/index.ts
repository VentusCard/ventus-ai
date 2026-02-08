/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Configuration
const BATCH_SIZE = 30;
const CONCURRENCY_LIMIT = 2;
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

// Models
const PRIMARY_MODEL = "google/gemini-2.5-flash";
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

// Concurrency-limited runner
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  async function processNext(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Array(Math.min(limit, items.length))
    .fill(null)
    .map(() => processNext());

  await Promise.all(workers);
  return results;
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

// Core AI call for a batch
async function callTravelDetectionAI(
  model: string,
  batch: any[],
  homeZip: string,
  batchNum: number,
  attempt: number
): Promise<any[]> {
  const isOpenAI = model.startsWith("openai/");
  const isGemini = model.startsWith("google/");

  const tokenParam = isOpenAI
    ? { max_completion_tokens: 8000 }
    : { max_tokens: 4000 };

  const requestBody: any = {
    model,
    ...tokenParam,
    messages: [
      { role: "system", content: TRAVEL_DETECTION_PROMPT.replace("{homeZip}", homeZip) },
      {
        role: "user",
        content: `Analyze these ${batch.length} PRE-FILTERED travel candidates and call detect_travel_patterns:\n\n${JSON.stringify(batch, null, 2)}`,
      },
    ],
    tools: TRAVEL_DETECTION_TOOL,
  };

  if (isOpenAI) {
    requestBody.tool_choice = { type: "function", function: { name: "detect_travel_patterns" } };
  } else if (isGemini) {
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
    console.error(`[BATCH ${batchNum}] ${model} failed (${response.status}): ${errorText.slice(0, 200)}`);
    return [];
  }

  const data = await response.json();
  const choice = data.choices?.[0];

  if (choice?.finish_reason === "error" || choice?.native_finish_reason === "MALFORMED_FUNCTION_CALL") {
    console.error(`[BATCH ${batchNum}] ${model} malformed function call`);
    return [];
  }

  const toolCalls = choice?.message?.tool_calls;
  if (!toolCalls || toolCalls.length === 0) {
    const rawStr = JSON.stringify(data).slice(0, 200);
    console.warn(`[BATCH ${batchNum}] ${model} no tool calls (attempt ${attempt}): ${rawStr}`);
    return [];
  }

  try {
    const args = toolCalls[0].function.arguments;
    const results = typeof args === "string" ? JSON.parse(args) : args;
    return results.travel_updates || [];
  } catch (parseError: any) {
    console.error(`[BATCH ${batchNum}] JSON parse error: ${parseError.message}`);
    return [];
  }
}

// Single batch processing with retries and model fallback
async function processBatch(
  batch: any[],
  batchIndex: number,
  totalBatches: number,
  homeZip: string,
  sendEvent: (event: string, data: any) => void
): Promise<any[]> {
  const batchNum = batchIndex + 1;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    const model = attempt === MAX_RETRIES ? FALLBACK_MODEL : PRIMARY_MODEL;

    if (attempt > 0) {
      const delay = getDelayMs(attempt - 1);
      console.log(`[BATCH ${batchNum}] Retry ${attempt}/${MAX_RETRIES} (delay: ${Math.round(delay)}ms, model: ${model})`);
      await new Promise((r) => setTimeout(r, delay));
    }

    sendEvent("status", {
      message: `Analyzing travel batch ${batchNum}/${totalBatches}${attempt > 0 ? ` (retry ${attempt})` : ""}...`,
    });

    try {
      const updates = await callTravelDetectionAI(model, batch, homeZip, batchNum, attempt);

      if (updates.length === 0) {
        console.warn(`[BATCH ${batchNum}] Empty results (attempt ${attempt}, model ${model})`);
        continue;
      }

      const elapsed = Date.now() - startTime;
      console.log(`[BATCH ${batchNum}] ✓ ${updates.length}/${batch.length} in ${elapsed}ms (model: ${model})`);

      return updates;
    } catch (error: any) {
      console.error(`[BATCH ${batchNum}] Exception (attempt ${attempt}):`, error.message);
    }
  }

  console.error(`[BATCH ${batchNum}] All ${MAX_RETRIES + 1} attempts failed`);
  
  // Return fallback for failed batch
  return batch.map((t) => ({
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
          sendEvent("status", { message: "Analyzing travel patterns..." });
          const startTime = Date.now();

          // Prepare transaction summary
          const transactionSummary = transactions.map((t) => ({
            id: t.transaction_id,
            date: t.date,
            merchant: t.normalized_merchant || t.merchant_name,
            description: t.description || "",
            amount: t.amount,
            pillar: t.pillar,
            zip: t.zip_code || "unknown",
          }));

          // Split into batches
          const batches: any[][] = [];
          for (let i = 0; i < transactionSummary.length; i += BATCH_SIZE) {
            batches.push(transactionSummary.slice(i, i + BATCH_SIZE));
          }

          console.log(`[Travel Detection] Processing ${transactionSummary.length} transactions in ${batches.length} batches (concurrency: ${CONCURRENCY_LIMIT})`);

          // Process batches with limited concurrency
          const batchResults = await runWithConcurrency(
            batches,
            CONCURRENCY_LIMIT,
            (batch, idx) => processBatch(batch, idx, batches.length, homeZip, sendEvent)
          );

          const travelUpdates = batchResults.flat();

          const totalTime = Date.now() - startTime;
          const travelCount = travelUpdates.filter((u) => u.is_travel_related).length;
          console.log(`[Travel Detection] ✓ Completed: ${travelUpdates.length} updates (${travelCount} travel-related) in ${totalTime}ms`);

          // Send travel updates
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
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
