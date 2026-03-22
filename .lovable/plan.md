

## Problem

The `SHORT_PILLAR` abbreviation map (added in a previous change at your request to fix column width) is converting full pillar names like "Travel & Exploration" to "Travel". You now want the full names back.

## Plan

### Remove the SHORT_PILLAR mapping

In `src/components/tepilot/ResultsTable.tsx`:

1. **Delete** the `SHORT_PILLAR` constant (lines 17–30)
2. **Revert** the badge text from `{SHORT_PILLAR[transaction.pillar] || transaction.pillar}` back to `{transaction.pillar}`
3. **Widen the Pillar column** back from `72px` to `~130px` in the `<colgroup>` to accommodate the longer names, and slightly reduce other columns to compensate

This is a single-file change.

