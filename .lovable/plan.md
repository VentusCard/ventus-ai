# Beat 6.5 — Redesign the holiday travel collection page (deck only)

## Why it's broken today
- The picture is squeezed into a 40px-tall strip, so it shows as a cropped sliver.
- Each offer row reserves a right-hand column for the reward pill + "Activate" button, which steals width, so descriptions are forced onto one truncated line ("...").

## New layout (inside the phone, deck view only)

```text
< Back
+--------+  Annual tropical vacation
| photo  |  Get December-ready before the
| square |  flights are booked.
+--------+  5 offers
-----------------------------------------
Sony  · WH-1000XM5 Headphones   [12% Cash Back]
Noise-canceling over-ears that turn a long
flight into quiet time.              Activate >
-----------------------------------------
REI ... (same pattern x5)
```

1. **Header card, not a strip**: the collection photo becomes a fully visible rounded square thumbnail (~64px) on the left, with the collection title, the message and "5 offers" on the right. Nothing gets cropped into a sliver.
2. **Offer rows use the full width**:
   - Line 1: merchant (bold) + product, reward pill aligned right.
   - Line 2–3: the full description, wrapping naturally — no truncation, no "...".
   - "Activate" becomes a small text link at the bottom-right of the description, so it no longer takes a column away from the text.
3. All five offers fit on screen without scrolling; spacing between rows is tight but even, with thin dividers instead of heavy bordered boxes to save vertical space.
4. `/demo` keeps its current layout unchanged.

## Verification
- Playwright at 1540×855, 1920×1080 and your 1691×1011 screen on beat 6.5: check that every description element is not clipped (its full text height is visible), the photo is fully visible, and the fifth offer (Priority Pass) is fully inside the phone.
- If anything is tight at the smallest size, reduce row spacing/font by a half step rather than cutting text.

## Technical details
- File: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`, `expandedGroup` branch (~lines 353–407), only the `presentationMode` styles/structure change; the non-presentation branch stays byte-identical in behavior.
- Remove `truncate` on `deal.message` in presentation mode; replace the right-column flex layout with a stacked row (header flex row with pill, description block, inline CTA).
- Replace the `h-[40px]` image band with a flex header containing a `h-16 w-16 rounded-lg object-cover` image plus text.
- Offer list: `divide-y` rows, `overflow-y-auto` kept as a safety net but content sized to fit.
