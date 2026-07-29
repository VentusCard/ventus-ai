# Ventus environment promotion

Ventus uses one source repository and promotes reviewed code through distinct
environments. A Git branch, an Amplify branch, and an AWS backend environment
are related, but they are not the same thing.

## Environment contract

| Stage | Git source | Frontend | Backend and data | Purpose |
| --- | --- | --- | --- | --- |
| Pull request | Feature branch | Amplify PR preview when available | Fixtures or explicitly isolated sandbox services | Review one proposed change |
| Development | `dev` | `https://dev.d1x0mm0pbkpcfs.amplifyapp.com` until `dev.ventusai.com` is approved | Development Cognito, Aurora, APIs, Plaid sandbox, and Salesforce FSC sandbox | Shared integration and product testing |
| Staging | `staging` | `https://staging.d1x0mm0pbkpcfs.amplifyapp.com` | Protected staging stacks and sanctioned non-production data only | Release-candidate validation |
| Production | `main` | `https://main.d1x0mm0pbkpcfs.amplifyapp.com` and approved production domains | Production services and customer data | Customer-facing release |

`main` is the Amplify production branch today. Do not use a PR preview as the
shared development environment, and do not treat the existing `staging`
frontend as current until it has been deliberately promoted from `dev`.

## Promotion flow

1. Build on a feature branch and open a pull request.
2. Review CI and, where available, the PR preview.
3. Merge approved product work into `dev`.
4. Verify the shared development frontend, identity, API, database, Plaid
   sandbox, and Salesforce FSC sandbox together.
5. Promote the exact reviewed commit from `dev` to `staging`.
6. Run the staging smoke test and collect deployment evidence.
7. Promote the same commit to `main` only after release-owner approval.

Production is never the place to discover environment-specific failures.

## One-time Amplify setup

An Amplify administrator must connect the existing GitHub `dev` branch to app
`d1x0mm0pbkpcfs`. Use `amplify.yml`, enable automatic builds, and do not copy
production secrets into Amplify. Configure only reviewed, non-secret frontend
values such as the development API base URL and Cognito public identifiers.

The GitHub `dev` branch is currently an ancestor of `main`, with no unique
commits. Fast-forward it to the approved baseline before the first shared
development deployment.

Keep `main` marked as the production branch. Do not point the production
Ventus domain at `dev` or `staging`.

## Backend deployment

Infrastructure changes use `.github/workflows/infra-staging.yml`:

- `diff` is the default and creates a review artifact.
- `deploy` requires the exact `deploy-staging` confirmation and approval from
  the protected GitHub `staging` environment.
- `VentusIdentityStack`, `VentusEvidenceStoreStack`, and
  `VentusDemoConnectorsStack` are isolated non-production stacks.

The identity stack establishes Cognito and the AWS-side institution membership
foundation. It does not switch the application away from its current login by
itself; the application adapter and cutover remain separate reviewed changes.

## Environment acceptance checks

Development is usable only when:

- the deployed commit is visible in the build record;
- public routes load without authentication;
- protected application routes require the development identity provider;
- tenant and role claims are enforced server-side;
- Plaid uses sandbox data and Salesforce uses an FSC sandbox;
- the audit ledger is durable and tenant-isolated;
- no production credentials or customer data are present.

Staging additionally requires a reviewed CDK diff, smoke-test evidence, and the
same application commit intended for production.

## Current state

- `dev` is connected to the GitHub `dev` branch with automatic builds. Its
  first Amplify build succeeded on July 28, 2026.
- `staging` is connected to the GitHub `staging` branch, but its deployed
  release dates to February 20, 2026. Refresh it only through the promotion
  flow above.
- `main` remains the Amplify production branch and was not changed during the
  environment correction.
- The scoped MCP operator policy is attached to the live role and can inspect
  or restart `dev` and `staging` jobs without access to `main` or secret values.
- Keep active PR previews until their reviews close.
- Remove stale PR preview branches, such as `pr-81`, through Amplify after
  confirming the corresponding pull request is closed.
- Reconcile the diverged GitHub `dev` and `main` histories through reviewed
  pull request #195; do not overwrite either branch.
