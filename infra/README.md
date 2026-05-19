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
- Budget/anomaly monitoring

## Recommended CDK Sequence

1. Add read-only imports and outputs for existing resources.
2. Add monitoring resources that can be deployed safely after review.
3. Add log retention resources.
4. Add API Gateway throttling/WAF resources.
5. Only later consider managing existing core resources through CDK ownership.

## Guardrail

Do not run `cdk deploy` against production until the synthesized change set has been reviewed by engineering leadership.

Use `docs/cdk-deployment-review-checklist.md` before any deployment.

## Current Skeleton

The current CDK stack records known production resource names and defines readiness CloudWatch alarms for:

- Lambda errors
- Lambda duration near timeout
- Lambda throttles
- SQS DLQ visible message depth
- SQS oldest message age
- API Gateway 5xx and p95 latency
- webhook delivery failures
- stuck pipeline runs

These readiness alarms have been deployed through the protected staging workflow. Review a CDK diff before changing or adding alarms.

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

The staging GitHub workflow lives at `.github/workflows/infra-staging.yml`. Configure the OIDC role and protected environment with `docs/github-aws-oidc-staging.md` before enabling it for deploys.

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
