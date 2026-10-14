# Audit Ricky's enrichment against the live classifier

Goal: run every Ricky transaction shown in the Section 4 pop-up tables through the real transaction classifier, compare its output with what the deck shows today, and report only cases where the classifier's output is clearly better. No deck changes in this step.

## Steps
1. Export all Ricky fixture transactions (raw description, amount, date, rail) in the format the classifier accepts.
2. Send them to the `classify-transactions` function in small batches; save the raw responses for reference.
3. Compare each row field by field: merchant, category/pillar, subcategories, frequency.
4. Classify every difference as:
   - **Improvement** — the classifier is more accurate or more specific (recommend adopting it)
   - **Regression / worse** — the deck's current label is better (keep the deck label; note it as possible classifier feedback)
   - **Equivalent** — wording only (ignore)
5. Deliver a short report in Files (`ricky-classifier-audit.md`): an improvements table (transaction, current, proposed, why), plus a short list of classifier weaknesses found.

## Out of scope
- No edits to the deck, the fixture, or the classifier. Once you've reviewed the report, you pick which improvements to apply.

## Technical details
- Source data: `src/lib/deckmoBankdemoFixture.ts` + `enrichRickyTransaction()` in `src/lib/deckmoRickyEnrichment.ts`.
- Call the deployed function with the existing request schema (read `supabase/functions/classify-transactions/index.ts` first); batch to stay under timeouts.
- The comparison script lives in `/tmp` only, not in the project.
