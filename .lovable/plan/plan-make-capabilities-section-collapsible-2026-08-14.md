# Plan: Make Capabilities Section Collapsible

## Goal
In the **Ventus AI Coworker** dashboard, make the 6 capability tiles collapsible/expandable while keeping the **Intelligence delivery destinations** slivers permanently visible.

## Current state
`src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` renders the capabilities panel as:
1. Panel header: "Ventus AI Coworker Capabilities"
2. 6 capability tiles grid (always visible)
3. "Intelligence delivery destinations" sub-section + 6 team slivers (always visible)

## Proposed change
Add a collapsible wrapper around the capability tiles grid:
- Add a `useState` boolean `capabilitiesExpanded` (default: `true`).
- Add a toggle control to the panel header (chevron + "Capabilities" label).
- When expanded, show the 6 capability tiles.
- When collapsed, hide the tiles and show only a compact summary line (e.g., "6 capabilities · click to expand").
- The **Intelligence delivery destinations** section remains permanently expanded below, unaffected by the toggle.

## Technical details
- File to edit: `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`
- Imports to add: `useState` from React, `ChevronDown` and `ChevronUp` from `lucide-react`.
- Add state inside `CoworkerInboxView`.
- Wrap the capability tiles grid in a conditional render block.
- Keep the existing panel header and Intelligence delivery destinations block unchanged except for adding the toggle button.

## Acceptance criteria
- [ ] The 6 capability tiles can be collapsed and expanded via a header toggle.
- [ ] The Intelligence delivery destinations slivers remain always visible.
- [ ] Default state is expanded.
- [ ] No runtime errors introduced.