# Backend Tech Readiness Backlog

This backlog is scoped to backend and platform readiness. It intentionally excludes UI/UX changes, enrichment taxonomy changes, prompt-direction changes, and dataset changes.

## P0 - Source Of Truth

- Add the recovered backend source to the canonical GitHub repo or move it to a dedicated backend repo.
- Decide whether this monorepo should own `frontend`, `backend`, and `infra`, or whether backend/infra should live separately.
- Protect production deployment so it cannot happen from an unreviewed local or console-only change.

## P0 - API Documentation

- Host `docs/api/openapi-draft.yaml` through `/docs` or a bank-facing docs site.
- Generate a Postman collection from the OpenAPI spec. Initial generator and checked-in collection live at `backend/scripts/generate-postman-collection.mjs` and `docs/api/ventus-api.postman_collection.json`.
- Add a partner-facing webhook integration guide. Initial guide lives in `docs/integrations/webhook-partner-integration-guide.md` with registration, test delivery, delivery history, replay, signature verification, monitoring, and Postman import steps.
- Add concrete request/response examples for:
  - `POST /v1/enrich`
  - `GET /v1/jobs/{job_id}`
  - `GET /v1/customers/{customer_id}/transactions`
  - `POST /v1/webhooks` - initial partner-facing examples added in `docs/integrations/webhook-partner-integration-guide.md`

## P0 - Monitoring

- Add alarms for Lambda errors and duration. Initial CDK alarm proposals exist in `infra/lib/ventus-existing-infra-stack.ts`.
- Add alarms for DLQ depth on every queue. Initial CDK alarm proposals exist in `infra/lib/ventus-existing-infra-stack.ts`.
- Add stuck-job detection for pipeline runs that do not reach `complete` or `failed` within an expected SLA. Initial config and SQL live in `backend/config/pipeline-slas.json` and `backend/sql/stuck-pipeline-runs.sql`.
- Add webhook delivery failure metrics and alerts. Initial CloudWatch log metric filters and the ledger-based `ventus-webhook-delivery-monitor` are deployed through CDK; remaining verification is a reviewed manual monitor invocation after the action limit resets.
- Add persistent webhook delivery history. Initial `webhook_delivery_attempts` schema, dispatcher writes, and `GET /v1/webhook-deliveries` endpoint added.
- Add explicit CloudWatch log retention. Initial six-month retention is codified in CDK for backend Lambda log groups and checked in CI.
- Add Aurora cluster alarms for CPU, connections, free local storage, replica lag, and volume bytes used. Initial CDK alarms are checked in CI.

## P1 - Pipeline Reliability

- Make job status more client-friendly by separating stage status from aggregate job status.
- Add a `partial_failure` state for multi-customer batches.
- Add retry/replay runbook for failed customer stages.
- Add idempotency documentation for duplicate `transaction_id`.
- Add webhook retry/replay controls. Initial `POST /v1/webhook-deliveries/{delivery_id}/replay` implementation added for failed deliveries with stored replay payloads.
- Add webhook management endpoints:
  - `GET /v1/webhooks` - initial implementation added
  - `DELETE /v1/webhooks/{webhook_id}` - initial implementation added as a soft-disable
  - `POST /v1/webhooks/{webhook_id}/test` - initial implementation added for signed test delivery
- Add partner-facing support docs for webhook onboarding and incident response. Initial guide lives in `docs/integrations/webhook-partner-integration-guide.md`, and the backend runbook now points support triage there.

## P1 - Security Hardening

- Narrow production CORS. Initial `ventus-api` allowlist is environment-driven through `VENTUS_ALLOWED_ORIGINS` and checked in CI.
- Add API throttling or usage plans. Initial pilot usage plan is codified in CDK with throttle/quota defaults; API key association remains a per-client onboarding step.
- Review public RDS exposure and public `/32` ingress rules. Current exposure is captured in `infra/security/rds-network-exposure-baseline.json` and checked in CI; remediation remains to remove the public instance/access path after owner validation.
- Separate DB credentials and model-provider credentials into separate Secrets Manager secrets. Runtime support is merged, `ventus/model-providers/gemini` exists, Lambda env vars/IAM are wired, the recovered backend package that reads `MODEL_PROVIDER_SECRET_ID` was deployed to the seven backend Lambdas on 2026-05-20, `GEMINI_API_KEY` was removed from the DB credential secret, the live cutover audit passes, and both secrets now use customer-managed KMS keys. Authenticated enrichment smoke passed after the model-provider KMS migration; public health and invalid-key auth checks passed after the DB KMS migration.
- Define secret rotation policy. Initial baseline is checked in CI: database credentials every 30 days, model-provider credentials every 90 days, and no single secret should contain both DB and model-provider keys. Rotation/KMS posture is captured in `infra/security/secrets-rotation-kms-baseline.json`, live secrets are tagged with owner/target rotation metadata, and proposed KMS policy artifacts live in `infra/iam/secrets-kms-*.json`. DB rotation enablement gates are captured in `infra/security/db-secret-rotation-preflight.json`, and the DB rotation Lambda `ventus-db-credential-rotation` was deployed through the protected GitHub infra workflow on 2026-05-21; remaining implementation is to run a reviewed manual DB rotation test, enable the 30-day schedule after rollback checks pass, and complete the manual model-provider key rotation process.
- Enable tracing for API Gateway/Lambda where appropriate. API Gateway tracing/access logs and Lambda active tracing were enabled on 2026-05-20 and can be verified against live AWS with `npm run --prefix infra audit:tracing`.
- Enable S3 versioning if bank-upload retention requires it.

## P1 - QA Harness

- Add backend-only smoke tests against a staging API and staging database.
- Add schema contract tests for API responses. Initial CI-safe checks live in `backend/scripts/qa-enrichment-contract.mjs`.
- Add golden enrichment expectations for mock FIS, Fiserv, Jack Henry, and provider-agnostic multi-rail transactions. Initial CI-safe checks live in `backend/eval/qa-golden-enrichment.mjs`.
- Add multi-LLM evaluation routing before sandbox data arrives. Initial task routing and gateway readiness checks live in `backend/config/model-routing.json`, `backend/shared/platform/model-gateway.mjs`, and `backend/scripts/check-model-gateway-readiness.mjs`; the judge route starts shadow-only and must not alter production enrichment output until measured against golden expectations.
- Add latency checks for each pipeline stage.
- Add regression tests for webhook signing and delivery payload shape.
- Add regression tests for webhook delivery persistence. Initial shared dispatcher tests cover delivered and failed attempts.

## P2 - IaC

- Import current resources into Terraform or CDK without replacing live resources.
- Codify API Gateway, Lambda, SQS, S3 notification, Aurora, IAM, CloudWatch, VPC, and secrets references.
- Add CI plan checks for infrastructure changes.
- Add drift detection.
