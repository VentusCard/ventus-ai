# Round only the signal pills; detail pages show exact numbers

## 1. Detail pages (4.3) back to exact figures
- Transactions table: original amounts with cents again, e.g. ($184.62), $12,368.40.
- Key details: exact values again, e.g. EOY surplus $189,490.32, idle cash $8,124.19/month, general spending $3,264.24/year, club dues $1,450, resort $2,960, Spotify $11.99 → $12.99 → $13.99, hospital $2,460, childcare $2,180, Amex $3,296.74 rising to $4,862.19 and $35,735.74 year to date, payouts $1,216.44 to $2,486.32, betting $65 to $480, payroll $22,793 in Jan to $24,733 in Sep (monthly).
- Observed monthly payments and the Amex annualized note: exact cents.

## 2. Signal pills (4.2) stay rounded
- Rounding rule: nearest hundred under $10K, nearest thousand from $10K, one-decimal millions from $1M.
- Keep the earlier fixes that made pills match the transactions: tennis $4,300, Hawaii $8,000, media $1,500, home $1.5M+, income $23,000–$25,000.
- The media detail line "Recurring media base around $120 per month" is restored. The pill's $1,500 a year still holds as an annual estimate.

## 3. Income title
- Rename "Stable $22–26K monthly income" to "Stable $23–25K monthly income" so the title matches the pill and the paychecks.

## Technical details
- Detail fact strings in `src/lib/deckmoScript.ts` use exact currency formatting (Intl with cents) instead of `formatRoundedMoney`.
- `RickySignalStory.tsx`: the table renders `transaction.amount` raw again; monthly payments and the Amex note use an exact formatter.
- `deckmoSignalAttributes.ts`: split into `formatSignalMoney` (exact, for details) and `formatSignalPillMoney` (rounded, for pill segments and attributes).
- Rename `RICKY_SIGNAL_LABELS.income`.
- Tests: pills contain no cents; detail facts contain the exact values listed above; ledger table shows exact amounts. Remove the obsolete ledger-rounding test.
