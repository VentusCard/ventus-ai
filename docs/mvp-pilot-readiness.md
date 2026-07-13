# Ventus MVP pilot readiness

## Product thesis

The MVP proves one operating loop: bank data enters Ventus, a governed Growth Play identifies
a qualified moment, an employee receives one action in an existing workflow, and a pre-assigned
holdout makes incremental value measurable.

The first two standalone Growth Plays are:

1. **Deposit primacy defense:** detect relationship erosion early and prepare one permitted banker action.
2. **Merrill relationship growth:** detect qualified demand inside Merrill-controlled data and prepare one permitted advisor action.

**Connected expansion:** liquidity to wealth remains a separate Consumer-to-Merrill Growth Play. It
is evaluated only after standalone value and data authorization are established; neither standalone
pilot depends on it.

## Evidence delivered in this repository

| Evidence | Command or artifact | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Household cohort conformance | `npm run test:mvp-cohorts` | Expected deterministic behavior across 500 synthetic households, negatives, ambiguity, and suppressions | Real-world precision or lift |
| Plaid custom-user shards | `npm run plaid:mvp:manifests` | The same 500-household design translated into ten official 50-user Plaid Sandbox manifests | Plaid-returned category fidelity until the shards are pulled |
| Local scale baseline | `npm run benchmark:mvp` | Repeatable single-process throughput over at least 100k synthetic transactions | Production capacity or SLA |
| Outcome contract | `npm run test:outcomes` | Tokenized, holdout-aware event schema suitable for bank mapping | A live bank outcome feed |
| Executable operating loop | `backend/shared/pilot-operating-loop.test.mjs`; `docs/pilot-operating-loop.md` | Source receipt → grounded signal → policy → immutable assignment → decision → at-most-once sandbox delivery → outcome → coverage-gated lift across standalone Consumer, standalone Merrill, and connected-expansion examples | Live source, bank identity, deployed persistence, model accuracy, or real business lift |
| Experiment measurement | `backend/shared/experiment-measurement.test.mjs`; `docs/outcome-measurement-methodology.md` | Stable pre-activation assignment, idempotent outcomes, one-tenant/experiment integrity, coverage gates, and uncertainty intervals | A deployed store, completed bank outcome window, independent review, or causal result |
| Connected-data incrementality | `backend/shared/connected-expansion-loop.test.mjs`; `backend/sql/connected-expansion-measurement.sql`; `docs/connected-expansion-experiment.md` | Prequalification without connected data; immutable holdout/standalone/connected assignment; authorized data-scope enforcement; exposure receipts; deviation gates; and connected-minus-standalone lift | Bank authorization, sanctioned cross-business data, authenticated workflow delivery, completed outcomes, or causal proof |
| Decision ledger migration | `backend/sql/decision-ledger.sql` | Append-only, tenant-keyed persistence target with idempotency | Deployed database, backup, or disaster recovery |
| Decision/outcome graph | `backend/shared/decision-ledger.test.mjs` | SHA-256 lineage, tenant serialization, tamper detection, and sample-gated descriptive effectiveness | Causality, deployment, or longitudinal bank evidence |
| Tenant-isolated persistence | `npm run --prefix backend check:persistence`; `backend/sql/verify-tenant-isolation.sql` | Transaction-local tenant context, forced-RLS policies, non-bypass role checks, and rollback-only cross-tenant probes are present and CI-checked | A successful probe against the deployed non-production runtime role |
| Shadow intervention planner | `backend/shared/intervention-planner.test.mjs` | Closed action and channel choices, transaction-level evidence grounding, policy-forced abstention, deterministic-baseline comparison, and a locked runtime-promotion gate | Superior model quality, bank-data performance, model-risk approval, or production use |
| Intervention benchmark packet | `npm run test:interventions`; `npm run interventions:review:prepare`; `docs/intervention-benchmark-review.md` | Twenty-one draft cases across standalone deposit primacy, standalone Merrill relationship growth, and connected liquidity-to-wealth; an executable baseline; qualitative conflicts; blinded hash-bound review packets; consensus-only freezing; and expectation hashing | Independent ground truth while the packet remains draft or performance on sanctioned data |
| Connector controls | `npm run test:salesforce`; `npm run test:connector-sessions`; `backend/shared/connector-delivery.test.mjs` | Default-off connectors, tenant/scope/destination-bound short sessions, compatibility controls, at-most-once reservation contract, and immutable receipts | Bank SSO claim mapping, deployed receipt store, and authenticated sandbox delivery |

## Promotion gates

A Growth Play cannot advance from shadow evaluation to assisted activation until it has:

- A bank-approved sample and field-level data map.
- Human-reviewed golden labels with documented disagreements.
- Precision and recall by cohort, including suppression and fairness slices.
- No fabricated evidence identifiers and no action without supporting transactions.
- An approved policy pack, destination contract, and named business owner.
- Treatment/holdout assignment recorded before activation.
- At least the pre-registered sample and outcome-coverage thresholds in both arms.
- Independent review of the uncertainty interval, attrition, balance, contamination, and multiple testing.
- A rollback path and complete delivery receipts.
- For model-assisted planning, zero grounding or policy hard failures and a documented quality/cost win over the deterministic baseline.

Synthetic cohort results are contract tests. Real performance claims begin only after sanctioned,
representative records are labeled independently and evaluated without changing the expectations
after predictions are observed.

## Next deployment decisions

1. Select the server-side identity provider and map roles for evaluators, operators, and auditors.
2. Apply the five evidence-store migrations in non-production and run the rollback-only isolation probe as the proposed runtime role.
3. Pull one generated Plaid custom-user shard and compare returned Plaid fields with the cohort expectations.
4. Agree with the pilot bank on the outcome-feed mapping, assignment salt custody, experiment unit, minimum sample review, and whether a separately authorized three-arm expansion test is in scope.
5. Have two independent reviewers adjudicate and freeze the draft intervention benchmark before opening candidate predictions.
6. Run captured shadow-planner predictions against the frozen benchmark, then review errors and cost without changing expectations.
7. Complete the procurement evidence gaps in `docs/security-procurement-evidence-index.md`.
