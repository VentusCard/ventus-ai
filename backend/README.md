# Ventus Backend

This directory contains the recovered source shape of the AWS backend currently serving `api.ventusai.com`. It was reconstructed from deployed Lambda packages for auditability and pilot-readiness work.

No live infrastructure is changed by this directory. Treat it as the backend source baseline to review, refactor, test, and eventually connect to CI/CD and IaC.

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

Console / demo / coworker functions (deployed via CDK / `infra-staging` workflow, not `deploy.sh`):

| Function | Purpose |
| --- | --- |
| `ventus-console-api` | Growth Console operator API. Cognito-authenticated; resolves institution membership/entitlements. |
| `ventus-demo-connectors` | Sandbox Plaid/Salesforce connector service for the live demo (synthetic data). |
| `ventus-coworker-inbound` | AI Coworker inbound-email agent turn (parse -> intent -> task -> render -> persist). |
| `ventus-coworker-digest` | AI Coworker scheduled advisor digest builder. |

## Monitors

Scheduled Lambdas in `monitors/` (packaged by `scripts/package-monitors.mjs`):

| Monitor | Purpose | Deployed by |
| --- | --- | --- |
| `ventus-stuck-job-monitor` | Detects stuck pipeline batches and emits `batch_stuck` webhooks. | `deploy.sh monitors` |
| `ventus-webhook-delivery-monitor` | Tracks webhook delivery health and publishes CloudWatch metrics. | `deploy.sh monitors` |
| `evidence-store-migrator` | Applies evidence/access schema migrations for the pilot control plane. | CDK (`infra-staging`) |

## Directory Layout

```text
backend/
├── functions/   # One folder per Lambda (index.mjs + package.json)
├── monitors/    # Scheduled Lambdas
├── shared/      # Libraries imported by functions/monitors, grouped by concern:
│   ├── platform/  # db, secrets, tenant-context, webhooks, batch-*, model gateway/provider, gemini, console-api, offbank-patterns
│   ├── pipeline/  # production enrichment: classify-core, plaid/ingest normalizers
│   ├── pilot/     # governed pilot / control-plane (ledger, experiments, growth-play, interventions)
│   ├── demo/      # demo connector service (synthetic data)
│   └── coworker/  # AI Coworker subsystem (+ fixtures)
├── scripts/     # CI / deploy / ops only: check:*, package-*, deploy.sh, qa contract checks, migrations, smoke
│   └── lib/       # shared helpers for scripts (qa-validators, growth-play-cohorts)
├── eval/        # offline evaluation & benchmarking lab (not deployed):
│   ├── model-eval/  # multi-model task evaluation runner
│   ├── lib/         # eval helpers (merchant-normalization, model-output-contract)
│   └── *.mjs        # Plaid benchmark + intervention-review scripts
├── sql/  fixtures/  config/
```

Packaging bundles only the `shared/` subfolders each function transitively imports, so production pipeline Lambdas no longer ship `pilot/`, `demo/`, or `coworker/` code (see `scripts/lib/collect-shared-modules.mjs`).

## Current Runtime Dependencies

The deployed backend currently depends on:

- AWS Lambda
- API Gateway
- Aurora PostgreSQL
- SQS
- S3 bucket notifications
- Secrets Manager
- CloudWatch Logs
- Gemini API credentials stored in Secrets Manager

## Important Caveats

- The code has been recovered from deployed packages, not from an original backend repo.
- The source still has duplicated DB/secrets/webhook helper logic across functions.
- Secret values are not committed, but secret identifiers are present because the deployed functions use them.
- This directory is not yet wired to production deployment.
- Do not deploy from this directory until CI, packaging, environment config, and IaC have been reviewed.

## Local Packaging

To build Lambda zip packages locally:

```bash
cd backend
npm run qa:enrichment
npm run qa:live
npm run check:pipeline-readiness
npm run package:functions
npm run package:monitors
```

`qa:live` runs health checks by default. Authenticated read checks require `VENTUS_API_KEY`. Enrichment job submission is disabled unless `VENTUS_LIVE_QA_ENABLE_WRITE=true`.

Packages are written to `backend/dist/lambda`. The script installs each function's production dependencies in a temporary build folder before zipping, and copies only the `shared/` subfolders that function actually imports.

## Recommended Next Refactor

Keep behavior stable first. Do not change enrichment taxonomy, prompts, or output direction as part of source recovery.

Recommended backend-only cleanup order:

1. Extract shared DB, secrets, SQS, and webhook helpers.
2. Add unit tests around API request validation and job status shaping.
3. Add a golden end-to-end smoke test against a staging database.
4. Add OpenAPI docs to the API Lambda or a docs hosting path.
5. Add webhook list/delete/test endpoints.
6. Add observable job-stage latency and stuck-job detection.
7. Move infrastructure into Terraform or CDK.
