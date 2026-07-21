# Speed up `synthesize-persona`: switch to gpt-5.4-mini (priority) with Gemini fallback

## Why

Gateway logs show current runs on `openai/gpt-5-mini` taking **93–98s** because it's a reasoning model burning 6–7k hidden reasoning tokens per call (`log_id` 019f836d-efe3-7087 @ 2026-07-21T06:49:06Z, `019f836c-07a6-77e3` @ 06:46:56Z). Swapping to a non-reasoning model + priority tier + a fallback removes the bottleneck without touching the prompt, schema, or guard code.

## Change (single file: `supabase/functions/synthesize-persona/index.ts`)

1. **Replace model constants** at lines 9–10:
   ```ts
   const PERSONA_PRIMARY_MODEL = "openai/gpt-5.4-mini";
   const PERSONA_FALLBACK_MODEL = "google/gemini-3.5-flash";
   const PERSONA_MAX_TOKENS = 6000;
   ```

2. **Extract the fetch at lines 483–627 into a helper** `callPersonaModel(model)` that:
   - Uses `max_completion_tokens: 6000` for `openai/*` models, `max_tokens: 6000` for `google/*` (avoids the "unsupported parameter" 400 we hit before on the classify function).
   - Adds `service_tier: "priority"` **only** when `model === PERSONA_PRIMARY_MODEL` (gpt-5.4-mini is fast-mode ✓). Never set on the Gemini fallback.
   - Keeps the existing `tools` / `tool_choice: return_persona` block unchanged.
   - Returns `{ ok: true, raw }` on success (parsed tool_call arguments), or `{ ok: false, status, errText }` on any failure (non-2xx, missing tool_call, or JSON parse error).

3. **Wrap the call in a fallback ladder** at the current call site:
   ```ts
   let result = await callPersonaModel(PERSONA_PRIMARY_MODEL);
   if (!result.ok) {
     console.warn(`[PERSONA] Primary ${PERSONA_PRIMARY_MODEL} failed (${result.status}) — falling back to ${PERSONA_FALLBACK_MODEL}`);
     result = await callPersonaModel(PERSONA_FALLBACK_MODEL);
   }
   if (!result.ok) {
     // preserve existing 429 / 402 / 500 error surfacing based on result.status
   }
   const raw = result.raw;
   ```
   Everything downstream (`rawLifeEvents`, guard layer, response shape) stays identical.

4. **No changes** to the prompt, tool schema, guard code, client, or any other edge function.

## Expected result

- Primary path: `openai/gpt-5.4-mini` + priority typically returns in **5–12s** for this ~8k-token payload → the "Behavioral Intelligence: Ready" button unblocks that much sooner.
- If OpenAI is degraded / rate-limited / returns no tool call, Gemini takes over transparently in another ~5–10s instead of hard-failing the demo.

## Verification

After deploy, load `/bankdemo` past password, then check `list_ai_gateway_requests` — newest `synthesize-persona` entry should show `openai/gpt-5.4-mini`, duration well under 20s, and output tokens ~1–3k (no reasoning bloat). If a fallback fires, we'll see back-to-back log rows for the two models.
