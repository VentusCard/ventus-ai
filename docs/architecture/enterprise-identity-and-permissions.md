# Enterprise Identity And Permissions

Ventus separates identity from authorization and connector access:

1. **Identity** confirms who the user is. The MVP uses Supabase email
   verification. Institution pilots should move to SAML or OIDC SSO without
   changing product authorization.
2. **Organization membership** binds the identity to one institution and
   tenant. A verified account without a provisioned membership remains
   `pending`.
3. **Product entitlements** determine which Ventus surfaces the user can open:
   `consumer_demo`, `wealth_demo`, `growth_console`, and `live_connectors`.
4. **Connector authorization** is separate from product access. Ventus mints a
   short-lived, user- and tenant-bound session with explicit scopes such as
   `plaid_read` and `salesforce_write`; partner secrets stay server-side.
5. **Action policy** determines what the user and AI may do after data access is
   granted. A connector write still requires an approved Growth Play, policy
   checks, destination, and receipt.

## MVP Provisioning

- Confirmed `@ventusai.com` identities are internal presenters and receive both
  demo paths, the operator console, and sandbox connector access.
- Other self-registered identities receive no product entitlements and land in
  an access-pending state.
- Pilot users are provisioned through trusted `app_metadata` with a tenant,
  organization, status, role, and explicit entitlements. Browser-editable user
  metadata is never used for authorization.

Example trusted metadata:

```json
{
  "tenant_id": "bofa",
  "organization_id": "bofa",
  "console_access_status": "active",
  "console_role": "operator",
  "console_entitlements": ["wealth_demo", "growth_console"]
}
```

## Enterprise Target

- Replace email/password with the institution's SAML or OIDC identity provider.
- Provision memberships and groups through SCIM or an administrator workflow.
- Store organization memberships, data permissions, connector grants, and
  policy roles in durable tables protected by row-level security.
- Keep third-party OAuth grants in a server-side vault, scoped per tenant and
  connector. Never send refresh tokens or partner secrets to the browser.
- Map institution groups to product roles such as executive, operator, policy
  owner, integration administrator, and auditor.
- Record identity, authorization decision, connector scope, action approval,
  and downstream receipt in the durable decision ledger.

Authentication answers **who are you?** Permissioning answers **what may you
see and do?** Growth Play policy answers **what may Ventus recommend or
activate?** These remain separate controls.
