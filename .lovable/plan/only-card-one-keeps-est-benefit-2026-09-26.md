# Only Card One Keeps "Est. Benefit"

## Current state (verified)
- The estimate label is rendered once in shared card code: `src/components/exec-demo/ProductCardsPhoneView.tsx`, line 273 renders `Est. Benefit {value}` for every card.
- Section 7 shows three cards in rotation: 1) Our Bank Preferred Mortgage, 2) Our Bank Premium Rewards Card, 3) Our Bank Guided Investing. All three currently show "Est. Benefit".

## Change
In `ProductCardsPhoneView.tsx` (the `<p>` at line 272-274), make the label theme-aware:

```tsx
{card.theme === "fitness" ? "Est. Benefit" : "Est."} {value}
```

Result (section 7 rotation):
- Card 1 (Preferred Mortgage): "Est. Save $3,200+"
- Card 2 (Premium Rewards Card): "Est. Benefit $450–$680/yr"
- Card 3 (Guided Investing): "Est. Save $1,800+/yr"

The Premium Rewards Card is the only fitness-theme card, so this labels exactly that card. No other files change; layout, rotation, and all other card content are untouched.

## Verification
- `bunx tsgo --noEmit` and build log clean.
- Playwright at 1691×1011 (plus 1540×855): arrow to section 7, confirm card 1 shows "Est. Benefit" and cards 2 and 3 show "Est." as they rotate; check nothing wraps or clips in the value pill.
