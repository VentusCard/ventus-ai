# Use more vertical space for the compact product card

## Goal
The Personalized Product phone mockup card was compressed too far in the last change. Make it taller so it uses the available mockup height more fully without reintroducing a scrollbar.

## Plan

1. **Increase the compact product card's vertical footprint**
   - Restore the third benefit line in compact mode (`slice(0, 3)` instead of `2`).
   - Increase the quote line clamp from 2 to 3 lines in compact mode.
   - Raise compact padding from `p-3 gap-2` to `p-4 gap-2.5`.
   - Bump compact font sizes one step (e.g., product name `text-[13px]` → `text-[14px]`, body `text-[11px]` → `text-[12px]`).
   - Let the card grow to fill available mockup height using `flex-1` / `min-h` instead of a fixed short height.

2. **Keep the card within the phone viewport**
   - Maintain the existing no-scrollbar constraint.
   - If 3 benefits + 3 quote lines exceed the viewport at 1440px, trim quote to 2 lines or keep benefits at 2 and increase padding/spacing instead.

3. **Verify visually**
   - Check the Personalized Product tab with an example customer selected at 1440px and 1920px.
   - Confirm the card uses more vertical space and no scrollbar appears.

## Files to change
- `src/components/exec-demo/ProductCardsPhoneView.tsx`
