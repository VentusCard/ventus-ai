// lambdas/analyze-pillar-transactions/index.mjs
// Triggered by SQS ventus-pillar-queue
// Reads from transactions_enriched → groups by pillar → infers purchases
// → writes to customer_pillar_profiles + updates transactions_enriched

import { STATE_TAX_RATES } from './tax-rates.mjs';
import { ZIP_TO_STATE } from './zip-to-state.mjs';
import { createDbFactory } from '../../shared/platform/db.mjs';
import {
  is429,
  get429DelayMs,
  parseRetryAfterMs,
  publishGeminiRateLimit,
} from '../../shared/platform/gemini.mjs';
import { createSecretsProvider, resolveSecretId } from '../../shared/platform/secrets.mjs';
import { checkAndEmitBatchOutcome, markCustomerPipelineFailed } from '../../shared/platform/batch-outcome.mjs';
import { createWebhookDispatcher } from '../../shared/platform/webhooks.mjs';

const LAMBDA_NAME =
  process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-analyze-pillar-transactions';

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const MODEL_PROVIDER_SECRET_ID = resolveSecretId({
  envVar: 'MODEL_PROVIDER_SECRET_ID',
});
const getDbSecrets = createSecretsProvider({ secretId: DATABASE_SECRET_ID });
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
});

// ─── DB ───────────────────────────────────────────────────────────────────────
const getDB = createDbFactory({ getSecrets: getDbSecrets });

function getStateFromZip(zip) {
  if (!zip || zip.length < 3) return null;
  return ZIP_TO_STATE[zip.slice(0, 3)] || null;
}

function getTaxCategory(pillar, subcategory) {
  if (subcategory === 'Grocery' || subcategory === 'Groceries')
    return 'grocery';
  if (
    [
      'Dining Out',
      'Coffee & Cafes',
      'Delivery & Takeout',
      'Fast Food',
      'Restaurants',
    ].includes(subcategory)
  )
    return 'prepared_food';
  if (
    pillar === 'Style & Beauty' &&
    ['Clothing', 'Shoes & Accessories', 'Apparel'].includes(subcategory)
  )
    return 'clothing';
  if (
    pillar === 'Health & Wellness' &&
    [
      'Pharmacy & Prescriptions',
      'Medical & Doctor Visits',
      'Healthcare',
    ].includes(subcategory)
  )
    return 'medical';
  if (
    [
      'Streaming Services',
      'Software & Apps',
      'Cloud Storage',
      'Digital Subscriptions',
    ].includes(subcategory)
  )
    return 'digital';
  return 'general';
}

function calculateTax(amount, zip, pillar, subcategory) {
  const state = getStateFromZip(zip);
  const category = getTaxCategory(pillar, subcategory);
  const config = state ? STATE_TAX_RATES[state] : null;
  const rate = config ? config[category] || 0 : 0.07;
  const preTax = rate > 0 ? amount / (1 + rate) : amount;
  const tax = amount - preTax;
  return {
    pre_tax: Math.round(preTax * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    rate: (rate * 100).toFixed(1) + '%',
    state,
    category,
  };
}

// ─── FIRE WEBHOOK ─────────────────────────────────────────────────────────────
const fireWebhook = createWebhookDispatcher();

// ─── FETCH ALL ENRICHED TRANSACTIONS FOR CUSTOMER ─────────────────────────────
async function fetchEnrichedTransactions(db, customerId) {
  const res = await db.query(
    `SELECT te.transaction_id, te.customer_id, te.bank_id, te.batch_id,
            te.clean_merchant_name, te.lifestyle_category, te.merchant_category,
            te.confidence_score, te.amount, te.transaction_date, te.zip_code,
            tr.mcc_code
     FROM transactions_enriched te
     LEFT JOIN transactions_raw tr ON tr.transaction_id = te.transaction_id
     WHERE te.customer_id = $1
     ORDER BY te.transaction_date DESC`,
    [customerId]
  );
  return res.rows;
}

// ─── CALL GEMINI FOR PURCHASE INFERENCE ──────────────────────────────────────
async function callGeminiForPillarAnalysis(pillarsData, geminiApiKey) {
  const userPrompt = `Analyze these customer transactions and infer what they purchased.

INPUT:
${JSON.stringify(pillarsData, null, 2)}

TASK: For each transaction, infer SPECIFIC products using STRICT PRICE MATCHING.

PRICE-MATCHING RULES:
- Match pre_tax amount to real product prices (±$1)
- If single item doesn't match, find multiple items that sum to pre_tax amount exactly
- Use real retail prices from your knowledge
- MCC codes are provided where available — use them to improve classification accuracy
- Be specific about each item

FORMAT: "product description ($XX.XX pre-tax @ X.X% STATE)"
For multi-item: "item1 ($X) + item2 ($Y) ($XX.XX pre-tax @ X.X% STATE)"

Return ONLY a raw JSON object. No markdown. No backticks. No explanation. Just the JSON.

The JSON must follow this exact structure:
{
  "analyzed_pillars": [
    {
      "pillar": "Food & Dining",
      "totalSpend": 245.50,
      "transactions": [
        {
          "transaction_id": "t1",
          "inferred_purchase": "Venti latte + breakfast sandwich ($5.89 pre-tax @ 8.25% TX)",
          "confidence": 0.92
        }
      ]
    }
  ]
}`;

  let nextDelayMs = null;
  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) {
      const delay = nextDelayMs ?? 1000 * Math.pow(2, attempt - 1);
      console.log(`[PILLAR] Retry ${attempt} (delay: ${Math.round(delay)}ms)`);
      await new Promise((r) => setTimeout(r, delay));
      nextDelayMs = null;
    }

    try {
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${geminiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content:
                  'You are a financial analyst. Return ONLY raw JSON with no markdown, no backticks, no explanation. Your entire response must be a single valid JSON object.',
              },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0,
            max_tokens: 16000,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        if (is429(res.status)) {
          console.warn('[GEMINI] 429 rate limit hit on PILLAR');
          publishGeminiRateLimit(LAMBDA_NAME);
          nextDelayMs =
            parseRetryAfterMs(res.headers.get('retry-after')) ??
            get429DelayMs(attempt);
        }
        console.error(
          `[PILLAR] Gemini error ${res.status}: ${err.slice(0, 200)}`
        );
        continue;
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.warn(`[PILLAR] Empty response (attempt ${attempt})`);
        continue;
      }

      let clean = content.trim();
      if (clean.startsWith('```json')) clean = clean.slice(7);
      if (clean.startsWith('```')) clean = clean.slice(3);
      if (clean.endsWith('```')) clean = clean.slice(0, -3);
      clean = clean.trim();

      try {
        const parsed = JSON.parse(clean);
        if (parsed.analyzed_pillars && Array.isArray(parsed.analyzed_pillars)) {
          console.log(
            `[PILLAR] ✓ Parsed ${parsed.analyzed_pillars.length} pillars from free-form JSON`
          );
          return parsed;
        }
        console.warn(
          `[PILLAR] JSON missing analyzed_pillars (attempt ${attempt})`
        );
      } catch (e) {
        console.error(
          `[PILLAR] JSON parse failed (attempt ${attempt}):`,
          e.message
        );
        console.error(`[PILLAR] Raw content:`, clean.slice(0, 300));
      }
    } catch (e) {
      console.error(`[PILLAR] Exception (attempt ${attempt}):`, e.message);
    }
  }

  console.warn('[PILLAR] All attempts failed, returning empty result');
  return { analyzed_pillars: [] };
}

// ─── WRITE TO customer_pillar_profiles ────────────────────────────────────────
async function writePillarProfiles(
  db,
  customerId,
  bankId,
  pillars,
  totalSpend
) {
  for (const pillar of pillars) {
    const pct = totalSpend > 0 ? pillar.totalSpend / totalSpend : 0;
    const txnDates = pillar.transactions
      .map((t) => new Date(t.transaction_date))
      .filter(Boolean);
    const lastDate =
      txnDates.length > 0
        ? new Date(Math.max(...txnDates)).toISOString().split('T')[0]
        : null;
    const avgTxn =
      pillar.transactions.length > 0
        ? pillar.totalSpend / pillar.transactions.length
        : 0;
    const totalPreTax = pillar.transactions.reduce(
      (sum, t) => sum + (t.pre_tax || t.amount || 0),
      0
    );
    const totalTax = pillar.transactions.reduce(
      (sum, t) => sum + (t.tax || 0),
      0
    );

    await db.query(
      `INSERT INTO customer_pillar_profiles
        (customer_id, bank_id, pillar, total_spend, transaction_count,
         avg_transaction, pct_of_total_spend, last_purchase_date,
         total_pre_tax_spend, total_tax_paid, analyzed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
       ON CONFLICT (customer_id, pillar, bank_id) DO UPDATE SET
         bank_id             = EXCLUDED.bank_id,
         total_spend         = EXCLUDED.total_spend,
         transaction_count   = EXCLUDED.transaction_count,
         avg_transaction     = EXCLUDED.avg_transaction,
         pct_of_total_spend  = EXCLUDED.pct_of_total_spend,
         last_purchase_date  = EXCLUDED.last_purchase_date,
         total_pre_tax_spend = EXCLUDED.total_pre_tax_spend,
         total_tax_paid      = EXCLUDED.total_tax_paid,
         analyzed_at         = NOW()`,
      [
        customerId,
        bankId,
        pillar.pillar,
        pillar.totalSpend,
        pillar.transactions.length,
        Math.round(avgTxn * 100) / 100,
        Math.round(pct * 10000) / 10000,
        lastDate,
        Math.round(totalPreTax * 100) / 100,
        Math.round(totalTax * 100) / 100,
      ]
    );
  }
  console.log(`[RDS] ✓ Wrote ${pillars.length} pillar profiles`);
}

// ─── UPDATE transactions_enriched WITH INFERRED PURCHASES ─────────────────────
async function updateEnrichedTransactions(db, analyzedPillars) {
  let updated = 0;
  for (const pillar of analyzedPillars) {
    for (const txn of pillar.transactions) {
      if (!txn.transaction_id) continue;
      await db.query(
        `UPDATE transactions_enriched SET
           inferred_purchase   = $1,
           purchase_confidence = $2,
           pre_tax_amount      = $3,
           tax_amount          = $4,
           tax_rate            = $5,
           tax_state           = $6
         WHERE transaction_id = $7`,
        [
          txn.inferred_purchase || null,
          txn.confidence || null,
          txn.pre_tax || null,
          txn.tax || null,
          txn.tax_rate || null,
          txn.tax_state || null,
          txn.transaction_id,
        ]
      );
      updated++;
    }
  }
  console.log(
    `[RDS] ✓ Updated ${updated} enriched transactions with inferred purchases`
  );
}

// ─── UPDATE PIPELINE_RUNS ─────────────────────────────────────────────────────
async function updatePipelineRuns(db, batchId, customerId) {
  const result = await db.query(
    `UPDATE pipeline_runs
     SET pillar_analyzed_at = NOW(),
         stages_complete = stages_complete + 1,
         status = CASE WHEN stages_complete + 1 >= 4 THEN 'complete' ELSE 'pillar_analyzed' END,
         completed_at = CASE WHEN stages_complete + 1 >= 4 THEN NOW() ELSE completed_at END
     WHERE batch_id = $1 AND customer_id = $2
     RETURNING stages_complete`,
    [batchId, customerId]
  );
  return result.rows[0]?.stages_complete;
}

// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  const secrets = await getModelSecrets();
  const geminiApiKey = secrets.GEMINI_API_KEY;

  for (const record of event.Records) {
    const { batch_id, customer_id, bank_id } = JSON.parse(record.body);
    console.log(
      `[PILLAR] Processing customer ${customer_id} batch ${batch_id}`
    );

    const db = await getDB();
    await db.connect();

    try {
      const transactions = await fetchEnrichedTransactions(db, customer_id);
      if (transactions.length === 0) {
        console.warn(`[PILLAR] No enriched transactions for ${customer_id}`);
        continue;
      }
      console.log(`[PILLAR] Found ${transactions.length} transactions`);

      const pillarMap = {};
      let totalSpend = 0;

      for (const txn of transactions) {
        const pillar = txn.lifestyle_category || 'Miscellaneous & Unclassified';
        if (!pillarMap[pillar])
          pillarMap[pillar] = { pillar, totalSpend: 0, transactions: [] };

        const tax = calculateTax(
          parseFloat(txn.amount),
          txn.zip_code,
          pillar,
          txn.merchant_category
        );

        pillarMap[pillar].totalSpend += parseFloat(txn.amount);
        pillarMap[pillar].transactions.push({
          transaction_id: txn.transaction_id,
          merchant: txn.clean_merchant_name,
          amount: parseFloat(txn.amount),
          pre_tax: tax.pre_tax,
          tax: tax.tax,
          tax_rate: tax.rate,
          tax_state: tax.state,
          subcategory: txn.merchant_category,
          mcc_code: txn.mcc_code || null,
          transaction_date: txn.transaction_date,
        });

        totalSpend += parseFloat(txn.amount);
      }

      const pillars = Object.values(pillarMap);
      console.log(
        `[PILLAR] ${pillars.length} pillars detected, total spend: $${totalSpend.toFixed(2)}`
      );

      const pillarsSummary = pillars.map((p) => ({
        pillar: p.pillar,
        totalSpend: Math.round(p.totalSpend * 100) / 100,
        transactions: p.transactions.slice(0, 20).map((t) => ({
          transaction_id: t.transaction_id,
          merchant: t.merchant,
          amount: t.amount,
          pre_tax: t.pre_tax,
          tax_rate: t.tax_rate,
          state: t.tax_state,
          subcategory: t.subcategory,
          mcc_code: t.mcc_code,
        })),
      }));

      console.log(`[PILLAR] Calling Gemini for purchase inference...`);
      const aiResult = await callGeminiForPillarAnalysis(
        pillarsSummary,
        geminiApiKey
      );
      console.log(`[PILLAR] ✓ Gemini response received`);

      const analyzedPillars = pillars.map((p) => {
        const aiPillar = aiResult.analyzed_pillars?.find(
          (a) => a.pillar === p.pillar
        );
        return {
          ...p,
          transactions: p.transactions.map((t) => {
            const aiTxn = aiPillar?.transactions?.find(
              (a) => a.transaction_id === t.transaction_id
            );
            return {
              ...t,
              inferred_purchase: aiTxn?.inferred_purchase || null,
              confidence: aiTxn?.confidence || null,
            };
          }),
        };
      });

      await writePillarProfiles(
        db,
        customer_id,
        bank_id,
        analyzedPillars,
        totalSpend
      );
      await updateEnrichedTransactions(db, analyzedPillars);

      const stagesComplete = await updatePipelineRuns(
        db,
        batch_id,
        customer_id
      );
      console.log(
        `[PILLAR] stages_complete: ${stagesComplete}/4 for ${customer_id}`
      );

      if (stagesComplete >= 4) {
        await checkAndEmitBatchOutcome(db, batch_id, bank_id, fireWebhook);
      }

      console.log(`[PILLAR] ✓ Done for customer ${customer_id}`);
    } catch (err) {
      console.error(`[PILLAR] Error for customer ${customer_id}:`, err);
      await markCustomerPipelineFailed(
        db,
        { batchId: batch_id, customerId: customer_id, bankId: bank_id, errorMessage: err.message },
        fireWebhook
      );
      throw err;
    } finally {
      await db.end();
    }
  }

  return { statusCode: 200 };
};
