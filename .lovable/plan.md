
Fix the rollup pill txn count by removing the current “double-calculation” and using one source of truth.

- Why it’s happening
  - Right now the rollup count shown in `ExecDemoIntelPanel.tsx` is re-calculated from the currently rendered chips (`processedSignals`).
  - But the rollup itself is created earlier in `ExecDemoPage.tsx` from the AI-classified grouped transactions.
  - Those two datasets can drift because of:
    - MCC fallback vs AI-classified signals
    - animation timing / partial chip state
    - imperfect `category_indices` from the AI response
  - Result: the rollup pill under-counts even though the underlying rollup has more transactions.

- Implementation plan
  1. `src/pages/ExecDemoPage.tsx`
     - When converting `data.pillar_rollups`, build the rollup from authoritative grouped data only.
     - Resolve contributing groups using:
       - valid `category_indices`
       - plus exact same-pillar matches from `r.categories` as a fallback/supplement
     - Deduplicate everything and compute final rollup fields:
       - `categoryIndices`
       - `txIndices`
       - `totalCount` = unique transaction count
       - `totalSpend`
  2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
     - Extend `PillarRollup` to carry `totalCount` and `totalSpend`.
     - Stop recomputing rollup stats from `chips`.
     - Render the rollup pill count directly from `rollup.totalCount`.
  3. Keep filter + count perfectly aligned
     - Use the same `txIndices` array for both:
       - the number shown on the rollup pill
       - the left-panel filtered transaction set
     - That guarantees the pill count matches what gets highlighted.
  4. Hardening
     - If a rollup resolves to zero matched groups after normalization, do not render it.
     - Tighten `supabase/functions/synthesize-persona/index.ts` prompt so `category_indices` must fully cover every listed category, but keep the client-side fallback so the UI stays reliable even when the model is imperfect.

- Expected result
  - The rollup pill shows the real number of transactions in that rollup.
  - No more frequent under-counting.
  - The displayed count, the rollup label, and the left-panel highlights stay in sync.

- Technical note
  - This is mainly a consistency bug: the UI currently has two sources of truth for the same rollup. The fix is to normalize once in `ExecDemoPage.tsx` and reuse that exact rollup payload everywhere else.
