

## Plan: Always Show Network Diagram with Empty Customer Boxes

**Goal**: The right panel should always display the full network flow (engine, output nodes, connection lines). When customers aren't selected, the left input cards show as empty placeholder boxes instead of hiding everything.

### Changes

**1. `src/pages/DemoPage.tsx`**
- Remove the conditional `{customerA && customerB && (...)}` around `DemoNetworkDiagram`
- Always render `DemoNetworkDiagram`, passing `customerA` and `customerB` as nullable
- Remove the "Select two customers to begin" fallback div

**2. `src/components/demo/DemoNetworkDiagram.tsx`**
- Update Props interface: `customerA` and `customerB` become `DemoCustomer | null`
- Update `TxCard` to accept `customer: DemoCustomer | null`
- When `customer` is null, render an empty placeholder card (dashed border, "Customer A/B" label, muted style) instead of the populated card
- Pass a label prop ("Customer A" / "Customer B") or derive from color to show in the empty state

Everything else (engine node, output section nodes, SVG lines) stays as-is — they already render based on `dims` and don't depend on customer data.

