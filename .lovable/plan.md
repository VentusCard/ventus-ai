## Problem
In the `/bankdemo` System tab, the **Teams · who we serve** column inside the core panel only renders 3 compact buttons. Because the left Signals column has 5 items and the inner grid stretches vertically, the Teams column leaves unused whitespace at the bottom.

## Fix
Update `src/components/tepilot/insights/CapabilitiesView.tsx` so the 3 team buttons in the core panel distribute vertically to fill the available height:

1. Change the team-items wrapper from `grid grid-cols-1 gap-1.5` to `flex flex-col gap-2 flex-1`.
2. Add `flex-1` to each team button so the 3 items stretch evenly.
3. Keep all existing styling (colors, borders, hover, active states) and click behavior intact.

## Out of scope
- No changes to the detail panel below the network canvas.
- No changes to the Signals column, Sources, or Destinations.
- No changes to the `TEAMS` data array.

## Verification
- Compile check (`tsc --noEmit`).
- Visual confirmation that the 3 team buttons now span the full height of the core panel.