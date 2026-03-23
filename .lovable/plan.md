

## Replace Legend with Column Headers

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### Changes

1. **Remove the legend block** (lines 385–395) — the `Consumer-Facing` / `Bank-Facing` dot legend at the bottom.

2. **Add two column headers** above the bank and consumer columns, positioned just above the grid:
   - **"Bank-Facing"** header centered over the bank column (`bankColLeftX`, width `BANK_COL_WIDTH`)
   - **"Consumer-Facing"** header centered over the consumer column (`consumerColLeftX`, width `CONSUMER_COL_WIDTH`)
   - Positioned at `gridTopY - 24` (above the first row), styled as small semibold slate text.

3. **Optionally remove** the `AUDIENCE_ACCENT` border-left coloring on cards (amber/blue left borders) if the headers make it redundant — or keep for extra clarity. Will keep for now since they're subtle.

