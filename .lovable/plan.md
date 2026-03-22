

## Problem

Looking at the screenshot, three issues are visible:

1. **Pillar badges are too wide** — long names like "Sports & Active Living", "Miscellaneous & Unclassified", "Entertainment & Culture" stretch the column and look cramped
2. **Column spacing is uneven** — some columns have too much space, others too little
3. **Last column (gear icon + eye buttons) misaligned** — needs consistent right-alignment

## Plan

### 1. Shorten pillar display names
Create a mapping of abbreviated pillar names for the table display:
- "Sports & Active Living" → "Sports"
- "Miscellaneous & Unclassified" → "Misc"
- "Entertainment & Culture" → "Entertainment"
- "Health & Wellness" → "Health"
- "Travel & Exploration" → "Travel"
- "Food & Dining" → "Food"
- "Home & Living" → "Home"
- "Style & Beauty" → "Style"
- "Technology & Digital Life" → "Tech"
- "Family & Community" → "Family"
- "Financial & Aspirational" → "Financial"
- "Pets" → "Pets"

The badge will show the short name but keep a `title` attribute with the full name on hover.

### 2. Rebalance column widths
Adjust the `<colgroup>` widths to give more room to content-heavy columns (Merchant, Category, Subcategories) and less to the now-shorter Pillar column:
- Merchant: 100px → 120px
- Pillar: 90px → 72px (shorter labels now)
- Category: 70px → 90px
- Subcategories: 90px → 85px
- Actions: 32px → 36px, with proper center alignment

### 3. Fix last column alignment
- Ensure the gear icon header and eye button cells both use consistent `text-center` alignment
- Remove `text-right` / `ml-auto` in favor of centered content

### Files to modify
- `src/components/tepilot/ResultsTable.tsx` — add pillar abbreviation map, update colgroup widths, fix alignment

