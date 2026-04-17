

# Fix False Positive in Risk Detection Prompt

## Problem
"ADMISSIONS CONSULTING GRP" ($2,500, category: Childcare & Education) is being flagged — likely because "consulting" + round number triggers the model. Rather than adding a hard exclusion list, we should improve the prompt logic to make the model use the **category and pillar context** it already receives.

## Change

### `supabase/functions/detect-risk-transactions/index.ts` — System prompt update

Add a rule to the IMPORTANT RULES section instructing the model to **use the enriched category/pillar data** when evaluating transactions, and to weight merchant name keywords only when the category context supports suspicion:

**Add after the existing "Only flag transactions with CLEAR evidence..." rule:**

```
- USE the provided category and pillar context. A merchant name containing words like "consulting", "services", or "group" is NOT suspicious if the transaction's category clearly maps to a benign domain (e.g., Childcare & Education, Healthcare, Home Improvement). Merchant name keywords alone are never sufficient — the category must also be consistent with risk.
- A round dollar amount alone is NOT an AML indicator. Structuring requires a PATTERN of multiple transactions deliberately staying below reporting thresholds, not a single payment at a round number.
```

This teaches the model to cross-reference the enriched category data it already receives rather than relying on surface-level keyword matching, without hard-coding any exclusions.

### Single file change
- `supabase/functions/detect-risk-transactions/index.ts`

