## Goal
Revert the `CONCURRENCY_LIMIT` change in `supabase/functions/classify-transactions/index.ts` from `6` back to `4`.

## Current State
Line 14 currently reads:
```ts
const CONCURRENCY_LIMIT = 6;
```

## Change
Update line 14 to:
```ts
const CONCURRENCY_LIMIT = 4;
```

## Verification
- Re-read the file to confirm the value is back to `4`.
- Redeploy the `classify-transactions` edge function so the runtime matches the source.

## Scope
This is a single-line revert. No other files or logic will be changed.