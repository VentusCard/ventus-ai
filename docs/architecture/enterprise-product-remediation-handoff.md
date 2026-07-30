# Enterprise Product Remediation Handoff

Status: Sol architecture pass complete; Terra implementation and Luna
verification remain.

Authority: `docs/architecture/enterprise-product-blueprint.md`

## Sol Decisions

1. The six canonical roles are preserved from Aurora membership through the
   access response and short-lived connector session. They are not compressed
   to `operator | admin`.
2. Customer-level decisions require an active `bank_operator`, the scenario
   entitlement, and the matching business-line scope. UI visibility is not an
   authorization control.
3. Presenter-demo sessions and authenticated product sessions are different
   security purposes.
4. An authenticated Growth Console session cannot call the generic Salesforce
   writer. Product delivery must originate from a server-prepared decision,
   valid human response, durable reservation, and idempotent connector request.
5. Institution administrators may discover and verify connector mappings, but
   do not inherit customer-action permissions.
6. The browser is a projection and interaction surface. It is not the
   authoritative store for Moments, responses, delivery state, or evidence.

## Implemented In This Pass

- Canonical role, status, business-line, and queue scopes now survive the
  Cognito/Aurora compatibility API.
- Both hosted decision paths enforce role, entitlement, and business-line
  authorization.
- Short-lived connector tokens carry a signed purpose, role, and scopes.
- The presenter broker gives authenticated operators only bounded read and
  governed-activation capabilities; administrators receive schema discovery
  only.
- The Vercel-compatible generic Salesforce route rejects authenticated console
  sessions.
- The Growth Console no longer falls back to browser-authored Salesforce
  delivery when no governed server decision exists.
- Negative tests cover executive misuse, cross-business access, role
  preservation, and generic Salesforce bypass.

## Terra Scope

Terra must implement this bounded sequence without changing the decisions
above.

### P0: Membership-aware AWS product connector

The current AWS `ventus-demo-connectors` service is a presentation connector.
Its session broker derives a coarse role from Cognito groups and cannot serve as
the product authorization root.

Build a separate product connector session endpoint or move session issuance
behind the existing Console API so it:

- resolves the Aurora membership server-side;
- requires active status and the exact capability;
- carries canonical role, business-line scopes, queue scopes, tenant, actor,
  environment, and purpose;
- never grants `salesforce_write` to the browser;
- keeps the current presenter connector available only for labeled sandbox
  demonstrations.

Do not infer product permissions from email domains or generic Cognito groups.

### P0: Durable employee journey

Implement the minimum server contracts from Blueprint Section 13:

1. `GET /today`
2. `GET /moments`
3. `GET /moments/{decision_id}`
4. `POST /moments/{decision_id}/responses`
5. `POST /moments/{decision_id}/deliveries`

Each mutation must validate tenant, canonical role, business-line or queue
scope, current state/version, allowed action, actor session, and idempotency
key. Return a durable receipt.

Replace browser-authoritative Moment, response, delivery, and ledger state.
Raw transaction records must not be stored in browser storage.

### P0: Governed Salesforce delivery

Connect the delivery endpoint to the existing reservation and connector
delivery repositories. It must load the server-side Decision Package and
response by ID; the browser may not submit a replacement decision payload.

Keep FSC schema discovery and account verification admin-only. Move the current
customer-linked onboarding write proof behind a dedicated server-prepared proof
contract or remove that write step until the contract exists.

### P1: Product projections

Bind Today, Moments, Results, and Governance to durable APIs. Reuse the existing
Moment Card and Decision Package representation. Do not redesign navigation or
create a second decision engine.

## Luna Scope

Run only after Terra's bounded implementation is complete:

- role-by-role navigation and denied-operation checks;
- Consumer and Merrill business-line isolation checks;
- presenter-demo regression;
- responsive and overflow checks for affected screens;
- copy tightening for new error, empty, loading, and receipt states;
- screenshot comparison for Today, Moment, Salesforce receipt, Results, and
  Governance;
- full automated regression and build verification.

Luna must not change authorization, event ownership, endpoint contracts,
Growth Play behavior, or integration architecture.

## Acceptance Gates

- An `executive_viewer` cannot read or mutate customer Moments.
- An operator scoped to Wealth cannot run or deliver a Consumer decision.
- An institution administrator can test mappings but cannot activate a
  customer action.
- A browser-authored Decision Package cannot reach Salesforce.
- Repeated delivery with the same idempotency key creates no duplicate.
- Sign-out or session expiry invalidates connector capability.
- Presenter-demo behavior remains labeled sandbox behavior and cannot be
  replayed as a product session.
- No raw transaction, canonical Moment, response, or evidence ledger is stored
  in browser storage.
