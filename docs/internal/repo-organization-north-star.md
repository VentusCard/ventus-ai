# Repo organization north star

Target state for **ventus-ai-backend** and **ventus-ai-frontend** before STAR pilot. This doc is internal engineering context; partners use `docs/integrations/webhook-partner-integration-guide.md` and `docs/openapi.yaml`.

## Two repositories

| Repo | Owns | Deploys to |
| --- | --- | --- |
| **ventus-ai-backend** | API, pipeline Lambdas, SQL, CDK, OpenAPI, RUNBOOK | AWS Lambda, Aurora, SQS, S3 triggers |
| **ventus-ai-frontend** | Marketing (Vite/Lovable), portal (Next.js), Supabase prototypes | Amplify / Vercel — browsers only |

Runtime rule: if it runs in **AWS on Node**, it is backend. If it runs in the **browser**, it is frontend.

## ventus-ai-backend tree

```text
ventus-ai-backend/
├── README.md
├── RUNBOOK.md
├── package.json
├── functions/              # One folder per Lambda (index.mjs + package.json)
├── shared/                 # Libraries imported by functions, grouped by concern:
│   ├── platform/           #   db, secrets, tenant-context, webhooks, batch-*, model gateway
│   ├── pipeline/           #   production enrichment (classify-core, ingest normalizers)
│   ├── pilot/              #   governed pilot / control-plane (ledger, experiments, growth-play)
│   ├── demo/               #   demo connector service (synthetic)
│   └── coworker/           #   AI Coworker subsystem (+ fixtures)
├── monitors/               # Scheduled Lambdas (stuck job, webhook delivery)
├── sql/
│   └── migrations/         # Numbered, idempotent; staging first, then public
├── scripts/                # CI/deploy/ops only: package-*, deploy, qa contract checks, check:*, smoke-api
├── eval/                   # Offline evaluation & benchmarking lab (model-eval, plaid-bench) — not deployed
├── config/
│   └── environments/       # staging.json, production.json (no secrets)
├── fixtures/               # QA / golden data (not deployed)
├── infra/                  # CDK + audit/remediate scripts + security baselines
├── docs/
│   ├── openapi.yaml
│   ├── webhook-partner-integration-guide.md
│   ├── ventus-api.postman_collection.json
│   └── internal/           # audits, OIDC, QA harness
└── .github/workflows/
    ├── ci.yml
    ├── deploy-staging.yml
    └── deploy-prod.yml
```

## Staging vs production sync

| Layer | In sync? | How |
| --- | --- | --- |
| Application code | Yes | Same git SHA on staging and prod Lambdas after promotion |
| SQL migrations | Yes | Same files; apply to `staging` schema, then `public` |
| OpenAPI | Yes | Single `docs/openapi.yaml`; CI `check:routes` |
| Data | **No** (intentional) | Staging uses test/synthetic files; prod has STAR data |
| Secrets / API keys | No | Separate keys and webhook URLs per environment |

Promotion: merge → deploy staging → migrate staging → qa:live → approve → deploy prod (same SHA) → migrate public.

## Monitors and shared/ packaging

**Pipeline Lambdas** and **monitor Lambdas** use the same rule in packaging scripts: copy into `./shared/` inside the zip only the `shared/` subfolders each entry transitively imports (excluding `*.test.mjs`), so production pipeline Lambdas no longer ship `pilot/`, `demo/`, or `coworker/` code.

- `scripts/package-functions.mjs` — all workers
- `scripts/package-monitors.mjs` — `copySharedIntoBuild()` (same behavior)
- `scripts/lib/collect-shared-modules.mjs` — static import tracer that computes the needed subfolders

Monitors import shared code as `./shared/platform/batch-stuck.mjs`, etc. After any change under `shared/`, run:

```bash
npm run package:functions   # if pipeline workers changed
npm run package:monitors    # before updating monitor Lambda code in AWS
```

Redeploy monitor Lambdas via CDK or `aws lambda update-function-code` on `ventus-stuck-job-monitor` / `ventus-webhook-delivery-monitor` when shared webhook or batch modules change.

## What does not belong in backend

- Lovable `src/` marketing UI
- Supabase edge functions used for demos
- Linear `scripts/linear/` (optional; can stay local or move to frontend repo)

## Related Linear project

**Repo Organization** — import via:

```bash
cd scripts/linear
export LINEAR_API_KEY="lin_api_..."
npm run import:repo-org
```
