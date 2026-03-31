

## Make Consumer Cards Match Feature Card Heights + Add Grouping Border

### File: `src/components/demo/DemoNetworkDiagram.tsx`

### Change 1: Make consumer cards taller to match bank nodes
Currently each consumer card uses `CONSUMER_NODE_HEIGHT` (54-70px), while the bank column has 3 stacked cards totaling ~120px. Change the consumer card to use `contentHeight` (which already equals `Math.max(bankNodesHeight, CONSUMER_NODE_HEIGHT)`) so it stretches to match the associated feature cards.

- Lines 414-417: Change `top` to `contentTop` (remove the centering offset) and `height` to `contentHeight` instead of `CONSUMER_NODE_HEIGHT`

### Change 2: Add a dynamic grouping border around all consumer cards
Add a single container `div` that wraps all visible consumer cards with a rounded border, positioned from the first consumer card's top to the last one's bottom. This uses `visibleRows` to dynamically size based on how many rows (1, 2, or 3) are active.

- After line 441 (after the `visibleRows.map` block), add a new absolutely-positioned div spanning from the first row's `contentTop` to the last row's `contentTop + contentHeight`, at `consumerColLeftX`, with a subtle dashed or solid border and rounded corners.

### Summary
- 2 changes in 1 file
- Consumer cards stretch to full row height
- A dynamic border groups all visible consumer cards together

