-- Enterprise identity and authorization records for the Ventus Growth Console.
-- Credentials, passwords, MFA factors, and IdP secrets remain in Cognito/Secrets Manager.
-- Apply after tenant-isolation.sql so every table can fail closed through the shared
-- transaction-local tenant context.

CREATE TABLE IF NOT EXISTS institutions (
  tenant_id text PRIMARY KEY,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'pilot'
    CHECK (status IN ('pilot', 'active', 'suspended', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (tenant_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$'),
  CHECK (char_length(display_name) BETWEEN 2 AND 200)
);

CREATE TABLE IF NOT EXISTS institution_identity_providers (
  tenant_id text NOT NULL REFERENCES institutions(tenant_id),
  provider_key text NOT NULL,
  provider_type text NOT NULL
    CHECK (provider_type IN ('cognito', 'saml', 'oidc')),
  issuer text NOT NULL,
  status text NOT NULL DEFAULT 'configured'
    CHECK (status IN ('configured', 'testing', 'active', 'suspended')),
  claim_mapping jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(claim_mapping) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, provider_key),
  CHECK (provider_key ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$'),
  CHECK (char_length(issuer) BETWEEN 8 AND 500)
);

CREATE TABLE IF NOT EXISTS institution_memberships (
  membership_id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES institutions(tenant_id),
  identity_provider_key text NOT NULL,
  identity_subject text NOT NULL,
  email text NOT NULL,
  role text NOT NULL
    CHECK (role IN (
      'ventus_platform_admin',
      'institution_admin',
      'growth_play_owner',
      'bank_operator',
      'risk_reviewer'
    )),
  status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  business_lines text[] NOT NULL DEFAULT '{}',
  entitlements text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_authenticated_at timestamptz,
  UNIQUE (tenant_id, identity_provider_key, identity_subject),
  UNIQUE (tenant_id, email),
  FOREIGN KEY (tenant_id, identity_provider_key)
    REFERENCES institution_identity_providers(tenant_id, provider_key),
  CHECK (membership_id ~ '^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$'),
  CHECK (identity_subject ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{1,255}$'),
  CHECK (email = lower(email)),
  CHECK (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  CHECK (array_position(business_lines, NULL) IS NULL),
  CHECK (array_position(entitlements, NULL) IS NULL)
);

CREATE INDEX IF NOT EXISTS institution_memberships_tenant_status_idx
  ON institution_memberships (tenant_id, status);
CREATE INDEX IF NOT EXISTS institution_memberships_subject_idx
  ON institution_memberships (tenant_id, identity_provider_key, identity_subject);

DROP POLICY IF EXISTS institution_tenant_isolation ON institutions;
CREATE POLICY institution_tenant_isolation
  ON institutions
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institution_identity_provider_tenant_isolation
  ON institution_identity_providers;
CREATE POLICY institution_identity_provider_tenant_isolation
  ON institution_identity_providers
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE institution_identity_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_identity_providers FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institution_membership_tenant_isolation
  ON institution_memberships;
CREATE POLICY institution_membership_tenant_isolation
  ON institution_memberships
  FOR ALL
  USING (tenant_id = ventus_current_tenant_id())
  WITH CHECK (tenant_id = ventus_current_tenant_id());
ALTER TABLE institution_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_memberships FORCE ROW LEVEL SECURITY;

COMMENT ON TABLE institutions IS
  'Tenant source of truth for Ventus institution workspaces; no identity credentials.';
COMMENT ON TABLE institution_identity_providers IS
  'Non-secret Cognito/SAML/OIDC bindings and claim mappings for an institution.';
COMMENT ON TABLE institution_memberships IS
  'Institution-scoped role, business-line, and entitlement authorization for a verified IdP subject.';
