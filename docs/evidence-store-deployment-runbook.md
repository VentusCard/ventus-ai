# Evidence store deployment runbook

This runbook deploys and verifies the durable Ventus decision/outcome evidence store without
opening Aurora to the public internet or changing existing application Lambdas.

## Scope

`VentusEvidenceStoreStack` is separate from `VentusExistingInfraStack` and adds only:

- the retained `ventus/evidence-store/runtime` secret;
- the retained `/aws/lambda/ventus-evidence-store-migrator` log group;
- a least-privilege Lambda execution role and policy;
- the private, manually invoked `ventus-evidence-store-migrator` Lambda.

The Lambda creates the isolated `ventus_evidence` schema only after receiving the exact
confirmation phrase. It has no API route and no schedule.

## Review gates

1. PR checks pass, including backend tests, CDK typecheck, and evidence-stack synth.
2. `cdk diff VentusEvidenceStoreStack` contains additions only.
3. Engineering confirms the target remains Aurora `ventus-bofa-cluster` / `ventus_bofa`.
4. The protected staging environment approves the deploy.
5. No application Lambda receives the runtime secret until migration verification passes.

## Protected deployment

Run the `Infra Staging Diff And Deploy` GitHub workflow first with:

- `action`: `diff`
- `target_stack`: `VentusEvidenceStoreStack`
- `confirm_deploy`: blank

Review the uploaded `cdk-staging-diff` artifact. Then run it again with:

- `action`: `deploy`
- `target_stack`: `VentusEvidenceStoreStack`
- `confirm_deploy`: `deploy-staging`

The deploy creates infrastructure only. It does not alter the database schema.
The first diff is template-only and does not create an empty review stack in CloudFormation.

## Read-only preflight

Invoke status mode before migration:

```bash
aws lambda invoke \
  --region us-east-2 \
  --function-name ventus-evidence-store-migrator \
  --cli-binary-format raw-in-base64-out \
  --payload '{"mode":"status"}' \
  /tmp/ventus-evidence-status.json
cat /tmp/ventus-evidence-status.json
```

Expected before first migration: `mutationPerformed=false`, `exists=false`, and no tables.

## Migration and verification

This is the database mutation gate. Invoke only after the preflight and diff are reviewed:

```bash
aws lambda invoke \
  --region us-east-2 \
  --function-name ventus-evidence-store-migrator \
  --cli-binary-format raw-in-base64-out \
  --payload '{"mode":"migrate-and-verify","confirm":"APPLY_VENTUS_EVIDENCE_SCHEMA"}' \
  /tmp/ventus-evidence-migration.json
cat /tmp/ventus-evidence-migration.json
```

The invocation succeeds only when all seven migrations commit and the generated runtime role:

- is `NOSUPERUSER NOBYPASSRLS`;
- appends a signal → decision → activation → outcome lineage;
- replays the first event without a duplicate write;
- verifies the persisted SHA-256 chain;
- persists and idempotently replays an authorized connected-experiment exposure receipt;
- registers and resolves an approved tenant-scoped Growth Play protocol;
- sees zero tenant-A ledger, protocol, or connected-experiment exposure events while operating under tenant B.

Preserve the invocation JSON and CloudWatch request ID as the deployment evidence. Never
export or print either database secret.

## Failure and rollback

- Migration SQL runs in one transaction; any migration failure rolls back the schema changes.
- Do not connect application traffic after a failed verification.
- The stack may be removed independently, but its secret and log group are retained.
- Do not automatically drop `ventus_evidence`; preserve it for review and remove it only
  through a separately approved database change.

## Promotion gate

After successful verification, update the capability registry from `Infra next` to
`Deployed verified`, then wire the operating-loop runtime to the generated secret. That
application cutover is a separate reviewed change.
