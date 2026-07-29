## Segments driven by all signal types (behavioral, life-event, financial, demographic)

The demo currently shows six behavioral segments only. The rest of the app already frames product pitches across **behavioral**, **life-event**, **financial-journey** and **demographic** angles (see `productCatalogExtras.ts` `MESSAGE_OVERRIDES` and `MessageAngle`). Bring that same variety into `CampaignStudioPreview.tsx` so the story is: one product, many signal types.

### Re-mix the 6 segments

Keep the 3-2-1 Cash Rewards card fixed. Recompose the six segments to mix angles:

| # | Segment | Angle | 3% / 2% |
|---|---------|-------|---------|
| 1 | Dining-led households | Behavioral | Dining / Grocery |
| 2 | Grocery-led families | Behavioral | Grocery / Gas |
| 3 | Commuter households | Behavioral | Gas / Dining |
| 4 | New parents — family formation | Life event | Grocery / Streaming |
| 5 | Just bought a home | Life event | Home improvement / Wholesale |
| 6 | Empty-nest pre-retirees | Demographic | Travel / Dining |

Each segment gets tailored subject/body/value-math copy that references the underlying signal (e.g. "You just moved in — 3% on the aisle you'll live in for a year," "Kids out of the house — reroute the food budget into travel").

### Angle chips on tabs + draft card

- Add an **angle chip** on each segment tab: color-coded (`Behavioral` blue, `Life event` amber, `Demographic` purple) using the palette already used in `ExecDemoIntelPanel`.
- Draft card header: keep "Segmented email · draft" but add the same angle chip next to the "To · <segment>" line, so the viewer sees *why* this segment exists.

### Small polish

- Under the "One product · 6 segments" eyebrow, add a one-line legend: `Signal mix: 3 behavioral · 2 life event · 1 demographic`.
- Population bars and totals continue to work unchanged.

### Files touched

- `src/components/solutions/CampaignStudioPreview.tsx` only. No routing, no data-layer changes.