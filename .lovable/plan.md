# Remove `assess-creditworthiness`

The Creditworthiness section was already removed from the Next Product UI; the edge function and its plumbing are now dead code. Delete both.

## Changes

1. **Delete deployed edge function**
   - Call `supabase--delete_edge_functions` for `assess-creditworthiness`.
   - Remove `supabase/functions/assess-creditworthiness/` directory.
   - Remove the `[functions.assess-creditworthiness]` block from `supabase/config.toml`.

2. **`src/pages/ExecDemoPage.tsx`**
   - Drop `CreditAssessment` import, `creditAssessment` state, all `setCreditAssessment(...)` calls.
   - Delete `fireCreditAssessment` (the callback that invokes the function) and its call site in the pipeline kickoff.
   - Stop passing `creditAssessment` into `ExecDemoIntelPanel`.

3. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
   - Remove `creditAssessment` prop from the type, destructuring, and the pass-through to `NextProductRationale`.

4. **`src/components/exec-demo/NextProductRationale.tsx`**
   - Remove `CreditAssessment` interface export, `creditAssessment` / `creditLoading` props (already unused in render).

No UI change expected — the section was already hidden.
