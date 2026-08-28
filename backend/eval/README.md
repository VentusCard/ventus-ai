# backend/eval

Offline evaluation and benchmarking lab. **Nothing here is deployed** — these scripts read/write local artifacts under `backend/artifacts/` and `backend/fixtures/`, call models for measurement, and produce reports. They were split out of `backend/scripts/` so that `scripts/` holds only CI / deploy / ops tooling.

| Area | Files | Run via |
| --- | --- | --- |
| Plaid benchmarking | `pull-plaid-sandbox-transactions`, `generate-plaid-*`, `capture-*-predictions`, `evaluate-plaid-benchmark-run`, `compare-plaid-benchmark-runs`, `audit-plaid-benchmark-failures`, `rebuild-*`, `run-openrouter-benchmark-suite`, `analyze-plaid-pfc-coverage` | `npm run plaid:*` |
| Model evaluation | `model-eval/` (multi-task runner, scoring, scorers, leaderboard, capture) | `npm run model-eval:run`, `npm run model-eval:test` |
| Intervention review | `qa-intervention-planner`, `prepare-intervention-review`, `adjudicate-intervention-review`, `qa-golden-enrichment`, `qa-model-output-report` | `npm run qa:interventions`, `npm run review:interventions:*`, `npm run qa:golden`, `npm run qa:model-output` |
| Shared eval helpers | `lib/merchant-normalization`, `lib/model-output-contract` (+ tests) | imported by the above |

These scripts sit one level under `backend/` (same depth as `scripts/`) so their `scriptDir`-relative artifact/fixture paths resolve unchanged. `lib/` and `model-eval/` are one level deeper, matching their prior nesting.
