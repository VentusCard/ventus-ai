# Ventus Documentation

Docs are grouped by purpose. Machine-referenced artifacts (OpenAPI spec, Postman
collection, generated API reference) live under [`api/`](./api/) and are consumed
by backend scripts/CI — keep their paths stable.

**Trust labels** (a doc-accuracy audit was done 2026-08; the codebase has since
had Growth Play, the Console API, decision ledger, intervention planner, and the
evidence-store migrator removed):

- ✅ **Current** — matches the code/infra on `main`.
- 🧭 **Planned** — target/future state, not yet built (banner at top of file).
- ⚠️ **Historical/stale** — describes a retired subsystem; kept for reference,
  banner at top of file.

---

## architecture/
System design and control-plane architecture.
- ✅ [intelligence-control-plane.md](./architecture/intelligence-control-plane.md) — AI/decision governance architecture (enrichment pipeline is real; some control-plane pieces are forward-looking)
- 🧭 [enterprise-product-blueprint.md](./architecture/enterprise-product-blueprint.md) — target-state enterprise blueprint
- 🧭 [enterprise-identity-and-permissions.md](./architecture/enterprise-identity-and-permissions.md) — planned Cognito/RBAC model (auth today is Supabase)
- ⚠️ [enterprise-product-remediation-handoff.md](./architecture/enterprise-product-remediation-handoff.md) — historical handoff (Console API/Decision Package)
- ⚠️ [sol-post-acceptance-decision-record.md](./architecture/sol-post-acceptance-decision-record.md) — historical decision record

## security/
Security, compliance, and identity/secrets operations.
- ✅ [security-procurement-evidence-index.md](./security/security-procurement-evidence-index.md) — control-readiness self-assessment (SOC 2 starting point)
- ✅ [github-aws-oidc-staging.md](./security/github-aws-oidc-staging.md) — CI OIDC (no long-lived keys)
- ✅ [aws-secrets-cutover-runbook.md](./security/aws-secrets-cutover-runbook.md) — secrets migration
- ✅ [aws-mcp-operations.md](./security/aws-mcp-operations.md) — scoped MCP operator access
- ✅ [aws-enterprise-readiness-audit.md](./security/aws-enterprise-readiness-audit.md) — AWS security/compliance gap audit (note: predates backend+IaC landing in-repo)
- 🧭 [aws-identity-migration-runbook.md](./security/aws-identity-migration-runbook.md) — planned Cognito cutover

## runbooks/
Operational deployment, promotion, and observability runbooks.
- ✅ [coworker-email-demo.md](./runbooks/coworker-email-demo.md) — coworker email demo deploy/SES setup
- ✅ [model-gateway-deployment-checklist.md](./runbooks/model-gateway-deployment-checklist.md) — model routing/eval deploy
- ✅ [cdk-deployment-review-checklist.md](./runbooks/cdk-deployment-review-checklist.md) — CDK deploy review
- ✅ [environment-promotion.md](./runbooks/environment-promotion.md) — Amplify/branch promotion (Cognito/release-manifest sections are forward-looking)
- ✅ [observability-readiness.md](./runbooks/observability-readiness.md) — monitors + pipeline SLAs
- ⚠️ [tenant-isolated-persistence-runbook.md](./runbooks/tenant-isolated-persistence-runbook.md) — SQL inventory outdated; direction still valid
- ⚠️ [evidence-store-deployment-runbook.md](./runbooks/evidence-store-deployment-runbook.md) — retired (migrator removed)
- ⚠️ [product-salesforce-fsc-delivery.md](./runbooks/product-salesforce-fsc-delivery.md) — retired Console path; demo FSC only

## api/
API specs and generated references (machine-referenced — stable paths).
- ✅ [openapi-draft.yaml](./api/openapi-draft.yaml) — source of truth for routes/contract checks
- ✅ [api-reference.html](./api/api-reference.html) — generated offline reference
- ✅ [ventus-api.postman_collection.json](./api/ventus-api.postman_collection.json) — generated Postman collection

## integrations/
External systems, connectors, and partner onboarding.
- ✅ [webhook-partner-integration-guide.md](./integrations/webhook-partner-integration-guide.md) — webhook events/payloads (matches `ventus-api`)
- ✅ [live-demo-connectors.md](./integrations/live-demo-connectors.md) — demo connectors stack (frontend session flow is forward-looking)
- ✅ [fsc-enterprise-onboarding.md](./integrations/fsc-enterprise-onboarding.md) — Salesforce FSC demo adapter (product framing is aspirational)
- ⚠️ [bofa-integration-map.md](./integrations/bofa-integration-map.md) — references removed frontend modules
- ⚠️ [connector-session-rollout.md](./integrations/connector-session-rollout.md) — enterprise session model not implemented

## engineering/
Development workflow, QA, testing, and model tooling. (All current.)
- ✅ [backend-qa-harness.md](./engineering/backend-qa-harness.md)
- ✅ [load-testing.md](./engineering/load-testing.md)
- ✅ [model-eval-expansion.md](./engineering/model-eval-expansion.md)
- ✅ [ai-assisted-development-workflow.md](./engineering/ai-assisted-development-workflow.md)
- ✅ [openrouter-glm-claude-code.md](./engineering/openrouter-glm-claude-code.md)
- ✅ [lovable-promotion-workflow.md](./engineering/lovable-promotion-workflow.md) — Amplify source-of-truth (some bank-pilot framing is dated)
- ✅ [linear-setup.md](./engineering/linear-setup.md) — Linear/MCP guidance (`scripts/linear` not in repo)

## pilot/
Pilot measurement and benchmark strategy. (Most pilot-runtime docs were removed
in the 2026-08 cleanup because the pilot/growth-play code was retired.)
- ✅ [plaid-benchmark-data-strategy.md](./pilot/plaid-benchmark-data-strategy.md) — Plaid benchmark data generation
- 🧭 [outcome-measurement-methodology.md](./pilot/outcome-measurement-methodology.md) — methodology (no runtime to implement it yet)

## product/
Product goals and taxonomy.
- ✅ [lifestyle-taxonomy-v3.md](./product/lifestyle-taxonomy-v3.md) — current classifier taxonomy
- ✅ [lifestyle-category-v2.md](./product/lifestyle-category-v2.md) — superseded by v3, but useful context
- 🧭 [product-goal.md](./product/product-goal.md) — product north-star / vision
- ⚠️ [product-goal-evidence-matrix.md](./product/product-goal-evidence-matrix.md) — claims retired subsystems as evidence

## internal/
Internal engineering context and planning.
- 🧭 [repo-organization-north-star.md](./internal/repo-organization-north-star.md) — target two-repo layout (repo is currently a monorepo)

## templates/
Reusable templates.
- [glm-task-brief.md](./templates/glm-task-brief.md)
- [daily-plan.md](./templates/daily-plan.md)

## Other
- [daily-planning.md](./daily-planning.md) — daily planning workflow
- 🧭 [briefing-delivery-foundation.md](./briefing-delivery-foundation.md) — planned briefing delivery
- [evidence/](./evidence/) — historical Aug-2026 release/acceptance artifacts (not current ops evidence)
