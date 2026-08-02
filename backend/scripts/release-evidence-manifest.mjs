import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCHEMA_VERSION = 'ventus_release_evidence_manifest/v1';
const REPOSITORY = 'VentusCard/ventus-ai';
const FORBIDDEN_KEY = /(secret|password|access.?token|refresh.?token|private.?key|raw.?credential)/i;
const REQUIRED_ACCEPTANCE_ROWS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13'];

/** Build a candidate from the verified staging receipt without inventing missing components. */
export function candidateFromStagingEvidence(source, {
  releaseId = 'bank-review-staging-2026-08-01',
  createdAt = source?.recordedAt ?? new Date().toISOString(),
} = {}) {
  assert.ok(source && typeof source === 'object', 'staging evidence is required');
  const apiEvidence = source.deploymentRuns?.consoleApi ?? {};
  const migration = source.migration ?? {};
  const verification = migration.verification ?? {};
  const migrations = Array.isArray(migration.migrations) ? migration.migrations : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    release: {
      releaseId,
      environmentClass: 'bank_review_staging',
      createdAt,
      repository: REPOSITORY,
      reviewedCommit: source.sourceCommit ?? null,
      reviewerState: { status: 'pending', releaseOwner: null, independentReviewer: null },
    },
    frontend: {
      url: 'https://staging.d1gaewa028qzng.amplifyapp.com',
      amplify: { appId: 'd1gaewa028qzng', branch: 'staging', jobId: null },
      deployedCommit: null,
      buildArtifactDigest: null,
      buildResult: 'unknown',
      observedAt: null,
    },
    api: {
      baseUrl: apiEvidence.baseUrl ?? null,
      stage: 'staging',
      account: source.account ?? null,
      region: source.region ?? null,
      stack: apiEvidence.stack ?? 'VentusConsoleApiStack',
      deployRunId: apiEvidence.runId ?? null,
      deployedCommit: source.sourceCommit ?? null,
      artifactDigests: [],
      deployStatus: apiEvidence.status ?? 'unknown',
      observedAt: source.recordedAt ?? null,
    },
    publicConfiguration: {
      apiTarget: { valueDigest: apiEvidence.baseUrl ? digest(apiEvidence.baseUrl) : null },
      identityTarget: { valueDigest: null },
      enabledFlags: [],
      corsOrigins: [],
      configurationDigest: null,
    },
    identityAuthorization: {
      userPool: { idDigest: null, issuerDigest: null },
      clientIdDigest: null,
      membershipSchemaVersion: null,
      sixRoleReceipt: { id: null, digest: null, result: 'unknown' },
      deniedOperationReceipt: { id: null, digest: null, result: 'unknown' },
    },
    dataPlane: {
      stacks: ['VentusEvidenceStoreStack', 'VentusConsoleApiStack'],
      migration: {
        count: migration.migrationCount ?? migrations.length,
        digests: migrations.map(({ file, sha256 }) => ({ file, sha256 })),
      },
      schemaInventory: Array.isArray(migration.schemaInventory) ? migration.schemaInventory : [],
      runtimeRole: verification.runtimeRole ?? null,
      forcedRlsNonBypass: verification.runtimeRoleNonBypass ?? null,
      ledger: {
        headHash: verification.headHash ?? null,
        verified: verification.hashChainVerified ?? false,
      },
      observedAt: source.recordedAt ?? null,
    },
    integrations: [
      integration('salesforce-fsc'),
      integration('plaid-sandbox'),
    ],
    productContract: {
      decisionPackageVersion: '1.2',
      decisionPackageDigest: null,
      approvedProtocols: [],
      deterministicVersion: null,
      skills: [],
    },
    acceptance: REQUIRED_ACCEPTANCE_ROWS.map((rowId) => ({
      rowId,
      result: 'open',
      artifact: { uri: null, digest: null },
      actor: null,
      timestamp: null,
    })),
    claims: {
      evidenceClass: source.claimBoundary?.evidenceClass ?? 'partner_sandbox',
      measurementStatus: 'not_ready',
      claimStatus: 'not_bank_review_ready',
      businessClaimAllowed: false,
      causalClaimAllowed: false,
      prohibitedWording: ['bank performance', 'causal lift', 'production readiness'],
      knownLimitations: [
        'The verified development frontend is wired to the staging Console API.',
        'Frontend build identity and exact staging promotion are not yet bound.',
      ],
    },
    exceptions: [],
    approval: {
      releaseOwner: { actor: null, receiptId: null, approvedAt: null },
      independentReviewer: { actor: null, receiptId: null, approvedAt: null },
    },
  };
}

export function buildReleaseEvidenceManifest(candidate) {
  assertSafe(candidate);
  const normalized = clone(candidate);
  normalized.schemaVersion = SCHEMA_VERSION;
  normalized.release = normalized.release ?? {};
  normalized.release.repository = normalized.release.repository ?? REPOSITORY;
  normalized.acceptance = normalized.acceptance ?? [];
  const exceptions = dedupeExceptions([
    ...(Array.isArray(normalized.exceptions) ? normalized.exceptions : []),
    ...readinessExceptions(normalized),
  ]);
  normalized.exceptions = exceptions;
  normalized.status = exceptions.some((item) => item.blocksBankReview !== false)
    ? 'not_bank_review_ready'
    : 'bank_review_ready';
  normalized.claims = normalized.claims ?? {};
  normalized.claims.claimStatus = normalized.status;
  const core = withoutDigest(normalized);
  return { ...core, manifestDigest: digest(core) };
}

export function validateReleaseEvidenceManifest(manifest, { requireReady = false } = {}) {
  assertSafe(manifest);
  assert.equal(manifest.schemaVersion, SCHEMA_VERSION, 'manifest schema version is invalid');
  for (const section of [
    'release', 'frontend', 'api', 'publicConfiguration', 'identityAuthorization', 'dataPlane',
    'integrations', 'productContract', 'acceptance', 'claims', 'exceptions', 'approval',
  ]) assert.ok(Object.prototype.hasOwnProperty.call(manifest, section), `manifest section ${section} is required`);
  assert.equal(manifest.release.repository, REPOSITORY, 'manifest repository is invalid');
  assert.ok(REQUIRED_ACCEPTANCE_ROWS.every((rowId) => manifest.acceptance.some((row) => row.rowId === rowId)), 'acceptance matrix is incomplete');
  assert.match(manifest.manifestDigest, /^sha256:[a-f0-9]{64}$/, 'manifest digest is invalid');
  assert.equal(manifest.manifestDigest, digest(withoutDigest(manifest)), 'manifest digest does not match contents');
  assert.ok(['bank_review_ready', 'not_bank_review_ready'].includes(manifest.status), 'manifest status is invalid');
  assert.equal(manifest.claims?.claimStatus, manifest.status, 'claim status does not match manifest status');
  const derived = buildReleaseEvidenceManifest(withoutDigest(manifest));
  assert.equal(manifest.status, derived.status, 'manifest readiness was not derived from its components');
  assert.deepEqual(manifest.exceptions, derived.exceptions, 'manifest exceptions do not match its components');
  if (requireReady) assert.equal(manifest.status, 'bank_review_ready', 'manifest is not bank-review ready');
  return manifest;
}

function readinessExceptions(manifest) {
  const missing = [];
  const has = (value) => value !== null && value !== undefined && value !== '';
  const isDigest = (value) => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/.test(value);
  const add = (code, detail) => missing.push({ code, severity: 'blocking', blocksBankReview: true, owner: 'release_owner', effect: detail });
  const frontend = manifest.frontend ?? {};
  const amplify = frontend.amplify ?? {};
  const api = manifest.api ?? {};
  const config = manifest.publicConfiguration ?? {};
  const identity = manifest.identityAuthorization ?? {};
  const dataPlane = manifest.dataPlane ?? {};
  const ledger = dataPlane.ledger ?? {};
  const product = manifest.productContract ?? {};
  const release = manifest.release ?? {};
  const approvals = manifest.approval ?? {};

  if (!has(release.releaseId) || !has(release.environmentClass) || !has(release.createdAt) || !has(release.reviewedCommit)) add('release_identity_incomplete', 'Release identity is not bound to a reviewed commit.');
  if (!has(frontend.url) || !has(amplify.appId) || amplify.branch !== 'staging' || !has(amplify.jobId)) add('frontend_job_unbound', 'The canonical staging frontend job is unknown.');
  if (!has(frontend.deployedCommit) || frontend.deployedCommit !== release.reviewedCommit || !isDigest(frontend.buildArtifactDigest) || frontend.buildResult !== 'success') add('frontend_commit_or_build_unbound', 'The frontend commit, artifact digest, and passing build are not bound to the reviewed commit.');
  if (!has(api.baseUrl) || api.stage !== 'staging' || !has(api.account) || !has(api.region) || !has(api.stack) || !has(api.deployRunId) || !has(api.deployedCommit) || api.deployedCommit !== release.reviewedCommit || api.deployStatus !== 'success') add('api_deployment_unbound', 'The staging API deployment is missing a matching reviewed commit or successful run.');
  if (!isDigest(config.configurationDigest) || !isDigest(config.apiTarget?.valueDigest) || !isDigest(config.identityTarget?.valueDigest)) add('public_configuration_unbound', 'Public API and identity targets do not have a complete configuration digest.');
  if (!isDigest(identity.userPool?.idDigest) || !isDigest(identity.userPool?.issuerDigest) || !isDigest(identity.clientIdDigest) || !has(identity.membershipSchemaVersion) || identity.sixRoleReceipt?.result !== 'pass' || identity.deniedOperationReceipt?.result !== 'pass') add('identity_acceptance_unbound', 'Identity, six-role, or denied-operation evidence is incomplete.');
  if (!has(dataPlane.runtimeRole) || dataPlane.forcedRlsNonBypass !== true || ledger.verified !== true || !isDigest(ledger.headHash)) add('data_plane_integrity_unbound', 'Forced-RLS and ledger integrity evidence is incomplete.');
  if (!Array.isArray(manifest.integrations) || manifest.integrations.length === 0 || manifest.integrations.some((item) => item.status !== 'verified' || !has(item.mappingVersion) || !has(item.healthReceiptId) || !has(item.reconciliationReceiptId))) add('integration_receipts_unbound', 'Connector mapping, health, and reconciliation receipts are incomplete.');
  if (product.decisionPackageVersion !== '1.2' || !isDigest(product.decisionPackageDigest) || !Array.isArray(product.approvedProtocols) || product.approvedProtocols.some((item) => !has(item.id) || !isDigest(item.digest)) || !has(product.deterministicVersion)) add('product_contract_unbound', 'Decision Package, protocol, or deterministic runtime identity is incomplete.');
  if (manifest.acceptance.some((row) => row.result !== 'pass')) add('acceptance_matrix_open', 'One or more manifest-bound acceptance rows remain open.');
  if (manifest.claims?.businessClaimAllowed !== false || manifest.claims?.causalClaimAllowed !== false) add('claims_boundary_invalid', 'Claim flags must remain false until explicit approval.');
  if (!has(approvals.releaseOwner?.actor) || !has(approvals.releaseOwner?.receiptId) || !has(approvals.independentReviewer?.actor) || !has(approvals.independentReviewer?.receiptId)) add('independent_approval_missing', 'Release owner and independent reviewer receipts are required.');
  return missing;
}

function integration(name) {
  return {
    name,
    environment: 'sandbox',
    mappingVersion: null,
    credentialMetadataRef: null,
    healthReceiptId: null,
    deliveryReceiptId: null,
    reconciliationReceiptId: null,
    status: 'unknown',
  };
}

function dedupeExceptions(exceptions) {
  const byCode = new Map();
  for (const item of exceptions) {
    if (!item || typeof item !== 'object' || !item.code) continue;
    if (!byCode.has(item.code)) byCode.set(item.code, item);
  }
  return [...byCode.values()];
}

function assertSafe(value, path = '$') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafe(item, `${path}[${index}]`));
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    assert.ok(!FORBIDDEN_KEY.test(key), `secret-bearing field is not permitted: ${path}.${key}`);
    assertSafe(child, `${path}.${key}`);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function withoutDigest(value) {
  const copy = clone(value);
  delete copy.manifestDigest;
  return copy;
}

function digest(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

async function main() {
  const args = new Map();
  for (let index = 2; index < process.argv.length; index += 1) {
    const arg = process.argv[index];
    if (arg === '--check' || arg === '--require-ready') args.set(arg, true);
    else if (arg.startsWith('--')) args.set(arg, process.argv[++index]);
  }
  const sourcePath = args.get('--source') ?? 'docs/evidence/staging-acceptance-2026-08-01.json';
  const inputPath = args.get('--input');
  const outputPath = args.get('--output');
  if (args.get('--check')) {
    const manifest = readJson(inputPath ?? outputPath ?? 'docs/evidence/release-manifest-2026-08-01.json');
    validateReleaseEvidenceManifest(manifest, { requireReady: args.get('--require-ready') === true });
    process.stdout.write(`${manifest.status}\n`);
    return;
  }
  const source = readJson(sourcePath);
  const candidate = inputPath ? readJson(inputPath) : candidateFromStagingEvidence(source);
  const manifest = buildReleaseEvidenceManifest(candidate);
  validateReleaseEvidenceManifest(manifest, { requireReady: args.get('--require-ready') === true });
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`;
  if (outputPath) writeFileSync(resolve(outputPath), serialized, 'utf8');
  process.stdout.write(serialized);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`release-evidence-manifest failed: ${error.message}`);
    process.exitCode = 1;
  });
}
