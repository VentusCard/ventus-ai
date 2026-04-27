## Goal

Fix the enrichment table's "Description" column so it shows the same value as the selection page (e.g. `Grocery Stores, Supermarkets` for MCC 5411), instead of the raw CSV note column ("Weekly grocery run").

**The selection page will not change.** It is already correct and is the source of truth.

## Root cause

The CSV has a free-text `description` field with editorial notes like `"Weekly grocery run"`:
```
txn_001,WHOLE FOODS MARKET,Weekly grocery run,5411,162.45,...
```

- **Selection dialog** correctly ignores that field and resolves the description from the MCC code:
  ```ts
  mcc_description: MCC_DESCRIPTIONS[mcc] || get("description") || "—"
  ```
  → renders `Grocery Stores, Supermarkets`.
- **Enrichment table** (`ExecDemoEnrichmentTable.tsx`, line 150) reads the raw CSV `description` directly:
  ```ts
  const description = ((tx as any)?.description as string | undefined) ?? raw?.description;
  ```
  → renders `Weekly grocery run` (wrong).

## Fix

### `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- Add `import { MCC_DESCRIPTIONS } from "@/lib/sampleData";`.
- Move the existing `mcc` resolution (currently line 151) above the description line so it's available, then replace the description line with the same precedence used by the selection dialog:
  ```ts
  const mcc = ((tx as any)?.mcc as string | undefined) ?? raw?.mcc;
  const rawDesc = ((tx as any)?.description as string | undefined) ?? raw?.description;
  const description = (mcc && MCC_DESCRIPTIONS[mcc]) || rawDesc;
  ```
- Keep the column width, font, truncation, and `title={description}` tooltip exactly as they are.

## What stays the same
- `ExecDemoSelectionDialog.tsx` — untouched.
- All other enrichment-table columns (Source, Date, Merchant, MCC, Amount, enriched cells).
- CSV / sample data — untouched (the editorial `description` field still exists in the CSV; we just stop displaying it in this table).
- Left-panel transaction tooltip — already uses `mccDescription` from the parsed signal map.

## Files touched
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
