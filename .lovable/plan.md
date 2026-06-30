## Plan: Filter Activation Downstream Diagram by Team

### Problem
The Systems tab network diagram currently shows all 7 destination nodes (CRM, Rewards Provider, etc.) at all times. When a user clicks a team in the Core card, they want to see only the destinations that team actually activates to, with those remaining nodes vertically centered in the right column.

### Approach

1. **Build a team-to-destinations mapping** from the existing `TEAMS[].workflow[].chips` data. Each team's workflow already references destinations via chips with `kind: "destination"`. We will derive a runtime lookup table so the UI knows which destinations are relevant for each team.

2. **Filter the Destinations column (right side)** in `CapabilitiesView.tsx`:
   - When `activeTeamLabel` is set, render only the `DESTINATIONS` entries whose `label` appears in that team's workflow destination chips.
   - When no team is selected, render all destinations as before.
   - Vertically center the filtered list within the right column using `justify-center` instead of `justify-around`.

3. **Filter the right-side SVG wires** in `NetworkWires`:
   - Accept a new prop: `activeDestinations?: string[]` (labels of the currently relevant destinations).
   - When provided, compute `rightYs` only for the matching destination subset.
   - When empty/null, fall back to all destinations.
   - Keep the left-side wires unchanged since all sources always feed into the core.

4. **Ensure visual consistency**:
   - The destination cards that remain should keep their existing styling (`NodeCard` component).
   - The wire animation timing (`begin` offsets) will re-index based on the filtered count so the stagger still looks smooth.

### Files to edit
- `src/components/tepilot/insights/CapabilitiesView.tsx`

### Verification
- Build passes (`npx tsc --noEmit`).
- Browser: click each team in the Core card and confirm only the relevant destinations appear on the right, centered vertically.
- Click "Analytics & Targeting" → expect CRM and Marketing Automation only.
- Click "Risk & Compliance" → expect Risk Ops only.
- Click a Signal (not a team) → all 7 destinations visible again.