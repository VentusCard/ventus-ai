## Goal

Eliminate the rolling-scroll animation on the left during initial semantic enrichment. Instead, immediately show the full-width enrichment table with the **Raw Transaction** columns populated from the CSV and the **Ventus Enriched** columns rendered as per-row loading shimmers until the AI returns.

## Behavior change

**Today**
1. User clicks "Semantic Enrichment" → `phase = "scroll"` for ~9s with the left transaction feed rapid-scrolling.
2. After scroll completes → `phase = "hold"` → left panel hides, enrichment table fades in (already populated if AI finished, otherwise an animated skeleton table renders).

**After change**
1. User clicks "Semantic Enrichment" → immediately `phase = "hold"` (skip the `scroll`/`cardScan` phases).
2. Layout switches to full-width enrichment table right away.
3. Enrichment table renders one row per raw CSV transaction:
   - **Raw side** (Source, Date, Merchant, Description, MCC, Amt) — real values from CSV.
   - **Enriched side** (Pillar, Category, Subcategories, Tier, Freq) — small shimmer placeholders per cell.
4. As AI rows stream back, each row's enriched cells fill in (smooth fade swap, no layout shift).
5. Once all rows are enriched + persona synthesis finishes, the existing "Behavioral Intelligence: Ready" affordance appears (unchanged).

## Changes

### `src/pages/ExecDemoPage.tsx`
- **`runAnimationWithProfile`**: drop the `setPhase("scroll")` + scroll/timing scaffolding for the initial enrichment run. Set `phase = "hold"` immediately, populate `processedIndices` with all transaction indices in one go (so downstream consumers stay consistent), and clear `collectedIndices`. The card-scan / cycle phases used for tab reveals are untouched.

### `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- Accept a new optional prop `pendingRows?: Array<{ source?, date, merchant_name, description?, mcc?, amount }>` representing raw rows whose enriched values are not yet available.
- When the component receives **only raw rows** (initial state) or a **mix of raw + enriched rows**, render every row using the same column structure. For rows lacking enrichment data, replace the right-side cells (Pillar / Category / Subcategories / Tier / Freq) with subtle shimmer placeholders (small rounded `bg-slate-100 animate-pulse` blocks sized to match each column width).
- Add a tiny "Enriching…" indicator pill in the table header's "Ventus Enriched" cell while any rows are still pending (small pulsing blue dot + label, matches existing footer style).

### `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Replace the existing skeleton-table fallback (the block that renders fake skeleton rows when `enrichedTransactions` is empty/null pre-synthesis) with a render of `ExecDemoEnrichmentTable` driven by raw transactions passed in as `pendingRows`.
- When `enrichedTransactions` arrives partially or fully, pass the enriched array so per-row swap happens naturally.
- Pass raw transactions through from props (already available as `transactions`) so the table can build its raw row list immediately.

### Data flow
- Raw rows are derived from the same CSV currently parsed by `csvToClassifyPayload` — reuse that parser (or the already-parsed `profile.transactions` enriched with the raw CSV's `description`/`mcc`/`source` fields). No new fetches; data is already in memory when the user clicks "Semantic Enrichment".

## What stays the same
- The full-width enrichment-table layout, chevron toggle, "Behavioral Intelligence: Ready" affordance, and post-synthesis pill rollups.
- The left transaction feed (it just no longer animates during initial enrichment — and continues to be hidden in the full-width state).
- All later phase transitions (`cardScan`, `cardCycle`) for tab reveals after the user picks an action.

## Files touched
- `src/pages/ExecDemoPage.tsx`
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
