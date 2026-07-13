# Ventus product-goal evidence matrix

This matrix is the requirement-level acceptance record for the Ventus product goal. A demo,
test, or design artifact counts only for the scope it actually proves.

| Requirement | Current evidence | Assessment | Evidence still required |
| --- | --- | --- | --- |
| Raw data → enrichment → financial state → recommendation → workflow → outcome | Leadership flow; Plaid-schema Live Lab; Plaid custom-user adapter wired into the provider-neutral operating loop; source, decision, delivery, and outcome receipts; Measure step | Executable and demonstrated with fixtures; Plaid source is unit-proven and awaits its credentialed live run | One sanctioned bank dataset, authenticated bank workflow receipt, and completed outcome window |
| User-facing value inside employee workflows | Employee/customer previews, CEW/Salesforce payloads, banker and advisor actions; operator-confirmed real Salesforce Task write in a test org | Demonstrated prototype with one live-attested connector write | Employee usability study, repeatable session-authorized run, and authenticated bank sandbox |
| Standalone business-line value | Leadership flow starts with Consumer-owned deposit primacy or Merrill-owned relationship growth; operating-loop test covers both without cross-line data | Implemented with synthetic/sandbox evidence | Sanctioned team-owned datasets and workflow receipts for each selected pilot |
| Material P&L focus | Deposit primacy, Merrill relationship growth, and optional liquidity-to-wealth Growth Plays; outcome metrics | Implemented MVP contracts | Bank-approved metric definitions and baselines |
| Governed connected expansion | Consumer-to-Merrill Skill remains separate from both standalone plays; pre-assigned holdout/standalone/connected orchestration enforces authorized data scope, persists exposure receipts, and reports connected-minus-standalone lift only after coverage and deviation gates | Implemented and tested as an expansion contract, not required for MVP entry; not deployed | Bank authorization, sanctioned cross-business data, authenticated workflow delivery, completed three-arm outcomes, and independent review |
| Ventus contribution is explicit | Pipeline shows mapping, enrichment, decisioning, policy, routing, and measurement | Demonstrated | Bank architecture review confirming system boundaries |
| AI creates new decisions, not only summaries | Multi-model evaluation harness; closed-action, evidence-bound intervention planner; 21-case draft benchmark spanning standalone Consumer, standalone Merrill, and connected expansion with qualitative conflicts; deterministic-baseline comparison; blinded hash-bound reviews; consensus-derived freezing; hard failure and cost gates | Shadow contract and draft evaluation packet implemented; labels and model quality unproven | Two independent reviewers must complete and freeze the packet, then a candidate must beat the baseline on sanctioned data and pass policy, fairness, security, and model-risk review |
| Institution-agnostic core with bank configuration | Compiled Growth Play protocol binds institution-specific source mappings, eligibility, policy, closed actions, routes, and outcomes to the provider-neutral loop; tenant-scoped append-only registration, approval, and revocation preserve each business line's operating authority | Implemented and tested for separate Consumer and Merrill drafts; registry migration built but not deployed | Bank-authored mapping approval, identity-bound approver RBAC, second-institution exercise, and successful isolation probe under the non-production runtime role |
| Demonstrated vs. simulated claims remain separate | Immutable synthetic/sandbox/sanctioned evidence class, activation-mode gates, default-off connectors, illustrative disclosure, capability registry | Implemented and tested at contract level | Deployed enforcement, ongoing release review, and customer-facing claim approval |
| Every Growth Play is a measurable loop | Compiled protocol ID, immutable approval receipt, assignments, grounded decisions, exact household/action routing, outcome ingestion, tenant/experiment integrity, coverage-gated uncertainty analysis, policy and delivery contracts | Implemented contract and persistence path; not deployed | Deployed registry, completed live outcome feed, identity-bound authorization, and independent experiment review |
| Employee adoption, economics, explainability, security, compliance, integration | Leadership/employee views, evidence trails, connector controls, procurement tracker | Partial | SSO/RBAC, SOC 2 control operation, policy approval, usability and integration evidence |
| Decision and outcome graph compounds learning | SHA-256 append repository, integrity export, descriptive cohort/action/channel graph, outcome-weighted loop, forced-RLS migrations, and DATABASE_URL migration/verification commands | Implemented and tested; not deployed | Non-prod Postgres deployment, runtime-role RLS verification, restore test, and longitudinal bank outcomes |
| MVP standard on sanctioned data | Synthetic cohort suite, Plaid custom-user manifests, business-line-specific rehearsal, illustrative measurement | Not yet achieved | One team's sanctioned dataset enters Ventus, its existing workflow receives the action, and measured lift clears holdout review without cross-line dependency |

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
