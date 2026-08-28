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
| Executable operating loop | `backend/shared/pilot/pilot-operating-loop.test.mjs`; `docs/pilot/pilot-operating-loop.md` | Source and eligibility receipts → policy pre-gate → immutable assignment → grounded decision → at-most-once sandbox delivery → outcome → coverage-gated lift for standalone Consumer and Merrill, with connected expansion measured separately | Live source, bank identity, deployed persistence, model accuracy, or real business lift |
| Authenticated standalone runtime | `api/standalone-pilot-run.ts`; `api/standalone-pilot-activate.ts`; `api/standalone-pilot-run.test.ts`; `docs/pilot/standalone-pilot-runtime.md` | Default-off deployable entrypoints derive tenant/session/protocol/experiment/timestamps server-side; reject legacy/local and cross-business sessions; support shadow, pre-assigned human review, and at-most-once sandbox delivery of the exact persisted recommendation | Deployment, bank source authentication, bank workflow receipt, production activation, or lift |
| Authenticated outcome runtime | `api/pilot-outcomes.ts`; `api/pilot-outcomes.test.ts`; `docs/pilot/pilot-outcome-runtime.md` | Outcome feed derives assignment, arm, decision, activation, tenant, and protocol from server evidence; measurement remains sample/coverage-gated and non-causal | Deployed feed, completed bank outcomes, independent analysis, or economic lift |
| Growth Play onboarding | `npm run test:growth-plays`; `npm run test:connector-sessions`; `backend/shared/pilot/growth-play-registry.test.mjs`; `docs/product/growth-play-control-plane.md` | Consumer and Merrill compile through one contract; a tenant-isolated append-only registry and distinct control-plane session enforce tenant, role, business-line, IdP lineage, and four-eyes approval before any evidence or model invocation | Actual bank approval, sanctioned mapping verification, deployed registry, or bank SSO/group mapping |
| Reproducible pilot runner | `npm run pilot:e2e`; `docs/pilot/non-prod-pilot-e2e.md` | Standalone Deposit Primacy fixture traverses protocol compilation, source/eligibility, pre-assignment policy, holdout-before-detector, action delivery, outcome, and lift; configured Postgres switches the full evidence loop to durable repositories | Live bank source, bank workflow authentication, or real lift unless those legs are separately evidenced |
| Experiment measurement | `backend/shared/pilot/experiment-measurement.test.mjs`; `docs/pilot/outcome-measurement-methodology.md` | Stable pre-activation assignment, idempotent outcomes, one-tenant/experiment integrity, coverage gates, and uncertainty intervals | A deployed store, completed bank outcome window, independent review, or causal result |
| Connected-data incrementality | `backend/shared/pilot/connected-expansion-loop.test.mjs`; `backend/sql/connected-expansion-measurement.sql`; `docs/pilot/connected-expansion-experiment.md` | Prequalification without connected data; immutable holdout/standalone/connected assignment; authorized data-scope enforcement; exposure receipts; deviation gates; and connected-minus-standalone lift | Bank authorization, sanctioned cross-business data, authenticated workflow delivery, completed outcomes, or causal proof |
| Decision ledger migration | `backend/sql/decision-ledger.sql` | Append-only, tenant-keyed persistence target with idempotency | Deployed database, backup, or disaster recovery |
| Decision/outcome graph | `backend/shared/pilot/decision-ledger.test.mjs` | SHA-256 lineage, tenant serialization, tamper detection, and sample-gated descriptive effectiveness | Causality, deployment, or longitudinal bank evidence |
| Tenant-isolated persistence | `npm run --prefix backend check:persistence`; `backend/sql/verify-tenant-isolation.sql` | Transaction-local tenant context, forced-RLS policies, non-bypass role checks, and rollback-only cross-tenant probes are present and CI-checked | A successful probe against the deployed non-production runtime role |
| Shadow intervention planner | `backend/shared/pilot/intervention-planner.test.mjs` | Closed action and channel choices, transaction-level evidence grounding, policy-forced abstention, deterministic-baseline comparison, and a locked runtime-promotion gate | Superior model quality, bank-data performance, model-risk approval, or production use |
| Intervention benchmark packet | `npm run test:interventions`; `npm run interventions:review:prepare`; `docs/pilot/intervention-benchmark-review.md` | Twenty-one draft cases across standalone deposit primacy, standalone Merrill relationship growth, and connected liquidity-to-wealth; an executable baseline; qualitative conflicts; blinded hash-bound review packets; consensus-only freezing; and expectation hashing | Independent ground truth while the packet remains draft or performance on sanctioned data |
| Connector controls | `npm run test:salesforce`; `npm run test:connector-sessions`; `backend/shared/pilot/connector-delivery.test.mjs` | Default-off connectors, tenant/scope/destination-bound short sessions, compatibility controls, at-most-once reservation contract, and immutable receipts | Bank SSO claim mapping, deployed receipt store, and authenticated sandbox delivery |

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
2. Have each pilot business line complete and approve its Growth Play draft; record the compiled protocol ID in the pilot change record.
3. Apply the seven evidence and access migrations in non-production and run the rollback-only isolation probe as the proposed runtime role.
4. Pull one generated Plaid custom-user shard and compare returned Plaid fields with the approved source contract and cohort expectations.
5. Agree with the pilot bank on the outcome-feed mapping, assignment salt custody, experiment unit, minimum sample review, and whether a separately authorized three-arm expansion test is in scope.
6. Have two independent reviewers adjudicate and freeze the draft intervention benchmark before opening candidate predictions.
7. Run captured shadow-planner predictions against the frozen benchmark, then review errors and cost without changing expectations.
8. Complete the procurement evidence gaps in `docs/security/security-procurement-evidence-index.md`.
