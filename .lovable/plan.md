

## Streaming Transaction-by-Transaction AI Analysis

### Problem
Currently, the entire CSV is sent to the AI in one batch, which takes 10-20 seconds before anything appears. The user wants pills and persona descriptions to appear progressively, one transaction at a time.

### Approach
Instead of calling a single slow edge function, split the work into two phases:

1. **Instant signal classification** — do it locally using the existing `MCC_SIGNAL_MAP` (already in `execDemoData.ts`). This gives immediate pill-by-pill animation with zero latency. The scroll phase already animates signals one at a time — we just need to not block it behind the AI call.

2. **AI for persona descriptions + intelligence cards only** — call the edge function in the background for the parts that actually need AI (evolving descriptions, intelligence card content, lifestyle pills). When the AI result arrives, swap in the richer pills and descriptions mid-animation or at the card phase.

This gives the best of both worlds: instant pill-by-pill animation from local classification, plus AI-quality persona descriptions and intelligence cards.

### Changes

**`src/pages/ExecDemoPage.tsx`**
- Start the scroll animation immediately using local MCC-based signals (no waiting for AI)
- Fire the edge function in parallel
- When AI response arrives: update persona descriptions, pills, and intelligence cards in state
- If AI arrives before card phase: use AI intelligence cards; otherwise fallback to hardcoded cards

**`supabase/functions/generate-exec-profile/index.ts`**
- Simplify: remove `signalEntries` from the AI request (local MCC handles that)
- Only ask for `pills`, `milestoneDescriptions`, and `intelligence` — this makes the prompt smaller and faster (~5s instead of 15s)

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- No changes needed — it already handles evolving descriptions via `persona.descriptions`

**`src/components/exec-demo/execDemoData.ts`**
- Add a `buildHybridProfile` helper that starts with MCC-based signals and merges AI results when they arrive
- Update `buildExecProfileFromAI` to handle partial AI results (no signalMap)

### Flow
```text
User clicks "Run Analysis"
  ├─ Immediately: build local profile from MCC map
  ├─ Start scroll animation (pills appear one by one)
  ├─ Fire edge function in background (pills + descriptions + intel only)
  │
  ├─ ~3s: Scroll animation running, pills accumulating
  ├─ ~5s: AI response arrives
  │   └─ Merge AI descriptions + pills + intelligence into state
  ├─ ~6s: Scroll ends, persona pause with AI description visible
  └─ Card cycle begins using AI intelligence cards
```

### Files
1. `supabase/functions/generate-exec-profile/index.ts` — remove signalEntries from schema, lighter prompt
2. `src/components/exec-demo/execDemoData.ts` — add hybrid profile builder
3. `src/pages/ExecDemoPage.tsx` — start animation immediately, merge AI results async

