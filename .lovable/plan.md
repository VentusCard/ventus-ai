## Goal
For `/demo` sample data, only card-funded transactions (Premium Card, Travel Card, Cashback Card) should carry an MCC. Non-card sources (Checks, Checking, ACH, HSA, Wire, Zelle) should have an empty MCC field — matching how a real bank would only have MCC data for card rails.

## Scope
Single file: `src/lib/sampleData.ts`. All `SAMPLE_CSV*` blocks are affected. ~137 rows currently violate the rule.

## Approach
Run a one-off script that rewrites `src/lib/sampleData.ts`:
- For every CSV data row inside the template literals, parse the comma-separated columns
- If the `source` column (last) is NOT one of `Premium Card`, `Travel Card`, `Cashback Card`, blank the `mcc` column (4th)
- Leave header rows, card-source rows, and all surrounding TS code untouched

No UI/component changes needed — downstream code (`parsePastedText`, enrichment, displays) already tolerates empty `mcc`.

## Verification
- Re-run the awk check to confirm 0 non-card rows still have an MCC
- Spot-check the user's example row `txn_058 PORTFOLIO RECOVERY ASSOC` now shows blank MCC
- Confirm card rows (e.g. `Premium Card`) still retain their MCCs