# Remove Family Labels from Generated Product Cards

## Goal
Eliminate the small family-label pill (e.g., "Behavioral", "Life Event", "Financial Signal") from the generated product cards in `/bankdemo` so the card hierarchy is cleaner and no longer repeats signal-family information.

## Scope
- **Primary target:** `src/components/exec-demo/ProductCardsPhoneView.tsx` — the pill rendered at lines 256-261 using `fam.label`.
- **Out of scope (unless requested):** Email/SMS preview labels, which serve a different channel context.

## Implementation
1. Remove the `<span>` block that renders `fam.label` inside each card.
2. Adjust the surrounding layout so the product name still aligns cleanly with the theme icon:
   - Keep the icon container on the left.
   - Let the product name occupy the full remaining width.
   - Remove the `mb-1` spacing that was only there to separate the label from the name.
3. Keep all other card content intact: icon, product name, quote, benefits, estimated value, CTA, and chevron navigation.
4. Verify the card still fits within the phone mockup frame without introducing scroll.

## Validation
- Open `/bankdemo` Personalized Product tab.
- Select a customer and confirm generated product cards no longer show the family pill.
- Confirm no text cut-off or layout regression in compact phone view.
