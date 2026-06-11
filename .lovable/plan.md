## Import per-product signals into Section 2 signal-family card popovers

### Goal
Replace the generic `FAMILY_REASONS` copy in the Section 2 popovers with **product-specific signals** for each of the 5 families.

### Source per family
- `life-event` and `behavioral` → use `product.signals` from `PRODUCT_FLOWS` (`src/lib/productAutomatedFlows.ts`), filtered by `signal.type`. Each `FlowSignal` has `{ label, evidence }`.
- `financial`, `demographic`, `risk` → use `getProductExclusions(product.id, product.category)` from `src/lib/productCatalogExtras.ts`, filtered by `exclusion.type`. Each `ProductExclusion` has `{ label, rationale }`.

Both shapes normalize to `{ label, detail }`, so the popover renders uniformly.

### Implementation

**File: `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx`**

1. Build a helper inside the component that returns the per-family signal list for the current product:
   ```ts
   function getFamilySignals(fam: ExclusionType): { label: string; detail: string }[] {
     if (fam === "life-event" || fam === "behavioral") {
       return product.signals
         .filter(s => s.type === fam)
         .map(s => ({ label: s.label, detail: s.evidence }));
     }
     return exclusions
       .filter(e => e.type === fam)
       .map(e => ({ label: e.label, detail: e.rationale }));
   }
   ```
   (`exclusions` is already computed at line 88.)

2. In the `PopoverContent` (lines 201–230), replace the `<ul>` that maps `FAMILY_REASONS[fam].reasons` with a list that maps `getFamilySignals(fam)`:
   - Render `label` as primary text (slate-900, font-medium, 11px).
   - Render `detail` as secondary text (slate-600, 10–11px, leading-snug) underneath.
   - Keep the family-colored bullet (`relMeta.bulletColor`).
   - Cap list at 5 items per popover; if more, show "+N more".
   - If the list is empty for a given family, fall back to a single line: "No product-specific signals — relying on universal checks." (covers products where life-event/behavioral arrays don't include that type).

3. Update the popover intro line (line 216) to use a product-specific tone instead of `relMeta.intro` when signals are present, e.g. `"Signals driving this family for {product.name}:"`. Keep `relMeta.intro` as fallback when the list is empty.

4. Remove the now-unused `FAMILY_REASONS` import if no other call site uses it (verify with a grep first; leave the export intact in `productCatalogExtras.ts`).

### Out of scope
- No changes to `productAutomatedFlows.ts` data shape.
- No changes to the inline `ExpandedPanel` (already shows `ProductExclusion` signals).
- No changes to card visuals — only popover content.

### Files touched
- `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — popover content + helper