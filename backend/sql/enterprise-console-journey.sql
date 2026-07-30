-- Adds the human-response event required by the authenticated Growth Console.
-- The ledger remains append-only; responses and delivery reservations are
-- projections of one Decision Package, never browser-owned records.

ALTER TABLE decision_ledger_events
  DROP CONSTRAINT IF EXISTS decision_ledger_events_event_type_check;

ALTER TABLE decision_ledger_events
  ADD CONSTRAINT decision_ledger_events_event_type_check
  CHECK (event_type IN (
    'signal', 'enrich', 'score', 'gate', 'decision', 'policy',
    'activation', 'outcome', 'counterfactual', 'skill', 'response'
  ));

CREATE INDEX IF NOT EXISTS decision_ledger_decision_projection_idx
  ON decision_ledger_events (tenant_id, (payload->>'decision_id'), sequence_number DESC)
  WHERE event_type IN ('decision', 'response', 'activation');
