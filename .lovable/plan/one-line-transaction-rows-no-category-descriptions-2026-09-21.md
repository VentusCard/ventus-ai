# One-line transaction rows, no category descriptions

## Goal

On the Immediate Value slide's recent-transactions phone tab, every transaction becomes a single line. The category descriptions (e.g. "Fitness · Sports & Active Living", "Utilities · Home & Living") are removed entirely.

## Changes

### 1. `src/components/deckmo/DeckmoRecentTransactionsTab.tsx`

- Each collapsed transaction row collapses to one line: purchase icon, date, clean merchant name, and amount — all on a single line, no second description line.
- Remove `tx.meta` from the row (no category or sub-description text anywhere in the list).
- Amount stays right-aligned and bold; date stays small and muted so the list still reads chronologically.
- Keep the rail chips, purchase icons, expand/collapse animation, expanded detail (pattern, explanation, "Yes, that's mine" button), and reduced-motion behavior unchanged.
- Tighten row padding so six one-line rows fill the phone frame cleanly.

### 2. Data (`src/lib/deckmoScript.ts`)

- No copy changes — `meta` simply stops being rendered; all other fields stay as they are.

## Out of scope

- No changes to the slide's beats, scene layout, callouts, other phone tabs, or navigation.

## Verification

- `bunx tsgo --noEmit` clean and build OK.
- Playwright at 1024×768, 1540×855, 1920×1080: six single-line rows visible, no category text, no truncation issues, expansion still works, no page errors.
