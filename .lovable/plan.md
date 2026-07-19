## Change

In `src/components/exec-demo/NextConversationRationale.tsx`, restructure the `PipelineSliver` so "Ingest" and "Hands Off To" each occupy their own full-width row instead of sitting side-by-side in a 2-column grid.

## Details

Current layout: a single `grid grid-cols-2 divide-x` card with the two sections in adjacent columns, causing the pill row to be cramped and truncated.

New layout: same outer card, but stacked as two rows separated by a horizontal divider — each row spans full width so all pills fit on one line without truncation.

```text
┌──────────────────────────────────────────────┐
│ INGEST   [pill] [pill] [pill] [pill] ...     │
├──────────────────────────────────────────────┤
│ HANDS OFF TO   [pill] [pill] [pill] ...      │
└──────────────────────────────────────────────┘
```

Implementation: replace the `grid grid-cols-2 divide-x` container with a `flex flex-col divide-y` container. Keep icon + label + pills styling identical; only the axis changes.

No other files affected.