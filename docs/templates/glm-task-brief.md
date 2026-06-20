# GLM Task Brief Template

Use this template when assigning low-risk repo work to GLM 5.2 or another basic
coding model.

## Task

<!-- One-sentence task name. -->

## Goal

<!-- What business or engineering outcome should this produce? -->

## Scope

Allowed files or directories:

- `backend/scripts/...`
- `backend/fixtures/...`
- `docs/...`

Do not change:

- UI/UX
- demo page content
- API behavior or API contracts
- Lambda deployment config
- AWS infra, IAM, secrets, KMS, billing, or networking
- golden labels or expected outputs unless explicitly requested
- customer-facing enrichment taxonomy

## Requirements

- Requirement 1
- Requirement 2
- Requirement 3

## Acceptance Criteria

- Existing backend tests pass.
- New or changed script runs successfully.
- PR description lists files changed, tests run, and known risks.
- PR is opened but not merged.

## Validation Commands

```bash
npm run --prefix backend test
npm run --prefix backend qa:enrichment
```

Add task-specific commands here:

```bash
# npm run --prefix backend qa:model-output
```

## Output

- Branch name: `glm/<short-task-name>`
- Commit message: `<concise imperative summary>`
- Pull request only; do not merge.

## Known Risks to Check

- Did this alter enrichment behavior?
- Did this alter API response shape?
- Did this touch production secrets or config?
- Did this rewrite expected labels instead of improving reporting?
