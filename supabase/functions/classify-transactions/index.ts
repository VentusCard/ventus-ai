/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

// Retry configuration
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

// Model configuration
const FAST_MODEL = "google/gemini-2.5-flash";
const FALLBACK_MODEL = "openai/gpt-5-mini";

// Concurrency configuration
const CONCURRENCY_LIMIT = 2;
const BATCH_SIZE = 24;
const SUB_BATCH_SIZE = 8;

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
  return Math.min(baseDelay + jitter, 10000); // Cap at 10s
}

// Concurrency-limited runner
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
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

// Classification Prompt with Examples
const CLASSIFICATION_PROMPT = `Classify transactions into lifestyle pillars and specific subcategories based on merchant names.

PILLARS & SUBCATEGORIES:

1. Sports & Active Living: Gym & Fitness, Outdoor Recreation, Sports Equipment, Athletic Apparel, Fitness Classes, Team Sports & Leagues, General

2. Health & Wellness: Medical & Doctor Visits, Pharmacy & Prescriptions, Mental Health & Therapy, Spa & Massage, Vitamins & Supplements, Health Insurance, General

3. Food & Dining: Grocery, Dining Out, Delivery & Takeout, Coffee & Cafes, Fast Food, Meal Kits & Subscriptions, General

4. Travel & Exploration: Flights, Hotels & Lodging, Car Rentals, Travel Transportation, Tours & Activities, Travel Insurance, General

5. Home & Living: Rent & Mortgage, Utilities, Home Improvement, Furniture & Decor, Household Supplies, Local Commuting (Gas, Parking, Transit), General

6. Style & Beauty: Clothing, Shoes & Accessories, Beauty Products, Hair Salon, Nail Salon, Jewelry, General

7. Pets: Pet Food, Veterinary Care, Pet Supplies, Grooming, Pet Insurance, Pet Services, General

8. Entertainment & Culture: Movies & Theater, Concerts & Events, Museums & Exhibitions, Books & Magazines, Hobbies & Crafts, Gaming, General

9. Technology & Digital Life: Electronics & Devices, Software & Apps, Streaming Services, Internet & Phone, Cloud Storage, Tech Accessories, General

10. Family & Community: Childcare & Education, Gifts & Donations, Religious Organizations, Community Events, Kids Activities, Elder Care, General

11. Financial & Aspirational: Investments, Savings & Deposits, Insurance, Professional Development, Courses & Certifications, Financial Services, General

12. Miscellaneous & Unclassified: Unclear Merchants, General Services, One-Time Purchases, Unknown, Mixed Categories, General

CLASSIFICATION EXAMPLES (use these patterns):

Sports & Active Living:
- "EQUINOX" → Gym & Fitness
- "24 HOUR FITNESS" → Gym & Fitness
- "LULULEMON" → Athletic Apparel
- "NIKE STORE" → Athletic Apparel
- "REI CO-OP" → Outdoor Recreation
- "DICK'S SPORTING GOODS" → Sports Equipment
- "ORANGETHEORY" → Fitness Classes
- "BARRYS BOOTCAMP" → Fitness Classes

Health & Wellness:
- "CVS PHARMACY" → Pharmacy & Prescriptions
- "WALGREENS" → Pharmacy & Prescriptions
- "GNC" → Vitamins & Supplements
- "VITAMIN SHOPPE" → Vitamins & Supplements
- "MASSAGE ENVY" → Spa & Massage
- "DRY BAR" → Spa & Massage
- "TALKSPACE" → Mental Health & Therapy
- "BLUE CROSS" → Health Insurance

Food & Dining:
- "WHOLE FOODS" → Grocery
- "TRADER JOES" → Grocery
- "SAFEWAY" → Grocery
- "KROGER" → Grocery
- "STARBUCKS" → Coffee & Cafes
- "DUNKIN" → Coffee & Cafes
- "CHIPOTLE" → Dining Out
- "PIZZA HUT" → Dining Out
- "DOMINOS PIZZA" → Dining Out
- "PAPA JOHNS" → Dining Out
- "LOCAL PIZZA CO" → Dining Out
- "MARCOS PIZZA" → Dining Out
- "UBER EATS" → Delivery & Takeout
- "DOORDASH" → Delivery & Takeout
- "MCDONALDS" → Fast Food
- "HELLO FRESH" → Meal Kits & Subscriptions

Travel & Exploration:
- "DELTA AIR LINES" → Flights
- "UNITED AIRLINES" → Flights
- "MARRIOTT" → Hotels & Lodging
- "HILTON" → Hotels & Lodging
- "HERTZ" → Car Rentals
- "ENTERPRISE" → Car Rentals
- "UBER" → Travel Transportation
- "LYFT" → Travel Transportation

Home & Living:
- "HOME DEPOT" → Home Improvement
- "LOWES" → Home Improvement
- "IKEA" → Furniture & Decor
- "TARGET" → Household Supplies
- "SHELL" → Local Commuting (Gas, Parking, Transit)
- "CHEVRON" → Local Commuting (Gas, Parking, Transit)
- "METRO TRANSIT" → Local Commuting (Gas, Parking, Transit)
- "PG&E" → Utilities

Style & Beauty:
- "ZARA" → Clothing
- "H&M" → Clothing
- "NORDSTROM" → Clothing
- "SEPHORA" → Beauty Products
- "ULTA" → Beauty Products
- "SUPERCUTS" → Hair Salon
- "DRYBAR" → Hair Salon
- "TIFFANY & CO" → Jewelry

Pets:
- "PETCO" → Pet Supplies
- "PETSMART" → Pet Supplies
- "CHEWY.COM" → Pet Food
- "VCA ANIMAL HOSPITAL" → Veterinary Care
- "BANFIELD PET HOSPITAL" → Veterinary Care

Entertainment & Culture:
- "AMC THEATRES" → Movies & Theater
- "NETFLIX" → Streaming Services (should be Tech)
- "TICKETMASTER" → Concerts & Events
- "BARNES & NOBLE" → Books & Magazines
- "STEAM GAMES" → Gaming
- "PLAYSTATION STORE" → Gaming

Technology & Digital Life:
- "APPLE.COM" → Electronics & Devices
- "BEST BUY" → Electronics & Devices
- "MICROSOFT" → Software & Apps
- "ADOBE" → Software & Apps
- "SPOTIFY" → Streaming Services
- "NETFLIX" → Streaming Services
- "VERIZON" → Internet & Phone
- "COMCAST" → Internet & Phone

Family & Community:
- "KINDERCARE" → Childcare & Education
- "YMCA" → Community Events
- "RED CROSS" → Gifts & Donations
- "GOFUNDME" → Gifts & Donations
- "COURSERA" → Professional Development (should be Financial)

Financial & Aspirational:
- "VANGUARD" → Investments
- "FIDELITY" → Investments
- "UDEMY" → Courses & Certifications
- "LINKEDIN LEARNING" → Courses & Certifications
- "GEICO" → Insurance
- "STATE FARM" → Insurance

CONFIDENCE EXAMPLES:
These merchants all deserve 0.9 confidence even if you've never heard of them:
- "Mario's Pizza" → Food & Dining: Dining Out (0.9) - obvious pizzeria
- "Sunset Fitness Center" → Sports & Active Living: Gym & Fitness (0.9) - obvious gym
- "Fresh Market Grocery" → Food & Dining: Grocery (0.9) - obvious grocery
- "Hair by Design" → Style & Beauty: Hair Salon (0.9) - obvious salon
- "Paws & Claws Vet" → Pets: Veterinary Care (0.9) - obvious vet

These deserve lower confidence:
- "ABC LLC" → Miscellaneous (0.4) - no category clues
- "The Corner Spot" → Entertainment (0.7) - could be restaurant, bar, cafe

MERCHANT PARSING:
• Remove payment prefixes: Apple Pay, PayPal, Venmo, SQ, Cash App, Zelle
• Extract true merchant (e.g., "SQ *Chipotle" → "Chipotle")

SUBCATEGORY RULES:
• Match merchants to the MOST SPECIFIC subcategory shown in examples
• Only use "General" when the merchant doesn't fit any specific subcategory
• Be decisive - choose the best match even if not 100% certain
• Category obviousness is MORE IMPORTANT than brand recognition
• Examples: ANY pizza place = Dining Out (0.9), ANY gym = Gym & Fitness (0.9), ANY grocery store = Grocery (0.9)
• If the business type is obvious from the name, assign high confidence regardless of whether you recognize the specific brand

CONFIDENCE LEVELS:
• High (0.9): 
  - Well-known brand matches (Nike, Starbucks, Target)
  - OR business category is obvious from merchant name (any pizza place, any gym, any grocery store, any salon)
  - Examples: "Joe's Pizzeria" = 0.9 (obviously Dining Out), "Main Street Fitness" = 0.9 (obviously Gym)
  
• Moderate (0.7): 
  - Business type is somewhat clear but subcategory is ambiguous
  - Generic restaurant names without cuisine indicators
  
• Low (0.4): 
  - Completely ambiguous merchant names (abbreviations, unclear)
  - Use "General" subcategory within best-guess pillar`;

// Classification Tool Schema
const CLASSIFICATION_TOOL = [
  {
    type: "function",
    function: {
      name: "classify_batch",
      description: "Classify a batch of transactions",
      parameters: {
        type: "object",
        properties: {
          classifications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                transaction_id: { type: "string" },
                normalized_merchant: { type: "string" },
                pillar: {
                  type: "string",
                  enum: [
                    "Sports & Active Living",
                    "Health & Wellness",
                    "Food & Dining",
                    "Travel & Exploration",
                    "Home & Living",
                    "Style & Beauty",
                    "Pets",
                    "Entertainment & Culture",
                    "Technology & Digital Life",
                    "Family & Community",
                    "Financial & Aspirational",
                    "Miscellaneous & Unclassified",
                  ],
                },
                subcategory: { type: "string" },
                confidence: {
                  type: "number",
                  description:
                    "Confidence score: 0.9 for recognized brands (Nike, Starbucks) OR obvious categories (any pizzeria, any gym, any grocery), 0.7 for somewhat clear merchants, 0.4 for ambiguous",
                  minimum: 0.4,
                  maximum: 0.9,
                },
              },
              required: ["transaction_id", "pillar", "confidence"],
            },
          },
        },
        required: ["classifications"],
      },
    },
  },
];

// Core classification call with model selection
async function callClassificationAPI(
  batch: any[],
  model: string,
  batchNum: number,
  attempt: number,
): Promise<{ classifications: any[]; rawResponse?: string }> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: CLASSIFICATION_PROMPT },
        { role: "user", content: `Classify these ${batch.length} transactions:\n${JSON.stringify(batch, null, 2)}` },
      ],
      tools: CLASSIFICATION_TOOL,
      tool_choice: { type: "function", function: { name: "classify_batch" } },
      temperature: 0,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(`[BATCH ${batchNum}] API error (${response.status}): ${errorText.slice(0, 200)}`);
    return { classifications: [], rawResponse: errorText };
  }

  const data = await response.json();
  const toolCalls = data.choices?.[0]?.message?.tool_calls;

  if (!toolCalls || toolCalls.length === 0) {
    const rawStr = JSON.stringify(data).slice(0, 300);
    console.warn(`[BATCH ${batchNum}] No tool calls (attempt ${attempt}, model ${model}). Response: ${rawStr}`);
    return { classifications: [], rawResponse: rawStr };
  }

  try {
    const results = JSON.parse(toolCalls[0].function.arguments);
    return { classifications: results.classifications || [] };
  } catch (parseError) {
    const rawArgs = toolCalls[0]?.function?.arguments?.slice(0, 200) || "";
    console.error(`[BATCH ${batchNum}] JSON parse error: ${rawArgs}`);
    return { classifications: [], rawResponse: rawArgs };
  }
}

// Single batch classification with retries and model escalation
async function classifyBatch(
  batch: any[],
  batchIndex: number,
  totalBatches: number,
  sendEvent: (event: string, data: any) => void,
): Promise<any[]> {
  const batchNum = batchIndex + 1;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();

    // Use fallback model on final attempt
    const model = attempt === MAX_RETRIES ? FALLBACK_MODEL : FAST_MODEL;

    if (attempt > 0) {
      const delay = getDelayMs(attempt - 1);
      console.log(
        `[BATCH ${batchNum}] Retry ${attempt}/${MAX_RETRIES} (delay: ${Math.round(delay)}ms, model: ${model})`,
      );
      await new Promise((r) => setTimeout(r, delay));
    }

    sendEvent("status", {
      message: `Classifying batch ${batchNum}/${totalBatches}${attempt > 0 ? ` (retry ${attempt})` : ""}...`,
      progress: Math.round((batchIndex / totalBatches) * 100),
    });

    try {
      const { classifications } = await callClassificationAPI(batch, model, batchNum, attempt);

      if (classifications.length === 0) {
        console.warn(`[BATCH ${batchNum}] Empty classifications (attempt ${attempt}, model ${model})`);
        continue;
      }

      const elapsed = Date.now() - startTime;
      console.log(
        `[BATCH ${batchNum}] ✓ ${classifications.length}/${batch.length} in ${elapsed}ms (model: ${model}, retries: ${attempt})`,
      );

      sendEvent("batch_complete", {
        batchIndex,
        batchNum,
        totalBatches,
        count: classifications.length,
        elapsed,
        model,
        retries: attempt,
      });

      return classifications;
    } catch (error) {
      console.error(`[BATCH ${batchNum}] Exception (attempt ${attempt}):`, error);
    }
  }

  console.error(`[BATCH ${batchNum}] All ${MAX_RETRIES + 1} attempts failed`);
  return [];
}

// Fallback: split batch into smaller sub-batches and classify sequentially
async function classifyWithSubBatchFallback(
  batch: any[],
  batchIndex: number,
  totalBatches: number,
  sendEvent: (event: string, data: any) => void,
): Promise<any[]> {
  const batchNum = batchIndex + 1;

  // First try normal classification
  const results = await classifyBatch(batch, batchIndex, totalBatches, sendEvent);

  if (results.length > 0) {
    return results;
  }

  // If failed and batch is large enough, split into sub-batches
  if (batch.length > SUB_BATCH_SIZE) {
    console.log(`[BATCH ${batchNum}] Splitting into sub-batches of ${SUB_BATCH_SIZE}`);

    const subBatches: any[][] = [];
    for (let i = 0; i < batch.length; i += SUB_BATCH_SIZE) {
      subBatches.push(batch.slice(i, i + SUB_BATCH_SIZE));
    }

    const allSubResults: any[] = [];

    // Process sub-batches sequentially for maximum reliability
    for (let subIdx = 0; subIdx < subBatches.length; subIdx++) {
      const subBatch = subBatches[subIdx];
      const subBatchNum = `${batchNum}.${subIdx + 1}`;

      sendEvent("status", {
        message: `Classifying sub-batch ${subBatchNum} (${subBatch.length} items)...`,
        progress: Math.round((batchIndex / totalBatches) * 100),
      });

      // Use fallback model directly for sub-batches
      for (let attempt = 0; attempt <= 2; attempt++) {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, getDelayMs(attempt)));
        }

        try {
          const { classifications } = await callClassificationAPI(
            subBatch,
            FALLBACK_MODEL,
            parseInt(subBatchNum),
            attempt,
          );

          if (classifications.length > 0) {
            console.log(`[SUB-BATCH ${subBatchNum}] ✓ ${classifications.length}/${subBatch.length}`);
            allSubResults.push(...classifications);
            break;
          }
        } catch (error) {
          console.error(`[SUB-BATCH ${subBatchNum}] Error:`, error);
        }
      }
    }

    if (allSubResults.length > 0) {
      console.log(`[BATCH ${batchNum}] Sub-batch fallback recovered ${allSubResults.length}/${batch.length}`);
      return allSubResults;
    }
  }

  console.error(`[BATCH ${batchNum}] All fallback strategies exhausted`);
  return [];
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

    // Validate transaction structure
    for (const txn of transactions) {
      if (!txn.transaction_id || typeof txn.transaction_id !== "string") {
        return new Response(JSON.stringify({ error: "Invalid transaction ID" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!txn.merchant_name || typeof txn.merchant_name !== "string") {
        return new Response(JSON.stringify({ error: "Invalid merchant name" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (typeof txn.amount !== "number" || txn.amount < 0) {
        return new Response(JSON.stringify({ error: "Invalid amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Streamlined transaction input
    const transactionSummary = transactions.map((t) => ({
      id: t.transaction_id,
      merchant: t.merchant_name,
      amount: t.amount,
      date: t.date,
      ...(t.zip_code && { zip: t.zip_code }),
    }));

    console.log(`[SSE] Starting classification for ${transactions.length} transactions`);
    const startTime = Date.now();

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          sendEvent("status", { message: "Starting classification...", progress: 0 });

          // Split into batches
          const batches: any[][] = [];
          for (let i = 0; i < transactionSummary.length; i += BATCH_SIZE) {
            batches.push(transactionSummary.slice(i, i + BATCH_SIZE));
          }

          console.log(
            `[CLASSIFY] Processing ${transactionSummary.length} transactions in ${batches.length} batches (concurrency: ${CONCURRENCY_LIMIT})`,
          );

          // Process batches with limited concurrency
          const batchResults = await runWithConcurrency(batches, CONCURRENCY_LIMIT, (batch, idx) =>
            classifyWithSubBatchFallback(batch, idx, batches.length, sendEvent),
          );

          const allClassifications = batchResults.flat();

          const totalTime = Date.now() - startTime;
          const successRate = Math.round((allClassifications.length / transactionSummary.length) * 100);

          console.log(
            `[CLASSIFY] ✓ Completed: ${allClassifications.length}/${transactionSummary.length} (${successRate}%) in ${totalTime}ms`,
          );

          // Merge results with original transactions
          const enrichedTransactions = transactions.map((original) => {
            const classification = allClassifications.find((c: any) => c.transaction_id === original.transaction_id);

            if (!classification) {
              return {
                ...original,
                normalized_merchant: original.merchant_name,
                pillar: "Miscellaneous & Unclassified",
                subcategory: "General",
                confidence: 0.1,
                explanation: "Classification failed after all retries",
                enriched_at: new Date().toISOString(),
              };
            }

            return {
              ...original,
              normalized_merchant: classification.normalized_merchant || original.merchant_name,
              pillar: classification.pillar,
              subcategory: classification.subcategory || "General",
              confidence: classification.confidence || 0.8,
              explanation: classification.explanation || "",
              enriched_at: new Date().toISOString(),
            };
          });

          // Send final results
          sendEvent("done", {
            enriched_transactions: enrichedTransactions,
            stats: {
              total: transactions.length,
              classified: allClassifications.length,
              success_rate: successRate,
              time_ms: totalTime,
              concurrency: CONCURRENCY_LIMIT,
            },
            timestamp: new Date().toISOString(),
          });

          controller.close();
        } catch (error) {
          console.error("[CLASSIFY] Error:", error);
          sendEvent("error", {
            message: "Classification failed",
            timestamp: new Date().toISOString(),
          });
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
  } catch (error) {
    console.error("[CLASSIFY] Server error:", error);
    return new Response(JSON.stringify({ error: "Service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
