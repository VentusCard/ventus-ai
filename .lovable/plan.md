# Wider signal-popup table with Rail and Subcategories columns

## What changes

In the Section 4 signal pill pop-ups, the supporting-transactions table gets two new columns and more width:

- **Rail** — new first column on the raw side, showing the payment rail each transaction arrived on (Premium Card, Cashback Card, ACH, Checks, Wire, Zelle), taken from the existing `transaction.source` field.
- **Subcategories** — new column on the enriched side, showing the AI-labeled subcategories from the existing `enrichRickyTransaction()` lookup (e.g. "High-Yield Savings · Recurring Transfer").

## Resulting table layout

```text
Raw Transaction · as received from bank feed   | Enriched output · AI-labeled semantic intelligence
Rail | Date | Description | Amt                | Merchant | Category | Subcategories | Freq
```

- Raw side grows from 4 to 5 columns (Rail first, then Date, Description, Amt).
- Enriched side grows from 3 to 4 columns (Merchant, Category, Subcategories, Freq).
- Group-header colSpans update from 4/3 to 5/4.
- Pop-up width increases from 760px to about 960px (still capped to the viewport) so every row stays on one line.
- One compact row per transaction, truncated cells keep hover tooltips — unchanged behavior.

## Technical details

- File: `src/components/deckmo/RickySignalStory.tsx` only.
- `EnrichedRow` gains a Rail cell (`transaction.source`, moved out of the old "Source" column position) and a Subcategories cell from `enrichRickyTransaction(transaction).subcategories.join(" · ")`.
- `<colgroup>` widths rebalanced for 9 columns; `table-fixed` kept.
- Popover width class changes from `w-[min(760px,...)]` to `w-[min(960px,...)]`.
- No changes to pill styling, the 4.1/4.2 reveal, popover open/close behavior, or any other slide.

## Verification

- Run the deck test suite and typecheck.
- Check the live deck at 1691×1011 and 1376×1011: open a Financial pill (e.g. Goldman Marcus HYSA), confirm Rail is the first column, Subcategories appears on the enriched side, rows stay on one line, and there is no horizontal overflow.
