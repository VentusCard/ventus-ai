// lambdas/ingest-transactions/index.mjs
// Triggered by S3 CSV upload → parses → writes to transactions_raw
// → creates pipeline_runs rows → publishes to SQS classify-queue
// → fires batch_started webhook only
// → batch_complete fires from Stage 3 Lambdas when all customers finish

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs';
import { parse } from 'csv-parse/sync';
import { createDbFactory } from '../../shared/platform/db.mjs';
import { resolveSecretId } from '../../shared/platform/secrets.mjs';
import { createWebhookDispatcher } from '../../shared/platform/webhooks.mjs';

const s3 = new S3Client({ region: 'us-east-2' });
const sqs = new SQSClient({ region: 'us-east-2' });

const DATABASE_SECRET_ID = resolveSecretId({ envVar: 'RDS_SECRET_ID' });
const getDB = createDbFactory({ secretId: DATABASE_SECRET_ID });

// ─── FIRE WEBHOOK ─────────────────────────────────────────────────────────────
const fireWebhook = createWebhookDispatcher();

// ─── COLUMN DETECTION ─────────────────────────────────────────────────────────
const COLUMN_ALIASES = {
  home_zip: [
    'home_zip',
    'customer_zip',
    'billing_zip',
    'residential_zip',
    'address_zip',
  ],
  transaction_id: [
    'transaction_id',
    'txn_id',
    'id',
    'trans_id',
    'reference',
    'ref_no',
  ],
  merchant_name: [
    'merchant_name',
    'merchant',
    'vendor',
    'payee',
    'description',
    'name',
    'store',
  ],
  amount: [
    'amount',
    'transaction_amount',
    'debit',
    'credit',
    'sum',
    'total',
    'value',
  ],
  date: [
    'date',
    'transaction_date',
    'posted_date',
    'post_date',
    'trans_date',
    'posting_date',
  ],
  mcc: ['mcc', 'mcc_code', 'category_code', 'merchant_category'],
  zip_code: ['zip_code', 'zip', 'postal_code', 'merchant_zip'],
  customer_id: [
    'customer_id',
    'account_id',
    'user_id',
    'client_id',
    'account_number',
  ],
};

function detectColumns(headers) {
  const mapping = {};
  const norm = headers.map((h) => h.toLowerCase().trim().replace(/\s+/g, '_'));
  Object.entries(COLUMN_ALIASES).forEach(([field, aliases]) => {
    const match = norm.find((h) => aliases.includes(h));
    if (match) mapping[field] = headers[norm.indexOf(match)];
  });
  return mapping;
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateTransaction(row, headerMap, index) {
  try {
    let merchant_name = '',
      amount = 0,
      date = '',
      transaction_id = '',
      customer_id = '',
      mcc = '',
      zip_code = '',
      home_zip = '';

    Object.entries(headerMap).forEach(([field, col]) => {
      const v = row[col];
      if (field === 'merchant_name') merchant_name = String(v || '').trim();
      if (field === 'amount')
        amount = parseFloat(String(v || '0').replace(/[$,]/g, ''));
      if (field === 'date') date = String(v || '').trim();
      if (field === 'transaction_id') transaction_id = String(v || '').trim();
      if (field === 'customer_id') customer_id = String(v || '').trim();
      if (field === 'mcc') mcc = String(v || '').trim();
      if (field === 'zip_code') zip_code = String(v || '').trim();
      if (field === 'home_zip') home_zip = String(v || '').trim();
    });

    if (!merchant_name || !date) {
      console.warn(
        `[ROW ${index + 1}] Missing merchant_name or date, skipping`
      );
      return null;
    }
    if (isNaN(amount)) {
      console.warn(`[ROW ${index + 1}] Invalid amount, skipping`);
      return null;
    }
    if (!transaction_id) transaction_id = `txn_${Date.now()}_${index}`;

    const parsedDate = parseDate(date);
    if (!parsedDate) {
      console.warn(`[ROW ${index + 1}] Invalid date: ${date}, skipping`);
      return null;
    }

    return {
      transaction_id,
      merchant_name,
      amount,
      date: parsedDate,
      customer_id,
      mcc,
      zip_code,
      home_zip,
    };
  } catch (err) {
    console.warn(`[ROW ${index + 1}] Validation failed: ${err.message}`);
    return null;
  }
}

function parseDate(dateStr) {
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
  } catch {
    return null;
  }
}

// ─── DB ───────────────────────────────────────────────────────────────────────
// Shared DB connection factory is initialized at module load.

// ─── WRITE RAW TRANSACTIONS ───────────────────────────────────────────────────
async function writeRawToRDS(db, transactions, batchId, bankId, sourceFile) {
  for (const txn of transactions) {
    await db.query(
      `INSERT INTO transactions_raw
  (transaction_id, customer_id, bank_id, batch_id, raw_merchant,
   amount, transaction_date, mcc_code, zip_code, home_zip, source_file, processed)
 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,false)
       ON CONFLICT (transaction_id) DO NOTHING`,
      [
        txn.transaction_id,
        txn.customer_id,
        bankId,
        batchId,
        txn.merchant_name,
        txn.amount,
        txn.date,
        txn.mcc,
        txn.zip_code,
        txn.home_zip || null,
        sourceFile,
      ]
    );
  }
  console.log(`[RDS] ✓ Wrote ${transactions.length} raw transactions`);
}

// ─── CREATE PIPELINE_RUNS ROWS (one per customer) ─────────────────────────────
async function createPipelineRuns(
  db,
  customerGroups,
  batchId,
  bankId,
  sourceFile
) {
  for (const [customerId, txns] of Object.entries(customerGroups)) {
    await db.query(
      `INSERT INTO pipeline_runs
        (batch_id, bank_id, customer_id, source_file, transaction_count, status, ingested_at)
       VALUES ($1,$2,$3,$4,$5,'ingested',NOW())
       ON CONFLICT (batch_id, customer_id) DO NOTHING`,
      [batchId, bankId, customerId, sourceFile, txns.length]
    );
  }
  console.log(
    `[RDS] ✓ Created pipeline_runs for ${Object.keys(customerGroups).length} customers`
  );
}

// ─── PUBLISH TO SQS (one message per customer) ────────────────────────────────
async function publishToClassifyQueue(customerGroups, batchId, bankId) {
  const queueUrl = process.env.CLASSIFY_QUEUE_URL;
  const customerIds = Object.keys(customerGroups);

  for (let i = 0; i < customerIds.length; i += 10) {
    const chunk = customerIds.slice(i, i + 10);
    await sqs.send(
      new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: chunk.map((customerId, idx) => ({
          Id: String(idx),
          MessageBody: JSON.stringify({
            batch_id: batchId,
            customer_id: customerId,
            bank_id: bankId,
            transaction_count: customerGroups[customerId].length,
          }),
        })),
      })
    );
  }
  console.log(
    `[SQS] ✓ Published ${customerIds.length} messages to classify-queue`
  );
}

// ─── LAMBDA HANDLER ───────────────────────────────────────────────────────────
export const handler = async (event) => {
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  console.log(`[INGEST] Processing s3://${bucket}/${key}`);

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);
  const batchId = `batch_${timestamp}_${key.split('/').pop().replace('.csv', '')}`;
  const bankId = key.includes('/') ? key.split('/')[0] : 'unknown';

  console.log(`[INGEST] batch_id: ${batchId}, bank_id: ${bankId}`);

  // 1. Check for duplicate file upload
  const dupDb = await getDB();
  await dupDb.connect();
  try {
    const existing = await dupDb.query(
      `SELECT batch_id FROM pipeline_runs
       WHERE source_file = $1 AND bank_id = $2
       AND status NOT IN ('failed')
       LIMIT 1`,
      [key, bankId]
    );
    if (existing.rows.length > 0) {
      console.log(
        `[INGEST] Duplicate file detected: ${key} already processed as ${existing.rows[0].batch_id} — skipping`
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Duplicate file — already processed',
          existing_batch_id: existing.rows[0].batch_id,
          file: key,
        }),
      };
    }
  } finally {
    await dupDb.end();
  }

  // 2. Read CSV from S3
  const s3Res = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  const csvText = await s3Res.Body.transformToString();

  // 2. Parse CSV
  const rows = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  if (rows.length === 0) {
    console.warn('[INGEST] No rows found in CSV');
    return { statusCode: 200, body: 'Empty file' };
  }
  console.log(`[INGEST] Parsed ${rows.length} rows`);

  // 3. Detect columns
  const headers = Object.keys(rows[0]);
  const headerMap = detectColumns(headers);
  const missing = ['merchant_name', 'date', 'amount'].filter(
    (f) => !headerMap[f]
  );
  if (missing.length > 0) {
    throw new Error(
      `CSV missing required columns: ${missing.join(', ')}. Found: ${headers.join(', ')}`
    );
  }

  // 4. Validate rows
  const transactions = rows
    .map((row, i) => validateTransaction(row, headerMap, i))
    .filter(Boolean);
  console.log(
    `[INGEST] ${transactions.length}/${rows.length} valid transactions`
  );
  if (transactions.length === 0)
    throw new Error('No valid transactions after validation');

  // 5. Group by customer_id
  const customerGroups = {};
  for (const txn of transactions) {
    const cid = txn.customer_id || 'unknown';
    if (!customerGroups[cid]) customerGroups[cid] = [];
    customerGroups[cid].push(txn);
  }

  const customerCount = Object.keys(customerGroups).length;

  // 6. Write to RDS + create pipeline_runs
  const db = await getDB();
  await db.connect();
  try {
    await writeRawToRDS(db, transactions, batchId, bankId, key);
    await createPipelineRuns(db, customerGroups, batchId, bankId, key);

    // 7. Fire batch_started webhook — bank receives batch_id immediately
    await fireWebhook(db, bankId, 'batch_started', {
      schema_version: 1,
      batch_id: batchId,
      filename: key.split('/').pop(),
      transaction_count: transactions.length,
      customer_count: customerCount,
    });
  } finally {
    await db.end();
  }

  // 8. Publish one SQS message per customer to classify-queue
  await publishToClassifyQueue(customerGroups, batchId, bankId);

  // batch_complete is now fired by Stage 3 Lambdas once all customers
  // have finished all 3 stages (pillar + lifestyle + travel)

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Ingestion complete',
      batch_id: batchId,
      bank_id: bankId,
      total_rows: rows.length,
      valid_transactions: transactions.length,
      customers: customerCount,
      file: key,
    }),
  };
};
