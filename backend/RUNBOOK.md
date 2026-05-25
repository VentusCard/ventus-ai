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

## Webhook Payloads (schema_version 1)

`life_event_detected` and `behavioral_signal_detected` use thin ID arrays. Load full rows from `customer_life_events` by id (same table; `event_category` is `life_event` or `behavioral`).

```json
{
  "event": "life_event_detected",
  "bank_id": "bank_id",
  "delivery_id": "uuid",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_id",
    "batch_id": "batch_id",
    "life_event_ids": ["row-uuid-1", "row-uuid-2"]
  }
}
```

```json
{
  "event": "behavioral_signal_detected",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_id",
    "batch_id": "batch_id",
    "behavioral_signal_ids": ["row-uuid-3"]
  }
}
```

Only **new** rows with `webhook_fired_at` set on this run are included. Replay uses stored `payload_json` on `webhook_delivery_attempts`.

## Webhook Failure Triage

Symptoms:

- Logs contain `[WEBHOOK] Failed after ... attempts`.
- Client says they did not receive `batch_complete`, `life_event_detected`, `trip_detected`, or `risk_detected`.

Triage sequence:

1. Confirm webhook registration URL and event list in `webhook_registrations`.
2. Confirm HMAC secret alignment with the client.
3. Confirm client endpoint returns a 2xx response quickly.
4. Check whether stale test endpoints such as `webhook.site` are still active.
5. Recommended product gap: add `GET`, `DELETE`, and test-delivery endpoints for webhook registrations.

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

The CDK stack in `infra/lib/ventus-existing-infra-stack.ts` now includes deployed readiness CloudWatch alarms, SNS alarm actions, webhook failure metric filters, and a scheduled stuck-job monitor. Keep future changes behind CDK diff review and staging approval.

## Deployment Guardrail

Do not deploy recovered backend code directly to production until:

- source review is complete
- CI is passing
- deployment package diff is understood
- rollback plan exists
- infrastructure ownership model is agreed
