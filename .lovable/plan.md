## Goal

Add foundational financial spending patterns to the first executive demo dataset (Sarah Mitchell, `SAMPLE_CSV` in `src/lib/sampleData.ts`) so basic banking signals — monthly income, monthly rent, and a monthly car lease — appear alongside the existing lifestyle transactions, with **at least one entry every month** across the full date range.

## Current state

`SAMPLE_CSV` spans Apr 2024 → Jul 2026 with rich lifestyle signals but no payroll, only a single rent entry, and no auto lease. Some months also have sparse activity.

## Changes

Edit only `SAMPLE_CSV` in `src/lib/sampleData.ts`. Add three recurring monthly series across the full ~28-month window (Apr 2024 → Jul 2026). **ACH / lease entries put the real bank descriptor in `merchant_name` and leave `description` blank**, matching how these arrive in a bank feed:

1. **Monthly payroll** — `merchant_name`: `MERIDIAN CAPITAL DES:PAYROLL` · `+9500.00` · 1st of each month · source `ACH` · MCC blank · `description` blank. One entry per month, every month in range — guarantees no empty months.
2. **Monthly rent** — `merchant_name`: `PACIFIC HEIGHTS APT DES:RENT` · `2800.00` · 1st of each month · source `ACH` · MCC blank · `description` blank. Replaces the lone existing rent row and extends as a recurring series.
3. **Monthly auto lease** — `merchant_name`: `VW CREDIT INC DES:AUTO DEBIT` · `685.00` · 15th of each month · source `ACH` · MCC Blank · `description` blank.

Net effect: ~84 new rows interspersed chronologically among the existing ~68 lifestyle rows. Payroll/rent fall to "Miscellaneous" via the existing MCC map, which is correct — they should read as raw banking signals, not lifestyle.

## Out of scope

- No changes to other sample customers, `execDemoData.ts`, persona pills, or UI components.
- No new MCC mappings (6141 falls through to Miscellaneous — fine for now).
- No backend/edge-function changes.