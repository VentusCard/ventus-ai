# Growth Play onboarding contract

## Purpose

A bank configures each standalone Growth Play before any detector or model can activate a workflow.
The contract is institution-neutral: Consumer Banking and Wealth Management use the same shape but
retain separate source systems, policies, approved actions, destinations, and outcome definitions.

`backend/shared/pilot/growth-play-contract.mjs` compiles each draft into a SHA-256-bound
`decision_protocol_id`. Any change to the objective, source mapping, eligibility version, policy
pack, action route, or measurement design produces a different protocol. Unknown fields and stale
protocol identifiers fail closed.

`backend/shared/pilot/growth-play-registry.mjs` registers that immutable contract for one tenant and
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
institution, identity, evidence, workflow, outcome, and Growth Play gates before real assignment.
Commercial readiness work begins with an outcome-feasibility preflight for Gate 5 before custom
workflow integration, then completes the six control gates without bypassing their dependencies.
It does not require cross-business data or a bulk employee rollout.

The paid engagement has two bounded phases. Phase A is paid readiness and integration: confirm the
Gate 5 two-arm outcome path, complete Gates 1 through 5, and prepare Gate 6 shadow proof with
fixture or partner-sandbox claims only. Phase B is the paid sanctioned pilot: begin only after all
six gate artifacts, four-eyes approvals, assignment design, capacity, stop conditions, and analysis
freeze pass. Payment does not imply positive lift or claim approval.

## First-bank profile: Consumer Deposit Primacy

This is the first onboarding profile Ventus is prepared to run. It is an approval template, not a
claim that any particular bank has already supplied or certified these values.

| Item | Ventus default | Bank must confirm |
| --- | --- | --- |
| Environment | One bounded non-production tenant | Tenant ID, residency, retention, and support boundary |
| Business line | Consumer Banking | Accountable business owner and eligible queue |
| Growth Play | `deposit-primacy-defense` | Objective, population, exclusions, and pilot change record |
| Primary metric | `deposit_retained` in USD | Deposit definition, eligible account types, aggregation, and measurement anchor |
| Economic source | Deposit ledger or certified deposit-outcome view | System owner, lineage, reconciliation, and certification |
| Return cadence | Daily batch or approved event feed | Delivery schedule, delay, retry, and reconciliation owner |
| Outcome event | `deposit_balance_observed` | Event semantics and whether the returned value is posted/settled |
| Source version | Bank-defined, immutable during pilot | Version ID and change-control policy |
| Freshness | Maximum seven days from occurrence to observation | Agreed threshold and late-arrival policy |
| Corrections | Append-only, strictly increasing sequence per source record | Correction authority and replay procedure |
| Subject linkage | Ventus opaque subject token | Bank-controlled linkage and deletion process |
| Employee destination | One approved employee workflow, candidate: FSC | Native object, field mapping, owner routing, deep link, and sandbox write permission |
| CRM evidence | Assignment, acceptance, completion, timing, and reason code | Reconciliation fields and workflow owner |
| Claims | Sandbox/mechanism evidence only until reviewed | Analysis owner, holdout design, and claim-approval process |

The bank return envelope contains only the opaque subject token, registered metric, value or null,
event type, source system and record identifiers, source version, occurrence and observation times,
correction sequence, and optional reason code. It must not contain tenant, experiment, arm, decision,
protocol, claim status, or direct customer PII. Ventus derives those fields from its persisted
assignment and decision records.

The server-side outcome ingress is enabled only when the deployment supplies an approved source
contract through `VENTUS_AUTHORITATIVE_OUTCOME_SOURCE_CONFIG`. The first profile has this shape:

```json
{
  "sourceSystem": "deposit_core_sandbox",
  "sourceVersion": "deposit-retention-v1",
  "metric": "deposit_retained",
  "eventTypes": ["deposit_balance_observed"],
  "maxObservationLagDays": 7
}
```

This configuration is deployment-side policy, not browser state and not a customer-provided field.
The existing authenticated connector session remains the transport authorization boundary. A bank
integration may later deliver the same envelope through a managed batch, queue, or event adapter
without changing the decision-lineage or measurement rules.

The profile is ready for a bounded pilot only when all six artifacts exist:

1. Tenant charter and named business, risk, identity, data, workflow, and measurement owners.
2. Signed role and business-line scope mapping plus access tests.
3. Allowlisted evidence schema, token-linkage, retention, deletion, consent, and source receipt.
4. Approved workflow mapping, sandbox write receipt, and reconciliation result.
5. Frozen authoritative outcome contract with treatment/holdout fixtures and validation report.
6. Independently approved immutable Growth Play protocol with qualified, suppressed, abstained, and
   holdout shadow evidence.

No source, destination, or outcome field is considered production-ready merely because the Ventus
demo or a Salesforce sandbox can display it. A bank owner must approve the mapping and its lineage.

## Evidence boundary

The repository proves compilation, tamper detection, tenant-isolated approval resolution,
revocation enforcement, runtime allow-list enforcement, household routing integrity, and
outcome-boundary checks on synthetic and sandbox fixtures. The registry and Evidence Store
deployment infrastructure is deployed. The 2026-08-01 staging acceptance record verifies twelve
migration digests, the forced-RLS non-bypass runtime role, zero cross-tenant visibility, ledger
integrity, runtime write denial, and idempotent assignment/exposure for its recorded backend
revision. Internal identity-bound RBAC and the six-role dev UI are tested, but the frontend and
backend evidence are not yet bound in one bank-review release manifest, and bank SSO claim mapping
is not implemented. A repository approval event does not prove that a bank owner actually
approved the configuration, that a source mapping is correct for sanctioned data, or that the
selected action creates economic lift.
