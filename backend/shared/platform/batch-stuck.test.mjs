import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emitBatchStuckWebhooks, groupStuckJobsByBatch } from './batch-stuck.mjs';

function createPipelineDb(rows) {
  const state = rows.map((row) => ({
    batch_stuck_webhook_at: null,
    ...row,
  }));
  const webhooks = [];

  return {
    state,
    webhooks,
    async query(sql, params) {
      if (sql.includes('ARRAY_AGG(customer_id')) {
        const batchId = params[0];
        const slaMinutes = params[1]; 
        const batchRows = state.filter((r) => r.batch_id === batchId);
        const stuck = batchRows.filter(
          (r) =>
            !['complete', 'failed'].includes(r.status) &&
            r.completed_at == null &&
            r.age_minutes > slaMinutes
        );
        const complete = batchRows.filter((r) => r.stages_complete >= 4).length;
        const failed = batchRows.filter((r) => r.status === 'failed').length;
        return {
          rows: [
            {
              total: batchRows.length,
              failed,
              complete,
              stuck_customer_ids: stuck.map((r) => r.customer_id),
            },
          ],
        };
      }

      if (sql.includes('batch_stuck_webhook_at = NOW()')) {
        const batchId = params[0];
        const targets = state.filter(
          (r) => r.batch_id === batchId && !r.batch_stuck_webhook_at
        );
        if (!targets.length) return { rows: [] };
        for (const row of targets) row.batch_stuck_webhook_at = new Date();
        return { rows: [{ customer_id: targets[0].customer_id }] };
      }

      return { rows: [] };
    },
  };
}

test('groupStuckJobsByBatch deduplicates batches', () => {
  const groups = groupStuckJobsByBatch([
    { bank_id: 'bank_1', batch_id: 'b1', customer_id: 'c1' },
    { bank_id: 'bank_1', batch_id: 'b1', customer_id: 'c2' },
    { bank_id: 'bank_1', batch_id: 'b2', customer_id: 'c3' },
  ]);

  assert.equal(groups.length, 2);
});

test('emitBatchStuckWebhooks fires once with stuck_customer_ids', async () => {
  const db = createPipelineDb([
    {
      batch_id: 'b1',
      bank_id: 'bank_1',
      customer_id: 'c1',
      status: 'pillar_analyzed',
      stages_complete: 1,
      completed_at: null,
      age_minutes: 25,
    },
    {
      batch_id: 'b1',
      bank_id: 'bank_1',
      customer_id: 'c2',
      status: 'classified',
      stages_complete: 1,
      completed_at: null,
      age_minutes: 30,
    },
    {
      batch_id: 'b1',
      bank_id: 'bank_1',
      customer_id: 'c3',
      status: 'complete',
      stages_complete: 4,
      completed_at: new Date(),
      age_minutes: 25,
    },
  ]);

  const fireWebhook = async (_db, bankId, eventType, payload) => {
    db.webhooks.push({ bankId, eventType, payload });
  };

  const emitted = await emitBatchStuckWebhooks(
    db,
    [
      { bank_id: 'bank_1', batch_id: 'b1', customer_id: 'c1' },
      { bank_id: 'bank_1', batch_id: 'b1', customer_id: 'c2' },
    ],
    fireWebhook,
    20
  );

  assert.equal(emitted, 1);
  assert.equal(db.webhooks[0].eventType, 'batch_stuck');
  assert.deepEqual(db.webhooks[0].payload.stuck_customer_ids, ['c1', 'c2']);
  assert.equal(db.webhooks[0].payload.customers_complete, 1);
  assert.equal(db.webhooks[0].payload.sla_minutes, 20);
});

test('emitBatchStuckWebhooks does not re-fire for same batch', async () => {
  const db = createPipelineDb([
    {
      batch_id: 'b1',
      bank_id: 'bank_1',
      customer_id: 'c1',
      status: 'classified',
      stages_complete: 1,
      completed_at: null,
      age_minutes: 25,
    },
  ]);
  const fireWebhook = async () => {
    db.webhooks.push({});
  };

  await emitBatchStuckWebhooks(
    db,
    [{ bank_id: 'bank_1', batch_id: 'b1', customer_id: 'c1' }],
    fireWebhook,
    20
  );
  const second = await emitBatchStuckWebhooks(
    db,
    [{ bank_id: 'bank_1', batch_id: 'b1', customer_id: 'c1' }],
    fireWebhook,
    20
  );

  assert.equal(db.webhooks.length, 1);
  assert.equal(second, 0);
});
