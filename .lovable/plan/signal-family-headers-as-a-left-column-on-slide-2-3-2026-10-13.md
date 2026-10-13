# Signal family headers as a left column on slide 2.3

## Goal
On the combined Ricky signal story (2.3), add the five signal family headers (Behavioral, Life Events, Financial, Demographics, Risk) as a slim column on the left, with the story paragraph continuing to the right.

## Change
- Add a left rail inside the story area: one static row per family in the existing order, each with its family color dot and name. No click behavior — headers are plain labels; only pills stay interactive.
- The paragraph keeps its current single continuous flow and sits to the right of the rail. No re-wording, no reordering of the 14 pills, no change to pill colors, external "Ext" markers, or the details panel behavior (still one open at a time, still below the paragraph).
- Keep the profile heading, light theme, and everything else on the slide unchanged.

## Technical details
- Scope: `src/components/deckmo/RickySignalStory.tsx` only (plus, if needed, small CSS in `src/styles/base.css`). No script or data changes.
- Derive the five families from the existing `DECKMO.ricky.signals` (family + tone), reusing the same deck-story color tokens already used by the pills (`--deck-story-*`) so dots match pill colors exactly.
- Layout: the story content area becomes a two-column grid (roughly `grid-cols-[190px_1fr]`, narrower under max-height 800px); the rail is the first column, the paragraph + detail section the second. Rail entries vertically distributed to read as a column rather than a list at the top.
- The detail panel opens inside the content column (right of the rail), so the rail stays fixed while details expand.
- Verify at 1377×842 and 1691×1011: rail visible, no wrapping/overflow, paragraph readable, all 14 pill details still open/close, navigation unchanged.

## Verification
- Playwright on 2.3: five headers with correct colors in the left column, one continuous paragraph to the right, pill click still opens its detail in the right column, no slide movement.
- Run `bun test scripts/deckmoSignalStory.test.ts` and check the build log.
