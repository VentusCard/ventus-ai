## Goal
Add a new **Targeting** sidebar group directly below **Analytics** on `/bankdemo`. The group contains two brand-new nav items, both fully product-first. The existing "Next-Best Product Engine" tab under Relationship stays exactly as it is.

## Sidebar change
In `src/components/tepilot/insights/AnalyticsContainer.tsx`, insert a new group right after Analytics:

```
Targeting
  • Automated Flows         (icon: Zap)
  • Campaign Builder        (icon: Megaphone)
```

- Two new tab values: `targeting-automated-flows`, `targeting-campaign-builder`.
- Add them to `TabValue`, `NAV_GROUPS`, and `renderContent()`.
- Add the "Targeting" label to the `allowedLabels` set (gate on `enabledModules.has("Analytics")` for now, same pattern as Health/Others) so module filtering still works.

## New view 1 — Automated Flows (product-first)

File: `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`

Layout: TabHeader on top, then a grid of **product cards**, one per bank product. Each card represents an always-on flow that auto-enrolls customers when Ventus detects matching signals.

Card anatomy:
- Header: product icon + product name + category badge (Lending, Wealth, Deposits, Cards, Insurance) + active/paused Switch.
- "Detecting" panel: bulleted list of behavioral signals Ventus watches for this product, each with a short evidence example. e.g.
  - **529 College Savings Plan** → "Newborn-related purchases (Buy Buy Baby, Carter's)", "Pediatrician copays", "Age-of-dependent inference 0–2 yrs", "College-age dependent (16–18 yrs) + private school tuition".
  - **HELOC** → "Home renovation merchants (Home Depot, Lowes >$1k)", "Property tax payment", "Contractor ACH".
  - **Wealth Management (Merrill-style)** → "Large equity comp deposit", "Recurring brokerage transfers", "Country club dues", "Private aviation".
  - **Auto Loan** → "Repeated dealer visits", "Lease-end timing signal", "Auto insurance shop-around".
  - **Mortgage** → "Rent payments above local median", "Mortgage rate search behavior", "Pre-approval inquiry".
  - **Personal Loan** → "Repeated BNPL usage", "Cash-advance recovery pattern".
  - **High-Yield Savings** → "Idle checking balance >$25k for 90d".
  - **Travel Card** → "Multi-airline spend + hotel diversity".
  - **Small Business Loan** → "Vendor ACH cluster", "Square/Stripe deposits".
- Footer: estimated triggered audience size + "Configure" link that opens the existing `AudienceFiltersPanel` in a sheet (reuse component, no new logic).

Data source: new static catalog `src/lib/productAutomatedFlows.ts` exporting an array of `ProductFlow` objects with `id, name, category, icon, signals[], estimatedAudience, defaultActive`. ~10 products covering the categories above.

State: local `activeFlowIds: Set<string>` (no persistence — UI-only demo, matches existing pattern).

Visuals: strict light theme (white card, slate-200 border, slate-900 headings, slate-500 body, blue-600 accents). No `dark:` classes.

## New view 2 — Campaign Builder

File: `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`

A guided 3-step workflow (not a dashboard). Single-column, max-w-5xl, with a sticky right-side audience-estimate strip.

**Step 1 — Pick the product to upsell**
- Searchable Select sourced from the same `productAutomatedFlows.ts` catalog so the two views stay in sync.
- Show one-line product positioning under the select once chosen.

**Step 2 — Pick targeting signals**
Three collapsible signal groups, all chip-cloud style (reuse `DimensionChipCloud`):
1. **Lifestyle Asset Signals** *(new)* — hardcoded curated chips wired to mock detection rates:
   - Luxury Auto Owner, Marine / Boat Owner, Private Aviation User, Country Club Member, Fine Dining Frequent, Second Home Owner, Private School Family, Equestrian, Golf Club Member, Charter Yacht, High-End Watch Collector, Charitable Donor (>$10k/yr), Private Banking Indicator.
   - Each chip carries a small `detectionRate` used by the audience estimator.
   - Stored in new `src/lib/lifestyleAssetSignals.ts`.
2. **Life Events** — reuse `LIFE_EVENTS` constant.
3. **Lifestyle Pillars** — reuse `LIFESTYLE_PILLARS`.

Plus an inline `DemographicFilters` block (existing component) for age/income/region.

**Step 3 — Generated segment + personalized output**
Right-side strip shows `AudienceEstimateBar` (reuse).

When user clicks **Generate Segment**, render a `SegmentOutputPanel` showing:
- A header with audience size and the product.
- A vertical list of 3 representative persona cards (mocked, no LLM call needed for v1). Each card:
  - Persona label ("Coastal Empty-Nester with Marine Lifestyle")
  - Detected signals as small chips
  - **Personalized message** (subject + body snippet, 2-3 lines)
  - **CTA text** (button label)
  - **Imagery direction** (1-line description, shown as a small slate-50 placeholder swatch with the description as caption — no actual image generation in this pass).
- Static copy variants per signal combo, no edge-function call required.

Audience estimator: new helper `estimateAssetSignalAudience(productId, assetSignals, lifeEvents, pillars, demographics)` in `src/lib/lifestyleAssetSignals.ts`. Simple multiplier model: 250M base × product penetration × product of (1 − signalRate)^selectedSignals pattern, mirroring the existing `estimateStudioAudienceSize` approach.

## Wiring

`AnalyticsContainer.tsx`:
- Imports for `ProductAutomatedFlowsView` and `ProductCampaignBuilderView`.
- New cases in `renderContent`.
- New entries in `NAV_GROUPS` placed immediately after the Analytics group.
- Extend `TabValue` union.
- Extend `MODULE_NAV_GROUP_MAP` only if needed — for now, allow Targeting whenever Analytics is enabled (same convention used for Health/Others).

## Out of scope
- No changes to existing Next-Best Product Engine tab, `CampaignStudio`, or `AutomatedFlowsSection`.
- No new edge functions, no LLM calls, no DB changes.
- No real signal-detection logic — all mock catalogs.
- No new auth or RLS work.

## Technical files touched
- Edit: `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Edit: `src/types/demo.ts` (only if `MODULE_NAV_GROUP_MAP` needs a Targeting entry; otherwise no change)
- New: `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx`
- New: `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`
- New: `src/components/tepilot/campaigns/SegmentOutputPanel.tsx`
- New: `src/lib/productAutomatedFlows.ts`
- New: `src/lib/lifestyleAssetSignals.ts`

## Memory update
After implementation, add a memory note describing the Targeting group structure and that Lifestyle Asset Signals are mock data, so future edits stay consistent.
