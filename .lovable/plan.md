

## Fix: Use Index-Based Rollup Matching Instead of Fuzzy String Matching

### Problem
The frontend uses fuzzy string matching to associate rollup pills with their underlying category chips. This fails when the AI returns slightly different pillar/category names despite instructions to use exact strings. Fuzzy matching is inherently unreliable.

### Solution
Number the input rows sent to the AI and have it return the **indices** of the categories each rollup covers. The frontend then uses these indices directly — no string matching needed.

### Changes

**`supabase/functions/synthesize-persona/index.ts`**
1. Number each input line in the summary sent to the AI (e.g., `[0] Travel & Transport > Airlines: 5 txns, $2400`).
2. Add a `category_indices` field (array of numbers) to the `pillar_rollups` schema, telling the AI to return which input row indices each rollup covers.
3. Pass `category_indices` through in the response alongside existing fields.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
4. Update `PillarRollup` interface to include `categoryIndices?: number[]`.
5. Replace `chipMatchesRollup` fuzzy logic: if `categoryIndices` exists, match chips by checking if the chip's position in the sorted chip array matches any index. Otherwise fall back to existing fuzzy logic for backward compatibility.
6. Compute `unrolledChips` and `rollupStats` using the index-based approach.

**`src/pages/ExecDemoPage.tsx`**
7. Pass `category_indices` from the API response into `pillarRollups` when constructing `PersonaSynthesis`.

### Files
- `supabase/functions/synthesize-persona/index.ts` — add numbered input + `category_indices` in schema
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — index-based matching
- `src/pages/ExecDemoPage.tsx` — pass through `categoryIndices`

