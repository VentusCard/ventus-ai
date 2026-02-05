

# Plan: Improve Supporting Transactions Realism and Specificity

## Problem Analysis

The current mock transactions have some weak connections to their life events:

| Event | Problematic Transaction | Issue |
|-------|------------------------|-------|
| family_formation | Delta Airlines ($650) | "Family visit travel" is a stretch for baby planning |
| family_formation | Only 4 transactions | Should have more baby-specific evidence |
| wealth_transfer | Only 3 transactions | Thin evidence for such a major event |
| business_liquidity | Only 3 transactions | Needs more M&A-specific signals |
| elder_care | CVS Pharmacy | Too generic - could be anything |

## Revised Transaction Sets

### Retirement (Keep - already strong)
Existing transactions are tightly coupled: Fidelity 401k, AARP, Viking Cruises, Estate Attorney, Trust Account.

### Education (Keep - already strong)
Existing transactions are specific: College Board, Princeton Review, campus visits, tuition deposit, 529.

### Home Purchase (Keep - already strong)
Existing transactions fit well: Home Depot, Lowe's, U-Haul, earnest money, closing costs.

### Family Formation (Replace)
**Remove:** Delta Airlines (weak connection)
**Add more specific signals:**
- OB-GYN office / prenatal care
- Amazon Baby Registry
- Maternity/paternity clothing
- Infant car seat purchase
- Hospital pre-registration
- Doula or birthing class

### Wealth Transfer (Expand)
**Add more signals:**
- Goldman Sachs Private Wealth (advisory)
- Charitable foundation setup
- Family office consultation
- Appraisal services for assets

### Business Liquidity (Expand)
**Add more signals:**
- Due diligence data room service
- Business broker retainer
- Intellectual property valuation
- Non-compete agreement legal fees
- Key employee retention planning

### Elder Care (Replace weak signals)
**Replace:** Generic CVS with more specific signals
**Better signals:**
- Medical alert system subscription
- Home modification (grab bars, ramps)
- Geriatric care manager consultation
- Medicare supplement insurance
- Meal delivery services (Meals on Wheels)

## Technical Changes

**File:** `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`

Update `transactionsByEventType` in the `generateEventPreparationData` function with revised transaction lists:

```tsx
family_formation: [
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Amazon Baby Registry', amount: 1850, date: 'Jan 15, 2026', relevance: 'Baby registry purchases' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Buy Buy Baby', amount: 1250, date: 'Jan 22, 2026', relevance: 'Nursery essentials and furniture' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Motherhood Maternity', amount: 340, date: 'Jan 10, 2026', relevance: 'Maternity clothing purchase' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Graco Baby', amount: 450, date: 'Jan 28, 2026', relevance: 'Infant car seat and stroller' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - 529 Plan Setup', amount: 1000, date: 'Feb 1, 2026', relevance: 'Education savings account opened' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1892 - Memorial Hospital', amount: 2500, date: 'Jan 30, 2026', relevance: 'Hospital pre-registration deposit' },
],

wealth_transfer: [
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Goldman Sachs Private Wealth', amount: 15000, date: 'Jan 8, 2026', relevance: 'Wealth advisory retainer' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Northern Trust', amount: 2500, date: 'Jan 12, 2026', relevance: 'Trust administration setup' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1587 - Estate Planning Attorney', amount: 5500, date: 'Jan 18, 2026', relevance: 'Comprehensive estate plan drafting' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Sotheby\'s Appraisals', amount: 1200, date: 'Jan 20, 2026', relevance: 'Art and collectibles valuation' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - Community Foundation', amount: 10000, date: 'Jan 25, 2026', relevance: 'Donor-advised fund contribution' },
],

business_liquidity: [
  { cardType: 'Business Platinum', cardLast4: '5678', merchant: 'Merrill DataSite', amount: 2400, date: 'Jan 5, 2026', relevance: 'Virtual data room for due diligence' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #4023 - Deloitte M&A Advisory', amount: 25000, date: 'Jan 12, 2026', relevance: 'Sell-side advisory retainer' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Business Valuation Services', amount: 8500, date: 'Jan 15, 2026', relevance: 'Certified business appraisal' },
  { cardType: 'Business Platinum', cardLast4: '5678', merchant: 'IP Valuation Partners', amount: 3500, date: 'Jan 18, 2026', relevance: 'Intellectual property assessment' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #4089 - Jackson Walker LLP', amount: 7500, date: 'Jan 22, 2026', relevance: 'Transaction legal counsel' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Escrow Deposit', amount: 50000, date: 'Jan 28, 2026', relevance: 'Transaction escrow funding' },
],

elder_care: [
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Medical Guardian', amount: 350, date: 'Jan 10, 2026', relevance: 'Medical alert system subscription' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Home Depot - Mobility', amount: 890, date: 'Jan 15, 2026', relevance: 'Grab bars and accessibility modifications' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Aging Life Care Association', amount: 450, date: 'Jan 18, 2026', relevance: 'Geriatric care manager consultation' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - AARP Medicare Supplement', amount: 280, date: 'Jan 20, 2026', relevance: 'Medicare supplemental insurance premium' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #2341 - Sunrise Senior Living', amount: 12000, date: 'Jan 25, 2026', relevance: 'Assisted living community deposit' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'ACH - Home Instead Services', amount: 3200, date: 'Jan 28, 2026', relevance: 'In-home caregiver weekly payment' },
],
```

## Summary of Changes

| Event | Before | After |
|-------|--------|-------|
| family_formation | 4 txns (1 weak) | 6 txns (all baby-specific) |
| wealth_transfer | 3 txns | 5 txns (wealth planning focused) |
| business_liquidity | 3 txns | 6 txns (M&A process specific) |
| elder_care | 4 txns (1 weak) | 6 txns (caregiving focused) |

