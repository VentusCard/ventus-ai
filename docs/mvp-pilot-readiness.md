# Ventus MVP pilot readiness

## Product thesis

The MVP proves one operating loop: bank data enters Ventus, a governed Growth Play identifies
a qualified moment, an employee receives one action in an existing workflow, and a pre-assigned
holdout makes incremental value measurable.

The first two Growth Plays are:

1. **Deposit primacy defense:** detect relationship erosion early and prepare one permitted banker action.
2. **Liquidity to wealth:** detect evidenced liquidity and prepare a warm Merrill/wealth introduction.

## Evidence delivered in this repository

| Evidence | Command or artifact | What it proves | What it does not prove |
| --- | --- | --- | --- |
| Household cohort conformance | `npm run test:mvp-cohorts` | Expected deterministic behavior across 500 synthetic households, negatives, ambiguity, and suppressions | Real-world precision or lift |
| Plaid custom-user shards | `npm run plaid:mvp:manifests` | The same 500-household design translated into ten official 50-user Plaid Sandbox manifests | Plaid-returned category fidelity until the shards are pulled |
| Local scale baseline | `npm run benchmark:mvp` | Repeatable single-process throughput over at least 100k synthetic transactions | Production capacity or SLA |
| Outcome contract | `npm run test:outcomes` | Tokenized, holdout-aware event schema suitable for bank mapping | A live bank outcome feed |
| Experiment measurement | `backend/shared/experiment-measurement.test.mjs` | Stable pre-activation assignment, idempotent outcome ingestion, and sample-gated lift calculation | A deployed store or causal result from bank data |
| Decision ledger migration | `backend/sql/decision-ledger.sql` | Append-only, tenant-keyed persistence target with idempotency | Deployed database, backup, or disaster recovery |
| Decision/outcome graph | `backend/shared/decision-ledger.test.mjs` | SHA-256 lineage, tenant serialization, tamper detection, and sample-gated descriptive effectiveness | Causality, deployment, or longitudinal bank evidence |
| Shadow intervention planner | `backend/shared/intervention-planner.test.mjs` | Closed action and channel choices, transaction-level evidence grounding, policy-forced abstention, deterministic-baseline comparison, and a locked runtime-promotion gate | Superior model quality, bank-data performance, model-risk approval, or production use |
| Intervention benchmark packet | `npm run test:interventions`; `docs/intervention-benchmark-review.md` | Fourteen draft cases across both MVP plays, an executable baseline, qualitative-conflict cases, expectation hashing, and a two-reviewer freeze gate | Independent ground truth while the packet remains draft, or performance on sanctioned data |
| Connector controls | `npm run test:salesforce` | Default-off connector, bearer authorization, production header rejection | Bank SSO or production Salesforce authorization |

## Promotion gates

A Growth Play cannot advance from shadow evaluation to assisted activation until it has:

- A bank-approved sample and field-level data map.
- Human-reviewed golden labels with documented disagreements.
- Precision and recall by cohort, including suppression and fairness slices.
- No fabricated evidence identifiers and no action without supporting transactions.
- An approved policy pack, destination contract, and named business owner.
- Treatment/holdout assignment recorded before activation.
- A rollback path and complete delivery receipts.
- For model-assisted planning, zero grounding or policy hard failures and a documented quality/cost win over the deterministic baseline.

Synthetic cohort results are contract tests. Real performance claims begin only after sanctioned,
representative records are labeled independently and evaluated without changing the expectations
after predictions are observed.

## Next deployment decisions

1. Select the server-side identity provider and map roles for evaluators, operators, and auditors.
2. Deploy the decision ledger migration in a non-production account and test tenant isolation.
3. Pull one generated Plaid custom-user shard and compare returned Plaid fields with the cohort expectations.
4. Agree with the pilot bank on the outcome-feed mapping, assignment salt custody, experiment unit, and minimum sample review.
5. Have two independent reviewers adjudicate and freeze the draft intervention benchmark before opening candidate predictions.
6. Run captured shadow-planner predictions against the frozen benchmark, then review errors and cost without changing expectations.
7. Complete the procurement evidence gaps in `docs/security-procurement-evidence-index.md`.
