// lambdas/classify-transactions/index.js
// Triggered by SQS ventus-classify-queue
// Reads from transactions_raw → classifies → writes to transactions_enriched
// → updates pipeline_runs → publishes to pillar, travel, lifestyle queues

import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { createDbFactory } from '../../shared/platform/db.mjs';
import { createModelGateway } from '../../shared/platform/model-gateway.mjs';
import { publishGeminiRateLimit } from '../../shared/platform/gemini.mjs';
import {
  classifyTransactionSummaries,
  stripPartnerContext,
  summarizeHttpTransaction,
} from '../../shared/pipeline/classify-core.mjs';
import { markCustomerPipelineFailed } from '../../shared/platform/batch-outcome.mjs';
import { createSecretsProvider, resolveSecretId } from '../../shared/platform/secrets.mjs';
import { createWebhookDispatcher } from '../../shared/platform/webhooks.mjs';

const sqs = new SQSClient({ region: 'us-east-2' });

const LAMBDA_NAME =
  process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-classify-transactions';

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const MODEL_PROVIDER_SECRET_ID = resolveSecretId({
  envVar: 'MODEL_PROVIDER_SECRET_ID',
});
const getDbSecrets = createSecretsProvider({ secretId: DATABASE_SECRET_ID });
const fireWebhook = createWebhookDispatcher();
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
});
const modelGateway = createModelGateway({
  getSecrets: getModelSecrets,
  functionName: LAMBDA_NAME,
});

const PILLAR_QUEUE_URL = process.env.PILLAR_QUEUE_URL;
const TRAVEL_QUEUE_URL = process.env.TRAVEL_QUEUE_URL;
const LIFESTYLE_QUEUE_URL = process.env.LIFESTYLE_QUEUE_URL;
const RISK_QUEUE_URL = process.env.RISK_QUEUE_URL;

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const CONCURRENCY_LIMIT = 5;
const BATCH_SIZE = 24;
const SUB_BATCH_SIZE = 8;
const FAST_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

// Dependencies handed to the shared classification core. The prompt, tool
// schema, batching, retries, and post-processing all live in classify-core.mjs
// so the offline model-eval harness runs this exact code path.
const CLASSIFY_DEPS = {
  modelGateway,
  model: FAST_MODEL,
  fallbackModel: FALLBACK_MODEL,
  batchSize: BATCH_SIZE,
  subBatchSize: SUB_BATCH_SIZE,
  concurrencyLimit: CONCURRENCY_LIMIT,
  functionName: LAMBDA_NAME,
  onRateLimit: (functionName) => publishGeminiRateLimit(functionName),
};

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
    const cleanMerchant =
      c?.normalized_merchant || stripPartnerContext(raw.raw_merchant);
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

// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
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
            transaction_id: r.transaction_id,
            merchant: r.raw_merchant,
            amount: r.amount,
            date: r.transaction_date,
            ...(r.mcc_code && { mcc_code: r.mcc_code }),
            ...(r.zip_code && { zip: r.zip_code }),
          }));

          newClassifications = await classifyTransactionSummaries(
            summary,
            CLASSIFY_DEPS
          );

          const forCache = uncached
            .map((r) => {
              const c = newClassifications.find(
                (x) => x.transaction_id === r.transaction_id
              );
              return c
                ? {
                    raw_merchant: r.raw_merchant,
                    normalized_merchant:
                      c.normalized_merchant ||
                      stripPartnerContext(r.raw_merchant),
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

    const summary = transactions.map(summarizeHttpTransaction);

    const startTime = Date.now();
    const allClassifications = await classifyTransactionSummaries(
      summary,
      CLASSIFY_DEPS
    );

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
