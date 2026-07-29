export const APPLY_EVIDENCE_SCHEMA_CONFIRMATION = 'APPLY_VENTUS_EVIDENCE_SCHEMA';
export const PROVISION_CONSOLE_ACCESS_CONFIRMATION = 'PROVISION_VENTUS_STAGING_ACCESS';

export const EVIDENCE_STORE_MIGRATIONS = [
  'decision-ledger.sql',
  'experiment-measurement.sql',
  'connected-expansion-measurement.sql',
  'growth-play-registry.sql',
  'tenant-isolation.sql',
  'institution-access.sql',
  'connector-delivery.sql',
];

export function checkedPgIdentifier(value, label = 'identifier') {
  if (!/^[a-z][a-z0-9_]{2,62}$/.test(value)) {
    throw new Error(`${label} must be a lowercase PostgreSQL identifier`);
  }
  return value;
}

export function quotePgIdentifier(value) {
  return `"${checkedPgIdentifier(value)}"`;
}

export function quotePgLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function validateAccessProvisioning(value = {}) {
  const tenantId = String(value.tenantId || '').trim().toLowerCase();
  const displayName = String(value.displayName || '').trim();
  const issuer = String(value.issuer || '').trim().replace(/\/$/, '');
  const identitySubject = String(value.identitySubject || '').trim();
  const email = String(value.email || '').trim().toLowerCase();
  const role = String(value.role || '').trim();
  const businessLines = safeArray(value.businessLines, /^[a-z][a-z0-9_-]{1,62}$/);
  const entitlements = safeArray(
    value.entitlements,
    /^(consumer_demo|wealth_demo|growth_console|live_connectors)$/,
  );
  if (!/^[a-z][a-z0-9_-]{1,62}$/.test(tenantId)) throw new Error('invalid tenantId');
  if (displayName.length < 2 || displayName.length > 200) throw new Error('invalid displayName');
  if (!/^https:\/\/[A-Za-z0-9./_-]{8,500}$/.test(issuer)) throw new Error('invalid issuer');
  if (!/^[A-Za-z0-9][A-Za-z0-9:_-]{1,255}$/.test(identitySubject)) {
    throw new Error('invalid identitySubject');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('invalid email');
  if (![
    'ventus_platform_admin',
    'institution_admin',
    'growth_play_owner',
    'bank_operator',
    'risk_reviewer',
  ].includes(role)) {
    throw new Error('invalid role');
  }
  if (businessLines.length === 0 || entitlements.length === 0) {
    throw new Error('businessLines and entitlements are required');
  }
  return {
    tenantId,
    displayName,
    issuer,
    identitySubject,
    email,
    role,
    businessLines,
    entitlements,
  };
}

function safeArray(value, pattern) {
  if (!Array.isArray(value) || value.length > 20) return [];
  const normalized = [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
  return normalized.every((item) => pattern.test(item)) ? normalized : [];
}
