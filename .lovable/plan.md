# Positive monthly cash-flow figures

## Adjustment
- Exclude only Ricky’s one-time **$315,000 home escrow payment** from the January–September 2026 monthly cash-flow calculation.
- Show **monthly surplus $15,790.86** and **idle cash $8,124.19** in the existing compact Financial signal, with no layout changes.
- Explain the home-purchase exclusion in the pop-up. Keep the payment in the original ledger and home-purchase supporting evidence, but omit it from cash-flow supporting transactions.
- Leave the illustrative **$25,000 Demographics balance**, payroll, savings, investing, and all other spending unchanged. Do not force positive signs or replace calculated figures with invented amounts.

## Technical details
- Update `deckmoCashFlow.ts` to exclude the specific escrow transaction, keeping integer-cent calculations and the nine-month averaging window.
- Update the cash-flow explanation in `deckmoScript.ts` and the stored calculation rule to reflect this approved exception.
- Update tests to assert the exact positive amounts and escrow exclusion while retaining transfer/settlement exclusions.
- Run relevant tests and verify the Financial signal and its pop-up on both Section 4 beats.