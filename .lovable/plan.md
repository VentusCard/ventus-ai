# Enlarge Customer Intelligence Core ticker text

## Scope
Update only the rolling detection ticker inside the **Customer Intelligence Core** card on `/bankdemo` → Systems tab (`SignalSection` in `src/components/tepilot/insights/CapabilitiesView.tsx`).

## Changes

1. **Increase ticker text size**
   - Bump the detection label (`example.to`) from `text-[12.5px]` to `text-[14px]`.
   - Bump the evidence text (`example.ev`) from `text-[12.5px]` to `text-[13px]`.
   - Bump the arrow and basis chip from `text-[11px]` to `text-[12px]`.

2. **Use the vertical space better**
   - Increase the ticker row height from `h-8` (32px) to `h-10` (40px).
   - Increase the track window from `h-8` to `h-10` so the larger text has room to roll.
   - Slightly increase the signal card vertical padding (`py-3` → `py-3.5`) so the taller ticker does not feel cramped.

3. **Preserve behavior**
   - Keep the Web Animations API roll, reduced-motion fallback, staggered intervals, and click-to-select behavior exactly as-is.
   - The row-height measurement in the animation (`currentRowRef.current?.getBoundingClientRect().height`) will automatically pick up the new height.

## Acceptance
- The five signal rows in the Core card display larger, more legible ticker text.
- The roll animation still moves one full row without clipping or layout shift.
- Reduced-motion mode continues to swap text instantly.
