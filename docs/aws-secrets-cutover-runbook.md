# AWS Secrets Cutover Runbook

This runbook moves Ventus from the temporary combined DB/model-provider secret toward an enterprise-ready boundary where database credentials and model-provider credentials are separate AWS Secrets Manager records.

Do not commit secret values. Do not print secret values into logs, tickets, screenshots, or PRs.

## Target State

- API and ingest Lambdas use `RDS_SECRET_ID`.
- Classification, pillar, lifestyle, risk, and travel Lambdas use both `RDS_SECRET_ID` and `MODEL_PROVIDER_SECRET_ID`.
- `MODEL_PROVIDER_SECRET_ID` points to a dedicated model-provider secret containing `GEMINI_API_KEY`.
- The database credential secret does not contain `GEMINI_API_KEY`.
- Lambda IAM allows `secretsmanager:GetSecretValue` only for the specific secrets each function needs.
- Rotation policy targets:
  - DB credentials: 30 days
  - model-provider credentials: 90 days
- Customer-managed KMS is required for both secret classes before enterprise security review.
- Runtime secret reads use a short cache (`SECRETS_CACHE_TTL_MS`, default 60 seconds) so warm Lambda containers do not hold database credentials indefinitely after a rotation.

## Pre-Checks

Confirm AWS credentials in the same terminal that will run the audit:

```bash
/Users/yushengchen/Library/Python/3.9/bin/aws sts get-caller-identity
```

Run the live audit without reading secret values:

```bash
AWS_CLI=/Users/yushengchen/Library/Python/3.9/bin/aws npm run --prefix infra audit:secrets-cutover
```

Use strict mode when preparing for an enterprise review:

```bash
AWS_CLI=/Users/yushengchen/Library/Python/3.9/bin/aws npm run --prefix infra audit:secrets-cutover -- --strict
```

Check the rotation/KMS posture:

```bash
npm run --prefix infra check:secrets-rotation-kms
AWS_CLI=/Users/yushengchen/Library/Python/3.9/bin/aws npm run --prefix infra audit:secrets-rotation-kms
```

Check whether the DB credential secret is ready for Secrets Manager rotation enablement:

```bash
npm run --prefix infra check:db-rotation-preflight
AWS_CLI=/Users/yushengchen/Library/Python/3.9/bin/aws npm run --prefix infra audit:db-rotation-preflight
```

Use strict mode only after KMS key policies and rotation mechanics have been reviewed:

```bash
AWS_CLI=/Users/yushengchen/Library/Python/3.9/bin/aws npm run --prefix infra audit:secrets-rotation-kms -- --strict
```

## Cutover Sequence

1. Create a dedicated model-provider secret in AWS Secrets Manager.
2. Put only the model-provider key material in that secret, for example `GEMINI_API_KEY`.
3. Set Lambda environment variables:
   - `RDS_SECRET_ID` on all backend Lambdas
   - `MODEL_PROVIDER_SECRET_ID` on model-analysis Lambdas
4. Grant each Lambda role `secretsmanager:GetSecretValue` only for the secret IDs it needs.
5. Deploy the recovered backend package that supports separate secret resolution.
6. Run the live audit and a staging pipeline smoke test.
7. Remove `GEMINI_API_KEY` from the DB credential secret after staging verification.
8. Re-run the live audit in strict mode and attach the output to the security evidence folder.

## Rotation And KMS Sequence

Do not move live secrets to a customer-managed KMS key until the key policy and Lambda role permissions are reviewed together.

Review artifacts:

- `infra/iam/secrets-kms-key-policy-template.json`
- `infra/iam/secrets-kms-deploy-policy-proposal.json`
- `infra/security/secrets-rotation-kms-baseline.json`

1. Create customer-managed KMS keys under `alias/ventus/`, keeping separate key classes for DB credentials and model-provider credentials. Completed aliases: `alias/ventus/database-secrets` and `alias/ventus/model-provider-secrets`.
2. Grant the required Lambda roles `kms:Decrypt` and `kms:DescribeKey` through least-privilege key policy and/or IAM. Completed through the reviewed key policy.
3. Update one non-critical secret first, run health checks, then continue to production credential secrets. Completed for model-provider first, then DB credentials.
4. For DB credentials, run `check:db-rotation-preflight` and `audit:db-rotation-preflight`, deploy the AWS PostgreSQL single-user rotation Lambda in the backend VPC path, manually test one rotation in a maintenance window, and only then enable the 30-day schedule. Pending.
5. For model-provider credentials, rotate by issuing a new provider key, updating `ventus/model-providers/gemini`, running authenticated enrichment smoke, then revoking the old provider key. Pending because provider-side key issuance/revocation is outside AWS.
6. Re-run `audit:secrets-rotation-kms -- --strict` and store the output as enterprise security evidence.

## DB Rotation Enablement Gates

The DB rotation preflight baseline lives at `infra/security/db-secret-rotation-preflight.json`.

Do not enable DB credential rotation until these are true:

1. The AWS `SecretsManagerRDSPostgreSQLRotationSingleUser` rotation app has been reviewed for Aurora PostgreSQL compatibility.
2. The rotation Lambda is deployed in the backend VPC path using subnets `subnet-057aa09eef4545099`, `subnet-00958cfa806e7e363`, and security group `sg-08836ed15d778ecd6`.
3. No public Postgres ingress is added for rotation.
4. The Lambda role can read/update only the DB credential secret and decrypt `alias/ventus/database-secrets`.
5. A manual rotation test passes API health, invalid-key auth, and authenticated enrichment smoke checks.

## DB Rotation Lambda Deployment

The rotation Lambda is codified in CDK but gated behind an explicit context flag. Default CI and default synth do not create it.

Review the proposed Lambda resource:

```bash
npm run --prefix infra synth -- -c alertEmail=yusheng_chen@ventusai.com -c enableDbRotationLambda=true
```

Expected resource:

- Type: `AWS::Serverless::Application`
- Application: `SecretsManagerRDSPostgreSQLRotationSingleUser`
- Function name: `ventus-db-credential-rotation`
- Subnets: `subnet-057aa09eef4545099`, `subnet-00958cfa806e7e363`
- Security group: `sg-08836ed15d778ecd6`
- KMS key: `alias/ventus/database-secrets`

Deployment status:

- Deployed through the protected GitHub infra workflow on 2026-05-21.
- CloudFormation stack `VentusExistingInfraStack` reached `UPDATE_COMPLETE`.
- Nested rotation application stack reached `CREATE_COMPLETE`.
- Lambda `ventus-db-credential-rotation` is `Active` in the expected VPC path.
- The DB credential secret rotation schedule remains disabled.

After deployment, re-run:

```bash
AWS_CLI=/Users/yushengchen/Library/Python/3.9/bin/aws npm run --prefix infra audit:db-rotation-preflight
```

Do not enable the 30-day Secrets Manager rotation schedule until the manual rotation test and rollback checks pass.

For GitHub-driven review/deploy, run the `Infra Staging Diff And Deploy` workflow manually with:

- `action`: `diff` first, then `deploy` only after review
- `alert_email`: `yusheng_chen@ventusai.com`
- `enable_db_rotation_lambda`: `true`
- `confirm_deploy`: `deploy-staging` only for the deploy run

## Rollback

Because the backend keeps the legacy secret fallback in code, the operational rollback is to restore the previous Lambda environment variables and redeploy the previous package. Do not delete the legacy DB credential secret during the cutover window.

## Current Limitation

This repo can verify configuration and package code, but it should not store or generate model-provider secret values. A human operator with approved AWS access must create or rotate the actual secret value.
