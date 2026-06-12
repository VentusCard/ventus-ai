# Ventus AI

The Future of Personalized Banking

## Repository map

| Path | Purpose |
| --- | --- |
| [`src/`](src/) | Marketing site and TE Pilot demo UI (Vite + React) |
| [`supabase/`](supabase/) | Demo edge functions (not production API) |
| [`supabase/ENRICHMENT_FLOW.md`](supabase/ENRICHMENT_FLOW.md) | Demo enrichment orchestration (Supabase edge functions + UI gating) |
| [`backend/`](backend/) | Production API and pipeline Lambdas (`api.ventusai.com`) |
| [`infra/`](infra/) | AWS CDK and infrastructure scripts |

Production enrichment runs on AWS (`backend/`). See [`backend/RUNBOOK.md`](backend/RUNBOOK.md) for operations.
