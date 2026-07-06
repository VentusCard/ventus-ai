## Plan: Always Show "Digital Banking App" in Destinations When Any Team Is Selected

### Problem
Currently, the right-hand "Activation Destinations" column filters to only show destinations that the selected team explicitly lists in its workflow chips. Only **Deals & Rewards** references "Digital Banking App", so clicking **Product & Growth** or **Wealth & Relationship** hides it.

### Change
Modify the destination filtering logic so that "Digital Banking App" is **always** included in the visible destinations list whenever **any** team is active (i.e., `activeTeamLabel` is set).

### Implementation
1. Update `getTeamDestinations` in `src/components/tepilot/insights/CapabilitiesView.tsx` to append `"Digital Banking App"` to the returned set for every team.
2. Alternatively, append it directly in the `visibleDestinations` derivation — whichever is cleaner and matches existing patterns.

### Verification
- Click **Product & Growth** → "Digital Banking App" appears in the right column.
- Click **Wealth & Relationship** → "Digital Banking App" appears in the right column.
- Click **Deals & Rewards** → "Digital Banking App" still appears (no regression).
- Click a signal (not a team) → destinations revert to showing all 6 (no regression).
