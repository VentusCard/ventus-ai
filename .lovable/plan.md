# Plan: Expand Coworker Capabilities Card Permanently

## Goal
Remove the collapsible container around the "Ventus AI Coworker Capabilities" section in the AI Coworker dashboard so its contents are always visible directly on the page.

## Current state
In `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`, the capabilities section is wrapped in a rounded card with a toggle button. The user must click the header to expand it and see:
- Intelligence delivery destinations (stacked slivers)
- Generic capability tiles (signal detection, insight emails, etc.)

## Changes
1. Remove the collapsible wrapper and its toggle state (`capabilitiesOpen`).
2. Keep the section heading "Ventus AI Coworker Capabilities" as a static page header.
3. Render the intelligence delivery destinations slivers and capability tiles grid permanently below the KPI cards.
4. Preserve existing styling, data, and sub-components (`KpiCard`, `TeamDestinationSliver`, `CapabilityTile`).
5. Leave the status header strip and footer disclaimer unchanged.

## Files to modify
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`

## Verification
- Open `/bankdemo` → AI Coworker tab.
- Confirm the capabilities content is visible without clicking.
- Confirm no layout regressions in KPI cards, slivers, or capability tiles.
