# Connected-data expansion experiment

## Decision being tested

The experiment answers one narrow question:

> After a business line proves value with its own data, do specifically authorized signals from
> another business line create additional incremental value?

It does not assume that more data is better, and it does not use cross-business data to determine
who enters the test.

## Operating sequence

`backend/shared/pilot/connected-expansion-loop.mjs` enforces this order:

1. A cohort is prequalified using common, team-owned criteria. The receipt must state that connected
   data was not used.
2. An opaque household token is immutably assigned to holdout, standalone, or connected before any
   decision is generated. The assignment pins the decision-protocol version used by both active
   arms so model, prompt, policy, and action-catalog drift cannot be mistaken for connected-data lift.
3. Holdout receives no Ventus decision or action.
4. Standalone runs the detector using only records owned by the sponsoring business line.
5. Connected runs the same detector with the standalone records plus only the business lines and
   signal classes named in an active, time-bounded authorization scope.
6. Policy may clear, review, block, or cause a valid abstention. An abstention is a decision outcome,
   not experiment noncompliance.
7. An immutable exposure receipt records whether decisioning occurred, whether an action was
   delivered, and whether connected data was used.
8. Outcomes are evaluated only after all three arms clear sample, outcome-coverage,
   exposure-coverage, and deviation gates.

## Required contrasts

- `standaloneVsHoldout`: independent value from the business line's own data and workflow.
- `connectedVsStandalone`: additional value attributable to the authorized connection.
- `connectedVsHoldout`: total connected-path effect.

The expansion decision is based on `connectedVsStandalone`. A positive statistical signal returns
`candidate_for_independent_scale_review`; it does not authorize scaling. Negative or inconclusive
results remain unscaled.

## Data and ownership controls

- Standalone records must all belong to the sponsoring business line.
- Connected records must preserve every standalone record unchanged.
- Every connected business line and signal class must be named in the authorization scope.
- Authorization must be approved before assignment and remain active at assignment time.
- Direct identity fields are rejected; household identity remains an opaque bank-issued token.
- The authorization scope, arm, decision evidence, delivery receipt, and exposure receipt remain in
  the tenant-isolated evidence store.
- Every outcome and exposure must resolve to the assignment's frozen decision-protocol ID.

## Evidence boundary

The repository proves deterministic assignment, data-scope enforcement, policy-aware abstention,
at-most-once delivery composition, exposure persistence, and gated three-arm calculations on
synthetic and sandbox fixtures. It does not prove that a bank has authorized data sharing, that live
data is representative, that connected signals improve outcomes, or that a result is causal. Those
claims require sanctioned data, authenticated workflows, completed outcomes, and independent
statistical and data-governance review.
