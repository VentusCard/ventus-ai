# Ventus product-goal evidence matrix

> **⚠️ STALE (as of 2026-08).** This matrix claims Console API, Cognito auth, decision ledger/RLS, growth-play registry, and intervention planner as implemented evidence — all of which have been removed from the codebase. Do not treat as a current acceptance record. Historical reference only.

This matrix is the requirement-level acceptance record for the Ventus product goal. A demo,
test, or design artifact counts only for the scope it actually proves.

| Requirement | Current evidence | Assessment | Evidence still required |
| --- | --- | --- | --- |
| Raw data → enrichment → financial state → recommendation → workflow → outcome | Leadership flow; Plaid-schema Live Lab; provider-neutral loop; authenticated standalone decision and outcome runtimes; source, delivery, outcome, and measurement receipts; 2026-08-01 staging migration/RLS/ledger receipt | Executable and demonstrated with fixtures; Console API, Cognito, and the verified staging data plane are deployed; bank data remain open | One sanctioned bank dataset, authenticated bank workflow receipt, and completed outcome window |
| User-facing value inside employee workflows | Employee/customer previews, CEW/Salesforce payloads, banker and advisor actions; operator-confirmed real Salesforce Task write in a test org | Demonstrated prototype with one live-attested connector write | Employee usability study, repeatable session-authorized run, and authenticated bank sandbox |
| Standalone business-line value | Leadership flow starts with Consumer-owned deposit primacy or Merrill-owned relationship growth; promoted deterministic detectors and the runtime cover each without cross-line data | Implemented with synthetic/sandbox evidence and authenticated runtime tests | Sanctioned team-owned datasets and workflow receipts for each selected pilot |
| Material P&L focus | Deposit primacy, Merrill relationship growth, and optional liquidity-to-wealth Growth Plays; outcome metrics | Implemented MVP contracts | Bank-approved metric definitions and baselines |
| Governed connected expansion | Consumer-to-Merrill Skill remains separate from both standalone plays; pre-assigned holdout/standalone/connected orchestration enforces authorized data scope, persists exposure receipts, and reports connected-minus-standalone lift only after coverage and deviation gates | Implemented and tested as an expansion contract, not required for MVP entry; deployment and bank authorization remain open | Bank authorization, sanctioned cross-business data, authenticated workflow delivery, completed three-arm outcomes, and independent review |
| Ventus contribution is explicit | Pipeline shows mapping, enrichment, decisioning, policy, routing, and measurement | Demonstrated | Bank architecture review confirming system boundaries |
| AI creates new decisions, not only summaries | Multi-model evaluation harness; closed-action, evidence-bound intervention planner; 21-case draft benchmark spanning standalone Consumer, standalone Merrill, and connected expansion with qualitative conflicts; deterministic-baseline comparison; blinded hash-bound reviews; consensus-derived freezing; hard failure and cost gates | Shadow contract and draft evaluation packet implemented; labels and model quality unproven | Two independent reviewers must complete and freeze the packet, then a candidate must beat the baseline on sanctioned data and pass policy, fairness, security, and model-risk review |
| Institution-agnostic core with bank configuration | Compiled protocol binds mappings, eligibility, policy, actions, routes, and outcomes; tenant-scoped append-only registration/approval plus separate control-plane sessions preserve business-line authority and four-eyes review | Implemented and tested for separate Consumer and Merrill drafts; registry/control-plane infrastructure is deployed | Bank-authored mapping approval, bank SSO/group mapping, second-institution exercise, and successful non-production isolation probe |
| Demonstrated vs. simulated claims remain separate | Immutable synthetic/sandbox/sanctioned evidence class, activation-mode gates, default-off connectors, illustrative disclosure, capability registry | Implemented and tested at contract level | Deployed enforcement, ongoing release review, and customer-facing claim approval |
| Every Growth Play is a measurable loop | Compiled protocol ID, identity-bound immutable approval receipt, assignments, grounded decisions, exact household/action routing, outcome ingestion, tenant/experiment integrity, coverage-gated uncertainty analysis, policy and delivery contracts; verified staging schema, forced RLS, ledger, and idempotency receipt | Implemented contract, RBAC, persistence path, API, and verified staging data plane for the recorded revision | Bank SSO assertion, completed live outcome feed, and independent experiment review |
| Employee adoption, economics, explainability, security, compliance, integration | Leadership/employee views, evidence trails, connector controls, control-plane RBAC, procurement tracker | Partial | Bank SSO integration, SOC 2 control operation, policy approval, usability and integration evidence |
| Decision and outcome graph compounds learning | SHA-256 append repository, integrity export, descriptive cohort/action/channel graph, outcome-weighted loop, forced-RLS migrations, DATABASE_URL migration/verification commands, and 2026-08-01 staging verification receipt | Implemented and tested; recorded staging runtime proves non-bypass RLS, zero cross-tenant visibility, ledger hash integrity, denied mutation, and idempotent assignment/exposure | Restore test, manifest-bound rerun for the bank-review release, and longitudinal bank outcomes |
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
