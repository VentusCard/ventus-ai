

# Double-Wide Travel & Exploration Pillar Card

## Concept
Make the "Travel & Exploration" card span 2 columns in the pillar grid, splitting it into two halves inside a single purple-tinted card:

- **Left half**: The existing pillar stats (total spend, transaction count, percentage, sparkline) -- the "as-is" view
- **Right half**: A trip summary showing **# of trips detected** and **total trip spend**, with a small plane/map icon for visual flair

Both halves live inside one card with a subtle purple background tint, making it visually distinct from the other single-width cards.

```text
+---------------------------+---------------------------+
|  Travel & Exploration     |  Detected Trips           |
|  ════════════════════     |  ✈ 3 trips                |
|  $2,450                   |  $1,890 total trip spend  |
|  42 trans. · 18.2%        |                           |
|  ▂▅▃▇▄▆▂▅                |  [view details →]         |
+---------------------------+---------------------------+
```

## Technical Changes

### File: `src/components/tepilot/insights/PillarExplorer.tsx`

1. **Detect the Travel pillar** during the `.map()` render loop
2. **Add `col-span-2`** to the Card's className when the pillar is "Travel & Exploration"
3. **Split the CardContent into a 2-column inner grid** (`grid grid-cols-2 gap-4`) for Travel only:
   - Left column: existing stats (pillar name, spend, transaction count, percentage, sparkline)
   - Right column: new trip summary panel showing:
     - "Detected Trips" label
     - Trip count from `groupTransactionsByTrip(transactions).length`
     - Total trip spend (sum of all trip transactions)
     - A small `Plane` icon from lucide-react
4. **Subtle purple tint**: Apply `bg-purple-50/50` (or similar) to the Travel card background instead of plain white, so it feels cohesive
5. **Compute trips once** at the top of the component (before the map), memoized, so the right-half summary doesn't re-run `groupTransactionsByTrip` on every render
6. For non-Travel pillars, rendering stays exactly the same (single column, white bg)

### No other files need changes
- `groupTransactionsByTrip` is already exported from `TravelTimeline.tsx`
- The expanded detail view (with the Categories/Trips toggle) remains unchanged when the card is clicked

