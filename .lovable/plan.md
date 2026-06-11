## Objective
Move the anchor-model explanation so it is revealed by the **"{N} campaigns · {M} shown"** badge, and remove the separate "Additive anchor model for…" formula line beneath it.

## What will change

### 1. `MessagePreviewsSection.tsx`
- **Remove** the `<button>` row that currently reads  
  `Additive anchor model for {product.name} · {formatVariantFormula(variants)}`  
  with the chevron toggle (lines ~80–95).
- **Remove** the `formulaOpen` state and the inline `{formulaOpen && (…)}` expanded panel (lines ~97–126).
- **Turn the Badge into a popover trigger**: wrap the existing `<Badge>` in a `<Popover>` (or a native `<button>` with `onClick` if popover is unavailable). On click it opens a compact popover / dropdown directly beneath the badge.
- **Popover content** (re-use the existing copy):
  - The paragraph: *"A campaign is anchored on one thing — a category stack, a life event, or a financial goal. The families add; they don't multiply. Tone, proof, and offer construction are A/B wrappers around a single anchored campaign, not separate campaigns."*
  - The 3-column formula grid (Category stacks × plays, Life-event hooks, Financial-goal hooks) exactly as currently rendered by `FormulaCell`.
- **Cleanup**: remove `formatVariantFormula` helper if it becomes unused; keep `FormulaCell` because it is used inside the popover.

### 2. No other files touched
`campaignCatalogVariants.ts`, `buildMessageCards.ts`, and the parent view remain unchanged.

## Expected result
- The badge reads "548 campaigns · 5 shown" and is clickable.
- Clicking it reveals a light-themed popover with the explanation paragraph + the additive formula grid.
- The old "Additive anchor model for Cashback · 132 × 4 + 15 + 5 = 548" line is gone.
- The 5 message-preview cards and the catalog-total footer remain exactly as they are now.