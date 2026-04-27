## Goal

On `/demo`, after the user clicks **"Semantic Enrichment"** and the analysis completes (`phase === "hold"`), the right-side Intel Panel currently shows a divided pill view (Pillar column + Category/Subcategory pill rows) along with the "Behavioral Intelligence: Ready" button.

Replace that pill view with an **enriched transaction table** — same row-by-row format as the `/tepilot` enrichment results table — so prospects see the actual labeling of each transaction (raw input → enriched columns). Keep the **"Behavioral Intelligence" button** and everything that happens after clicking it (persona synthesis, rollup pills, tabs) exactly as-is.

## Scope

Only the **pre-synthesis state** on the right Intel Panel changes. Specifically the block in `src/components/exec-demo/ExecDemoIntelPanel.tsx` rendered when:
- `synthesisTriggered === false`
- `phase === "hold"`
- `chips.length > 0`

This is currently the "Pillar | (Category) Subcategory, Amount | Total" header and grouped pillar rows (lines ~693–775).

The left transaction panel, the Behavioral Intelligence button, the post-synthesis rollups/tabs, and the Next-Offer/Next-Product/Next-Conversation flows all stay unchanged.

## What the new view shows

A scrollable enriched transaction table, one row per transaction. Columns (matching the visual language of `DemoEnrichmentTableView` / tepilot's `ResultsTable`, scaled to fit the panel):

- **Merchant** (normalized merchant name)
- **Amount** (right-aligned, mono)
- **Date**
- **Source** (colored chip: Checking / Cashback Card / Travel Card / Premium Card / HSA / etc.)
- **→** arrow column (visual cue of "enrichment in/out")
- **Pillar** (colored badge using existing `PILLAR_COLORS` / `getColor`)
- **Category**
- **Subcategories** (small chips)
- **Tier** (Budget / Standard / Premium badge)
- **Frequency** (Weekly / Monthly / Occasional / Annually / One-Time badge)
- **Confidence** (% badge, green/yellow/red threshold)

Header row sticky at the top. Rows lightly striped on hover. Light-theme styling consistent with the existing panel (`exec-light-scroll`, slate borders, no dark surfaces).

A short caption above the table:
> "Semantic Enrichment: Every transaction labeled across pillar, category, subcategory, spend tier, frequency, and confidence."

The collapse chevron currently next to "Semantic Enrichment" is preserved so the user can still hide/show the table.

## Data source

The enriched per-transaction data is already present on the page — it's built from the `classify-transactions` SSE response and stored as `EnrichedTransaction[]` on `ExecDemoPage` (`classifiedRef.current`). Today it's only consumed indirectly via `processedSignals` / `chips`.

Plan:
1. Surface the enriched transaction list to `ExecDemoIntelPanel` as a new optional prop `enrichedTransactions?: EnrichedTransaction[]`.
2. In `ExecDemoPage.tsx`, store `classifiedRef.current` into a state (e.g. `enrichedTxs`) on the SSE `done` event so React re-renders, and pass it down.
3. In the panel's pre-synthesis block, render the new table when `enrichedTransactions?.length > 0`; fall back to the current pill view if for some reason enrichment data isn't available yet (defensive).

## New component

Create `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` — a slimmed-down adaptation of `src/components/demo/DemoEnrichmentTableView.tsx` tailored to the panel width, accepting `transactions: EnrichedTransaction[]`. Reuse:
- `PILLAR_COLORS` color logic (via `getColor` already exported from `ExecDemoIntelPanel`)
- Existing `SOURCE_COLORS`, `getTierColor`, `getFrequencyColor`, `getConfidenceColor` styling patterns from `DemoEnrichmentTableView`
- Light enterprise theme tokens already used in the panel

This keeps the change localized and avoids touching the heavier tepilot ResultsTable.

## What stays the same

- Left panel (`ExecDemoLeftPanel`) — unchanged.
- "Semantic Enrichment" run button — unchanged.
- "Behavioral Intelligence: Ready" pulsing button at the bottom of the panel — unchanged.
- Post-click flow: persona synthesis, rollup pills, Next-Offer / Next-Product / Next-Conversation tabs, phone mockups, AI assistant — all unchanged.
- Animations, color tokens, scrollbar styling — unchanged.

## Files touched

- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — replace the pre-synthesis pill block (~lines 693–775) with the new enriched table component; add `enrichedTransactions` prop.
- `src/pages/ExecDemoPage.tsx` — add `enrichedTxs` state, set it from the classify SSE `done` handler, pass to the panel.
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` — **new** file containing the table.

No DB, edge function, or backend changes.
