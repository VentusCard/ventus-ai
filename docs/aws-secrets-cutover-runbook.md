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

1. Create customer-managed KMS keys under `alias/ventus/`, keeping separate key classes for DB credentials and model-provider credentials.
2. Grant the required Lambda roles `kms:Decrypt` and `kms:DescribeKey` through least-privilege key policy and/or IAM.
3. Update one non-critical secret first, run health checks, then continue to production credential secrets.
4. For DB credentials, use a reviewed Secrets Manager RDS rotation path and test rollback before enabling 30-day rotation.
5. For model-provider credentials, rotate by issuing a new provider key, updating `ventus/model-providers/gemini`, running authenticated enrichment smoke, then revoking the old provider key.
6. Re-run `audit:secrets-rotation-kms -- --strict` and store the output as enterprise security evidence.

## Rollback

Because the backend keeps the legacy secret fallback in code, the operational rollback is to restore the previous Lambda environment variables and redeploy the previous package. Do not delete the legacy DB credential secret during the cutover window.

## Current Limitation

This repo can verify configuration and package code, but it should not store or generate model-provider secret values. A human operator with approved AWS access must create or rotate the actual secret value.
