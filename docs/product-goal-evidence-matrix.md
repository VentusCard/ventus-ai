# Ventus product-goal evidence matrix

This matrix is the requirement-level acceptance record for the Ventus product goal. A demo,
test, or design artifact counts only for the scope it actually proves.

| Requirement | Current evidence | Assessment | Evidence still required |
| --- | --- | --- | --- |
| Raw data → enrichment → financial state → recommendation → workflow → outcome | Leadership flow in `EnterpriseGrowthDemoPage.tsx`; Plaid-schema Live Lab; connector receipts; new Measure step | Demonstrated with synthetic or sandbox inputs | One sanctioned bank dataset and completed outcome window |
| User-facing value inside employee workflows | Employee/customer previews, CEW/Salesforce payloads, banker and advisor actions | Demonstrated prototype | Employee usability study and authenticated bank sandbox |
| Material P&L focus | Deposit primacy and liquidity-to-wealth Growth Plays; outcome metrics | Implemented MVP scope | Bank-approved metric definitions and baselines |
| Ventus contribution is explicit | Pipeline shows mapping, enrichment, decisioning, policy, routing, and measurement | Demonstrated | Bank architecture review confirming system boundaries |
| AI creates new decisions, not only summaries | Multi-model evaluation harness and gated Skill architecture | Incomplete | A model-assisted task must beat the deterministic baseline on sanctioned data and pass governance |
| Institution-agnostic core with bank configuration | Provider-neutral cohort, outcome, Skill, connector, and delivery contracts | Designed and partially implemented | Second-institution mapping exercise and tenant-isolation test |
| Demonstrated vs. simulated claims remain separate | Evaluation flags, default-off connectors, illustrative measurement disclosure, capability registry | Implemented and tested | Ongoing release review and customer-facing claim approval |
| Every Growth Play is a measurable loop | `skills.ts`, immutable assignments, outcome ingestion, lift calculation, policy and delivery contracts | Implemented contract; not deployed | Persistent deployment and live outcome feed |
| Employee adoption, economics, explainability, security, compliance, integration | Leadership/employee views, evidence trails, connector controls, procurement tracker | Partial | SSO/RBAC, SOC 2 control operation, policy approval, usability and integration evidence |
| Decision and outcome graph compounds learning | SHA-256 append repository, integrity export, descriptive cohort/action/channel graph, outcome-weighted loop | Implemented and tested; not deployed | RLS-verified deployment and longitudinal bank outcomes |
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
