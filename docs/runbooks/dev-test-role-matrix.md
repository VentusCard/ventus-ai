# Dev Test Identity And Role Matrix

Last verified: 2026-08-01

This runbook tracks non-production Growth Console identities. It must never
contain passwords, temporary passwords, reset links, MFA seeds, access tokens,
or connector credentials. Cognito owns authentication; Aurora owns the
tenant-scoped role, business-line scope, queue scope, and entitlements.

## Active Test Identities

| Sign-in email | Role | Scope | Primary test use | Verification |
| --- | --- | --- | --- | --- |
| `yusheng@ventusai.com` | `institution_admin` | Ventus tenant | Connections, connector mappings, and institution health | Live UI verified on 2026-08-01: Connections/readiness visible; `/app/moments` redirected to Connections |
| `rojchen98@gmail.com` | `growth_play_owner` | Consumer Banking pilot | Growth Play configuration, operating status, and owner briefings | Live UI verified on 2026-08-01: Growth Plays editable/registerable; no Approve action; `/app/connections` redirected to Today |
| `rojchen98+operator@gmail.com` | `bank_operator` | Consumer Banking; `consumer-deposit-primacy` queue | Review a treatment Moment and deliver its approved FSC action | Live UI verified on 2026-08-01: assigned treatment Moment reviewed; action entered `activated`; Results showed the workflow receipt. FSC outcome remains pending reconciliation |
| `rojchen98+reviewer@gmail.com` | `risk_reviewer` | Ventus pilot | Governance review and evidence-bundle export | Live UI verified on 2026-08-01: Governance visible; bank-review export invoked without client errors; Results showed treatment/holdout separation and protected holdout counts |
| `rojchen98+executive@gmail.com` | `executive_viewer` | Ventus tenant | Aggregate Results and outcome coverage without customer-level access | Live UI verified on 2026-08-01: aggregate Results only; `/app/moments` redirected to Results |
| `rojchen98+platformadmin@gmail.com` | `ventus_platform_admin` | Ventus tenant; Consumer Banking and Wealth | Platform governance, Connections, and cross-institution operating health | Live UI verified on 2026-08-01: Governance, Connections, and Results accessible; `/app/moments` redirected to Governance |
| `yusheng@ventuscard.com` | Unresolved legacy test mapping | Ventus tenant | Do not use for role-specific acceptance tests | Previously exposed a customer queue but produced inconsistent response permissions; reconcile before reuse |

The `ventus_platform_admin` identity is provisioned and live-verified. The six-role acceptance
matrix is live-verified for the current non-production release.

## Current acceptance boundary

- **Live verified:** Cognito password login; executive aggregate Results; institution-admin
  Connections/readiness; Growth Play owner configuration without self-approval; bank-operator
  treatment review and workflow delivery; platform-admin Governance, Connections, and Results;
  risk-reviewer Governance and evidence export; treatment/holdout separation with holdout
  protected from Moments, activations, and workflow records; customer-level Moments denied for both
  tested administrative roles.
- **Automated authorization coverage:** all six role destinations and route boundaries, including
  the platform-admin role, are covered by `npm run test:connector-sessions`.
- **Not claimed:** bank SSO, production access review, or economic lift from the sandbox experiment.

## Test Sequence

1. Use `rojchen98+operator@gmail.com` to run the Consumer Banking treatment
   review and FSC delivery test.
2. Use `rojchen98+reviewer@gmail.com` to inspect Governance, export the evidence bundle, and
   confirm holdout protection in Results.
3. Use `rojchen98@gmail.com` to validate Growth Play owner controls and the
   owner-level Results projection.
4. Use `yusheng@ventusai.com` to validate Connections and institution-health
   views.
5. Use `rojchen98+executive@gmail.com` to validate aggregate Results and confirm
   that customer-level Moments remain unavailable.
6. Use `rojchen98+platformadmin@gmail.com` for the platform-admin path; it is already live-verified
   in the current release.

## Maintenance Rules

- Update this file whenever a staging membership is created, changed,
  suspended, or removed.
- Record only verified role and scope metadata; label inferred mappings as
  unverified.
- Prefer a separate plus-address for each test persona. Do not overwrite an
  existing persona merely to complete another role's test.
- After changing a membership, sign out and sign back in before acceptance
  testing so the UI and API are checked from a fresh session.
- Production and bank-issued SSO identities must be documented in the bank's
  controlled access register, not in this development runbook.
