The Sankey was added to `/demo` (`DemoEnrichmentTableView`), not the executive demo (`/exec-demo`). It needs to move.

## Changes

1. **Move the file**  
   `src/components/demo/EnrichmentIncomeFlowSankey.tsx` → `src/components/exec-demo/EnrichmentIncomeFlowSankey.tsx` (no internal changes).

2. **Remove from `/demo`**  
   In `src/components/demo/DemoEnrichmentTableView.tsx`, drop the import and the `<EnrichmentIncomeFlowSankey />` render line.

3. **Add to the executive demo**  
   In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, inside the enrichment block around lines 924–948 (the `(pillsExpanded || !activeTab)` branch), render the Sankey directly above `<ExecDemoEnrichmentTable …/>`:
   ```tsx
   <EnrichmentIncomeFlowSankey enriched={enrichedTransactions || []} />
   <ExecDemoEnrichmentTable … />
   ```
   The surrounding wrapper is already `flex flex-col flex-1 min-h-0`, so the Sankey becomes a fixed-height header and the table keeps the remaining vertical space.

## Out of scope
- No styling redesign, no data changes, no other surfaces touched.
