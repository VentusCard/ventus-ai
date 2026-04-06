

## Fix: Rollup Pills Showing "0 txns" Due to Pillar Name Mismatch

### Problem
The rollup stats computation uses fuzzy pillar name matching, but `rolledUpPillars` (used to determine which chips are "unrolled") uses strict exact matching. When the AI returns a slightly different pillar name (e.g., "Travel & Exploration" vs "Travel & Transport"), two things break:
1. The rollup shows "0 txns" because even fuzzy matching fails for some name variants
2. The `unrolledChips` filter doesn't properly exclude chips that were fuzzy-matched by rollups

Additionally, the fuzzy matching should also try matching via the rollup's `categories` array — if a rollup says it covers categories ["Airlines", "Hotels"], we can match chips whose `label` is in that list regardless of pillar name.

### Changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**

1. **Unify matching logic**: Extract the fuzzy pillar matching into a shared helper function. Use it in both `rollupStats` and `rolledUpPillars`/`unrolledChips`.

2. **Add category-based fallback matching**: If pillar name matching (exact + case-insensitive + substring) finds 0 chips, fall back to matching chips whose `label` appears in the rollup's `categories` array. This ensures rollups always count their constituent chips.

3. **Fix `unrolledChips`**: Instead of checking `rolledUpPillars.has(c.pillar)` (exact match), check if any rollup's fuzzy/category match claims that chip.

4. **Filter out 0-count rollups from display**: As a safety net, don't render rollup chips that matched 0 transactions.

### Files
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — fix matching logic for rollup stats and unrolled chips filter

