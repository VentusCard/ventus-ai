

## Redesign: Demo Customer Selection (tepilot-style)

### Current Problem
The left column shows a dropdown selector that, once a customer is picked, immediately displays demographics, transaction stats, source pills, and a full transaction table — revealing too much insight before enrichment even runs.

### New Design
Mirror the `/tepilot` `UploadOrPasteContainer` pattern:

1. **Top section**: A row of buttons for each sample customer (by name), plus a "Custom" button — no dropdown
2. **Below**: An empty transaction preview table (with column headers but no rows) until a customer is selected
3. **On selection**: The table populates with raw transaction rows only (date, merchant, amount, zip, source) — no demographics, no pillar breakdowns, no stats summary, no source pills
4. **Custom flow**: Clicking "Custom" shows the existing copy-prompt + paste-output flow inline, same as today

### Changes

**`src/components/demo/DemoCustomerPanel.tsx`**:

1. Replace the `<select>` dropdown in `CustomerSlot` with a horizontal/wrapped button group showing each customer name from `DEMO_CUSTOMERS` plus a "Custom" option — styled like the tepilot sample data buttons (pill-shaped, active state highlighted)
2. Remove the demographics section (industry/income), summary stats row (txn count, total, date range), and source pills that currently render after selection
3. Keep only the transaction table, but show it always with headers visible and an empty-state message ("Select a customer above") when nothing is selected
4. Transaction table columns stay the same: Date, Merchant, Amt, Zip, Source

