# Audit and round Ricky's signal numbers (Section 4)

## Goal
Every number shown on the Section 4 signal pills (4.2) and their detail slides (4.3: key details, merchants, outside evidence) is consistent with the underlying transactions and shown as a rounded figure — nearest hundred under $10K, nearest thousand at $10K and above, compact M for millions (e.g. $1.5M, $3.5M).

## Scope
- Rounded: pill amounts, nested attributes, key-detail lines, annual/EOY estimates, monthly ranges, year-to-date totals, outside-evidence figures.
  - Examples: $189,490.32 EOY surplus -> ~$189,000; $3,264.24/year general spending -> ~$3,300/year; monthly surplus $15,790.86 -> ~$15,800; idle cash $8,124.19 -> ~$8,100; "Payouts grew from $1,216 to $2,486" -> "$1,200 to $2,500"; "$2,460 hospital" -> "$2,500"; "$6,100 trip" stays; "$35,700 paid YTD" -> "$36,000".
- Also rounded: everything on the 4.3 detail pages, including the supporting transactions table amounts (raw and enriched sides), e.g. ($184.62) -> ($200), ($3,500.00) -> ($3,500), $12,368.40 -> $12,000. The raw description text itself stays as-is.
- Not rounded: phone-mockup scenes, slide 2.1/2.2 rail ledgers, and other sections.

## Audit steps
1. List every pill and detail figure and recompute it from the fixture transactions (monthly amounts, ranges, YTD totals, annualized estimates, counts).
2. Fix any mismatch between a pill, its nested attributes and its detail lines (same number everywhere, same rounding).
3. Apply the rounding rule at display only; calculations stay in exact cents.
4. Report the list of mismatches found and corrected.

## Technical details
- Add a `roundDisplayAmount(cents)` helper next to `deckmoCashFlow.ts` (hundreds <$10K, thousands >=$10K, M >=$1M) and use it where cash-flow/general-spending values are formatted.
- Update hardcoded strings in `deckmoScript.ts` (signal detail key details) and `deckmoSignalAttributes.ts` (pill attribute segments).
- Add a test that every Section 4 pill/detail dollar figure matches the rounding rule and that recomputed totals match their rounded labels; update existing cash-flow tests to assert rounded display values while keeping exact-cent internal assertions.
