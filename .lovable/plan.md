# Update Merchant Names, Column Header, and Add Notes for Non-Card Transactions

## Changes

### 1. `src/lib/sampleData.ts` — CSV updates

**Merchant name trimming:**

- `SARAH MITCHELL RENT` → `PACIFIC HEIGHTS APT` (building name)
- `MARIA GARCIA DOGSITTER` → `MARIA GARCIA`
- `JANE DOE CONTRACTOR` → `JANE DOE`
- `DOWN PAYMENT TRANSFER` → `DOWN PAYMENT TRANSFER` (keep as-is, it's a wire descriptor)

**Add description/notes for all non-card (Checks/Wires/Zelle) transactions:**


| Txn     | Merchant (updated)        | Source | Note (description field)   |
| ------- | ------------------------- | ------ | -------------------------- |
| txn_004 | SF TENNIS CLUB            | Checks | Annual membership dues     |
| txn_007 | PACIFIC HEIGHTS APT       | Wires  | Monthly rent payment       |
| txn_009 | MARIA GARCIA              | Zelle  | Dogsitting                 |
| txn_016 | COLLEGEBOARD SAT          | Checks | SAT registration fee       |
| txn_019 | KAPLAN TEST PREP          | Checks | SAT prep course            |
| txn_023 | SF TENNIS CLUB            | Checks | Spring membership renewal  |
| txn_028 | VETERINARY CLINIC         | Checks | Annual wellness exam       |
| txn_040 | ADMISSIONS CONSULTING GRP | Checks | College admissions package |
| txn_042 | ZILLOW MORTGAGE APP FEE   | Checks | Mortgage application       |
| txn_045 | BAY AREA HOME INSPECT     | Checks | Pre-purchase inspection    |
| txn_046 | FIRST AMERICAN TITLE      | Checks | Title and escrow fees      |
| txn_047 | DOWN PAYMENT TRANSFER     | Wires  | Home down payment          |
| txn_048 | Michael Grand             | Zelle  | Kitchen remodel deposit    |


### 2. `src/components/exec-demo/ExecDemoSelectionDialog.tsx`

- Rename column header `"MCC Description"` → `"MCC Description / Note"`

### 3. `src/components/tepilot/PreviewTable.tsx`

- Rename column header `"Description"` → `"MCC Description / Note"`