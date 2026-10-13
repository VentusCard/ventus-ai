# Add more outside signals to slide 2.2

## What changes

The right-hand "OUTSIDE THE WALLS" panel on slide 2.2 rolls a list of outside elements. Three new elements are added to the rolling list:

- Credit card at another bank
- Savings at another bank
- Investments at another brokerage

They are appended after the existing life-event rows ("Bought a house" … "Children going to college"), keeping "And everything in between" as the closing row. Existing rows and wording stay unchanged.

## How

- `src/lib/deckmoScript.ts` — add the three strings to `DECKMO.visibility.outside.rows` (Title Case, matching existing rows). This list drives the 2.2 ticker only; the living-view outside chips are untouched.
- `src/components/deckmo/DeckmoDeck.tsx` — extend `OUTSIDE_ICONS` with icons for the three new rows (CreditCard for the card, PiggyBank for savings, TrendingUp for brokerage investments), keeping the existing `ExternalLink` fallback for anything unmapped.

No layout, animation, or speed changes: the ticker loops the same rows at the shared roller speed, so a longer list just means a longer loop.

## Verification

- Playwright at 1375×1011: confirm the three new rows appear in the rolling list, spacing/row height unchanged, no horizontal overflow, no runtime errors.
- Check build log is clean.
