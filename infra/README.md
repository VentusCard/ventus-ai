# Ventus Infra

This directory is the AWS CDK home for codifying Ventus infrastructure.

Current posture:

- CDK is chosen because Ventus is AWS-native and the engineering stack is TypeScript-friendly.
- This remains import-first: existing production resources should be imported gradually before CDK owns them.
- The current deployed footprint is limited to additive readiness monitoring resources.

## Current Production Resources To Model

- API Gateway REST API `ventus-api`
- Custom domain `api.ventusai.com`
- Lambda functions under `backend/functions`
- SQS queues and DLQs
- S3 bucket `ventus-te-pilot` and CSV object-created notification
- Aurora PostgreSQL cluster `ventus-bofa-cluster`
- Secrets Manager secret references
- VPC, security groups, subnets, and VPC endpoints
- CloudWatch log retention, metrics, alarms, and dashboards
- Additional budget/anomaly monitoring segmentation as environments split

## Recommended CDK Sequence

1. Add read-only imports and outputs for existing resources.
2. Add monitoring resources that can be deployed safely after review.
3. Add log retention resources.
4. Add API Gateway throttling/WAF resources.
5. Only later consider managing existing core resources through CDK ownership.

## Guardrail

Do not run `cdk deploy` against production until the synthesized change set has been reviewed by engineering leadership.

Use `docs/runbooks/cdk-deployment-review-checklist.md` before any deployment.

## Current Skeleton

The current CDK stack records known production resource names and defines readiness CloudWatch alarms for:

- Lambda errors
- Lambda duration near timeout
- Lambda throttles
- SQS DLQ visible message depth
- SQS oldest message age
- API Gateway 5xx and p95 latency
- API Gateway pilot usage plan with throttle/quota defaults
- webhook delivery failures
- stuck pipeline runs
- six-month CloudWatch log retention for backend Lambda and monitor log groups
- Aurora cluster CPU, connection, local storage, replica lag, and volume growth signals
- service-level AWS Cost Anomaly Detection

The current RDS network exposure baseline is captured in `infra/security/rds-network-exposure-baseline.json` and checked by CI. It documents the existing temporary public `/32` Postgres ingress exceptions and the target posture of private-only database access.

The current secrets boundary baseline is captured in `infra/security/secrets-boundary-baseline.json` and checked by CI. The live Lambda env/IAM cutover to `RDS_SECRET_ID` and `MODEL_PROVIDER_SECRET_ID` was completed on 2026-05-20, the recovered backend package that reads the separated model-provider secret was deployed to the seven backend Lambdas the same day, and the duplicated `GEMINI_API_KEY` was removed from the DB credential secret. Use `docs/security/aws-secrets-cutover-runbook.md` plus `npm run --prefix infra audit:secrets-cutover` to verify live Lambda environment variables, secret contents, and secret metadata.

The rotation/KMS target posture is captured in `infra/security/secrets-rotation-kms-baseline.json` and checked by CI. Use `npm run --prefix infra audit:secrets-rotation-kms` to inspect live rotation metadata, rotation enablement, and customer-managed KMS status without reading secret values. Customer-managed KMS and rotation metadata tags are enabled for the DB and model-provider credential secrets; Secrets Manager rotation remains pending.

The DB credential rotation enablement preflight is captured in `infra/security/db-secret-rotation-preflight.json` and checked by CI. Use `npm run --prefix infra audit:db-rotation-preflight` to verify the live Aurora cluster, DB secret shape, rotation Lambda presence, and AWS PostgreSQL rotation application availability without printing secret values. This is a gate before enabling 30-day Secrets Manager rotation on the production DB credential secret.

The DB rotation Lambda is codified but opt-in only. Default synth and CI do not create it. To review the proposed AWS-managed PostgreSQL single-user rotation Lambda before deployment:

```bash
npm run --prefix infra synth -- -c alertEmail=yusheng_chen@ventusai.com -c enableDbRotationLambda=true
```

The opt-in resource deploys `AWS::Serverless::Application` from AWS's `SecretsManagerRDSPostgreSQLRotationSingleUser` Serverless Application Repository application, names the function `ventus-db-credential-rotation`, places it in the backend Lambda subnet/security-group path, and points it at `alias/ventus/database-secrets`. This resource was deployed through the protected GitHub infra workflow on 2026-05-21. It does not enable the 30-day secret rotation schedule by itself; that remains a separate post-test step.

## Evidence Store / Console API (retired)

The durable decision/outcome evidence store, its migration/verifier Lambda, and the
authenticated Growth Console API (`VentusEvidenceStoreStack`, `VentusConsoleApiStack`)
were retired. The CDK stacks remain in the tree only as empty retirement shells with
no Lambda or DB access. Tenant-scoped audit persistence and an authenticated console
API are tracked as future work, not deployed surfaces.

KMS review artifacts live under `infra/iam/secrets-kms-*.json` and are checked by `npm run --prefix infra check:iam`.

The tracing readiness baseline is captured in `infra/security/tracing-readiness-baseline.json` and checked by CI. API Gateway tracing/access logs and Lambda active tracing were enabled on 2026-05-20. Use `npm run --prefix infra audit:tracing` to verify live API Gateway tracing, API access logs, and Lambda X-Ray mode.

These readiness alarms have been deployed through the protected staging workflow. Review a CDK diff before changing or adding alarms.

## Cost Guardrails

The stack defines one deployable billing control:

- AWS Cost Anomaly Detection monitor `ventus-service-cost-anomaly-monitor`

The default anomaly notification threshold is `50` USD of absolute impact.

Override thresholds during synth/diff/deploy:

```bash
npm run --prefix infra synth -- -c anomalyImpactThresholdUsd=100
```

Email notifications are attached only when `alertEmail` is provided:

```bash
npm run --prefix infra synth -- -c alertEmail=ops@example.com
```

These controls are alert-only. They do not stop services, mutate application resources, or enforce spend shutdowns.

AWS Budget creation is intentionally not in this stack yet because the target `us-east-2` CloudFormation registry reports `AWS::Budgets::Budget` as non-provisionable. Add a dedicated billing-control stack or approved manual budget as the next cost-governance step.

## Stuck-Job Monitor

The stack also defines a scheduled Lambda monitor:

- Source: `backend/monitors/stuck-job-monitor`
- Package output: `backend/dist/monitors/stuck-job-monitor.zip`
- Schedule: every 5 minutes
- Metric: `Ventus/Pipeline` `StuckPipelineRuns`
- Alert destination: SNS topic `ventus-backend-alerts`

Build and synthesize locally:

```bash
npm run --prefix infra synth
```

The synth command packages monitor dependencies before running CDK.

Review an AWS diff after credentials/OIDC are configured:

```bash
npm run --prefix infra diff
```

Pull request CI runs synth only. Deploys require the protected staging workflow.

The staging GitHub workflow lives at `.github/workflows/infra-staging.yml`. Configure the OIDC role and protected environment with `docs/security/github-aws-oidc-staging.md` before enabling it for deploys.

Optional email subscription:

```bash
npm run --prefix infra synth -- -c alertEmail=ops@example.com
```

The monitor uses the same VPC/subnet/security-group path as the existing deployed backend Lambdas:

- VPC: `vpc-0d4cf689a4fed7f31`
- Lambda subnets: `subnet-057aa09eef4545099`, `subnet-00958cfa806e7e363`
- Database security group: `sg-08836ed15d778ecd6`

Before deploying, review the synthesized plan and confirm the database security group self-reference on port `5432` is still present.

CDK may warn that imported subnet route table IDs are not provided. That warning is acceptable for the current monitor because the Lambda only needs subnet IDs/security groups for `VpcConfig`; route table mutation is not part of this stack.
