## Problem

On the last run, "College Preparation" did not appear under the **DEMOGRAPHIC** row even though Sarah Mitchell has clear college-prep transactions (SAT, Kaplan, Common App, Stanford visit, admissions consulting).

Root cause in `supabase/functions/synthesize-persona/index.ts`:
- `college_prep` rows are hint-tagged `owner=demographic` and the prompt tells the LLM to route them there, but nothing enforces it server-side.
- If the LLM omits the demographic entry (or emits it under Life Event, then gets stripped by the RETIRED_UPSTREAM regex), the signal silently disappears.
- There is deterministic auto-promotion for **Pet Care Routine** but no equivalent for **College Preparation** — so the LLM is the single point of failure.

## Fix (edge function only — no UI changes)

Edit `supabase/functions/synthesize-persona/index.ts`:

1. **Demote any LLM-emitted `College Preparation` life event before Life > Demo claim ladder runs.** In the `filteredLE` pipeline, detect `event_name` matching `/college|university|tuition/i` and instead of dropping it, harvest its `transaction_indices` + `evidence` into a synthetic demographic candidate, then remove it from `filteredLE`. This mirrors how pets are force-routed to Spending Habit.

2. **Deterministic Demographic auto-promotion for `college_prep`.** After the existing `filteredDemo` filter block (around line 935), check whether any demographic entry already covers college prep (label matches `/college/i`). If not, scan `txnHints` for indices tagged `college_prep` that are still unclaimed by `claimedByHigher`. If ≥2 such indices exist, push a synthetic entry:
   ```
   {
     category: "household_composition",
     label: "College Preparation",
     direction: "up",
     confidence: 0.85,
     magnitude_band: "",
     evidence_summary: "SAT/prep/application activity clustered in recent months",
     transaction_indices: <those indices, capped at ~8>,
   }
   ```
   Then add those indices to `claimedByHigher` before the Spending Habit pass runs (so college rows never leak into a "Kids Enrichment" habit).

3. **Consistency touch-up:** normalize the synthetic label the same way the existing block does (strip trailing "· Prep Cycle" restatements), and ensure `NON_DEMO_VOCAB` isn't accidentally triggered by the synthetic entry (it isn't — no pet/coffee/etc vocab).

## Out of scope

- No frontend changes; `ExecDemoIntelPanel.tsx` already renders Demographic rows and uses backend `transaction_indices` after the last change.
- No prompt rewrites — the deterministic fallback is the guarantee.
- Auto/mortgage retire logic unchanged (those correctly belong to Financial Signals, which already has a servicer taxonomy).

## Validation

After deploy, re-run the /bankdemo pipeline for Sarah Mitchell and confirm:
- **DEMOGRAPHIC** row shows a `✦ College Preparation` pill with `N txns` reflecting the college_prep-tagged rows.
- Clicking the pill filters the enrichment table to those rows (SAT, Kaplan, Common App, admissions consulting, Stanford parking).
- No duplicate "College Preparation" under LIFE EVENTS.
