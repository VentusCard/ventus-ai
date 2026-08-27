Reduce the height of the generated product card in Personalized Product to eliminate scrolling

## Goal
In the Personalized Product tab, the generated product card inside the phone mockup is currently too tall and triggers an internal scrollbar. Make the compact card fit within the available phone viewport without scrolling.

## Current state
`src/components/exec-demo/ProductCardsPhoneView.tsx` renders product cards with these height drivers when `compact={true}` (the mode used by `RelationshipPhoneView`):

- The card wrapper sets `min-h-[300px]`.
- Compact inner padding is `p-4` with `gap-2.5`.
- The card shows up to 3 theme benefits, a 3-line quote clamp, a 2-line product name clamp, an estimated-value line, and a CTA button.

This forces the card taller than the phone mockup content area, causing a vertical scrollbar.

## Change
Tighten the compact product card in `ProductCardsPhoneView.tsx`:

1. Lower or remove the `min-h-[300px]` minimum height for compact cards so the card can shrink to its content.
2. Reduce compact inner padding to `p-3` and gap to `gap-2`.
3. Show at most 2 benefits in compact mode (currently 3).
4. Tighten the quote to `line-clamp-2` in compact mode (currently 3).
5. Keep the product name `line-clamp-2` but slightly reduce the product name font size to `text-[14px]` or `text-[13px]` in compact mode.
6. Leave the non-compact (full) card unchanged.

## Verification
- Open `/bankdemo` → Personalized Product tab.
- Select an example customer so product cards generate.
- Confirm the product card in the phone mockup is fully visible without an internal vertical scrollbar at common desktop viewports (1440px and 1920px).
