# Ventus environment promotion

Ventus uses one source repository and promotes reviewed code through distinct
environments. A Git branch, an Amplify branch, and an AWS backend environment
are related, but they are not the same thing.

## Environment contract

| Stage | Git source | Frontend | Backend and data | Purpose |
| --- | --- | --- | --- | --- |
| Pull request | Feature branch | Amplify PR preview when available | Fixtures or explicitly isolated sandbox services | Review one proposed change |
| Development | `dev` | `https://dev.d1gaewa028qzng.amplifyapp.com` until `dev.ventusai.com` is approved | Development Cognito, Aurora, APIs, Plaid sandbox, and Salesforce FSC sandbox | Shared integration and product testing |
| Staging | `staging` | `https://staging.d1gaewa028qzng.amplifyapp.com` | Protected staging stacks and sanctioned non-production data only | Release-candidate validation |
| Production | `main` | `https://ventusai.com` | Production services and customer data | Customer-facing release |

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

The canonical frontend is Amplify app `d1gaewa028qzng` in `us-east-1`. It owns
`ventusai.com` and connects the GitHub `main`, `staging`, and `dev` branches.
Use `amplify.yml`, enable automatic builds for non-production branches, and do
not copy production secrets into Amplify. Configure only reviewed, non-secret
frontend values such as the development API base URL and Cognito public
identifiers.

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
  first canonical Amplify deployment succeeded on July 28, 2026.
- `staging` is connected to the GitHub `staging` branch and was refreshed
  through pull request #198 on July 28, 2026. Amplify marks it as the `BETA`
  branch and automatic builds are enabled.
- `main` remains the Amplify production branch and was not changed during the
  environment correction.
- The duplicate Amplify app `d1x0mm0pbkpcfs` in `us-east-2` was removed on
  July 28, 2026 after confirming it had no custom domains or unique repository
  dependency.
- The live scoped MCP operator policy targets canonical `dev` and `staging`.
  It can inspect or restart their jobs while `main` remains outside MCP
  deployment authority.
- Keep active PR previews until their reviews close.
- Remove stale PR preview branches, such as `pr-81`, through Amplify after
  confirming the corresponding pull request is closed.
