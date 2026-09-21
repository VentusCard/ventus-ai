# Show date + original description on each transaction row

## Goal

On the Immediate Value slide's recent-transactions phone tab, the second line of each collapsed transaction row (currently "Today · Fitness · Sports & Active Living") should instead show the date and the original pre-enrichment statement description (e.g. "Today · TST*COURTSIDE NYC"). Since the raw description is now visible in the row, the expanded detail no longer repeats it.

## Changes

### 1. `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`

- Collapsed row, second line: replace `{tx.date} · {tx.meta}` with `{tx.date} · {tx.raw}`.
- Render the raw description in the raw-transaction mono font (`ui-monospace` stack, per project typography rule) with a slate-500 tone, keeping it truncated so long strings never wrap the row.
- Expanded detail: remove the "Original statement" label and the struck-through raw line (now redundant). Keep the pattern line, the explanation, and the "Yes, that's mine" button as-is.
- Keep the category info by moving `tx.meta` into the expanded detail as a small category line (e.g. "Fitness · Sports & Active Living") above the pattern, so no information is lost.
- Preserve rail chips, purchase icons, expand/collapse animation, and reduced-motion behavior.

### 2. Data (`src/lib/deckmoScript.ts`)

- No copy or data changes — `date`, `raw`, `meta`, `pattern`, and `explanation` fields stay exactly as they are.

## Out of scope

- No changes to the slide's beats, scene layout, callouts, other phone tabs, navigation, or the deck's light theme tokens.

## Verification

- `bunx tsgo --noEmit` clean and build OK.
- Playwright at 1024×768, 1540×855, 1920×1080: each collapsed row shows "date · raw description" in mono, no truncation issues, expansion still reveals pattern/explanation/button, no page errors.
