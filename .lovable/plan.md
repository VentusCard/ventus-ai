## Income card in the Select-a-Customer-Profile dialog

File: `src/components/exec-demo/ExecDemoSelectionDialog.tsx` (the dialog shown in the screenshot).

### Detection — source-agnostic
Use the existing `isIncome(tx)` helper from `src/lib/transactionFlow.ts`. It already matches PAYROLL / DIRECT DEP / DEPOSIT regardless of source, and respects the explicit `flow` / `Income & Inflows` pillar when present. No new helper needed.

### New card
Insert directly **after** the KYC card and **before** the `sourceGroups.map(...)` source-rail cards (around line 339):

- Same shape and styling as a source card (rounded-xl, border-slate-200, expandable on click).
- Header row:
  - Emerald pill labeled `Income` (`bg-emerald-50 text-emerald-700`)
  - `{N} txns` — count of all rows where `isIncome(row)` is true, **regardless of source**
  - `·` separator
  - `${total}` summed `Math.abs(amount)` of those rows, mono/tabular
  - ChevronDown that rotates when expanded
- Expanded body: same 7-column table used for source groups (ID / Date / Merchant / MCC / Description / Amount / Zip). Each row shows its native source as an inline pill in the Merchant cell prefix (so the user sees Income coming from ACH, Wire, Zelle, etc.).
- Always renders. If `N === 0`, show a muted `No income detected in this profile.` row in place of the table when expanded; header still shows `0 txns · $0.00`.

### State
- Add `incomeOpen` to the existing `openSources` map under a reserved key like `__income__` so the existing toggle/expand-all logic keeps working unchanged.
- `toggleAll` includes the income card in the all-open / all-closed cycle.

### Out of scope
- No changes to source-rail cards, KYC card, pills row, footer, or `getFlow` logic.
- Sample data and parsers unchanged.