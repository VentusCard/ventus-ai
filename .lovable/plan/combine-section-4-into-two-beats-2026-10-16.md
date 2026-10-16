# Combine Section 4 into two beats

## What changes
- **4.1:** Keep the five family headings and empty rows, with all insights and the description hidden.
- **4.2:** Reveal the complete story together: all internal and external signal pills, connecting words, and punctuation. Remove the separate 4.3 beat.
- Keep the headings and row positions stationary, with the existing staggered insight entrance and reduced-motion support.
- Preserve the nested attributes, family colors, external badges, amounts, pop-ups, and transaction evidence. Each small attribute remains individually distinguishable within its parent signal; child labels do not become separate buttons.

## Updated 4.2 description
“Complex customer signals, broken into individually identifiable attributes—from amounts and cadence to locations, relationships, and life events.”

The description remains hidden on 4.1, with its space reserved.

## Technical details
- Change `ricky-story` from three steps to two in `deckmoScript.ts` and replace the internal/external story descriptions with the combined description above.
- Update `RickyStoryScene` to use the combined description and the two-step mapping, including its inactive-scene fallback.
- Update the reveal helpers so step 0 hides every insight and step 1 reveals both sources. Keep insight-only entrance activation scoped to the active scene.
- Update navigation and reveal regression tests, the architecture rule, and the saved Section 4 requirements to reflect the two-beat sequence.
- Leave all other sections, standalone stories, signal data, and interaction behavior unchanged.

## Verification
- Test that Section 4 has only steps 0 and 1; every insight is hidden/noninteractive on 4.1 and both sources are available on 4.2.
- Verify 4.1 → 4.2 → Section 5 and backward navigation with arrows and A/D, including replaying the entrance.
- Check stationary headings and row geometry at 1546×903 and 1024×768; verify internal/external pop-ups and reduced motion.
- Run the relevant deck tests and check preview diagnostics.