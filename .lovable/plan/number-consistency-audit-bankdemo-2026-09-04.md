# Number consistency audit — /bankdemo

I audited every tab against the canonical book in `src/lib/bookScale.ts` (68.2M customers, 95.2% enrichment). Most of the demo is correctly derived. Six real inconsistencies remain, listed worst-first.

## What's wrong today

**1. Intelligence Database KPI strip is off by ~155x**
The four tiles at the top are hardcoded and disconnected from the book:

- "Customers profile enriched" shows **418,204** — the rest of the same page shows **64.9M** enriched (68.2M x 95.2%).
- "Enrichment coverage" shows **99%** — the coverage strip a few hundred pixels below shows **95.2%**.
- "External signals ingested (24h)" shows a **low-thousands** number borrowed from the System tab's taxonomy counter, while the External Intelligence card on the same screen shows **~1.04M** for the identically-labelled metric.
- "Activations routed (24h)" is a bare literal with no source.

**2. Campaign Studio and Segment Builder disagree on the book**
Segment Builder caps audiences at **68.2M** (correct). Campaign Studio caps at **75M** (`campaignStudioData.ts`). Identical selections give different ceilings in the same tab. A third, dead 75M copy sits in `campaignData.ts`.

**3. "233 signals" on the System tab doesn't match what's shown**
The Customer Intelligence Core banner reads "5 families · 233 signals," but the five families rendered directly below enumerate **56** signal types. 233 is the unrelated per-product automated-flow trigger count from the Automated Flows tab.

**4. Geographic data implies a 240M book**
In `mockBankwideData.ts`, the region rows sum to **111.6M** and the state rows to **45M** (240.2M across all geography records), while the same file declares the book as 68.2M. This feeds the state map and wallet-share geography views.

**5. Revenue opportunities imply a 126M book**
The opportunity list on the Intelligence Database shows per-opportunity "users" figures that total **~126M** — 1.85x the whole book — with no indication the cohorts overlap.

**6. Product penetration implies a 75M book**
`financialJourneyData.ts` product rows (e.g. Checking 58.5M at 78% penetration) are all computed off a legacy 75M base.

## Fix plan

1. **KPI strip** — rewire all four tiles to `bookScale.ts`: enriched = `fmtCount(ENRICHED_PROFILES)` (64.9M), coverage = `ENRICHMENT_RATE` (99.9%), external signals = `getSignalCoverage().externalSignals24h` (the same source the card below uses), activations = a derived share of that flow rather than a literal.
2. **Campaign Studio** — point `campaignStudioData.ts` `BASE_USERS` at `BOOK_CUSTOMERS`; delete the dead duplicate estimator in `campaignData.ts` so only one definition of the book survives.
3. **System tab banner** — replace the static "233 signals" with the live count of signal types in the `SIGNALS` array on that page (56), so the caption matches the cards beneath it.
4. **Geography** — rescale every region and state `userCount` / `accountCount` in `mockBankwideData.ts` by 68.2M / 111.6M so region rows sum exactly to the book, with a largest-remainder pass so the parts hit the total exactly; scale state rows to their parent region the same way. Spend figures scale by the same factor to keep spend-per-customer stable.
5. **Revenue opportunities** — rescale `affectedUsers` so the set fits inside the book, and label the panel's figures as overlapping cohorts where they legitimately are.
6. **Product penetration** — rebase `financialJourneyData.ts` so `customerCount = penetrationRate x 68.2M`, keeping every penetration percentage as authored.
7. **Guardrails + verification** — add a small assertion script that checks, for every dataset, that parts sum to their stated totals and nothing exceeds the book; run the build; and Playwright-check the Intelligence Database, System, Campaigns and Wallet Share tabs to confirm the on-screen figures reconcile.

## Technical notes

Files touched: `src/components/tepilot/insights/dashboard/IntelligenceKpiStrip.tsx`, `src/lib/campaignStudioData.ts`, `src/lib/campaignData.ts`, `src/components/tepilot/insights/CapabilitiesView.tsx`, `src/lib/mockBankwideData.ts`, `src/lib/financialJourneyData.ts`.

No backend, schema or business-logic changes — every edit is presentation data derived from `bookScale.ts`. Rounding uses the same largest-remainder approach already added to Automated Flows, so displayed parts add up to displayed totals rather than drifting by a rounding unit.

Already correct, left alone: signal family stats (`intelligenceSignalStats.ts`, properly rebased from 75M to 68.2M), customer portfolio stats, flow governance counts (220 ready + 13 pending = 233), Automated Flows audiences, advisor-scoped counts in the AI Coworker tab (142 clients is one advisor's book, not the institution's).