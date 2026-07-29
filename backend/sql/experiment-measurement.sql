-- Persistent experiment membership and outcome events for incremental measurement.
-- Assignments are created before activation and never mutated. Outcome events are
-- idempotent, append-only, and contain opaque household tokens rather than direct PII.

CREATE TABLE IF NOT EXISTS experiment_assignments (
  tenant_id text NOT NULL,
  experiment_id text NOT NULL,
  household_token text NOT NULL CHECK (household_token ~ '^tok_[A-Za-z0-9_-]{8,120}$'),
  assignment_id text NOT NULL,
  arm text NOT NULL CHECK (arm IN ('treatment', 'holdout')),
  holdout_pct numeric(5,2) NOT NULL CHECK (holdout_pct BETWEEN 1 AND 50),
  bucket integer NOT NULL CHECK (bucket BETWEEN 0 AND 9999),
  evidence_class text NOT NULL DEFAULT 'synthetic'
    CHECK (evidence_class IN ('synthetic', 'sandbox', 'sanctioned')),
  assigned_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, experiment_id, household_token),
  UNIQUE (tenant_id, assignment_id)
);

ALTER TABLE experiment_assignments
  ADD COLUMN IF NOT EXISTS evidence_class text NOT NULL DEFAULT 'synthetic'
  CHECK (evidence_class IN ('synthetic', 'sandbox', 'sanctioned'));

CREATE TABLE IF NOT EXISTS outcome_events (
  tenant_id text NOT NULL,
  event_id text NOT NULL,
  experiment_id text NOT NULL,
  household_token text NOT NULL,
  growth_play_id text NOT NULL,
  decision_id text NOT NULL,
  activation_id text,
  event_type text NOT NULL,
  occurred_at timestamptz NOT NULL,
  arm text NOT NULL CHECK (arm IN ('treatment', 'holdout')),
  assigned_at timestamptz NOT NULL,
  metric text CHECK (metric IN ('deposit_balance', 'deposit_retained', 'net_new_assets', 'estimated_revenue')),
  amount numeric,
  currency text CHECK (currency IS NULL OR currency = 'USD'),
  source_system text NOT NULL,
  source_record_id text,
  reason_code text,
  payload jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, event_id),
  FOREIGN KEY (tenant_id, experiment_id, household_token)
    REFERENCES experiment_assignments (tenant_id, experiment_id, household_token),
  CHECK (assigned_at <= occurred_at),
  CHECK ((metric IS NULL AND amount IS NULL AND currency IS NULL) OR
         (metric IS NOT NULL AND amount IS NOT NULL AND currency = 'USD'))
);

CREATE INDEX IF NOT EXISTS outcome_events_experiment_idx
  ON outcome_events (tenant_id, experiment_id, arm, occurred_at);

CREATE OR REPLACE FUNCTION reject_measurement_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'experiment measurement records are immutable';
END;
$$;

DROP TRIGGER IF EXISTS experiment_assignments_no_mutation ON experiment_assignments;
CREATE TRIGGER experiment_assignments_no_mutation
  BEFORE UPDATE OR DELETE ON experiment_assignments
  FOR EACH ROW EXECUTE FUNCTION reject_measurement_mutation();

DROP TRIGGER IF EXISTS outcome_events_no_mutation ON outcome_events;
CREATE TRIGGER outcome_events_no_mutation
  BEFORE UPDATE OR DELETE ON outcome_events
  FOR EACH ROW EXECUTE FUNCTION reject_measurement_mutation();

ALTER TABLE experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_events ENABLE ROW LEVEL SECURITY;

-- Tenant-scoped policies are deployment-specific and intentionally absent. RLS denies
-- access until the authenticated service role and tenant context are configured.
