

# Plan: Add Checking Account Transactions for Large Fees/Payments

## Overview
Add checking account transactions only where credit cards would be impractical or incur extra fees - primarily for large payments to attorneys, deposits, and financial institution transfers.

## Changes

### Update Mock Data in PrepareEventDialog.tsx

Add checking account transactions only for appropriate payment types:

| Keep as Credit Card | Change to Checking Account |
|---------------------|---------------------------|
| Costco, retail stores | Attorney fees (large amounts) |
| Travel bookings | Earnest money deposits |
| Subscriptions, memberships | Tuition deposits |
| Regular purchases | Wire transfers to institutions |
| | Large care facility payments |

### Example Updates by Event Type

**Retirement:**
- Keep: Fidelity (credit card contribution portal), AARP membership, Viking Cruises
- Add: Check #1042 to Estate Attorney ($2,500), Wire to Trust Account

**Education:**
- Keep: Princeton Review, Southwest Airlines
- Add: Check #2156 for Tuition Deposit ($5,000), ACH to 529 Plan

**Home Purchase:**
- Keep: Home Depot, Lowe's, U-Haul
- Add: Check #3201 for Earnest Money ($15,000), Wire for Closing Costs

**Wealth Transfer:**
- Keep: Trust & Will, LegalZoom (online services)
- Add: Check #1587 to Estate Attorney ($3,500)

**Business Liquidity:**
- Keep: BizBuySell Premium (subscription)
- Add: Check #4023 to M&A Advisory ($10,000), Wire to Escrow

**Family Formation:**
- Keep: Buy Buy Baby, Pottery Barn Kids, Delta Airlines
- Add: ACH to 529 Plan Setup ($1,000)

**Elder Care:**
- Keep: CVS Pharmacy
- Add: Check #2341 to Sunrise Senior Living ($8,500), ACH to Home Care Service

## File to Modify

| File | Changes |
|------|---------|
| `src/components/tepilot/advisor-console/PrepareEventDialog.tsx` | Add checking account transactions for attorney fees, deposits, and large institutional payments in `generateEventPreparationData` |

