# Ventus AI Claude Code Guardrails

This repository can be used with GLM 5.2 through OpenRouter for focused,
low-risk development tasks. Treat GLM as an implementation assistant, not as
the final reviewer for enterprise readiness, enrichment correctness, security,
or production deployment decisions.

## Default Scope for GLM Tasks

Allowed without an explicit higher-reasoning review:

- backend evaluation scripts
- backend QA/reporting utilities
- fixtures used for non-production testing
- docs, runbooks, task briefs, and PR templates
- small refactors that only follow established local patterns

Require explicit human or higher-reasoning review before changing:

- UI/UX, demo page behavior, or demo copy
- production API behavior or response contracts
- customer-facing enrichment taxonomy
- enrichment prompts, routing policy, or model fallback behavior
- golden labels or expected outputs
- AWS infra, IAM, secrets, KMS, billing, networking, or Lambda deployment config
- Plaid, AWS, OpenRouter, Gemini, or other provider credentials

## Branch and PR Discipline

- Use `glm/<short-task-name>` for GLM-assisted implementation work.
- Open a PR; do not merge.
- Zoheb remains the production merge/deployment owner unless the team changes
  that process.
- PRs must list model/tool used, files changed, tests run, scope boundaries,
  and known risks.

## Validation Commands

Run the smallest relevant set for the change:

```bash
npm run --prefix backend test
npm run --prefix backend qa:enrichment
npm run --prefix backend qa:model-output
```

If a command cannot run locally, state why in the PR.

## Secret Handling

Never read, print, copy, or commit secrets from `.env`, `.env.*`, shell history,
AWS credential files, Plaid credentials, model provider keys, or deployment
logs. Keep local API keys in environment variables only.
