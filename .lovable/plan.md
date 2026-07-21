## Plan: synthesize-persona — Gemini Flash + more tokens

1. **Switch the LLM** in `supabase/functions/synthesize-persona/index.ts`
   - To: `google/gemini-3.5-flash`

2. **Increase output token budget**
   - Add `maxTokens: 8192` to the `generateText` call so the model has room to emit the full buckets + audit + talking_points without truncation.

3. **Keep everything else unchanged**
   - Same tool schema, same deterministic guard layer, same downstream contracts.

4. **Verify**
   - Run one real `/bankdemo` Demo-tab flow and check the AI Gateway log for `synthesize-persona`.
   - Confirm status 200, no truncation, and pills still route correctly.

## Files touched

- `supabase/functions/synthesize-persona/index.ts` only.