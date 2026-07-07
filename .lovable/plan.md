
## Goal

Transform `/bankdemo` → "Life Event Detection" into a broader **Relationship Intelligence** dashboard. Life events stay a key module, joined by product-penetration/depth insights. Layout is a bento overview with clickable tiles that expand into detail views.

## Sidebar rename

`src/components/tepilot/insights/AnalyticsContainer.tsx` (line ~113):
- Label `"Life Event Detection"` → `"Relationship Intelligence"`
- Icon: swap `CalendarHeart` → `Gem` (or keep `CalendarHeart`; TBD in build)
- `tab value` `'life-events'` unchanged so routing/state stays intact.

## New page: `RelationshipIntelligenceView`

Create `src/components/tepilot/insights/RelationshipIntelligenceView.tsx` and wire it into `AnalyticsContainer` case `'life-events'`, replacing `BankwideLifeEventsView` (kept in repo for reference but no longer routed).

Reuses the existing enrichment inputs (`userDemographics`, `lifestyleSignals`) plus `generateDashboardClients` from `randomProfileGenerator` so no backend/data changes are needed. Product references pull from `BANK_PRODUCT_CATEGORIES` in `src/lib/bankProductCatalog.ts` (matches the Products page vocabulary).

### Layout (bento overview + drill-in)

```text
┌─ TabHeader: Relationship Intelligence ──────────────────────┐
├─ Portfolio strip (4 metrics) ───────────────────────────────┤
│  Customers scanned · Avg products/customer ·                │
│  Deep relationships (4+ products) · Life events (90d)       │
├─ Bento grid (2 rows × 3 tiles) ─────────────────────────────┤
│ [Product Penetration] [Cross-Sell Whitespace] [Primary Bank]│
│ [Life Stage & Events] [Wallet Depth Tiers]   [At-Risk / Thin]│
└─ Drill-in panel (below grid, expands on tile click) ────────┘
```

Each tile: icon + label + hero stat + 1-line insight + `ArrowUpRight`. Clicking a tile toggles the drill-in panel to that module (single-panel drill-in, keeps page compact). Selected tile gets a ring highlight.

### Modules

1. **Product Penetration** — histogram of customers by product count (1/2/3/4+), sourced from mock clients. Drill-in: stacked bar per product category from `BANK_PRODUCT_CATEGORIES` (Credit Cards, Deposit, Mortgage, Investments…). Reuses `holdings` fields from `ClientProfileData`.
2. **Cross-Sell Whitespace** — top gaps ("Has checking, no credit card: 38%"). Drill-in: table of gap → recommended product from catalog → est. eligible customers.
3. **Primary Bank Status** — donut: Primary / Secondary / Thin. Drill-in: definition (multi-product + high deposit share) and cohort counts.
4. **Life Stage & Events** — this replaces today's page as one tile. Reuses `BANKWIDE_EVENT_STATS`, `LIFE_EVENT_CONFIG`, and the `LifeEventAlertCard` list. Drill-in renders the existing category grid + client examples list (essentially today's `BankwideLifeEventsView` body, extracted into a subcomponent `LifeEventsModule`).
5. **Wallet Depth Tiers** — segmentation by AUM bands (Preferred / Premium / Private) using `profile.segment`, with avg products/customer per band.
6. **At-Risk / Thin Relationships** — customers with 1 product, low engagement, or overdue `engagementStatus`. Drill-in reuses `LifeEventAlertCard`-style rows.

### Component structure

```text
RelationshipIntelligenceView.tsx
├─ PortfolioStrip (4 MetricCards)
├─ BentoGrid
│    └─ InsightTile × 6  (active tile controls drill-in)
└─ DrillInPanel
     ├─ ProductPenetrationModule
     ├─ CrossSellWhitespaceModule
     ├─ PrimaryBankModule
     ├─ LifeEventsModule           ← extracted from BankwideLifeEventsView
     ├─ WalletDepthModule
     └─ AtRiskModule
```

All modules live in a new `src/components/tepilot/insights/relationship/` folder to keep the file tree tidy.

### Data

- No new fetches. Everything derives from `generateDashboardClients(24)` + enriched user + `BANK_PRODUCT_CATEGORIES` + hardcoded bank-wide aggregates (same pattern as `BANKWIDE_EVENT_STATS`).
- Aggregates for penetration/cross-sell/primary-bank/wallet-tier defined as top-level constants in the module files, mirroring today's style.

### Styling

- Strict light theme (per project memory): white bg, `border-slate-200`, no `dark:` utilities.
- Reuse `TabHeader`, `Card`, `Badge`, `cn`, existing icon palette.
- Tile accents follow existing bento patterns in `CapabilitiesView` (soft `bg-{color}-50` + `text-{color}-600`).

## Out of scope

- No backend/edge-function changes.
- `BankwideLifeEventsView.tsx` left in place (unrouted) in case we want to revert quickly; can be deleted in a follow-up.
- Engagement/channel-health and household-graph modules deferred (not selected).
