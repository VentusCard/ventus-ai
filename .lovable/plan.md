

## Plan: Unify pill styling — add emoji icons to subcategory pills

### Problem
Category pills (e.g. "🍕 Dining") have emoji icons, but subcategory pills after the `|` separator are plain text with no icons — making them look inconsistent.

### Change

**File: `src/components/demo/DemoRewardsView.tsx`** (lines 333-346)

Add emoji icons to subcategory pills using the existing `getSubcategoryIcon` function from `@/lib/categoryIcons`:

1. Import `getSubcategoryIcon` from `@/lib/categoryIcons`.
2. In the subcategory pill rendering (line ~344), add `<span className="text-[10px]">{getSubcategoryIcon(sub)}</span>` before the label — exactly matching the category pill pattern on line 327.

This makes every pill — "All", categories, and subcategories — render identically: `emoji + label` in the same rounded-full style.

