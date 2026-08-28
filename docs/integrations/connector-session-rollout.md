# Connector session rollout

> **⚠️ STALE (as of 2026-08).** The enterprise session model described here (`issueConnectorSession`, `connector_delivery_receipts` table, `npm run test:connector-sessions`) is not implemented. The current demo uses the simpler session flow in `backend/shared/demo/demo-connectors.mjs`. Historical reference only.

## Current and target state

Ventus connector routes remain disabled unless `ENABLE_LIVE_CONNECTORS=true`. When no connector
session secret is configured, the existing server bearer token continues to work so the current
local and sandbox demonstrations do not break. That compatibility mode is not the enterprise target.

The target state uses a signed connector session limited to:

- one opaque tenant identifier and authenticated service or employee subject;
- explicit scopes such as `plaid_read`, `salesforce_write`, or `delivery_write`;
- explicit destinations such as `plaid`, `salesforce`, `advisor`, `campaign`, `erica`, or `banker`;
- a unique session identifier and no more than 15 minutes of validity.

The repository does not expose a public session-minting endpoint. A future SSO/OIDC adapter must
validate the bank-issued identity and authorization claims server-side before calling
`issueConnectorSession`. Browser input and client-supplied tenant identifiers are never authoritative.

## Controlled migration

1. Store a randomly generated `VENTUS_CONNECTOR_SESSION_SECRET` of at least 32 characters in the
   approved server-side secret store. Never use a `VITE_*` variable.
2. Connect the bank identity adapter and map approved roles to tenant, scope, and destination claims.
3. Run `npm run test:connector-sessions`, then exercise each connector with an allowed session and
   verify that wrong-tenant, wrong-scope, wrong-destination, expired, and tampered sessions fail.
4. While sessions are configured, production legacy bearer access is denied unless
   `VENTUS_ALLOW_LEGACY_CONNECTOR_TOKEN=true`. Use that flag only as a time-boxed rollback bridge.
5. Remove the legacy flag and rotate/delete `VENTUS_CONNECTOR_TOKEN` after all approved callers use
   sessions. Preserve redacted evidence of the cutover.

Short session lifetime limits exposure but is not instant revocation. A bank requiring immediate
revocation needs a server-side session registry or identity-provider introspection before production.

## At-most-once delivery

`connector_delivery_receipts` reserves a tenant-scoped idempotency key before an external write.
A replay with identical content returns the existing reservation without writing again; changed
content under the same key fails. Delivered and failed receipts are terminal and immutable.

A duplicate request that finds a `pending` reservation is not retried automatically because the
external write may have succeeded before Ventus recorded the receipt. It is marked for operator
reconciliation. This favors avoiding duplicate banker tasks or customer actions over automatic
availability. A new idempotency key may be approved only after the downstream state is checked.

The persistent receipt repository is implemented but is not yet wired into the Vercel demonstration
routes or deployed. Until it is, those routes prove payload and connector behavior, not at-most-once
delivery in a live environment.
