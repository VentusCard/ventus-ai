# backend/shared

Libraries imported by Lambda `functions/` and `monitors/`, grouped by concern. Functions import these as `../../shared/<subfolder>/<module>.mjs`; packaging rewrites that to `./shared/<subfolder>/<module>.mjs` inside each zip and copies only the subfolders a function transitively imports (see `../scripts/lib/collect-shared-modules.mjs`).

| Subfolder | Contents | Ships to |
| --- | --- | --- |
| `platform/` | Cross-cutting infra: `db`, `db-url`, `secrets`, `tenant-context`, `webhooks`, `batch-outcome`, `batch-stuck`, `gemini`, `model-provider`, `model-gateway`, `model-evaluations`, `console-api`, `offbank-patterns`. | Every Lambda that touches DB/models/webhooks. |
| `pipeline/` | Production enrichment path: `classify-core`, `plaid-transactions-sync`, `ingest-normalizers`. | `ventus-api`, `ventus-classify-transactions`. |
| `pilot/` | Governed pilot / control-plane: decision ledger, experiment measurement, growth-play contract/registry, connector delivery, connected-expansion loop, plaid source, standalone detectors, salesforce activation, intervention planner/benchmark/review, pilot operating loop. | `evidence-store-migrator` monitor + the Vercel BFF (`api/`). Not shipped to enrichment workers. |
| `demo/` | `demo-connectors` sandbox connector service (synthetic data). | `ventus-demo-connectors`. |
| `coworker/` | AI Coworker subsystem (core, tasks, store, memory, mail, render, portfolio-provider) plus `fixtures/`. | `ventus-coworker-inbound`, `ventus-coworker-digest`. |

Cross-subfolder imports are allowed (e.g. `pilot/` and `pipeline/` import `platform/`); the tracer follows them so dependency subfolders are always bundled together.

Each module keeps its `*.test.mjs` beside it and runs via `npm test` (`shared/**/*.test.mjs`).
