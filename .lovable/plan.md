

## Stage-Ready Network Diagram: Centered + Scaled When Panel Collapsed

### Problem
When the left panel collapses, the diagram content stays small and left-biased instead of expanding to fill the full screen for a stage presentation.

### Approach
The `centered` prop already receives `panelCollapsed` from DemoPage. Use it to scale up all elements and center the content when the panel is collapsed.

### Changes — `DemoNetworkDiagram.tsx`

**1. Scale factor based on `centered` prop**
- When `centered` is true (panel collapsed), apply a scale multiplier (~1.25) to all size constants:
  - `TX_CARD_WIDTH`, `ENGINE_WIDTH`, `GRID_WIDTH`, `TX_CARD_HEIGHT`, `ENGINE_HEIGHT`, `GRID_ROW_HEIGHT`, `GRID_HEADER_HEIGHT`
- Font sizes in the grid and engine also scale up (e.g., 11px → 13px, 9px → 11px, 10px → 12px)

**2. Centering logic**
- When `centered`, compute `totalContentWidth` (sum of TX + gaps + Engine + gaps + Grid) and offset everything with `offsetX = (dims.w - totalContentWidth) / 2` so the entire flow sits in the horizontal center
- Vertical spread for TX cards increases (55 → 70) for better spacing at larger scale

**3. Scaled typography classes**
- Use the `centered` boolean to toggle between small (current) and larger font/icon sizes throughout:
  - Column headers: 10px → 12px
  - Pillar subtitles: 9px → 11px
  - Node labels: 11px → 13px
  - Node icons: w-3.5 → w-4.5
  - Engine "V" icon: w-11 → w-14
  - TxCard text: 11px → 13px, 9px → 11px

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx`

