# Fix: Drop All Frontend Compute for Pill Attribution

## Problem

Pills in the intel panel (Life Events, Spending Habits, Financial, Demographic) are re-deriving their transaction attribution, counts, and spend totals on the frontend — using fuzzy merchant substring matching and ad-hoc reductions. This produces false matches (e.g. "Relocation" pill lighting up a Hilton Waikoloa row) and inconsistent totals versus the backend.

The backend (`synthesize-persona`) already emits authoritative `transaction_indices`, `totalCount`, and `totalSpend` for every signal, cleaned through the ownership ladder (`cleanIndices`). The frontend should render those verbatim.

## Fix

`src/components/exec-demo/ExecDemoIntelPanel.tsx`

Remove every frontend derivation of pill data and read directly from the backend payload:

1. **Life Event pills (L820–847)**
   - Delete `evidenceMerchants` + `matchedIndices` fuzzy merchant matcher.
   - Use `evt.transaction_indices` as the click payload.
   - Use `evt.transaction_count` / `evt.total_spend` (backend-provided) for the pill sublabel; fall back to `evidence.length` / summed `evidence.amount` only when the backend omits them (external signals).

2. **Spending Habit rollups (L462–473, rollup click handler ~L740–780)**
   - Delete the client-side `catMap` category-breakdown reduction and the `toAmount` re-sum over `matchedIndices`.
   - Use `r.txIndices`, `r.totalCount`, `r.totalSpend` as-is.
   - Drop the ownership double-check filter (`allClaimed`) — the backend already enforces the ladder.

3. **Financial Signal pills (~L1063)** and **Demographic pills (~L1141)**
   - Already use `transaction_indices` / backend fields — audit for any residual client re-computation of counts, spend, or labels and remove.

4. **Consumer-chat context builder (L519+, `filteredDetectedLifeEvents.forEach`, category grouping)**
   - Remove client-side category/subcategory grouping. Use backend `evidence_summary` / `talking_points` strings directly.

5. **`toAmount` helper**
   - Remove if no callers remain after the above. Otherwise keep only for display formatting, never for attribution/summation.

## Non-goals

- No backend changes.
- No UI/UX restructuring — pills, colors, hover, and click behavior stay identical.
- External-signal pills (bureau path) continue to render with empty indices as today.

## Files touched
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
