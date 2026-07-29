# GLM Task: Plaid Golden Evaluation Reporting

Use GLM 5.2 through OpenRouter for this task only if the local Claude Code
session has been intentionally configured for `z-ai/glm-5.2`.

## Task

Improve non-production Plaid golden evaluation reporting so the team can
understand enrichment performance once sandbox or partner data arrives.

## Scope

Allowed:

- `backend/scripts/qa-*.mjs`
- `backend/scripts/*golden*.mjs`
- `backend/shared/model-evaluations*.mjs`
- non-production fixture/report files under `backend/fixtures` or
  `backend/reports`
- docs that explain how to run the evaluation

Do not change:

- UI/UX or demo page content
- production API behavior or OpenAPI response contracts
- Lambda deployment config
- AWS infra, IAM, secrets, KMS, billing, or networking
- enrichment prompts, model routing behavior, or provider credentials
- golden expected labels unless explicitly requested

## Requirements

- Add or preserve pass/fail reporting by field.
- Add or preserve reporting by rail when rail data exists.
- Add or preserve reporting by source profile when profile data exists.
- Preserve fields for `model_route`, `latency_ms`, and `estimated_cost`.
- Keep failures explainable enough for a human reviewer to decide whether the
  issue is engine behavior, fixture quality, or golden-label mismatch.

## Validation

Run:

```bash
npm run --prefix backend test
npm run --prefix backend qa:enrichment
npm run --prefix backend qa:model-output
```

If a command fails, inspect whether the failure is caused by this change. Do not
rewrite expected labels just to make the report pass.

## Output

- Branch: `glm/plaid-benchmark-reporting`
- PR only; do not merge.
- PR description must include tests run, changed files, known risks, and an
  explicit confirmation that UI, demo data, secrets, AWS infra, and API
  contracts were not changed.
