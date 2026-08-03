# Growth Play control plane

## Purpose

The Growth Play control plane turns a compiled protocol into an explicitly authorized operating
definition. It is separate from connector authorization and from the activation runtime. A
Salesforce, Plaid, legacy, or local-demo credential cannot register or approve a protocol.

## Roles and boundaries

- `protocol_configurator` may register an immutable compiled contract only for an entitled
  business line.
- `business_line_owner` may approve or revoke a registered protocol only for an entitled business
  line.
- Registration and approval require different authenticated subjects. Revocation remains available
  to the business-line owner as a fail-safe action.
- The activation runtime receives registry `SELECT` only. It cannot register or approve a protocol.

Every registry event retains the tenant, subject, short-lived session ID, identity provider,
business line, timestamp, and pilot change record. The protocol digest binds sources, eligibility,
policy, actions, destination, and measurement to the approval.

## API

`POST /api/growth-play-protocols` accepts one of three operations:

- `register`: a compiled Growth Play draft; requires `protocol_configurator`.
- `approve`: protocol ID, business line, change record, and rationale; requires
  `business_line_owner` and a different subject from the registrar.
- `revoke`: the same decision envelope; requires `business_line_owner`.

The endpoint is default-off behind `ENABLE_GROWTH_PLAY_CONTROL_PLANE=true` and requires a signed
`VCP1` control-plane session. It has no legacy bearer or local-browser fallback. The database
credential is read only from `VENTUS_PROTOCOL_ADMIN_DATABASE_URL` on the server.

The repository route is a non-production integration surface. A production deployment should place
the control-plane handler and protocol-admin credential in a separately deployed service or
function boundary; the activation service must not receive that secret even if both services use
the same source repository.

## Identity path

For non-production evaluation, `POST /api/control-plane-session` can mint a short-lived control
session when presented with `VENTUS_CONTROL_PLANE_ISSUER_TOKEN`. This issuer is always disabled in
Vercel production.

The production target is a bank SSO identity broker that validates OIDC/SAML authentication,
derives tenant, subject, role, and business-line entitlements from authoritative claims, and then
mints the same short-lived internal session contract. That bank identity integration, group-to-role
mapping, access review, and deprovisioning evidence are not implemented or claimed by this change.

## Evidence boundary

Unit and API tests prove signature, expiry, tenant, role, business-line, identity-lineage, and
separation-of-duty enforcement. The migration and AWS verifier prove read-only activation-runtime
access and cross-tenant isolation structurally. A live bank IdP login, deployed database, access
review, and named bank-owner approval remain external pilot gates.
