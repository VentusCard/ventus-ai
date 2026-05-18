# Observability Readiness

This document captures the first operational readiness layer for the Ventus backend. It is repo-only and does not deploy alarms or monitors by itself.

## Pipeline SLA

The initial thresholds live in `backend/config/pipeline-slas.json`.

Pilot defaults:

- Stuck job SLA: 20 minutes.
- Warn if full pipeline completion exceeds 12 minutes.
- Page if full pipeline completion exceeds 20 minutes.
- Terminal statuses: `complete`, `failed`.

The pipeline stages tracked today are:

- `ingested`
- `classified`
- `pillar_analyzed`
- `travel_detected`
- `lifestyle_analyzed`
- `risk_analyzed`
- `complete`

Run the readiness validation:

```sh
npm run --prefix backend check:pipeline-readiness
```

## Stuck Job Detector

The read-only query lives at `backend/sql/stuck-pipeline-runs.sql`.

It flags rows in `pipeline_runs` where:

- `status` is not `complete` or `failed`.
- `completed_at` is null.
- `ingested_at` is older than the configured SLA.

The query also returns the first missing stage timestamp to direct triage to the right worker.

## Proposed CloudWatch Alarms

The CDK proposal in `infra/lib/ventus-existing-infra-stack.ts` now covers:

- SNS alert topic for backend alarms.
- Lambda `Errors` for every backend function.
- Lambda `Duration` near timeout.
- Lambda `Throttles`.
- SQS DLQ visible messages.
- SQS oldest message age.
- API Gateway 5xx errors.
- API Gateway p95 latency.
- Webhook delivery failures from worker log metric filters.
- Scheduled stuck-job monitor Lambda and `StuckPipelineRuns` alarm.

Still needed before production deployment:

- Final alert subscriptions, such as email, PagerDuty, or Slack.
- CloudWatch log retention policies.
- Billing alarms and AWS Cost Anomaly Detection.
- Aurora CPU, connection, storage, and replication/availability alarms.
- DB network-path review for the scheduled stuck-job monitor before staging deploy.

## Staging Monitor Rollout

The proposed monitor source lives at `backend/monitors/stuck-job-monitor`.

It does the following:

- Reads DB credentials from Secrets Manager.
- Queries `pipeline_runs` for rows older than the configured stuck-job SLA.
- Publishes `Ventus/Pipeline` `StuckPipelineRuns` to CloudWatch.
- Publishes a concise SNS alert when stuck jobs are found.

Package and synthesize:

```sh
npm run --prefix infra synth
```

Optional email subscription during synth:

```sh
npm run --prefix infra synth -- -c alertEmail=ops@example.com
```

Staging deploy prerequisites:

- Configure GitHub Actions AWS OIDC using `docs/github-aws-oidc-staging.md`.
- Confirm the monitor Lambda can reach Aurora through the approved VPC/security-group path:
  - VPC: `vpc-0d4cf689a4fed7f31`
  - Lambda subnets: `subnet-057aa09eef4545099`, `subnet-00958cfa806e7e363`
  - Database security group: `sg-08836ed15d778ecd6`
- Confirm alert recipients and escalation ownership.
- Confirm the first deployment target is staging, not production.
- Review the synthesized resources before `cdk deploy`.
- Complete `docs/cdk-deployment-review-checklist.md`.

## Incident Triage Map

Missing `classified_at`:

- Check `/aws/lambda/ventus-classify-transactions`.
- Check `ventus-classify-queue` and its DLQ.

Missing `pillar_analyzed_at`:

- Check `/aws/lambda/ventus-analyze-pillar-transactions`.
- Check `ventus-pillar-queue` and its DLQ.

Missing `travel_detected_at`:

- Check `/aws/lambda/ventus-travel-detection`.
- Check `ventus-travel-queue` and its DLQ.

Missing `lifestyle_analyzed_at`:

- Check `/aws/lambda/ventus-analyze-lifestyle-signals`.
- Check `ventus-lifestyle-queue` and its DLQ.

Missing `risk_analyzed_at`:

- Check `/aws/lambda/ventus-risk-detection`.
- Check `ventus-risk-queue` and its DLQ.

Webhook failures:

- Search worker logs for `[WEBHOOK] Failed after`.
- Confirm the registration in `webhook_registrations`.
- Confirm the client endpoint returns a 2xx response.
- Confirm the HMAC secret matches the client.

## Pilot Readiness Gap

The repo now defines what should be monitored, but it does not yet deploy or route alerts. The next readiness step is to add an alert destination and a scheduled stuck-job monitor in staging first.
