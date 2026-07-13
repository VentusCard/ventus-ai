-- Tenant-scoped registry for immutable Growth Play protocols and append-only approval events.

CREATE TABLE IF NOT EXISTS growth_play_protocols (
  tenant_id text NOT NULL,
  decision_protocol_id text NOT NULL,
  growth_play_id text NOT NULL,
  version text NOT NULL,
  business_line text NOT NULL,
  protocol_digest text NOT NULL CHECK (protocol_digest ~ '^[a-f0-9]{64}$'),
  contract jsonb NOT NULL,
  registered_by text NOT NULL,
  registered_by_session_id text NOT NULL,
  identity_provider text NOT NULL,
  registered_at timestamptz NOT NULL,
  PRIMARY KEY (tenant_id, decision_protocol_id)
);

CREATE TABLE IF NOT EXISTS growth_play_protocol_approval_events (
  tenant_id text NOT NULL,
  approval_event_id text NOT NULL,
  decision_protocol_id text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approved', 'revoked')),
  decided_by text NOT NULL,
  decided_by_session_id text NOT NULL,
  identity_provider text NOT NULL,
  decided_at timestamptz NOT NULL,
  change_record_id text NOT NULL,
  reason text NOT NULL,
  PRIMARY KEY (tenant_id, approval_event_id),
  FOREIGN KEY (tenant_id, decision_protocol_id)
    REFERENCES growth_play_protocols (tenant_id, decision_protocol_id)
);

CREATE INDEX IF NOT EXISTS growth_play_protocol_approval_lookup
  ON growth_play_protocol_approval_events
  (tenant_id, decision_protocol_id, decided_at DESC, approval_event_id DESC);

CREATE OR REPLACE FUNCTION reject_growth_play_registry_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Growth Play registry records are append-only';
END;
$$;

DROP TRIGGER IF EXISTS growth_play_protocols_no_mutation ON growth_play_protocols;
CREATE TRIGGER growth_play_protocols_no_mutation
  BEFORE UPDATE OR DELETE ON growth_play_protocols
  FOR EACH ROW EXECUTE FUNCTION reject_growth_play_registry_mutation();

DROP TRIGGER IF EXISTS growth_play_approvals_no_mutation ON growth_play_protocol_approval_events;
CREATE TRIGGER growth_play_approvals_no_mutation
  BEFORE UPDATE OR DELETE ON growth_play_protocol_approval_events
  FOR EACH ROW EXECUTE FUNCTION reject_growth_play_registry_mutation();

ALTER TABLE growth_play_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_play_protocol_approval_events ENABLE ROW LEVEL SECURITY;
