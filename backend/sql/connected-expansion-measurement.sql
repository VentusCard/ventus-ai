-- Adds a three-arm experiment design that measures the incremental value of authorized
-- cross-business signals beyond a business line's standalone result. Apply after
-- experiment-measurement.sql and before tenant-isolation.sql.

ALTER TABLE experiment_assignments
  ADD COLUMN IF NOT EXISTS experiment_design text NOT NULL DEFAULT 'binary',
  ADD COLUMN IF NOT EXISTS standalone_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS connected_pct numeric(5,2),
  ADD COLUMN IF NOT EXISTS authorization_scope_id text,
  ADD COLUMN IF NOT EXISTS authorization_approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS authorization_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS authorized_business_lines jsonb,
  ADD COLUMN IF NOT EXISTS authorized_signal_classes jsonb,
  ADD COLUMN IF NOT EXISTS decision_protocol_id text;

ALTER TABLE experiment_assignments DROP CONSTRAINT IF EXISTS experiment_assignments_arm_check;
ALTER TABLE experiment_assignments
  ADD CONSTRAINT experiment_assignments_arm_check
  CHECK (arm IN ('treatment', 'holdout', 'standalone', 'connected'));

ALTER TABLE experiment_assignments DROP CONSTRAINT IF EXISTS experiment_assignments_design_check;
ALTER TABLE experiment_assignments
  ADD CONSTRAINT experiment_assignments_design_check
  CHECK (
    (experiment_design = 'binary'
      AND arm IN ('treatment', 'holdout')
      AND standalone_pct IS NULL
      AND connected_pct IS NULL
      AND authorization_scope_id IS NULL
      AND authorization_approved_at IS NULL
      AND authorization_expires_at IS NULL
      AND authorized_business_lines IS NULL
      AND authorized_signal_classes IS NULL
      AND decision_protocol_id IS NULL)
    OR
    (experiment_design = 'connected_incrementality'
      AND arm IN ('holdout', 'standalone', 'connected')
      AND standalone_pct BETWEEN 5 AND 90
      AND connected_pct BETWEEN 5 AND 90
      AND abs((holdout_pct + standalone_pct + connected_pct) - 100) < 0.001
      AND authorization_scope_id IS NOT NULL
      AND authorization_approved_at <= assigned_at
      AND assigned_at < authorization_expires_at
      AND jsonb_typeof(authorized_business_lines) = 'array'
      AND jsonb_array_length(authorized_business_lines) >= 2
      AND jsonb_typeof(authorized_signal_classes) = 'array'
      AND jsonb_array_length(authorized_signal_classes) >= 1
      AND decision_protocol_id IS NOT NULL)
  );

ALTER TABLE outcome_events DROP CONSTRAINT IF EXISTS outcome_events_arm_check;
ALTER TABLE outcome_events
  ADD CONSTRAINT outcome_events_arm_check
  CHECK (arm IN ('treatment', 'holdout', 'standalone', 'connected'));

CREATE TABLE IF NOT EXISTS connected_exposure_events (
  tenant_id text NOT NULL,
  event_id text NOT NULL,
  experiment_id text NOT NULL,
  household_token text NOT NULL,
  arm text NOT NULL CHECK (arm IN ('holdout', 'standalone', 'connected')),
  decision_evaluated boolean NOT NULL,
  action_delivered boolean NOT NULL,
  connected_data_used boolean NOT NULL,
  authorization_scope_id text NOT NULL,
  decision_protocol_id text NOT NULL,
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, event_id),
  FOREIGN KEY (tenant_id, experiment_id, household_token)
    REFERENCES experiment_assignments (tenant_id, experiment_id, household_token)
);

ALTER TABLE connected_exposure_events
  ADD COLUMN IF NOT EXISTS decision_evaluated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS decision_protocol_id text;
ALTER TABLE connected_exposure_events ALTER COLUMN decision_evaluated DROP DEFAULT;
ALTER TABLE connected_exposure_events ALTER COLUMN decision_protocol_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS connected_exposure_experiment_idx
  ON connected_exposure_events (tenant_id, experiment_id, arm, occurred_at);

CREATE OR REPLACE FUNCTION validate_connected_exposure_assignment()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM experiment_assignments assignment
     WHERE assignment.tenant_id = NEW.tenant_id
       AND assignment.experiment_id = NEW.experiment_id
       AND assignment.household_token = NEW.household_token
       AND assignment.experiment_design = 'connected_incrementality'
       AND assignment.arm = NEW.arm
       AND assignment.authorization_scope_id = NEW.authorization_scope_id
       AND assignment.decision_protocol_id = NEW.decision_protocol_id
       AND assignment.assigned_at <= NEW.occurred_at
       AND NEW.occurred_at < assignment.authorization_expires_at
  ) THEN
    RAISE EXCEPTION 'connected exposure does not match an active immutable assignment';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS connected_exposure_assignment_guard ON connected_exposure_events;
CREATE TRIGGER connected_exposure_assignment_guard
  BEFORE INSERT ON connected_exposure_events
  FOR EACH ROW EXECUTE FUNCTION validate_connected_exposure_assignment();

DROP TRIGGER IF EXISTS connected_exposure_events_no_mutation ON connected_exposure_events;
CREATE TRIGGER connected_exposure_events_no_mutation
  BEFORE UPDATE OR DELETE ON connected_exposure_events
  FOR EACH ROW EXECUTE FUNCTION reject_measurement_mutation();

ALTER TABLE connected_exposure_events ENABLE ROW LEVEL SECURITY;
