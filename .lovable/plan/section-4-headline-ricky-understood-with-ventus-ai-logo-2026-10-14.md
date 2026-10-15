# Section 4 headline: "Ricky, understood with (Ventus AI logo)"

## What changes

Section 4's on-slide headline currently reads "Ricky, understood". It becomes "Ricky, understood" followed by the word "with" and the Ventus AI logo inline — the same treatment the deck opener label and the closing slide already use, sized to this headline.

Per your choice, only the slide headline changes. The small section label in the presentation header and the entry in the presentation overview list keep the plain text "Ricky, understood".

## Details

- The headline keeps its current type size, weight, color, and position; the logo sits on the same line, vertically centered in the text.
- The logo scales with the headline (about two-thirds of the letter height), so it stays proportional at every desktop resolution instead of being fixed to one size.
- If the line gets tight on a narrower window, "with" and the logo wrap to the next line rather than shrinking or overlapping.
- Both steps of Section 4 show the same headline, unchanged from today's behavior; the description line under it and everything below (signal rows, reveal animation, pill pop-ups) are untouched.
- In credit-union mode the headline reads the same — no wording there changes.
- Screen readers announce the line as "Ricky, understood with Ventus AI".

## Technical details

- `src/components/deckmo/DeckmoDeck.tsx`
  - `Header` gains an optional `withLogo` flag. When set, the `<h2>` renders as a wrapping flex row: title span, "with" span, then `<img src="/ventus-ai-logo.png" alt="Ventus AI" />` with `h-[0.66em] w-auto object-contain` and a small horizontal gap, so the height tracks the headline's `clamp(34px,3.6vw,58px)`.
  - `RickyStoryScene` passes `withLogo` to its `Header`. Every other scene keeps calling `Header` as before, so no other slide's headline changes.
- `src/lib/deckmoScript.ts`
  - `ricky.storyHeader.title` stays `"Ricky, understood"`. The word "with" and the logo come from the renderer, matching the established opener and closing-slide pattern.
  - `beats[3].nav` stays `"Ricky, understood"` — the header chip and overview list are unaffected.
- The credit-union DOM swap only rewrites text nodes, so the added image is not affected.

## Verification

- Typecheck and check the build log for errors.
- Playwright on `/deckmo` at 1546×903, 1376×1011, 1691×1011 and a narrow desktop width: the Section 4 headline shows "Ricky, understood with [logo]" on step 1 and step 2, logo vertically centered and legible, no collision with the description or the signal rows below, and the line wraps cleanly rather than overflowing at the narrowest size.
- Confirm the top header chip and the presentation overview still read "Ricky, understood" with no logo.
- Run the existing deck regression tests (navigation, signal story, rail groups, signal attributes) and confirm they still pass.
