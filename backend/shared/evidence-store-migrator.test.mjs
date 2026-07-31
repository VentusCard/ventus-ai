import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  APPLY_EVIDENCE_SCHEMA_CONFIRMATION,
  EVIDENCE_STORE_MIGRATIONS,
  PROVISION_CONSOLE_ACCESS_CONFIRMATION,
  checkedPgIdentifier,
  quotePgIdentifier,
  quotePgLiteral,
  validateAccessProvisioning,
} from '../monitors/evidence-store-migrator/migration-safety.mjs';

test('evidence-store migrator validates identifiers and quotes password literals', () => {
  assert.equal(checkedPgIdentifier('ventus_evidence', 'schema'), 'ventus_evidence');
  assert.throws(() => checkedPgIdentifier('public; DROP SCHEMA public', 'schema'));
  assert.equal(quotePgIdentifier('ventus_runtime'), '"ventus_runtime"');
  assert.equal(quotePgLiteral("a'b"), "'a''b'");
  assert.equal(APPLY_EVIDENCE_SCHEMA_CONFIRMATION, 'APPLY_VENTUS_EVIDENCE_SCHEMA');
  assert.deepEqual(EVIDENCE_STORE_MIGRATIONS, [
    'decision-ledger.sql',
    'experiment-measurement.sql',
    'connected-expansion-measurement.sql',
    'growth-play-registry.sql',
    'tenant-isolation.sql',
    'institution-access.sql',
    'enterprise-access-phase0.sql',
    'connector-delivery.sql',
    'enterprise-console-journey.sql',
    'enterprise-product-control-plane.sql',
    'enterprise-skill-governance.sql',
    'enterprise-protocol-writer.sql',
  ]);
});

test('Console access provisioning accepts only explicit institution-scoped grants', () => {
  assert.equal(PROVISION_CONSOLE_ACCESS_CONFIRMATION, 'PROVISION_VENTUS_STAGING_ACCESS');
  assert.deepEqual(validateAccessProvisioning({
    tenantId: 'ventus',
    displayName: 'Ventus AI',
    issuer: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example',
    identitySubject: 'subject_123',
    email: 'Yusheng@VentusAI.com',
    role: 'executive_viewer',
    businessLines: ['consumer-banking', 'wealth'],
    queueScopes: ['wealth-advisory'],
    entitlements: ['growth_console', 'consumer_demo', 'wealth_demo'],
  }), {
    tenantId: 'ventus',
    displayName: 'Ventus AI',
    issuer: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example',
    identitySubject: 'subject_123',
    email: 'yusheng@ventusai.com',
    role: 'executive_viewer',
    businessLines: ['consumer-banking', 'wealth'],
    queueScopes: ['wealth-advisory'],
    entitlements: ['growth_console', 'consumer_demo', 'wealth_demo'],
  });
  assert.throws(() => validateAccessProvisioning({
    tenantId: 'ventus',
    displayName: 'Ventus AI',
    issuer: 'https://issuer.example.com',
    identitySubject: 'subject_123',
    email: 'yusheng@ventusai.com',
    role: 'superuser',
    businessLines: ['wealth'],
    entitlements: ['growth_console'],
  }), /invalid role/);
  assert.throws(() => validateAccessProvisioning({
    tenantId: 'other;drop',
    displayName: 'Other Bank',
    issuer: 'https://issuer.example.com',
    identitySubject: 'subject_123',
    email: 'operator@example.com',
    role: 'bank_operator',
    businessLines: ['wealth'],
    entitlements: ['unknown'],
  }));
  assert.throws(() => validateAccessProvisioning({
    tenantId: 'ventus',
    displayName: 'Ventus AI',
    issuer: 'https://issuer.example.com',
    identitySubject: 'subject_123',
    email: 'operator@example.com',
    role: 'bank_operator',
    businessLines: ['consumer-banking'],
    queueScopes: ['consumer-review;drop'],
    entitlements: ['growth_console', 'consumer_demo'],
  }), /invalid queueScopes/);
});

test('evidence-store migrator verifies connected measurement and separately authorized protocol persistence', () => {
  const source = readFileSync(
    new URL('../monitors/evidence-store-migrator/index.mjs', import.meta.url),
    'utf8',
  );
  assert.match(source, /assignConnectedExpansionExperiment/, 'runtime verification should create a connected assignment');
  assert.match(source, /recordExposure\(exposure\)/, 'runtime verification should persist an exposure receipt');
  assert.match(source, /decisionProtocolId/, 'runtime verification should pin a connected decision protocol');
  assert.match(source, /loadExperiment/, 'runtime verification should read the connected experiment back');
  assert.match(source, /exposureTenantIsolation/, 'runtime verification should report cross-tenant exposure isolation');
  assert.match(source, /protocolAdminRegistry\.recordApproval/, 'protocol approval should use the admin repository');
  assert.match(source, /protocolRegistry\.requireApproved/, 'runtime repository should resolve the approval');
  assert.match(source, /REVOKE INSERT, UPDATE, DELETE ON[\s\S]*growth_play_protocols,[\s\S]*growth_play_protocol_approval_events[\s\S]*FROM \$\{roleName\}/, 'runtime should not write protocols directly');
  assert.match(source, /GRANT EXECUTE ON FUNCTION[\s\S]*ventus_append_growth_play_protocol/, 'runtime should use controlled protocol append procedures');
  assert.match(source, /protocolTenantIsolation/, 'runtime verification should report cross-tenant protocol isolation');
  assert.match(source, /controlledProtocolWriteSucceeded/, 'runtime verification should prove controlled protocol procedures remain usable');
  assert.match(source, /rawProtocolRegistry = createGrowthPlayRegistry\(\{ getDB \}\)/, 'runtime verification should prove raw protocol writes are denied');
  assert.match(source, /institution_memberships/, 'runtime verification should exercise institution membership isolation');
  assert.match(source, /runtimeMembershipWriteDenied/, 'runtime verification should prove activation cannot provision memberships');
  assert.match(
    source,
    /identity_provider_key = 'cognito'[\s\S]*identity_subject = \$2[\s\S]*RETURNING membership_id, email/,
    'access provisioning should update the stable Cognito identity before considering email',
  );
  assert.match(source, /queue_scopes = \$5/, 'access provisioning should write explicit queue scopes');
  assert.match(
    source,
    /ON CONFLICT \(tenant_id, email\) DO UPDATE[\s\S]*identity_provider_key = 'cognito'/,
    'legacy email memberships should be migrated to the Cognito provider',
  );
});

test('protocol writer migration exposes only tenant-bound append procedures', () => {
  const source = readFileSync(
    new URL('../sql/enterprise-protocol-writer.sql', import.meta.url),
    'utf8',
  );
  assert.match(source, /SECURITY DEFINER/, 'controlled protocol procedures should own the narrow write boundary');
  assert.match(source, /p_tenant_id IS DISTINCT FROM ventus_current_tenant_id\(\)/, 'protocol writes should require the transaction tenant context');
  assert.match(source, /REVOKE ALL ON FUNCTION/, 'public callers must not execute protocol writers');
});

test('Skill governance migration seals status changes behind append-only receipts', () => {
  const source = readFileSync(
    new URL('../sql/enterprise-skill-governance.sql', import.meta.url),
    'utf8',
  );
  assert.match(source, /CREATE TABLE IF NOT EXISTS skill_shadow_transition_receipts/);
  assert.match(source, /CREATE TABLE IF NOT EXISTS skill_shadow_approval_receipts/);
  assert.match(source, /action IN \('create_draft', 'submit_shadow', 'request_promotion', 'auto_promote', 'pause'\)/);
  assert.match(source, /UNIQUE \(tenant_id, skill_id, version, revision, phase, approval_type\)/);
  assert.match(source, /Skill governance receipts are append-only/);
  assert.match(source, /FORCE ROW LEVEL SECURITY/);
});
