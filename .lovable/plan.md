

## Plan: Show Transaction Data Instead of Profile Cards

### What Changes

Replace the mini profile cards in `DemoCustomerPanel` with a compact transaction preview table showing the parsed CSV data for each customer. This mirrors how `/tepilot` displays uploaded data before enrichment.

### Files to Edit

**1. `src/components/demo/DemoCustomerPanel.tsx`**

Replace the `CustomerSlot` component's profile card section with a compact transaction table:

- Parse the customer's `csv` string using `parsePastedText()` on render (memoized)
- Show a compact table with columns: Merchant, Amount, Date (no MCC/description/zip to save space)
- Display summary stats above the table: transaction count, total spend, date range
- Keep the customer selector dropdown at top
- Remove the profile card (initials, demographics, lifestyle type, pillars)
- Table is scrollable with max height ~200px per customer slot

**2. `src/pages/DemoPage.tsx`**

- Parse CSVs at the page level (memoized) so parsed `Transaction[]` arrays are available for both the panel display and enrichment
- Pass `parsedTransactionsA` and `parsedTransactionsB` as props to `DemoCustomerPanel`
- Use these same parsed transactions in `handleEnrich` instead of re-parsing inside the hook

### UI Layout (per customer slot)

```text
┌─ Customer A ─────────────────────┐
│ [Dropdown: Sarah Mitchell    ▾]  │
│                                  │
│ 36 transactions · $12,450 total  │
│ Aug 1 – Oct 30                   │
│ ┌──────────────────────────────┐ │
│ │ Merchant          Amt   Date │ │
│ │ Equinox Fitness  $200  8/15  │ │
│ │ Whole Foods      $157  8/16  │ │
│ │ Delta Air Lines  $450  8/12  │ │
│ │ ...                          │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

### Files Summary
- Edit `src/components/demo/DemoCustomerPanel.tsx` — replace profile cards with transaction tables
- Edit `src/pages/DemoPage.tsx` — parse CSVs at page level, pass parsed transactions down

