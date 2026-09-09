// backend/shared/pipeline/classify-core.mjs
// Shared merchant-classification core used by BOTH the production Lambda
// (ventus-classify-transactions) and the offline model-evaluation harness.
//
// Extracting this here guarantees the eval measures the *same* prompt, tool
// schema, input summarization, batching, retry/fallback, and post-processing
// that production actually runs — the only thing an eval swaps is the model.
//
// Everything is dependency-injected (modelGateway, models, batching knobs,
// onRateLimit, functionName) so the Lambda passes its real, CloudWatch-wired
// dependencies while the eval passes its own (env-keyed gateway, no-op metrics).

import {
  is429,
  get429DelayMs,
  parseRetryAfterMs,
} from '../platform/gemini.mjs';

// ─── CLASSIFICATION PROMPT ────────────────────────────────────────────────────
export const CLASSIFICATION_PROMPT = `Classify transactions into lifestyle pillars and specific subcategories based on merchant names.

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
- DIRECT DEPOSIT, PAYROLL, SALARY, WAGES → Direct Deposit / Payroll
- SBA, SMALL BUSINESS ADMINISTRATION → Small Business Administration

STEP 3 — USE PARTNER CONTEXT WHEN PRESENT
Some transactions include bracketed partner context, for example:
[partner_context: rail=ach; source_profile=ach_income; transaction_type=credit; plaid_pfc=INCOME_WAGES]
Use this context as evidence, but never include the bracketed text in normalized_merchant.

Partner context rules:
- source_profile or plaid_pfc containing INCOME, PAYROLL, WAGES, or DIRECT_DEPOSIT → Financial & Aspirational / Income & Payroll
- source_profile or plaid_pfc containing LOAN_PAYMENTS or CREDIT_CARD_PAYMENT → Financial & Aspirational / Loan Payments
- source_profile or plaid_pfc containing BANK_FEES → Financial & Aspirational / Banking Fees
- source_profile or plaid_pfc containing TRANSFER, ACCOUNT_TRANSFER, WIRE, P2P, ZELLE, or VENMO → Financial & Aspirational / Transfers, unless the merchant is clearly a consumer merchant
- source_profile or plaid_pfc containing GOVERNMENT → Family & Community / Government Services, unless the merchant is clearly a loan agency such as SBA
- source_profile or plaid_pfc containing GENERAL_SERVICES and merchant is a known business software/service provider → Technology & Digital Life / Software & Apps or Financial & Aspirational / Professional Services based on merchant
- transaction_type=credit should be treated as inflow evidence; if paired with income/payroll context, mark as Income & Payroll with 0.9 confidence
- For ACH card or loan payments, normalize clean merchant to the institution name without adding "Payment" unless the raw merchant explicitly says payment

STEP 4 — USE MCC CODE AS BACKUP
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

STEP 5 — CLASSIFY
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
11. Financial & Aspirational: Investments, Savings & Deposits, Income & Payroll, Loan Payments, Transfers, Banking Fees, Insurance, Professional Development, Professional Services, Courses & Certifications, Financial Services, General
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
Multi-rail / partner context: "Direct Deposit Plaid Inc [partner_context: rail=ach; source_profile=ach_income; transaction_type=credit; plaid_pfc=INCOME_WAGES]" → Direct Deposit Plaid Inc / Financial & Aspirational / Income & Payroll
Multi-rail / partner context: "American Express [partner_context: rail=ach; source_profile=ach_loan; plaid_pfc=LOAN_PAYMENTS_CREDIT_CARD_PAYMENT]" → American Express / Financial & Aspirational / Loan Payments
Multi-rail / partner context: "Small Business Administration [partner_context: source_profile=card_loan; plaid_pfc=LOAN_PAYMENTS_OTHER_PAYMENT]" → Small Business Administration / Financial & Aspirational / Loan Payments
Multi-rail / partner context: "Labor&industries; L&i Elf. Merchant Name: Labor&industries [partner_context: plaid_pfc=GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES]" → Labor & Industries / Family & Community / Government Services

CONFIDENCE LEVELS:
- 0.9: Recognized brand name OR business type completely obvious from name or MCC
- 0.7: Business type clear but subcategory ambiguous, OR partially recognized brand
- 0.4: Truly unrecognizable after all steps above. Use sparingly — this should be less than 5% of transactions.

MERCHANT PARSING RULES:
- Always return the clean normalized brand name in normalized_merchant, not the raw bank string
- Personal transfers (Zelle to a person, Venmo to a person) → normalized_merchant: "Personal Transfer"
- ATM withdrawals → normalized_merchant: "ATM Withdrawal"
- Loan or credit card payments → normalized_merchant: use the card/bank name; add "Payment" only when the raw text explicitly says payment
- Bracketed partner_context is classifier-only evidence and must be removed from normalized_merchant
- Unknown local merchant with MCC → use MCC to classify, keep merchant name as is
- Unknown local merchant without MCC → Miscellaneous & Unclassified at 0.4`;

// ─── TOOL SCHEMA ──────────────────────────────────────────────────────────────
export const CLASSIFICATION_TOOL = [
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

// ─── DEFAULT CONFIG (mirrors the Lambda) ──────────────────────────────────────
export const CLASSIFY_DEFAULTS = {
  batchSize: 24,
  subBatchSize: 8,
  concurrencyLimit: 5,
  maxRetries: 3,
  baseDelayMs: 1000,
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Classifier-only partner context (e.g. "Acme [partner_context: rail=ach; ...]")
// is appended to raw_merchant before classification. Strip it before the value
// is ever used as a user-facing clean merchant name.
export function stripPartnerContext(merchant) {
  if (typeof merchant !== 'string') return merchant;
  return merchant.replace(/\s*\[partner_context:[^\]]*\]\s*$/, '').trim();
}

// Summarize an HTTP-shaped transaction into the compact object the model sees.
// Shared so the eval harness feeds the model the exact same fields production does.
export function summarizeHttpTransaction(t) {
  return {
    transaction_id: t.transaction_id,
    merchant: t.merchant_name,
    amount: t.amount,
    date: t.date,
    ...(t.mcc_code && { mcc_code: t.mcc_code }),
    ...(t.rail && { rail: t.rail }),
    ...(t.source_profile && { source_profile: t.source_profile }),
    ...(t.transaction_type && { transaction_type: t.transaction_type }),
    ...(t.partner_metadata?.personal_finance_category && {
      plaid_pfc: t.partner_metadata.personal_finance_category,
    }),
    ...(t.zip_code && { zip: t.zip_code }),
  };
}

function getDelayMs(attempt, baseDelayMs) {
  const base = baseDelayMs * Math.pow(2, attempt);
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

// ─── CORE MODEL GATEWAY API CALL ──────────────────────────────────────────────
async function callClassificationAPI(batch, model, batchNum, attempt, deps) {
  const { modelGateway, provider, functionName, onRateLimit } = deps;
  const { response: res, metadata } = await modelGateway.chatCompletion({
    task: 'merchant_classification',
    model,
    ...(provider ? { provider } : {}),
    label: `BATCH ${batchNum}`,
    maxRetries: 0,
    messages: [
      { role: 'system', content: CLASSIFICATION_PROMPT },
      {
        role: 'user',
        content: `Classify these ${batch.length} transactions:\n${JSON.stringify(batch, null, 2)}`,
      },
    ],
    tools: CLASSIFICATION_TOOL,
    tool_choice: { type: 'function', function: { name: 'classify_batch' } },
  });

  if (!res.ok) {
    if (is429(res.status)) {
      console.warn(
        `[${metadata.provider.toUpperCase()}] 429 rate limit hit on BATCH ${batchNum}`
      );
      onRateLimit(functionName);
      const tagged = new Error(`429 rate limit on batch ${batchNum}`);
      tagged.is429 = true;
      tagged.retryAfterMs = parseRetryAfterMs(res.headers.get('retry-after'));
      throw tagged;
    }
    const err = await res.text().catch(() => '');
    console.error(
      `[BATCH ${batchNum}] ${metadata.provider}/${metadata.model} error (${res.status}): ${err.slice(0, 200)}`
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
async function classifyBatch(batch, batchIndex, deps) {
  const { model: fastModel, fallbackModel, maxRetries, baseDelayMs } = deps;
  const batchNum = batchIndex + 1;
  let last429 = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const model = attempt === maxRetries ? fallbackModel : fastModel;
    if (attempt > 0) {
      const delay = last429
        ? (last429.retryAfterMs ?? get429DelayMs(attempt - 1))
        : getDelayMs(attempt - 1, baseDelayMs);
      await new Promise((r) => setTimeout(r, delay));
    }
    try {
      const { classifications } = await callClassificationAPI(
        batch,
        model,
        batchNum,
        attempt,
        deps
      );
      if (classifications.length > 0) {
        console.log(
          `[BATCH ${batchNum}] ✓ ${classifications.length}/${batch.length}`
        );
        return classifications;
      }
      last429 = null;
    } catch (e) {
      if (e?.is429) {
        last429 = e;
      } else {
        last429 = null;
        console.error(`[BATCH ${batchNum}] Exception (attempt ${attempt}):`, e);
      }
    }
  }
  return [];
}

async function classifyWithSubBatchFallback(batch, batchIndex, deps) {
  const { fallbackModel, subBatchSize, baseDelayMs } = deps;
  const results = await classifyBatch(batch, batchIndex, deps);
  if (results.length > 0) return results;

  if (batch.length > subBatchSize) {
    const subBatches = [];
    for (let i = 0; i < batch.length; i += subBatchSize)
      subBatches.push(batch.slice(i, i + subBatchSize));

    const all = [];
    for (let si = 0; si < subBatches.length; si++) {
      let last429 = null;
      for (let attempt = 0; attempt <= 2; attempt++) {
        if (attempt > 0) {
          const delay = last429
            ? (last429.retryAfterMs ?? get429DelayMs(attempt - 1))
            : getDelayMs(attempt, baseDelayMs);
          await new Promise((r) => setTimeout(r, delay));
        }
        try {
          const { classifications } = await callClassificationAPI(
            subBatches[si],
            fallbackModel,
            `${batchIndex + 1}.${si + 1}`,
            attempt,
            deps
          );
          if (classifications.length > 0) {
            all.push(...classifications);
            break;
          }
          last429 = null;
        } catch (e) {
          if (e?.is429) {
            last429 = e;
          } else {
            last429 = null;
            console.error(`[SUB-BATCH] Error:`, e);
          }
        }
      }
    }
    if (all.length > 0) return all;
  }
  return [];
}

/**
 * Classify an array of already-summarized transactions (the compact objects the
 * model sees). Batches, runs with bounded concurrency, and applies the same
 * per-batch retry + sub-batch fallback as production. Returns the flat list of
 * classification objects: { transaction_id, normalized_merchant, pillar,
 * subcategory, confidence }.
 *
 * @param {object[]} summaries
 * @param {object} options
 * @param {object} options.modelGateway   gateway with chatCompletion()
 * @param {string} options.model          primary ("fast") model
 * @param {string} options.fallbackModel  model used on the final attempt / sub-batches
 * @param {string} [options.provider]     provider override (eval only; Lambda omits to use route default)
 * @param {number} [options.batchSize]
 * @param {number} [options.subBatchSize]
 * @param {number} [options.concurrencyLimit]
 * @param {number} [options.maxRetries]
 * @param {number} [options.baseDelayMs]
 * @param {string} [options.functionName]
 * @param {(functionName:string)=>void} [options.onRateLimit] fired on a 429 (Lambda publishes CloudWatch metric)
 */
export async function classifyTransactionSummaries(summaries, options) {
  const deps = {
    provider: undefined,
    batchSize: CLASSIFY_DEFAULTS.batchSize,
    subBatchSize: CLASSIFY_DEFAULTS.subBatchSize,
    concurrencyLimit: CLASSIFY_DEFAULTS.concurrencyLimit,
    maxRetries: CLASSIFY_DEFAULTS.maxRetries,
    baseDelayMs: CLASSIFY_DEFAULTS.baseDelayMs,
    functionName: 'ventus-classify-transactions',
    onRateLimit: () => {},
    ...options,
  };
  if (!deps.modelGateway) throw new Error('classifyTransactionSummaries requires a modelGateway');
  if (!deps.model) throw new Error('classifyTransactionSummaries requires a model');
  if (!deps.fallbackModel) deps.fallbackModel = deps.model;

  const batches = [];
  for (let i = 0; i < summaries.length; i += deps.batchSize)
    batches.push(summaries.slice(i, i + deps.batchSize));

  const batchResults = await runWithConcurrency(
    batches,
    deps.concurrencyLimit,
    (batch, idx) => classifyWithSubBatchFallback(batch, idx, deps)
  );
  return batchResults.flat();
}
