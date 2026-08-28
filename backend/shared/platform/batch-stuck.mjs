/**
 * Partner webhook for batches with customers past the stuck-job SLA.
 * Fires at most once per batch_id until terminal outcome (batch_stuck_webhook_at).
 */

export function groupStuckJobsByBatch(stuckJobs) {
  const batches = new Map();

  for (const row of stuckJobs) {
    const key = `${row.bank_id}::${row.batch_id}`;
    if (!batches.has(key)) {
      batches.set(key, { bankId: row.bank_id, batchId: row.batch_id });
    }
  }

  return [...batches.values()];
}

async function loadStuckBatchContext(db, batchId, slaMinutes) {
  const result = await db.query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'failed')::int AS failed,
       COUNT(*) FILTER (WHERE stages_complete >= 4)::int AS complete,
       ARRAY_AGG(customer_id ORDER BY customer_id) FILTER (
         WHERE status NOT IN ('complete', 'failed')
           AND completed_at IS NULL
           AND ingested_at < NOW() - ($2::int * INTERVAL '1 minute')
       ) AS stuck_customer_ids
     FROM pipeline_runs
     WHERE batch_id = $1`,
    [batchId, slaMinutes]
  );

  const row = result.rows[0] || {};
  const stuckCustomerIds = (row.stuck_customer_ids || []).filter(Boolean);
  const total = row.total || 0;
  const failed = row.failed || 0;
  const complete = row.complete || 0;

  return {
    total,
    failed,
    complete,
    stuckCustomerIds,
    customersInProgress: Math.max(total - complete - failed, 0),
  };
}

export async function emitBatchStuckWebhooks(db, stuckJobs, fireWebhook, slaMinutes) {
  if (!fireWebhook || stuckJobs.length === 0) return 0;

  const batches = groupStuckJobsByBatch(stuckJobs);
  let emitted = 0;

  for (const { bankId, batchId } of batches) {
    const context = await loadStuckBatchContext(db, batchId, slaMinutes);
    if (context.stuckCustomerIds.length === 0) continue;

    let claim;
    try {
      claim = await db.query(
        `UPDATE pipeline_runs
         SET batch_stuck_webhook_at = NOW()
         WHERE batch_id = $1 AND batch_stuck_webhook_at IS NULL
         RETURNING customer_id`,
        [batchId]
      );
    } catch (err) {
      console.warn(`[BATCH] Failed to claim batch_stuck webhook for ${batchId}:`, err.message);
      continue;
    }

    if (!claim.rows.length) continue;

    console.log(
      `[BATCH] Firing batch_stuck for ${batchId} (${context.stuckCustomerIds.length} customer(s))`
    );

    await fireWebhook(db, bankId, 'batch_stuck', {
      schema_version: 1,
      batch_id: batchId,
      status: 'stuck',
      sla_minutes: slaMinutes,
      stuck_customer_ids: context.stuckCustomerIds,
      customers_complete: context.complete,
      customers_failed: context.failed,
      customers_in_progress: context.customersInProgress,
    });
    emitted += 1;
  }

  return emitted;
}
