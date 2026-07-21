# Speed up the "Behavioral Intelligence: Ready" button

## Gating chain (confirmed)

The button is controlled by `hasSynthesis && !synthesisTriggered && phase === "hold"` in `ExecDemoIntelPanel.tsx`, so it appears only after **two edge functions complete in series**:

1. `classify-transactions` (SSE stream, must finish all batches)
2. `synthesize-persona` (fires after classification returns)

`detect-risk-transactions` runs in parallel but is bounded by a 6s `Promise.race`. `analyze-lifestyle-signals` runs in parallel and does not gate the button.

## Root cause of slowness (from recent edge-function logs)

**`classify-transactions` — dominant cost, ~50s total**
- Primary model `openai/gpt-5-mini` fails every batch with `400: 'max_tokens' not supported`
- The code branches to `max_completion_tokens` for `openai/gpt-5*`, but the Lovable AI Gateway is still rejecting the request for `gpt-5-mini`. Result: guaranteed 4xx on every batch.
- Each batch then waits ~4–6s of backoff, retries once more (also fails), and only on the 3rd attempt escalates to `google/gemini-3.5-flash`, which succeeds.
- With 7 batches at concurrency 4, this adds roughly **10s of wall-clock overhead** and 2 wasted round-trips per batch — on every single run.

**`synthesize-persona` — secondary cost, ~10–20s**
- Runs on `openai/gpt-5-mini` with `max_completion_tokens: 24000`. Not currently faulting, but is the second gate.

## Fix

Scope: `supabase/functions/classify-transactions/index.ts` only. No client changes, no behavior change.

1. Swap the model constants so the model that actually works becomes primary:
   - `FAST_MODEL = "google/gemini-3.5-flash"` (was `openai/gpt-5-mini`)
   - `FALLBACK_MODEL = "google/gemini-3.5-flash-lite"` (cheap last-resort)
2. Leave the `isOpenAiGpt5` sampling / `max_completion_tokens` branch in place — it becomes a no-op for the current models but stays correct if we reintroduce a gpt-5 model later.
3. Everything else (batch size, concurrency 4, retry count, SSE events, tool-calling schema) stays untouched.

## Expected impact

- Eliminates the guaranteed 4xx round-trip and ~5s backoff per batch.
- "Behavioral Intelligence: Ready" button appears roughly **10–15s sooner** on cold runs (dominant win from removing classification overhead; `synthesize-persona` still runs unchanged after).
- Classification results are identical to today's runs, because Gemini was already producing every successful result in the logs.

## Out of scope

- Not touching `synthesize-persona`, `analyze-lifestyle-signals`, `detect-risk-transactions`, or the client-side pre-fire pipeline.
- Not investigating why the AI Gateway rejects `max_completion_tokens` for `gpt-5-mini` — we simply stop using the broken path.
