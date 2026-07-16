## Match the External Signal view to the transaction table's visual weight

Comparing the two screenshots, the external-signal view is visually heavier than the standard enrichment table:

- **Tier-1 header band** is a saturated violet gradient at full row height, while the standard table uses a light `bg-slate-100` on the Raw side and a slimmer blue gradient on the Enriched side.
- **Tier-2 column headers** sit on a tinted `bg-violet-50/70` band with heavier violet borders, whereas the standard headers use `bg-slate-50/80` with hairline `border-slate-200`.
- **The single data row** uses `py-2.5` padding and violet-tinted borders, making it feel bulkier than the standard `py-2` rows.

### Changes (all in `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`)

1. **Tier-1 header (external branch, ~lines 219-243)**
   - Keep the "External Signal · sourced from outside data provider" label but render it in the same visual language as the standard Raw/Enriched bar: light slate background on the left portion + a **slim** violet accent chip inline, matching the standard header's font size, padding (`px-3 py-2`), tracking, and border weight.
   - Remove the full-width gradient fill and shimmer overlay so the row height and weight match the standard tier-1 exactly.

2. **Tier-2 column headers (external branch, ~lines 283-289)**
   - Swap `bg-violet-50/70` + `border-violet-200` for `bg-slate-50/80` + `border-slate-200` (same as the standard header row).
   - Keep the label text violet (`text-violet-700`) so the column identity is still clearly "external", but the band, border thickness, padding, and font sizing exactly mirror the standard headers.

3. **Data row (external branch, ~lines 449-499)**
   - Change `py-2.5` cell padding to `py-2` to match standard rows.
   - Replace `border-b border-violet-200` with `border-b border-slate-100` (hairline) — keep the row's soft violet tint via the existing `exec-ext-highlighted` class instead of a heavy border.
   - Keep the violet pills (Source/Provider/Type/Confidence) but align their sizing (`text-[12px]`, `px-1.5 py-0.5`) to the chips used in the standard rows so they don't visually dominate.

4. **Colgroup widths (external branch, ~lines 194-201)**
   - Verify the 5-column widths sum to a similar total as the 10-column standard layout so the table doesn't reflow noticeably when toggling. Adjust the "Signal" column to flex-grow and keep Source/Provider/Type/Confidence to fixed compact widths matching the standard table's chip columns.

### Out of scope

- No changes to which signals appear, their categorization logic, or the pill interactions.
- No changes to the transaction-table branch.
- No color-token changes to `index.css`.

### Result

Toggling between a transaction pill and the external-intel pill will feel like the same table skin with a violet accent, not two different components.
