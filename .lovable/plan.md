## Root cause

The Financial Signals row never renders because the `synthesize-persona` edge function isn't returning any `financial_signals` — even for customers with obvious auto-loan (VW CREDIT) and mortgage rows in the enrichment table.

The prompt tells the LLM: *"Detect a financial_signal when the per-transaction list contains at least ONE transaction whose merchant matches …"* and to attach `[T<n>]` indices from that list.

But the per-transaction numbered block (`txnLines` in `supabase/functions/synthesize-persona/index.ts` around lines 106-118) is filtered to `TXN_LEVEL_PILLARS` only — Travel, Style, Family, Health, Sports, Entertainment, Food. **Financial products (auto loans, mortgages, brokerage, insurance) are not in that set**, so those rows are invisible to the LLM. Zero candidates → zero `financial_signals` returned → the UI's `finSignals.length === 0` guard hides the row.

## Fix (single file)

**`supabase/functions/synthesize-persona/index.ts`**

1. Build a second numbered candidate block, `financialSignalTxnLines`, that walks the same `txns` array with the same `[T<idx>]` indices (so downstream `transaction_indices` still map 1:1 to `enrichedTxs`). Include a transaction when either:
   - its normalized merchant / description contains one of the product-family hint substrings already listed in the prompt (auto loan, mortgage, HELOC, student loan, personal loan, credit-card payoff, brokerage, retirement, insurance, 529), OR
   - its pillar / category is in a small hard-coded financial set (`Financial & Aspirational`, `Financial Services`, plus `Home & Living > Rent & Mortgage`).

2. Emit those rows in a new prompt section right after the existing lifestyle txn block:

   ```
   Financial-signal candidate transactions (use these [T<n>] indices for financial_signals.transaction_indices — never include them in pillar_rollups):
   [T7] VW CREDIT INC · $685 · 2026-08-14 · Financial & Aspirational > General · []
   [T14] ROCKET MORTGAGE · $2450 · 2026-08-01 · Home & Living > Rent & Mortgage · []
   …
   ```

   If the list is empty, skip the block entirely (no `financial_signals` will be produced, which is correct).

3. Tiny prompt tweak in the FINANCIAL SIGNALS section: change "Detect a financial_signal when the per-transaction list contains…" to "Detect a financial_signal when the **financial-signal candidate transactions** block contains…" and remind the model those `[T<n>]` indices are the source of truth.

Everything else — the tool schema, the response normalization (`financial_signals` mapping to `id: fs-<i>`), the client-side `PersonaSynthesis.financialSignals` threading in `ExecDemoPage.tsx`, and the Financial Signals row in `ExecDemoIntelPanel.tsx` (lines 907-963) — already works and stays untouched. This one change unblocks the whole downstream path.

## Verification

After deploying the edge function, re-run the default customer on `/bankdemo` → click **Behavioral Intelligence — Ready** → confirm a 4th "Financial Signals" row appears above Risk Factors, with pills like "Auto Loan · VW Credit" that highlight the VW CREDIT row in the enrichment table when clicked.

## Out of scope

- No UI changes.
- No changes to life-event / risk / pillar-rollup logic.
- No changes to product-card or next-offer generation (they already read `financialSignals` off the persona synthesis).