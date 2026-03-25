

## Increase Vertical Spacing in Network Diagram

### Problem
The 3 pillar rows (each containing 3 bank nodes + 1 consumer node) are vertically cramped. The current `ROW_HEIGHT` is `Math.max(120, 140 * scale)` and `BANK_NODE_GAP` is `Math.max(4, 6 * scale)`.

### Changes

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

1. **Increase `ROW_HEIGHT`** from `Math.max(120, 140 * scale)` to `Math.max(145, 170 * scale)` — gives each pillar row more breathing room.

2. **Increase `BANK_NODE_GAP`** from `Math.max(4, 6 * scale)` to `Math.max(7, 10 * scale)` — adds more space between the 3 bank nodes within each row.

3. **Increase `BANK_NODE_HEIGHT`** from `Math.max(32, 38 * scale)` to `Math.max(36, 42 * scale)` — slightly taller node cards for better readability.

No other files affected.

