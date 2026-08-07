Rename /bankdemo "Analytics" nav section to "Intelligence"

## Goal
Update the sidebar navigation in `/bankdemo` so the section currently labeled "Analytics" reads "Intelligence", while keeping the module-gating logic intact.

## Current state
- `src/components/tepilot/insights/AnalyticsContainer.tsx` defines `NAV_GROUPS[1].label = "Analytics"` (line 80).
- `src/types/demo.ts` maps the `Analytics` module key to the sidebar group label `["Analytics"]` (line 12).
- The group contains: Ventus AI Dashboard, Query, Reports.

## Changes
1. In `AnalyticsContainer.tsx`, change `label: "Analytics"` to `label: "Intelligence"` in `NAV_GROUPS`.
2. In `src/types/demo.ts`, update `MODULE_NAV_GROUP_MAP.Analytics` from `["Analytics"]` to `["Intelligence"]` so module-based nav filtering continues to include this group when the Analytics module is enabled.

## Out of scope
- No changes to route names, tab values, page titles, or the `Analytics` module key itself.
- No changes to component names (e.g., `AnalyticsContainer`, `RewardsAnalyticsDashboard`).

## Verification
- Build the project to confirm no TypeScript errors from the label change.
- Open `/bankdemo` and confirm the sidebar section header now reads "Intelligence" and its items (Ventus AI Dashboard, Query, Reports) still render.
