# Pilot operating loop

## What is now executable

`backend/shared/pilot-operating-loop.mjs` composes the backend contracts into one provider-neutral
journey:

1. Accept a source receipt and tokenized normalized records.
2. Run a replaceable financial-state detector or governed planner.
3. Verify every cited transaction exists in the source records.
4. Record source, signal, policy, assignment, decision, activation, and outcome lineage.
5. Suppress blocked policies before experiment assignment.
6. Assign eligible households to treatment or holdout before any connector call.
7. Reserve an at-most-once employee-workflow delivery and preserve its external receipt.
8. Ingest bank outcomes and calculate coverage-gated treatment-versus-holdout evidence.

The same contract is tested for standalone Deposit Primacy, standalone Merrill Relationship
Growth, and connected Liquidity-to-Wealth examples. Connectors, policy packs, detectors, source
systems, and destinations are injected rather than hard-coded to one institution or dependent on
cross-business data.

## Evidence boundaries

Every source receipt is immutable-classified as `synthetic`, `sandbox`, or `sanctioned`, and the
classification follows the experiment assignment and outcome ledger.

- Synthetic records may run only in shadow mode and cannot activate a connector.
- Sandbox records may reach an approved sandbox workflow but all outcomes remain simulated evidence.
- Production-assisted activation requires sanctioned evidence and a production destination.
- Every returned result keeps `businessClaimAllowed: false`; independent review and the release
  gates still determine whether a bank may rely on the result.

Direct customer identity fields are rejected from the operating-loop input and delivery payload.
Merchant enrichment fields remain allowed. Household and account resolution must use bank-issued
opaque tokens inside the approved perimeter.

## What this does not prove

The tests prove orchestration, ordering, suppression, provenance, idempotency, and evidence-class
boundaries. They do not prove a live source adapter, model accuracy, bank SSO, deployed RLS,
authenticated workflow delivery, completed outcome coverage, statistical validity, or incremental
bank value. Those require the non-production and pilot evidence sequence in
`docs/mvp-pilot-readiness.md`.
