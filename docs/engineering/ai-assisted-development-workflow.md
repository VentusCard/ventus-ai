# AI-Assisted Development Workflow

This document defines how Ventus AI should use lower-cost coding models and
higher-reasoning models without weakening production discipline.

## Operating Model

- `glm/...` branches are for low-risk implementation tasks handled by GLM 5.2
  or an equivalent basic coding model.
- `codex/...` branches are for higher-reasoning work, architecture, review,
  backend readiness, security, infrastructure, and release judgment.
- Zoheb remains the merge and production owner unless the team explicitly
  changes that process.

## Model Responsibilities

GLM 5.2 or similar basic coding models may handle:

- focused backend script updates
- fixture and test additions
- documentation and runbook updates
- OpenAPI and Postman generation updates
- small mapping or normalization changes that follow existing patterns
- non-production benchmark reporting improvements

Higher-reasoning models should own:

- multi-LLM enrichment architecture
- model-routing decisions
- golden-test strategy and acceptance thresholds
- AWS, secrets, security, compliance, and SOC 2 readiness judgment
- PR review for model-generated code
- production deployment recommendations
- any change that can affect customer-facing enrichment behavior

## Hard Boundaries for Basic Coding Models

Basic coding models should not independently change:

- UI/UX or demo page behavior
- production Lambda deployment configuration
- AWS IAM, secrets, credentials, KMS, networking, or billing controls
- customer-facing taxonomy definitions
- enrichment engine behavior without an explicit brief
- golden labels or expected outputs without human/high-reasoning review
- API contracts, authentication, or webhook semantics

## Branch and PR Rules

Use these branch prefixes:

- `glm/<short-task-name>` for basic coding model tasks
- `codex/<short-task-name>` for high-reasoning model tasks
- `hotfix/<short-task-name>` only for urgent human-approved fixes

Every AI-generated PR must include:

- model used
- task brief link or pasted task brief
- files changed
- tests run
- explicit confirmation that UI, demo data, secrets, AWS infra, and API
  contracts were not changed unless intended
- known risks and follow-up work

## Recommended Workflow

1. Higher-reasoning model writes the task brief and acceptance criteria.
2. GLM 5.2 executes only the scoped implementation task on a `glm/...` branch.
3. GLM opens a PR and does not merge it.
4. Higher-reasoning model reviews the diff, test output, and risk surface.
5. Zoheb reviews/merges when the PR is ready.
6. Higher-reasoning model handles live QA, benchmark interpretation, and team
   summary after deployment.

## First Good GLM Task

Task: Improve Plaid golden evaluation reporting.

Scope:

- only backend evaluation/reporting scripts and related non-production fixtures
- no UI changes
- no API behavior changes
- no Lambda config changes
- no enrichment behavior changes
- no golden-label rewrites

Acceptance:

- report includes pass/fail breakdown by field
- report includes failure breakdown by rail
- report includes failure breakdown by source profile
- report reserves fields for `model_route`, `latency_ms`, and `estimated_cost`
- existing backend tests pass
- PR is opened but not merged

## API Requirement

This workflow does not require a GLM API key to exist in the repo. The repo can
use the branch, task brief, and PR-review process immediately.

Actual automated GLM coding does require one of the following:

- an OpenRouter API key exposed only in the local developer environment, using
  model slug `z-ai/glm-5.2`
- a GLM/Zhipu API key exposed only in the local developer environment or CI
  secret store
- a trusted CLI or agent wrapper configured locally
- a hosted coding-agent platform with repository access

Do not commit model API keys, Plaid secrets, AWS credentials, or provider keys
to the repository.

For the current recommended Claude Code setup, see
[`docs/engineering/openrouter-glm-claude-code.md`](./openrouter-glm-claude-code.md).
