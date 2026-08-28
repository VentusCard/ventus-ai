# Enterprise Product Remediation Handoff

> **📜 HISTORICAL (as of 2026-08).** A point-in-time handoff for Decision Package v1.2 / Console API / FSC delivery. The code slices referenced (`console-api.mjs`, `ventus-console-api`) have been removed. Read as history, not current state.

Status: Sol architecture pass and the Terra durable-journey and product
Salesforce-delivery slices are complete. Luna verification remains.

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
7. Decision Package v1.2 is an immutable qualification-time decision. Mutable
   response, delivery, and outcome state remains in append-only receipts and
   rebuildable projections.
8. Growth Play Studio uses the six-step Outcome, Moment, Action, Controls,
   Proof, and Review flow. AI drafts typed fields but never creates executable
   policy directly.
9. One primary metric and intent-to-treat comparison govern each protocol.
   Sandbox defaults cannot create business claims; sanctioned pilots freeze a
   power-informed analysis plan before assignment.
10. The first bank onboarding is one tenant, business line, play, source,
    destination, and outcome return through six ordered gates. Cross-business
    data is not required.
11. Model promotion is Skill- and task-specific. The deterministic baseline
    remains active through offline benchmark and sanctioned-data shadow review.
12. Primary P&L outcomes come from the institution's economic system of record
    or a certified, reconciled outcome view. Salesforce/FSC and Coworker
    channels return operating observations unless explicitly certified for the
    registered economic metric.

## Next Terra Work Packages

Implement these as separate, non-overlapping slices in this order:

1. **Decision Package v1.2:** add the immutable package fields, digest,
   compatibility writer, receipt-aware projection, and v1.1 compatibility
   tests. Do not migrate existing v1.1 protocols in place.
2. **Growth Play Studio:** implement the six-step structured draft and live
   readiness projection. Support save, readiness, registration, review, and
   approval as separate commands. Keep one destination and one primary outcome
   per MVP play.
3. **Results contract:** bind result states and the registered
   intent-to-treat calculation to durable assignment/outcome records. Keep
   operating metrics separate from the primary P&L outcome.
4. **Onboarding gates:** project institution, identity, evidence, workflow,
   outcome, and play readiness into Connections, Growth Plays, and Governance.
   Do not build a separate onboarding product.
5. **Skill shadow registry:** persist the frozen benchmark reference,
   candidate artifact, three-run evaluation, sanctioned shadow evidence,
   approvals, fallback, cost, latency, and promotion state.
6. **Authoritative outcome adapter:** implement the approved outcome envelope
   for one Consumer Deposit Primacy source first. Resolve tenant, experiment,
   arm, decision, and protocol from durable Ventus records; accept no
   caller-authored lineage. Enforce source/version/event/metric/window,
   explicit-zero, correction, freshness, and treatment/holdout parity before
   appending an observation. Keep FSC workflow observations separate.

Each package requires its own API/schema tests and Luna verification before the
next package changes the same product surface.

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
- Today and Moments are now server-loaded projections. A browser can submit a
  bounded employee response, but it cannot replace a Decision Package or mark
  a downstream delivery as complete.
- Responses are append-only ledger events. Delivery reservations are
  server-derived from the approved decision and action, so retries and
  double-clicks cannot create a second delivery.
- The Console API and CDK surface now include `GET /today`, `GET /moments`,
  `GET /moments/{decision_id}`, `POST /responses`, and `POST /deliveries`.
  The `enterprise-console-journey.sql` migration is part of `db:migrate`.
- A first delivery reservation is now brokered by the authenticated Console
  Lambda, which loads the durable Decision Package and human response,
  performs the server-only Salesforce/FSC call, and writes a terminal delivery
  receipt back to the same evidence trail.
- Product Salesforce credentials use a distinct `ventus/staging/product-connectors`
  secret readable only by the Console Lambda. Presenter credentials remain in
  the separate demo secret. The browser receives neither secret nor a
  Salesforce write token.
- Successful delivery projects bounded Decision Receipt, referral, and Task
  links into the Moment. Configuration failures preserve the approved action
  and report a truthful failed delivery; ambiguous network/API failures remain
  pending for reconciliation rather than being incorrectly marked failed.

## Terra Scope

Terra must implement this bounded sequence without changing the decisions
above.

### P0: Membership-aware AWS product connector

Completed for the product Salesforce path. The existing authenticated Console
API resolves the Aurora membership, enforces canonical role, business-line
scope, and entitlement, then brokers delivery without granting a browser a
Salesforce capability. The presenter connector remains a separately scoped
sandbox service.

Before a non-demo institution deployment, replace the optional non-production
default Account mapping with a governed native customer-identity resolution
contract. Do not accept Account, Contact, or relationship IDs from the browser.

### P0: Durable employee journey

Completed in the first Terra slice. The remaining delivery execution work is
intentionally separated below: the Console records a reservation only until a
membership-aware connector completes it with an external receipt.

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

Completed for the Salesforce/FSC vertical slice. The Console Lambda owns the
external call and terminal receipt; it does not use the presenter connector.
The remaining operational step is to deploy the stack and populate the new
product-only secret with a sandbox connected-app credential.

Before enabling the connector, verify that the Console Lambda private subnets
have an approved egress path to Salesforce. This is a deployment gate, not an
assumption. The current operator role did not have permission to inspect those
route tables during implementation.

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
- Salesforce/FSC credentials are readable only by the product Lambda and are
  different from presentation credentials.
- A terminal Salesforce receipt is linked to the Moment; an ambiguous upstream
  failure remains pending for reconciliation.
- Presenter-demo behavior remains labeled sandbox behavior and cannot be
  replayed as a product session.
- No raw transaction, canonical Moment, response, or evidence ledger is stored
  in browser storage.
