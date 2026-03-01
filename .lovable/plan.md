

# Add Source Column to TEPilot Sample Data

## Overview
Add a `source` column to all 6 sample CSV datasets in TEPilot, representing the card or account each transaction was made with (e.g., "Cashback Card", "Travel Card", "Checking Account"). No business card -- personal spending only.

---

## Source Types (Personal Only)
- **Checking** -- rent/mortgage, utilities, recurring bills, large one-time purchases
- **Cashback Card** -- groceries, gas, everyday retail, subscriptions
- **Travel Card** -- flights, hotels, ride-shares, dining out, travel-related spending
- **Premium Card** -- luxury purchases, high-end dining, large retail, wellness/spa
- **HSA** -- medical/health expenses (doctor visits, pharmacy, prenatal)

---

## Files to Modify

### 1. `src/types/transaction.ts`
- Add `source?: string` to the `Transaction` interface

### 2. `src/lib/columnDetection.ts`
- Add `source` field to `FIELD_KEYWORDS` with keywords: `"source", "account", "card", "cardtype", "accounttype", "fundingsource", "paymentmethod"`
- Add `source: null` to the default mapping object

### 3. `src/lib/parsers.ts`
- Add `source` case to the `switch` block in `validateTransaction` (around line 460)
- Include `source` in the returned Transaction object (around line 511)

### 4. `src/lib/sampleData.ts` (all 6 CSV datasets)
Append `,source` to each CSV header and add appropriate source value to every row. Assignment logic per dataset:

| Transaction Type | Source |
|---|---|
| Flights, hotels, car rentals, ride-shares, travel dining | Travel Card |
| Groceries, gas, everyday retail, subscriptions | Cashback Card |
| Utilities, rent, mortgage, large bills, insurance | Checking |
| Luxury dining, spa, premium fitness, high-end retail | Premium Card |
| Doctor visits, pharmacy, prenatal, medical | HSA |

This applies consistently across all 6 datasets:
- **Dataset 1** (Sarah, SF) -- ~75 rows
- **Dataset 2** (James, Austin sports/wellness) -- ~78 rows
- **Dataset 3** (Emily, Chicago food/home) -- ~78 rows
- **Dataset 4** (Michael, SF family travel 12mo) -- ~205 rows
- **Dataset 5** (Amanda, NYC sports/home 12mo) -- ~241 rows
- **Dataset 6** (Robert, Chicago tennis/wellness 12mo) -- ~248 rows

### 5. `src/components/tepilot/PreviewTable.tsx`
- Add a "Source" column to the table header
- Display source value as a small badge in each row (only if present)

### 6. `src/components/tepilot/ResultsTable.tsx`
- Add "Source" column display (badge/chip) if present in the enriched data

---

## Life Event Signals (Already Present, Preserved)
The existing life-event-signaling transactions at the end of each dataset remain unchanged in content. They just get an appropriate source assigned:

| Dataset | Life Event | Source for Signal Txns |
|---|---|---|
| 1 - Sarah | Education planning (SAT, campus tour) | Checking |
| 2 - James | Family formation (nursery, prenatal) | Cashback Card / HSA |
| 3 - Emily | Home purchase (mortgage, inspection, title) | Checking |
| 4 - Michael | Retirement + wealth transfer (estate attorney, realty) | Checking |
| 5 - Amanda | Wealth transfer (estate attorney, trust, tax planning) | Checking |
| 6 - Robert | Wedding + baby (engagement ring, venue, prenatal, estate) | Premium Card / HSA / Checking |

---

## Technical Notes
- The `source` field is optional on `Transaction` to maintain backward compatibility with user-uploaded files that don't have this column
- Column detection will auto-map "source", "account", "card" headers
- No database changes needed -- this is all client-side sample data

