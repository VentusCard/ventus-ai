# Tie family-card counts to the real funnel math

The current hard-coded `FAMILY_SHARE` percentages don't match the funnel the page is actually computing. Replace them with values derived from `buildAudienceFunnel`, which the section already calls.

## New math (per card)

`eligible = product.estimatedAudience`
`removed = funnel.byFamily[fam].removed` (already available)

| Card type | Label shown |
|---|---|
| Behavioral | `{eligible} users · all` |
| Any other family with `relevance === "flag"` (risk, sometimes financial) | `−{removed} excluded` |
| Any other family (`useful` / `neutral` — demographic, life-event, etc.) | `{eligible} users` |

Example for a 24M eligible product where risk removes 1.9M: risk card reads `−1.9M excluded`; behavioral reads `24M users · all`; demographic reads `24M users`.

This means the displayed numbers reconcile with the final addressable count in the footer (`eligible − Σ excluded ≈ addressable`, before the demographic filter multiplier).

## Code

File: `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`

- Delete the `FAMILY_SHARE` constant and `share` / `famUsers` / `shareLabel` locals added last turn.
- Compute inside the `.map`:
  ```ts
  const removed = funnel.byFamily[fam]?.removed ?? 0;
  const isFlag = rel === "flag";
  const countLabel =
    fam === "behavioral" ? `${fmt(product.estimatedAudience)} users · all`
    : isFlag             ? `−${fmt(removed)} excluded`
                         : `${fmt(product.estimatedAudience)} users`;
  ```
- Render that string in the existing `<p className="text-[10px] font-medium text-white/80 mt-0.5">` line.

No other files, no layout changes, footer untouched.
