# Opener: comparison lines with own-line labels and aligned equal signs

## Goal

In the `/deckmo` Thesis opener, restructure the Today / With Ventus comparison so:

- "Today" and "With Ventus" each sit on their own line (a label line above its equation).
- Each equation stays on a single line.
- The three `=` signs align vertically between the two equation lines.
- The With Ventus block (label + equation) stays blue.

Target layout:

```text
Today
Don't talk to or understand your customers = Commoditized banking = Easy to lose

With Ventus
Understand and predict customer needs = Personalized banking = Differentiated banking
```

## Current state

- `src/lib/deckmoScript.ts` (opener `comparison`): each row is a single text string with `=` signs embedded ("Don't talk to or understand your customers = Commoditized banking = Easy to lose").
- `src/components/deckmo/DeckmoDeck.tsx` (`Opener`): renders each row as one `<p>` with the label span inline followed by the full text string, so the `=` positions are free-floating and cannot align between rows.

## Change

1. **`src/lib/deckmoScript.ts`** — restructure `opener.comparison` so each row is `{ label, segments: [...] }` with the three segments split out (no embedded `=`):
   - `today`: label "Today", segments `["Don't talk to or understand your customers", "Commoditized banking", "Easy to lose"]`
   - `ventus`: label "With Ventus", segments `["Understand and predict customer needs", "Personalized banking", "Differentiated banking"]`

2. **`src/components/deckmo/DeckmoDeck.tsx` (`Opener`)** — restructure the comparison block:
   - Label lines: "Today" / "With Ventus" rendered as their own line above each equation (small, uppercase, tracking style matching the deck; muted for Today, blue for With Ventus).
   - The two equation lines render inside one shared CSS grid so column widths are common to both rows and the `=` cells line up: segments and `=` signs as grid cells (`grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]` style, refined at build time).
   - Keep the existing reveal behavior: Today block appears at step 2, Ventus block at step 3; Ventus block in `text-blue-600`, Today in `text-slate-950`.
   - Keep each equation to one line: clamp sizing for the equation rows (e.g. `clamp(20px,1.9vw,30px)`) with `whitespace-nowrap` segments and `min-w-0`/`truncate` safety, sized to fit the `max-w-[1280px]` block at 1024–1920px widths.

## Verification

- Playwright against `http://localhost:8080/deckmo?from=demo`, section `section[data-section='0']`:
  - "Today" and "With Ventus" render as standalone label lines above their equations.
  - Each equation is a single line (no wrap); the x-range of each `=` cell matches between the two rows (left edges equal within ~1px).
  - Ventus block renders blue; reveal order unchanged.
- Sweep at 1024×768 and 1440×900 for overflow; no external requests; build OK.
