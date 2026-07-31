-- Append-only governance for versioned, shadow-only Skills. The registry is a
-- current-state projection; transitions and approvals are immutable receipts.

ALTER TABLE skill_shadow_registry
  ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS skill_digest text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS skill_shadow_transition_receipts (
  tenant_id text NOT NULL,
  transition_id text NOT NULL,
  skill_id text NOT NULL,
  version text NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  action text NOT NULL CHECK (action IN ('create_draft', 'submit_shadow', 'request_promotion', 'auto_promote', 'pause')),
  from_status text,
  to_status text NOT NULL CHECK (to_status IN ('draft', 'shadow', 'promotion_review', 'promoted', 'paused')),
  skill_digest text NOT NULL CHECK (skill_digest ~ '^[a-f0-9]{64}$'),
  actor_id text NOT NULL,
  reason text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, transition_id),
  FOREIGN KEY (tenant_id, skill_id, version)
    REFERENCES skill_shadow_registry (tenant_id, skill_id, version)
);

CREATE TABLE IF NOT EXISTS skill_shadow_approval_receipts (
  tenant_id text NOT NULL,
  approval_id text NOT NULL,
  skill_id text NOT NULL,
  version text NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  phase text NOT NULL CHECK (phase IN ('shadow_scope', 'promotion')),
  approval_type text NOT NULL CHECK (approval_type IN ('business_sponsorship', 'risk_review', 'environment_route')),
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected')),
  skill_digest text NOT NULL CHECK (skill_digest ~ '^[a-f0-9]{64}$'),
  decided_by text NOT NULL,
  reason text NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, approval_id),
  UNIQUE (tenant_id, skill_id, version, revision, phase, approval_type),
  FOREIGN KEY (tenant_id, skill_id, version)
    REFERENCES skill_shadow_registry (tenant_id, skill_id, version)
);

CREATE INDEX IF NOT EXISTS skill_shadow_transitions_lookup_idx
  ON skill_shadow_transition_receipts (tenant_id, skill_id, version, occurred_at DESC);

CREATE INDEX IF NOT EXISTS skill_shadow_approvals_lookup_idx
  ON skill_shadow_approval_receipts (tenant_id, skill_id, version, revision, phase, decided_at DESC);

CREATE OR REPLACE FUNCTION reject_skill_shadow_receipt_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Skill governance receipts are append-only';
END;
$$;

DROP TRIGGER IF EXISTS skill_shadow_transitions_no_mutation ON skill_shadow_transition_receipts;
CREATE TRIGGER skill_shadow_transitions_no_mutation
  BEFORE UPDATE OR DELETE ON skill_shadow_transition_receipts
  FOR EACH ROW EXECUTE FUNCTION reject_skill_shadow_receipt_mutation();

DROP TRIGGER IF EXISTS skill_shadow_approvals_no_mutation ON skill_shadow_approval_receipts;
CREATE TRIGGER skill_shadow_approvals_no_mutation
  BEFORE UPDATE OR DELETE ON skill_shadow_approval_receipts
  FOR EACH ROW EXECUTE FUNCTION reject_skill_shadow_receipt_mutation();

ALTER TABLE skill_shadow_transition_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_shadow_approval_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_shadow_transition_receipts FORCE ROW LEVEL SECURITY;
ALTER TABLE skill_shadow_approval_receipts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS skill_shadow_transition_receipts_tenant_isolation ON skill_shadow_transition_receipts;
CREATE POLICY skill_shadow_transition_receipts_tenant_isolation ON skill_shadow_transition_receipts
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());

DROP POLICY IF EXISTS skill_shadow_approval_receipts_tenant_isolation ON skill_shadow_approval_receipts;
CREATE POLICY skill_shadow_approval_receipts_tenant_isolation ON skill_shadow_approval_receipts
  FOR ALL USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
