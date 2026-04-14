

## Fix: Life Event pills only matching one transaction

### Root Cause
The evidence matching logic (line 669-677 in `ExecDemoPage.tsx`) iterates over `Object.keys(sm)` — the signalMap keys — but some evidence transactions may not have signalMap entries yet (classification may not have mapped them). Even when they do exist, the code filters by signalMap keys instead of iterating all transactions.

Additionally, the `matched.length > 0` guard on line 677 means if even ONE transaction matches, it returns only those — but if the normalize+includes check fails for 2 out of 3 evidence merchants (due to LLM reformatting the merchant name slightly), only 1 shows.

### Fix

**`src/pages/ExecDemoPage.tsx`** — Update the evidence matching block (lines 665-678):
- Iterate over ALL transactions by index (`execProfile.transactions.forEach((tx, idx) => ...)`) instead of only signalMap keys
- Use a more forgiving matching: split evidence merchant into words and check if the transaction merchant contains enough of those words (fuzzy word overlap), not just substring includes
- Remove the `if (matched.length > 0)` guard that falls through to pillar matching — evidence-based should always return its results even if empty

### Example
Evidence: `["COLLEGEBOARD SAT", "KAPLAN TEST PREP", "STANFORD VISITOR PARKING"]`
Transaction merchants: `"COLLEGEBOARD SAT"`, `"KAPLAN TEST PREP"`, `"STANFORD VISITOR PARKING"`
After normalization, word-overlap matching ensures all 3 match.

