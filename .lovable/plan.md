

## Restructure Right Side into 3-Row Grid with Column Headers

### Current Layout (4 columns)
```text
TX Cards → Engine → 3 Pillar nodes → 6 Leaf nodes (2 per pillar)
```

### New Layout (3 columns + grid)
```text
TX Cards → Engine → 3x2 Grid
                     ┌─────────────────────────────────┐
                     │  Consumer Facing │  Bank Facing  │
                     ├─────────────────────────────────┤
                     │ "Who are they…"                  │
                     │ Personalized UX  │ Bank-Wide     │
                     ├─────────────────────────────────┤
                     │ "What will they spend…"          │
                     │ Consumer Rewards │ Travel Exp.   │
                     ├─────────────────────────────────┤
                     │ "Where are they…"               │
                     │ Financial Jrny   │ Wealth Mgmt   │
                     └─────────────────────────────────┘
```

### Changes — `DemoNetworkDiagram.tsx`

#### 1. Remove separate pillar + leaf columns
- Remove the `GAP_PILLAR_LEAF` constant and `leafCenterX` computation
- Replace `GAP_ENGINE_PILLAR` with a single `GAP_ENGINE_GRID` (~280px)
- Compute `gridLeftX` = `engineCenterX + GAP_ENGINE_GRID`
- Remove `PILLAR_WIDTH/HEIGHT`, `LEAF_NODE_WIDTH/HEIGHT`, `LEAF_PAIR_OFFSET` constants
- Define new grid constants: `GRID_WIDTH` (~440px), `GRID_ROW_HEIGHT` (~110px)

#### 2. Replace SVG lines
- Remove "Engine → pillar" and "Pillar → leaf" line sections
- Add 3 new "Engine → grid row" bezier curves, targeting the left edge of each row's vertical center

#### 3. Replace HTML pillar + leaf nodes with a single grid block
- Position one `absolute` div at `gridLeftX` spanning the grid
- Render column headers at top: "Consumer Facing" | "Bank Facing"
- 3 rows, each row contains:
  - Full-width question text (pillar subtitle) in one line
  - Two clickable node buttons side by side (reusing existing button styling)
- All existing click handlers, readiness states, and visual styling carry over to the grid buttons

#### 4. Update `totalContentWidth` calculation
- Was: `TX_CARD_WIDTH/2 + GAP_TX_ENGINE + GAP_ENGINE_PILLAR + GAP_PILLAR_LEAF + LEAF_NODE_WIDTH/2`
- Now: `TX_CARD_WIDTH/2 + GAP_TX_ENGINE + GAP_ENGINE_GRID + GRID_WIDTH/2`

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx` — restructure right side into 3-row grid

