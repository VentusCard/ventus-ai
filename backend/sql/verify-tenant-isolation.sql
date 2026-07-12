\set ON_ERROR_STOP on

-- Run as the proposed non-production runtime role after applying all three migrations.
-- The transaction rolls back every probe record.
BEGIN;

DO $$
DECLARE
  unsafe_role boolean;
BEGIN
  SELECT rolsuper OR rolbypassrls INTO unsafe_role
  FROM pg_roles
  WHERE rolname = current_user;
  IF unsafe_role IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'runtime role % must be NOSUPERUSER NOBYPASSRLS', current_user;
  END IF;
END
$$;

SELECT set_config('app.current_tenant_id', 'tenant_isolation_probe_a', true);

INSERT INTO decision_ledger_events (
  tenant_id, sequence_number, idempotency_key, event_type, status, payload,
  previous_hash, event_hash, occurred_at
) VALUES (
  'tenant_isolation_probe_a', 1, 'probe_event_a', 'signal', 'confirmed',
  '{"probe":true}'::jsonb, repeat('0', 64), repeat('a', 64), now()
);

SELECT set_config('app.current_tenant_id', 'tenant_isolation_probe_b', true);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM decision_ledger_events
    WHERE tenant_id = 'tenant_isolation_probe_a'
  ) THEN
    RAISE EXCEPTION 'cross-tenant read was visible';
  END IF;
END
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO decision_ledger_events (
      tenant_id, sequence_number, idempotency_key, event_type, status, payload,
      previous_hash, event_hash, occurred_at
    ) VALUES (
      'tenant_isolation_probe_a', 2, 'probe_cross_tenant_write', 'signal',
      'confirmed', '{"probe":true}'::jsonb, repeat('a', 64), repeat('b', 64), now()
    );
    RAISE EXCEPTION 'cross-tenant write unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN NULL;
  END;
END
$$;

SELECT set_config('app.current_tenant_id', 'tenant_isolation_probe_a', true);

DO $$
BEGIN
  IF (SELECT count(*) FROM decision_ledger_events WHERE tenant_id = 'tenant_isolation_probe_a') <> 1 THEN
    RAISE EXCEPTION 'same-tenant read did not return the probe record';
  END IF;
END
$$;

SELECT set_config('app.current_tenant_id', '', true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM decision_ledger_events) THEN
    RAISE EXCEPTION 'missing tenant context did not fail closed';
  END IF;
END
$$;

ROLLBACK;
