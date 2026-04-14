

## Plan: Make 5 Deal Cards Fill the Rollup Space

### Problem
The deal tiles inside each rollup card are fixed at `w-[115px]` with `shrink-0` and horizontal scroll, so they don't expand to fill the available width of the middle panel.

### Fix — `src/components/exec-demo/NextOfferRationale.tsx`

**Lines 74-79**: Change the horizontal scroll container and deal tile sizing:

1. Replace `flex gap-2 overflow-x-auto` with a CSS grid: `grid grid-cols-5 gap-1.5`
2. Remove `w-[115px] shrink-0` from each deal tile, replace with `min-w-0` so they flex equally across the full width
3. Keep `px-3 pb-2.5` padding on the container

This ensures all 5 cards distribute evenly across the rollup card width with no horizontal scrolling.

