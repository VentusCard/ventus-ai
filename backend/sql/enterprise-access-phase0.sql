-- Phase 0 canonical access alignment. Safe to apply after institution-access.sql
-- to existing pilot databases; no membership is granted or broadened here.

ALTER TABLE institution_memberships
  ADD COLUMN IF NOT EXISTS queue_scopes text[] NOT NULL DEFAULT '{}';

ALTER TABLE institution_memberships
  DROP CONSTRAINT IF EXISTS institution_memberships_role_check;
ALTER TABLE institution_memberships
  ADD CONSTRAINT institution_memberships_role_check
  CHECK (role IN (
    'ventus_platform_admin',
    'institution_admin',
    'growth_play_owner',
    'bank_operator',
    'risk_reviewer',
    'executive_viewer'
  ));

ALTER TABLE institution_memberships
  DROP CONSTRAINT IF EXISTS institution_memberships_queue_scopes_check;
ALTER TABLE institution_memberships
  ADD CONSTRAINT institution_memberships_queue_scopes_check
  CHECK (array_position(queue_scopes, NULL) IS NULL);

COMMENT ON COLUMN institution_memberships.queue_scopes IS
  'Server-authorized work queues. Empty means no customer-level queue assignment.';
