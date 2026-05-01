## Why the Western Union $400 transfer landed in "College Prep"

**Root cause:** The `analyze-lifestyle-signals` edge function asks an LLM to detect life events from transactions. The prompt explicitly excludes generic travel (airlines, hotels, gas stations) but **never excludes generic money-movement services** (Western Union, MoneyGram, Wise, Remitly, Zelle, Venmo, wires, ACH transfers). Faced with `WESTERN UNION*MTO 8821 — $400 — Money transfer fee`, the model speculated it could be a parent wiring tuition/support to a college-bound dependent, so it attached it as evidence for "College Preparation for Dependent".

This is exactly the kind of speculative inclusion the prompt's "Causality / Specificity / Reasonable Person" tests are supposed to block — Western Union has no inherent connection to college — but the model gave it a pass because there's no named exclusion for remittance.

## Fix

Update `supabase/functions/analyze-lifestyle-signals/index.ts` system prompt to add money-transfer / remittance services to the exclusion list, alongside generic travel.

### Changes

1. **Add a "MONEY MOVEMENT" exclusion bullet** under the "EVIDENCE INCLUSION PRINCIPLES" / "FINAL EVIDENCE QUALITY CHECK" section:
   - Explicitly exclude Western Union, MoneyGram, Ria, Wise, Xoom, Remitly, WorldRemit, Zelle, Venmo, Cash App, PayPal, generic ACH/Wire/Bill Pay, and other remittance/transfer rails as life-event evidence — *unless* the transaction's `description` field contains an explicit, event-specific token (e.g. "Tuition Stanford", "Down payment", "Wedding venue deposit"). The merchant name alone is never sufficient.

2. **Update the BAD/GOOD examples** to include a remittance illustration:
   - BAD: "Western Union $400 is evidence of college prep because the client may be wiring tuition to a dependent"
   - GOOD: "Wire Transfer $25,000 with description 'Stanford tuition fall semester' is evidence of college prep because the description directly names the institution"

3. **Add to the FINAL EVIDENCE QUALITY CHECK list** a step:
   - "Remove any money-transfer / remittance / P2P transaction (Western Union, MoneyGram, Wise, Remitly, Zelle, Venmo, Cash App, PayPal, generic Wire/ACH) unless its description contains an explicit, event-specific phrase."

### Files touched

- `supabase/functions/analyze-lifestyle-signals/index.ts` — prompt edits only (no code/logic changes).

### Out of scope

- No DB migration, no schema change, no UI change.
- The sample data row itself (`txn_043` in `src/lib/sampleData.ts`) stays as-is; the goal is for the LLM to correctly *exclude* it from event evidence, not to remove it from the dataset.

After approval I'll also save a short memory rule under `mem://technical/data-processing/` so future life-event prompts keep the remittance exclusion.