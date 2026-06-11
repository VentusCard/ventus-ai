## Per-product signal relevance with 3-state polarity

Right now the 5 signal cards (Life Event / Behavioral / Financial / Demographic / Risk) render identically for every product, with a fixed polarity (`life-event`, `behavioral`, `demographic` = always `+`; `financial`, `risk` = always `−`). That's why a flat-rate cashback card looks the same as a 529 plan.

Change the model so each product **ranks** its signal families into one of three states, and the card UI reflects that ranking.

### New 3-state model per (product × family)

| State | Meaning | Card visual | Popover icon |
|---|---|---|---|
| `useful` | Strong driver: this signal family materially qualifies customers for this product | Full-color card, large green `+` badge top-right | Green plus |
| `neutral` | Considered but not decisive — included for completeness, no real lift or drag | Muted/desaturated card (lower saturation + lower text contrast), small grey dot badge | Grey dot |
| `flag` | Disqualifying / risk signal that removes customers | Full-color card, large red `−` badge top-right | Red minus |

The current `FAMILY_POLARITY` constant goes away — polarity is now per-product, not global.

### Rankings (examples driving the data file)

- **Travel card** → behavioral `useful`, life-event `useful`, demographic `neutral`, financial `flag`, risk `flag`
- **Flat-rate cashback card** → behavioral `useful`, financial `flag`, risk `flag`, life-event `neutral`, demographic `neutral`
- **Mortgage / HELOC** → life-event `useful`, financial `flag`, risk `flag`, behavioral `neutral`, demographic `useful`
- **529 plan** → life-event `useful`, behavioral `useful`, financial `flag`, demographic `neutral`, risk `neutral`
- **High-yield savings** → behavioral `useful`, life-event `useful`, financial `neutral`, demographic `neutral`, risk `neutral`
- **Auto loan / personal loan** → behavioral `useful`, financial `flag`, risk `flag`, life-event `neutral`, demographic `neutral`

Every other product gets a sensible default by category (Cards / Lending / Deposits / Wealth / Insurance), then individual marquee products override.

### Card sort order

Within each product, the 5 cards render in this order so the story reads left-to-right:
1. All `useful` families (in `SIGNAL_FAMILIES` declaration order)
2. All `neutral` families
3. All `flag` families

This means the user sees "why this customer qualifies" first, "what we still checked" middle, "what would disqualify" last.

### Popover content changes

- Header line restated per state: "Strong driver for this product" / "Considered, not decisive here" / "Disqualifying check".
- Reason bullets stay from `FAMILY_REASONS` but the bullet dot color matches the state (`emerald` / `slate-400` / `rose`).
- Footer toggle copy: "Click the badge again to disable / re-enable this family in the funnel."

### Funnel math

- `useful` and `neutral` families: contribute `+` (qualify), so they don't remove from the addressable count — they're informational in the funnel today and stay that way.
- `flag` families: remove customers as they do today.
- `neutral` families: their `removedPct` is multiplied by `0` so they don't shape the funnel; their card still shows the underlying signals via the popover for transparency.

### Files touched

- `src/lib/productCatalogExtras.ts`
    - Add `SignalRelevance = "useful" | "neutral" | "flag"`.
    - Add `getProductSignalRelevance(productId, category): Record<ExclusionType, SignalRelevance>` with category defaults + per-product overrides for the marquee list above.
    - Remove `FAMILY_POLARITY` export; replace call sites with the new lookup.
    - Update `buildAudienceFunnel` to accept the relevance map and zero-out `neutral` contributions.
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`
    - Read relevance per product, compute card sort, render the 3-state badge + muted styling, and pass relevance to the popover.

### Out of scope

- No copy changes to the Message Preview section.
- No changes to Product Picker (Section 1).
- No new icons — reuse `Plus`, `Minus`, and a small filled circle for neutral.