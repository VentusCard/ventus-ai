# Living View: hide the vertical arrow behind the customer circles

## Goal

On beats 3.2/3.3 the vertical connector now starts right under "ONE LIVING CUSTOMER VIEW", but its first ~40px visibly crosses the customer circle's outer rings (ring bottom is 591 at 1540×855 vs line top 553; 765 vs 742 at 1080). The line should not draw over the circle — it should hide behind it and emerge below the outer ring.

## Change

`src/components/deckmo/DeckmoDeck.tsx` — LivingView center column and connector:

1. Add `z-10` to the center column (the `relative flex min-h-[250px] ...` div) so the whole customer node stacks above the connector line, which renders later in the DOM but has no z-index.
2. Add a mask circle as the first child of the center column: `absolute h-64 w-64 max-w-full rounded-full bg-background [@media(max-height:800px)]:h-56 [@media(max-height:800px)]:w-56` — exactly the outer ring's size, opaque page background, no border. It hides the line where it passes behind the circle while keeping the rings' current translucent look identical (ring tint, borders, breathing animations unchanged).
3. Add `z-20` to the two horizontal connector columns (the `relative h-px bg-blue-200` / `bg-amber-200` divs) so their arrowheads stay above the circle if the rings ever overlap their columns at narrow widths.

## Result

- The line visually starts below the circle's outer ring: the segment under the label is hidden behind the circle, and the glowing dot emerges from under the rings as it travels down.
- No copy, spacing, card position, or animation changes.

## Verification

- Playwright at 1540×855 and 1920×1080: screenshot confirms the line is hidden behind the rings and emerges below; horizontal arrowheads still visible; the dot animation still runs (sample `.deck-signal-down` top over ~2.5s).
- Build clean.
