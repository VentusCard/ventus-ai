# Better use of slide 2.1’s panel

## Changes
- Keep the panel’s current position, width, colors, and Ricky heading.
- Increase the KYC and payment-rail labels, schema descriptions, icons, and row spacing so the collapsed overview feels balanced within the panel instead of crowded at the top.
- When all sections are collapsed, distribute the six headers across the available panel height.
- When a section opens, keep the other headers visible and let its contents use the remaining height. Long transaction lists scroll within that section, with their column headers remaining visible.
- Preserve the current default selection and one-section-at-a-time expansion behavior; do not add content to fill space.
- Leave slide 2.2, its profile line, and both rolling lists unchanged.

## Technical details
- Give the slide 2.1 accordion a bounded, full-height layout in `DeckmoDeck.tsx` and `RickyRailAccordion.tsx`.
- Replace the expanded section’s fixed `400px` height ceiling with available-height sizing, keeping the transaction list independently scrollable.
- Keep existing KYC fields, rail-specific columns, data, and arrow-only slide navigation unchanged.

## Verification
- Check the collapsed overview and expanded KYC, Cards, and ACH at 1691×1011, 1375×842, and 1024×768.
- Confirm readable labels, no clipped headers or horizontal overflow, and access to every transaction through scrolling.
- Move between 2.1 and 2.2 to confirm the rolling presentation and navigation remain unchanged; run the relevant existing tests.