# Non-production pilot end-to-end

One command runs the whole governed journey and prints an evidence summary:

```bash
npm run pilot:e2e
```

The command runs the standalone Deposit Primacy Growth Play: source and eligibility receipts →
policy pre-gate → assignment → detector → durable ledger → session-authorized delivery → outcome →
coverage-gated lift. It runs green today on fixtures and lights up each live leg as its credentials
appear. The source, policy, action, destination, household token, and measurement are bound to one
compiled decision protocol. Guardrails are asserted every run: holdout bypasses the detector,
treatment is assigned before decisioning, delivery is idempotent, lift is measured, and
`businessClaimAllowed=false`.

## Activate the live legs (in this order)

### 1. Durable ledger (Postgres)

Provision a non-prod Postgres — Supabase free tier, local Docker, or a non-prod RDS. Apply
the schema first as its owner:

```bash
DATABASE_URL=postgres://owner:pw@host:5432/db npm run db:migrate
```

Then create a dedicated runtime role and grant only the repository operations:

```sql
CREATE ROLE ventus_runtime LOGIN PASSWORD '<managed secret>' NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO ventus_runtime;
GRANT SELECT, INSERT ON decision_ledger_events, experiment_assignments, outcome_events, connected_exposure_events TO ventus_runtime;
GRANT SELECT, INSERT, UPDATE ON connector_delivery_receipts TO ventus_runtime;
```

```bash
# Verify as the runtime role (NOSUPERUSER NOBYPASSRLS):
DATABASE_URL=postgres://runtime_role:pw@host:5432/db npm run db:verify
```

`db:verify` asserts the runtime role cannot bypass RLS *before it writes anything*, appends
a real signal→decision→activation→outcome lineage through the same repository the app uses,
reads it back inside tenant context, and verifies the hash chain from the database rows.

> **Supabase note:** the default `service_role` key is `BYPASSRLS` and will fail the safety
> check by design. Create a dedicated `NOSUPERUSER NOBYPASSRLS` role for the app and point
> `DATABASE_URL` at it. Then run `backend/sql/verify-tenant-isolation.sql` as that role.

Once `DATABASE_URL` is set, `pilot:e2e` first rejects a `SUPERUSER` or `BYPASSRLS` role, then uses
the real repositories for the hash ledger, immutable assignments, outcomes, and at-most-once
delivery receipts. It prints the verified head hash instead of the in-memory count.

### 2. Live Plaid source

`PLAID_CLIENT_ID` / `PLAID_SECRET` enable both `/api/plaid-transactions` and the
`pilot:e2e` Deposit Primacy custom-user pull. The adapter maps returned Plaid records into the operating
loop contract (`transaction_id`, `rail`, `amount`, `source_system`, …), tokenizes the
counterparty, and requires every decision citation to resolve to a source transaction id.
Without credentials, `pilot:e2e` uses fixture records and reports that fallback explicitly.

### 3. Session-authorized Salesforce delivery

Create a free Salesforce Developer org + Connected App (Client Credentials Flow) — see
`docs/bofa-integration-map.md`. Then:

```bash
SF_LOGIN_URL=https://yourdomain.my.salesforce.com \
SF_CLIENT_ID=... SF_CLIENT_SECRET=... \
ENABLE_LIVE_CONNECTORS=true \
VENTUS_CONNECTOR_SESSION_SECRET=<32+ char signing key> \
npm run pilot:e2e
```

Delivery now mints a short-lived, tenant/scope/destination-bound connector session and calls
the real Salesforce connector **with the session bearer** — not the demo header. The
evidence summary prints the real Task id and Lightning URL, and the authorization mode
(`session`). The session is destination-bound: a `salesforce` session cannot deliver to
`erica` (proven in `npm run test:connector-sessions`).

## What this proves vs. does not

Proves: orchestration ordering, holdout-before-activation, idempotent at-most-once delivery,
protocol-bound source/action/outcome routing, tokenized lineage, session-authorized (not
header-authorized) writes, coverage-gated lift,
and — with `DATABASE_URL` — durable hash-verified persistence under forced RLS.

Does not prove: model accuracy, bank SSO claim mapping, a completed bank outcome window,
statistical validity, or incremental bank value. Those remain the pilot evidence sequence in
`docs/mvp-pilot-readiness.md`.

## The session issuer

`/api/connector-session` mints sessions in non-prod, gated by `ENABLE_LIVE_CONNECTORS`,
`VENTUS_CONNECTOR_SESSION_SECRET`, and an admin `VENTUS_SESSION_ISSUER_TOKEN` bearer. In
production this endpoint is disabled unless `VENTUS_ALLOW_TOKEN_ISSUER=true`; the target
model is SSO-backed issuance, not a static admin token.
