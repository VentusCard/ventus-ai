

## Fix: Reduce Pillar Card Heights

### Problem
The top-level pillar cards grid uses `[grid-auto-rows:minmax(180px,auto)]` which allows cards to grow too tall. The `auto` max lets the Travel card (with trip destinations) stretch the entire row.

### Solution
Change the grid row sizing to a fixed or capped height. Replace `minmax(180px,auto)` with just `1fr` so all rows are equal height based on the tallest card's natural content, without an artificial 180px minimum inflating them.

### File Changed
`src/components/tepilot/insights/PillarExplorer.tsx` (line 57)

Change:
```
[grid-auto-rows:minmax(180px,auto)]
```
To:
```
[grid-auto-rows:1fr]
```

This keeps all cards the same height per row (via `1fr`) without the 180px minimum that forces them taller than needed.
