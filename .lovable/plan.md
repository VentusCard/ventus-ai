

## Fix Consumer Node Sizing and Question Label Overflow

### Problems
1. **Consumer-facing cards have inconsistent heights** — currently set to `BANK_NODE_HEIGHT * 2 + BANK_NODE_GAP` which ties them to the bank node sizing. They should all be a fixed, uniform height.
2. **Question subtitle text truncates** (`truncate` class) — it should wrap or extend across both the bank and consumer columns so the full question is visible.

### Changes

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

1. **Uniform consumer card height**: Replace the dynamic `consumerNodeHeight = BANK_NODE_HEIGHT * 2 + BANK_NODE_GAP` with a fixed `CONSUMER_NODE_HEIGHT` constant (e.g., `Math.max(70, 80 * scale)`) so all three consumer cards are identical in size.

2. **Question labels span across both columns**: Move the question label `<div>` out of the bank column container and render it as its own absolutely-positioned element that spans from `bankColLeftX` to `consumerColLeftX + CONSUMER_COL_WIDTH`. Remove the `truncate` class and allow text to flow across both columns. Position it above the bank+consumer row with a small margin.

3. **Adjust vertical math**: The bank block and consumer block tops should account for the question label sitting above them (not inside the bank column). Both the bank nodes and consumer card start at the same vertical position below the question label.

### Files Modified
- `src/components/demo/DemoNetworkDiagram.tsx`

