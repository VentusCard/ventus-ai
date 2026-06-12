-- Webhook payload v2: thin entity IDs, batch outcome dedup, pipeline warnings.
-- Apply manually to Aurora (Query Editor / psql) before deploying lambdas that
-- reference these columns. Safe to re-run: all statements use IF NOT EXISTS.

ALTER TABLE customer_life_events
  ADD COLUMN IF NOT EXISTS webhook_fired_at TIMESTAMPTZ;

ALTER TABLE customer_risk_factors
  ADD COLUMN IF NOT EXISTS webhook_fired_at TIMESTAMPTZ;

ALTER TABLE customer_trips
  ADD COLUMN IF NOT EXISTS webhook_fired_at TIMESTAMPTZ;

ALTER TABLE pipeline_runs
  ADD COLUMN IF NOT EXISTS warnings JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE pipeline_runs
  ADD COLUMN IF NOT EXISTS batch_outcome_webhook_at TIMESTAMPTZ;

ALTER TABLE pipeline_runs
  ADD COLUMN IF NOT EXISTS batch_outcome_event TEXT;

ALTER TABLE pipeline_runs
  ADD COLUMN IF NOT EXISTS batch_stuck_webhook_at TIMESTAMPTZ;

-- Optional verification after apply:
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE column_name IN (
--   'webhook_fired_at',
--   'warnings',
--   'batch_outcome_webhook_at',
--   'batch_outcome_event',
--   'batch_stuck_webhook_at'
-- )
-- ORDER BY table_name, column_name;
