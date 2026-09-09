// lambdas/travel-detection/index.mjs
// Triggered by SQS ventus-travel-queue
// Reads from transactions_enriched → pre-filters travel candidates
// → detects trips via model gateway → writes to customer_trips
// → updates transactions_enriched with trip_id

import { createDbFactory } from '../../shared/platform/db.mjs';
import { createModelGateway } from '../../shared/platform/model-gateway.mjs';
import {
  createSecretsProvider,
  resolveSecretId,
} from '../../shared/platform/secrets.mjs';
import { checkAndEmitBatchOutcome, markCustomerPipelineFailed } from '../../shared/platform/batch-outcome.mjs';
import { createWebhookDispatcher } from '../../shared/platform/webhooks.mjs';

const LAMBDA_NAME =
  process.env.AWS_LAMBDA_FUNCTION_NAME || 'ventus-travel-detection';

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const MODEL_PROVIDER_SECRET_ID = resolveSecretId({
  envVar: 'MODEL_PROVIDER_SECRET_ID',
});
const getDbSecrets = createSecretsProvider({ secretId: DATABASE_SECRET_ID });
const getModelSecrets = createSecretsProvider({
  secretId: MODEL_PROVIDER_SECRET_ID,
});
const modelGateway = createModelGateway({
  getSecrets: getModelSecrets,
  functionName: LAMBDA_NAME,
});

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

// ─── DB ───────────────────────────────────────────────────────────────────────
const getDB = createDbFactory({ getSecrets: getDbSecrets });

function getDelayMs(attempt) {
  const base = BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 0.5 * base;
  return Math.min(base + jitter, 8000);
}

// ─── FIRE WEBHOOK ─────────────────────────────────────────────────────────────
const fireWebhook = createWebhookDispatcher();

// ─── BATCH COMPLETE CHECK ─────────────────────────────────────────────────────
// ─── FETCH ALL ENRICHED TRANSACTIONS FOR CUSTOMER ─────────────────────────────
async function fetchEnrichedTransactions(db, customerId) {
  const res = await db.query(
    `SELECT te.transaction_id, te.customer_id, te.bank_id,
            te.clean_merchant_name, te.lifestyle_category, te.merchant_category,
            te.amount, te.transaction_date, te.zip_code,
            tr.home_zip
     FROM transactions_enriched te
     LEFT JOIN transactions_raw tr ON tr.transaction_id = te.transaction_id
     WHERE te.customer_id = $1
     ORDER BY te.transaction_date ASC`,
    [customerId]
  );
  return res.rows;
}

// ─── TRAVEL ANCHOR KEYWORDS ───────────────────────────────────────────────────
const TRAVEL_ANCHOR_KEYWORDS = [
  'airline',
  'airlines',
  'delta',
  'united',
  'american airlines',
  'southwest',
  'jetblue',
  'spirit',
  'frontier',
  'air canada',
  'british airways',
  'hotel',
  'marriott',
  'hilton',
  'hyatt',
  'sheraton',
  'westin',
  'intercontinental',
  'holiday inn',
  'hampton inn',
  'courtyard',
  'residence inn',
  'doubletree',
  'airbnb',
  'vrbo',
  'inn',
  'suites',
  'resort',
  'lodge',
  'hertz',
  'avis',
  'budget',
  'enterprise',
  'national',
  'alamo',
  'thrifty',
  'car rental',
  'rent a car',
  'amtrak',
  'greyhound',
];

function isTravelAnchor(merchant) {
  const m = merchant?.toLowerCase() || '';
  return TRAVEL_ANCHOR_KEYWORDS.some((kw) => m.includes(kw));
}

// ─── PRE-FILTER TRAVEL CANDIDATES ─────────────────────────────────────────────
function filterTravelCandidates(transactions, homeZip) {
  const anchorDates = transactions
    .filter((t) => isTravelAnchor(t.merchant))
    .map((t) => new Date(t.date).getTime());

  return transactions.filter((t) => {
    if (isTravelAnchor(t.merchant)) return true;
    if (t.zip && t.zip !== homeZip && t.zip !== 'unknown') return true;
    const txDate = new Date(t.date).getTime();
    return anchorDates.some(
      (anchorDate) => Math.abs(txDate - anchorDate) <= 3 * 24 * 60 * 60 * 1000
    );
  });
}

// ─── TRAVEL DETECTION PROMPT ──────────────────────────────────────────────────
function buildPrompt(homeZip) {
  return `You are analyzing PRE-FILTERED transactions that were flagged as potential travel because they have zip codes different from home or are travel anchors (hotels, flights, car rentals).

HOME ZIP: ${homeZip}

YOUR JOB: Identify COMPLETE TRIPS by looking at temporal and geographic clustering.

EXAMPLE:
CHICAGO TRIP (home zip 10001):
- Delta Air Lines → Travel anchor (departure)
- Marriott Chicago (zip 60601) → Travel anchor
- Hertz Car Rental (zip 60601) → Travel anchor
- Lou Malnatis (zip 60601) → Part of trip
- Shell Gas (zip 60601) → Part of trip
- Delta Air Lines → Travel anchor (return)
ALL belong to one Chicago trip Feb 3-6.

KEY RULES:
1. Group transactions into complete trips using travel anchors as anchors
2. Include surrounding non-home zip transactions within ±3 days of anchors as part of the trip
3. Return ONE entry per TRIP not one entry per transaction
4. trip_id must be unique e.g. trip_chicago_20260203
5. transaction_ids must list every transaction that belongs to this trip
6. reclassified_transactions lists only those needing subcategory changes`;
}

// ─── TOOL SCHEMA ──────────────────────────────────────────────────────────────
const TRAVEL_TOOL = [
  {
    type: 'function',
    function: {
      name: 'detect_travel_patterns',
      description:
        'Identify complete trips from transaction clusters. Returns one entry per trip, not one per transaction.',
      parameters: {
        type: 'object',
        properties: {
          detected_trips: {
            type: 'array',
            description: 'One entry per detected trip',
            items: {
              type: 'object',
              properties: {
                trip_id: {
                  type: 'string',
                  description:
                    'Unique trip identifier e.g. trip_chicago_20260203',
                },
                destination: {
                  type: 'string',
                  description: 'City or region name e.g. Chicago, Miami',
                },
                trip_start: {
                  type: 'string',
                  description: 'ISO date of first trip transaction',
                },
                trip_end: {
                  type: 'string',
                  description: 'ISO date of last trip transaction',
                },
                is_upcoming: {
                  type: 'boolean',
                  description: 'true if trip has not happened yet',
                },
                transaction_ids: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'All transaction IDs belonging to this trip',
                },
                reclassified_transactions: {
                  type: 'array',
                  description:
                    'Transactions needing subcategory reclassification at destination',
                  items: {
                    type: 'object',
                    properties: {
                      transaction_id: { type: 'string' },
                      reclassified_subcategory: {
                        type: 'string',
                        description:
                          'e.g. Dining Away, Travel Transportation, Travel Essentials',
                      },
                    },
                    required: ['transaction_id', 'reclassified_subcategory'],
                  },
                },
              },
              required: [
                'trip_id',
                'destination',
                'trip_start',
                'trip_end',
                'transaction_ids',
              ],
            },
          },
        },
        required: ['detected_trips'],
      },
    },
  },
];

// ─── CALL MODEL GATEWAY FOR TRAVEL DETECTION ──────────────────────────────────
async function callTravelDetectionAI(
  candidates,
  homeZip,
  batchNum,
  attempt
) {
  const { response: res, metadata } = await modelGateway.chatCompletion({
    task: 'travel_detection',
    label: `TRAVEL batch ${batchNum}`,
    maxRetries: MAX_RETRIES,
    maxDelayMs: 8000,
    messages: [
      { role: 'system', content: buildPrompt(homeZip) },
      {
        role: 'user',
        content: `Identify complete trips from these ${candidates.length} pre-filtered travel candidates and call detect_travel_patterns:\n\n${JSON.stringify(candidates, null, 2)}`,
      },
    ],
    tools: TRAVEL_TOOL,
    tool_choice: 'auto',
  });

  if (!res.ok) {
    const err = await res.text().catch(() => '');
    console.error(
      `[BATCH ${batchNum}] ${metadata.provider}/${metadata.model} error (${res.status}): ${err.slice(0, 200)}`
    );
    return [];
  }

  const data = await res.json();
  const choice = data.choices?.[0];

  if (
    choice?.finish_reason === 'error' ||
    choice?.native_finish_reason === 'MALFORMED_FUNCTION_CALL'
  ) {
    console.error(`[BATCH ${batchNum}] Malformed function call`);
    console.log(`[TRAVEL] Model raw:`, JSON.stringify(choice, null, 2));
    return [];
  }

  const toolCalls = choice?.message?.tool_calls;
  if (!toolCalls?.length) {
    console.warn(`[BATCH ${batchNum}] No tool calls (attempt ${attempt})`);
    console.log(`[TRAVEL] Model raw:`, JSON.stringify(choice, null, 2));
    return [];
  }

  try {
    const args = toolCalls[0].function.arguments;
    const results = typeof args === 'string' ? JSON.parse(args) : args;
    return results.detected_trips || [];
  } catch (e) {
    console.error(`[BATCH ${batchNum}] JSON parse error:`, e.message);
    return [];
  }
}

// ─── PROCESS TRAVEL CANDIDATES WITH RETRIES ───────────────────────────────────
async function processTravelCandidates(candidates, homeZip) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = getDelayMs(attempt - 1);
      console.log(`[TRAVEL] Retry ${attempt} (delay: ${Math.round(delay)}ms)`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const trips = await callTravelDetectionAI(
        candidates,
        homeZip,
        1,
        attempt
      );
      if (trips.length > 0) {
        console.log(`[TRAVEL] ✓ Detected ${trips.length} trips`);
        return trips;
      }
    } catch (e) {
      console.error(`[TRAVEL] Exception (attempt ${attempt}):`, e.message);
    }
  }

  console.warn(`[TRAVEL] All attempts failed, returning no trips`);
  return [];
}

// ─── WRITE TRIPS TO customer_trips ────────────────────────────────────────────
async function writeTrips(db, customerId, bankId, batchId, detectedTrips) {
  const webhookTripIds = [];

  for (const trip of detectedTrips) {
    const txnIds = trip.transaction_ids || [];
    if (txnIds.length === 0) continue;

    const tripId = `trip_${customerId}_${trip.destination.toLowerCase().replace(/\s+/g, '_')}_${trip.trip_start.replace(/-/g, '')}`;
    trip.customerScopedTripId = tripId;

    const spendRes = await db.query(
      `SELECT 
         SUM(amount) as total_spend,
         COUNT(*) as txn_count,
         SUM(CASE WHEN merchant_category IN ('Flights','Car Rentals','Travel Transportation','Local Transportation') THEN amount ELSE 0 END) as transport,
         SUM(CASE WHEN merchant_category IN ('Hotels & Lodging') THEN amount ELSE 0 END) as lodging,
         SUM(CASE WHEN merchant_category IN ('Dining Out','Dining Away','Coffee & Cafes','Fast Food','Delivery & Takeout') THEN amount ELSE 0 END) as dining,
         SUM(CASE WHEN merchant_category IN ('Tours & Activities') THEN amount ELSE 0 END) as activities
       FROM transactions_enriched
       WHERE transaction_id = ANY($1)`,
      [txnIds]
    );

    const spend = spendRes.rows[0];
    const total = parseFloat(spend.total_spend || 0);
    const transport = parseFloat(spend.transport || 0);
    const lodging = parseFloat(spend.lodging || 0);
    const dining = parseFloat(spend.dining || 0);
    const activities = parseFloat(spend.activities || 0);
    const other = total - transport - lodging - dining - activities;

    let duration = null;
    if (trip.trip_start && trip.trip_end) {
      const start = new Date(trip.trip_start);
      const end = new Date(trip.trip_end);
      duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    await db.query(
      `INSERT INTO customer_trips
        (trip_id, customer_id, bank_id, batch_id, destination,
         trip_start, trip_end, trip_duration_days,
         total_trip_spend, transaction_count,
         transport_spend, lodging_spend, dining_spend, activities_spend, other_spend,
         is_upcoming, detected_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,NOW())
       ON CONFLICT (trip_id, customer_id, bank_id) DO UPDATE SET
         destination        = EXCLUDED.destination,
         trip_start         = EXCLUDED.trip_start,
         trip_end           = EXCLUDED.trip_end,
         trip_duration_days = EXCLUDED.trip_duration_days,
         total_trip_spend   = EXCLUDED.total_trip_spend,
         transaction_count  = EXCLUDED.transaction_count,
         transport_spend    = EXCLUDED.transport_spend,
         lodging_spend      = EXCLUDED.lodging_spend,
         dining_spend       = EXCLUDED.dining_spend,
         activities_spend   = EXCLUDED.activities_spend,
         other_spend        = EXCLUDED.other_spend,
         is_upcoming        = EXCLUDED.is_upcoming`,
      [
        tripId,
        customerId,
        bankId,
        batchId,
        trip.destination,
        trip.trip_start,
        trip.trip_end,
        duration,
        Math.round(total * 100) / 100,
        txnIds.length,
        Math.round(transport * 100) / 100,
        Math.round(lodging * 100) / 100,
        Math.round(dining * 100) / 100,
        Math.round(activities * 100) / 100,
        Math.round(Math.max(other, 0) * 100) / 100,
        trip.is_upcoming || false,
      ]
    );
    webhookTripIds.push(tripId);
    await db
      .query(
        `UPDATE customer_trips SET webhook_fired_at = NOW() WHERE trip_id = $1 AND customer_id = $2 AND bank_id = $3`,
        [tripId, customerId, bankId]
      )
      .catch((err) =>
        console.warn('[TRAVEL] webhook_fired_at update failed:', err.message)
      );
  }

  console.log(`[RDS] ✓ Wrote ${webhookTripIds.length} trips`);
  return { tripsWritten: webhookTripIds.length, webhookTripIds };
}

// ─── UPDATE transactions_enriched WITH TRIP DATA ──────────────────────────────
async function updateEnrichedTransactions(db, detectedTrips) {
  let updated = 0;

  for (const trip of detectedTrips) {
    for (const txnId of trip.transaction_ids || []) {
      await db.query(
        `UPDATE transactions_enriched SET trip_id = $1 WHERE transaction_id = $2`,
        [trip.customerScopedTripId || trip.trip_id, txnId]
      );
      updated++;
    }
    for (const r of trip.reclassified_transactions || []) {
      await db.query(
        `UPDATE transactions_enriched SET merchant_category = $1 WHERE transaction_id = $2`,
        [r.reclassified_subcategory, r.transaction_id]
      );
    }
  }

  console.log(`[RDS] ✓ Updated ${updated} travel transactions`);
}

// ─── UPDATE PIPELINE_RUNS ─────────────────────────────────────────────────────
async function updatePipelineRuns(db, batchId, customerId) {
  const result = await db.query(
    `UPDATE pipeline_runs
     SET travel_detected_at = NOW(),
         stages_complete = stages_complete + 1,
         status = CASE WHEN stages_complete + 1 >= 4 THEN 'complete' ELSE 'travel_detected' END,
         completed_at = CASE WHEN stages_complete + 1 >= 4 THEN NOW() ELSE completed_at END
     WHERE batch_id = $1 AND customer_id = $2
     RETURNING stages_complete`,
    [batchId, customerId]
  );
  return result.rows[0]?.stages_complete;
}

// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  for (const record of event.Records) {
    const { batch_id, customer_id, bank_id } = JSON.parse(record.body);
    console.log(
      `[TRAVEL] Processing customer ${customer_id} batch ${batch_id}`
    );

    const db = await getDB();
    await db.connect();

    try {
      const transactions = await fetchEnrichedTransactions(db, customer_id);
      if (transactions.length === 0) {
        console.warn(`[TRAVEL] No transactions for ${customer_id}`);
        continue;
      }
      console.log(`[TRAVEL] Found ${transactions.length} transactions`);

      // Use bank-provided home_zip if available, fall back to inference
      const bankProvidedZip =
        transactions.find((t) => t.home_zip)?.home_zip || null;
      let homeZip;
      if (bankProvidedZip) {
        homeZip = bankProvidedZip;
        console.log(`[TRAVEL] Home zip from bank data: ${homeZip}`);
      } else {
        const zipCounts = {};
        for (const t of transactions) {
          if (t.zip_code)
            zipCounts[t.zip_code] = (zipCounts[t.zip_code] || 0) + 1;
        }
        homeZip =
          Object.entries(zipCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          'unknown';
        console.log(`[TRAVEL] Home zip inferred (no bank data): ${homeZip}`);
      }

      const summary = transactions.map((t) => ({
        id: t.transaction_id,
        date: t.transaction_date,
        merchant: t.clean_merchant_name,
        amount: t.amount,
        subcategory: t.merchant_category,
        zip: t.zip_code || 'unknown',
      }));

      // Pre-filter to travel candidates only before sending to the model gateway
      const candidates = filterTravelCandidates(summary, homeZip);
      console.log(
        `[TRAVEL] ${candidates.length}/${summary.length} transactions are travel candidates`
      );

      if (candidates.length === 0) {
        console.log(
          `[TRAVEL] No travel candidates found, skipping model gateway call`
        );
        const stagesComplete = await updatePipelineRuns(
          db,
          batch_id,
          customer_id
        );
        console.log(
          `[TRAVEL] stages_complete: ${stagesComplete}/4 for ${customer_id}`
        );
        if (stagesComplete >= 4)
          await checkAndEmitBatchOutcome(db, batch_id, bank_id, fireWebhook);
        continue;
      }

      const detectedTrips = await processTravelCandidates(
        candidates,
        homeZip
      );
      console.log(`[TRAVEL] ${detectedTrips.length} trips detected`);

      const { tripsWritten, webhookTripIds } = await writeTrips(
        db,
        customer_id,
        bank_id,
        batch_id,
        detectedTrips
      );
      await updateEnrichedTransactions(db, detectedTrips);

      if (webhookTripIds.length > 0) {
        await fireWebhook(db, bank_id, 'trip_detected', {
          schema_version: 1,
          customer_id,
          batch_id,
          trip_ids: webhookTripIds,
        });
        console.log(
          `[WEBHOOK] trip_detected: ${webhookTripIds.length} trip(s) for ${customer_id}`
        );
      } else if (tripsWritten === 0) {
        console.log(`[TRAVEL] No trips written for ${customer_id}`);
      }

      const stagesComplete = await updatePipelineRuns(
        db,
        batch_id,
        customer_id
      );
      console.log(
        `[TRAVEL] stages_complete: ${stagesComplete}/4 for ${customer_id}`
      );

      if (stagesComplete >= 4) {
        await checkAndEmitBatchOutcome(db, batch_id, bank_id, fireWebhook);
      }

      console.log(`[TRAVEL] ✓ Done for customer ${customer_id}`);
    } catch (err) {
      console.error(`[TRAVEL] Error for customer ${customer_id}:`, err);
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
