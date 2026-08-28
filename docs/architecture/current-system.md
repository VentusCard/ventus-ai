# Current system architecture (what's built)

> **✅ CURRENT (as of 2026-08).** This describes the system that actually exists in
> the repo and is deployed. For forward-looking design, see
> [`intelligence-control-plane.md`](./intelligence-control-plane.md) — that is
> vision, not current state.

## Overview

Ventus enriches bank transaction data into customer intelligence (lifestyle
pillars, life events, behavioral signals, trips, risk factors) and exposes it
through a per-bank API plus webhooks. There are two backends:

- **AWS (production)** — the real enrichment pipeline + product API. Postgres-backed.
- **Supabase (demo only)** — powers the `bankdemo` frontend and a few AI/edge features.

The React/Vite frontend is hosted on **AWS Amplify**. Auth today is **Supabase**
(frontend); the product API authenticates with **per-bank API keys**.

## Data pipeline (AWS)

Event-driven Lambda pipeline over SQS, writing to Aurora PostgreSQL:

```text
CSV upload → S3 ─┐
                 ├─► ventus-ingest-transactions ──► transactions_raw + pipeline_runs
POST /v1/enrich ─┘        │ (SQS: classify)
                          ▼
                 ventus-classify-transactions ──► transactions_enriched, merchant_cache
                          │ (fan-out SQS: pillar, lifestyle, risk, travel)
        ┌─────────────────┼───────────────────┬───────────────────┐
        ▼                 ▼                   ▼                   ▼
 analyze-pillar     analyze-lifestyle    risk-detection     travel-detection
        │                 │                   │                   │
        ▼                 ▼                   ▼                   ▼
customer_pillar_   customer_life_events  customer_risk_     customer_trips
   profiles        + life_event_evidence    factors
```

- **Ingestion** — `ventus-ingest-transactions` (S3 CSV) and `ventus-api`'s
  `POST /v1/enrich` (real-time batch) write `transactions_raw` and create
  `pipeline_runs` rows, then enqueue classification.
- **Classification** — `ventus-classify-transactions` normalizes/enriches merchants
  (LLM via the model gateway, cached in `merchant_cache`), writes
  `transactions_enriched`, and fans out to four analysis queues.
- **Analysis workers** — pillar, lifestyle (life events + behavioral signals),
  risk, and travel workers write their respective tables and stamp
  `pipeline_runs.*_analyzed_at` progress. High-signal events fire webhooks.
- **Monitors** — `stuck-job-monitor` (emits `batch_stuck`) and
  `webhook-delivery-monitor` (delivery health metrics).

## Data model

Core product tables live in `backend/sql/core-product-schema.sql` (code-derived
baseline). Operational tables have their own files: `model-evaluation-runs.sql`,
`webhook-delivery-attempts.sql`, `webhook-payload-v2-migration.sql`, and the
`stuck-pipeline-runs.sql` monitor query. All tables are tenant-scoped by `bank_id`.

## Public API (`ventus-api`)

Express app behind API Gateway, authed by `x-api-key` against the `api_keys`
table (per-bank). Routes are contract-checked against `docs/api/openapi-draft.yaml`.
Surface (see `backend/functions/ventus-api/index.mjs`):

- **Customer intelligence** — `/v1/customers/:id/{profile,life-events,purchase-signals,trips,risk-factors,transactions}`
- **Bank-wide analytics** — `/v1/analytics/bank`
- **Ingestion + jobs** — `POST /v1/enrich`, job status endpoints
- **Webhooks** — `/v1/webhooks` register/update/delete; deliveries recorded in
  `webhook_delivery_attempts` (see
  [`../integrations/webhook-partner-integration-guide.md`](../integrations/webhook-partner-integration-guide.md)).

## AI Coworker (`backend/shared/coworker`)

Email-driven assistant for wealth advisors. `ventus-coworker-inbound` runs one
turn per inbound email: parse (SES/S3) → classify intent → route to a task
(audience build, compose outreach, prep, evidence, summary, or grounded Q&A) →
render a governed reply → persist thread/turn state in DynamoDB.
`ventus-coworker-digest` builds scheduled digests. Provisioned by
`infra/lib/ventus-coworker-stack.ts`. Runbook:
[`../runbooks/coworker-email-demo.md`](../runbooks/coworker-email-demo.md).

## Model gateway

All LLM calls route through `backend/shared/platform/model-gateway.mjs` using
`backend/config/model-routing.json` (per-task provider/model). Shadow evaluations
are recorded in `model_evaluation_runs`. Offline benchmarking lives in
`backend/eval/`. See
[`../runbooks/model-gateway-deployment-checklist.md`](../runbooks/model-gateway-deployment-checklist.md).

## Demo stack (not production)

- `ventus-demo-connectors` — sandbox Plaid + Salesforce FSC connectors (synthetic
  data) for the live demo; `backend/shared/demo/`.
- **Supabase** — the `bankdemo` frontend reads mostly static mock data and calls
  Supabase edge functions for a few live AI features. Supabase is demo-only; the
  production path is the AWS `ventus-api`.

## Infrastructure

AWS CDK in `infra/` (TypeScript). Active stacks: `VentusExistingInfraStack`
(pipeline base), `VentusCoworkerStack`, `VentusDemoConnectorsStack`, and
`VentusIdentityStack` (optional Cognito foundation, not wired to app auth).
`VentusConsoleApiStack` and `VentusEvidenceStoreStack` remain as **retirement
shells** (no Lambda/DB access). Deploys: `scripts/deploy.sh` (pipeline + monitors)
and the `infra-staging` GitHub workflow (CDK). Runtime deps: Lambda, API Gateway,
Aurora PostgreSQL, SQS, S3, Secrets Manager, CloudWatch, Gemini (key in Secrets
Manager).

## Auth (today vs planned)

- **Today:** Supabase email/password (frontend); per-bank API keys (product API).
- **Planned:** enterprise SSO/OIDC + role-based access for banks (Cognito/WorkOS
  under evaluation). See
  [`enterprise-identity-and-permissions.md`](./enterprise-identity-and-permissions.md)
  and [`../security/aws-identity-migration-runbook.md`](../security/aws-identity-migration-runbook.md).

## Not yet built (tracked as future work)

- Tenant-scoped decision/audit ledger + forced RLS (prior Evidence Store retired).
- Generative ("Bucket 3") features on the AWS API.
- Full IaC coverage for pipeline functions (currently `deploy.sh`).
- Enterprise SSO/RBAC and an authenticated console API.
