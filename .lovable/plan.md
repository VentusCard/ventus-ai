

## Fix Card Element Vertical Alignment

### Problem
When the Trips toggle is active, the trip card (e.g., "New York City") and subcategory cards (e.g., "Hotels & Lodging", "Flights") have different internal content heights. The trip card has an extra date line, causing the dollar amounts, transaction counts, and progress bars to sit at different vertical positions across cards in the same row.

### Solution
Convert both trip cards and subcategory cards to use a `flex flex-col h-full` layout with consistent element positioning:

1. **Title row** -- fixed at top
2. **Dollar amount** -- directly below title
3. **Detail line** -- trip cards show date info, subcategory cards show nothing (use a spacer or min-height to keep alignment)
4. **Transaction count + percentage row** -- pushed to bottom area using `mt-auto`
5. **Progress bar** -- anchored at the very bottom

### File Changed
`src/components/tepilot/insights/PillarExplorer.tsx`

### Technical Details

**Trip card (lines 242-265):** Restructure to `flex flex-col h-full` with `mt-auto` on the bottom group (transactions row + progress bar).

**Subcategory card (lines 278-325):** Same `flex flex-col h-full` structure with `mt-auto` on the bottom group, so elements align with trip cards even though subcategory cards lack the date line.

Both card types will share this internal structure:
```text
+---------------------------+
| Title (font-medium)       |
| $Amount (text-xl bold)    |
| [date line or empty space]|
|         (flex-1 spacer)   |
| transactions   % of pillar|
| [====progress bar=======] |
+---------------------------+
```

The `flex-1` spacer between the middle content and the bottom group ensures that regardless of how many lines of content each card has, the transaction count and progress bar always align across cards in the same row.
