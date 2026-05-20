// lambdas/classify-transactions/index.js
// Triggered by SQS ventus-classify-queue
// Reads from transactions_raw → classifies → writes to transactions_enriched
// → updates pipeline_runs → publishes to pillar, travel, lifestyle queues

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createDbFactory } from '../../shared/db.mjs';
import { createSecretsProvider, resolveSecretId } from '../../shared/secrets.mjs';

const sqs = new SQSClient({ region: 'us-east-2' });

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const MODEL_PROVIDER_SECRET_ID = resolveSecretId({
  envVar: 'MODEL_PROVIDER_SECRET_ID',
});
const getDbSecrets = createSecretsProvider({ secretId: DATABASE_SECRET_ID });
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
});

const PILLAR_QUEUE_URL = process.env.PILLAR_QUEUE_URL;
const TRAVEL_QUEUE_URL = process.env.TRAVEL_QUEUE_URL;
const LIFESTYLE_QUEUE_URL = process.env.LIFESTYLE_QUEUE_URL;
const RISK_QUEUE_URL = process.env.RISK_QUEUE_URL;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;
const CONCURRENCY_LIMIT = 5;
const BATCH_SIZE = 24;
const SUB_BATCH_SIZE = 8;
const FAST_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getDelayMs(attempt) {
  const base = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 0.5 * base;
  return Math.min(base + jitter, 10000);
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const i = idx++;
      results[i] = await worker(items[i], i);
    }
  }
  await Promise.all(Array(Math.min(limit, items.length)).fill(null).map(next));
  return results;
}

// ─── DB ───────────────────────────────────────────────────────────────────────
const getDB = createDbFactory({ getSecrets: getDbSecrets });

// ─── FETCH RAW TRANSACTIONS FOR THIS CUSTOMER ─────────────────────────────────
async function fetchRawTransactions(db, customerId, batchId) {
  const res = await db.query(
    `SELECT transaction_id, customer_id, bank_id, batch_id,
            raw_merchant, amount, transaction_date, mcc_code, zip_code
     FROM transactions_raw
     WHERE customer_id = $1 AND batch_id = $2 AND processed = false`,
    [customerId, batchId]
  );
  return res.rows;
}

// ─── MERCHANT CACHE CHECK ─────────────────────────────────────────────────────
async function checkCache(db, rawNames) {
  if (rawNames.length === 0) return {};
  const res = await db.query(
    `SELECT raw_name, clean_name, pillar, subcategory, confidence
     FROM merchant_cache
     WHERE raw_name = ANY($1)`,
    [rawNames]
  );
  const cache = {};
  for (const row of res.rows) cache[row.raw_name] = row;
  return cache;
}

// ─── WRITE TO MERCHANT CACHE ──────────────────────────────────────────────────
async function writeToCache(db, classifications) {
  for (const c of classifications) {
    await db.query(
      `INSERT INTO merchant_cache (raw_name, clean_name, pillar, subcategory, confidence, last_updated)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (raw_name) DO UPDATE SET
         hit_count    = merchant_cache.hit_count + 1,
         last_updated = NOW()`,
      [
        c.raw_merchant,
        c.normalized_merchant,
        c.pillar,
        c.subcategory,
        c.confidence,
      ]
    );
  }
}

// ─── WRITE ENRICHED TRANSACTIONS TO RDS ───────────────────────────────────────
async function writeEnrichedToRDS(db, rawRows, classifications) {
  for (const raw of rawRows) {
    const c = classifications.find(
      (x) => x.transaction_id === raw.transaction_id
    );
    const cleanMerchant = c?.normalized_merchant || raw.raw_merchant;
    const pillar = c?.pillar || 'Miscellaneous & Unclassified';
    const subcategory = c?.subcategory || 'General';
    const confidence = c?.confidence || 0.1;

    await db.query(
      `INSERT INTO transactions_enriched
        (transaction_id, customer_id, bank_id, batch_id,
         amount, transaction_date, zip_code,
         clean_merchant_name, lifestyle_category, merchant_category,
         confidence_score, enriched_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
       ON CONFLICT (transaction_id) DO UPDATE SET
         clean_merchant_name = EXCLUDED.clean_merchant_name,
         lifestyle_category  = EXCLUDED.lifestyle_category,
         merchant_category   = EXCLUDED.merchant_category,
         confidence_score    = EXCLUDED.confidence_score,
         enriched_at         = NOW()`,
      [
        raw.transaction_id,
        raw.customer_id,
        raw.bank_id,
        raw.batch_id,
        raw.amount,
        raw.transaction_date,
        raw.zip_code,
        cleanMerchant,
        pillar,
        subcategory,
        confidence,
      ]
    );

    await db.query(
      `UPDATE transactions_raw SET processed = true WHERE transaction_id = $1`,
      [raw.transaction_id]
    );
  }
  console.log(`[RDS] ✓ Wrote ${rawRows.length} enriched transactions`);
}

// ─── UPDATE PIPELINE_RUNS ─────────────────────────────────────────────────────
async function updatePipelineRuns(db, batchId, customerId, status) {
  await db.query(
    `UPDATE pipeline_runs
     SET status = $1, classified_at = NOW()
     WHERE batch_id = $2 AND customer_id = $3`,
    [status, batchId, customerId]
  );
}

// ─── PUBLISH TO DOWNSTREAM QUEUES ─────────────────────────────────────────────
async function publishToDownstreamQueues(
  batchId,
  customerId,
  bankId,
  txnCount
) {
  const msg = JSON.stringify({
    batch_id: batchId,
    customer_id: customerId,
    bank_id: bankId,
    transaction_count: txnCount,
  });
  await Promise.all([
    sqs.send(
      new SendMessageCommand({ QueueUrl: PILLAR_QUEUE_URL, MessageBody: msg })
    ),
    sqs.send(
      new SendMessageCommand({ QueueUrl: TRAVEL_QUEUE_URL, MessageBody: msg })
    ),
    sqs.send(
      new SendMessageCommand({
        QueueUrl: LIFESTYLE_QUEUE_URL,
        MessageBody: msg,
      })
    ),
    sqs.send(
      new SendMessageCommand({ QueueUrl: RISK_QUEUE_URL, MessageBody: msg })
    ),
  ]);
  console.log(`[SQS] ✓ Published to pillar, travel, lifestyle, risk queues`);
}

// ─── CLASSIFICATION PROMPT ────────────────────────────────────────────────────
const CLASSIFICATION_PROMPT = `Classify transactions into lifestyle pillars and specific subcategories based on merchant names.

CRITICAL: Bank transaction data contains messy, truncated, and prefixed merchant names. Your job is to see through the noise and identify the real merchant. Never return Miscellaneous & Unclassified for a merchant you can identify, even partially.

STEP 1 — STRIP BANK PREFIXES
Remove these prefixes before classifying. They are added by the bank and are not part of the merchant name:
- CHECKCARD [DATE], CHECKCARD
- POS PURCHASE TERM [NUMBER], POS PURCHASE, POS
- DDA PURCHASE [DATE] #[NUMBER], DDA PURCHASE
- MC PURCHASE [DATE], MC PURCHASE
- DEBIT CARD PURCHASE, DEBIT CARD
- ACH DEBIT, ACH ORIG, ACH PAYMENT
- ORIG CO NAME:
- RECURRING CHARGE, RECURRING PAYMENT
- SQ * (Square POS)
- TST* (Toast POS)
- SP * (Shopify)
- PAYPAL * (keep the merchant name after the asterisk)
- VENMO * (if followed by a business name keep it, if followed by a person's name use Personal Transfer)
- APL * (Apple Pay)
- VZWRLSS (Verizon Wireless)
- AMZN, AMAZON.COM*, AMAZON MKTPLACE (normalize all to Amazon)

STEP 2 — NORMALIZE BRAND NAMES
These truncated names are well-known brands. Always normalize to the clean brand name:
- WM SUPERCENTER, WM STORE, WAL-MART, WALMART STORE → Walmart
- WHOLEFDS, WHOLEFDS MKT, WHOLE FOODS MKT → Whole Foods
- AMZN, AMZN MKTP, AMAZON MKTPLACE, AMAZON.COM → Amazon
- COSTCO WHSE, COSTCO WHOLESALE → Costco
- TARGET, TARGET T-, TGT → Target
- EBAY, EBAY INC → eBay
- MCDONALDS, MCD → McDonald's
- SBUX → Starbucks
- CVS, CVS/PHARMACY, CVS HLTH → CVS Pharmacy
- WAG, WALGREENS → Walgreens
- THE HOME DEPOT, HOME DEPOT → Home Depot
- LOWES, LOWE'S → Lowe's
- TRADER JOE'S, TRADER JOES → Trader Joe's
- WHOLEFDS → Whole Foods
- KROGER, KR → Kroger
- PUBLIX → Publix
- HEB, H-E-B → HEB
- SAFEWAY → Safeway
- WEGMANS → Wegmans
- APPLE.COM, APPLE.COM/BILL, APL* → Apple
- SPOTIFY, SPOTIFY USA → Spotify
- NETFLIX.COM, NETFLIX → Netflix
- HULU, HULU.COM → Hulu
- DISNEY+, DISNEY PLUS → Disney+
- HBO MAX, MAX.COM → Max
- AMAZON PRIME, PRIME VIDEO → Amazon Prime
- UBER*, UBER TRIP, UBER* EATS → Uber (or Uber Eats if food context)
- LYFT*, LYFT RIDE → Lyft
- DOORDASH, DOORDASH* → DoorDash
- GRUBHUB, GRUBHUB* → Grubhub
- INSTACART, INSTACART* → Instacart
- ZELLE PAYMENT TO *, ZELLE TO *, ZELLE TRANSFER → Personal Transfer
- VENMO * [PERSON NAME] → Personal Transfer
- ATM WITHDRAWAL, ATM WITH, ATM WD → ATM Withdrawal
- ACH ORIG AMERICAN EXPRESS, AMEX EPAY, AMERICANEXPRESS → American Express Payment
- DISCOVER E-PAYMENT, DISCOVER PAYMENT → Discover Payment
- CHASE CREDIT CRD, CHASE AUTOPAY → Chase Payment
- CAPITAL ONE, CAP ONE PAYMENT → Capital One Payment

STEP 3 — USE MCC CODE AS BACKUP
If the merchant name is still unrecognizable after stripping prefixes, use the MCC code to determine the pillar:
- 5411 → Food & Dining / Grocery
- 5812, 5814 → Food & Dining / Dining Out or Coffee & Cafes
- 5541, 5542 → Home & Living / Local Commuting
- 5411 → Food & Dining / Grocery
- 7941, 7911 → Sports & Active Living / Gym & Fitness
- 5912 → Health & Wellness / Pharmacy & Prescriptions
- 4511 → Travel & Exploration / Flights
- 7011 → Travel & Exploration / Hotels & Lodging
- 7512 → Travel & Exploration / Car Rentals
- 5311, 5651 → Style & Beauty / Clothing
- 5945, 5092 → Entertainment & Culture / Hobbies & Crafts
- 5815, 5816 → Technology & Digital Life / Streaming Services
- 6011, 6012 → Financial & Aspirational / Financial Services
- 5999 → use merchant name context to determine best pillar
- 7995 → Entertainment & Culture / Gaming (note: gambling MCC, flag if needed)

STEP 4 — CLASSIFY
Now classify into the correct pillar and subcategory.

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
12. Miscellaneous & Unclassified: ONLY use this when the merchant name is completely unrecognizable AND no MCC code is available. This should be rare.

CLASSIFICATION EXAMPLES:
Sports & Active Living: "EQUINOX" → Gym & Fitness, "LULULEMON" → Athletic Apparel, "REI CO-OP" → Outdoor Recreation
Health & Wellness: "CVS PHARMACY" → Pharmacy & Prescriptions, "GNC" → Vitamins & Supplements
Food & Dining: "WHOLE FOODS" → Grocery, "STARBUCKS" → Coffee & Cafes, "CHIPOTLE" → Dining Out
Travel & Exploration: "DELTA AIR LINES" → Flights, "MARRIOTT" → Hotels & Lodging, "HERTZ" → Car Rentals
Home & Living: "HOME DEPOT" → Home Improvement, "IKEA" → Furniture & Decor, "SHELL" → Local Commuting
Style & Beauty: "ZARA" → Clothing, "SEPHORA" → Beauty Products, "SUPERCUTS" → Hair Salon
Pets: "PETCO" → Pet Supplies, "CHEWY.COM" → Pet Food, "VCA ANIMAL HOSPITAL" → Veterinary Care
Entertainment & Culture: "AMC THEATRES" → Movies & Theater, "TICKETMASTER" → Concerts & Events
Technology & Digital Life: "BEST BUY" → Electronics & Devices, "ADOBE" → Software & Apps, "SPOTIFY" → Streaming Services
Family & Community: "KINDERCARE" → Childcare & Education, "GOFUNDME" → Gifts & Donations
Financial & Aspirational: "VANGUARD" → Investments, "UDEMY" → Courses & Certifications, "GEICO" → Insurance

CONFIDENCE LEVELS:
- 0.9: Recognized brand name OR business type completely obvious from name or MCC
- 0.7: Business type clear but subcategory ambiguous, OR partially recognized brand
- 0.4: Truly unrecognizable after all steps above. Use sparingly — this should be less than 5% of transactions.

MERCHANT PARSING RULES:
- Always return the clean normalized brand name in normalized_merchant, not the raw bank string
- Personal transfers (Zelle to a person, Venmo to a person) → normalized_merchant: "Personal Transfer"
- ATM withdrawals → normalized_merchant: "ATM Withdrawal"
- Loan or credit card payments → normalized_merchant: use the card/bank name + "Payment"
- Unknown local merchant with MCC → use MCC to classify, keep merchant name as is
- Unknown local merchant without MCC → Miscellaneous & Unclassified at 0.4`;

// ─── TOOL SCHEMA ──────────────────────────────────────────────────────────────
const CLASSIFICATION_TOOL = [
  {
    type: 'function',
    function: {
      name: 'classify_batch',
      description: 'Classify a batch of transactions',
      parameters: {
        type: 'object',
        properties: {
          classifications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                transaction_id: { type: 'string' },
                normalized_merchant: { type: 'string' },
                pillar: {
                  type: 'string',
                  enum: [
                    'Sports & Active Living',
                    'Health & Wellness',
                    'Food & Dining',
                    'Travel & Exploration',
                    'Home & Living',
                    'Style & Beauty',
                    'Pets',
                    'Entertainment & Culture',
                    'Technology & Digital Life',
                    'Family & Community',
                    'Financial & Aspirational',
                    'Miscellaneous & Unclassified',
                  ],
                },
                subcategory: { type: 'string' },
                confidence: { type: 'number', minimum: 0.4, maximum: 0.9 },
              },
              required: [
                'transaction_id',
                'normalized_merchant',
                'pillar',
                'subcategory',
                'confidence',
              ],
            },
          },
        },
        required: ['classifications'],
      },
    },
  },
];

// ─── CORE GEMINI API CALL ─────────────────────────────────────────────────────
async function callClassificationAPI(
  batch,
  model,
  batchNum,
  attempt,
  geminiApiKey
) {
  const res = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${geminiApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: CLASSIFICATION_PROMPT },
          {
            role: 'user',
            content: `Classify these ${batch.length} transactions:\n${JSON.stringify(batch, null, 2)}`,
          },
        ],
        tools: CLASSIFICATION_TOOL,
        tool_choice: { type: 'function', function: { name: 'classify_batch' } },
        temperature: 0,
        max_tokens: 4000,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    console.error(
      `[BATCH ${batchNum}] API error (${res.status}): ${err.slice(0, 200)}`
    );
    return { classifications: [] };
  }

  const data = await res.json();
  const toolCalls = data.choices?.[0]?.message?.tool_calls;
  if (!toolCalls?.length) {
    console.warn(`[BATCH ${batchNum}] No tool calls (attempt ${attempt})`);
    return { classifications: [] };
  }

  try {
    const results = JSON.parse(toolCalls[0].function.arguments);
    return { classifications: results.classifications || [] };
  } catch (e) {
    console.error(`[BATCH ${batchNum}] JSON parse error`);
    return { classifications: [] };
  }
}

// ─── BATCH CLASSIFICATION WITH RETRIES ────────────────────────────────────────
async function classifyBatch(batch, batchIndex, geminiApiKey) {
  const batchNum = batchIndex + 1;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const model = attempt === MAX_RETRIES ? FALLBACK_MODEL : FAST_MODEL;
    if (attempt > 0)
      await new Promise((r) => setTimeout(r, getDelayMs(attempt - 1)));
    try {
      const { classifications } = await callClassificationAPI(
        batch,
        model,
        batchNum,
        attempt,
        geminiApiKey
      );
      if (classifications.length > 0) {
        console.log(
          `[BATCH ${batchNum}] ✓ ${classifications.length}/${batch.length}`
        );
        return classifications;
      }
    } catch (e) {
      console.error(`[BATCH ${batchNum}] Exception (attempt ${attempt}):`, e);
    }
  }
  return [];
}

async function classifyWithSubBatchFallback(batch, batchIndex, geminiApiKey) {
  const results = await classifyBatch(batch, batchIndex, geminiApiKey);
  if (results.length > 0) return results;

  if (batch.length > SUB_BATCH_SIZE) {
    const subBatches = [];
    for (let i = 0; i < batch.length; i += SUB_BATCH_SIZE)
      subBatches.push(batch.slice(i, i + SUB_BATCH_SIZE));

    const all = [];
    for (let si = 0; si < subBatches.length; si++) {
      for (let attempt = 0; attempt <= 2; attempt++) {
        if (attempt > 0)
          await new Promise((r) => setTimeout(r, getDelayMs(attempt)));
        try {
          const { classifications } = await callClassificationAPI(
            subBatches[si],
            FALLBACK_MODEL,
            `${batchIndex + 1}.${si + 1}`,
            attempt,
            geminiApiKey
          );
          if (classifications.length > 0) {
            all.push(...classifications);
            break;
          }
        } catch (e) {
          console.error(`[SUB-BATCH] Error:`, e);
        }
      }
    }
    if (all.length > 0) return all;
  }
  return [];
}

// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  const secrets = await getModelSecrets();
  const geminiApiKey = secrets.GEMINI_API_KEY;

  // ── MODE 1: SQS trigger (pipeline mode) ──
  if (event.Records) {
    for (const record of event.Records) {
      const { batch_id, customer_id, bank_id } = JSON.parse(record.body);
      console.log(
        `[CLASSIFY] Processing customer ${customer_id} batch ${batch_id}`
      );

      const db = await getDB();
      await db.connect();

      try {
        const rawRows = await fetchRawTransactions(db, customer_id, batch_id);
        if (rawRows.length === 0) {
          console.warn(
            `[CLASSIFY] No unprocessed transactions for ${customer_id}`
          );
          continue;
        }
        console.log(
          `[CLASSIFY] Found ${rawRows.length} transactions to classify`
        );

        const rawNames = rawRows.map((r) => r.raw_merchant);
        const cache = await checkCache(db, rawNames);
        const cached = rawRows.filter((r) => cache[r.raw_merchant]);
        const uncached = rawRows.filter((r) => !cache[r.raw_merchant]);
        console.log(`[CACHE] ${cached.length} hits, ${uncached.length} misses`);

        let newClassifications = [];
        if (uncached.length > 0) {
          const summary = uncached.map((r) => ({
            id: r.transaction_id,
            merchant: r.raw_merchant,
            amount: r.amount,
            date: r.transaction_date,
            ...(r.zip_code && { zip: r.zip_code }),
          }));

          const batches = [];
          for (let i = 0; i < summary.length; i += BATCH_SIZE)
            batches.push(summary.slice(i, i + BATCH_SIZE));

          const batchResults = await runWithConcurrency(
            batches,
            CONCURRENCY_LIMIT,
            (batch, idx) =>
              classifyWithSubBatchFallback(batch, idx, geminiApiKey)
          );
          newClassifications = batchResults.flat();

          const forCache = uncached
            .map((r) => {
              const c = newClassifications.find(
                (x) => x.transaction_id === r.transaction_id
              );
              return c
                ? {
                    raw_merchant: r.raw_merchant,
                    normalized_merchant:
                      c.normalized_merchant || r.raw_merchant,
                    pillar: c.pillar,
                    subcategory: c.subcategory || 'General',
                    confidence: c.confidence || 0.8,
                  }
                : null;
            })
            .filter(Boolean);
          await writeToCache(db, forCache);
        }

        const allClassifications = [
          ...cached.map((r) => ({
            transaction_id: r.transaction_id,
            normalized_merchant: cache[r.raw_merchant].clean_name,
            pillar: cache[r.raw_merchant].pillar,
            subcategory: cache[r.raw_merchant].subcategory,
            confidence: cache[r.raw_merchant].confidence,
          })),
          ...newClassifications,
        ];

        await writeEnrichedToRDS(db, rawRows, allClassifications);
        await updatePipelineRuns(db, batch_id, customer_id, 'classified');
        await new Promise((r) => setTimeout(r, 2000));
        await publishToDownstreamQueues(
          batch_id,
          customer_id,
          bank_id,
          rawRows.length
        );
        console.log(`[CLASSIFY] ✓ Done for customer ${customer_id}`);
      } catch (err) {
        console.error(`[CLASSIFY] Error for customer ${customer_id}:`, err);
        await db
          .query(
            `UPDATE pipeline_runs SET status = 'failed', error_message = $1 WHERE batch_id = $2 AND customer_id = $3`,
            [err.message, batch_id, customer_id]
          )
          .catch(() => {});
        throw err;
      } finally {
        await db.end();
      }
    }
    return { statusCode: 200 };
  }

  // ── MODE 2: HTTP trigger (TEpilot frontend) ──
  if (
    event.requestContext?.http?.method === 'OPTIONS' ||
    event.httpMethod === 'OPTIONS'
  ) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'content-type, authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    const { transactions } = JSON.parse(event.body || '{}');
    if (!Array.isArray(transactions) || transactions.length === 0)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid input' }),
      };

    const summary = transactions.map((t) => ({
      id: t.transaction_id,
      merchant: t.merchant_name,
      amount: t.amount,
      date: t.date,
      ...(t.zip_code && { zip: t.zip_code }),
    }));

    const startTime = Date.now();
    const batches = [];
    for (let i = 0; i < summary.length; i += BATCH_SIZE)
      batches.push(summary.slice(i, i + BATCH_SIZE));

    const batchResults = await runWithConcurrency(
      batches,
      CONCURRENCY_LIMIT,
      (batch, idx) => classifyWithSubBatchFallback(batch, idx, geminiApiKey)
    );
    const allClassifications = batchResults.flat();

    const enriched = transactions.map((orig) => {
      const c = allClassifications.find(
        (x) => x.transaction_id === orig.transaction_id
      );
      return c
        ? {
            ...orig,
            normalized_merchant: c.normalized_merchant || orig.merchant_name,
            pillar: c.pillar,
            subcategory: c.subcategory || 'General',
            confidence: c.confidence || 0.8,
          }
        : {
            ...orig,
            normalized_merchant: orig.merchant_name,
            pillar: 'Miscellaneous & Unclassified',
            subcategory: 'General',
            confidence: 0.1,
          };
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enriched_transactions: enriched,
        stats: {
          total: transactions.length,
          classified: allClassifications.length,
          time_ms: Date.now() - startTime,
        },
      }),
    };
  } catch (err) {
    console.error('[CLASSIFY] HTTP error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Service error' }),
    };
  }
};
