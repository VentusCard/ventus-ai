# Opener: one line per comparison row, aligned equal signs

## Goal

In the `/deckmo` Thesis opener, the Today / With Ventus comparison lines must each stay on a single line, and the three `=` signs must align vertically between the two rows. The Ventus row stays blue.

## Current state

- `src/lib/deckmoScript.ts` (opener `comparison`): each row is a single text string with `=` signs embedded ("Don't talk to or understand your customers = Commoditized banking = Easy to lose").
- `src/components/deckmo/DeckmoDeck.tsx` (`Opener`): renders each row as one `<p>` with the label span followed by the full text string, so the `=` positions are free-floating and cannot align between rows.

## Change

1. **`src/lib/deckmoScript.ts`** — restructure `opener.comparison` so each row is split into its three segments (no embedded `=`):
   - `today`: label "Today", segments `["Don't talk to or understand your customers", "Commoditized banking", "Easy to lose"]`
   - `ventus`: label "With Ventus", segments `["Understand and predict customer needs", "Personalized banking", "Differentiated banking"]`

2. **`src/components/deckmo/DeckmoDeck.tsx` (`Opener`)** — render the two comparison rows as one shared CSS grid so column widths are common to both rows and the `=` cells line up:
   - Grid columns: label / statement / `=` / result / `=` / outcome (`grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]` style, refined at build time).
   - The `=` signs live in their own grid cells; the shared grid guarantees vertical alignment.
   - Keep the existing reveal behavior: "Today" row appears at step 2, Ventus row at step 3, Ventus row (including its `=` signs) in `text-blue-600`, Today row `text-slate-950` with muted label.
   - Keep each row to one line: slightly smaller clamp for the comparison rows (e.g. `clamp(20px,1.9vw,30px)`) and `whitespace-nowrap` on segments with `min-w-0`/`truncate` safety, sized so the full rows fit inside the `max-w-[1280px]` block at 1024–1920px widths.

## Verification

- Playwright against `http://localhost:8080/deckmo?from=demo`, section `section[data-section='0']`:
  - Each comparison row is a single line (row height ≈ one text line, no wrap).
  - The bounding-box x-ranges of the two `=` cells in each row pair match (left edges equal within ~1px) for both `=` positions.
  - Ventus row renders blue; reveal order unchanged.
- Sweep at 1024×768 and 1440×900 for overflow; no external requests; build OK.
