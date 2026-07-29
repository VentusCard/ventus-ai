-- At-most-once connector delivery reservations and terminal receipts.
-- Requires tenant-isolation.sql so ventus_current_tenant_id() exists.
-- A pending receipt is intentionally not retried automatically: operators reconcile
-- whether the downstream side effect happened before approving a new idempotency key.

CREATE TABLE IF NOT EXISTS connector_delivery_receipts (
  tenant_id text NOT NULL,
  delivery_id text NOT NULL CHECK (delivery_id ~ '^dlv_[a-f0-9]{24}$'),
  idempotency_key text NOT NULL,
  connector text NOT NULL,
  destination text NOT NULL,
  decision_id text NOT NULL,
  action_id text NOT NULL,
  requested_by_session_id text NOT NULL,
  completed_by_session_id text,
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  status text NOT NULL CHECK (status IN ('pending', 'delivered', 'failed')),
  payload jsonb NOT NULL,
  external_receipt_id text,
  external_receipt_url text,
  error_code text,
  requested_at timestamptz NOT NULL,
  completed_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, delivery_id),
  UNIQUE (tenant_id, idempotency_key),
  CHECK (
    (status = 'pending' AND completed_at IS NULL AND external_receipt_id IS NULL AND error_code IS NULL) OR
    (status = 'delivered' AND completed_at IS NOT NULL AND external_receipt_id IS NOT NULL AND error_code IS NULL) OR
    (status = 'failed' AND completed_at IS NOT NULL AND external_receipt_id IS NULL AND error_code IS NOT NULL)
  )
);

ALTER TABLE connector_delivery_receipts
  DROP CONSTRAINT IF EXISTS connector_delivery_receipts_connector_check;
ALTER TABLE connector_delivery_receipts
  ADD CONSTRAINT connector_delivery_receipts_connector_check CHECK (connector IN (
    'salesforce', 'bank_workbench', 'campaign_platform', 'digital_channel',
    'microsoft_teams', 'microsoft_outlook', 'slack'
  ));

CREATE INDEX IF NOT EXISTS connector_delivery_decision_idx
  ON connector_delivery_receipts (tenant_id, decision_id, requested_at DESC);

CREATE OR REPLACE FUNCTION enforce_connector_delivery_transition()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'connector delivery receipts cannot be deleted';
  END IF;
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'terminal connector delivery receipts are immutable';
  END IF;
  IF NEW.status NOT IN ('delivered', 'failed') THEN
    RAISE EXCEPTION 'connector delivery receipt must transition from pending to a terminal status';
  END IF;
  IF (NEW.tenant_id, NEW.delivery_id, NEW.idempotency_key, NEW.connector, NEW.destination,
      NEW.decision_id, NEW.action_id, NEW.requested_by_session_id, NEW.request_hash,
      NEW.payload, NEW.requested_at)
     IS DISTINCT FROM
     (OLD.tenant_id, OLD.delivery_id, OLD.idempotency_key, OLD.connector, OLD.destination,
      OLD.decision_id, OLD.action_id, OLD.requested_by_session_id, OLD.request_hash,
      OLD.payload, OLD.requested_at) THEN
    RAISE EXCEPTION 'connector delivery request identity is immutable';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS connector_delivery_transition_guard ON connector_delivery_receipts;
CREATE TRIGGER connector_delivery_transition_guard
  BEFORE UPDATE OR DELETE ON connector_delivery_receipts
  FOR EACH ROW EXECUTE FUNCTION enforce_connector_delivery_transition();

ALTER TABLE connector_delivery_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_delivery_receipts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS connector_delivery_tenant_isolation ON connector_delivery_receipts;
CREATE POLICY connector_delivery_tenant_isolation
  ON connector_delivery_receipts
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
