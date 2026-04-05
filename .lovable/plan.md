

## Three Changes to Exec Demo Left Panel

### 1. Show date instead of card numbers in transaction rows
The `Transaction` interface currently has `account` (masked card number). Add a `date` field parsed from the CSV, and display it in `TxRow` instead of the `account` badge. Format as compact date like `03/15` or `Mar 15`.

**Files:**
- `execDemoData.ts` — update `Transaction` to include `date: string`, parse the `date` column from CSV in `parseCsvToTransactions`, format as `MM/DD`
- `ExecDemoLeftPanel.tsx` — change the `TxRow` component to show `tx.date` instead of `tx.account` in the left badge

### 2. Hide unselected customers once one is selected (after analysis starts or immediately)
When a customer is selected, collapse the other customer options so only the selected one shows. The other buttons disappear with a fade/slide animation. A small "Change" link or the user icon can re-expand them if needed (or they re-appear when resetting to idle).

**Files:**
- `ExecDemoLeftPanel.tsx` — filter `DEMO_CUSTOMERS.map(...)` to only show the selected customer when `phase !== "idle"`, or always only show selected after first click. Add a small "Change customer" button that calls a reset callback.

### 3. Pause after persona signals finish (before card scan phase)
Currently the scroll phase flows directly into `cardScan`. Add a brief pause (e.g., 1500–2000ms) between the end of persona signal accumulation and the start of the card intelligence cycle so the user can absorb the persona results.

**Files:**
- `ExecDemoPage.tsx` — add a `personaPause` timing constant (~1500ms). Insert it between the end of the scroll phase and the start of the first `cardScan` by offsetting `elapsed` by the pause duration.

