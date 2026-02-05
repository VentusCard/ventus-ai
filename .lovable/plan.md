
# Plan: Remove Financial Product Transactions from Supporting Signals

## Rationale
The goal of the Prepare Event dialog is to detect **early behavioral signals** that indicate a life event is approaching, allowing wealth managers to proactively engage clients. Financial product transactions (like 529 plans, trust setups, etc.) indicate the client has **already taken action**, meaning the wealth manager missed the opportunity.

## Transactions to Remove/Replace

| Event | Remove | Reason |
|-------|--------|--------|
| **retirement** | Wire - Trust Account Setup | Already set up trust = too late |
| **education** | ACH - 529 Plan Contribution | Already has 529 = too late |
| **wealth_transfer** | Northern Trust (trust admin), ACH - Community Foundation (DAF) | Already established wealth transfer vehicles |
| **family_formation** | ACH - 529 Plan Setup | Already opened 529 = too late |

## Replacement Signals (Early Behavioral Indicators)

| Event | New Signal | Why It's Early |
|-------|------------|----------------|
| **retirement** | HR consulting firm (benefit review) | Exploring options before decisions |
| **education** | College admissions consultant | Planning phase, not funding phase |
| **education** | High school graduation announcement | Life milestone indicator |
| **wealth_transfer** | Family office newsletter subscription | Research phase |
| **wealth_transfer** | Intergenerational family retreat | Planning discussions, not execution |
| **family_formation** | Prenatal vitamins / OB-GYN | Very early pregnancy signals |
| **family_formation** | Fertility clinic | Trying to conceive = earliest signal |

## Technical Changes

**File:** `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`

Update `transactionsByEventType` (lines 200-252):

```tsx
retirement: [
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Fidelity Investments', amount: 6500, date: 'Jan 15, 2026', relevance: '401k contribution increase' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'AARP Membership', amount: 16, date: 'Dec 28, 2025', relevance: 'Retirement association membership' },
  { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Viking Cruises', amount: 8500, date: 'Jan 20, 2026', relevance: 'Retirement travel planning' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1042 - Estate Planning Attorney', amount: 2500, date: 'Jan 18, 2026', relevance: 'Estate planning consultation' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Kiplinger Retirement Guide', amount: 29, date: 'Jan 8, 2026', relevance: 'Retirement planning research' },
],

education: [
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'College Board', amount: 98, date: 'Jan 12, 2026', relevance: 'SAT registration fees' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Princeton Review', amount: 1299, date: 'Dec 15, 2025', relevance: 'Test prep course' },
  { cardType: 'Travel Elite', cardLast4: '2234', merchant: 'Southwest Airlines', amount: 450, date: 'Jan 18, 2026', relevance: 'Campus visit travel' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Ivy Coach Admissions', amount: 3500, date: 'Jan 5, 2026', relevance: 'College admissions consulting' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Niche.com Premium', amount: 49, date: 'Dec 20, 2025', relevance: 'College research subscription' },
],

wealth_transfer: [
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Wire - Goldman Sachs Private Wealth', amount: 15000, date: 'Jan 8, 2026', relevance: 'Wealth advisory consultation' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1587 - Estate Planning Attorney', amount: 5500, date: 'Jan 18, 2026', relevance: 'Estate plan review meeting' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Sotheby\'s Appraisals', amount: 1200, date: 'Jan 20, 2026', relevance: 'Art and collectibles valuation' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Family Wealth Alliance', amount: 850, date: 'Jan 12, 2026', relevance: 'Family governance workshop' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Purposeful Planning Institute', amount: 395, date: 'Jan 15, 2026', relevance: 'Wealth transfer education seminar' },
],

family_formation: [
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Amazon Baby Registry', amount: 1850, date: 'Jan 15, 2026', relevance: 'Baby registry purchases' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Buy Buy Baby', amount: 1250, date: 'Jan 22, 2026', relevance: 'Nursery essentials and furniture' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'Motherhood Maternity', amount: 340, date: 'Jan 10, 2026', relevance: 'Maternity clothing purchase' },
  { cardType: 'Cashback Plus', cardLast4: '7891', merchant: 'Graco Baby', amount: 450, date: 'Jan 28, 2026', relevance: 'Infant car seat and stroller' },
  { cardType: 'Primary Checking', cardLast4: '5678', merchant: 'Check #1892 - Memorial Hospital', amount: 2500, date: 'Jan 30, 2026', relevance: 'Hospital pre-registration deposit' },
  { cardType: 'Platinum Rewards', cardLast4: '4532', merchant: 'The Bump Premium', amount: 79, date: 'Dec 18, 2025', relevance: 'Pregnancy tracking app subscription' },
],
```

## Summary

| Event | Removed | Added |
|-------|---------|-------|
| retirement | Trust Account Setup | Kiplinger Retirement Guide (research) |
| education | 529 Plan Contribution, Tuition Deposit | Ivy Coach Admissions, Niche.com Premium (research) |
| wealth_transfer | Northern Trust, Community Foundation DAF | Family Wealth Alliance workshop, Purposeful Planning seminar |
| family_formation | 529 Plan Setup | The Bump Premium (pregnancy app) |
