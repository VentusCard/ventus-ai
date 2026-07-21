## Goal
Cut LLM wall-clock time on `/bankdemo` preload from ~30–40s to ~15–18s so the "Behavioral Intelligence — Ready" button appears much sooner.

## Root cause
Three model calls run largely in series, and the tail call uses a heavyweight Pro model:

```
classify-transactions (~13s)  ──▶  analyze-lifestyle-signals (~18s)  ──▶  synthesize-persona (~5–10s, Pro)
```

`analyze-lifestyle-signals` only needs the raw CSV / spending summary — it does not depend on the classified pillars. `synthesize-persona` uses `google/gemini-3.1-pro-preview`, which is the slowest step per token.

## Changes

### 1. Parallelize life-event detection with classification (biggest win, ~13s saved)
File: `src/pages/ExecDemoPage.tsx` — inside `fireClassification`, kick `detectLifeEventsOnlyRef.current()` at the same time as the classify SSE (same place we already fire risk detection in parallel). Store the promise on a ref (`lifeEventsReadyRef`).

Then in `firePersonaSynthesis`, replace the current `await detectLifeEventsOnlyRef.current()` with `await Promise.race([lifeEventsReadyRef.current, timeout(6000)])`. Life events now finish during classification instead of after it.

### 2. Downgrade synthesize-persona model (~5–8s saved)
File: `supabase/functions/synthesize-persona/index.ts` line 487 — swap `google/gemini-3.1-pro-preview` → `google/gemini-3.5-flash`. The synthesis prompt is a structured taxonomy decision, well within Flash's capability. If quality regresses we can fall back to `gemini-3.1-flash-lite` or reinstate Pro.

### 3. Fire all classify batches at once (~2–3s saved)
File: `supabase/functions/classify-transactions/index.ts` line 14 — bump `CONCURRENCY_LIMIT` from `4` to `6` (there are only 5 batches for 103 txns, so all fire in parallel; wall clock ≈ 1 batch time).

### 4. Show the "Ready" button as soon as synthesis lands
No change to gating logic (already `hasSynthesis && !synthesisTriggered && phase === "hold"`) — with the changes above, `hasSynthesis` flips true ~15s after Demo tab mount instead of ~35s.

## Expected timeline after changes

```
classify-transactions  (~10s) ─┐
analyze-lifestyle-signals(~15s)┴─▶ synthesize-persona (Flash, ~3-5s) ─▶ Button visible
                       ~15-18s total
```

## Files touched
- `src/pages/ExecDemoPage.tsx` — parallelize life-event fetch with classify.
- `supabase/functions/synthesize-persona/index.ts` — model swap to `gemini-3.5-flash`.
- `supabase/functions/classify-transactions/index.ts` — `CONCURRENCY_LIMIT: 4 → 6`.

No UI/pill/copy changes.