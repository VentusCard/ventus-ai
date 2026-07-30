-- Pilot-ready persistence target for the local evaluation ledger in src/lib/ledger.ts.
-- The application must append events inside a transaction and serialize each tenant's
-- sequence with pg_advisory_xact_lock(hashtext(tenant_id)). Updates/deletes are blocked.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS decision_ledger_events (
  tenant_id text NOT NULL,
  sequence_number bigint NOT NULL,
  event_id uuid NOT NULL DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'signal', 'enrich', 'score', 'gate', 'decision', 'policy',
    'activation', 'outcome', 'counterfactual', 'skill', 'response'
  )),
  household_token text,
  growth_play_id text,
  model_provider text,
  model_name text,
  model_version text,
  policy_version text,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'simulated', 'suppressed', 'failed')),
  payload jsonb NOT NULL,
  previous_hash text NOT NULL,
  event_hash text NOT NULL,
  occurred_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, sequence_number),
  UNIQUE (event_id),
  UNIQUE (tenant_id, idempotency_key),
  UNIQUE (tenant_id, event_hash)
);

CREATE INDEX IF NOT EXISTS decision_ledger_household_idx
  ON decision_ledger_events (tenant_id, household_token, recorded_at DESC);

CREATE INDEX IF NOT EXISTS decision_ledger_growth_play_idx
  ON decision_ledger_events (tenant_id, growth_play_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS decision_ledger_assignment_context_idx
  ON decision_ledger_events (tenant_id, household_token, (payload->>'experiment_id'), sequence_number DESC)
  WHERE event_type = 'counterfactual';

CREATE INDEX IF NOT EXISTS decision_ledger_activation_context_idx
  ON decision_ledger_events (tenant_id, household_token, (payload->>'decision_id'), sequence_number DESC)
  WHERE event_type = 'activation';

CREATE OR REPLACE FUNCTION reject_decision_ledger_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'decision ledger events are append-only';
END;
$$;

DROP TRIGGER IF EXISTS decision_ledger_no_update ON decision_ledger_events;
CREATE TRIGGER decision_ledger_no_update
  BEFORE UPDATE OR DELETE ON decision_ledger_events
  FOR EACH ROW EXECUTE FUNCTION reject_decision_ledger_mutation();

ALTER TABLE decision_ledger_events ENABLE ROW LEVEL SECURITY;

-- Deployment must create tenant-scoped policies tied to the authenticated service role.
-- No permissive policy is included intentionally: RLS defaults to deny.
