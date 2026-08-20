# Make signal populations proportionate to one book size

Right now the demo carries three different "book sizes" that never reconcile:

- `src/components/tepilot/insights/customers/CustomerPortfolioStats.tsx:37` hardcodes **68.2M** customers in the book and scales the 15-record sample directory by `68.2M / 15`.
- `src/lib/intelligenceSignalStats.ts:70` uses **75M** total customers with **71.4M** enriched profiles, and every Overview signal-family and sub-signal count is derived from that.
- The Segments sub-tab header (metrics chips next to the search bar) reports raw sample counts and "% of book" against the 15 sample records.

So a signal that reads "3.7M customers" on the Overview tab becomes "3 customers · 20% of book" once it is opened in Segments, and the family totals in the portfolio strip do not add up to the Overview family cards.

## What changes

1. **One source of truth.** A new `src/lib/bookScale.ts` holds the canonical book: 68.2M customers, the enriched-profile count derived from it (95.2% coverage), and helpers to convert a share into a population, a population into a share, and a sample-row count into a scaled population.

2. **Overview numbers rebase onto 68.2M.** `intelligenceSignalStats.ts` imports the constants instead of its own 75M / 71.4M literals. Family counts stay `enriched × coverage`; sub-signal counts stay `enriched × share`, so all Overview cards move down proportionally and remain internally consistent.

3. **Sub-signal shares get reconciled to their family.** The risk family currently claims 13% coverage while its six sub-signals sum to 15.3% — impossible. Sub-signal shares are normalized so each family's sub-signals sum to at most that family's coverage (risk shares scale down by the same factor; the other four families already fit and are left untouched).

4. **Segments tab reports the scaled population.** When a segment arrives from an Overview signal, the header chips show the real cohort, not the sample rows:
   - customers = the sub-signal's scaled population (e.g. 3.4M), falling back to the family population when a segment is family-level, and to a scaled count of the filtered sample for ad-hoc search/filter states
   - "of book" = that population ÷ 68.2M
   - signals and value scale by the same factor as the customer count
   - The results table keeps a small "representative sample of N profiles" caption so it is clear the 15 rows are a slice, not the cohort.
   - The segment banner's "N matches in the sample book" line uses the same scaled population.

5. **Portfolio strip stops inventing its own math.** `CustomerPortfolioStats` reads family/coverage numbers from `getSignalFamilyStats()` / `getSignalCoverage()` instead of scaling the 15-record sample, so the tiles and the distribution bar match the Overview signal-family cards exactly.

## Technical notes

- New file: `src/lib/bookScale.ts` (`BOOK_CUSTOMERS = 68_200_000`, `ENRICHMENT_RATE`, `ENRICHED_PROFILES`, `populationFor(share)`, `shareOf(population)`, `fmtCount` re-export).
- Edits: `src/lib/intelligenceSignalStats.ts` (constants + share normalization), `CustomerPortfolioStats.tsx`, `CustomersDirectoryView.tsx` (metric computation), `CustomerSearchBar.tsx` (chip labels only, if needed).
- Segment lookup: `CustomersDirectoryView` resolves the incoming `segment.label` against the family's `topSignals` from `getSignalFamilyStats()` to find the matching population; unmatched labels fall back to family-level population.
- Aggregate 24h/coverage figures in `getSignalCoverage` (signals detected, external signals) are rescaled by the same 68.2/75 ratio so they stay plausible against the new total.
- Display-only change: no data model, filtering, or backend changes; strict light theme preserved.
