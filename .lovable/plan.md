# Show applicable-user estimate on each signal-family card

In `ExclusionFunnelSection` (step 2 of the campaign builder), each of the 5 family cards (life-event, behavioral, financial, demographic, risk) currently shows just an icon + label. Add a tiny user-count line so the audience reach per family is visible at a glance.

## Sizing rules

Base = `product.estimatedAudience` (the eligible pool already shown in the header).

| Family | Share of base | Rationale |
|---|---|---|
| Behavioral | **100%** | Behavioral enrichment fires on every transaction — applies to everyone. |
| Purchase / Financial | **65%** | Most customers have observable financial-state signals. |
| Demographic | **92%** | Almost everyone has demographic attributes on file. |
| Life Event | **22%** | Only those with active life-event evidence in the window. |
| Risk | **8%** | Small high-severity slice. |

Numbers are deterministic per product (derived from `estimatedAudience × share`), formatted with the existing `fmt()` helper (e.g. `2.4M`, `880K`).

## UI

File: `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`, inside the ready-state card (around line 391–399), under the family label:

```text
[icon]
Life Event Detection
528K users · 22%      ← new line, text-[10px] text-white/80 font-medium
```

For the behavioral card the suffix reads `· all` instead of a percent. The new line is hidden on the processing and pending placeholders (no layout change there since `minHeight: 84` already accommodates it).

No other components, copy, or logic change.

## Out of scope
- Homepage capability cards (different file).
- Making the percentages user-configurable.
- Updating the final addressable footer math (still driven by demographic filters + disabled families as today).
