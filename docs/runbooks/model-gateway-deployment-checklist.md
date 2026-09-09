# Model Gateway Deployment Checklist

Use this checklist for PR #151 and future model-routing changes. The default posture is review, merge, deploy, smoke test, then enable shadow execution later.

## Review Before Merge

- Confirm `backend/config/model-routing.json` still routes production tasks to the current Gemini model unless a separate model-change review explicitly approves otherwise.
- Confirm shadow routes are marked `shadow_only: true`.
- Confirm `backend/shared/platform/model-gateway.mjs` does not log prompts, transaction contents, tool outputs, or model response content.
- Confirm `backend/sql/model-evaluation-runs.sql` is reviewed before it is applied to Aurora.
- Confirm `npm run --prefix backend check:model-gateway` and `npm run --prefix backend test` pass.

## Deploy Order

1. Merge PR #151 after review.
2. Package backend Lambdas from the merged commit.
3. Deploy these model-calling Lambdas together:
   - `ventus-classify-transactions`
   - `ventus-analyze-lifestyle-signals`
   - `ventus-risk-detection`
   - `ventus-travel-detection`
4. Do not apply `backend/sql/model-evaluation-runs.sql` unless shadow evaluation persistence is being enabled.
5. If applying SQL, apply it once, verify the table exists, and keep the SQL output with the deployment notes.

## Post-Deploy Smoke

- Run the normal API smoke:

```bash
VENTUS_API_KEY=... npm run --prefix backend smoke:api
```

- Run a safe live pipeline QA only when write testing is explicitly approved:

```bash
VENTUS_API_KEY=... \
VENTUS_LIVE_QA_ENABLE_WRITE=true \
npm run --prefix backend qa:live
```

- Confirm the four worker Lambda log groups show `[MODEL_GATEWAY_AUDIT]` entries after processing.
- Confirm no audit log line includes raw prompts, transaction payloads, tool arguments, or model response text.
- Confirm `GET /v1/jobs/{batch_id}` reaches `complete` for the smoke batch.
- Confirm no new messages are visible in downstream DLQs.

## Rollback

- Redeploy the last known-good Lambda packages for the four model-calling workers.
- If `model_evaluation_runs` SQL was applied, leave the table in place unless a rollback owner explicitly approves removal; it is additive and not read by production paths.
- Disable model gateway audit logs with `MODEL_GATEWAY_AUDIT_LOGS=false` only if log volume or policy requires it.
- Preserve CloudWatch logs and the failing batch ID before retrying.

## Next Gate

Do not enable real shadow execution until:

- PR #151 is deployed and smoke-tested.
- `model_evaluation_runs` exists in the target database.
- A reviewer approves which model route to shadow first.
- Cost and retention expectations for evaluation records are agreed.
