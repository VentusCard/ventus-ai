-- Model evaluation ledger for shadow model routing and judge outputs.
-- Apply manually to Aurora (Query Editor / psql) before persisting shadow
-- evaluation records. Safe to re-run.

CREATE TABLE IF NOT EXISTS model_evaluation_runs (
  evaluation_id UUID PRIMARY KEY,
  bank_id TEXT,
  batch_id TEXT,
  customer_id TEXT,
  source_system TEXT,
  task TEXT NOT NULL,
  production_task TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  compared_provider TEXT,
  compared_model TEXT,
  invocation_id UUID,
  status TEXT NOT NULL DEFAULT 'recorded'
    CHECK (status IN ('recorded', 'passed', 'failed', 'needs_review')),
  score NUMERIC,
  judge_verdict TEXT
    CHECK (judge_verdict IS NULL OR judge_verdict IN ('pass', 'fail', 'needs_review')),
  cost_estimate_usd NUMERIC,
  latency_ms INTEGER,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_modes JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_model_evaluation_runs_task_created
  ON model_evaluation_runs (task, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_evaluation_runs_bank_created
  ON model_evaluation_runs (bank_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_model_evaluation_runs_batch_customer
  ON model_evaluation_runs (batch_id, customer_id);

CREATE INDEX IF NOT EXISTS idx_model_evaluation_runs_status_created
  ON model_evaluation_runs (status, created_at DESC);

