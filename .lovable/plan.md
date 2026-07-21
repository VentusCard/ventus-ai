## Problem

`supabase/functions/synthesize-persona/index.ts` calls `google/gemini-3.5-flash`, which is a thinking model. On the last failing run it spent the entire 8192-token budget on internal reasoning and returned no `content` and no tool call → the function throws `"AI did not return structured output"` (500).

My previous fix passed `reasoning: { enabled: false }`, but that isn't the documented OpenRouter shape — the valid knobs are `effort` (`"none"`), `max_tokens` (`0`), and `exclude`. So Gemini kept thinking.

## Fix

In `supabase/functions/synthesize-persona/index.ts` request body (lines ~486–492):

- Replace `reasoning: { enabled: false }` with the documented disable + hide combo:
  ```
  reasoning: { max_tokens: 0, exclude: true }
  ```
- Keep `max_tokens: 16384` as a safety headroom for the tool-call payload.
- Leave model as `google/gemini-3.5-flash` (fast, and once thinking is off, all output tokens go to the tool call).

## Verify

1. Redeploy, then trigger `/bankdemo` (post-password auto pre-fire runs synthesize-persona).
2. Check `supabase--edge_function_logs synthesize-persona`: expect no `No tool call` error and no `finish_reason: length`.
3. Confirm the "Behavioral Intelligence — Ready" gate unlocks in the UI within ~15–20s.

## Fallback if Gemini still ignores the flag

If a follow-up log still shows reasoning content, switch model to `google/gemini-3.1-flash-lite` (non-thinking) in the same file — same tool-call schema, no other code changes.
