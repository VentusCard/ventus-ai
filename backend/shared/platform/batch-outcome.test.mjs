import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  appendPipelineWarning,
  checkAndEmitBatchOutcome,
  markCustomerPipelineFailed,
} from './batch-outcome.mjs';

function createPipelineDb(initialRows) {
  const rows = initialRows.map((r) => ({
    warnings: [],
    batch_outcome_webhook_at: null,
    batch_outcome_event: null,
    stages_complete: 0,
    ...r,
  }));
  const webhooks = [];

  return {
    rows,
    webhooks,
    async query(sql, params) {
      if (sql.includes('COUNT(*)::int AS total')) {
        const batchId = params[0];
        const batchRows = rows.filter((r) => r.batch_id === batchId);
        const total = batchRows.length;
        const failed = batchRows.filter((r) => r.status === 'failed').length;
        const complete = batchRows.filter((r) => r.stages_complete >= 4).length;
        const in_progress = batchRows.filter(
          (r) => r.status !== 'failed' && r.stages_complete < 4
        ).length;
        return { rows: [{ total, failed, complete, in_progress }] };
      }

      if (sql.includes('batch_outcome_webhook_at = NOW()')) {
        const batchId = params[0];
        const event = params[1];
        const targets = rows.filter(
          (r) => r.batch_id === batchId && !r.batch_outcome_webhook_at
        );
        if (!targets.length) return { rows: [] };
        for (const row of targets) {
          row.batch_outcome_webhook_at = new Date();
          row.batch_outcome_event = event;
        }
        return { rows: [{ customer_id: targets[0].customer_id }] };
      }

      if (sql.includes("status = 'failed'")) {
        const [message, batchId, customerId] = params;
        const row = rows.find(
          (r) => r.batch_id === batchId && r.customer_id === customerId
        );
        if (row) {
          row.status = 'failed';
          row.error_message = message;
        }
        return { rows: [] };
      }

      if (sql.includes('warnings = COALESCE')) {
        const [entryJson, batchId, customerId] = params;
        const entry = JSON.parse(entryJson)[0];
        const targets = customerId
          ? rows.filter((r) => r.batch_id === batchId && r.customer_id === customerId)
          : rows.filter((r) => r.batch_id === batchId);
        for (const row of targets) {
          row.warnings = [...(row.warnings || []), entry];
        }
        return { rows: [] };
      }

      return { rows: [] };
    },
  };
}

test('checkAndEmitBatchOutcome fires batch_complete when all customers complete', async () => {
  const db = createPipelineDb([
    { batch_id: 'b1', customer_id: 'c1', status: 'complete', stages_complete: 4 },
    { batch_id: 'b1', customer_id: 'c2', status: 'complete', stages_complete: 4 },
  ]);
  const fireWebhook = async (_db, bankId, eventType, payload) => {
    db.webhooks.push({ bankId, eventType, payload });
  };

  await checkAndEmitBatchOutcome(db, 'b1', 'bank_1', fireWebhook);

  assert.equal(db.webhooks.length, 1);
  assert.equal(db.webhooks[0].eventType, 'batch_complete');
  assert.equal(db.webhooks[0].payload.status, 'complete');
  assert.equal(db.webhooks[0].payload.customers_processed, 2);
});

test('checkAndEmitBatchOutcome fires batch_partial when mixed outcomes', async () => {
  const db = createPipelineDb([
    { batch_id: 'b1', customer_id: 'c1', status: 'complete', stages_complete: 4 },
    { batch_id: 'b1', customer_id: 'c2', status: 'failed', stages_complete: 1 },
  ]);
  const fireWebhook = async (_db, _bankId, eventType, payload) => {
    db.webhooks.push({ eventType, payload });
  };

  await checkAndEmitBatchOutcome(db, 'b1', 'bank_1', fireWebhook);

  assert.equal(db.webhooks[0].eventType, 'batch_partial');
  assert.equal(db.webhooks[0].payload.customers_processed, 1);
  assert.equal(db.webhooks[0].payload.customers_failed, 1);
});

test('checkAndEmitBatchOutcome fires batch_failed when all failed', async () => {
  const db = createPipelineDb([
    { batch_id: 'b1', customer_id: 'c1', status: 'failed', stages_complete: 0 },
    { batch_id: 'b1', customer_id: 'c2', status: 'failed', stages_complete: 0 },
  ]);
  const fireWebhook = async (_db, _bankId, eventType, payload) => {
    db.webhooks.push({ eventType, payload });
  };

  await checkAndEmitBatchOutcome(db, 'b1', 'bank_1', fireWebhook);

  assert.equal(db.webhooks[0].eventType, 'batch_failed');
  assert.equal(db.webhooks[0].payload.customers_failed, 2);
});

test('checkAndEmitBatchOutcome does not fire while customers in progress', async () => {
  const db = createPipelineDb([
    { batch_id: 'b1', customer_id: 'c1', status: 'complete', stages_complete: 4 },
    { batch_id: 'b1', customer_id: 'c2', status: 'classified', stages_complete: 1 },
  ]);
  const fireWebhook = async () => {
    db.webhooks.push({});
  };

  await checkAndEmitBatchOutcome(db, 'b1', 'bank_1', fireWebhook);
  assert.equal(db.webhooks.length, 0);
});

test('checkAndEmitBatchOutcome fires at most once per batch', async () => {
  const db = createPipelineDb([
    { batch_id: 'b1', customer_id: 'c1', status: 'complete', stages_complete: 4 },
  ]);
  const fireWebhook = async () => {
    db.webhooks.push({});
  };

  await checkAndEmitBatchOutcome(db, 'b1', 'bank_1', fireWebhook);
  await checkAndEmitBatchOutcome(db, 'b1', 'bank_1', fireWebhook);
  assert.equal(db.webhooks.length, 1);
});

test('markCustomerPipelineFailed appends warning and may emit batch outcome', async () => {
  const db = createPipelineDb([
    { batch_id: 'b1', customer_id: 'c1', status: 'failed', stages_complete: 0 },
    { batch_id: 'b1', customer_id: 'c2', status: 'complete', stages_complete: 4 },
  ]);
  const fireWebhook = async (_db, _bankId, eventType) => {
    db.webhooks.push({ eventType });
  };

  await markCustomerPipelineFailed(
    db,
    {
      batchId: 'b1',
      customerId: 'c1',
      bankId: 'bank_1',
      errorMessage: 'classify timeout',
    },
    fireWebhook
  );

  const row = db.rows.find((r) => r.customer_id === 'c1');
  assert.equal(row.status, 'failed');
  assert.equal(row.warnings[0].code, 'customer_failed');
  assert.equal(db.webhooks[0].eventType, 'batch_partial');
});
