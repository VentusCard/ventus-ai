# Compact the System tab pipeline board — second pass

Further shrink of the same flow-diagram section without undoing the legibility fixes.

## Changes (CapabilitiesView.tsx only)
1. **Signal cards:** `py-2.5` → `py-2`; ticker rows and window `h-11` → `h-10` (descender fix stays intact via `leading-normal` + `pb-px`); card header row `mb-0.5` → `mb-0`; ticker window `mt-0.5` → `mt-0`.
2. **Core column header:** title `text-[14px]` stays; meta line `mt-1` → `mt-0.5`; header block `pb-2.5` → `pb-2`.
3. **Destinations:** rows `min-h-[48px]` → `min-h-[44px]`; icon tiles `h-9 w-9` → `h-8 w-8` (icons 18px → 16px); row gap `gap-3` (inside row) → `gap-2.5`.
4. **Sources:** group wrapper inner `p-3` → `p-2.5`; source feed pills/rows keep text sizes, reduce their vertical padding by one step if present.

Expected: another ~40-60px shorter, typography unchanged.

## Verify
- Playwright screenshot of `/bankdemo` System tab, all columns balanced, no clipping or scrollbars.
