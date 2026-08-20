# Customer Intelligence Database: spacing rhythm + Ventus-anchored priority cards

Two fixes on the Intelligence Database overview (`/bankdemo` → Intelligence Database → Overview).

## 1. Consistent spacing

Today the page mixes several rhythms: the outer stack is `space-y-3`, but section headings add their own `pt-1`, some cards use `p-4` (Taxonomy, External Intelligence) while others use `px-4 pt-3 pb-2 / pb-4` (ChartCard, Live Stream) or `px-3 py-2.5` (coverage tiles), and the portfolio bar uses yet another padding. The result is uneven gaps between blocks and mismatched internal padding across neighbouring cards.

Fix:
- One vertical rhythm for the page: consistent gap between every top-level block, and section headings become a labelled block with the same spacing above/below rather than ad-hoc `pt-1`.
- One card padding standard: all flat cards (Taxonomy Coverage, External Intelligence, Signal coverage tiles, Portfolio context) adopt the same header/body padding as ChartCard, so cards sitting side by side line up.
- Grid gaps standardised to a single value across all rows (coverage strip, family board, live stream row, chart rows).
- No layout restructuring — same components, same order.

## 2. Priority cards reflect what Ventus does

The three cards at the top currently render generic portfolio gaps pulled from the mock revenue-opportunity list ("Gen Z Low Engagement", "Southeast Region Underperformance"). These read like a consulting deck, not like Ventus capabilities.

Rewrite them so each card is a Ventus action, grounded in signals it detected:

1. **Life-event signals ready to act on** — customers with a fresh life event detected from enriched transactions; action is exporting the segment into Customer Segments.
2. **Personalized offers waiting to ship** — customers whose behavioral + financial signals map to a specific product or deal; action is opening Personalized Deals.
3. **Outbound wallet share Ventus can win back** — spend leaving the bank detected in enriched transactions; action is launching an automated flow.

Each card keeps the same visual shape (icon, tone, value/customer counts, one-line insight) but gains:
- A capability label instead of "High priority / Opportunity" (e.g. "Segment ready", "Offer ready", "Flow ready").
- A specific action CTA instead of the generic "Open report".
- Wording that follows the vaguely-specific tone rule — no exact transaction counts.

Clicking a card still opens the existing Priority Opportunity briefing report, so nothing goes nowhere.

## Technical notes

- New `src/lib/ventusPriorityCards.ts` defines the three capability cards (label, headline, insight, metric, CTA text, target opportunity id, and destination sub-tab), mapped onto existing `RevenueOpportunity` ids so the interactive report keeps working.
- `InsightStrip.tsx` takes the new card model instead of slicing `getRevenueOpportunities`, and renders the per-card CTA.
- `AnalystDashboardView.tsx` passes the new cards and applies the spacing pass.
- `TaxonomyCoverageCard.tsx`, `ExternalIntelligenceCard.tsx`, `SignalCoverageStrip.tsx`, `LiveSignalStream.tsx` get padding aligned to the ChartCard standard.
- Strict light theme preserved; no dark utilities.
