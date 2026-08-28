# Tenant-isolated evidence persistence

> **⚠️ PARTIALLY STALE (as of 2026-08).** Tenant isolation is still the intended direction, but the specific SQL files referenced here (`decision-ledger.sql`, `growth-play-registry.sql`, etc.) no longer exist. Current DB schema lives in `backend/sql/`: `core-product-schema.sql`, `model-evaluation-runs.sql`, `webhook-delivery-attempts.sql`, `webhook-payload-v2-migration.sql`, `stuck-pipeline-runs.sql`. Verify against those before relying on this doc.

## Scope

This runbook deploys the decision ledger, experiment assignments, connected-data exposure receipts,
outcome events, connector delivery receipts, and the Growth Play approval registry to a
non-production PostgreSQL database. It does not authorize a production migration or prove tenant
isolation until the rollback-only probe succeeds under the actual runtime role.

## Required roles

- A migration role may own and alter the tables.
- The application runtime role must be `NOSUPERUSER NOBYPASSRLS` and must not be granted table
  ownership. Database credentials stay in AWS Secrets Manager and are never placed in this repo.
- A separate protocol-administration role may insert immutable protocol and approval records. The
  application runtime receives `SELECT` only on those tables and cannot approve its own activation.
- The API must derive the tenant identifier from authenticated server-side context. It must never
  accept a client-supplied tenant identifier as authoritative.

## Non-production procedure

1. Take a restorable snapshot and record the database identifier, migration owner, runtime role,
   timestamp, and rollback owner in the change record.
2. Confirm the target is non-production and the runtime role reports `rolsuper = false` and
   `rolbypassrls = false` in `pg_roles`.
3. Apply these files in order with `ON_ERROR_STOP=1`:
   - `backend/sql/decision-ledger.sql`
   - `backend/sql/experiment-measurement.sql`
   - `backend/sql/connected-expansion-measurement.sql`
   - `backend/sql/growth-play-registry.sql`
   - `backend/sql/tenant-isolation.sql`
   - `backend/sql/connector-delivery.sql`
4. Grant the runtime only `SELECT` on the two registry tables. Grant registry `INSERT` only to the
   separate protocol-administration role. Neither role receives `DELETE`, table ownership,
   superuser, or `BYPASSRLS`; the runtime receives `UPDATE` only for pending delivery completion.
5. Connect as the runtime role and execute `backend/sql/verify-tenant-isolation.sql`. The script
   verifies same-tenant visibility, cross-tenant read denial, cross-tenant write denial,
   runtime denial on Growth Play registry writes, connected-exposure and connector-receipt
   isolation, and
   fail-closed behavior without a tenant context. It rolls back all probe data.
6. Run `npm run --prefix backend check:persistence` and `npm test --prefix backend` from the exact
   commit proposed for deployment.
7. Capture redacted command output, schema version, role attributes, and reviewer approval as pilot
   evidence. Do not capture credentials or customer data.

## Application invariant

Every persistent repository starts a transaction and calls
`set_config('app.current_tenant_id', tenant_id, true)` before the first data query. The third
argument makes the value transaction-local so a pooled connection cannot leak tenant context into a
later request. Repositories must roll back on any error and close the client after completion.

## Production gate

Production remains blocked until a database owner and security reviewer approve the role grants,
the isolation probe passes in the target topology, backup restore is tested, retention and deletion
requirements are approved, and authenticated API claims are shown to be the only tenant-context
source.
