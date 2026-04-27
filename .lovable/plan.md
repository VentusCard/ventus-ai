# Sort highlighted rows to the top of the enrichment table

When a behavioral pill is active, reorder the table so all highlighted (matching) transactions are shown at the top, followed by the dimmed (non-matching) ones, instead of leaving them interleaved in their original position.

## Changes

- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
  - Replace the `Array.from({ length: totalRows }).map((_, idx) => ...)` row loop with a render-order array. When `highlightSet` is non-null, sort that array so indices in the highlight set come first (stable order otherwise — preserves date sequence within each group).
  - Each row still uses its original `idx` for data lookup and the highlight class — only the visual order changes.
  - When the pill is cleared, the order naturally reverts to the default (0..N).

That's it — small, scoped change in one file.
