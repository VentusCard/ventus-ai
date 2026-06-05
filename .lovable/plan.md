## Goal

On `/demo`, when the user opens the first node (Ventus AI Engine — Enrichment Output), render a compact Sankey-style diagram **above the enriched transaction table** that visualizes income flowing into spending pillars — derived from the enriched transactions already shown in the table.

## Scope

Single new presentational component, mounted inside `DemoEnrichmentTableView`. No data, hook, routing, or other-node changes.

## What I'll build

1. **New component** `src/components/demo/EnrichmentIncomeFlowSankey.tsx`
   - Props: `enriched: EnrichedTransaction[]`
   - Derivation (client-side, memoized):
     - Split rows with `getFlow(...)` from `@/lib/transactionFlow`.
     - **Left nodes — Income sources**: group income rows by `source` (Checking, Cashback Card, etc.), sum `amount`. Fallback bucket: "Other income".
     - **Right nodes — Pillars**: group spend rows by `pillar`, sum `amount`. Colored via `PILLAR_COLORS` from `@/lib/sampleData`. Hide tiny pillars (<2% of spend) into a single "Other" node to keep the diagram readable.
     - **Links**: one ribbon per (income source × pillar), weight = pillar's share of total spend × source's share of total income (so total flow ≈ total spend, allocating each pillar proportionally across funding sources).
   - Render: inline SVG, ~180px tall, full width of the card.
     - Left column: stacked income blocks, height proportional to amount, labeled with source name + `$x.xk`.
     - Right column: stacked pillar blocks, colored via `PILLAR_COLORS`, labeled with pillar name + amount.
     - Cubic-bezier ribbons between them, fill = pillar color, opacity 0.35, hover → 0.7 with native `<title>` tooltip ("Checking → Food & Dining · $1.2k").
   - Empty state: returns `null` when there are no enriched rows or no income rows.
   - Light-theme styling only (white bg, slate-200 border, slate-600 labels, Manrope inherited).

2. **Wire in** `src/components/demo/DemoEnrichmentTableView.tsx`
   - Inside the existing `customer && ...` block, between `<CustomerHeader />` and `<CustomerTable />`, render:
     ```tsx
     <EnrichmentIncomeFlowSankey enriched={enriched ?? []} />
     ```
   - Wrapper card: `border border-slate-200 border-t-0 bg-white p-3 shrink-0` so it visually attaches under the header and above the table. Table keeps the remaining vertical space (it already uses `flex-1 min-h-0`).

## Technical details

- Pure SVG, no new dependency (avoids recharts Sankey bundle and keeps full control over the strict light theme).
- ~120 LOC including small helpers (`formatMoney`, layout math).
- Reuses existing constants only — no shared-state refactor.

## Out of scope

- Other demo nodes, the enrichment pipeline, sample data, table columns, animations beyond hover opacity.
