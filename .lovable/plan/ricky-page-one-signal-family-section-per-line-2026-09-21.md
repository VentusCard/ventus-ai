# Ricky page: one signal-family section per line

## Goal
On the Ricky page ("ONE CUSTOMER, FIVE SIGNAL FAMILIES" beat, second step), the right panel currently arranges the five signal-family sections in a two-column grid: Behavioral (3 pills) spans the full width, then the remaining four families share two rows two-at-a-time. Change it so each family section starts on its own line, stacked vertically in a single column.

## Change
- `src/components/deckmo/DeckmoDeck.tsx`, in the `Ricky` scene's right section (the pill grid, around line 303):
  - Change the grid from `grid-cols-2` to a single-column layout (`grid-cols-1`), keeping the existing vertical gap and top alignment.
  - Remove the `index === 0 ? "col-span-2"` special case on the `Reveal` wrapper — no longer needed with one column.
- Within a family section, the pills themselves keep their current flex-wrap row (e.g. Behavioral's three pills sit side by side if they fit) — only the family sections move to their own lines.

## What stays the same
- Pill colors (soft pastel tints), the "Ext" chip, staggered Reveal delays, click-to-filter behavior, and the `step > 0` gating (right panel empty on beat 1) are all untouched.
- The left ledger, masthead, and deck tokens are untouched.

## Verification
- `bunx tsgo --noEmit` clean.
- Playwright check at 1540×855 (and one smaller size, 1024×768): each of the five family sections (Behavioral, Life Events, Financial, Demographics, Risk) begins on its own row, no overflow or clipping, pill clicks still filter the ledger.
