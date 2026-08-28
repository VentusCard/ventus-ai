# Customer Intelligence Core card — simplify ticker and enlarge

## Goal
In `/bankdemo` → System tab → Customer Intelligence Core column, each of the five signal-family cards currently rolls a ticker that shows `main signal → supporting evidence → basis`. Reduce the ticker to only the main signal and make the card slightly bigger so the label is easier to read.

## What will change
1. **Ticker content** in `src/components/tepilot/insights/CapabilitiesView.tsx` (`SignalSection` component):
   - Keep only `example.to` (the main signal label, e.g. "Bi-weekly weekend tennis").
   - Remove the arrow, the evidence line (`example.ev`), and the basis badge from the rolling row.
   - Keep the roll animation and the 24h detection count in the header unchanged.

2. **Size bump**:
   - Increase the ticker row height from `h-8` to `h-9`/`h-10`.
   - Slightly increase the main-signal font size (e.g. from `text-[12.5px]` to `text-[13.5px]` or `text-sm`).
   - Optionally increase card vertical padding (`py-3` → `py-4`) so the larger row does not feel cramped.

## Files affected
- `src/components/tepilot/insights/CapabilitiesView.tsx` only.

## Out of scope
- No changes to the five family colors, icons, pulse dots, or active-selection states.
- No changes to the data sources or activation destinations columns.
- No backend or data changes; only the rendering of the existing `signal.examples` array.
