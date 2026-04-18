

## Issue
Risk pills are showing duplicates: two "Gambling" pills (high + medium) appear because the deterministic pre-pass and the LLM both flag the same MCC 7995 transaction, and dedupe by `transaction_id + category_label` isn't catching it (likely the LLM returned it without `transaction_id`, or with a slightly different label like "Gambling" vs "gambling").

## Root cause
In `supabase/functions/detect-risk-transactions/index.ts`:
1. Deterministic pre-pass flags MCC 7995 → `Gambling` (high)
2. LLM also flags the same merchant → `Gambling` (medium), possibly with `transaction_id: "pattern"` or missing/mismatched ID
3. Dedupe key `${transaction_id}::${category_label}` lets both through

## Fix

### Single change: stronger dedupe in `detect-risk-transactions/index.ts`

**Step 1 — tell the LLM not to re-flag deterministic cases**
Update the user prompt to pass the list of `transaction_id`s already flagged deterministically and explicitly instruct: "Do NOT re-flag these IDs — they are already handled."

**Step 2 — tighten dedupe logic**
Change `dedupeFlags` to dedupe by:
- `transaction_id + category_group` (not `category_label`), so case/wording variations of the same group on the same tx collapse
- Plus a secondary pass: for any flag where `transaction_id` matches a deterministic flag, drop the model version entirely (deterministic wins)
- Normalize `category_label` to title case before comparing

**Step 3 — frontend safety net in `ExecDemoIntelPanel.tsx`**
Add a final client-side dedupe before rendering pills using `${transaction_id}::${category_group}` as the key, so even if the backend slips a duplicate through, the UI shows only one pill per (transaction, group) pair.

## Files
- `supabase/functions/detect-risk-transactions/index.ts` — prompt + dedupe logic
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — client-side dedupe safety net

## Out of scope
- No changes to pill styling, matching, or the rest of the risk flow
- No schema or payload changes

## Expected result for Sarah
Exactly 3 pills:
- `Gambling` (high)
- `Adult Content` (medium)
- `Suspicious International` (medium)

