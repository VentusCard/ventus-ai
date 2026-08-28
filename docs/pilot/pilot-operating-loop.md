# Pilot operating loop

## What is now executable

`backend/shared/pilot/pilot-operating-loop.mjs` composes the backend contracts into one provider-neutral
journey:

1. Accept a source receipt and tokenized normalized records.
2. Run a replaceable financial-state detector or governed planner.
3. Verify every cited transaction exists in the source records.
4. Record source, signal, policy, assignment, decision, activation, and outcome lineage.
5. Suppress blocked policies before assignment or model decisioning.
6. Assign every eligible, policy-clear household to treatment or holdout before model decisioning.
7. Keep holdout out of the detector entirely and retain treatment abstentions or failures in the
   assigned population for intention-to-treat measurement.
8. Either deliver immediately or persist the exact recommendation for separately scoped human
   review; revalidate the protocol before later activation.
9. Reserve an at-most-once employee-workflow delivery, restore ledger evidence from a terminal
   receipt after an interrupted run, and preserve the external receipt.
10. Ingest bank outcomes and calculate coverage-gated treatment-versus-holdout evidence.

The standalone contract is tested independently for Deposit Primacy and Merrill Relationship
Growth. Connected Liquidity-to-Wealth uses the separate expansion contract described below.
Connectors, policy packs, detectors, source systems, and destinations are injected rather than
hard-coded to one institution.

Every standalone run now requires a compiled Growth Play contract. The protocol binds approved
source systems and rails, eligibility criteria, exact policy set, closed action routes, workflow
environment, primary outcome, and experiment gates to one tamper-evident decision protocol ID.
The operating loop rejects a different household token, action, connector, destination, metric,
outcome source, or outcome window. See `docs/product/growth-play-onboarding-contract.md`.

Before any source evidence is appended, the loop resolves that exact protocol through the
tenant-scoped Growth Play registry. The latest append-only approval event must be `approved` for the
same institution and business line at the run timestamp. Revocation stops future runs without
erasing the authorization evidence attached to historical runs.

Connected expansion uses the separate pre-assigned three-arm orchestration in
`backend/shared/pilot/connected-expansion-loop.mjs`. It prevents connected data from influencing cohort
eligibility or standalone decisions and records immutable data-scope exposure receipts. See
`docs/pilot/connected-expansion-experiment.md`.

## Evidence boundaries

Every new source receipt is immutable-classified as `fixture`, `partner_sandbox`, or
`sanctioned_pilot`; legacy storage aliases (`synthetic`, `sandbox`, and `sanctioned`) are
normalized at the boundary. Classification follows the experiment assignment and outcome ledger.

- Fixture records may run only in shadow mode and cannot activate a connector.
- Partner-sandbox records may wait in a review-required state or reach an approved sandbox workflow, but
  all outcomes remain simulated evidence.
- Production-assisted activation requires sanctioned-pilot evidence and a production destination.
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
`docs/pilot/mvp-pilot-readiness.md`.
