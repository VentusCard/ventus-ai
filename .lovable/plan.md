# Plan: Make the /bankdemo "Behavioral Intelligence: Ready" button appear faster

## Goal
Reduce the wait time between enrichment completion and the "Behavioral Intelligence: Ready" button appearing in the `/bankdemo` Demo tab, without modifying `classify-transactions`.

## Current state (verified)
- `ExecDemoPage.tsx` gates `personaSynthesis` (which renders the Ready button) on the `synthesize-persona` edge function finishing.
- `synthesize-persona` currently uses `gemini-3.1-pro-preview`, a slower reasoning model.
- `fireClassification()` already kicks off risk detection in parallel via `riskReadyRef.current = fireRiskDetectionRef.current()`, but downstream orchestration still lets persona synthesis wait on risk results in some paths.
- `classify-transactions` is explicitly out of scope per your instruction.

## Changes

### 1. Move `synthesize-persona` to a faster GPT-5 model
- Replace `gemini-3.1-pro-preview` with `openai/gpt-5-mini` in `supabase/functions/synthesize-persona/index.ts`.
- Use `max_completion_tokens` (not `max_tokens`) and `service_tier: "priority"` to avoid the OpenAI 400 errors and reduce queue latency.
- Keep the same deterministic ladder, hint tags, and guard logic so output quality is preserved.

### 2. Stop blocking persona synthesis on risk detection
- In `ExecDemoPage.tsx`, ensure `synthesize-persona` is called as soon as classification completes, independent of `riskReadyRef`.
- Risk detection will still run in parallel and merge its results later for the Risk Factors row, but it will no longer gate the Ready button.

### 3. Add a fast local preliminary persona to unlock the button immediately
- After classification completes, derive a lightweight preliminary `PersonaSynthesis` directly in the browser from the already-enriched transactions:
  - Pillar rollups: group by `pillar` and sum spend.
  - Financial signals: scan for known servicer patterns (auto, mortgage, student loan, etc.).
  - Demographic hints: scan for payroll, tuition, relocation keywords.
  - External signals: merge any pre-loaded external intelligence.
- Set this preliminary state into `personaSynthesis` immediately so the "Behavioral Intelligence: Ready" button renders right away.
- Fire the real `synthesize-persona` edge function in the background and replace the preliminary state with the LLM result when it arrives, with a smooth merge so pills don't flicker.

### 4. Keep downstream tabs stable
- `ExecDemoIntelPanel.tsx` already accepts `personaSynthesis` as a prop; no structural changes needed.
- Ensure the preliminary state uses the same `PillarRollup`, `FinancialSignal`, and `DemographicShift` shapes so the panel renders identically.

## Files to modify
- `supabase/functions/synthesize-persona/index.ts` — model swap and request params.
- `src/pages/ExecDemoPage.tsx` — decouple persona synthesis from risk detection, add local preliminary synthesis.

## Out of scope
- `supabase/functions/classify-transactions/index.ts` — no changes.
- No UI redesign of the button or panel.

## Success metric
- The "Behavioral Intelligence: Ready" button appears within ~1–2 seconds after the enrichment table finishes, instead of waiting for the full LLM round-trip.