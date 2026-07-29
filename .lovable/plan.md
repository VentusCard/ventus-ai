Tighten spacing and typography in `src/components/solutions/CampaignStudioPreview.tsx` so the segment grid and draft card feel like one system.

## Fixes

1. **Segment tab cards** — currently mix `text-[13px]`/`text-[11px]`/`text-[10px]` and duplicate the reach number (top-right chip + "18.4k reachable" caption).
   - Remove the redundant "Xk reachable" caption under the progress bar; keep only the top-right reach chip.
   - Standardize tab typography: angle chip `text-[10px]`, reach `text-[11px] font-mono`, label `text-[13px] font-medium leading-snug`.
   - Unify padding to `p-3.5` and internal vertical rhythm (`mt-1` between chip row and label, `mt-2.5` before progress bar).
   - Progress bar height standardized to `h-1`, consistent rounded-full.

2. **Draft card** — chip sizes and vertical gaps drift.
   - Normalize all pill/chip heights: use `px-2 py-1 text-[11px]` everywhere (3%/2%/1% pills, value-math chip, personalized-est chip, channel chips get `text-[10px] px-1.5 py-0.5` as secondary tier).
   - Align gaps: `gap-1.5` inside chip rows, `mb-3` between blocks, single `mb-2` before the legend caption.
   - Move the "$xx.xx = personalized…" legend out of the draft card and place it once, right-aligned, under the segment grid so it isn't repeated every rotation and doesn't crowd the card footer.

3. **Section rhythm** — align outer spacing.
   - Product band, segment grid, and draft card each separated by `mb-5`.
   - Header eyebrow row and "One product · 6 segments" row use matching `text-[11px] uppercase tracking-wide text-gray-500`.
   - Grid gap bumped from `gap-2` to `gap-2.5` so tabs breathe evenly across 3 columns.

4. **MergeToken sizing** — currently `text-[11px]` inline in `text-[13px]` body copy causes visual jitter.
   - Keep inline body token at `text-[11px]` but add `leading-none` and `translate-y-[-1px]` to sit on the baseline cleanly.
   - Chip-form token ($xx.xx / yr) matches other 11px chips exactly.

No changes to segment content, rotation logic, product band copy, or branding.
