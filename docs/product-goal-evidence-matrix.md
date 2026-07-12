# Ventus product-goal evidence matrix

This matrix is the requirement-level acceptance record for the Ventus product goal. A demo,
test, or design artifact counts only for the scope it actually proves.

| Requirement | Current evidence | Assessment | Evidence still required |
| --- | --- | --- | --- |
| Raw data → enrichment → financial state → recommendation → workflow → outcome | Leadership flow; Plaid-schema Live Lab; provider-neutral backend operating loop; source, decision, delivery, and outcome receipts; Measure step | Executable and demonstrated with synthetic or sandbox inputs | One sanctioned bank dataset, authenticated bank workflow receipt, and completed outcome window |
| User-facing value inside employee workflows | Employee/customer previews, CEW/Salesforce payloads, banker and advisor actions | Demonstrated prototype | Employee usability study and authenticated bank sandbox |
| Material P&L focus | Deposit primacy and liquidity-to-wealth Growth Plays; outcome metrics | Implemented MVP scope | Bank-approved metric definitions and baselines |
| Ventus contribution is explicit | Pipeline shows mapping, enrichment, decisioning, policy, routing, and measurement | Demonstrated | Bank architecture review confirming system boundaries |
| AI creates new decisions, not only summaries | Multi-model evaluation harness; closed-action, evidence-bound intervention planner; 14-case draft benchmark with qualitative conflicts; deterministic-baseline comparison; hard failure and cost gates | Shadow contract and draft evaluation packet implemented; labels and model quality unproven | Two independent reviewers must freeze expectations, then a candidate must beat the baseline on sanctioned data and pass policy, fairness, security, and model-risk review |
| Institution-agnostic core with bank configuration | Provider-neutral cohort, outcome, Skill, connector, and delivery contracts; transaction-scoped tenant context; forced-RLS migration and rollback-only probe | Designed and implemented at contract level; not deployed | Second-institution mapping exercise and successful isolation probe under the non-production runtime role |
| Demonstrated vs. simulated claims remain separate | Immutable synthetic/sandbox/sanctioned evidence class, activation-mode gates, default-off connectors, illustrative disclosure, capability registry | Implemented and tested at contract level | Deployed enforcement, ongoing release review, and customer-facing claim approval |
| Every Growth Play is a measurable loop | `skills.ts`, immutable assignments, outcome ingestion, tenant/experiment integrity, coverage-gated uncertainty analysis, policy and delivery contracts | Implemented contract; not deployed | Persistent deployment, completed live outcome feed, and independent experiment review |
| Employee adoption, economics, explainability, security, compliance, integration | Leadership/employee views, evidence trails, connector controls, procurement tracker | Partial | SSO/RBAC, SOC 2 control operation, policy approval, usability and integration evidence |
| Decision and outcome graph compounds learning | SHA-256 append repository, integrity export, descriptive cohort/action/channel graph, outcome-weighted loop, forced-RLS persistence path | Implemented and tested; not deployed | Runtime-role RLS verification, restore test, and longitudinal bank outcomes |
| MVP standard on sanctioned data | Synthetic cohort suite, Plaid custom-user manifests, connected rehearsal, illustrative measurement | Not yet achieved | Sanctioned dataset enters Ventus, bank workflow receives action, and measured lift clears holdout review |

## Current release gate

The repository now supports a truthful end-to-end product demonstration and the backend contracts
needed to run an experiment. It must not be described as a proven bank outcome system until all of
the following exist:

1. Sanctioned representative records with expectations frozen before prediction review.
2. Bank-approved policy, assignment unit, metric, outcome window, and holdout percentage.
3. Authenticated sandbox delivery with a bank-issued receipt.
4. Persistent tenant-isolated assignment, decision, and outcome records.
5. Independent review of precision, fairness, sample sufficiency, and incremental lift.
6. A model-assisted planner may remain shadow-only until it has zero grounding or policy hard failures, passes the documented quality/cost gate against the deterministic baseline, and receives independent model-risk approval.
