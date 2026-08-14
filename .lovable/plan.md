# Restack Intelligence Delivery Destinations as Vertical Slivers

## Goal
Convert the "Intelligence delivery destinations" grid inside the Ventus AI Coworker Capabilities panel into a vertically stacked list where each banking team is a single compact horizontal sliver card.

## Current state
In `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`, the destinations render as a responsive 3-column grid (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3`) with each `TeamDestinationCard` as a tall content-rich card.

## Proposed change
1. Replace the grid container with a vertical flex/stack layout (`flex flex-col gap-2`).
2. Redesign `TeamDestinationCard` as a horizontal sliver:
   - Left accent bar.
   - Team name and email type on one line.
   - Weekly count and trend inline.
   - Collapse the two stat boxes and insight bullets into a single secondary line or hide them behind an expand/collapse affordance.
   - Keep the live delivery indicator compact.
3. Keep the capability tiles below unchanged.

## Files to modify
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx` (layout + card component).

## Out of scope
- No changes to `coworkerInboxData.ts` data model.
- No changes to KPI cards, status strip, or capability tiles.
