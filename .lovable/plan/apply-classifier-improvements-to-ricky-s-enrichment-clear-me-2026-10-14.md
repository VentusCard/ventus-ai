# Apply classifier improvements to Ricky's enrichment + clear merchant names

Scope: the deck's enrichment for Ricky's transactions, which feeds the Section 4 pop-up tables. The live classifier itself is not changed.

## 1. Clear, descriptive merchant names (every row)
Each merchant name should say who it is and, for transfers, what kind of transaction it is. No raw bank abbreviations.

| Raw string | Merchant shown |
|---|---|
| ACH DEBIT FID BKG SCHEDULED XFER | Fidelity Brokerage Scheduled Transfer |
| ACH DEBIT MARCUS BY GOLDMAN SACHS SAVINGS | Marcus by Goldman Sachs Savings Transfer |
| ACH CREDIT HP INC PAYROLL DIR DEP | HP Inc. Payroll Direct Deposit |
| ACH DEBIT AMERICAN EXPRESS EPAYMENT | American Express Card Payment |
| ACH CREDIT STRIPE / SQUARE PAYOUT | Stripe Payout / Square Payout |
| ACH DEBIT DK CROWN WALLET FUNDING | DraftKings Wallet Funding |
| ACH CREDIT IRS TREAS TAX REF | IRS Tax Refund |
| ACH DEBIT IRS USATAXPYMT | IRS Tax Payment |
| OUTGOING WIRE PACIFIC TITLE ESCROW | Pacific Title & Escrow Wire |
| ZELLE PAYMENT TO ALEX R | Zelle to Alex R. |

Card merchants keep their clean brand names (Whole Foods Market, Netflix, and so on). Every row gets a quick check so no abbreviations are left.

## 2. Use the platform's standard category names
Adopt the classifier's standard categories from the audit: Payroll, Tennis, Savings & Deposits, Investments, Flights, Hotels & Lodging, Tours & Activities, Travel Insurance, Coffee & Cafes, Dining Out, Movies & Theater, Books & Magazines, Concerts & Events, Veterinary Care, Childcare & Education, Furniture & Decor, Rent & Mortgage, Medical & Doctor, Clothing, Software & Apps, and Professional Services (LegalZoom, keeping "LLC Formation" as a subcategory).

## 3. Fix the real misses
- IRS tax refund: Income & Inflows → Tax Refunds → "Tax Refund", annual.
- Amex payments: subcategory "Credit Card Payment" instead of "Monthly Payment".

## Kept as-is (the deck is better)
Home Purchase grouping, food-business rows, Fidelity as Investments (consistently), DraftKings as Gaming → Sports Betting, Zelle to people as P2P, Daniel K tennis lessons, Four Seasons as Fine Dining, streaming under Entertainment, and cadence from the actual ledger.

## Checks
- Every signal pill still finds its supporting transactions. Matching uses the raw strings, so it is unaffected.
- A new test checks that no merchant name contains a raw abbreviation (FID BKG, ACH, XFER, DIR DEP, EPAYMENT) and that the tax refund is classified.
- Run the existing deck tests; verify a few pop-ups (Fidelity, Goldman Marcus, Income) in the live deck.

## Technical details
- Edits limited to `src/lib/deckmoRickyEnrichment.ts` (rule table) plus a test in `scripts/`.
- If any signal summaries or tests key off old category names (e.g. "Racquet Sports", "Employment Income"), update them in the same change.
