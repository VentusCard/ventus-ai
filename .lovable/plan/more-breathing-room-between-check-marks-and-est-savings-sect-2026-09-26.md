# More breathing room between check marks and Est. savings (section 7 card)

## Change

In `src/components/exec-demo/ProductCardsPhoneView.tsx`, presentation layout only: the benefits row currently uses `justify-center gap-2 pt-2.5`. Add bottom padding to that same row (`pt-2.5 pb-2`), which pushes the three check marks up within the flexible row and opens a visible gap between the last check mark and the "Est. ..." savings pill.

- Only the deck's presentation layout branch is touched (`presentationLayout` class); the /demo and compact layouts are unchanged.
- No copy, data, or rotation changes.

## Verification

- Build clean (`bunx tsgo --noEmit` + build log).
- Playwright at 1376x1011, 1540x855, and 1691x1011: the gap is visible on the active card, no benefits text or savings pill clipped, rotation still cycles every 4 seconds.
