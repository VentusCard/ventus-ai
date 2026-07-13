// Apply the five evidence-store migrations to a non-production Postgres, in dependency
// order. Idempotent — every migration uses IF NOT EXISTS / CREATE OR REPLACE / DROP IF
// EXISTS, so re-running is safe.
//
//   DATABASE_URL=postgres://OWNER:pw@host:5432/db npm run db:migrate
//
// Connect as an OWNER/admin role here (migrations create tables, functions, policies).
// The RUNTIME role that the app uses must be separate and NOSUPERUSER NOBYPASSRLS — run
// backend/sql/verify-tenant-isolation.sql as that runtime role afterward (npm run db:probe).
//
// If DATABASE_URL is unset this prints the setup path and exits 0 (nothing is provisioned
// for you). Order follows the SQL dependencies: ledger → binary measurement → connected
// measurement → tenant isolation → delivery (whose policy calls the tenant-context function).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { Client } from 'pg';
import { databaseUrl } from '../shared/db-url.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const sql = (name) => readFileSync(resolve(here, '../sql', name), 'utf8');

const MIGRATIONS = [
  'decision-ledger.sql',
  'experiment-measurement.sql',
  'connected-expansion-measurement.sql',
  'tenant-isolation.sql',
  'connector-delivery.sql',
];

async function main() {
  const url = databaseUrl();
  if (!url) {
    console.log('DATABASE_URL is unset — nothing applied.');
    console.log('Provision a non-prod Postgres (Supabase free tier, local docker, or non-prod RDS), then:');
    console.log('  DATABASE_URL=postgres://owner:pw@host:5432/db npm run db:migrate');
    console.log('Migrations to apply, in order:', MIGRATIONS.join(' → '));
    process.exit(0);
  }

  const ssl = (process.env.PGSSL || 'require').toLowerCase() === 'disable' ? false : { rejectUnauthorized: false };
  const client = new Client({ connectionString: url, ssl });
  await client.connect();
  try {
    await client.query('BEGIN');
    for (const file of MIGRATIONS) {
      process.stdout.write(`applying ${file} … `);
      await client.query(sql(file));
      console.log('ok');
    }
    await client.query('COMMIT');
    console.log('\nAll five evidence-store migrations applied.');
    console.log('Next: run the isolation probe AS THE RUNTIME ROLE — npm run db:probe (see verify-tenant-isolation.sql).');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('migration failed:', error.message);
  process.exit(1);
});
