# Show life-event, demographic, financial cards as a realistic subset

Currently those three families display the full `eligible` count, which implies every customer has, e.g., a new job or savings goal. They should show a believable share of the eligible base.

## New label rules

| Family | Label | Share of eligible |
|---|---|---|
| Behavioral | `{eligible} users · all` | 100% (unchanged) |
| Life Event | `{N} users · {pct}%` | **18%** |
| Demographic | `{N} users · {pct}%` | **62%** |
| Financial | `{N} users · {pct}%` | **34%** |
| Risk (flag) | `−{removed} excluded` | unchanged |

Numbers are deterministic per product (`round(estimatedAudience × share)`), formatted with the existing `fmt()` helper.

## Code

File: `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`

Inside the `.map`, replace the current `countLabel` branch with:

```ts
const FAMILY_SHARE: Partial<Record<ExclusionType, number>> = {
  "life-event": 0.18,
  demographic: 0.62,
  financial: 0.34,
};
const removed = funnel.byFamily[fam]?.removed ?? 0;
const isFlag = rel === "flag" && fam !== "financial";

let countLabel: string;
if (fam === "behavioral") {
  countLabel = `${fmt(product.estimatedAudience)} users · all`;
} else if (isFlag) {
  countLabel = `−${fmt(removed)} excluded`;
} else {
  const share = FAMILY_SHARE[fam] ?? 1;
  const n = Math.round(product.estimatedAudience * share);
  countLabel = `${fmt(n)} users · ${Math.round(share * 100)}%`;
}
```

No other changes (funnel math, footer, financial-not-subtracting behavior all stay as-is).
