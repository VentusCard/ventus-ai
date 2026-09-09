# Observability Readiness

This document captures the first operational readiness layer for the Ventus backend. The CDK resources are deployed only through reviewed diff/deploy workflows.

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

## Deployed Readiness Monitoring

The CDK stack in `infra/lib/ventus-existing-infra-stack.ts` now covers:

- SNS alert topic for backend alarms.
- Lambda `Errors` for every backend function.
- Lambda `Duration` near timeout.
- Lambda `Throttles`.
- SQS DLQ visible messages.
- SQS oldest message age.
- API Gateway 5xx errors.
- API Gateway p95 latency.
- API Gateway pilot usage plan with steady-state throttle, burst limit, and monthly quota.
- Environment-driven API CORS allowlist for `ventus-api`.
- Webhook delivery failures from worker log metric filters.
- Failed webhook deliveries from the Aurora `webhook_delivery_attempts` ledger via `ventus-webhook-delivery-monitor`.
- Scheduled stuck-job monitor Lambda and `StuckPipelineRuns` alarm.
- Six-month CloudWatch log retention for backend Lambda and monitor log groups.
- Aurora cluster CPU, connections, free local storage, replica lag, and volume bytes used.
- AWS Cost Anomaly Detection service monitor.

Still needed before production deployment:

- Final alert subscriptions, such as email, PagerDuty, or Slack.
- Aurora instance-level availability and failover alarms after the final staging/prod instance inventory is confirmed.
- API key association and per-client quota policy after pilot client onboarding is approved.
- Final production `VENTUS_ALLOWED_ORIGINS` values after approved bank/prototype domains are confirmed.
- DB network-path review for the scheduled stuck-job monitor before staging deploy.
- RDS public exposure remediation: validate or remove the two temporary public `/32` Postgres ingress exceptions and move the public DB instance to private-only access.

## Cost Guardrails

The infra stack defines:

- Cost anomaly monitor: `ventus-service-cost-anomaly-monitor`
- Default anomaly notification threshold: `50` USD absolute impact

Override thresholds during synth/diff/deploy:

```sh
npm run --prefix infra synth -- -c anomalyImpactThresholdUsd=100
```

Email delivery requires `alertEmail` context:

```sh
npm run --prefix infra synth -- -c alertEmail=ops@example.com
```

AWS Budget creation remains a follow-up because the target `us-east-2` CloudFormation registry reports `AWS::Budgets::Budget` as non-provisionable. Until a dedicated billing stack is added, configure a manual monthly AWS Budget in the Billing console.

## Staging Monitor Rollout

The proposed monitor source lives at `backend/monitors/stuck-job-monitor`.

It does the following:

- Reads DB credentials from Secrets Manager.
- Queries `pipeline_runs` for rows older than the configured stuck-job SLA.
- Publishes `Ventus/Pipeline` `StuckPipelineRuns` to CloudWatch.
- Publishes a concise SNS alert when stuck jobs are found.

## Webhook Delivery Monitor

The proposed monitor source lives at `backend/monitors/webhook-delivery-monitor`.

It runs every five minutes and:

- Queries `webhook_delivery_attempts` for failed deliveries in the recent lookback window.
- Publishes `Ventus/Pipeline` `WebhookFailedDeliveries` to CloudWatch.
- Publishes a concise SNS alert with delivery IDs, bank IDs, event types, status codes, attempt counts, and replay linkage when failures are found.

This complements the existing worker log metric filter. The database-backed monitor catches failed deliveries recorded by API-driven test/replay paths as well as worker-dispatched webhooks.

Package and synthesize:

```sh
npm run --prefix infra synth
```

Optional email subscription during synth:

```sh
npm run --prefix infra synth -- -c alertEmail=ops@example.com
```

Staging deploy prerequisites:

- Configure GitHub Actions AWS OIDC using `docs/security/github-aws-oidc-staging.md`.
- Confirm the monitor Lambda can reach Aurora through the approved VPC/security-group path:
  - VPC: `vpc-0d4cf689a4fed7f31`
  - Lambda subnets: `subnet-057aa09eef4545099`, `subnet-00958cfa806e7e363`
  - Database security group: `sg-08836ed15d778ecd6`
- Confirm alert recipients and escalation ownership.
- Confirm the first deployment target is staging, not production.
- Review the synthesized resources before `cdk deploy`.
- Complete `docs/runbooks/cdk-deployment-review-checklist.md`.

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

The repo now defines and deploys the first readiness layer. The next readiness steps are to confirm alert recipients, add CloudWatch log retention, and add Aurora health alarms.
