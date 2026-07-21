## Problem

On `/bankdemo` the Life Event row is rendering pills like:

```
✦ Home Purchase / Transition  4 txns · $0
✦ College Preparation for Dependent  4 txns · $0
✦ Home Purchase  4 txns · $0
```

Two bugs, both in `src/components/exec-demo/ExecDemoIntelPanel.tsx`:

1. **Duplicate life events.** `filteredDetectedLifeEvents` renders every entry from `detectedLifeEvents`. When `synthesize-persona` rescue-merges upstream lifestyle events, `Home Purchase` and `Home Purchase / Transition` come back as two separate entries and both get pills. Same pattern can hit `College Prep` variants.
2. **`$0` sublabel.** `spendLE` is computed from either (a) transaction indices matched by evidence merchant substring, or (b) `evidence[].amount`. For rescue-merged events the evidence often has no `amount` field and merchant strings don't substring-match any transaction, so both paths return `0` and the pill shows `4 txns · $0`.

## Fix

Edit only `src/components/exec-demo/ExecDemoIntelPanel.tsx`:

1. **Canonicalize + dedupe life events** before render.
   - Add a `canonicalLifeEventKey(name)` helper: lowercase, strip ` / transition`, ` for dependent`, ` cycle`, ` planning`, punctuation, collapse whitespace. Map e.g. `home purchase / transition` and `home purchase` → `home purchase`; `college preparation for dependent` and `college prep` → `college preparation`.
   - In the `filteredDetectedLifeEvents` `useMemo`, after the pet-vocab filter, run a dedupe pass keyed by `canonicalLifeEventKey(event_name)`. Keep the entry with the highest confidence (tiebreak: more evidence items). Prefer the shorter, cleaner display name when merging.
2. **Never render `· $0`.**
   - In the life-event pill render (lines ~800-838), if `spendLE <= 0`, drop the `· $amount` half and show just `N txn(s)`. External pills already use `externalDetail`, unchanged.
   - Leave the `matchedIndices` / `evidenceAmt` logic intact — this only changes what the sublabel prints when the amount is truly zero.

## Out of scope

- No backend / edge-function changes. `synthesize-persona` and `analyze-lifestyle-signals` stay as-is; dedup is client-side only, matching the existing "cross-row dedup" comment in the file.
- No changes to Financial Signal / Demographic / Rollup pills — they already have real spend.
