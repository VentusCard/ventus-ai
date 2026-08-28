# Evidence store deployment runbook

> **⚠️ RETIRED (as of 2026-08).** The `ventus-evidence-store-migrator` Lambda described here no longer exists; `VentusEvidenceStoreStack` is now a retirement shell with no migrator or DB access. This runbook is kept for historical reference only.

This runbook deploys and verifies the durable Ventus decision/outcome evidence store without
opening Aurora to the public internet or changing existing application Lambdas.

## Scope

`VentusEvidenceStoreStack` is separate from `VentusExistingInfraStack` and adds only:

- the retained `ventus/evidence-store/runtime` secret;
- the retained `/aws/lambda/ventus-evidence-store-migrator` log group;
- a least-privilege Lambda execution role and policy;
- the private, manually invoked `ventus-evidence-store-migrator` Lambda.

## Current release status · 2026-08-01

`VentusEvidenceStoreStack` is deployed in `us-east-2` with CloudFormation status
`UPDATE_COMPLETE`. The generated non-bypass runtime credential and migrator are present. The
database migration, forced-RLS isolation probe, backup/restore check, and durable application
cutover still need a recorded non-production receipt, so the evidence store is **deployed,
awaiting final verification**, not yet “durably verified.” The AWS MCP role is intentionally
blocked from reading secret values.

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

The scoped AWS MCP role may invoke only this exact private Lambda. Ask Codex to
run status mode after the current `infra/iam/ventus-mcp-operator-policy.json`
has been attached to `VentusMcpOperatorRole`; no database URL is required.

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

Codex can perform this invocation through AWS MCP after the user explicitly
approves the migration. The Lambda resolves both Secrets Manager values inside
AWS and never returns either credential.

```bash
aws lambda invoke \
  --region us-east-2 \
  --function-name ventus-evidence-store-migrator \
  --cli-binary-format raw-in-base64-out \
  --payload '{"mode":"migrate-and-verify","confirm":"APPLY_VENTUS_EVIDENCE_SCHEMA"}' \
  /tmp/ventus-evidence-migration.json
cat /tmp/ventus-evidence-migration.json
```

The invocation succeeds only when all 12 migrations commit and the generated runtime role:

- is `NOSUPERUSER NOBYPASSRLS`;
- appends a signal → decision → activation → outcome lineage;
- replays the first event without a duplicate write;
- verifies the persisted SHA-256 chain;
- persists and idempotently replays an authorized connected-experiment exposure receipt;
- registers and resolves an approved tenant-scoped Growth Play protocol;
- sees zero tenant-A ledger, protocol, or connected-experiment exposure events while operating under tenant B.

The response is itself an acceptance record. It includes the 12 migration SHA-256 digests,
the deployed schema inventory, the Lambda request ID, the non-bypass runtime role, cross-tenant
denial checks, append-only and idempotency checks, separation-of-duties checks, and the full
verified ledger head hash. It never returns database or connector credentials.

Backup restore evidence and the Console API runtime-secret cutover remain explicit operational
gates. They are not inferred from a successful migration run.

Preserve the invocation JSON as the deployment evidence. Never
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
