# Growth Play onboarding contract

## Purpose

A bank configures each standalone Growth Play before any detector or model can activate a workflow.
The contract is institution-neutral: Consumer Banking and Wealth Management use the same shape but
retain separate source systems, policies, approved actions, destinations, and outcome definitions.

`backend/shared/growth-play-contract.mjs` compiles each draft into a SHA-256-bound
`decision_protocol_id`. Any change to the objective, source mapping, eligibility version, policy
pack, action route, or measurement design produces a different protocol. Unknown fields and stale
protocol identifiers fail closed.

## Required configuration

- Growth Play ID, version, business-line owner, and business objective.
- Approved receipt systems, schema versions, record-level source systems, and rails.
- Eligibility-criteria version and a grounded eligibility receipt for every evaluated household.
- Exact policy-pack version and required policy IDs.
- Closed action catalog: action, accountable role, connector, destination, and environment.
- Primary P&L metric, accepted outcome events and sources, outcome window, holdout, sample, and
  coverage gates.

## Runtime enforcement

Before decisioning, Ventus rejects unapproved source systems, schemas, rails, policy sets, and
holdout allocations. Blocking policy suppresses before model invocation. Every remaining eligible
household is assigned before decisioning; holdout bypasses the detector and treatment abstentions
or contract failures remain in the assigned population. Any proposed action must exactly match the
closed catalog. Delivery must carry the same opaque household token that was evaluated. Outcomes
must resolve to the persisted protocol and match its metric, source, event type, and time window.

The protocol ID is persisted with experiment assignment, decision lineage, delivery context, and
outcome events. This makes a pilot result attributable to one frozen operating definition instead
of an undocumented mixture of model, policy, routing, or measurement changes.

The evidence chronology also fails closed: source records predate their receipt, the source receipt
predates eligibility, eligibility predates assignment, and assignment predates decisioning and the
run. A later-arriving outcome must remain inside the protocol's approved measurement window.

## Pilot workflow

1. The business-line owner supplies a draft based on
   `backend/fixtures/evaluation/growth-play-drafts.json`.
2. Data, policy, workflow, and measurement owners review their respective sections.
3. Run `npm run test:growth-plays`. Optionally set `VENTUS_GROWTH_PLAY_OUTPUT` to write the compiled
   contracts for the non-production configuration store.
4. Record the approved protocol ID with the pilot change record before shadow or assisted runs.
5. Any configuration change creates a new protocol ID and requires a new review; historical
   assignments and outcomes remain bound to the prior version.

## Evidence boundary

The repository proves compilation, tamper detection, runtime allow-list enforcement, household
routing integrity, and outcome-boundary checks on synthetic and sandbox fixtures. It does not prove
that a bank approved the configuration, that a source mapping is correct for sanctioned data, or
that the selected action creates economic lift.
