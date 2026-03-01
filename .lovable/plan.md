

## Add Trip Summary Text to Travel & Exploration Pillar Card

### What Changes

Inside the Travel & Exploration pillar card (the grid card, not the expanded detail view), add a line below the transaction count that shows the number of detected trips and their destination names.

**Example display:**

```text
Travel & Exploration
$2,450
42 trans. · 18.2%
3 Trips: Miami, Tokyo, London     <-- new line
[sparkline]
```

If there are many destinations, truncate to the first 2-3 with an ellipsis (e.g., "3 Trips: Miami, Tokyo, +1 more").

### Technical Changes

**File: `src/components/tepilot/insights/PillarExplorer.tsx`**

1. **Compute trips once** before the `.map()` loop using `groupTransactionsByTrip(transactions)` (already imported)
2. **Inside the card render for "Travel & Exploration" only**, add a small text line after the existing stats (`trans.` / `%` row) showing:
   - Trip count
   - Comma-separated destination names (truncated to ~3 max, with "+N more" if needed)
3. Style it with a small font (`text-xs`), using the pillar color for subtle emphasis
4. No layout changes -- this is just an extra line of text within the existing card structure

### No other files affected

The `groupTransactionsByTrip` function is already imported. This is a small, contained change to one file.

