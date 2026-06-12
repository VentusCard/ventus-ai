Remove the Sankey flow diagram (`EnrichmentIncomeFlowSankey`) that currently renders directly above the enriched transaction table on the `/demo` page.

**File to edit:**
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

**Change:**
- Delete the `<EnrichmentIncomeFlowSankey enriched={enrichedTransactions || []} />` line inside the `!activeTab` conditional block (around line 931).
- Simplify the surrounding JSX from a `<>...</>` fragment with a ternary to a direct `!activeTab && (...)` expression so the `ExecDemoEnrichmentTable` remains but the Sankey graph is gone.

No other UI or logic changes.