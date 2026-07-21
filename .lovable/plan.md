## Problem

The "Home Purchase / Transition" Life Event pill shows "4 signals" and does nothing when clicked — no rows highlight in the enrichment table.

## Root cause

The pill labels itself with `evt.evidence.length` (falling back to "N signals") whenever `transaction_indices` is empty, but the click handler only passes `transaction_indices` to the table. Empty array in → nothing highlighted.

`transaction_indices` end up empty because `synthesize-persona`'s `cleanIndices` strips any index whose upstream `txnOwner` tag is not `"life_event"` or `null`. A Home Depot / realtor / moving-services spike often gets pre-tagged `spending_habit` upstream, so all four of the LLM's chosen rows get filtered out. The event still passes the `evidence.length >= 2` survival bar, so the pill renders — but it has zero indices to click through to.

Per the standing rule ("drop all frontend computes"), the fix belongs in the backend, not fuzzy-matching in the panel.

## Fix — backend only

In `supabase/functions/synthesize-persona/index.ts`, when constructing `filteredLE` (around lines 844-850):

1. After `cleanIndices(..., ["life_event"])`, if the result is empty **and** the raw LLM `transaction_indices` are non-empty, retry with a widened allow-list `["life_event", "spending_habit"]` (still excluding `"risk"`, `"financial_signal"`, `"demographic"` to preserve the priority ladder against higher tiers).
2. Only apply the widened rescue when the event survives the `evidence.length >= 2` bar — so we don't resurrect noise.
3. The rescued indices then flow into `claimedByHigher`, which already causes the Spending Habits rollup pass to skip them, so no double-attribution.

This keeps ownership rules intact for the higher-priority tiers (Financial, Demographic, Risk) while letting a well-evidenced Life Event reclaim rows that upstream had loosely tagged as habitual.

## Guardrails

- No change to frontend logic.
- No change to Financial / Demographic / Risk cleaning.
- Pet-vocab and relocation-travel guards continue to run after the rescue.
- The College-prep demotion path is unaffected.

## Verification

After deploy, on the Sarah-Mitchell-style persona: the "Home Purchase / Transition" pill should render as `4 txns · $X.Xk` (not "4 signals") and clicking it should light up the corresponding rows in the enrichment table.
