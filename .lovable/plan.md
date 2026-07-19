## Goal
Keep the existing "Pet Care Routine" spending-habit pill as-is (no forced promotion), but ensure pet vocabulary can only surface in the **Spending Habits** row of the /bankdemo intel panel — never Life Event, never Financial Signal, never Demographic.

## Current state
- Backend already routes pet-tagged rows to `owner=spending_habit` and blocks their indices from Life Event / Financial Signal / Demographic via `cleanIndices`.
- Backend already has a `NON_DEMO_VOCAB` label/vocab kill-switch — but it only runs on **Demographic**. Life Event and Financial Signal buckets can still emit pet-themed labels (e.g. "New Pet Adoption") when the LLM writes them with zero pet indices or borrows a non-pet evidence row.
- Frontend `NON_DEMO_VOCAB_RE` in `ExecDemoIntelPanel.tsx` guards Demographic only.

## Changes

### 1. `supabase/functions/synthesize-persona/index.ts`
- Extract the existing `NON_DEMO_VOCAB` regex into a shared `PET_VOCAB` regex (narrower — just pet terms: pet, chewy, petco, petsmart, banfield, barkbox, rover, vet, veterinar, groom, dog walk).
- Apply `PET_VOCAB` as a hard reject on:
  - `filteredLE` — drop any life event whose `event_name`, `evidence_summary`, or any `evidence[].merchant` matches.
  - `filteredFS` — drop any financial signal whose `label`, `product_family`, `servicer`, or `evidence` matches.
- Leave the existing broader `NON_DEMO_VOCAB` on Demographic unchanged.
- Leave `filteredSH` and the existing pet-orphan auto-promotion untouched (user confirmed pet is already picked up as Spending Habit).

### 2. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Add a defensive `PET_VOCAB_RE` filter that drops any Life Event pill and any Financial Signal pill whose visible label/evidence text matches pet vocab. Belt-and-suspenders in case the LLM regresses before the edge function redeploys.
- Do not touch the Spending Habits render loop.

## Out of scope
- No changes to pet promotion thresholds.
- No UI redesign; no color changes.
- Other lifestyle categories (fitness/coffee/streaming) keep today's behavior.
