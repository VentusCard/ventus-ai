import { randomUUID } from 'node:crypto';

const VALID_STATUSES = new Set(['recorded', 'passed', 'failed', 'needs_review']);
const VALID_JUDGE_VERDICTS = new Set(['pass', 'fail', 'needs_review']);

export function buildModelEvaluationRecord({
  evaluationId = randomUUID(),
  bankId = null,
  batchId = null,
  customerId = null,
  sourceSystem = null,
  task,
  productionTask = null,
  provider,
  model,
  comparedProvider = null,
  comparedModel = null,
  invocationId = null,
  status = 'recorded',
  score = null,
  judgeVerdict = null,
  costEstimateUsd = null,
  latencyMs = null,
  metrics = {},
  failureModes = [],
  notes = null,
} = {}) {
  if (!task) throw new Error('task is required');
  if (!provider) throw new Error('provider is required');
  if (!model) throw new Error('model is required');
  if (!VALID_STATUSES.has(status)) throw new Error(`invalid evaluation status: ${status}`);
  if (judgeVerdict && !VALID_JUDGE_VERDICTS.has(judgeVerdict)) {
    throw new Error(`invalid judge verdict: ${judgeVerdict}`);
  }
  if (score !== null && (typeof score !== 'number' || score < 0 || score > 1)) {
    throw new Error('score must be a number between 0 and 1');
  }
  if (!Array.isArray(failureModes)) throw new Error('failureModes must be an array');

  return {
    evaluationId,
    bankId,
    batchId,
    customerId,
    sourceSystem,
    task,
    productionTask,
    provider,
    model,
    comparedProvider,
    comparedModel,
    invocationId,
    status,
    score,
    judgeVerdict,
    costEstimateUsd,
    latencyMs,
    metrics,
    failureModes,
    notes,
  };
}

export async function recordModelEvaluation(db, input) {
  const record = buildModelEvaluationRecord(input);

  await db.query(
    `INSERT INTO model_evaluation_runs (
       evaluation_id, bank_id, batch_id, customer_id, source_system,
       task, production_task, provider, model, compared_provider, compared_model,
       invocation_id, status, score, judge_verdict, cost_estimate_usd, latency_ms,
       metrics, failure_modes, notes
     )
     VALUES (
       $1,$2,$3,$4,$5,
       $6,$7,$8,$9,$10,$11,
       $12,$13,$14,$15,$16,$17,
       $18::jsonb,$19::jsonb,$20
     )`,
    [
      record.evaluationId,
      record.bankId,
      record.batchId,
      record.customerId,
      record.sourceSystem,
      record.task,
      record.productionTask,
      record.provider,
      record.model,
      record.comparedProvider,
      record.comparedModel,
      record.invocationId,
      record.status,
      record.score,
      record.judgeVerdict,
      record.costEstimateUsd,
      record.latencyMs,
      JSON.stringify(record.metrics),
      JSON.stringify(record.failureModes),
      record.notes,
    ]
  );

  return record;
}

