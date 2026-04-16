

# Update Sarah Mitchell's Sample Dataset — 2-Year Span

## Overview
Replace Sarah's `SAMPLE_CSV` with a new **50-transaction** dataset spanning **Nov 2024 – Oct 2026** (two full years). Incorporates all previously agreed requirements plus an annual Hawaiian trip each summer.

## Transaction Breakdown (50 total)

| Category | Count | Months | Details |
|----------|-------|--------|---------|
| **Seasonal — Tennis** | 5 | Apr–Sep (both years) | Tennis club fees, racket, court rental, apparel |
| **Seasonal — Ski** | 4 | Nov–Jan (both years) | Lift tickets, ski gear, lodge, mountain dining |
| **Monthly Recurring — Pets** | 5 | Spread across 2 years | CHEWY.COM, PETCO, vet visit |
| **Life Event — College Prep** | 4 | Year 1–2 | SAT registration, Kaplan prep, campus tour, admissions consulting |
| **Life Event — New Home** | 4 | Year 2 | Mortgage app fee, home inspection, title/escrow, down payment wire |
| **Hawaii Trip Year 1** | 4 | Jul 2025 | Hawaiian Airlines flight, Maui resort, snorkel tour, local dining |
| **Hawaii Trip Year 2** | 4 | Jul 2026 | Hawaiian Airlines flight, Big Island resort, volcano tour, local dining |
| **Risky/Obfuscated** | 3 | Scattered | "DIGITAL ENT SVCS" (MCC 7995), "INTL PAYMENT PROC 8742" (MCC 7801), "PRIVATE MEDIA GRP LLC" (MCC 5967) |
| **Everyday** | ~17 | Throughout | Groceries, gas, coffee, streaming, rideshare, pharmacy, clothing |

## Sources Used
Cashback Card, Premium Card, Checks, Wires, Zelle

## File Changes

### 1. `src/lib/sampleData.ts`
- **SAMPLE_CUSTOMER_1**: Update `familyStatus` to `"Married, 1 teen dependent"`
- **SAMPLE_CSV**: Replace entire CSV string with new 50-row dataset (Nov 2024 – Oct 2026)
- **SOURCE_COLORS** (if exists) or add color mappings for `"Checks"`, `"Wires"`, `"Zelle"`

### 2. `src/lib/demoData.ts`
- Update Sarah's (c1) `trips` array to include Maui and Big Island Hawaiian trips
- Update `lifeEvents` to reflect College Prep and New Home Purchase
- Adjust `topPillars` and `pillarBreakdown` to reflect the new spending mix

### Key Design Decisions
- Hawaii trips use different islands each year (Maui Year 1, Big Island Year 2) for variety
- Risky transactions use obfuscated merchant names — enrichment engine detects via MCC codes
- Down payment uses Wire source; Zelle used for contractor/service payments
- Tennis and ski transactions appear only in their respective seasons across both years
- Dates maintain strict chronological order across the full 24-month window

