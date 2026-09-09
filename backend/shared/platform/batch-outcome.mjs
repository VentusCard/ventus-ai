/**
 * Batch terminal webhooks: batch_complete | batch_partial | batch_failed.
 * Fires at most once per batch_id (batch_outcome_webhook_at on pipeline_runs).
 */

const WARNING_MESSAGE_LIMIT = 500;

export async function appendPipelineWarning(
  db,
  { batchId, customerId = null, code, message }
) {
  const entry = {
    at: new Date().toISOString(),
    customer_id: customerId,
    code,
    message: String(message || '').slice(0, WARNING_MESSAGE_LIMIT),
  };

  const params = [JSON.stringify([entry]), batchId];
  let sql = `UPDATE pipeline_runs
     SET warnings = COALESCE(warnings, '[]'::jsonb) || $1::jsonb
     WHERE batch_id = $2`;

  if (customerId) {
    sql += ` AND customer_id = $3`;
    params.push(customerId);
  }

  try {
    await db.query(sql, params);
  } catch (err) {
    console.warn('[BATCH] Failed to append pipeline warning:', err.message);
  }
}

export async function markCustomerPipelineFailed(
  db,
  { batchId, customerId, bankId, errorMessage },
  fireWebhook
) {
  await db
    .query(
      `UPDATE pipeline_runs
       SET status = 'failed', error_message = $1
       WHERE batch_id = $2 AND customer_id = $3`,
      [String(errorMessage || 'unknown error').slice(0, WARNING_MESSAGE_LIMIT), batchId, customerId]
    )
    .catch(() => {});

  await appendPipelineWarning(db, {
    batchId,
    customerId,
    code: 'customer_failed',
    message: errorMessage,
  });

  if (fireWebhook) {
    await checkAndEmitBatchOutcome(db, batchId, bankId, fireWebhook);
  }
}

/**
 * When every customer in the batch is terminal (complete or failed), emit one outcome webhook.
 */
export async function checkAndEmitBatchOutcome(db, batchId, bankId, fireWebhook) {
  let stats;
  try {
    stats = await db.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
         COUNT(*) FILTER (WHERE stages_complete >= 4)::int AS complete,
         COUNT(*) FILTER (
           WHERE status <> 'failed' AND stages_complete < 4
         )::int AS in_progress
       FROM pipeline_runs
       WHERE batch_id = $1`,
      [batchId]
    );
  } catch (err) {
    console.warn('[BATCH] Failed to read pipeline_runs:', err.message);
    return;
  }

  const { total, failed, complete, in_progress } = stats.rows[0] || {};
  if (!total || in_progress > 0) return;

  const terminal = failed + complete;
  if (terminal < total) return;

  let eventType;
  let payload;

  if (complete === total) {
    eventType = 'batch_complete';
    payload = {
      schema_version: 1,
      batch_id: batchId,
      customers_processed: complete,
      customers_failed: 0,
      status: 'complete',
    };
  } else if (failed === total) {
    eventType = 'batch_failed';
    payload = {
      schema_version: 1,
      batch_id: batchId,
      customers_processed: 0,
      customers_failed: failed,
      status: 'failed',
    };
  } else if (complete > 0 && failed > 0) {
    eventType = 'batch_partial';
    payload = {
      schema_version: 1,
      batch_id: batchId,
      customers_processed: complete,
      customers_failed: failed,
      status: 'partial',
    };
  } else {
    return;
  }

  let claim;
  try {
    claim = await db.query(
      `UPDATE pipeline_runs
       SET batch_outcome_webhook_at = NOW(), batch_outcome_event = $2
       WHERE batch_id = $1 AND batch_outcome_webhook_at IS NULL
       RETURNING customer_id`,
      [batchId, eventType]
    );
  } catch (err) {
    console.warn('[BATCH] Failed to claim batch outcome webhook:', err.message);
    return;
  }

  if (!claim.rows.length) return;

  console.log(`[BATCH] Firing ${eventType} for batch ${batchId}`);
  await fireWebhook(db, bankId, eventType, payload);
}
