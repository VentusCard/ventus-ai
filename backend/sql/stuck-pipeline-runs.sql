-- Stuck pipeline run detector for Ventus operations.
-- Replace :stuck_job_sla_minutes with backend/config/pipeline-slas.json stuck_job_sla_minutes.
-- Intended for read-only operations dashboards or a scheduled monitor.

SELECT
  batch_id,
  bank_id,
  customer_id,
  source_file,
  transaction_count,
  status,
  stages_complete,
  error_message,
  ingested_at,
  classified_at,
  pillar_analyzed_at,
  travel_detected_at,
  lifestyle_analyzed_at,
  risk_analyzed_at,
  completed_at,
  EXTRACT(EPOCH FROM (NOW() - COALESCE(ingested_at, NOW()))) / 60 AS age_minutes,
  CASE
    WHEN classified_at IS NULL THEN 'classified_at'
    WHEN pillar_analyzed_at IS NULL THEN 'pillar_analyzed_at'
    WHEN travel_detected_at IS NULL THEN 'travel_detected_at'
    WHEN lifestyle_analyzed_at IS NULL THEN 'lifestyle_analyzed_at'
    WHEN risk_analyzed_at IS NULL THEN 'risk_analyzed_at'
    WHEN completed_at IS NULL THEN 'completed_at'
    ELSE NULL
  END AS missing_stage
FROM pipeline_runs
WHERE status NOT IN ('complete', 'failed')
  AND completed_at IS NULL
  AND ingested_at < NOW() - (:stuck_job_sla_minutes * INTERVAL '1 minute')
ORDER BY ingested_at ASC;
