
Problem diagnosis

The reason this still shows as:
`MARIA GARCIA $150.00 Unclear Merchants`
is not just the edge-function prompt.

The real break is in the /demo frontend pipeline:
- `supabase/functions/classify-transactions/index.ts` is already prepared to use `description` and `source`
- but `src/components/exec-demo/execDemoData.ts` → `csvToClassifyPayload()` still strips both fields and only sends:
  `transaction_id, merchant_name, amount, date`
- so the classifier never receives `"Dogsitting"` or `"Zelle"` from the executive demo flow

That means the previous fixes changed the backend prompt, but the /demo route is still feeding incomplete data.

Implementation plan

1. Fix the /demo payload builder
- Update `src/components/exec-demo/execDemoData.ts`
- Expand `csvToClassifyPayload()` so it parses and sends:
  - `description`
  - `source`
  - `zip_code`
  - optionally `mcc` too for future rules/debugging
- This ensures the executive demo actually passes the same signals that exist in the CSV

2. Add a deterministic non-card classification path
- Update `supabase/functions/classify-transactions/index.ts`
- Do not rely only on prompt wording
- Add a server-side preprocessing rule:
  - if `source` is not a card transaction (`ACH`, `Zelle`, `Venmo`, `Wire`, `Check`, `Bill Pay`, `Transfer`, etc.)
  - and `description` is meaningful
  - classify primarily from `description`, with merchant treated as secondary context
- This should work for all non-card rails, not just Zelle

3. Add strong description-first examples/rules
- Keep the prompt improvements, but broaden them into a universal non-card rule
- Include examples like:
  - `Dogsitting` → Pets / Pet Services
  - `Rent payment` → Home & Living / Rent & Mortgage
  - `Comcast Internet` → Technology & Digital Life / Internet & Phone
  - `Landscaping` → Home & Living / Home Improvement
  - `Tuition` → Family & Community / Childcare & Education

4. Add a safe fallback for person-name merchants
- Add logic so if:
  - merchant looks like a personal name or generic transfer processor
  - and description exists
  - description wins automatically
- If description is empty or vague, then fall back to low-confidence miscellaneous/general

5. Verify the /demo signal-map update path
- Confirm the AI-classified results replace the MCC fallback map after preload completes
- This matters because the left panel initially uses local fallback data, then swaps to AI classifications via `buildSignalMapFromClassified()`
- I’ll verify that the updated classification result actually propagates into the visible label shown in the transaction list

Files to update
- `src/components/exec-demo/execDemoData.ts`
- `supabase/functions/classify-transactions/index.ts`

Expected outcome
After this, the demo should classify:
- `MARIA GARCIA` + `Dogsitting` + `Zelle` → `Pets / Pet Services`
and the same description-first behavior should apply to any non-card transaction source like ACH, wire, check, bill pay, and transfer.

Technical details
- Root cause found: `/demo` payload builder is dropping `description` and `source` before the request is sent
- Better solution than another prompt tweak: combine payload fix + deterministic server rule
- No database/schema changes needed
