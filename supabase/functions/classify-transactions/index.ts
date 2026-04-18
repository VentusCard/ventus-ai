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
const CLASSIFICATION_PROMPT = `Classify transactions into lifestyle pillars, categories, and subcategory labels based on merchant names.

PILLARS & CATEGORIES (category = primary behavioral identifier within the pillar):

1. Sports & Active Living: Golf, Running, Tennis, Skiing & Snowboarding, Cycling, Water Sports, Gym & Fitness, Outdoor & Adventure, Team Sports, General
2. Health & Wellness: Medical & Doctor, Pharmacy, Mental Health, Spa & Massage, Vitamins & Supplements, Health Insurance, General
3. Food & Dining: Grocery, Coffee & Cafes, Dining Out, Fast Food, Delivery & Takeout, Meal Kits & Subscriptions, Bars & Nightlife, General
4. Travel & Exploration: Flights, Hotels & Lodging, Car Rentals, Travel Transportation, Tours & Activities, Travel Insurance, General
5. Home & Living: Rent & Mortgage, Utilities, Home Improvement, Furniture & Decor, Household Supplies, Local Commuting, General
6. Style & Beauty: Clothing, Shoes & Accessories, Beauty Products, Hair Salon, Nail Salon, Jewelry, General
7. Pets: Pet Food, Veterinary Care, Pet Supplies, Grooming, Pet Insurance, Pet Services, General
8. Entertainment & Culture: Movies & Theater, Concerts & Events, Museums & Exhibitions, Books & Magazines, Hobbies & Crafts, Gaming, General
9. Technology & Digital Life: Electronics & Devices, Software & Apps, Streaming Services, Internet & Phone, Cloud Storage, Tech Accessories, General
10. Family & Community: Childcare & Education, Gifts & Donations, Religious Organizations, Community Events, Kids Activities, Elder Care, General
11. Financial & Aspirational: Investments, Savings & Deposits, Insurance, Professional Development, Courses & Certifications, Financial Services, General
12. Miscellaneous & Unclassified: Unclear Merchants, General Services, One-Time Purchases, Unknown, Mixed Categories, General

SUBCATEGORY LABELS (1-3 per transaction):
Return 1 to 3 short labels that describe what you can ACTUALLY INFER from the merchant name. These are independent tags, not a hierarchy.
Only tag what the merchant name tells you. Do NOT guess what the customer bought if the merchant sells many things.

CLASSIFICATION EXAMPLES (Pillar / Category / Subcategory Labels):

Sports & Active Living:
- "EQUINOX" → Gym & Fitness / ["Membership"]
- "24 HOUR FITNESS" → Gym & Fitness / ["Membership"]
- "LULULEMON" → Gym & Fitness / ["Apparel", "Athletic"]
- "NIKE STORE" → Gym & Fitness / ["Apparel", "Equipment"]
- "REI CO-OP" → Outdoor & Adventure / ["Equipment", "Apparel"]
- "DICK'S SPORTING GOODS" → General / ["Equipment"]
- "ORANGETHEORY" → Gym & Fitness / ["Classes"]
- "TAYLORMADE" → Golf / ["Equipment"]
- "TITLEIST PRO SHOP" → Golf / ["Equipment", "Apparel"]
- "BROOKS RUNNING" → Running / ["Footwear"]

Health & Wellness:
- "CVS PHARMACY" → Pharmacy / ["Prescription", "OTC"]
- "WALGREENS" → Pharmacy / ["Prescription", "OTC"]
- "GNC" → Vitamins & Supplements / ["Supplements"]
- "MASSAGE ENVY" → Spa & Massage / ["Massage"]
- "TALKSPACE" → Mental Health / ["Therapy"]
- "BLUE CROSS" → Health Insurance / ["Monthly"]

Food & Dining:
- "WHOLE FOODS" → Grocery / ["Organic & Natural"]
- "TRADER JOES" → Grocery / ["Specialty"]
- "SAFEWAY" → Grocery / ["Conventional"]
- "STARBUCKS" → Coffee & Cafes / ["Chain"]
- "BLUE BOTTLE COFFEE" → Coffee & Cafes / ["Specialty"]
- "CHIPOTLE" → Dining Out / ["Casual", "Mexican"]
- "DOMINOS PIZZA" → Dining Out / ["Italian", "Casual"]
- "MARIO'S PIZZA" → Dining Out / ["Italian", "Casual"]
- "UBER EATS" → Delivery & Takeout / ["Platform"]
- "MCDONALDS" → Fast Food / ["Chain"]
- "HELLO FRESH" → Meal Kits & Subscriptions / ["Ingredient Kits"]

Travel & Exploration:
- "DELTA AIR LINES" → Flights / ["Domestic"]
- "UNITED AIRLINES" → Flights / ["Domestic"]
- "MARRIOTT" → Hotels & Lodging / ["Full-Service"]
- "FOUR SEASONS" → Hotels & Lodging / ["Full-Service"]
- "HERTZ" → Car Rentals / ["Airport"]
- "UBER" → Travel Transportation / ["Rideshare"]
- "LYFT" → Travel Transportation / ["Rideshare"]

Home & Living:
- "HOME DEPOT" → Home Improvement / ["Renovation", "Tools"]
- "LOWES" → Home Improvement / ["Renovation", "Tools"]
- "IKEA" → Furniture & Decor / ["Furniture", "Self-Assembly"]
- "SHELL" → Local Commuting / ["Gas"]
- "CHEVRON" → Local Commuting / ["Gas"]
- "PG&E" → Utilities / ["Electric", "Gas"]

Style & Beauty:
- "ZARA" → Clothing / ["Fast Fashion"]
- "NORDSTROM" → Clothing / ["Department Store"]
- "SEPHORA" → Beauty Products / ["Makeup", "Skincare"]
- "ULTA" → Beauty Products / ["Makeup", "Skincare"]
- "TIFFANY & CO" → Jewelry / ["Fine Jewelry"]

Pets:
- "PETCO" → Pet Supplies / ["Supplies"]
- "CHEWY.COM" → Pet Food / ["Online"]
- "VCA ANIMAL HOSPITAL" → Veterinary Care / ["Wellness"]

Entertainment & Culture:
- "AMC THEATRES" → Movies & Theater / ["Cinema"]
- "TICKETMASTER" → Concerts & Events / ["Tickets"]
- "BARNES & NOBLE" → Books & Magazines / ["Physical"]
- "STEAM GAMES" → Gaming / ["PC"]

Technology & Digital Life:
- "APPLE.COM" → Electronics & Devices / ["Phone", "Computer"]
- "BEST BUY" → Electronics & Devices / ["Electronics"]
- "SPOTIFY" → Streaming Services / ["Music"]
- "NETFLIX" → Streaming Services / ["Video"]
- "VERIZON" → Internet & Phone / ["Mobile Carrier"]

Family & Community:
- "KINDERCARE" → Childcare & Education / ["Daycare"]
- "RED CROSS" → Gifts & Donations / ["Charity"]

Financial & Aspirational:
- "VANGUARD" → Investments / ["Brokerage"]
- "UDEMY" → Courses & Certifications / ["Online"]
- "GEICO" → Insurance / ["Auto"]

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

P2P PAYMENTS (Zelle, Venmo, Cash App, PayPal):
• When merchant looks like a person's name AND source is Zelle/Venmo/Cash App, the description field IS the classification signal — use it as the primary clue.
• Examples:
  - "MARIA GARCIA" + description "Dogsitting" → Pets / Pet Services / ["Dogsitting"]
  - "JOHN SMITH" + description "Rent" → Home & Living / Rent & Mortgage / ["Rent"]
  - "SARAH LEE" + description "Yoga class" → Sports & Active Living / Gym & Fitness / ["Classes"]
  - "MIKE CHEN" + description "Birthday gift" → Family & Community / Gifts & Donations / ["Gift"]
• If description is empty for a P2P transfer, fall back to Family & Community / General with low confidence.

CATEGORY RULES:
• The category is the PRIMARY behavioral identifier — for Sports it's the sport, for Food it's the venue type, for Travel it's the transport/stay type
• Only use "General" when the merchant doesn't fit any specific category
• Be decisive - choose the best match even if not 100% certain
• Category obviousness is MORE IMPORTANT than brand recognition
• If the business type is obvious from the name, assign high confidence regardless of whether you recognize the specific brand

SUBCATEGORY LABEL RULES:
• Return 1-3 short labels that you can ACTUALLY INFER from the merchant name
• Do NOT guess what the customer bought if the merchant sells many things
• One label is perfectly fine — do not force multiple labels
• Labels are independent tags, not a hierarchy
• Do NOT use tier/price-level labels (Premium, Budget, Luxury, Mid-Range, High-End, Value, Discount). These are covered by the spending_tier field.

CONFIDENCE LEVELS:
• High (0.9): Well-known brand matches OR business category is obvious from merchant name
• Moderate (0.7): Business type is somewhat clear but category is ambiguous
• Low (0.4): Completely ambiguous merchant names — use "General" category

SPENDING TIER:
- "Premium": Luxury brands, fine dining, first-class travel, high-end retailers (Equinox, Tiffany, Nordstrom, Four Seasons, Whole Foods, Lululemon)
- "Standard": Mid-range, mainstream brands, casual dining (Target, Chipotle, Marriott, Nike, Safeway, Hilton)
- "Budget": Discount stores, fast food, budget options, dollar stores (McDonald's, Dollar Tree, Walmart, Spirit Airlines, Aldi, Planet Fitness)
- "N/A": Utilities, insurance, medical, financial services, rent — where tier doesn't meaningfully apply

PURCHASE FREQUENCY:
- "Weekly": Habitual, multiple times per month — coffee shops, gas stations, grocery stores, fast food, transit, gym visits
- "Monthly": Regular monthly cadence — subscriptions, streaming, rent, utilities, phone bills, insurance, meal kits, memberships
- "Occasional": A few times per year, irregular — haircuts, clothing stores, dentist, seasonal dining, oil changes, home improvement
- "Annually": Once-a-year predictable cycle — insurance renewals, tax prep, annual memberships, holiday travel, back-to-school
- "One-Time": Unlikely to repeat — furniture, jewelry, electronics, event tickets, medical procedures, large one-off retail`;

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
                category: {
                  type: "string",
                  description: "Primary behavioral identifier within the pillar (e.g. Golf, Grocery, Coffee & Cafes, Flights)",
                },
                subcategories: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 3,
                  description: "1-3 labels describing what can be inferred from the merchant name. Only tag what is obvious — do not guess.",
                },
                confidence: {
                  type: "number",
                  description:
                    "Confidence score: 0.9 for recognized brands OR obvious categories, 0.7 for somewhat clear merchants, 0.4 for ambiguous",
                  minimum: 0.4,
                  maximum: 0.9,
                },
                spending_tier: {
                  type: "string",
                  enum: ["Budget", "Standard", "Premium", "N/A"],
                  description: "Merchant market positioning: Premium (luxury/high-end), Standard (mid-range), Budget (discount/value), N/A (utilities/insurance/medical)",
                },
                purchase_frequency: {
                  type: "string",
                  enum: ["Weekly", "Monthly", "Occasional", "Annually", "One-Time"],
                  description: "How often a typical customer transacts with this merchant type",
                },
              },
              required: ["transaction_id", "pillar", "category", "subcategories", "confidence", "spending_tier", "purchase_frequency"],
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
      ...(t.description && { description: t.description }),
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
                category: "General",
                subcategories: ["General"],
                subcategory: "General",
                confidence: 0.1,
                spending_tier: "N/A",
                purchase_frequency: "One-Time",
                explanation: "Classification failed after all retries",
                enriched_at: new Date().toISOString(),
              };
            }

            const subs = Array.isArray(classification.subcategories)
              ? classification.subcategories
              : [classification.subcategory || "General"];

            return {
              ...original,
              normalized_merchant: classification.normalized_merchant || original.merchant_name,
              pillar: classification.pillar,
              category: classification.category || "General",
              subcategories: subs,
              subcategory: subs[0],
              confidence: classification.confidence || 0.8,
              spending_tier: classification.spending_tier || "N/A",
              purchase_frequency: classification.purchase_frequency || "One-Time",
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
