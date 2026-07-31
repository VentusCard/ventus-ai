-- Server-owned drafts, non-secret connector mappings, and mapping-test receipts.
-- Secrets live only in Secrets Manager. These records are scoped by the existing
-- transaction-local tenant context and provide a reviewable configuration trail.

CREATE TABLE IF NOT EXISTS growth_play_drafts (
  tenant_id text NOT NULL,
  draft_id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  contract jsonb NOT NULL CHECK (jsonb_typeof(contract) = 'object'),
  status text NOT NULL CHECK (status IN ('draft', 'registered')),
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, draft_id)
);

CREATE TABLE IF NOT EXISTS connector_mapping_versions (
  tenant_id text NOT NULL,
  mapping_id text NOT NULL,
  connector text NOT NULL CHECK (connector IN ('salesforce-fsc', 'microsoft-outlook', 'slack')),
  version integer NOT NULL CHECK (version > 0),
  status text NOT NULL CHECK (status IN ('draft', 'tested', 'approved', 'active', 'disabled')),
  configuration jsonb NOT NULL CHECK (jsonb_typeof(configuration) = 'object'),
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_tested_at timestamptz,
  last_test_status text CHECK (last_test_status IN ('passed', 'failed')),
  PRIMARY KEY (tenant_id, mapping_id, version)
);

CREATE TABLE IF NOT EXISTS connector_mapping_test_receipts (
  tenant_id text NOT NULL,
  receipt_id text NOT NULL,
  mapping_id text NOT NULL,
  mapping_version integer NOT NULL,
  status text NOT NULL CHECK (status IN ('passed', 'failed')),
  detail text,
  tested_by text NOT NULL,
  tested_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, receipt_id),
  FOREIGN KEY (tenant_id, mapping_id, mapping_version)
    REFERENCES connector_mapping_versions (tenant_id, mapping_id, version)
);

CREATE INDEX IF NOT EXISTS connector_mapping_versions_latest_idx
  ON connector_mapping_versions (tenant_id, mapping_id, version DESC);

CREATE UNIQUE INDEX IF NOT EXISTS connector_mapping_versions_one_active_per_connector_idx
  ON connector_mapping_versions (tenant_id, connector)
  WHERE status = 'active';

-- Connector-return observations are immutable source receipts. They remain
-- separate from experimental outcome_events until an approved assignment and
-- measurement contract make a causal calculation eligible.
CREATE TABLE IF NOT EXISTS outcome_observation_receipts (
  tenant_id text NOT NULL,
  observation_id text NOT NULL,
  decision_id text NOT NULL,
  decision_record_id text NOT NULL,
  household_token text NOT NULL,
  mapping_id text NOT NULL,
  mapping_version integer NOT NULL,
  status text NOT NULL,
  observation jsonb,
  synced_by text NOT NULL,
  synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, observation_id)
);

-- Shadow Skills may be evaluated against a production-safe benchmark, but no
-- shadow candidate becomes active without a separately recorded approval.
CREATE TABLE IF NOT EXISTS skill_shadow_registry (
  tenant_id text NOT NULL,
  skill_id text NOT NULL,
  version text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'shadow', 'promotion_review', 'promoted', 'paused')),
  benchmark jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, skill_id, version)
);

ALTER TABLE growth_play_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_mapping_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_mapping_test_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_observation_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_shadow_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_play_drafts FORCE ROW LEVEL SECURITY;
ALTER TABLE connector_mapping_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE connector_mapping_test_receipts FORCE ROW LEVEL SECURITY;
ALTER TABLE outcome_observation_receipts FORCE ROW LEVEL SECURITY;
ALTER TABLE skill_shadow_registry FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS growth_play_drafts_tenant_isolation ON growth_play_drafts;
CREATE POLICY growth_play_drafts_tenant_isolation ON growth_play_drafts
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
DROP POLICY IF EXISTS connector_mapping_versions_tenant_isolation ON connector_mapping_versions;
CREATE POLICY connector_mapping_versions_tenant_isolation ON connector_mapping_versions
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
DROP POLICY IF EXISTS connector_mapping_receipts_tenant_isolation ON connector_mapping_test_receipts;
CREATE POLICY connector_mapping_receipts_tenant_isolation ON connector_mapping_test_receipts
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
DROP POLICY IF EXISTS outcome_observation_receipts_tenant_isolation ON outcome_observation_receipts;
CREATE POLICY outcome_observation_receipts_tenant_isolation ON outcome_observation_receipts
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
DROP POLICY IF EXISTS skill_shadow_registry_tenant_isolation ON skill_shadow_registry;
CREATE POLICY skill_shadow_registry_tenant_isolation ON skill_shadow_registry
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
