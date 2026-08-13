# API sub-tab in the Intelligence Dashboard

Add an "API" sub-tab alongside Overview / Customers / Reports / Query / Risk, covering API access and usage — but not credential management, which lives in Settings.

## What the API sub-tab shows

1. **Usage KPI strip** — calls last 30 days, success rate, p95 latency, error rate, quota consumed vs plan limit.
2. **Usage over time** — daily call volume chart with success vs error split, plus a 7/30/90-day range toggle.
3. **Endpoint breakdown** — table of top endpoints: method, path, call count, avg latency, error rate.
4. **Rate limits & quota** — current tier limits (requests/min, monthly quota) with progress bars and a burst/throttle indicator.
5. **Recent activity log** — last ~15 requests: timestamp, endpoint, status code, latency, caller key label (masked, read-only).
6. **Endpoint reference** — compact list of available Ventus API endpoints with one-line descriptions and a copyable curl example.
7. **Webhooks status** — delivery success rate and recent delivery attempts (read-only).

## Credentials handoff

A prominent card at the top-right of the sub-tab: "Manage API keys & access" with a button that navigates to Settings → API Keys. No key creation, rotation, or assignment UI in the dashboard.

## Settings side

Add an "API Keys" sub-tab to the Settings page holding token creation, rotation, revocation, scopes, and assignment. The dashboard link deep-links directly to that sub-tab.

## Technical notes

- New folder `src/components/tepilot/insights/api/` with `ApiAccessView.tsx` plus small section components; mock data in `src/lib/apiUsageData.ts` (deterministic, no backend calls).
- Register `{ value: "api", label: "API", icon: Plug }` in `DASHBOARD_SECTIONS` in `VentusAIDashboardView.tsx`, extend `initialSection` union, and render `<ApiAccessView onOpenSettingsApiKeys={...} />`.
- `AnalyticsContainer.tsx` gains a way to navigate to `settings` with an initial sub-tab; `SettingsContainer.tsx` accepts an `initialTab` prop and adds the `api-keys` tab (`ApiKeysView.tsx`).
- Charts use the existing recharts + shadcn chart patterns; strict light theme, slate-200 borders, Manrope, monospace for keys/paths. No `dark:` utilities.
- Add an `api` entry to `VENTUS_AI_TAB_CONTEXT` in `src/lib/ventusAiTabContext.ts` so Ventus AI knows what's on screen.
