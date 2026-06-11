## Goal
Reframe Section 2 (Audience & exclusion funnel) as **5 horizontally laid out signal-family cards** matching the System tab: Life Event · Behavioral · Financial · Demographic · Risk. Each card is collapsed by default; clicking one expands it inline to full width to show its detailed contribution to the audience for the selected product.

## Layout

### Collapsed (default)
Single row, 5 equal-width cards (grid-cols-5):
- Colored top border + small icon tile (matching System tab tints: amber, blue, emerald, violet, rose).
- Family name (e.g. "Behavioral Signals").
- One-line metric: count of contributing signals + audience impact (e.g. "4 signals · −180K").
- Chevron-down hint.

### Expanded (one at a time)
Clicked card replaces the row with a full-width panel:
- Header: icon + family name + "Collapse" button (chevron-up) on right.
- Below: list of contributing signals for this family for the current product. Each signal row: label, rationale, audience impact (− count).
- The other 4 family cards collapse into a thin horizontal strip below the expanded panel so the user can switch.

Funnel bars at the top of the section + the addressable-audience badge stay (compact version), because they summarize the cumulative impact.

## Data
Existing `getProductExclusions` only returns `financial` + `behavioral`. Extend `productCatalogExtras.ts`:
- Add `"life-event" | "demographic" | "risk"` to `ExclusionType`.
- Add `LIFE`, `DEMO`, `RISK` builder helpers.
- Augment each product's exclusion list with 1-3 plausible signals per family (e.g. Life Event: "Recently moved" boosts mortgage eligibility; Demographic: "Age 25-40" for first-time-homebuyer mortgage; Risk: "No fraud flags in 90 days").
- `buildAudienceFunnel` extended to compute per-family removed counts so collapsed cards can show "−N".

## Files

### `src/lib/productCatalogExtras.ts`
- Extend `ExclusionType` union; add `LIFE/DEMO/RISK` helpers; append signals to existing product blocks (start with a generic default applied to all, then customize top 5-10 products).
- Update `buildAudienceFunnel` to expose `byFamily: Record<ExclusionType, { removed: number; signals: ProductExclusion[] }>`.

### `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`
- Add local `expanded: ExclusionType | null` state.
- Replace the current 2-column financial/behavioral block with the 5-card horizontal row + expandable panel described above.
- Keep funnel bars + final-addressable footer.
- Empty-state placeholder unchanged.

No changes to `ProductPickerSection`, `MessagePreviewsSection`, or parent view.

## Visual mapping (System tab → here)
| Family | Icon | Border / tint |
|---|---|---|
| Life Event | CalendarHeart | amber |
| Behavioral | Activity | blue |
| Financial | DollarSign | emerald |
| Demographic | UserCircle | violet |
| Risk | AlertTriangle | rose |
