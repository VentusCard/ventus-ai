# Left column segments aligned to each family's part of the story

## Goal
On slide 2.3, the left family column should segment vertically so each family header (and its section of the rail) lines up with where that family's signals appear in the story paragraph — Behavioral's segment next to the behavioral pills, and so on — instead of the five labels floating evenly in the middle.

## Change
- The paragraph stays one continuous flow, exactly as it is today (no re-wording, no splitting into blocks).
- The left rail becomes five vertically stacked segments. Each segment's height matches the vertical span that family's pills occupy in the paragraph: the first family's segment starts at the top of the paragraph, each following segment starts where the next family's first pill appears, and the last segment ends at the paragraph's bottom.
- A thin horizontal rule separates adjacent segments, so the column reads as segmented sections; each segment shows its color dot and family name, vertically centered within its segment.
- Segments track layout automatically: when the detail panel opens below the paragraph or the viewport changes, the segment heights re-measure and follow.

## Technical details
- Scope: `src/components/deckmo/RickySignalStory.tsx` only (plus tiny CSS in `src/styles/base.css` if needed). No data or script changes.
- Add a `data-signal-label` attribute to each pill button so the rail can find the pills per family (labels already map to families in `DECKMO.ricky.signals`).
- After render, measure each family's first pill top and last pill bottom relative to the story container; render the rail segments as absolutely positioned blocks with percentage tops/heights. Recompute via `ResizeObserver` on the story container (covers opening/closing details, viewport size, and the max-height-800px font size change).
- Rail column keeps its right border; segments inherit the existing `--deck-story-*` tokens so dot and label colors match the pills exactly.
- Rail aligns to the top of the paragraph (not stretched when the detail panel expands).
- Keep light theme, profile heading, pill interactions, and one-detail-at-a-time behavior unchanged.

## Verification
- Playwright at 1377×842 and 1691×1011: five segments in order, each segment's vertical span visually covering its family's pills, rules at the boundaries, labels legible.
- Open and close a pill detail: segments keep their alignment with the paragraph (no drift); no slide movement; no console errors.
- Run `bun test scripts/deckmoSignalStory.test.ts` and check the build log.
