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
  assert.match(source, /crossTenantVisibleExposures !== 0/, 'runtime verification should fail on cross-tenant exposure visibility');
  assert.match(source, /protocolAdminRegistry\.recordApproval/, 'protocol approval should use the admin repository');
  assert.match(source, /protocolRegistry\.requireApproved/, 'runtime repository should resolve the approval');
  assert.match(source, /GRANT SELECT ON[\s\S]*growth_play_protocols,[\s\S]*growth_play_protocol_approval_events[\s\S]*TO \$\{roleName\}/, 'runtime should receive read-only registry access');
  assert.doesNotMatch(source, /GRANT SELECT, INSERT ON[\s\S]{0,180}growth_play_protocols/, 'runtime must not receive registry insert access');
  assert.match(source, /crossTenantVisibleProtocols !== 0/, 'runtime verification should fail on cross-tenant protocol visibility');
  assert.match(source, /runtimeProtocolWriteDenied/, 'runtime verification should prove activation cannot register a protocol');
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
