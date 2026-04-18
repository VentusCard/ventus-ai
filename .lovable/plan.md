

## Question
Should risk detection use **raw CSV data** (pre-enrichment) instead of **enriched data** (post-classification)?

## Short answer
Yes — and it's actually a better fit for risk detection. The risk signals (MCC 7995, MCC 5967, "INTL PAYMENT PROC", structuring patterns) all live in the **raw fields**, not in the enriched output. Enrichment adds noise (pillar/category/tier) that the risk model doesn't need and can be misled by.

## Why raw is better here

The three Sarah flags we want all come from raw fields:
- `DIGITAL ENT SVCS` + MCC `7995` → vice (raw merchant + raw MCC)
- `PRIVATE MEDIA GRP LLC` + MCC `5967` → vice (raw merchant + raw MCC)
- `INTL PAYMENT PROC 8742` + missing/non-US zip → suspicious_international (raw merchant + raw zip)

None of these need `pillar`, `category`, `subcategories`, `spending_tier`, or `purchase_frequency`. Sending the enriched payload actually risks the LLM rationalizing "this is in Entertainment pillar, looks fine" and skipping the flag.

## Plan

### 1. `src/pages/ExecDemoPage.tsx`
- When calling `detect-risk-transactions`, send the **raw CSV rows** (parsed from `customer.csv`) instead of `classifiedRef.current`.
- Reuse the existing CSV parser pattern from `ExecDemoSelectionDialog.tsx` (`parseCsvRows`).
- Payload per transaction: `transaction_id, merchant_name, description, mcc, amount, date, zip_code, home_zip, source`.

### 2. `supabase/functions/detect-risk-transactions/index.ts`
- Simplify `txSummary` to only the raw fields (drop `pillar`, `category`, `subcategory`, `frequency`, `tier`, `normalized_merchant`).
- Tighten the system prompt: remove the "use category/pillar context" guidance since those fields are no longer sent.
- Add a deterministic pre-pass that auto-flags MCC `7995`, MCC `5967`, and merchants matching `/INTL|INTERNATIONAL|FOREIGN|OVERSEAS|OFFSHORE/i` (with non-US/missing zip) — merge with LLM output, dedupe by `transaction_id + category`.

### 3. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Fix risk pill keys: use `${flag.transaction_id}-${flag.category}-${i}` so multiple "vice" flags don't collapse into one pill.
- Match clicked pill to transactions by `flag.transaction_id` instead of merchant name fuzzy match.

## Out of scope
- No schema changes, no new edge functions, no UI redesign.
- Enrichment pipeline untouched — risk detection just runs on a parallel raw payload.

## Files
- `src/pages/ExecDemoPage.tsx`
- `supabase/functions/detect-risk-transactions/index.ts`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

