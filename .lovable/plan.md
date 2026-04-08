

## Redesign: Vertically Stacked Customer Selection Dialog

### Layout Change
Replace the current two-column (left cards / right preview) layout with a **single-column vertical stack**:

```text
┌──────────────────────────────────────────────────────────────┐
│  Ventus AI · Select a Customer Profile                  [X]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [Sarah Chen · 156 txns] [Marcus · 180] [Emily · 210]       │
│  [Isabella · 240] [Priya · 190] [Robert · 320] [✏️ Custom]  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Date    Merchant          Category   Amount   Zip    Source │
│  Aug 15  Equinox Fitness   Wellness   $200     94102  Prem.  │
│  Aug 16  Whole Foods       Grocery    $157     94102  Cash.  │
│  Aug 12  Delta Air Lines   Travel     $450     94102  Travel │
│  ...scrollable full-width table of all transactions...       │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│          [ ▶ Run Behavioral Enrichment ]                     │
└──────────────────────────────────────────────────────────────┘
```

### Changes to `ExecDemoSelectionDialog.tsx`

**Top section — Customer pills (horizontal row)**:
- Replace the left-column card list with a horizontal wrapping row of compact pills
- Each pill shows only: **name** and **txn count** (e.g., "Sarah Chen · 156 txns")
- No lifestyle type, no pillar chips, no icons
- Selected pill gets blue bg + white text; others are slate outline
- "Custom" pill with pencil icon at the end (opens existing paste flow inline below the pills)

**Bottom section — Full-width transaction table**:
- Remove the two-column grid entirely; table spans full dialog width
- Show **all available columns**: Date, Merchant, Category, Amount, Zip Code, Source
- All `sampleTransactions` for the selected customer displayed in a `ScrollArea`
- Compact header with customer name + txn count + date range above the table

**Footer**: Keep the "Run Behavioral Enrichment" CTA unchanged.

**Custom flow**: When "Custom" pill is clicked, the paste flow appears between the pill row and the table area (same logic as today).

### Files
1. **`src/components/exec-demo/ExecDemoSelectionDialog.tsx`** — Rewrite layout from two-column grid to vertical stack with pill row + full-width table.

