## Shrink SAMPLE_CSV to a 12-month window (preserve all non-ACH)

Trim `SAMPLE_CSV` in `src/lib/sampleData.ts` to a 12-month window while keeping every non-ACH transaction. Other 5 sample CSVs untouched.

### Window
- Target range: `2025-07-16` → `2026-07-15`

### Row-level rules
- **ACH rows** (`source === "ACH"`): keep only those already inside the window; drop the rest (~60 of 84 removed).
- **Non-ACH rows** (all 67): keep every row. Any row dated `≤ 2025-07-15` gets re-dated into the window via linear remap of its original date from `[2024-04-02 … 2026-07-06]` → `[2025-07-16 … 2026-07-15]`. Rows already inside the window keep their original date.
  - Life-event clusters (home-buying mortgage/title-fee, college/admissions block, etc.) get compressed proportionally so their relative order and clustering are preserved.

### Method
Node script:
1. Parse `SAMPLE_CSV` template literal body, split header + rows.
2. For each non-ACH row outside the window, compute remapped date.
3. Filter ACH rows to window.
4. Stable-sort all surviving rows ascending by date.
5. Rewrite the literal in place, headers preserved, all other CSV constants untouched.

### Expected impact
- Total rows: 151 → ~91 (67 non-ACH + ~24 ACH).
- Non-ACH content unchanged; only `date` field rewritten for pre-window rows.
- ACH cadence still visible (monthly payroll/rent/auto-debit) but only across the last 12 months.

### Out of scope
- No changes to other sample CSVs, demographics, LLM prompts, edge functions, or UI.
- No merchant/amount edits or row synthesis.