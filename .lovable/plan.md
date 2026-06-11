# Section 2 — +/− toggle with reason tooltip per signal family

Add a small circular **+** or **−** button to the top-right of each of the 5 signal-family cards in Section 2 (`ExclusionFunnelSection.tsx`). Hovering or tapping the button reveals a popover/tooltip listing the reasons that family is adding to or excluding from the audience. Clicking the button toggles that family's contribution on/off in the funnel math.

## Button polarity per family

- **Life Event** → `+` (qualifying signals expand who's relevant)
- **Behavioral** → `+` (engagement patterns qualify)
- **Demographic** → `+` (household fit qualifies)
- **Financial** → `−` (excludes — financial strain, weak cash buffer, etc.)
- **Risk** → `−` (excludes — decreased credit score, recent overdrafts, etc.)

The button color follows polarity: `+` uses emerald, `−` uses rose. Sits in the card's top-right where the chevron is today; chevron moves next to it.

## Reasons shown in each tooltip

Short bulleted list (3–5 reasons) of *why* that family is contributing, with the same "vaguely specific" tone used elsewhere. Examples:

- **Financial (−)** — "Recent financial strain", "Cash buffer below 2 weeks of outflows", "Rising essential-spend share", "Recurring overdraft fees".
- **Risk (−)** — "Decreased credit score trajectory", "NSF / overdraft in last 90 days", "Elevated DTI vs. underwriting band", "Recent card declines".
- **Life Event (+)** — "New-home indicators", "Growing-family signals", "Job/role change detected", "Relocation footprint".
- **Behavioral (+)** — "Active digital engagement", "Recurring savings transfers", "Frequent advisor touchpoints".
- **Demographic (+)** — "Likely homeowner", "Dual-income household", "Family-stage match", "Tenure above cohort median".

Reasons are static per family (drawn from the existing chip catalogs in `campaignSignalFamilies.ts` plus a few life-event/behavioral additions) — not per product.

## Toggle behavior

- State: add `disabled: Set<ExclusionType>` to `ExclusionFunnelSection`.
- When a family is disabled, `buildAudienceFunnel` skips its removal step → the final addressable number recomputes live.
- Disabled card visually dims (opacity 60, strikethrough on the count line), and its `+/−` flips to a muted outline. Click again to re-enable.
- Expand/collapse of the detail panel (existing behavior) is unchanged; the +/− button has its own click handler with `stopPropagation`.

## Files to edit

1. `src/lib/productCatalogExtras.ts`
   - Add `FAMILY_POLARITY: Record<ExclusionType, "plus" | "minus">`.
   - Add `FAMILY_REASONS: Record<ExclusionType, string[]>` (3–5 short strings each).
   - Extend `buildAudienceFunnel(base, exclusions, disabled?: Set<ExclusionType>)` to skip disabled families when computing `stages` and `finalCount`. `byFamily` still reports each family's removed count *as if active* so the tooltip stays informative; the footer total uses the disabled-aware path.

2. `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`
   - Add `disabled` state.
   - Render a `Popover` (shadcn) trigger as a 20px round button (`+` Plus icon for plus families, `−` Minus icon for minus families) in each card's header, beside the chevron.
   - Popover content: family name, one-line polarity sentence ("These signals **exclude** customers because…" or "These signals **qualify** customers because…"), then a `<ul>` of `FAMILY_REASONS[fam]`.
   - Clicking the button toggles `disabled` membership; popover trigger uses `onClick` with `stopPropagation` so it doesn't expand the card.
   - Footer badge and final-addressable number reflect the disabled-aware funnel.

No changes to Section 1, Section 3, the parent view, or any backend.
