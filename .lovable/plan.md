## Gate `/bank-analytics` with the demo password

Currently `/bank-analytics` is publicly accessible — anyone with the URL bypasses the password screen. This plan extends the existing `SimplePasswordGate` (password `ventus2026`, sessionStorage key `demo_password_access`) to cover it.

### Changes

1. **`src/pages/BankAnalyticsDashboard.tsx`** — Wrap `<AnalyticsContainer />` in `<SimplePasswordGate>`. Reuses the same component, password, and sessionStorage key as `/demo`.

2. **`src/components/ContactFormDialog.tsx`** — Remove `rel="noopener noreferrer"` from the new-tab link to `/bank-analytics`. Browsers only copy `sessionStorage` to a `target="_blank"` tab when the opener relationship is preserved; with `noopener` set, the new tab gets fresh storage and re-prompts for the password. Same-origin, and the dashboard's back button already relies on `window.opener`.

### Result

- Direct URL visit to `/bank-analytics` → password prompt (identical to `/demo`).
- Click "Bank Analytics Dashboard →" from an authenticated `/demo` → opens in a new tab, already unlocked via inherited sessionStorage.
- Back arrow → closes the new tab, original `/demo` state intact.
