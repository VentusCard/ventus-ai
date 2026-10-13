# One full-width Ricky signal story

## Slide sequence
- Keep 2.1 and 2.2 unchanged, including KYC, expandable transaction rails, and outside events.
- Remove current 2.3 (enriched ledger) and current 2.4 (internal-only signals).
- Turn current 2.5 into the single combined signal slide, renumbered **2.3**. Section 2 will have three beats.

## Combined signal slide
- Replace the ledger-and-pills split with a full-width, naturally written paragraph about Ricky, with all 14 existing signal pills embedded inline in the prose.
- Connect the pills with short natural-language phrases and sentences, rather than displaying a standalone list of pills or five separate cards.
- Preserve all five signal families, their existing colors, exact pill labels, and external markers. Keep external signals after the internal signals within their family’s part of the narrative.
- Retain Ricky’s profile heading and the strict light theme.
- Clicking a pill toggles its existing fuller description beneath the paragraph; only one detail is open at a time. Internal details retain access to their supporting transaction rows, and external details retain their source evidence, without restoring a permanent ledger column.
- Use only existing fixture facts; do not invent new personal details or opportunities.

## Technical details
- Reduce the visibility section’s shared registry count from five beats to three and explicitly map the final beat to the combined signal story.
- Add a deck-scoped narrative rendering path, leaving the signal layout used by The Complete Picture and other experiences unchanged.
- Update section-two supporting copy and shared progress/footer navigation for the shorter sequence.
- Preserve navigation exclusively through the arrow controls, left/right arrows, and A/D keys; pill and evidence clicks never advance slides.

## Verification
- Navigate 2.1 → 2.2 → new 2.3 → The Complete Picture and back; confirm correct numbering and no removed beats.
- Confirm all 14 pills appear in the paragraph with the five family colors and three external markers.
- Exercise internal and external pill details, close/reopen behavior, and supporting evidence without slide movement.
- Check the paragraph and expanded details at 1377×842 and a larger desktop size for clipping, overlap, and readable wrapping.
- Run focused navigation/fixture tests and check the preview for errors.