

## Update Transaction Table to 3 Columns + Rewrite Description → MCC Description

### Overview
Simplify the transaction preview table to show only 3 columns and repurpose the existing `description` CSV column to hold standard MCC descriptions instead of the current verbose text.

### Changes

**1. `src/lib/sampleData.ts`** — Rewrite the `description` column across all 6 CSVs

Replace every human-readable description with the standard MCC category label for that row's MCC code. Examples:

| MCC | Current description | New description |
|-----|---|---|
| 5814 | Coffee and pastry purchase | Eating Places, Restaurants |
| 5411 | Weekly grocery shopping | Grocery Stores, Supermarkets |
| 5655 | Yoga pants and sports bra | Family Clothing Stores |
| 7997 | Monthly gym membership | Membership Clubs, Recreation |
| 3000–3299 | Flight booking | Airlines, Air Carriers |
| 7011 | Hotel accommodation | Hotels, Motels, Resorts |
| 5912 | Prescription pickup | Drug Stores, Pharmacies |
| 4121 | Ride to downtown | Taxicabs and Rideshares |
| 5813 | Cocktails at bar | Drinking Places, Bars |
| 5944 | Birthday gift | Jewelry, Watch, Clock Stores |
| 7832 | Movie night | Motion Picture Theaters |
| 8011 | Doctor visit | Physicians, Medical Services |

All ~600 rows across the 6 CSV blocks will be updated.

**2. `src/components/exec-demo/ExecDemoSelectionDialog.tsx`** — Show only 3 columns

Update the table to display:
- **Merchant Name** — the raw descriptor string (e.g., `STARBUCKS COFFEE #1234`)
- **MCC** — the 4-digit code (e.g., `5814`)
- **MCC Description** — the generic label (e.g., `Eating Places, Restaurants`)

Remove the Date, Amount, Zip Code, Source, and Transaction ID columns from the table. Simplify the `RawRow` interface and parser accordingly.

### Files
1. `src/lib/sampleData.ts` — rewrite `description` field in all 6 CSVs to MCC description labels
2. `src/components/exec-demo/ExecDemoSelectionDialog.tsx` — reduce table to 3 columns

