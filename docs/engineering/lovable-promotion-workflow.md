# Lovable Promotion Workflow

This workflow lets Ventus keep using Lovable for fast prototypes while making staging and production enterprise-governed.

## Principle

Lovable can remain a prototype and demo accelerator. GitHub, CI, and AWS/IaC should be the source of truth for staging and production.

## Environments

### Prototype

Purpose:

- Fast UI exploration
- Demo flows
- Customer discovery
- Mocked or low-risk experiments

Allowed:

- Lovable-generated UI
- Mock data
- Feature spikes
- Non-production endpoints

Not allowed:

- Production secrets
- Bank data
- Direct production deploys
- Unreviewed auth changes
- Unreviewed backend business logic

### Staging

Purpose:

- Candidate release validation
- API contract testing
- QA datasets
- Bank-pilot rehearsal

Requirements:

- Code is merged through GitHub PR
- Build and lint pass
- API calls match `docs/api/openapi-draft.yaml` or the current approved OpenAPI spec
- No mock data in production-path flows
- Staging AWS resources are separate from production where feasible
- Logs, errors, and job status are observable

### Production

Purpose:

- Bank-facing pilot and client usage

Requirements:

- Reviewed GitHub merge
- Release notes
- Rollback plan
- Secrets managed in AWS Secrets Manager or equivalent
- Infrastructure changes reviewed through IaC
- Monitoring and alarms active
- API docs and onboarding docs updated

## Promotion Sequence

1. Build prototype in Lovable.
2. Export or sync code into a GitHub branch.
3. Open a PR labeled `lovable-candidate`.
4. Run automated checks:
   - build
   - lint
   - tests
   - secret scan
   - dependency scan
   - API contract check
5. Review manually:
   - auth behavior
   - data handling
   - mock data removal
   - accessibility and responsiveness
   - API compatibility
6. Deploy to staging.
7. Run smoke tests against staging backend.
8. Promote to production only after owner approval.

## PR Checklist

- [ ] No secrets committed.
- [ ] No `.env` values committed.
- [ ] No direct calls to mock-only APIs in production paths.
- [ ] No unauthenticated backend function added.
- [ ] All new API calls are documented.
- [ ] UI states handle loading, empty, error, and success states.
- [ ] Any schema change is reflected in OpenAPI.
- [ ] Any bank-facing text has been reviewed.
- [ ] Production deploy path is GitHub/CI based, not direct Lovable publish.

## Automation To Add

- Secret scanning with GitHub secret scanning or Gitleaks.
- TypeScript build and lint on every PR.
- OpenAPI diff check for API changes.
- Dependency vulnerability scan.
- Preview deployment for prototype branches.
- Staging deployment for approved candidate branches.
- Production deployment only from protected branches/tags.

## Policy Statement

Lovable is approved for rapid prototyping. Lovable is not approved as an uncontrolled production deployment path. Production software must be versioned, reviewed, tested, observable, and traceable to GitHub and AWS/IaC state.

