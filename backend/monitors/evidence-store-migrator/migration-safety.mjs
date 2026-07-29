export const APPLY_EVIDENCE_SCHEMA_CONFIRMATION = 'APPLY_VENTUS_EVIDENCE_SCHEMA';

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
