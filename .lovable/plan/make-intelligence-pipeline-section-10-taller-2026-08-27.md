# Make Intelligence Pipeline Section 10% Taller

## Goal
Increase the rendered height of the Intelligence Pipeline block on `/bankdemo` System tab by 10% and proportionally scale its internal spacing and cards so the layout stays balanced.

## Target
`src/components/tepilot/insights/CapabilitiesView.tsx`, lines 982–1078 — the white `rounded-2xl` pipeline board and its Sources / Core / Destinations columns.

## Current state
- The pipeline board is a 5-column grid (`lg:grid-cols-[1fr_52px_1.35fr_52px_1fr]`) with no explicit height; it sizes from content.
- Source cards: `min-h-[52px]`, destination rows: `min-h-[34px]`, signal-section buttons are content-driven.
- Core panel uses `h-full overflow-hidden` and fills the row.

## Changes
1. Add an explicit `min-height` to the pipeline board container that is ~10% larger than the current natural height.
2. Scale internal vertical spacing:
   - Increase column padding (`p-4` → slightly larger).
   - Increase source-card `min-h` and destination-row `min-h` proportionally.
   - Increase signal-section vertical padding and the rolling ticker row height (`h-7` → ~10% taller).
3. Keep the connector SVG and arrow centered; do not change the 5-column grid proportions.
4. Preserve all existing interactions (active states, detail panel, ticker animation).
5. Ensure the detail panel below still flows naturally and does not overlap.

## Verification
- Build the project.
- Open `/bankdemo` System tab and compare the pipeline board height to the current preview; confirm it is visibly taller while remaining aligned.
- Confirm source/destination cards and signal sections still stretch evenly and the ticker animates smoothly.
