# Plan: Add Settings, Billing & Team Mockup Tabs to /bankdemo

Add three new non-functional mockup views to the bank demo sidebar, replacing the current toast-only "Settings & Integrations" footer link.

## Changes

### 1. New view components (mockups only, no real logic)
Create under `src/components/tepilot/insights/`:

- **`SettingsView.tsx`** — General preferences mockup:
  - Bank profile card (name, logo placeholder, timezone, region)
  - Notifications panel (email/in-app toggles for alerts, weekly digest, anomaly notifications) using existing `Switch`
  - Integrations grid (Plaid-style placeholders: Core Banking, CRM, Email/SMS, Data Warehouse) with "Connected"/"Connect" badges
  - Security section (SSO/SAML toggle, MFA enforcement, session timeout select)
  - Uses existing `TabHeader`, `Card`, `Switch`, `Button`, `Input`, `Select`

- **`BillingView.tsx`** — Subscription & invoices mockup:
  - Current plan card ("Enterprise — $X/mo", renewal date, "Manage Plan" button)
  - Usage meters (Active customers, Transactions enriched, AI generations) with progress bars
  - Payment method card (mock Visa ending 4242, billing contact)
  - Invoice history table (last 6 mock invoices: date, amount, status badge, Download link)
  - Add-on modules list reusing pricing catalog naming

- **`TeamView.tsx`** — Team & permissions mockup:
  - Header with "Invite member" button (opens a non-functional dialog stub or just disabled)
  - Members table: avatar (initials), name, email, role badge (Owner/Admin/Analyst/Viewer), last active, kebab menu
  - Roles & permissions panel: 4 role rows with permission checkboxes (View analytics, Manage deals, Edit settings, Manage billing, Invite users) — checked state per role
  - Pending invitations section (2 mock entries)
  - 6–8 mock members with realistic banker names

### 2. Wire into `AnalyticsContainer.tsx`
- Extend `TabValue` union with `'settings' | 'billing' | 'team'`
- Add a new `"Admin"` nav group at bottom of `NAV_GROUPS` with the three items (icons: `Settings`, `CreditCard`, `Users`)
- Always include `"Admin"` in `allowedLabels` so it shows regardless of enabled modules
- Add three cases to `renderContent()` switch
- Remove the bottom-left "Settings & Integrations" toast button (now redundant); keep "Feedback & Ideas"

## Style
Strict light theme, Manrope, slate borders, matches existing tab look — reuses `TabHeader`, `Card`, `Table`, `Badge`, `Switch`, `Button`. No new dependencies. No backend wiring.

## Out of scope
No real persistence, no working invite/payment flows, no route changes.
