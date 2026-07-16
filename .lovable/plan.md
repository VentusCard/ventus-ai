## Fix 1 — Pill label: "1 txn" → "1 signal" for external life events

**File:** `src/components/exec-demo/ExecDemoIntelPanel.tsx` (life-event pill render around line 649-669)

- Detect whether the current life event comes from `externalSignals` by matching `event_name`.
- If external: render `{confidence}% · 1 signal` (no "txns"/pluralization; count = external evidence entries which is always 1 for now, but use the length so it stays dynamic).
- If not external: keep existing `{evCount} txn{s}` behavior.

## Fix 2 — Clicking an external pill shows a dedicated "External Source" view instead of the (dimmed) transaction table

**Files:**
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` (already passes `activeExternalSignalId` down — reuse)

When `activeExternalSignalId` is set:
- Replace the transaction table body with a dedicated **External Intelligence detail panel**:
  - Violet header strip: "External Intelligence Signal · not from your transaction feed" with a Clear button.
  - Large card showing: provider chip, category, headline, detail, confidence %, and a "Why this matters" list drawn from `talking_points`.
  - A small "Evidence" section rendered as a non-transactional data row (labelled "Bureau tradeline record" rather than a merchant row) so it's visually clear this did not come from bank feed.
- The normal transaction table (raw + enriched columns) is hidden while an external signal is active, avoiding the "empty dimmed table" look.
- Clearing the pill restores the standard table.

Behavioral pills (non-external) continue to render the standard highlighted-row table as today.

## Result

- The external "Car Loan Renewal" pill reads `92% · 1 signal`.
- Clicking it swaps the enrichment table for a distinctive violet External Intelligence panel instead of a mostly-dimmed transaction table.
