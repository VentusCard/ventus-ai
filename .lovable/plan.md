

## Holistic ACH Outflow Analysis

### Current State
The Wallet Share Intelligence section focuses narrowly on **competitor financial institutions** (Marcus, Ally, Robinhood, etc.). The outflow categories are limited to: High-Yield Savings, Mortgage Refinance, Investment/Brokerage, Credit Cards, BNPL/Lending, Insurance.

### What Changes
Expand to a **holistic ACH transaction analysis** covering all major outbound payment categories — not just competitor products but everyday obligations that represent the full picture of where customer money goes.

#### 1. Expand `getCompetitorOutflows()` in `src/lib/mockBankwideData.ts`
Add new entries for:
- **Rent/Property Management** (Zelle to landlords, property mgmt companies, RentCafe, Apartments.com)
- **Auto Loans** (Toyota Financial, Capital One Auto, Ally Auto)
- **Student Loans** (Navient, Nelnet, FedLoan, SoFi Student)
- **Utilities** (electric, gas, water — detected via payee name)
- **Insurance Premiums** (Geico, Progressive, State Farm — auto/home/life)
- **Childcare/Tuition** (daycare, private school, university tuition)
- **Subscription Platforms** (aggregated — streaming, SaaS, fitness memberships)

Add new `type` values to the `CompetitorOutflow` type: `'rent'`, `'auto_loan'`, `'student_loan'`, `'utility'`, `'insurance'`, `'childcare'`, `'subscription'`.

#### 2. Update `CompetitorOutflow` type in `src/types/bankwide.ts`
- Expand the `type` union to include the new categories
- Keep existing types intact

#### 3. Update `getOutflowByCategory()` in `src/lib/mockBankwideData.ts`
Add new category bars: Rent/Housing, Auto Loans, Student Loans, Utilities, Childcare/Tuition, Subscriptions.

#### 4. Update `CompetitorOutflowTable.tsx`
- Rename from "Competitor Outflow Rankings" to **"ACH Outflow Analysis"**
- Update subtitle to reflect holistic analysis
- Add `typeColors` entries for new category types

#### 5. Update `WalletShareView.tsx`
- Rename the Ventus Advantage banner text to reference holistic ACH intelligence rather than just competitor detection

#### 6. Add win-back recommendations for new categories
- Rent: offer direct deposit incentives to capture rent-paying customers
- Auto loans: refi opportunities
- Student loans: consolidation products

### Files Modified
- `src/types/bankwide.ts` — expand `type` union
- `src/lib/mockBankwideData.ts` — add data rows + categories
- `src/components/tepilot/insights/CompetitorOutflowTable.tsx` — rename headers, add type colors
- `src/components/tepilot/insights/WalletShareView.tsx` — update banner copy

