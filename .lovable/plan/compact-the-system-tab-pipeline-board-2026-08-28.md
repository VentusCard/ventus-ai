# Compact the System tab pipeline board

The flow-diagram section (Data sources → Core → Activation) has grown too tall: the grid forces `min-h-[410px]`, every column uses `p-5`, signal cards are `py-3.5` with 44px ticker rows and `gap-2.5`, destination rows are 54px with `gap-3`, and source group wrappers add `py-2` taglines plus `gap-3`. The tall core column then stretches the side columns via `items-stretch`, leaving dead white space in them.

## Compacting pass (CapabilitiesView.tsx only)
1. **Grid (line 1008):** drop `min-h-[410px]` so height is content-driven.
2. **Column chrome:** all three column paddings `p-5` → `p-4`; header margins `mb-3.5` → `mb-3`.
3. **Core column:** inner header `pb-3` → `pb-2.5`; "Signals · what we detect" label `mb-3` → `mb-2`; signal card list `gap-2.5` → `gap-2`; `SignalSection` card padding `py-3.5` → `py-2.5` (keeps the new h-11 ticker rows and larger text intact).
4. **Sources column:** section wrappers `gap-3` → `gap-2.5`; tagline `py-2` → `py-1`; source card list `gap-2` → `gap-1.5`.
5. **Destinations column:** rows `min-h-[54px]` → `min-h-[48px]`; list `gap-3` → `gap-2`.

Net effect: roughly 60-90px shorter board, tighter side columns, no visual regressions to the ticker fix or the larger typography.

## Verify
- Playwright screenshot of `/bankdemo` System tab at each walk step; confirm no clipping, no internal scrollbars, and the three columns stay visually balanced.
