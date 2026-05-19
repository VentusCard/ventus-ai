# Backend Tech Readiness Backlog

This backlog is scoped to backend and platform readiness. It intentionally excludes UI/UX changes, enrichment taxonomy changes, prompt-direction changes, and dataset changes.

## P0 - Source Of Truth

- Add the recovered backend source to the canonical GitHub repo or move it to a dedicated backend repo.
- Decide whether this monorepo should own `frontend`, `backend`, and `infra`, or whether backend/infra should live separately.
- Protect production deployment so it cannot happen from an unreviewed local or console-only change.

## P0 - API Documentation

- Host `docs/openapi-draft.yaml` through `/docs` or a bank-facing docs site.
- Generate a Postman collection from the OpenAPI spec.
- Add concrete request/response examples for:
  - `POST /v1/enrich`
  - `GET /v1/jobs/{job_id}`
  - `GET /v1/customers/{customer_id}/transactions`
  - `POST /v1/webhooks`

## P0 - Monitoring

- Add alarms for Lambda errors and duration. Initial CDK alarm proposals exist in `infra/lib/ventus-existing-infra-stack.ts`.
- Add alarms for DLQ depth on every queue. Initial CDK alarm proposals exist in `infra/lib/ventus-existing-infra-stack.ts`.
- Add stuck-job detection for pipeline runs that do not reach `complete` or `failed` within an expected SLA. Initial config and SQL live in `backend/config/pipeline-slas.json` and `backend/sql/stuck-pipeline-runs.sql`.
- Add webhook delivery failure metrics and alerts. Initial CloudWatch log metric filter proposal exists in CDK.
- Add explicit CloudWatch log retention.

## P1 - Pipeline Reliability

- Make job status more client-friendly by separating stage status from aggregate job status.
- Add a `partial_failure` state for multi-customer batches.
- Add retry/replay runbook for failed customer stages.
- Add idempotency documentation for duplicate `transaction_id`.
- Add webhook management endpoints:
  - `GET /v1/webhooks`
  - `DELETE /v1/webhooks/{webhook_id}`
  - `POST /v1/webhooks/{webhook_id}/test`

## P1 - Security Hardening

- Narrow production CORS.
- Add API throttling or usage plans.
- Review public RDS exposure and public `/32` ingress rules.
- Separate DB credentials and model-provider credentials into separate Secrets Manager secrets.
- Define secret rotation policy.
- Enable tracing for API Gateway/Lambda where appropriate.
- Enable S3 versioning if bank-upload retention requires it.

## P1 - QA Harness

- Add backend-only smoke tests against a staging API and staging database.
- Add schema contract tests for API responses. Initial CI-safe checks live in `backend/scripts/qa-enrichment-contract.mjs`.
- Add golden enrichment expectations for mock FIS, Fiserv, and Jack Henry transactions. Initial CI-safe checks live in `backend/scripts/qa-golden-enrichment.mjs`.
- Add latency checks for each pipeline stage.
- Add regression tests for webhook signing and delivery payload shape.

## P2 - IaC

- Import current resources into Terraform or CDK without replacing live resources.
- Codify API Gateway, Lambda, SQS, S3 notification, Aurora, IAM, CloudWatch, VPC, and secrets references.
- Add CI plan checks for infrastructure changes.
- Add drift detection.
