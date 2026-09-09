# Briefing delivery foundation

> **🧭 PLANNED / NOT YET BUILT (as of 2026-08).** Describes Growth Console briefings and Outlook/Slack delivery over "governed Growth Play decisions." Growth Play was removed and briefing delivery is not implemented. Treat as a design proposal.

Ventus Briefings are a delivery view over existing governed Growth Play decisions.
They do not enrich transactions, select actions, or create a second decision engine.

## Current behavior

- The Growth Console renders role-specific briefings from qualified Moments.
- Each briefing item opens the exact underlying Moment for human review.
- Console delivery is available without another connector.
- Outlook and Slack are represented as administrator-configured destinations, not as
  live integrations. Teams remains available in the portable backend contract for
  institutions that use it.
- The shared connector receipt contract supports at-most-once delivery for console,
  Outlook, Slack, and Teams routes.

## Activation sequence

1. A bank administrator approves the channel, destination, data fields, and retention.
2. Enterprise identity maps users and groups to briefing roles.
3. For Outlook, the institution creates the Microsoft Entra application and grants
   the minimum Graph permissions required for the chosen route. Slack uses a separate
   institution-approved Slack app.
4. Connector credentials are stored in AWS Secrets Manager and read only by the
   delivery runtime.
5. A non-production test produces a durable delivery receipt and verifies that no
   raw transaction data or direct customer PII leaves the approved boundary.
6. Operators confirm retry, revocation, audit export, and incident procedures before
   enabling scheduled delivery.

## Measurement

The briefing carries the decision identifiers it summarizes. A user who selects a
briefing item is routed to that exact Moment, preserving the path from briefing to
human response, workflow activation, and eventual outcome. Production measurement
must persist those engagement events server-side before reporting briefing-to-action
conversion.

## Secrets still required for live delivery

- Microsoft tenant and application identifiers
- A client credential or approved workload-identity configuration
- Institution-approved Outlook, Slack, or Teams destination identifiers

These values are not required to build, test, or review the delivery contract.
