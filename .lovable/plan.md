# Beat 6.5: Fix the text and spacing in the holiday travel collection (deck only)

Keep the existing elements and their order: Back, photo, collection message, five offer cards (merchant, product, description, reward pill, Activate). Nothing is added or removed. Only sizes, wrapping and spacing change.

## Fixes
1. **Photo is no longer cut off**: make the photo band taller so it reads as a picture, not a sliver. Offset the extra height by tightening spacing elsewhere.
2. **Descriptions show in full**: remove the one-line cut-off so each description wraps onto 2 lines and shows the full text, with no "...".
3. **More room for text**: shrink the right-hand column (reward pill and Activate) so the text gets more width. That means slightly smaller pill and button padding, and stacking them tightly.
4. **Even, tighter spacing**: reduce card padding, the gaps between cards and the space above and below the message, so all five offers still fit without scrolling.
5. `/demo` is unchanged.

## Verification
- Playwright on beat 6.5 at 1540×855, 1691×1011 and 1920×1080:
  - No description is clipped.
  - The photo is visible.
  - Priority Pass (the fifth offer) is fully inside the phone.
- If the smallest size is tight, trim spacing or font by half a step. Don't cut text.

## Technical details
- `src/components/exec-demo/GeneratedOffersPhoneView.tsx`, `expandedGroup` branch (~353–407). Change only the `presentationMode` classes.
  - Image `h-[40px]` → about `h-[72px]`.
  - Remove `truncate` from `deal.message`.
  - Card `p-1.5` → `px-2 py-1`, list `space-y-1` → `space-y-[3px]`.
  - Pill and button padding reduced, text column `leading-tight`.
