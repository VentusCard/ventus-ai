# Plan: Reorder Coworker Capabilities

## Goal
In the **Ventus AI Coworker** dashboard (Coworker Dashboard sub-tab), move the 6 capability tiles above the **Intelligence delivery destinations** slivers within the same capabilities panel.

## Current state
`src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` renders the capabilities panel in this order:
1. Panel header: "Ventus AI Coworker Capabilities"
2. "Intelligence delivery destinations" sub-section + 6 team slivers
3. 6 capability tiles grid (Continuous signal detection, Insight emails, Context memory, etc.)

## Proposed change
Inside the capabilities panel, swap the order so it renders:
1. Panel header: "Ventus AI Coworker Capabilities"
2. 6 capability tiles grid
3. "Intelligence delivery destinations" sub-section + 6 team slivers

## Technical details
- File to edit: `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`
- Move the `CapabilityTile` grid block (lines 86-93) to appear before the Intelligence delivery destinations block (lines 76-85).
- Adjust borders so the grid still visually separates from the slivers below (e.g., move `border-t` to the slivers wrapper or use a divider).
- No data or behavior changes; this is a pure layout reorder.

## Acceptance criteria
- [ ] The 6 capability tiles render before the Intelligence delivery destinations slivers.
- [ ] Visual borders/dividers remain clean and consistent.
- [ ] No runtime errors introduced.