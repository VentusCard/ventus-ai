-- The application runtime can resolve protocols directly, but protocol and
-- approval writes must pass through narrowly scoped procedures. This preserves
-- an application-level workflow while denying direct table mutation to the
-- runtime database role.

CREATE OR REPLACE FUNCTION ventus_append_growth_play_protocol(
  p_tenant_id text,
  p_decision_protocol_id text,
  p_growth_play_id text,
  p_version text,
  p_business_line text,
  p_protocol_digest text,
  p_contract jsonb,
  p_registered_by text,
  p_registered_by_session_id text,
  p_identity_provider text,
  p_registered_at timestamptz
)
RETURNS TABLE (was_inserted boolean, protocol_record jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ventus_evidence, pg_catalog
AS $$
DECLARE
  affected_rows integer;
BEGIN
  IF p_tenant_id IS DISTINCT FROM ventus_current_tenant_id() THEN
    RAISE EXCEPTION 'protocol write tenant context does not match payload';
  END IF;

  INSERT INTO growth_play_protocols AS gp (
    tenant_id, decision_protocol_id, growth_play_id, version, business_line,
    protocol_digest, contract, registered_by, registered_by_session_id,
    identity_provider, registered_at
  ) VALUES (
    p_tenant_id, p_decision_protocol_id, p_growth_play_id, p_version, p_business_line,
    p_protocol_digest, p_contract, p_registered_by, p_registered_by_session_id,
    p_identity_provider, p_registered_at
  ) ON CONFLICT (tenant_id, decision_protocol_id) DO NOTHING
  RETURNING to_jsonb(gp) INTO protocol_record;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  was_inserted := affected_rows = 1;
  IF NOT was_inserted THEN
    SELECT to_jsonb(p.*)
      INTO protocol_record
      FROM growth_play_protocols p
     WHERE p.tenant_id = p_tenant_id
       AND p.decision_protocol_id = p_decision_protocol_id;
  END IF;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION ventus_append_growth_play_protocol_approval(
  p_tenant_id text,
  p_approval_event_id text,
  p_decision_protocol_id text,
  p_decision text,
  p_decided_by text,
  p_decided_by_session_id text,
  p_identity_provider text,
  p_decided_at timestamptz,
  p_change_record_id text,
  p_reason text
)
RETURNS TABLE (was_inserted boolean, approval_record jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ventus_evidence, pg_catalog
AS $$
DECLARE
  affected_rows integer;
BEGIN
  IF p_tenant_id IS DISTINCT FROM ventus_current_tenant_id() THEN
    RAISE EXCEPTION 'protocol approval tenant context does not match payload';
  END IF;

  INSERT INTO growth_play_protocol_approval_events AS ga (
    tenant_id, approval_event_id, decision_protocol_id, decision, decided_by,
    decided_by_session_id, identity_provider, decided_at, change_record_id, reason
  ) VALUES (
    p_tenant_id, p_approval_event_id, p_decision_protocol_id, p_decision, p_decided_by,
    p_decided_by_session_id, p_identity_provider, p_decided_at, p_change_record_id, p_reason
  ) ON CONFLICT (tenant_id, approval_event_id) DO NOTHING
  RETURNING to_jsonb(ga) INTO approval_record;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  was_inserted := affected_rows = 1;
  IF NOT was_inserted THEN
    SELECT to_jsonb(a.*)
      INTO approval_record
      FROM growth_play_protocol_approval_events a
     WHERE a.tenant_id = p_tenant_id
       AND a.approval_event_id = p_approval_event_id;
  END IF;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION ventus_append_growth_play_protocol(
  text, text, text, text, text, text, jsonb, text, text, text, timestamptz
) FROM PUBLIC;
REVOKE ALL ON FUNCTION ventus_append_growth_play_protocol_approval(
  text, text, text, text, text, text, text, timestamptz, text, text
) FROM PUBLIC;
