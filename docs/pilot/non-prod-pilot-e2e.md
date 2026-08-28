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

### 1. Durable ledger and access store (Aurora PostgreSQL)

Provision non-production Aurora PostgreSQL. Local Docker PostgreSQL is acceptable for
offline development, but it is not pilot evidence. Apply the schema first as its owner:

```bash
DATABASE_URL=postgres://owner:pw@host:5432/db npm run db:migrate
```

Then create a dedicated runtime role and grant only the repository operations:

```sql
CREATE ROLE ventus_runtime LOGIN PASSWORD '<managed secret>' NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO ventus_runtime;
GRANT SELECT, INSERT ON decision_ledger_events, experiment_assignments, outcome_events, connected_exposure_events TO ventus_runtime;
GRANT SELECT, INSERT, UPDATE ON connector_delivery_receipts TO ventus_runtime;
GRANT SELECT ON growth_play_protocols, growth_play_protocol_approval_events,
  institutions, institution_identity_providers, institution_memberships TO ventus_runtime;
```

Use a separate configuration role to register and approve protocols. The activation runtime must
not be able to authorize itself:

```sql
CREATE ROLE ventus_protocol_admin LOGIN PASSWORD '<separate managed secret>' NOSUPERUSER NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO ventus_protocol_admin;
GRANT SELECT, INSERT ON growth_play_protocols, growth_play_protocol_approval_events TO ventus_protocol_admin;
```

```bash
# Verify as the runtime role (NOSUPERUSER NOBYPASSRLS):
DATABASE_URL=postgres://runtime_role:pw@host:5432/db npm run db:verify
```

`db:verify` asserts the runtime role cannot bypass RLS *before it writes anything*, appends
a real signal→decision→activation→outcome lineage through the same repository the app uses,
reads it back inside tenant context, and verifies the hash chain from the database rows.

Once `DATABASE_URL` is set, `pilot:e2e` first rejects a `SUPERUSER` or `BYPASSRLS` role, then uses
the real repositories for the hash ledger, immutable assignments, outcomes, and at-most-once
delivery receipts. It also requires the compiled protocol to exist in the registry. For a controlled
non-production setup only, set `VENTUS_PROTOCOL_ADMIN_DATABASE_URL` to the separate configuration
role and the runner will register and approve its exact run-specific protocol before resolving it
through the read-only runtime role. It prints the verified head hash instead of the in-memory count.

### 2. Live Plaid source

`PLAID_CLIENT_ID` / `PLAID_SECRET` enable both `/api/plaid-transactions` and the
`pilot:e2e` Deposit Primacy custom-user pull. The adapter maps returned Plaid records into the operating
loop contract (`transaction_id`, `rail`, `amount`, `source_system`, …), tokenizes the
counterparty, and requires every decision citation to resolve to a source transaction id.
Without credentials, `pilot:e2e` uses fixture records and reports that mode explicitly. When
credentials are configured, the live leg fails closed unless Plaid returns the protocol's required
payroll plus off-bank evidence; it never silently replaces a failed live pull with fixture proof.
Plaid may return fewer than all injected rows while the sandbox item settles. Readiness is based on
the approved evidence pattern, not a brittle fixed row count.

### 3. Session-authorized Salesforce delivery

Create a free Salesforce Developer org + Connected App (Client Credentials Flow) — see
`docs/integrations/bofa-integration-map.md`. Then:

```bash
SF_LOGIN_URL=https://yourdomain.my.salesforce.com \
SF_CLIENT_ID=... SF_CLIENT_SECRET=... \
ENABLE_LIVE_CONNECTORS=true \
VENTUS_CONNECTOR_SESSION_SECRET=<32+ char signing key> \
npm run pilot:e2e
```

Optionally set `SF_DEMO_CONTACT_ID` and `SF_DEMO_ACCOUNT_ID` to standard sandbox record IDs.
The created Task then populates Salesforce's **Name** and **Related To** fields; without them,
the Task still carries the complete tokenized banker brief and remains portable across clean orgs.

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
Protocol registration and approval use a separate credential from activation runtime access.
The runner now also fails unless the treatment produces a non-abstaining decision, a delivered
activation, and an external receipt while the holdout bypasses decisioning.

Does not prove: model accuracy, bank SSO claim mapping, a completed bank outcome window,
statistical validity, or incremental bank value. Those remain the pilot evidence sequence in
`docs/pilot/mvp-pilot-readiness.md`.

## The session issuer

`/api/connector-session` mints sessions in non-prod, gated by `ENABLE_LIVE_CONNECTORS`,
`VENTUS_CONNECTOR_SESSION_SECRET`, and an admin `VENTUS_SESSION_ISSUER_TOKEN` bearer. In
production this endpoint is disabled unless `VENTUS_ALLOW_TOKEN_ISSUER=true`; the target
model is SSO-backed issuance, not a static admin token.
