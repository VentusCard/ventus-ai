## Goal
Make the "Refine Audience (Optional)" demographic filters dynamic per product — same pattern as life events. The edge function decides which demographic facets (age ranges, regions, income bands, account tenure) are meaningful targeting levers for the selected product, and the UI only renders those facets with only the suggested values pre-narrowed.

## Edge function — `supabase/functions/generate-lifestyle-signals/index.ts`

Extend the `emit_signals` tool schema with an additional output:

```
applicableDemographics: {
  ageRanges:    string[],   // subset of ['18-24','25-34','35-44','45-54','55-64','65+'] — [] = hide facet
  regions:      string[],   // subset of ['Northeast','Southeast','Midwest','Southwest','West','Northwest'] — [] = hide facet
  incomeBands:  string[],   // subset of ['under_50k','50k_100k','100k_150k','over_150k'] — [] = hide facet
  accountTenure: string[]   // subset of ['new','established','loyal'] — [] = hide facet
}
```

Prompt additions:
- Pass the canonical vocab (ids + labels) for each facet.
- Rule: "For each demographic facet, return ONLY the values that are clearly relevant targeting levers for THIS product. Return an empty array for any facet that doesn't meaningfully discriminate fit (e.g. regions usually don't matter for a national travel card — return []). Don't pad. Examples: 529 plan → ageRanges ['25-34','35-44'], incomeBands ['50k_100k','100k_150k','over_150k'], accountTenure [], regions []; HELOC → ageRanges ['35-44','45-54','55-64'], incomeBands ['100k_150k','over_150k'], accountTenure ['established','loyal'], regions []; wealth management → ageRanges ['45-54','55-64','65+'], incomeBands ['over_150k'], accountTenure ['established','loyal'], regions []; travel rewards card → ageRanges ['25-34','35-44','45-54'], incomeBands ['100k_150k','over_150k'], accountTenure [], regions []; small business loan → ageRanges [], incomeBands [], accountTenure ['established','loyal'], regions []."

Response body: `{ signals, applicableLifeEvents, applicableDemographics }`. Sanitize against the allowed sets; default each facet to `[]` when missing.

## Frontend — `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`

- New state `applicableDemographics: { ageRanges, regions, incomeBands, accountTenure }`. Reset on product change; populate from edge-function response.
- On each new generation, drop any currently-selected demographic value that isn't in the new applicable set. Reset `accountTenure` to `'all'` if the facet was removed.
- Pass `applicableDemographics` down to `DemographicFilters` via a new optional prop.
- If ALL four facets are empty, hide the entire Refine Audience collapsible.

## Frontend — `src/components/tepilot/campaigns/DemographicFilters.tsx`

- Accept new optional prop `applicable?: { ageRanges?: string[]; regions?: string[]; incomeBands?: string[]; accountTenure?: string[] }`.
- For each facet, filter the rendered options to the intersection of canonical list and `applicable[facet]`. If `applicable[facet]` is omitted (undefined), show all (back-compat with other callers). If `applicable[facet]` is an empty array, hide the entire facet block.
- For Account Tenure: when filtered, build the Select options as `[All Tenures] + filtered ACCOUNT_TENURE_OPTIONS`. Hide the whole Select when applicable list is empty.
- No behavior change for callers that don't pass `applicable`.

## Out of scope
Audience-size estimator math, other campaign builder sections, other edge functions, other consumers of `DemographicFilters`.

## Validation
- Travel Rewards Card → Generate → Refine Audience shows only Age Ranges + Income Bands (no Regions, no Tenure).
- 529 Plan → Generate → Age Ranges narrowed to 25-34 / 35-44, Income Bands shown, Tenure + Regions hidden.
- Wealth Management → Generate → Age Ranges narrowed to 45+, Income Bands = $150K+, Tenure shows Established/Loyal.
- Small Business Loan → Generate → only Account Tenure shown.