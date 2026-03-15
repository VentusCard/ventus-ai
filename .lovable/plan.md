

# Fix Unrealistic Source Assignments Across All Sample CSVs

## Problems Found

After auditing all six CSVs, there are several categories of unrealistic source assignments:

### 1. Small one-off payments on Checking (should be a card)
- **c1**: `STANFORD VISITOR PARKING` ($25) on Checking — a $25 parking meter charge would go on a card, not checking
- **c1**: `COLLEGEBOARD SAT` ($68) on Checking — online registration fees are typically paid by card
- **c6 (Chicago)**: `TENNIS LESSONS` ($120) on Checking — recurring coaching should be on a card
- **c6 (Chicago)**: `TENNIS TOURNAMENT` ($85) on Checking — entry fees are typically card payments

### 2. Local dining on Travel Card (customer is at home)
- **c3 (Chicago, Food & Home)**: `LOU MALNATIS PIZZERIA` on Travel Card — customer lives in Chicago, this is a local restaurant
- **c3**: `PEQUODS PIZZA` on Travel Card — same issue, local Chicago pizza
- **c5 (NYC)**: `UBER NYC` rides on Travel Card when used locally (not during a trip) — local rides should be Cashback Card

### 3. Inconsistent premium vs everyday logic
- **c1**: `OLIVE GARDEN` dinner on Travel Card — this is a local chain dinner, should be Cashback Card
- **c3**: `COMED` / `PEOPLES GAS` utilities on Checking is fine, but `BEST BUY` kitchen appliances on Checking could go either way (large purchase, but Best Buy is typically a card purchase for rewards)

## Proposed Source Assignment Rules

Apply these consistently across all CSVs:

| Rule | Source |
|------|--------|
| Recurring bills, utilities, rent, large home services | Checking |
| Large education tuition ($500+), legal/professional fees | Checking |
| Everyday groceries, gas, small dining, subscriptions | Cashback Card |
| Travel: flights, hotels, car rentals, and ALL spend while traveling | Travel Card |
| Premium fitness memberships, luxury fashion, fine dining, spa | Premium Card |
| Medical, pharmacy, health providers | HSA |
| Small one-off fees ($25–$100 like parking, registrations) | Cashback Card |
| Local Uber/Lyft rides (not during a trip) | Cashback Card |

## Files to Edit
- `src/lib/sampleData.ts` — fix ~12-15 source values across multiple CSVs

## Specific Fixes

**SAMPLE_CSV (c1)**:
- `STANFORD VISITOR PARKING` → Cashback Card
- `COLLEGEBOARD SAT` → Cashback Card  
- `OLIVE GARDEN` → Cashback Card

**SAMPLE_CSV_FOOD_HOME (c3)**:
- `LOU MALNATIS PIZZERIA` (both occurrences) → Premium Card (fine dining)
- `PEQUODS PIZZA` → Cashback Card

**SAMPLE_CSV_NYC_SPORTS_HOME_12 (c5)**:
- `UBER NYC` (local, non-trip rides like txn_ny025, txn_ny045) → Cashback Card

**SAMPLE_CSV_CHICAGO_TENNIS_WELLNESS_12 (c6)**:
- `TENNIS LESSONS` → Premium Card (aligns with other premium fitness)
- `TENNIS TOURNAMENT` → Cashback Card

