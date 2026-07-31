# Growth Play onboarding contract

## Purpose

A bank configures each standalone Growth Play before any detector or model can activate a workflow.
The contract is institution-neutral: Consumer Banking and Wealth Management use the same shape but
retain separate source systems, policies, approved actions, destinations, and outcome definitions.

`backend/shared/growth-play-contract.mjs` compiles each draft into a SHA-256-bound
`decision_protocol_id`. Any change to the objective, source mapping, eligibility version, policy
pack, action route, or measurement design produces a different protocol. Unknown fields and stale
protocol identifiers fail closed.

`backend/shared/growth-play-registry.mjs` registers that immutable contract for one tenant and
records append-only approval or revocation events. Every operating-loop run resolves the latest
event as of its run timestamp before writing customer evidence or invoking a detector. A missing,
cross-tenant, wrong-business-line, or revoked protocol fails closed.

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

1. The business-line owner completes the Studio's Outcome, Moment, Action, Controls, Proof, and
   Review steps. An incomplete draft remains non-executable.
2. The readiness view identifies missing contracts, assumptions, representative
   qualified/suppressed/abstained cases, connector health, capacity, and measurement feasibility.
3. Data, policy, workflow, and measurement owners review their respective sections.
4. Run `npm run test:growth-plays`. Optionally set `VENTUS_GROWTH_PLAY_OUTPUT` to write the compiled
   contracts for the non-production configuration store.
5. An identity-bound `protocol_configurator` registers the compiled contract for the entitled
   business line through the control-plane API.
6. A different authenticated subject with `business_line_owner` entitlement appends the approval
   event and names the pilot change record.
7. Record the protocol and approval-event IDs with the pilot change record before shadow or
   assisted runs. The operating loop persists both references with source evidence.
8. Any configuration change creates a new protocol ID and requires a new review; historical
   assignments and outcomes remain bound to the prior version.
9. To stop future runs, append a revocation event. Do not mutate or delete the protocol or its
   earlier approval event.

The first real-bank onboarding is bounded to one non-production tenant, business line, Growth Play,
sanctioned source, employee workflow destination, and authoritative outcome return. It must pass
institution, identity, evidence, workflow, outcome, and Growth Play gates in that order. It does
not require cross-business data or a bulk employee rollout.

## Evidence boundary

The repository proves compilation, tamper detection, tenant-isolated approval resolution,
revocation enforcement, runtime allow-list enforcement, household routing integrity, and
outcome-boundary checks on synthetic and sandbox fixtures. The registry migration is built but not
deployed by this change. Internal identity-bound RBAC is tested, but bank SSO claim mapping is not
implemented. A repository approval event does not prove that a bank owner actually
approved the configuration, that a source mapping is correct for sanctioned data, or that the
selected action creates economic lift.
