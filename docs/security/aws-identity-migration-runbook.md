# AWS Identity Migration Runbook

> **🧭 PLANNED / NOT YET BUILT (as of 2026-08).** Cognito cutover runbook. Cognito CDK is optional (`enableIdentityFoundation`) and the frontend auth is still Supabase (`VITE_AUTH_PROVIDER=supabase`). Treat as a forward plan, not an executed migration.

## Objective

Move Ventus authentication and application authorization from Supabase to an
AWS-native foundation without interrupting the current employee demo:

- Amazon Cognito for credentials, MFA, password reset, sessions, and future
  enterprise SSO.
- Aurora PostgreSQL for institutions, identity-provider bindings,
  memberships, roles, business-line scope, and product entitlements.
- API Gateway and Lambda for active server-side application functions.
- Secrets Manager for connector and identity-provider secrets.

The code supports a reversible dual run. It does not deploy resources, copy
passwords, or disable Supabase by itself. The active login path changes only
when the frontend and server provider settings are deliberately updated.

## Source Of Truth

| Concern | System of record |
| --- | --- |
| Passwords, MFA, reset, login session | Cognito |
| SAML/OIDC federation | Cognito |
| Institution membership and status | Aurora |
| Role, business-line scope, entitlements | Aurora |
| Growth Play approval and action policy | Aurora decision protocol registry |
| Connector credentials | Secrets Manager |
| Connector session and delivery receipt | Server runtime and decision ledger |

Cognito groups are an administrative convenience. They do not replace the
tenant-scoped Aurora membership check.

## Phase 1: Deploy In Parallel

1. Review the `VentusIdentityStack` CloudFormation diff.
2. Deploy the stack only to the non-production AWS account.
3. Apply the seven Aurora evidence and access migrations as the database owner.
4. Run the verification flow as the generated `NOSUPERUSER NOBYPASSRLS`
   runtime role.
5. Keep `VENTUS_AUTH_PROVIDER=supabase`.

The stack is invite-only, retained on stack deletion, protected from deletion,
and configured for email login, TOTP MFA, short access tokens, token
revocation, and authorization-code OAuth.

## Phase 2: Pilot User Validation

Invite a small set of Ventus employees and test:

1. First login and temporary-password replacement.
2. Email recovery and password reset.
3. TOTP enrollment and recovery behavior.
4. Token expiry, refresh, revocation, and sign-out.
5. Active membership resolution for the correct institution.
6. Rejection of missing, suspended, revoked, or cross-tenant memberships.
7. Role, business-line, and entitlement enforcement.
8. Plaid read and Salesforce write only through scoped server sessions.
9. Decision and connector receipts include the authenticated subject and
   tenant.

Do not store or migrate password hashes. For the small pilot population, issue
new Cognito invitations. If the population later warrants a just-in-time user
migration Lambda, review and approve it as a separate change.

## Phase 3: Application Dual Run

The application includes a Cognito adapter behind explicit provider settings:

```text
VITE_AUTH_PROVIDER=supabase     browser uses the rollback adapter
VENTUS_AUTH_PROVIDER=supabase   server verifies Supabase sessions

VITE_AUTH_PROVIDER=cognito      browser uses Cognito authorization code + PKCE
VENTUS_AUTH_PROVIDER=cognito    server verifies Cognito access tokens
```

Never run the browser and server on different providers. A mismatch fails
closed and appears to the operator as an authenticated session without Console
access.

### Cognito environment

Set these public identifiers in the protected Amplify branch:

```text
VITE_AUTH_PROVIDER=cognito
VITE_COGNITO_AUTHORITY=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>
VITE_COGNITO_CLIENT_ID=<web-client-id>
VITE_COGNITO_DOMAIN=https://<prefix>.auth.<region>.amazoncognito.com
VITE_CONSOLE_API_BASE_URL=https://<reviewed-console-api-origin>
```

Set these only in the server runtime:

```text
VENTUS_AUTH_PROVIDER=cognito
COGNITO_ISSUER=https://cognito-idp.<region>.amazonaws.com/<user-pool-id>
COGNITO_CLIENT_ID=<web-client-id>
DATABASE_URL=<runtime-role-connection>
PGSSL=require
```

`VITE_CONSOLE_API_BASE_URL` exists because Amplify currently hosts a static
frontend. It must point to the reviewed AWS API deployment that serves the
Console endpoints; relative `/api` calls remain the local-development default.
Do not switch the hosted branch until this API route is live and its CORS
allowlist contains only the intended dev origin.

The Cognito path must:

- validate issuer, audience, signature, expiry, and token use server-side;
- derive identity from the verified token, never from request parameters;
- treat the signed `tenant_id` claim only as a routing hint;
- resolve an active Aurora membership before returning application access;
- set transaction-local tenant context before every tenant-scoped query;
- fail closed when membership, tenant, role, or entitlement is absent;
- keep connector credentials and refresh tokens out of the browser.

Use a dedicated non-production hostname or allowlisted internal cohort during
dual run. Do not expose a public provider toggle.

### Dev activation sequence

1. Synthesize and review `VentusIdentityStack`; confirm the existing user pool
   is not replaced.
2. Deploy the identity stack to non-production.
3. Apply `institution-access.sql` and verify tenant isolation as the runtime
   role.
4. Create one institution, its Cognito provider binding, and one active pilot
   membership as the database owner.
5. Invite the pilot user with the immutable Cognito `tenant_id` attribute. The
   attribute must be present when the user is created; it cannot be added later.
   For a Cognito-native pilot invite, use `AdminCreateUser` with both the work
   email and `custom:tenant_id` in `UserAttributes`, for example:

   ```bash
   aws cognito-idp admin-create-user \
     --region us-east-2 \
     --user-pool-id <user-pool-id> \
     --username operator@example-bank.com \
     --user-attributes \
       Name=email,Value=operator@example-bank.com \
       Name=email_verified,Value=true \
       Name=custom:tenant_id,Value=example-bank \
     --desired-delivery-mediums EMAIL
   ```
6. Configure the AWS Console API with the server variables above.
7. Configure the Amplify `dev` branch with the frontend variables above and
   redeploy it.
8. Verify login, callback, membership resolution, entitlement denial, logout,
   and one scoped connector action.
9. Promote the same reviewed settings to staging only after the dev evidence is
   retained.

## Phase 4: Institution SSO

When a bank supplies its identity-provider metadata:

1. Configure its SAML or OIDC provider in Cognito.
2. Map only stable identity claims: subject, verified work email, and the
   institution-controlled tenant claim required to route the session.
3. Create the institution identity-provider record and memberships in Aurora.
4. Test bank-initiated and Ventus-initiated login, logout, token expiry, group
   changes, suspended users, and deprovisioning.
5. Add SCIM only when the institution requires automated joiner/mover/leaver
   lifecycle management.

Bank IdP groups may propose a Ventus role, but Aurora remains authoritative.
This prevents an upstream claim change from silently widening product access.

## Cutover Gates

Switch the application to Cognito only when all gates pass:

- Login, reset, MFA, refresh, revocation, and logout are verified.
- Every pilot user has exactly one intended active institution membership.
- Missing and cross-tenant membership tests fail closed.
- Role and entitlement tests cover all pilot personas.
- Live connector sessions remain user-, tenant-, scope-, and time-bound.
- Aurora migrations and hash-chain verification pass in non-production.
- CloudWatch logs and alarms exist for login and authorization failures.
- A rollback owner and communication path are named.

## Rollback

If a cutover gate fails:

1. Set both `VITE_AUTH_PROVIDER` and `VENTUS_AUTH_PROVIDER` back to `supabase`.
2. Keep Cognito and Aurora records intact for diagnosis.
3. Revoke affected Cognito sessions if necessary.
4. Do not remove or rewrite decision-ledger evidence.

Supabase remains active until the Cognito path has completed the agreed
stability window. Retirement is a separate, reviewed change.

## Supabase Retirement

After the stability window:

1. Inventory calls to Supabase Auth, database tables, storage, and Edge
   Functions from production routes.
2. Migrate only active functions to API Gateway and Lambda.
3. Export required business records and audit evidence.
4. Archive legacy consumer tables and unused Lovable-era functions rather than
   recreating them in Aurora.
5. Remove Supabase environment variables and SDK usage from active bundles.
6. Disable Supabase access only after backups, restore validation, and final
   production traffic verification.

## Evidence To Retain

- CDK synth and reviewed CloudFormation diff.
- Cognito and SSO configuration record with no secret values.
- Aurora migration and tenant-isolation verification output.
- Persona authorization test results.
- Login, denial, connector, decision, and delivery receipts.
- Cutover approval, rollback result, and Supabase retirement record.
