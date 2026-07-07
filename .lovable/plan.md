## Goal
Clicking an External Intelligence life-event pill should surface a dedicated row in the enrichment table. Currently no row appears because the synthetic evidence merchant (e.g. "Toyota Financial Services") isn't in the customer's CSV.

## Approach
Render a distinct "External Intelligence" row per external signal at the bottom of the enrichment table. This row does NOT follow the transaction schema — no merchant name, no amount, no MCC, no source badge. It's a signal row, styled differently, that the pill click targets.

## Row format (new)
Full-width row spanning the table, visually separated from transactions:

```
[External Intelligence]  Car loan renewal in ~2 months   Bureau Tradeline · Toyota Financial Services   92%
```

- Left: violet "External Intelligence" chip (replaces pillar column).
- Middle: signal headline (`s.headline`) + subline (`s.detail`).
- Right: provider chip (`s.provider`) + confidence %.
- No date, merchant, description, MCC, amount, category, subcategory, tier, or frequency columns for these rows.

## Changes

### 1. `src/lib/externalIntelligenceSignals.ts`
No new helper needed for enrichment rows — signals are passed through as-is.

### 2. `src/pages/ExecDemoPage.tsx`
Memoize `externalSignals = getExternalSignalsFor(customerId)` and pass as a new `externalSignals` prop into `<ExecDemoIntelPanel />`.

### 3. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Accept `externalSignals?: ExternalIntelSignal[]`.
- Pass through to `<ExecDemoEnrichmentTable externalSignals={externalSignals} />`.
- Extend pill-click match logic (~line 625): when the active pill's `event_name` matches an external signal, set `highlightedIndices` to a sentinel range referring to external-signal rows (e.g. negative indices `-1, -2, …` mapped to signal position). Table interprets negatives as external rows.

### 4. `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- New prop `externalSignals?: ExternalIntelSignal[]`.
- After the last transaction row, render one `<ExternalSignalRow>` per external signal, using the layout above (no per-column cells; uses `colSpan` across the transaction columns).
- Highlight logic: when `highlightedIndices` contains a negative index, the matching external row uses the accent border/tint and transaction rows dim; conversely, positive indices dim external rows.
- Style: violet accent (`bg-violet-50/40` row background, `text-violet-700` chip) so it reads as a different data class from bank transactions.

## Acceptance
- After analysis, one External Intelligence row appears at the bottom of the enrichment table per signal in `EXTERNAL_INTEL_SIGNALS`.
- Row shows headline + detail + provider + confidence — no merchant/amount/MCC columns.
- Clicking the External Intelligence life-event pill highlights that row and dims transaction rows.
- Clicking "Clear" restores full view.
- Adding a second entry to `EXTERNAL_INTEL_SIGNALS` renders a second row automatically.
- Downstream data (persona, product cards, Next-Offer, risk) unchanged.