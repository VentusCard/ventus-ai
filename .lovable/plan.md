
## Goal
Make the Risk Factors pills on `/demo`:
- use exact labels like `Gambling`, `Adult Content`, `Suspicious International`
- stop overlapping onto unrelated transactions
- stop flagging Sarah’s home down payment as risky

## What’s causing it
Two issues are still in the flow:
1. `ExecDemoPage.tsx` is sending `classifiedRef.current` into `detect-risk-transactions`, so risk is still based on enriched transactions instead of the raw CSV evidence.
2. `ExecDemoIntelPanel.tsx` renders pills from broad `category` values (`vice`, `aml`, etc.) and matches rows by merchant-word fuzzing, which causes overlap and vague labels.

## Plan

### 1. Send raw transactions to risk detection
Update `src/pages/ExecDemoPage.tsx` so `fireRiskDetection()` builds the payload from the selected CSV, not from enriched transactions.

Payload should include only raw evidence fields:
- `transaction_id`
- `merchant_name`
- `description`
- `mcc`
- `amount`
- `date`
- `zip_code`
- `home_zip`
- `source`

This gives the risk engine the exact data it needs for gambling/adult/international detection.

### 2. Make risk output specific, not generic
Update `supabase/functions/detect-risk-transactions/index.ts` so each flag returns:
- `transaction_id`
- `category_group`: `vice | suspicious_international | aml`
- `category_label`: human-readable specific label like:
  - `Gambling`
  - `Adult Content`
  - `Suspicious International`
  - `Structuring`
- `severity`
- `merchant`
- `amount`
- `date`
- `reason`

The UI should use `category_label` for the pill text, not the generic group.

### 3. Add deterministic rules for the obvious cases
Before the model call, add hard rules:
- MCC `7995` → `Vice / Gambling`
- MCC `5967` → `Vice / Adult Content`
- merchant names containing `INTL`, `INTERNATIONAL`, `FOREIGN`, `OVERSEAS`, `OFFSHORE` with missing/non-US zip → `Suspicious International`

These should be guaranteed flags, independent of model variability.

### 4. Explicitly suppress false positives for real-estate transactions
Add exclusions so these are not flagged as AML or suspicious by themselves:
- `DOWN PAYMENT`
- `TITLE`
- `ESCROW`
- `MORTGAGE`
- `INSPECTION`
- `HOME PURCHASE`
- `REAL ESTATE`

Also require AML to be a real pattern, not a single large legitimate transaction.

### 5. Fix pill rendering and overlap logic
Update `src/components/exec-demo/ExecDemoIntelPanel.tsx` so:
- pill keys are unique per flag, e.g. `transaction_id + category_label`
- matching uses `transaction_id` first, not merchant keyword matching
- broad pill text like `Vice` is replaced with exact text like `Gambling` or `Adult Content`
- pattern-level AML flags only highlight explicit transaction IDs; if none exist, they should not pretend to map to multiple rows

This removes the current overlapping/highlight bleed.

## Expected result for Sarah
The risk section should show separate pills such as:
- `Gambling`
- `Adult Content`
- `Suspicious International`

And it should not show the home down payment as a risk flag.

## Files to update
- `src/pages/ExecDemoPage.tsx`
- `supabase/functions/detect-risk-transactions/index.ts`
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`

## Technical details
```text
Current:
enriched txs -> risk function -> broad category pills -> fuzzy merchant matching

Planned:
raw csv txs -> deterministic + model risk detection -> specific labels -> transaction_id-based pill matching
```
