## Goal

Restore the full-color (red/amber, ⚠ icon, no line-through) styling for the risk rollup pills in the customer profile header when the user is on the **Next-Product** tab. Keep the existing greyed-out treatment for the **Next-Offer** (analytics) tab where risk truly isn't actionable.

## Why

The risk pills already get cross-referenced inside the Next-Product rationale (third column shows the first risk rollup). It's inconsistent for the source pills above to be greyed out / line-through / disabled while the Next-Product panel is actively surfacing that same risk data as an "Additional Tools" recommendation. On the Next-Offer tab, greying still makes sense (offers don't target risk), so we leave that alone.

## Change

File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`

Currently (line 352):
```ts
const isOfferTab = activeTab === "analytics" || activeTab === "product";
```

This single flag drives both the click-disable behavior AND the greyed visual treatment on the risk pills (lines ~607–644). Splitting the concern:

- Introduce a `riskPillsMuted` flag that is `true` only for the Next-Offer tab (`activeTab === "analytics"`), and use it for the visual greying / line-through / ✕ icon / `pointer-events-none` styling.
- Keep `isOfferTab` (or rename locally) only where it affects offer-targeting click semantics — but for the risk pill block specifically, gate visual muting on `riskPillsMuted` instead of `isOfferTab` so the Next-Product tab keeps the pills colored AND clickable (they cross-link to transactions, which is useful while reviewing recommended products).

Concretely, in the risk pill render block (~lines 607–644), replace each `isOfferTab` reference used for visuals/clickability with `riskPillsMuted`:
- `isClickable = matchedIndices.length > 0 && !riskPillsMuted`
- `title`, `className` (cursor states), `background`, `color`, `border`, `boxShadow`, `transform`, `opacity`, `filter`, `textDecoration*`, and the `✕`/`⚠` icon switch all key off `riskPillsMuted`.

No other files need changes — `NextProductRationale` already mirrors the first risk rollup in red, and that behavior stays the same.

## Result

- Next-Offer tab: risk pills remain greyed out and non-actionable (unchanged).
- Next-Product tab: risk pills appear in their normal red/amber color with the ⚠ icon, are clickable to highlight matching transactions, and visually align with the red risk pill shown in the third Next-Product column.
- Next-Conversation (relationship) tab: unchanged (already colored).
