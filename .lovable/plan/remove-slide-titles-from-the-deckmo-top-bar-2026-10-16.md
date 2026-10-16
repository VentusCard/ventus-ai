# Remove slide titles from the deckmo top bar

## What changes

The deck's fixed top bar currently shows the Ventus AI logo, a thin divider line, and the current section title in serif type (for example "Thesis", "The Complete Picture"). The user finds the top-left corner too dense.

Remove the divider line and the title text from the top bar, so the top-left shows only the Ventus AI logo. The rest of the bar (INTERACTIVE PRESENTATION label and exit button) is unchanged.

## Where

- `src/components/deckmo/DeckmoDeck.tsx` — the fixed `<header>` block: delete the `<span>` divider and the `<span>` that renders `{activeBeat.nav}`, and drop the now-unneeded `activeBeat` reference if it becomes unused.

## Notes

- Only the /deckmo presentation top bar is touched. Slide titles still exist everywhere they should: in each slide's own heading, the footer slide counter, and the Table of Contents.
- The removed title is also the top bar's screen-reader live announcement; removing it visually removes that announcement as well, which is acceptable since the footer counter and Table of Contents still identify the current slide.
- No wording, navigation, or reveal behavior changes.

## Verification

- Playwright at 1691×842: confirm the top bar shows only the logo on the left on slides 1, 4.2, and 5, and that arrow/A/D navigation still works.
- Run the existing deck tests and confirm the build is clean.
