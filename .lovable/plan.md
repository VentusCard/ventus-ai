

## Extend White Background Panel & Rename Engine

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### What changes

1. **Add a white rounded panel** behind the Engine + Bank-Facing column + pillar question labels. This panel stretches from the engine's left edge to the bank column's right edge, and vertically from above the column headers to below the last row. It gets a subtle border and shadow to visually group these elements as the "enrichment zone."

2. **Rename "Ventus AI Engine"** to **"Advanced Enrichment"** (line 263).

### Implementation

- Insert a new `<div>` (absolute positioned, z-index 0) before the existing Engine button. Its bounds:
  - **Left**: `engineCenterX - ENGINE_WIDTH / 2 - 16` (small padding)
  - **Right**: `bankColLeftX + BANK_COL_WIDTH + 16`
  - **Top**: `gridTopY - 40` (above column headers)
  - **Bottom**: `gridTopY + totalGridHeight + 16`
- Style: `bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm`
- Update the engine title text from `"Ventus AI Engine"` to `"Advanced Enrichment"`

