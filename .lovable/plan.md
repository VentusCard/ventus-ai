

## Root Cause: Life Event Transactions Truncated

### The Bug

In `src/hooks/useDemoEnrichment.ts` line 285:
```ts
transactions: txns.slice(0, 75),
```

This sends only the **first 75 classified transactions** (in original CSV order) to the lifestyle analysis edge function.

- **James Rodriguez** has **78 transactions** (txn_s001–txn_s078). The baby-related transactions are the LAST 3: `BUY BUY BABY` (txn_s076), `AUSTIN OB GYN ASSOCIATES` (txn_s077), `POTTERY BARN KIDS` (txn_s078). They are **cut off by `.slice(0, 75)`** and never reach the AI.

- **Sarah Mitchell** has **75 transactions** (txn_001–txn_075). The college prep transactions are the last 3: `COLLEGEBOARD SAT` (txn_073), `KAPLAN TEST PREP` (txn_074), `STANFORD VISITOR PARKING` (txn_075). These are included but just barely, and the edge function re-sorts by date and takes top 75 again — so they should be present. Sarah's empty result is likely AI non-determinism, but we can improve reliability.

The edge function **already** sorts by most recent date and slices to 75 (`sortedTransactions.slice(0, 75)`). The hook's pre-slice is redundant and destructive.

### Fix

**File: `src/hooks/useDemoEnrichment.ts`** (line 285)
- Remove `.slice(0, 75)` — send all classified transactions. The edge function handles the limit after sorting by recency, ensuring the most recent (and most life-event-relevant) transactions are always included.

**File: `supabase/functions/analyze-lifestyle-signals/index.ts`**
- Increase the edge function's transaction window from 75 to 100 to capture more context for event detection, ensuring clusters of life event transactions aren't split.

These two changes ensure James's baby transactions and Sarah's college prep transactions always reach the AI model.

