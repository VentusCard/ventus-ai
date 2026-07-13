-- Tenant isolation policy for Ventus decision, assignment, exposure, and outcome evidence.
-- Apply only after decision-ledger.sql, experiment-measurement.sql, and
-- connected-expansion-measurement.sql.
-- Runtime roles must be NOSUPERUSER NOBYPASSRLS and must set app.current_tenant_id
-- inside each transaction before accessing these tables.

CREATE OR REPLACE FUNCTION ventus_current_tenant_id()
RETURNS text
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT CASE
    WHEN current_setting('app.current_tenant_id', true) ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$'
      THEN current_setting('app.current_tenant_id', true)
    ELSE NULL
  END
$$;

DROP POLICY IF EXISTS decision_ledger_tenant_isolation ON decision_ledger_events;
CREATE POLICY decision_ledger_tenant_isolation
  ON decision_ledger_events
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE decision_ledger_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS experiment_assignment_tenant_isolation ON experiment_assignments;
CREATE POLICY experiment_assignment_tenant_isolation
  ON experiment_assignments
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE experiment_assignments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outcome_event_tenant_isolation ON outcome_events;
CREATE POLICY outcome_event_tenant_isolation
  ON outcome_events
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE outcome_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS connected_exposure_tenant_isolation ON connected_exposure_events;
CREATE POLICY connected_exposure_tenant_isolation
  ON connected_exposure_events
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE connected_exposure_events FORCE ROW LEVEL SECURITY;

COMMENT ON FUNCTION ventus_current_tenant_id() IS
  'Returns a validated transaction-local Ventus tenant context; null fails RLS closed.';
