

## Restructure Network Diagram: 4-Column Layout with Bank Analytics → Consumer Views

### What Changes

Replace the current 3-row grid (each with 2 side-by-side nodes) with a **4-column flow**:

```text
TX Cards → Engine → Bank Analytics (3 rows, 2 items each) → Consumer Views (3 single cards)
```

**New structure after Engine:**

| Pillar (Question) | Bank Analytics (Col 3) | Consumer View (Col 4) |
|---|---|---|
| Profiling: "Who are they..." | Behavioral Analytics, Outflow Analysis | Personalized UX |
| Predictive: "What will they spend..." | Reward Intelligence, Locational Experience | Consumer Rewards |
| Phase: "Where are they in their journey..." | Life Event Intelligence, Financial Journey | Wealth Management |

### New Node Types

Add to `DemoNodeType`: `"outflow" | "locational" | "lifeEventIntel"`

These route to existing views when clicked:
- `outflow` → opens `analytics` (dashboard tab, same as Behavioral Analytics)
- `locational` → opens `travel` (reward intelligence tab)
- `lifeEventIntel` → opens `wealth` (life events tab)

Update `PERIPHERAL_NODES` in `useDemoEnrichment.ts` and `NODE_TITLES` / `BANK_WIDE_NODES` / `BANK_WIDE_TAB_MAP` in `DemoDetailOverlay.tsx` to include the new aliases.

### Layout Geometry

Replace the single `GRID_WIDTH` zone with two zones:
- **Bank column** (~40% of remaining space): 3 rows, each containing a pillar question header + 2 compact bank node buttons stacked or side-by-side
- **Consumer column** (~25% of remaining space): 3 rows, each with 1 consumer node button, vertically centered on its bank row

Horizontal positions become:
```text
txCenterX → engineCenterX → bankColLeftX → consumerColLeftX
```

SVG connections:
- Engine → 3 bank rows (existing bezier pattern, just target bankColLeftX)
- Each bank row → its consumer card (short horizontal bezier from bank row right edge to consumer card left edge)

### Dynamic Sizing

All widths/heights scale with `scale` factor (1.25x when centered). Column widths derived from `dims.w` percentages with `Math.max` floors. Row heights use existing `BASE_GRID_ROW_HEIGHT * scale` pattern.

### Data Model

Replace `PILLARS` with a new structure:

```typescript
interface PillarRow {
  id: string;
  subtitle: string;
  icon: typeof Search;
  color: string;
  bankNodes: NodeDef[];  // 2 bank-facing nodes
  consumerNode: NodeDef; // 1 consumer-facing node
}

const PILLAR_ROWS: PillarRow[] = [
  {
    id: "profiling", subtitle: "Who are they...", color: "#3b82f6",
    bankNodes: [
      { id: "analytics", label: "Behavioral Analytics", audience: "bank" },
      { id: "outflow", label: "Outflow Analysis", audience: "bank" },
    ],
    consumerNode: { id: "engagement", label: "Personalized UX", audience: "consumer" },
  },
  // ... predictive, phase
];
```

### Files Modified

1. **`src/components/demo/DemoNetworkDiagram.tsx`** — Full restructure of layout, data model, SVG paths, and node rendering
2. **`src/hooks/useDemoEnrichment.ts`** — Add new node types to `DemoNodeType` union and `PERIPHERAL_NODES`; map new nodes' readiness to their parent node's readiness
3. **`src/components/demo/DemoDetailOverlay.tsx`** — Add new node types to `NODE_TITLES`, `BANK_WIDE_NODES`, `BANK_WIDE_TAB_MAP` so clicking them opens the correct view
4. **`src/pages/DemoPage.tsx`** — Add new node types to `NODE_ORDER`

