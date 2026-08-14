# Re-rank Risk Sub-tab in Intelligence Database

## Goal
Move the **Risk** sub-tab so it appears immediately after **Customers** within the Intelligence Database page.

## Current state
In `src/components/tepilot/insights/VentusAIDashboardView.tsx`, the `DASHBOARD_SECTIONS` array defines the sub-tab order as:

```text
Overview → Customers → Reports → Query → Risk → API
```

## Proposed change
Update `DASHBOARD_SECTIONS` in `VentusAIDashboardView.tsx` to:

```text
Overview → Customers → Risk → Reports → Query → API
```

Also update the `initialSection` prop type union to list the sections in the new order for consistency.

## Files to change
- `src/components/tepilot/insights/VentusAIDashboardView.tsx`

## Validation
- Type-check the project after the reorder.
- Verify in the preview that the Intelligence Database sub-tabs read: Overview, Customers, Risk, Reports, Query, API.
