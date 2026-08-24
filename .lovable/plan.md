# Redesign Automated Flows Governance Card

## Goal
Make the `FlowGovernanceCard` on `/bankdemo` Automated Flows roughly half its current height and visually smarter — denser, more integrated, and less like a stacked report.

## Current state
The card sits above the product list and currently has:
- A header bar with a live pulse, title, and "63 of 76 live" count.
- A 5-stage horizontal rail of large tiles: Products Mapped, Signals Assigned, Marketing Approval, Product Owner Approval, Channels Assigned.
- A dedicated Channels Assigned tile with three sub-cards (Digital banking, Email, SMS) showing reach and status.
- A bottom progress bar showing % of mapped products live.

The card is roughly 280–300 px tall and visually heavy relative to the product rows below it.

## Proposed redesign

### 1. Compress into a single-row "governance rail"
- Replace the four large stage tiles with a compact horizontal status rail.
- Each stage becomes a small tile: icon (16 px), primary number, 2-word label, and a micro status chip.
- Use a subtle connector line / chevron between stages instead of large separators.
- Remove the duplicated detail lines (e.g., "9 active · 67 draft") from the main rail; show them only on hover via a tooltip or small popover.

### 2. Collapse Channels Assigned into an icon-chip cluster
- Replace the three channel sub-cards with one compact "Channels" tile containing three icon chips.
- Each chip shows the channel icon, flow count, and a colored dot for status (green = Live, amber = Capped, slate = Held).
- On hover, reveal the 24h reach and status label in a tooltip.
- Clicking a chip could expand a mini popover with the same detail, if needed.

### 3. Slim header and progress bar
- Keep the header title and live indicator but reduce vertical padding.
- Move the "63 of 76 live" count to the right end of the progress bar row.
- Reduce the progress bar height from `h-1` to a thinner track and use a rounded, muted track.

### 4. Visual polish
- Use a consistent slate/white surface with semantic status colors only on the micro chips and status dots.
- Add a subtle hover state on each stage tile to invite inspection without increasing default height.
- Ensure typography stays crisp at the smaller size (no labels below 10 px).

## Files to change
- `src/components/tepilot/campaigns/FlowGovernanceCard.tsx` — main component redesign.
- `src/components/tepilot/campaigns/data/flowGovernance.ts` — no structural changes expected, but verify channel data supports compact rendering.

## Acceptance criteria
- Card height is visibly reduced (target ~140–160 px, roughly half the current height).
- All five workflow stages and three channels remain readable.
- No information is permanently hidden; details are accessible via hover/click.
- Progress bar and live count remain visible.
- Light-theme policy is preserved; no dark-mode utilities added.

## Notes
- No backend or edge-function changes.
- No changes to `ProductAutomatedFlowsView.tsx` logic beyond swapping the card content.
