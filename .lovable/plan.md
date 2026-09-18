# Footer: swap "Current section" for "Confidential"

## What changes

In `/deckmo`'s bottom bar (`src/components/deckmo/DeckmoDeck.tsx`):

1. Remove the two-line "Current section / Activation" block (the right-side label that shows the active chapter name).
2. Put "Confidential" in its place, styled like the header's version (uppercase, small, navy).
3. Remove "Confidential" from the header's right-side metadata group so it lives only in the footer — the header keeps the logo, chapter title, and "Bank Leadership Presentation".

The dynamic chapter title stays in the header; the header does not become static.

## Verification

Build check plus a quick Playwright pass confirming the footer shows "Confidential", the header no longer does, and nothing overlaps at 1024×768 and 1428×855.
