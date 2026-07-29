import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildModelEvaluationRecord,
  recordModelEvaluation,
} from './model-evaluations.mjs';

test('buildModelEvaluationRecord validates required fields and score bounds', () => {
  assert.throws(() => buildModelEvaluationRecord(), /task is required/);
  assert.throws(
    () =>
      buildModelEvaluationRecord({
        task: 'life_event_detection_shadow',
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        score: 1.2,
      }),
    /score must be a number between 0 and 1/
  );

  const record = buildModelEvaluationRecord({
    task: 'life_event_detection_shadow',
    productionTask: 'life_event_detection',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    score: 0.94,
    judgeVerdict: 'needs_review',
    failureModes: ['unsupported_financial_projection'],
  });

  assert.match(record.evaluationId, /^[0-9a-f-]{36}$/);
  assert.equal(record.status, 'recorded');
  assert.equal(record.score, 0.94);
  assert.deepEqual(record.failureModes, ['unsupported_financial_projection']);
});

test('recordModelEvaluation inserts redacted evaluation metadata', async () => {
  const queries = [];
  const db = {
    async query(sql, params) {
      queries.push({ sql, params });
      return { rows: [] };
    },
  };

  const record = await recordModelEvaluation(db, {
    evaluationId: '00000000-0000-4000-8000-000000000001',
    bankId: 'bank_123',
    batchId: 'batch_123',
    customerId: 'cust_123',
    task: 'life_event_detection_shadow',
    productionTask: 'life_event_detection',
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    comparedProvider: 'gemini',
    comparedModel: 'gemini-2.5-flash',
    invocationId: '00000000-0000-4000-8000-000000000002',
    status: 'needs_review',
    score: 0.82,
    judgeVerdict: 'needs_review',
    costEstimateUsd: 0.004,
    latencyMs: 1200,
    metrics: { evidence_match_rate: 0.75 },
    failureModes: ['life_event_without_evidence'],
    notes: 'summary only, no prompt or transaction payload',
  });

  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /INSERT INTO model_evaluation_runs/);
  assert.equal(queries[0].params[0], '00000000-0000-4000-8000-000000000001');
  assert.equal(queries[0].params[5], 'life_event_detection_shadow');
  assert.equal(queries[0].params[12], 'needs_review');
  assert.equal(queries[0].params[17], JSON.stringify({ evidence_match_rate: 0.75 }));
  assert.equal(queries[0].params[18], JSON.stringify(['life_event_without_evidence']));
  assert.equal(record.task, 'life_event_detection_shadow');
});
