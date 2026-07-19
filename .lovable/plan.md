## Rename "Kid → College" → "College Preparation"

Replace the demographic label in the persona synthesizer so the pill renders as **"College Preparation"** everywhere it appears.

### Files to edit

**`supabase/functions/synthesize-persona/index.ts`**
- Line 329: prompt example `"Kid → College"` → `"College Preparation"`
- Line 334: BAD example restatement string
- Line 373: `household_composition` enum list entry
- Line 376: restatement guidance example
- Line 394: GOOD example
- Line 397: BAD restatement example
- Line 456: audit-block example
- Line 459: audit-block example
- Line 738: fallback label assignment `label = "Kid → College"` → `label = "College Preparation"`

### Deduplication safety

`ExecDemoIntelPanel.tsx` already suppresses the demographic pill when a Life Event contains "college" (case-insensitive substring). The new label "College Preparation" still contains "college", so the existing dedup ladder continues to hide the demographic pill whenever the Life Event fires — no frontend change needed.

### Deploy

Redeploy `synthesize-persona` so the new label is emitted on next demo run.

### Out of scope

- No changes to the classifier's routing logic — pet vocab, college prep evidence, and ladder ordering all stay as-is.
- No changes to Life Event labels or other demographic entries ("Empty Nest", "New Cohabitation", "Household Split").