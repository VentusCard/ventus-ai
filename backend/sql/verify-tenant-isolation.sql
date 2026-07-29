\set ON_ERROR_STOP on

-- Run as the proposed non-production runtime role after applying all six migrations.
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

INSERT INTO connector_delivery_receipts (
  tenant_id, delivery_id, idempotency_key, connector, destination, decision_id,
  action_id, requested_by_session_id, request_hash, status, payload, requested_at
) VALUES (
  'tenant_isolation_probe_a', 'dlv_aaaaaaaaaaaaaaaaaaaaaaaa', 'probe_delivery_a',
  'salesforce', 'Salesforce FSC Task', 'probe_decision_a', 'probe_action_a',
  'probe_session_a', repeat('c', 64), 'pending', '{"probe":true}'::jsonb, now()
);

INSERT INTO experiment_assignments (
  tenant_id, experiment_id, household_token, assignment_id, arm, experiment_design,
  holdout_pct, standalone_pct, connected_pct, bucket, evidence_class, assigned_at,
  authorization_scope_id, authorization_approved_at, authorization_expires_at,
  authorized_business_lines, authorized_signal_classes, decision_protocol_id
) VALUES (
  'tenant_isolation_probe_a', 'connected_probe', 'tok_connected_probe_a', 'asn_connected_probe_a',
  'connected', 'connected_incrementality', 10, 45, 45, 9000, 'sandbox', now(),
  'scope_connected_probe', now() - interval '1 day', now() + interval '30 days',
  '["consumer","wealth"]'::jsonb, '["relationship_signal"]'::jsonb,
  'connected_protocol_v1'
);

INSERT INTO connected_exposure_events (
  tenant_id, event_id, experiment_id, household_token, arm, decision_evaluated, action_delivered,
  connected_data_used, authorization_scope_id, occurred_at, payload, decision_protocol_id
) VALUES (
  'tenant_isolation_probe_a', 'exposure_probe_a', 'connected_probe', 'tok_connected_probe_a',
  'connected', true, true, true, 'scope_connected_probe', now(), '{"probe":true}'::jsonb,
  'connected_protocol_v1'
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
  IF EXISTS (
    SELECT 1 FROM connector_delivery_receipts
    WHERE tenant_id = 'tenant_isolation_probe_a'
  ) THEN
    RAISE EXCEPTION 'cross-tenant delivery receipt was visible';
  END IF;
  IF EXISTS (
    SELECT 1 FROM connected_exposure_events
    WHERE tenant_id = 'tenant_isolation_probe_a'
  ) THEN
    RAISE EXCEPTION 'cross-tenant connected exposure was visible';
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

DO $$
BEGIN
  BEGIN
    INSERT INTO growth_play_protocols (
      tenant_id, decision_protocol_id, growth_play_id, version, business_line,
      protocol_digest, contract, registered_by, registered_by_session_id,
      identity_provider, registered_at
    ) VALUES (
      'tenant_isolation_probe_b', 'dcp_runtime_self_approval', 'deposit-primacy-defense',
      '1.0.0', 'consumer-banking', repeat('d', 64), '{}'::jsonb, 'runtime_probe',
      'runtime_probe_session', 'runtime_forbidden', now()
    );
    RAISE EXCEPTION 'runtime role unexpectedly wrote a Growth Play protocol';
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
  IF (SELECT count(*) FROM connector_delivery_receipts WHERE tenant_id = 'tenant_isolation_probe_a') <> 1 THEN
    RAISE EXCEPTION 'same-tenant read did not return the delivery probe';
  END IF;
  IF (SELECT count(*) FROM connected_exposure_events WHERE tenant_id = 'tenant_isolation_probe_a') <> 1 THEN
    RAISE EXCEPTION 'same-tenant read did not return the connected-exposure probe';
  END IF;
END
$$;

SELECT set_config('app.current_tenant_id', '', true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM decision_ledger_events) THEN
    RAISE EXCEPTION 'missing tenant context did not fail closed';
  END IF;
  IF EXISTS (SELECT 1 FROM connector_delivery_receipts) THEN
    RAISE EXCEPTION 'missing tenant context exposed delivery receipts';
  END IF;
  IF EXISTS (SELECT 1 FROM connected_exposure_events) THEN
    RAISE EXCEPTION 'missing tenant context exposed connected exposures';
  END IF;
  IF EXISTS (SELECT 1 FROM growth_play_protocols) THEN
    RAISE EXCEPTION 'missing tenant context exposed Growth Play protocols';
  END IF;
  IF EXISTS (SELECT 1 FROM growth_play_protocol_approval_events) THEN
    RAISE EXCEPTION 'missing tenant context exposed Growth Play approvals';
  END IF;
END
$$;

ROLLBACK;
