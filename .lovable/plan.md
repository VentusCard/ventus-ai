

## Plan: Add Static Headers for First Two Columns

### What
Add "Transactions" and "Enrichment Engine" column headers above the first two columns, matching the existing header style used by "Bank-Facing", "Consumer-Facing", and "Impact".

### Changes — `src/components/demo/DemoNetworkDiagram.tsx`

Add two new header `<div>`s in the Column Headers section (before the existing "Bank-Facing" header around line 482):

1. **"Transactions" header** — positioned at `left: txCenterX - TX_CARD_WIDTH/2`, `width: TX_CARD_WIDTH`, `top: gridTopY - 24`. Same class styling as the other headers.

2. **"Enrichment Engine" header** — positioned at `left: engineCenterX - ENGINE_WIDTH/2`, `width: ENGINE_WIDTH`, `top: gridTopY - 24`. Same class styling.

Both use the existing `centered ? "text-[13px]" : "text-[11px]"` size pattern and `text-slate-500 uppercase tracking-wider` styling.

### Single file modified
- `src/components/demo/DemoNetworkDiagram.tsx`

