

## Show demographics in selection dialog and profile card

### What
Surface the existing `ClientProfileData.demographics` (age, occupation, familyStatus, incomeLevel, industry) and key profile fields (segment, AUM) in two places on `/demo`:

1. **Selection Dialog** — Add a demographics summary line below each customer pill when selected (between the pills row and the transaction table header)
2. **Left Panel Profile Card** — Expand the compact card to show demographics beneath the name

### Changes

**File 1: `src/components/exec-demo/ExecDemoSelectionDialog.tsx`**

Expand the "Table header info" section (~line 212–216) to show a compact demographics row when a sample customer is selected. Below the name/txn count line, add a row of small badges or inline text showing:
- Age · Occupation · Family Status
- Segment · AUM · Income · Industry

Layout: two lines of `text-[10px]` slate-500 text, separated by `·` dots.

**File 2: `src/components/exec-demo/ExecDemoLeftPanel.tsx`**

Expand the customer header card (~lines 213–228) to add demographics below the current name + txn count. For sample customers, pull from `currentCustomer.profile.demographics` and show:
- Line 1: Age · Occupation  
- Line 2: Segment · AUM · Income

Use `text-[9px] text-slate-400` for consistency with existing styling. Only show when not in custom mode (custom mode keeps current minimal display).

### No new files or dependencies needed
Both files already import `DEMO_CUSTOMERS` which contains the full `ClientProfileData` with demographics.

