## Goal
Strip all housing rent and payroll/income transactions from the example transaction datasets used in the `/bankdemo` demo flow.

## Scope
Only the CSV fixtures in `src/lib/sampleData.ts`. All 24 matching rows sit in `SAMPLE_CSV` (customer 1). The other five customer CSVs contain no PAYROLL or DES:RENT rows, so they need no changes.

## Rows to remove (24 total, lines 222–321)
- Payroll inflows: `txn_p017` … `txn_p028` — `MERIDIAN CAPITAL DES:PAYROLL` (12 rows)
- Housing rent outflows: `txn_r017` … `txn_r028` — `PACIFIC HEIGHTS APT DES:RENT` (12 rows)

## Preserved (intentionally not touched)
- Car/gear "rental" merchant rows (Budget Rent-A-Car, Ski Rental, etc.) — travel spend, not housing rent.
- Non-payroll inflows labeled "deposit" that are actually spend or transfers (DraftKings sportsbook deposits, Zelle remodel deposit, annuity funding). These aren't payroll/income; leaving as-is unless you want them gone too.
- Demographic `deposit: "$85K"` fields on customer profiles (metadata, not transactions).

## Downstream effects to expect
- Income card in the selection dialog will drop to $0 for customer 1 (no inflows remain in that CSV).
- Persona/lifestyle synthesis will no longer see rent as a recurring housing signal for customer 1.
- No code changes needed — parsers ignore missing rows.

## Question
Do you also want the non-payroll "deposit" rows (DraftKings sportsbook deposits, Zelle remodel deposit, Fidelity annuity deposit, Four Seasons event deposit) removed? My read is no — they're spend/transfers, not income — but confirm if you want a stricter sweep.