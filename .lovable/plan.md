## Change: Restyle the 5 signal-family cards in Section 2 (Audience & signal contributions)

### What
Update the visual style of the 5 signal-family cards (`life-event`, `behavioral`, `financial`, `demographic`, `risk`) in `ExclusionFunnelSection` from colored-background / white-text to:
- White background
- Colored text matching the family’s existing color theme
- Thicker colored border (`border-2` or `border-[2px]`) in the family’s color

### How
1. **Extend `FAMILY_META`** in `src/lib/productCatalogExtras.ts`  
   Add a `cardBorder` field for each family (e.g., `border-amber-500`, `border-blue-500`, etc.) so the component can reference it cleanly.

2. **Update `ExclusionFunnelSection.tsx`**  
   For the cards in the `state === "ready"` branch:
   - Replace `meta.solid` (colored bg) with `bg-white`
   - Replace `text-white` with `meta.iconColor` (colored text)
   - Add `border-2` + `meta.cardBorder` (thicker colored border)
   - Update the inner badge / icon colors if needed so they remain readable against white (keep badge colors as-is if they already use family/relevance colors).

### Files
- `src/lib/productCatalogExtras.ts` — add `cardBorder` to `FAMILY_META`
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — apply new card styling