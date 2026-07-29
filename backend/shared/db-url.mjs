// Non-production getDB factory — a plain-connection-string path for evaluation stores
// (Supabase non-prod, local Docker Postgres, or a non-prod RDS). Production still uses the
// secrets-backed factory in db.mjs; this exists so the decision-ledger repository can run
// against a real Postgres from DATABASE_URL without provisioning AWS secrets first.
//
// SECURITY: the URL must point at a runtime role that is NOSUPERUSER and NOBYPASSRLS.
// The tenant-isolation design is defeated by a superuser or a bypassrls role (e.g. a
// Supabase service_role key). assertNonBypassRole() below runs the same check the
// verify-tenant-isolation probe does, so a misconfigured role fails loudly at connect.
import { Client } from 'pg';

export function databaseUrl() {
  return (process.env.VENTUS_DATABASE_URL || process.env.DATABASE_URL || '').trim() || null;
}

export function persistenceConfigured() {
  return databaseUrl() !== null;
}

// SSL: managed Postgres (Supabase/RDS) needs TLS; local docker usually does not. Opt in
// with PGSSL=require (default) and allow PGSSL=disable for local.
function sslOption() {
  const mode = (process.env.PGSSL || 'require').toLowerCase();
  if (mode === 'disable' || mode === 'false' || mode === 'off') return false;
  return { rejectUnauthorized: false };
}

export function createUrlDbFactory({ connectionString = databaseUrl() } = {}) {
  if (!connectionString) throw new Error('DATABASE_URL (or VENTUS_DATABASE_URL) is required');
  return async function getDB() {
    return new Client({ connectionString, ssl: sslOption() });
  };
}

// Fail-safe: the runtime role must not be able to bypass row-level security. Run once at
// startup of any live persistence script.
export async function assertNonBypassRole(getDB) {
  const db = await getDB();
  await db.connect();
  try {
    const res = await db.query('SELECT rolsuper, rolbypassrls, current_user FROM pg_roles WHERE rolname = current_user');
    const row = res.rows[0];
    if (!row) throw new Error('could not resolve current_user role attributes');
    if (row.rolsuper || row.rolbypassrls) {
      throw new Error(
        `runtime role "${row.current_user}" is ${row.rolsuper ? 'SUPERUSER' : 'BYPASSRLS'} — tenant isolation would be defeated. Use a NOSUPERUSER NOBYPASSRLS role.`,
      );
    }
    return { role: row.current_user, safe: true };
  } finally {
    await db.end();
  }
}
