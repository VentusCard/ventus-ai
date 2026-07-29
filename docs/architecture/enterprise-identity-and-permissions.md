# Enterprise Identity And Permissions

Ventus keeps three controls separate:

1. **Amazon Cognito authenticates the person.** It owns credentials, password
   reset, MFA, session tokens, and future SAML/OIDC federation.
2. **Aurora authorizes the person.** An `institution_memberships` record binds a
   verified identity subject to one institution, role, business-line scope, and
   explicit entitlements. A valid token without an active membership receives
   no product access.
3. **Growth Play policy governs the action.** Product access does not by itself
   permit an AI recommendation or connector write. The play must be approved,
   policy checks must pass, and the destination must return a receipt.

Connector authorization remains separate from all three. Ventus mints a
short-lived, user- and tenant-bound connector session with explicit scopes such
as `plaid_read` and `salesforce_write`; partner credentials remain server-side.

## Current Transition

The existing Supabase email login remains active for the internal
bank-employee walkthrough while the AWS path is validated in parallel. This is
a temporary compatibility layer, not the target identity architecture.

- Confirmed `@ventusai.com` identities continue to use the existing demo.
- The Cognito user pool is invite-only for the pilot; public self-signup is
  disabled.
- Cognito groups provide coarse identity administration. Aurora membership is
  the application authorization source of truth.
- The signed Cognito `tenant_id` attribute is a routing hint used to establish
  database tenant context. Aurora must still confirm an active membership for
  the token subject before granting access.
- The application runtime can read a tenant-scoped membership but cannot create
  or modify memberships.
- Passwords, MFA factors, IdP secrets, and partner OAuth grants are never stored
  in Aurora.

## Pilot Roles

| Role | Primary responsibility |
| --- | --- |
| `ventus_platform_admin` | Operate the Ventus platform across institutions |
| `institution_admin` | Provision and suspend institution access |
| `growth_play_owner` | Configure and approve Growth Plays |
| `bank_operator` | Review and act on qualified moments |
| `risk_reviewer` | Review policy, model, and audit evidence |

Business-line access and product entitlements are explicit membership
attributes, not inferred from email domains or browser-editable profile data.

## Enterprise Direction

- Federate Cognito with each institution's SAML or OIDC identity provider.
- Add SCIM or a controlled administrator workflow only when a pilot requires
  lifecycle automation.
- Keep memberships, permissions, connector grants, policy roles, and audit
  evidence in tenant-isolated Aurora tables.
- Record the identity subject, authorization decision, connector scope, action
  approval, and downstream receipt in the durable decision ledger.
- Replace active Supabase Edge Functions with API Gateway and Lambda
  incrementally; archive unused prototype functions instead of recreating them.

Authentication answers **who are you?** Aurora permissioning answers **what may
you see and do?** Growth Play policy answers **what may Ventus recommend or
activate?**
