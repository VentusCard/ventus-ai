# Ventus Backend

The AWS backend that serves `api.ventusai.com` and runs the transaction-enrichment
pipeline. Source is version-controlled here; deploys happen via `scripts/deploy.sh`
(pipeline + monitors) and CDK / the `infra-staging` workflow (coworker, demo,
supporting stacks).

## Functions

Production data pipeline (deployed via `scripts/deploy.sh pipeline`):

| Function | Purpose |
| --- | --- |
| `ventus-api` | Public API behind API Gateway. Handles API-key auth, job status, customer outputs, analytics, webhooks, and real-time batch ingestion. |
| `ventus-ingest-transactions` | S3 CSV ingestion worker. Parses uploads, writes raw transactions, creates pipeline runs, and publishes classification jobs. |
| `ventus-classify-transactions` | Classification worker. Reads raw transactions, normalizes/enriches them, writes `transactions_enriched`, and fans out to downstream queues. |
| `ventus-analyze-pillar-transactions` | Pillar/profile worker. Generates customer pillar summaries and inferred purchases. |
| `ventus-analyze-lifestyle-signals` | Life-event and behavioral signal worker. |
| `ventus-risk-detection` | Risk-factor worker. |
| `ventus-travel-detection` | Trip/travel detection worker. |

Demo / coworker functions (deployed via CDK / the `infra-staging` workflow, not `deploy.sh`):

| Function | Purpose |
| --- | --- |
| `ventus-demo-connectors` | Sandbox Plaid/Salesforce FSC connector service for the live demo (synthetic data). |
| `ventus-coworker-inbound` | AI Coworker inbound-email agent turn (parse -> intent -> task -> render -> persist). |
| `ventus-coworker-digest` | AI Coworker scheduled advisor digest builder. |

## Monitors

Scheduled Lambdas in `monitors/` (packaged by `scripts/package-monitors.mjs`,
deployed via `deploy.sh monitors`):

| Monitor | Purpose |
| --- | --- |
| `stuck-job-monitor` | Detects stuck pipeline batches and emits `batch_stuck` webhooks. |
| `webhook-delivery-monitor` | Tracks webhook delivery health and publishes CloudWatch metrics. |

## Directory Layout

```text
backend/
├── functions/   # One folder per Lambda (index.mjs + package.json)
├── monitors/    # Scheduled Lambdas
├── shared/      # Libraries imported by functions/monitors, grouped by concern:
│   ├── platform/  # db, secrets, webhooks, batch-outcome/stuck, model gateway/provider/evaluations, gemini, offbank-patterns
│   ├── pipeline/  # production enrichment: classify-core, plaid/ingest normalizers
│   ├── demo/      # demo connector service + Salesforce FSC (synthetic data)
│   └── coworker/  # AI Coworker subsystem (+ fixtures)
├── scripts/     # CI / deploy / ops only: check:*, package-*, deploy.sh, qa contract checks, smoke
│   └── lib/       # shared helpers for scripts (qa-validators, collect-shared-modules)
├── eval/        # offline evaluation & benchmarking lab (not deployed):
│   ├── model-eval/  # multi-model task evaluation runner
│   ├── lib/         # eval helpers (merchant-normalization, model-output-contract)
│   └── *.mjs        # Plaid benchmark generation/scoring scripts
├── sql/  fixtures/  config/
```

Packaging bundles only the `shared/` subfolders each function transitively imports,
so production pipeline Lambdas do not ship `demo/` or `coworker/` code
(see `scripts/lib/collect-shared-modules.mjs`).

## Current Runtime Dependencies

The deployed backend depends on:

- AWS Lambda
- API Gateway
- Aurora PostgreSQL
- SQS
- S3 bucket notifications
- Secrets Manager
- CloudWatch Logs
- Gemini API credentials stored in Secrets Manager

## Data model

The core product tables (`transactions_raw`, `transactions_enriched`,
`customer_pillar_profiles`, `customer_life_events`, `life_event_evidence`,
`customer_risk_factors`, `customer_trips`, `pipeline_runs`, `merchant_cache`,
`api_keys`, `webhook_registrations`) plus operational tables are defined under
`sql/`. `sql/core-product-schema.sql` is a code-derived baseline — verify it
against Aurora with `pg_dump` before treating it as canonical.

## Local Packaging

To build Lambda zip packages locally:

```bash
cd backend
npm run qa:enrichment
npm run qa:live
npm run package:functions
npm run package:monitors
```

`qa:live` runs health checks by default. Authenticated read checks require
`VENTUS_API_KEY`. Enrichment job submission is disabled unless
`VENTUS_LIVE_QA_ENABLE_WRITE=true`.

Packages are written to `backend/dist/lambda`. The script installs each function's
production dependencies in a temporary build folder before zipping, and copies only
the `shared/` subfolders that function actually imports.

## Caveats

- The source was originally recovered from deployed Lambda packages; some functions
  still duplicate DB/secrets/webhook helper logic.
- Secret values are not committed, but secret identifiers are present because the
  deployed functions reference them.
- Infrastructure is not yet fully in IaC — pipeline functions/monitors deploy via
  `scripts/deploy.sh`; migrating them to CDK/Terraform is tracked as future work.
