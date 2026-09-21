# Page-based slide counter for `/deckmo`

## Goal
Make the bottom-left counter count the deck's 10 pages rather than its 32 animation beats, while still showing the active beat within multi-beat pages.

## Change
- Derive the page number from the active section and the beat number from that page's current step.
- Display multi-beat pages as `1.1 / 10`, `1.2 / 10`, and so on.
- Display a single-beat page as `7 / 10`, without a redundant `.1`.
- Keep previous/next controls, keyboard navigation, scrolling, presenter navigation, and all slide content unchanged.
- Leave the progress bar behavior unchanged because the request is limited to the bottom-left counter.

## Verification
- Navigate forward and backward through all pages and confirm page numbers only advance when the page changes.
- Confirm multi-beat pages increment their decimal beat suffix and the single-beat page has no suffix.
- Confirm the final page ends at `10.4 / 10` and the deck has no runtime or build errors.
