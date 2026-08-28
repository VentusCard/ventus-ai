# Backend Operations Runbook

This runbook covers the AWS backend serving `api.ventusai.com`. It is intentionally backend/platform scoped and does not define UI, enrichment taxonomy, or product-direction changes.

## Production Shape

- API Gateway REST API: `ventus-api`
- API Lambda: `ventus-api`
- Database: Aurora PostgreSQL `ventus_bofa`
- Upload bucket: `ventus-te-pilot`
- Queues:
  - `ventus-classify-queue`
  - `ventus-pillar-queue`
  - `ventus-lifestyle-queue`
  - `ventus-risk-queue`
  - `ventus-travel-queue`
- Worker Lambdas:
  - `ventus-ingest-transactions`
  - `ventus-classify-transactions`
  - `ventus-analyze-pillar-transactions`
  - `ventus-analyze-lifestyle-signals`
  - `ventus-risk-detection`
  - `ventus-travel-detection`

## Routine Health Checks

1. Check API health:

```bash
curl https://api.ventusai.com/health
```

Expected response:

```json
{ "status": "healthy" }
```

2. Check a known demo customer with a test API key:

```bash
VENTUS_API_KEY=... npm run --prefix backend smoke:api
```

3. Confirm no DLQ backlog:

```bash
aws sqs get-queue-attributes \
  --queue-url https://us-east-2.queue.amazonaws.com/373633008995/ventus-classify-queue-dlq \
  --attribute-names ApproximateNumberOfMessages \
  --region us-east-2
```

Repeat for every DLQ.

## Job Status Semantics

Current statuses observed in `pipeline_runs`:

- `ingested`
- `classified`
- `pillar_analyzed`
- `travel_detected`
- `lifestyle_analyzed`
- `risk_analyzed`
- `complete`
- `failed`

Current completion logic:

- Classification publishes four downstream jobs.
- Each downstream worker increments `stages_complete`.
- When `stages_complete >= 4`, the customer job becomes `complete`.

Important operational note:

- A job can appear paused at an intermediate status while a slow downstream worker is still running.
- In one smoke test, the pillar worker took about 108 seconds because Gemini returned malformed JSON on the first attempt and succeeded on retry.

## Stuck Job Triage

Symptoms:

- `GET /v1/jobs/{batch_id}` does not reach `complete`.
- `completed_at` remains null.
- One or more stage timestamps remain null.

Triage sequence:

1. Inspect job status by API.
2. Identify missing stage timestamp.
3. Check the corresponding Lambda log group:
   - missing `classified_at`: `/aws/lambda/ventus-classify-transactions`
   - missing `pillar_analyzed_at`: `/aws/lambda/ventus-analyze-pillar-transactions`
   - missing `lifestyle_analyzed_at`: `/aws/lambda/ventus-analyze-lifestyle-signals`
   - missing `risk_analyzed_at`: `/aws/lambda/ventus-risk-detection`
   - missing `travel_detected_at`: `/aws/lambda/ventus-travel-detection`
4. Check the corresponding SQS DLQ.
5. If the stage failed, preserve logs before retrying or replaying.

Readiness check:

```bash
npm run --prefix backend check:pipeline-readiness
```

Read-only SQL detector:

```sql
-- see backend/sql/stuck-pipeline-runs.sql
```

Initial pilot SLA:

- Warn if a job has not completed within 12 minutes.
- Page if a job has not completed within 20 minutes.
- Treat `complete` and `failed` as terminal states.

Stage timing thresholds are codified in `backend/config/pipeline-slas.json`.

Scheduled monitor proposal:

- Source: `backend/monitors/stuck-job-monitor`
- Metric: `Ventus/Pipeline` `StuckPipelineRuns`
- Alert topic: `ventus-backend-alerts`
- Schedule: every 5 minutes

Before enabling it in staging, confirm Lambda-to-Aurora network access and alert recipients.

Monitor zip builds use the same `backend/shared/` modules as pipeline Lambdas (excluding `*.test.mjs`). Deploy monitor **code** with:

```bash
./backend/scripts/deploy.sh monitors
```

Deploy pipeline workers and monitors together:

```bash
./backend/scripts/deploy.sh all
```

Monitor **infra** (schedule, IAM, VPC, alarms) remains CDK / `infra-staging` workflow — `deploy.sh` only updates Lambda zip code.

## Webhook Payloads (schema_version 1)

Apply `backend/sql/webhook-payload-v2-migration.sql` to Aurora (RDS Query Editor is fine) before deploying lambdas that use `webhook_fired_at`, `warnings`, or batch outcome/stuck columns. The script is idempotent (`IF NOT EXISTS`).

### Entity events (thin ID arrays)

| Event | IDs in `data` | Load detail via (preferred) |
|-------|----------------|------------------------------|
| `life_event_detected` | `life_event_ids[]` | `GET /v1/customers/:id/life-events/:life_event_id` |
| `behavioral_signal_detected` | `behavioral_signal_ids[]` | `GET /v1/customers/:id/behavioral-signals/:behavioral_signal_id` |
| `risk_detected` | `risk_factor_ids[]` (high severity, new this run) | `GET /v1/customers/:id/risk-factors/:risk_factor_id` |
| `trip_detected` | `trip_ids[]` (new/updated this run) | `GET /v1/customers/:id/trips/:trip_id` |

```json
{
  "event": "life_event_detected",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_id",
    "batch_id": "batch_id",
    "life_event_ids": ["row-uuid-1"]
  }
}
```

```json
{
  "event": "risk_detected",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_id",
    "batch_id": "batch_id",
    "risk_factor_ids": ["42", "43"]
  }
}
```

```json
{
  "event": "trip_detected",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_id",
    "batch_id": "batch_id",
    "trip_ids": ["trip_cust_paris_20250101"]
  }
}
```

### `webhook_fired_at` dedup (entity events)

All entity webhooks use a `webhook_fired_at` column on the source table. Re-fire rules differ by domain:

| Table | Events | When webhook fires |
| --- | --- | --- |
| `customer_life_events` | `life_event_detected` | **New** life event row only; re-confirms do not re-webhook |
| `customer_life_events` | `behavioral_signal_detected` | **New** behavioral row only (and `webhook_eligible`) |
| `customer_risk_factors` | `risk_detected` | High-severity rows inserted this run |
| `customer_trips` | `trip_detected` | Every trip written/upserted this run |

Per-customer pipeline failures are recorded on `pipeline_runs` (`status = failed`, `error_message`, `warnings`). There is no per-customer failure webhook; use `batch_partial` / `batch_failed` when the batch finishes, or `batch_stuck` if the batch exceeds SLA while still running. Detail: `GET /v1/jobs/:batch_id`.

### Batch outcome events

Emitted once per `batch_id` when all customers are terminal (complete or failed):

| Event | When |
|-------|------|
| `batch_complete` | All customers finished all stages |
| `batch_partial` | Mix of complete and failed |
| `batch_failed` | All customers failed |

```json
{
  "event": "batch_partial",
  "data": {
    "schema_version": 1,
    "batch_id": "batch_id",
    "customers_processed": 8,
    "customers_failed": 2,
    "status": "partial"
  }
}
```

`GET /v1/jobs/:id` returns `batch_outcome_event`, `batch_outcome_webhook_at`, `batch_stuck_webhook_at`, and per-customer `warnings` (JSON array).

### Batch stuck event

Emitted **once per `batch_id`** by the scheduled stuck-job monitor when one or more customers exceed the stuck-job SLA (default 20 minutes) and are still not `complete` or `failed`. Opt in via webhook registration (`batch_stuck`).

```json
{
  "event": "batch_stuck",
  "data": {
    "schema_version": 1,
    "batch_id": "batch_id",
    "status": "stuck",
    "sla_minutes": 20,
    "stuck_customer_ids": ["cust_a", "cust_b"],
    "customers_complete": 8,
    "customers_failed": 0,
    "customers_in_progress": 2
  }
}
```

Load per-customer stage detail via `GET /v1/jobs/:batch_id`. A batch may receive `batch_stuck` while still running, then later `batch_complete`, `batch_partial`, or `batch_failed` when all customers finish.

Replay uses stored `payload_json` on `webhook_delivery_attempts`.

## Webhook Failure Triage

Symptoms:

- Logs contain `[WEBHOOK] Failed after ... attempts`.
- CloudWatch alarm `ventus-webhook-readiness-failed-deliveries` enters alarm state.
- Client says they did not receive `batch_complete`, `batch_partial`, `batch_failed`, `batch_stuck`, `life_event_detected`, `trip_detected`, or `risk_detected`.

Triage sequence:

1. Confirm the active endpoint and event list with `GET /v1/webhooks`.
2. Inspect recent failures with `GET /v1/webhook-deliveries?status=failed&limit=20`.
3. Compare the client's logged `x-ventus-delivery-id` with the Ventus delivery history.
4. Confirm HMAC secret alignment with the client.
5. Confirm the client endpoint returns a 2xx response quickly after accepting or queueing the event.
6. Disable stale test endpoints such as `webhook.site` with `DELETE /v1/webhooks/{webhook_id}`.
7. Send a signed test delivery with `POST /v1/webhooks/{webhook_id}/test` after endpoint changes.
8. Replay a failed delivery with `POST /v1/webhook-deliveries/{delivery_id}/replay` only after the partner endpoint is ready.

Partner onboarding and support examples live in `docs/integrations/webhook-partner-integration-guide.md`.

## S3 CSV Ingestion Triage

Symptoms:

- Bank uploads CSV but no job appears.

Triage sequence:

1. Confirm upload path and suffix `.csv`.
2. Confirm S3 event notification exists on `ventus-te-pilot`.
3. Check `/aws/lambda/ventus-ingest-transactions`.
4. Check `transactions_raw` and `pipeline_runs`.
5. Confirm duplicate `transaction_id` behavior did not skip all rows.

## Recommended Alarms

Add CloudWatch alarms for:

- Lambda error count > 0 for production functions.
- Lambda duration near timeout.
- Lambda throttles > 0.
- SQS DLQ visible messages > 0.
- SQS oldest message age > 10 minutes.
- Stuck jobs older than SLA.
- Webhook delivery failures.
- API 5xx responses.
- API p95 latency.
- Aurora CPU/connections/storage anomalies.
- Monthly billing threshold and anomaly detection.

The CDK stack in `infra/lib/ventus-existing-infra-stack.ts` now includes deployed readiness CloudWatch alarms, SNS alarm actions, webhook failure metric filters, a scheduled stuck-job monitor, and a scheduled ledger-backed webhook delivery monitor. Keep future changes behind CDK diff review and staging approval.

## Deployment Guardrail

Do not deploy recovered backend code directly to production until:

- source review is complete
- CI is passing
- deployment package diff is understood
- rollback plan exists
- infrastructure ownership model is agreed
