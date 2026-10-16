# Refresh Section 4 financial and demographic signals

## Signal changes
- Replace the monthly surplus display with **estimated EOY surplus $189,490.32**: the existing $15,790.86 monthly average × 12. Keep **idle cash $8,124.19 per month** unchanged. Use compact nested pills, with each amount’s timeframe explicit.
- In the surplus pop-up, explain that the EOY figure is an annualized estimate from January–September 2026, not an observed year-end total or projected account balance. Preserve the existing spending exclusions and supporting transactions.
- Move the external BMW X5 signal from Financial to Demographics and reframe it as **Luxury auto owner · BMW X5**. Replace loan-maturity wording and next-car speculation with ownership context; do not add a vehicle valuation.
- Add an external Demographics pill: **Estimated total assets · $3.5M**. Its pop-up clearly identifies the amount as an illustrative outside-context estimate, not a ledger-derived figure. Do not invent an asset breakdown, named provider, or verification claim.

## Presentation and scope
- Keep KYC and business first in Demographics, followed by external airplane ownership, luxury auto ownership, and estimated total assets.
- Preserve the five-family order, family colors, lighter nested attributes, and leading **Ext** badges.
- Use the revised shared Section 4 story on both 4.2 and 4.3, so internal surplus wording remains consistent. The BMW and total-assets pills remain withheld until the external reveal on 4.3; 4.1 still shows headings and empty rows.
- Retain existing pop-up tables and arrow-only navigation. No changes to transactions, production classification, or `/bankdemo` intelligence data.

## Technical details and validation
- Update deck-scoped signal definitions, structured clauses, inline attributes, and pop-up facts in the existing script and attribute helpers. Add a small annualization helper without changing monthly cash-flow calculations.
- Update tests for surplus × 12, unchanged monthly idle cash, BMW’s Demographics/external classification, the $3.5M external estimate, and one-to-one story/signal coverage.
- Verify 4.1–4.3, the three affected pop-ups, and stable reveal geometry at the current 1903×903 size and a smaller supported desktop. Run the focused Bun tests and inspect preview diagnostics.
- Record the approved financial and ownership requirements in project memory during implementation.