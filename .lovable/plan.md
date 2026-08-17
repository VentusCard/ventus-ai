# Merchant Partnerships Rebuild

Turn the Merchant Partnerships tab from a category-extension table into a partnership planning desk with named brands, national vs local planning, a street-level metro map, estimated value per brand, and a mocked AI contact finder.

## Page structure

Three sub-tabs inside the existing Merchant Partnerships tab:

1. **National Partners** — ranked list of ~40 named national brands.
2. **Local Partners** — metro selector (10 metros) + street-level map with ~60 local merchants.
3. **Behavioral Bridges** — the current CategoryExtensionOpportunities view, kept as-is so nothing is lost.

A KPI strip sits above the tabs: total addressable partners, combined estimated annual value, cardholders reached, live/negotiating count.

## National Partners

Card/table hybrid, sortable by estimated value, fit score, or category.

Each brand row shows:
- Brand name, category, and a color chip.
- **Why this brand** — one plain-language reason grounded in bank spend (e.g. "412K cardholders spend here monthly; average ticket $84; 61% also shop a competing grocer").
- Supporting numbers: cardholders spending, annual spend through the brand, share of category spend, projected uplift.
- **Estimated annual partnership value** (headline dollar figure) plus a low/high range.
- Proposed deal construct (e.g. "4% category boost, funded 50/50").
- Fit score badge and pipeline stage badge.
- Expand for a detail panel: quarterly spend trend sparkline, top overlapping cohorts, competing brand the bank would win share from, and the contact block.

Filters: category pillar, deal readiness, and value tier.

## Local Partners

- Metro switcher across 10 metros (New York, Chicago, LA, San Francisco, Boston, Miami, Dallas, Houston, Seattle, Atlanta).
- **Street-level map** for the selected metro: a stylized city canvas (SVG street grid, park/water blocks, neighborhood labels) with pins for each local merchant, sized by estimated value and colored by category. Hover shows a tooltip, click selects and scrolls the side list to that merchant.
- Right side list of that metro's merchants, each with reason, cardholder count, estimated annual value, and contact action.
- Neighborhood cluster summary chips above the map (e.g. "West Loop · 6 merchants · $410K").

## AI Contact Finder (LLM-free)

A "Find contact" button on every brand/merchant opens a dialog that:
1. Runs a short staged progress animation ("Scanning corporate directory → matching partnerships org → verifying role").
2. Resolves to a deterministic mocked result: contact name, title (partnerships/BD/marketing role appropriate to brand size), email pattern, LinkedIn-style handle, confidence badge, and last-verified date.
3. Shows a pre-written outreach draft assembled from the brand's own numbers (value, cardholders, proposed deal) with a copy button.

All values are derived deterministically from the brand record — no AI gateway calls, so /bankdemo stays LLM-free.

## Technical notes

- New data module `src/lib/merchantPartnershipData.ts`: `NationalPartner[]`, `LocalPartner[]` (with metro, neighborhood, x/y map coords), metro definitions, and pure helpers `estimatePartnershipValue`, `resolveBrandContact`, `buildOutreachDraft`.
- New components under `src/components/tepilot/insights/partnerships/`:
  - `NationalPartnersView.tsx`
  - `LocalPartnersView.tsx`
  - `MetroStreetMap.tsx` (inline SVG, no map library, no network tiles)
  - `PartnerDetailPanel.tsx`
  - `BrandContactDialog.tsx`
- `MerchantPartnershipsView.tsx` becomes the sub-tab shell wrapping the three views.
- Styling follows the existing strict light theme (white surfaces, slate-200 borders, Manrope); dialogs use the `tepilot-popup` class as elsewhere.
- No changes to enrichment logic, edge functions, or backend.
