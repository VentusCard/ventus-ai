

## Problem
Currently `generate-next-offers` has TWO separate code paths:
- **Behavioral rollups** (from `persona.pillarRollups`) — uses `SYSTEM_PROMPT`
- **Life events** (from `lifeEvents`) — uses a different `LIFE_EVENT_SYSTEM_PROMPT` and a separate normalization branch

This duality is fragile: life event groups come back with different field shapes, the `pillar` value is hardcoded to `"Life Event"`, and the downstream filter in `NextOfferRationale.tsx` has to special-case `pillar === "Life Event"` — which is exactly what's been breaking the Life Event pill filter.

The user wants a single, uniform input: **just rollup pills, treated identically regardless of origin**.

## Plan

### 1. `supabase/functions/generate-next-offers/index.ts` — simplify to one path

- Remove `LIFE_EVENT_SYSTEM_PROMPT`, the `lifeEvents` body field, the second gateway call, and the life-event normalization branch.
- Edge function accepts ONE input: an array of rollup pills, each with shape `{ label, pillar, categories?, topMerchants?, totalCount? }`.
- One system prompt, one gateway call, one normalization. Output `rollupOffers` exactly mirrors input — same `label` → `rollup`, same `pillar` → `pillar`.
- Drop the rule that says `pillar="Life Event"` for life-event rollups. Whatever `pillar` the caller sends is what gets returned.

### 2. `src/pages/ExecDemoPage.tsx` — merge before invoking

In `fireNextOffers`, build a single `rollups` array by concatenating:
- `synthesis.pillarRollups` (already shaped correctly)
- Detected life events mapped to the same shape:
  ```ts
  lifeEvents.map(e => ({
    label: e.event_name,
    pillar: "Life Event",
    categories: [],
    topMerchants: e.evidence_merchants || [],
    totalCount: e.evidence?.length || 1,
  }))
  ```
Send `{ rollups, demographics }` to the edge function. Drop the separate `lifeEvents` body field and the `pillars` context (all needed merchant/category info is already on each rollup).

### 3. `src/components/exec-demo/NextOfferRationale.tsx` — drop the pillar bucket pre-filter

Remove the `scopedOffers` block that splits on `pillar === "Life Event"`. Rely solely on the existing fuzzy `rollup`-label match. Since edge function now returns labels verbatim (life-event labels included), `activeRollupLabel` from any pill — behavioral or life event — will match its corresponding offer group.

Keep the `activeRollupPillar` prop for now but stop using it for filtering (or remove from the prop list — internal-only).

## Expected result
- Click a Spending Habit pill → shows that rollup's deals (works today, still works).
- Click a Life Event pill → shows that life event's deals (currently broken, now fixed).
- Edge function is ~40% smaller, one prompt, one parser, no shape-drift normalization.

## Out of scope
- Persona synthesis prompt changes
- Pill UI / animations
- Life-event detection logic

