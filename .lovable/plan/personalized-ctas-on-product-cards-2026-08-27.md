# Personalized CTAs on product cards

Today every product card in the phone mockup ends with the same "Learn More" button, even though the generation engine already produces a personalized CTA (and a supporting sub-line) for each card. The card just ignores it.

## What changes

- The button label uses the card's own generated CTA (e.g. "Unlock Your Home's Value", "Reward Your Routine", "Lock Your Rate") instead of the fixed "Learn More".
- If a card has no CTA (older cached copy), fall back to a theme-appropriate default rather than a single generic label — for example travel to "Plan Your Trip", home to "Check Your Equity", retirement to "Review Your Plan", dining to "Start Earning", fitness to "Claim Your Perk", and so on for all 12 themes.
- Very long CTAs are trimmed to fit the button on one line, so nothing wraps or overflows the compact phone card.

## Technical notes

Change is limited to `src/components/exec-demo/ProductCardsPhoneView.tsx`:

- Add a `THEME_CTA` map keyed by the existing 12 theme keys, alongside `THEME_BENEFITS` / `THEME_VALUE`.
- Button label resolves as `card.cta` (trimmed, title-cased as generated) then `THEME_CTA[card.theme]` then `"Learn More"`.
- Add a small `fitCta` clamp (~22 chars, word boundary) so the label stays on one line next to the chevron.

No edge-function or data changes; the `cta` field is already generated and stored in snapshots.
