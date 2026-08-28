# Ventus Documentation

Docs are grouped by purpose. Machine-referenced artifacts (OpenAPI spec, Postman collection, generated API reference) live under [`api/`](./api/) and are consumed by backend scripts/CI — keep their paths stable.

## architecture/
System design and control-plane architecture.
- [enterprise-identity-and-permissions.md](./architecture/enterprise-identity-and-permissions.md) — Cognito + Aurora + Growth Play access model
- [intelligence-control-plane.md](./architecture/intelligence-control-plane.md) — AI/decision governance architecture

## security/
Security, compliance, and identity/secrets operations.
- [security-procurement-evidence-index.md](./security/security-procurement-evidence-index.md) — control-readiness self-assessment (SOC 2 starting point)
- [aws-enterprise-readiness-audit.md](./security/aws-enterprise-readiness-audit.md) — AWS security/compliance gap audit
- [github-aws-oidc-staging.md](./security/github-aws-oidc-staging.md) — CI OIDC (no long-lived keys)
- [aws-secrets-cutover-runbook.md](./security/aws-secrets-cutover-runbook.md) — secrets migration
- [aws-identity-migration-runbook.md](./security/aws-identity-migration-runbook.md) — identity migration
- [aws-mcp-operations.md](./security/aws-mcp-operations.md) — scoped MCP operator access

## runbooks/
Operational deployment, promotion, and observability runbooks.
- [cdk-deployment-review-checklist.md](./runbooks/cdk-deployment-review-checklist.md)
- [coworker-email-demo.md](./runbooks/coworker-email-demo.md)
- [environment-promotion.md](./runbooks/environment-promotion.md)
- [evidence-store-deployment-runbook.md](./runbooks/evidence-store-deployment-runbook.md)
- [model-gateway-deployment-checklist.md](./runbooks/model-gateway-deployment-checklist.md)
- [observability-readiness.md](./runbooks/observability-readiness.md)
- [tenant-isolated-persistence-runbook.md](./runbooks/tenant-isolated-persistence-runbook.md)

## api/
API specs and generated references (machine-referenced — stable paths).
- [openapi-draft.yaml](./api/openapi-draft.yaml) — source of truth for routes/contract checks
- [api-reference.html](./api/api-reference.html) — generated offline reference
- [ventus-api.postman_collection.json](./api/ventus-api.postman_collection.json) — generated Postman collection
- [aws-console-api.md](./api/aws-console-api.md) — console API notes

## integrations/
External systems, connectors, and partner onboarding.
- [bofa-integration-map.md](./integrations/bofa-integration-map.md)
- [fsc-enterprise-onboarding.md](./integrations/fsc-enterprise-onboarding.md)
- [webhook-partner-integration-guide.md](./integrations/webhook-partner-integration-guide.md)
- [live-demo-connectors.md](./integrations/live-demo-connectors.md)
- [connector-session-rollout.md](./integrations/connector-session-rollout.md)

## engineering/
Development workflow, QA, testing, and model tooling.
- [ai-assisted-development-workflow.md](./engineering/ai-assisted-development-workflow.md)
- [lovable-promotion-workflow.md](./engineering/lovable-promotion-workflow.md)
- [backend-qa-harness.md](./engineering/backend-qa-harness.md)
- [load-testing.md](./engineering/load-testing.md)
- [linear-setup.md](./engineering/linear-setup.md)
- [openrouter-glm-claude-code.md](./engineering/openrouter-glm-claude-code.md)
- [model-eval-expansion.md](./engineering/model-eval-expansion.md)

## pilot/
Pilot readiness, runtime, measurement, and benchmarks.
- [mvp-pilot-readiness.md](./pilot/mvp-pilot-readiness.md)
- [mvp-evaluation-baseline.md](./pilot/mvp-evaluation-baseline.md)
- [non-prod-pilot-e2e.md](./pilot/non-prod-pilot-e2e.md)
- [pilot-operating-loop.md](./pilot/pilot-operating-loop.md)
- [pilot-outcome-runtime.md](./pilot/pilot-outcome-runtime.md)
- [standalone-pilot-runtime.md](./pilot/standalone-pilot-runtime.md)
- [outcome-measurement-methodology.md](./pilot/outcome-measurement-methodology.md)
- [intervention-benchmark-review.md](./pilot/intervention-benchmark-review.md)
- [connected-expansion-experiment.md](./pilot/connected-expansion-experiment.md)
- [plaid-benchmark-data-strategy.md](./pilot/plaid-benchmark-data-strategy.md)
- [decision-package-integration.md](./pilot/decision-package-integration.md)

## product/
Product goals, growth plays, and taxonomy.
- [product-goal.md](./product/product-goal.md)
- [product-goal-evidence-matrix.md](./product/product-goal-evidence-matrix.md)
- [growth-play-control-plane.md](./product/growth-play-control-plane.md)
- [growth-play-onboarding-contract.md](./product/growth-play-onboarding-contract.md)
- [lifestyle-category-v2.md](./product/lifestyle-category-v2.md)
- [lifestyle-taxonomy-v3.md](./product/lifestyle-taxonomy-v3.md)

## internal/
Internal engineering context and planning.
- [repo-organization-north-star.md](./internal/repo-organization-north-star.md)

## templates/
Reusable templates.
- [glm-task-brief.md](./templates/glm-task-brief.md)
