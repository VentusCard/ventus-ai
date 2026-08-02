# Standalone pilot runtime

## Purpose

`POST /api/standalone-pilot-run` is the default-off server entrypoint for one independently
valuable business-line operating loop. It turns the tested orchestration into a deployable path
without requiring Consumer and Merrill data to be connected.

The runtime supports three non-production paths:

- `shadow`: inspect a deterministic decision without assignment or delivery.
- `sandbox_review`: assign treatment or holdout before decisioning, persist an eligible treatment
  recommendation, and return `review_required` without delivering it.
- `sandbox_assisted`: assign before decisioning and deliver an eligible treatment recommendation
  immediately through the configured sandbox receiver.

`POST /api/standalone-pilot-activate` completes a `sandbox_review` recommendation after human
approval. It requires a separate `growth_play_activate` session scope, rechecks protocol approval,
verifies the exact persisted decision fingerprint, and uses the same at-most-once delivery receipt.

The current promoted deterministic baselines are:

- Consumer Banking: Deposit Primacy and Retention.
- Wealth Management: Merrill Relationship Growth and qualified NNA.

Model-assisted intervention planning remains shadow-only until it beats the deterministic baseline
on frozen, independently reviewed expectations. The endpoint does not represent model performance
or production readiness.

## Trust boundary

The run caller must present a signed connector session with `growth_play_run` scope and an
entitlement for exactly one business line. Reviewed activation requires a distinct
`growth_play_activate` scope for that business line. Legacy bearer and local-demo authorization
are rejected even when those compatibility paths are enabled elsewhere.

The runtime derives rather than accepts:

- tenant and session from the signed principal;
- the full operating contract from the tenant's approved protocol registry;
- objective, action catalog, policy version, destination, and holdout percentage from that contract;
- experiment identity from the immutable protocol ID;
- assignment and run timestamps from the server clock;
- assignment salt from the server secret.

Unknown request fields fail closed so a caller cannot override tenant, objective, experiment,
contract, or timestamps. Production-assisted activation is not accepted.

## Persistence and delivery

The endpoint requires a `NOSUPERUSER NOBYPASSRLS` runtime database credential. It uses the same
tenant-isolated repositories for protocol resolution, source/decision lineage, immutable
assignment, at-most-once delivery reservation, and outcome measurement.

Sandbox-reviewed runs persist the assignment and recommendation but do not call the receiver.
The later activation and sandbox-assisted runs require an HTTPS delivery receiver and server-side
bearer. The receiver must return `receipt_id` and may return an HTTPS `receipt_url`. Missing or
unsuccessful receipts become terminal failed delivery evidence rather than successful activation
claims. Replaying an approved activation returns the existing receipt instead of creating a second
downstream action.

## Configuration

- `ENABLE_STANDALONE_PILOT_RUNTIME=true`
- `VENTUS_DATABASE_URL` or `DATABASE_URL` for the read/write runtime role
- `VENTUS_CONNECTOR_SESSION_SECRET` for signed service sessions
- `VENTUS_EXPERIMENT_ASSIGNMENT_SALT` for stable holdout assignment
- `VENTUS_PILOT_DELIVERY_WEBHOOK_URL` and `VENTUS_PILOT_DELIVERY_BEARER` for sandbox assistance

The runtime must not receive `VENTUS_PROTOCOL_ADMIN_DATABASE_URL`.

## Evidence boundary

Repository tests prove server-derived context, business-line isolation, protocol-bound experiment
identity, default-off behavior, legacy/local rejection, production-activation rejection,
deterministic Consumer and Merrill decisions, review-before-delivery, immutable decision
fingerprints, protocol revalidation, and at-most-once receipt handling. This is not evidence of a
completed durable runtime verification, authenticated bank source, bank workflow delivery, model
accuracy, or economic lift. The Console API and Evidence Store infrastructure are deployed in dev;
the migration, RLS probe, and runtime cutover still need a recorded receipt.
