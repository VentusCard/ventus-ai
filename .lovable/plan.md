# Redesign FlowGovernanceCard — uniform-height stage tiles

## Problem
The Channels tile in the Automated Flows governance card is visibly taller than the four upstream stage tiles. Its vertical list of three channels (each with a label, flow count, status dot, and 24h reach line) forces the entire rail to stretch, leaving empty whitespace in Products / Signals / Marketing / Owner tiles and making the card feel unbalanced.

## Goal
Redesign the Channels tile so all five workflow stages share the same compact height, while still communicating that Channels is the execution surface and keeping channel-level detail discoverable.

## Proposed direction

### 1. Compress Channels into a single-row cluster
Replace the three stacked channel rows with three compact horizontal channel chips inside the same tile:

```text
[Smartphone] Digital    41  ●    [Mail] Email    58  ●    [MessageSquare] SMS    17  ●
```

Each chip contains:
- Channel icon (small, slate/blue tinted)
- Short label (truncated if needed)
- Bold flow count
- Status dot (green for Live, amber for Capped, slate for Held)

The chips sit in one row within the tile's detail area, matching the vertical footprint of a standard stage tile (header row + value row + one detail row).

### 2. Preserve reach/status via hover tooltip
The 24h reach numbers and full status labels are valuable but too dense for the compact tile. Move them into a hover tooltip on each channel chip so the tile stays scannable but detail is one hover away.

### 3. Standardize tile spacing
Apply the same internal padding and row rhythm to ChannelTile and StageTile:
- Header row: icon + label + state chip
- Value row: large tabular number + "stage N" label
- Detail row: one line of content

No tile should use multi-line lists that exceed this rhythm.

### 4. Keep the surrounding card intact
- Full-width `flex items-stretch divide-x` rail remains.
- Header, live pulse, progress bar, and "X of Y products live" summary stay as-is.
- Light theme only; no `dark:` utilities.

## Files to change
- `src/components/tepilot/campaigns/FlowGovernanceCard.tsx` — refactor `ChannelTile`, reintroduce tooltips, align tile spacing.
- `src/components/tepilot/campaigns/data/flowGovernance.ts` — optional: add a short display label for each channel if full labels are too long for the compact chips.

## Acceptance criteria
- All five stage tiles render at the same height in the full-width rail.
- The card's overall height is reduced compared to the current version (target under ~160px total).
- Channel flow counts and status dots are visible at a glance.
- Channel reach and full status remain accessible via hover tooltip.
- No content is clipped or hidden without a tooltip path.
- Build passes and light-theme policy is preserved.
