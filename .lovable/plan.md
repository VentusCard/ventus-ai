## Goal
When a user clicks an external-intelligence pill (e.g. "Car Loan Renewal in ~2 Months"), the enrichment table should look like the normal table but show a **single row** styled distinctly (violet) — plus a **swapped table header** that reads "External Signal" in a violet gradient instead of "Raw Transaction / Semantic Enrichment".

All edits in `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`.

## Changes

1. **Remove the dedicated detail panel** (lines ~154–255). No more full-panel takeover.

2. **When `externalActive` is true, swap the Tier-1 header row** (lines ~296–330):
   - Replace the "Raw Transaction" + "Semantic Enrichment" split with a single `<th colSpan={10}>` that reads:
     - **"External Signal"** in bold uppercase, with sub-label `· sourced from outside data provider`
     - Violet gradient background (e.g. `linear-gradient(90deg, hsl(262 83% 58%) 0%, hsl(258 90% 50%) 100%)`), white text, matching the same shimmer treatment used by the blue enrichment header for visual parity.
   - Keep the Tier-2 column labels unchanged (Source / Date / Merchant / MCC / Desc / Amt / Pillar / Category / Subcategories / Freq) so the row below still aligns.

3. **Render the active signal as one `<tr>`** in the same 10-column schema:
   - **Source**: violet "External" chip (replaces bank card badge)
   - **Date**: `evidence[0].date` or today
   - **Merchant**: `signal.headline`
   - **MCC**: "—"
   - **Description**: `signal.detail`
   - **Amount**: `evidence[0].amount` if present, else "—"
   - **Pillar**: violet "External Intel" pill
   - **Category**: humanized `signal.category`
   - **Subcategories**: `signal.provider` pill
   - **Freq**: `confidence%`
   - Row uses existing `exec-ext-highlighted` styling (violet left border + tinted background).

4. **Suppress the regular transaction rows** while `externalActive` is true (skip the `order.map(...)` output) so the table truly shows one row. Also skip the bottom external-signal summary rows (lines 490–520) in this mode, since the active one is already the sole row.

5. **Keep the top filter strip** as-is (already shows "Showing 1 external signal for '…'" with a Clear button that returns to the full transaction view + original headers).

## Out of scope
- No changes to `ExternalIntelSignal` schema, the intel panel pills, or downstream product/offer generation.
- No changes to routing, tabs, or demo pre-fire logic.

## Verification
Click the "Car Loan Renewal" pill → the table's top grouping header morphs from blue "Semantic Enrichment" split into a violet "External Signal" band, and exactly one violet-tinted row renders below it in the same column layout as a transaction. Clicking "Clear" restores the original headers and full transaction list.
