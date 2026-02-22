

# Add Budgeting Toggle to Customer Lifestyle Dashboard

## Overview
Add a "Budgeting" toggle switch to the "Customer Lifestyle Dashboard" card header. When enabled, each pillar card gets a small round pop-up badge indicating budget status: under budget (green), near limit (amber/yellow), or over budget (red).

## What Changes

### 1. Toggle in the Dashboard Header
- Add a `Switch` toggle labeled "Budgeting" next to the "Customer Lifestyle Dashboard" title in `src/pages/TePilot.tsx`
- Pass the toggle state down to `PillarExplorer` as a new `budgetMode` prop

### 2. Budget Data Generation
- Inside `PillarExplorer`, generate random budget limits per pillar (seeded from pillar name so they stay stable across re-renders)
- Compare each pillar's `totalSpend` against its budget to determine status:
  - **Under budget** (spend < 70% of budget) -- green badge with a checkmark icon
  - **Near limit** (spend between 70%-100% of budget) -- amber badge with an alert-triangle icon
  - **Over budget** (spend > 100% of budget) -- red badge with an arrow-up icon

### 3. Badge Overlay on Pillar Cards
- When `budgetMode` is on, show a small circular badge in the top-right corner of each pillar card
- Badge has the appropriate color and icon
- Optionally show the budget amount below the spend amount (e.g. "Budget: $500")
- No other UX changes -- cards still click to expand, everything else stays the same

## Files Modified

| File | Change |
|---|---|
| `src/pages/TePilot.tsx` | Add `budgetMode` state, add `Switch` toggle in the dashboard header card (~line 917-929), pass prop to `PillarExplorer` |
| `src/components/tepilot/insights/PillarExplorer.tsx` | Accept `budgetMode` prop, generate random budgets per pillar, render colored badge with icon on each card when toggled on, show budget line under spend amount |

## Technical Details

**Budget generation** (in PillarExplorer):
- Use `useMemo` to generate stable budgets from pillar names (simple hash-based seed)
- Budget = totalSpend * random multiplier between 0.7 and 1.5 (so some are over, some under, some near)

**Badge styling**:
- Positioned `absolute` top-right of each card (card gets `relative`)
- ~28px round circle with white background and colored border + icon
- Green: `CheckCircle` icon, Amber: `AlertTriangle` icon, Red: `TrendingUp` icon

**Header toggle** (in TePilot.tsx):
- Uses existing `Switch` component from `@/components/ui/switch`
- Small label "Budgeting" next to the switch
