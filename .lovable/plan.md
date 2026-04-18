

## Goal
Dedupe behavioral persona rollups against detected life events at the source — `synthesize-persona` edge function — so overlapping pills (e.g., "Aspiring Homeowner" alongside "New Home Transition") never enter the pipeline. Also drop the redundant trailing stub in `NextProductRationale.tsx`.

## Changes

### 1. `supabase/functions/synthesize-persona/index.ts`
- Accept new optional `lifeEvents?: { event_name: string }[]` field in the request body alongside `pillars`.
- If present and non-empty, inject a **suppression block** into the system prompt:
  > "The following life events have already been detected for this customer: [comma-separated event_names]. Do NOT generate a `pillar_rollup` label that overlaps thematically with any of these events. For example, if 'New Home Transition' is detected, do NOT produce 'Aspiring Homeowner', 'Home Buyer', or any home-purchase-themed rollup. The life event already covers that theme — skip it entirely. Same applies for education, retirement, new baby, wedding, etc."
- No schema/tool change. Pure prompt-level constraint.

### 2. Wire life events into the call site
Inspect `src/hooks/useDemoEnrichment.ts` (and `ExecDemoLeftPanel.tsx` if needed) to find where `synthesize-persona` is invoked. Two cases:
- **If life events are already detected before persona synthesis** → just pass them in the request body.
- **If not** → reorder the pipeline so life-event detection completes first, then persona synthesis runs with the suppression list. Will determine during implementation.

### 3. `src/components/exec-demo/NextProductRationale.tsx`
Independent UI cleanup:
- Delete the trailing `{matchingEvent && (<span>...{confidence}% · {N} txns</span>)}` block (~lines 267–271). It duplicates info already shown in the main pill.

## Expected result
- "Aspiring Homeowner" and "New Home Transition" no longer appear together — the behavioral rollup is suppressed upstream.
- No trailing "✦Home Purchase 90% · 4 txns" stub.
- Dedup happens at the data layer, applies consistently to every downstream surface (Next-Offer pills, persona panel, phone view, product cards).

## Risk / tradeoff
This is a global suppression — if a customer genuinely has both a strong behavioral pattern AND a related life event, we lose the behavioral pill everywhere. Acceptable per user direction (option A).

## Out of scope
- `generate-product-cards` prompt changes.
- `generate-next-offers` (separate component).
- Phone view auto-rotation.

