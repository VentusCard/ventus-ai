# Growth Console API foundation

`VentusConsoleApiStack` is the non-production server-side authorization boundary for
the Growth Console. It is deployed in the dev environment and is used by the Cognito-authenticated
frontend; bank SSO remains a separate integration step.

The authenticated routes are:

```text
POST /v1/console/access
POST /v1/console/decision-run
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

`decision-run` additionally requires the `growth_console` entitlement and the
scenario-specific `consumer_demo` or `wealth_demo` entitlement. It runs the
model-free deterministic baseline server-side, appends a tokenized decision event
through the non-bypass runtime role, and returns the durable ledger sequence and
event hash. Raw credentials and direct customer identifiers never enter the
browser response or ledger receipt.

## Deliberate limits

- Staging only; no production route or custom domain.
- Dev deployment is live-verified for Cognito authentication, the aggregate executive Results
  boundary, institution-admin Connections, owner configuration without self-approval, the operator
  treatment-review/workflow-delivery path, and reviewer Governance/evidence export. The
  platform-admin identity is
  provisioned and live-verified for Governance, Connections, Results, and the customer-Moments
  boundary.
- The decision route is a deterministic baseline, not a claim of model accuracy or
  production economic lift.
- Activation and measured outcomes remain separate governed operations.
- No self-sign-up or browser-held database credentials.
- No SAML provider until a bank supplies reviewed IdP metadata and claims.
- The staging Cognito identifiers and Aurora endpoint are explicit deployment
  configuration. Move them to cross-stack/configuration references before creating
  another environment.

## Manual access provisioning

The Evidence Store migrator also exposes a private, confirmation-gated
`provision-console-access` operation. It binds an existing Cognito subject to one
institution, role, set of business lines, explicitly assigned work queues, and
set of Console entitlements. The public Console API cannot create or modify these
records. An empty `queueScopes` array is valid for roles without a customer-work
queue, such as an executive viewer.

The private request carries its grant under `access` so the confirmation gate and
the authorization payload are distinct:

```json
{
  "mode": "provision-console-access",
  "confirm": "PROVISION_VENTUS_STAGING_ACCESS",
  "access": {
    "tenantId": "example-bank",
    "displayName": "Example Bank",
    "issuer": "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_example",
    "identitySubject": "verified-cognito-subject",
    "email": "operator@example-bank.com",
    "role": "bank_operator",
    "businessLines": ["consumer-banking"],
    "queueScopes": ["consumer-review"],
    "entitlements": ["growth_console", "consumer_demo"]
  }
}
```
