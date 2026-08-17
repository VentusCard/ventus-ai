# Automated Flows — place rolling activity feed below header

## Goal
Surface the existing `AutonomousActivityFeed` (rolling Ventus autonomous activity card) at the top of the `/bankdemo` Automated Flows tab, directly below the `TabHeader` and above the category filter chips.

## Current state
- `ProductAutomatedFlowsView.tsx` renders: `TabHeader` → category filters → flow rows.
- `AutonomousActivityFeed.tsx` exists and is mocked, but is not imported or used in `ProductAutomatedFlowsView.tsx`.

## Changes
1. Import `AutonomousActivityFeed` in `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`.
2. Insert `<AutonomousActivityFeed />` as the first child after `TabHeader`, inside the existing `space-y-4` container.
3. Keep the existing category filters, active-count badge, and flow rows unchanged.

## Files
- `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`

## Verification
- Open `/bankdemo` → Automated Flows.
- Confirm the green-dot "Ventus — autonomous activity" rolling card appears directly under the page header.
- Confirm category chips and flow list still render below it.
