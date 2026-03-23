

## Draw Individual Lines from Each Bank Node to Consumer Node

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

Replace the "Bank column → Consumer column" SVG section (around lines 209–222) which currently draws 1 line per row with a nested loop that draws 2 lines per row — one from each bank-facing card.

Each line:
- **Starts** at the right edge of the individual bank node, at its specific Y position: `contentTop + nodeIndex * (BANK_NODE_HEIGHT + BANK_NODE_GAP) + BANK_NODE_HEIGHT / 2`
- **Ends** at the left edge of the consumer node, at the row's center Y
- Uses a natural cubic bezier curve between the two points
- Same color/readiness styling as current

Result: 6 curved lines total (2 per row), each visually connecting a specific bank card to its row's consumer card.

