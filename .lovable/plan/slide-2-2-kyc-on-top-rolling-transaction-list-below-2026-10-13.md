# Slide 2.2: KYC on top, rolling transaction list below

## What changes
- Slide 2.1 stays as it is (KYC plus the Cards/ACH rail blocks).
- On slide 2.2 the left panel shows:
  - The KYC block at the top, unchanged and still opening/closing on click.
  - Below it, Ricky's raw transactions return as the original single list (account, rail, raw description, amount), scrolling continuously.
- The list scrolls at exactly the same speed as the outside events on the right, so both sides move together. Fade edges at top and bottom stay as before.
- The change happens during the existing 2.1 to 2.2 move to the left, with a short crossfade from the rail blocks to the rolling list. Going back to 2.1 brings the rail blocks back.
- Reduced-motion users see a static list. Clicks still never change slides.

## Technical details
- `RickyRailAccordion.tsx`: export the KYC block as its own `RickyKycBlock` component; the accordion reuses it so 2.1 is unchanged.
- `DeckmoDeck.tsx` `Visibility`: when `step > 0`, render `RickyKycBlock` and then the existing `InsideLedger` (uses `VerticalRoller` with the shared `VISIBILITY_ROLLER_SPEED`, same constant as `OutsideTicker`); otherwise render `RickyRailAccordion`.
- Update the AGENTS.md rail-overview rule to say rail blocks belong to 2.1 only; check with Playwright at 1375x1011 and 1024x768 and run bun tests.
