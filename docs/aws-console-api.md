# Growth Console API foundation

`VentusConsoleApiStack` is the non-production server-side authorization boundary for
the Growth Console. It is additive and does not switch the current frontend login.

The first route is:

```text
POST /v1/console/access
Authorization: Bearer <Cognito access token>
```

The Lambda verifies the Cognito issuer, web client, token use, subject, and immutable
tenant claim. It then connects to the existing private Aurora cluster through the
non-bypass `ventus_evidence_app_v1` credential and resolves an active institution
membership under forced row-level security.

The response contains only the authenticated user's institution, role, business
lines, and allowed Console capabilities. Invalid tokens, inactive institutions,
unapproved identity providers, missing memberships, and cross-tenant lookups fail
closed.

## Deliberate limits

- Staging only; no production route or custom domain.
- No frontend auth cutover until a provisioned Cognito user passes end to end.
- No self-sign-up or browser-held database credentials.
- No SAML provider until a bank supplies reviewed IdP metadata and claims.
- The staging Cognito identifiers and Aurora endpoint are explicit deployment
  configuration. Move them to cross-stack/configuration references before creating
  another environment.

## Manual access provisioning

The Evidence Store migrator also exposes a private, confirmation-gated
`provision-console-access` operation. It binds an existing Cognito subject to one
institution, role, set of business lines, and set of Console entitlements. The
public Console API cannot create or modify these records.
