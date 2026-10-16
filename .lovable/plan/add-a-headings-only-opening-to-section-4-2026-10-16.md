# Add a headings-only opening to Section 4

## Three-beat sequence
- **4.1 — Five families:** show only the existing left-hand headings — Demographics, Financial, Behavioral, Life Events, and Risk — with their colored dots, divider lines, and empty row areas to the right. No narrative, insight pills, ghosted external clues, or clickable hidden details.
- **4.2 — Internal insights:** reveal the current internal story with a staggered entrance. External clauses remain faded and blurred as they are today.
- **4.3 — External insights:** sharpen the external lead-in words, pills, and punctuation together using the existing external reveal.

## Presentation
- Keep “Ricky, understood with” and the Ventus AI logo, existing width, larger family labels, colors, and vertical spacing.
- Preserve identical row heights and heading positions across all three beats; empty rows must not collapse before insights appear.
- On 4.1, withhold the insight-bearing subtitle while retaining its space. Use the existing internal subtitle on 4.2 and external subtitle on 4.3, with no new copy.
- Keep headings and dividers stationary when internal insights appear; apply the staggered reveal to the insight area rather than replaying the already-visible headings.
- Returning to 4.1 hides every insight again; returning to 4.2 replays its internal entrance. Honor reduced-motion preferences.
- Preserve all signal wording, amounts, pop-ups, evidence tables, and other sections. Section 5 stays Section 5.

## Technical details
- Increase the `ricky-story` beat count in `deckmoScript.ts` from two to three.
- Update `RickyStoryScene` to map the new three-step sequence and its subtitles explicitly, including the inactive-scene fallback.
- Update `RickySignalStory` and the deck reveal helpers to distinguish headings-only, internal, and complete states. Keep hidden insight content in layout, but remove it from interaction and accessibility exposure on 4.1.
- Adjust story-scoped entrance styling so only the insight area cascades on 4.2, preserving the existing external treatment on 4.3 and fully shown standalone behavior.
- Update reveal/navigation regression tests and the architecture rule to reflect the new opening beat.

## Verification
- Test the three beat states, hidden-insight interaction rules, internal entrance activation, external gating, and backward navigation.
- In `/deckmo`, verify 4.1 → 4.2 → 4.3 and back using arrows and A/D; ensure no heading or row geometry shifts.
- Check at 1691×842 and 1024×768, including scrolling on shorter screens, reduced motion, and internal/external pop-ups without slide changes.
- Run the relevant deck tests and check preview diagnostics before completion.