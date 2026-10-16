# Add a "General spending" pill as the first Behavioral signal

## What it shows
A new internal Behavioral pill, placed **first** in the Behavioral family (before bi-weekly tennis), in the standard pill format:

> (Annual estimate) ($3,264/year) in (general spending)

- Annual estimate = monthly average of his everyday spending (Jan–Sep 2026) × 12, same annualization rule as the EOY surplus. Helper computes the exact value; ≈ $3,264.21.
- "General spending" basket = everyday living expenses only: **groceries** (Whole Foods, Trader Joe's, Target, Costco), **gas** (Shell), **electricity** (PG&E), **internet** (Comcast), **dining** (Four Seasons, Starbucks), **pharmacy** (CVS), **rideshares** (Uber ×2), **clothing** (Nordstrom), **books** (Books Inc), **digital subscription** (Apple $9.99).
- Excluded on purpose: rent ($6,800), insurance ($1,420), IRS taxes, business expenses (Gusto, office supply, Bench), home-purchase items, betting, and **pet items (Petco/Chewy/vet)** so the basket doesn't overlap the external "High pet expenditure" pill.

## Pop-up
Same rich pop-up as other pills, with the two-tier raw-vs-enriched supporting-transaction table:
- New evidence kind `general-spending` — rows come from a helper, not from a transaction `signals` tag.
- Facts: annual estimate with methodology ("monthly average Jan–Sep 2026 × 12; annualized estimate, not an observed total"), monthly average amount, basket breakdown by category, and the exclusion note.

## Changes
1. `src/lib/deckmoCashFlow.ts` — add `rickyGeneralSpending()`: explicit allowlist of everyday transaction IDs from the Ricky fixture, returns `{ evidence, monthlyCents, annualCents }` (integer cents, average × 12).
2. `src/lib/deckmoScript.ts` — add `RICKY_GENERAL_SPENDING_LABEL = "General spending"`; insert story clause as the first Behavioral pill (prose connective adjusted, e.g. "His routine starts with … , along with …" so tennis still reads naturally); add `RICKY_SIGNAL_DETAILS` entry with facts and merchant list.
3. `src/lib/deckmoSignalAttributes.ts` — add context attributes and inline phrase segments for the new label.
4. `src/components/deckmo/RickySignalStory.tsx` — resolve the `general-spending` evidence kind to `rickyGeneralSpending().evidence` for the pop-up table.
5. Tests — extend `scripts/deckmoCashFlow.test.ts` (or add a focused test): assert the exact annual cents, that rent/insurance/tax/pet rows are excluded, the pill is the first Behavioral entry and internal, and inline segments contain the amount and "general spending". Run with `bun test`.

## Out of scope
No changes to other pills, ordering rules, reveal animation, or navigation.

## Verification
- `bun test` — all suite tests pass.
- Browser check of Section 4 beats (4.1 headings, 4.2 pill revealed in Behavioral, pop-up table renders all rows) at two desktop sizes.
