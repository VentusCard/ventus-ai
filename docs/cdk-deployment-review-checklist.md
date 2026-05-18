# CDK Deployment Review Checklist

Use this checklist before any Ventus CDK deployment. The default posture is synth/diff only; deployment should be explicit, reviewed, and staging-first.

## Target Safety

- Confirm the AWS account ID is `373633008995` only if that is the intended target.
- Confirm the region is `us-east-2`.
- Confirm the deployment target is staging before production.
- Confirm no Lovable-generated code is bypassing GitHub review.
- Confirm `cdk synth` has been reviewed before any `cdk deploy`.

## Change Review

- Review the synthesized CloudFormation resources.
- Confirm there are no replacements of existing API Gateway, Lambda, Aurora, SQS, S3, VPC, subnet, or security group resources.
- Confirm monitor resources are additive:
  - SNS topic `ventus-backend-alerts`
  - CloudWatch alarms and metric filters
  - Lambda `ventus-stuck-job-monitor`
  - EventBridge schedule `ventus-stuck-job-monitor-every-5-minutes`
- Confirm alarm thresholds match `backend/config/pipeline-slas.json`.
- Confirm alert recipients are correct and escalation ownership is assigned.

## IAM Review

- Confirm the stuck-job monitor can only read the intended Secrets Manager secret.
- Confirm `cloudwatch:PutMetricData` is scoped to `Ventus/Pipeline`.
- Confirm SNS publish is scoped to the alert topic.
- Confirm no broad write access to core production infrastructure is introduced.

## Network Review

- Confirm the monitor Lambda uses VPC `vpc-0d4cf689a4fed7f31`.
- Confirm it uses the same Lambda subnets as the existing backend Lambdas:
  - `subnet-057aa09eef4545099`
  - `subnet-00958cfa806e7e363`
- Confirm it uses security group `sg-08836ed15d778ecd6`.
- Confirm the security group self-reference on port `5432` remains in place.
- Confirm no new public database ingress is added.

## Rollback

- Confirm rollback owner and communication channel.
- Confirm deleting or disabling the EventBridge rule stops monitor invocations.
- Confirm alarm actions can be disabled by removing SNS alarm actions or unsubscribing recipients.
- Confirm no data-plane enrichment behavior changes are included in the deployment.

## Commands

Review-only:

```sh
npm run --prefix infra check
npm run --prefix infra synth
```

AWS diff, after credentials or GitHub OIDC are configured:

```sh
npm run --prefix infra diff
```

GitHub Actions staging diff/deploy setup:

- Configure `AWS_STAGING_DEPLOY_ROLE_ARN` as a repository variable.
- Configure a protected `staging` GitHub environment.
- Use `.github/workflows/infra-staging.yml` for reviewed diff and manual deploy.
- Follow `docs/github-aws-oidc-staging.md` for the AWS role trust policy.

Optional email subscription at synth time:

```sh
npm run --prefix infra synth -- -c alertEmail=ops@example.com
```

Do not run `cdk deploy` until this checklist is complete.
