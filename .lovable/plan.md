

## Add Two New Cards to the All-in-One Suite Column

### Summary
Add "AI Financial Insights" to the first row (Analytics/profiling section) and "Deal Personalization" to the second row (Rewards/predictive section) of the network diagram's bank-facing column.

### Changes Required

**1. Update `DemoNodeType` union type** (`src/components/demo/DemoNetworkDiagram.tsx`, line 6)
- Add `"aiFinancialInsights"` and `"dealPersonalization"` to the type union

**2. Add nodes to `PILLAR_ROWS`** (same file, lines 42-77)
- Row 1 (`profiling`): add `{ id: "aiFinancialInsights", label: "AI Financial Insights", icon: Brain, color: "#2563eb", audience: "bank" }` to `bankNodes`
- Row 2 (`predictive`): add `{ id: "dealPersonalization", label: "Deal Personalization", icon: Target, color: "#16a34a", audience: "bank" }` to `bankNodes`
- Import `Brain` and `Target` icons from lucide-react

**3. Update `useDemoEnrichment.ts`**
- Add new node IDs to `PERIPHERAL_NODES` array (line 39)
- Update `CONSUMER_DEPS` to include new nodes as dependencies for their respective consumer nodes (engagement depends on aiFinancialInsights; rewards depends on dealPersonalization)

**4. Update `DemoDetailOverlay.tsx`**
- Add entries to `NODE_TITLES` record for the two new nodes
- Add both to `BANK_WIDE_NODES` set

**5. Update `DemoPage.tsx`**
- Add both new node IDs to `NODE_ORDER` array in appropriate positions

### Technical Note
The diagram dynamically calculates row heights based on the number of bank nodes per row. Adding a third node to rows 1 and 2 (matching row 3's count) should render correctly without layout changes, since the existing code already handles 3-node rows (the Relationship row has 3 nodes).

