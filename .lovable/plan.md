## Goal

Two refinements to the executive demo's pre-synthesis enrichment view:

1. Remove the arrow column and the Confidence column from the table.
2. Make the enrichment table use the **full width** of the surrounding panel — currently the inner persona card (padding, rounded background, border) plus the outer panel padding constrain it to a narrow column.

## Changes

### A. `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

- Remove `arrow` and `conf` keys from the `COL` width map. Tier/freq widths stay as-is.
- Drop the `ArrowRight` import and the `getConfidenceColor` helper (unused).
- Tier-1 grouping header: Raw `colSpan` stays 6, drop the spacer arrow `<th>`, Enriched `colSpan` becomes 5. Replace the spacer column with a `border-r-2 border-slate-300` on the rightmost raw column (Amt) for the visual divide.
- Tier-2 column header row: remove the arrow `<th>` and the Confidence `<th>`. Add `border-r-2 border-slate-300` to the Amt header.
- Each `<tbody>` row: remove the arrow `<td>` and the confidence `<td>`. Add `border-r-2 border-slate-200` to the Amt `<td>`.
- Drop the table `min-w-[1340px]` to `min-w-[1180px]` since two columns are gone.
- Add an optional `flush?: boolean` prop. When true, drop the wrapping div's `border border-slate-200 rounded-lg` so the table sits flush against the surrounding panel edges.

### B. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — full-width enrichment view

Add a new prop `fullWidthEnrichment?: boolean` (true when `phase === "hold" && !synthesisTriggered`). When true:

- Outer panel wrapper (line 351, currently `px-5 py-3`): switch to `px-0 py-3` so the table reaches the panel edges.
- Persona-section wrapper (line 353, currently `rounded-2xl px-4 py-3.5 ... border ... background`): when `fullWidthEnrichment` is true, drop the rounded background, border, and horizontal padding (use `px-5 pt-3.5 pb-0` so only the title block has horizontal breathing room). The table block below the title should render edge-to-edge.
- Title row ("Semantic Enrichment: Reveal behavioral signals…", line 696–701): keep its existing horizontal padding so it's still aligned with the rest of the persona content.
- Table container (line 706): when `fullWidthEnrichment` is true, drop `mb-2.5` constraint and stretch it to `flex-1`. The existing skeleton/table already use `flex-1 min-h-0`.
- Pass `flush={fullWidthEnrichment}` into `<ExecDemoEnrichmentTable />`. For the skeleton wrapper in IntelPanel, conditionally drop `border border-slate-200 rounded-lg` for the same edge-to-edge effect.

Skeleton tweaks to match the new column set:
- Remove the `w-[16px]` arrow placeholder cell from the header row and each row.
- Remove the rightmost `w-[40px]` confidence chip placeholder from each row + matching header placeholder.
- In the tier-1 raw-vs-enriched group bar: drop the 24px arrow gap div; raw side width ~580px, enriched fills the remainder, with a 2px right border on raw.

### C. `src/pages/ExecDemoPage.tsx` (1 line)

Pass `fullWidthEnrichment={showEnrichmentFullScreen}` to `<ExecDemoIntelPanel />` (around line 1025). The flag is already computed.

## Files

- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- `src/pages/ExecDemoPage.tsx`

No data, edge function, or post-synthesis behavior changes.