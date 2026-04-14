

## Add "Recommended Products" pill row

Add a second row of pills below "Current Holdings" showing a catalog of possible next products. Most are gray (not recommended), and the ones matching the generated product cards below are highlighted in blue.

### Change: `src/components/exec-demo/NextProductRationale.tsx`

**Add a `RecommendedProductsPills` component** rendered between `CurrentHoldingsPills` and the header:

- Define a static list of ~10-12 common banking products (e.g., "Travel Card", "529 Plan", "HYSA", "Home Equity Line", "Auto Loan", "CD Ladder", "Premium Card", "Life Insurance", "Brokerage Account", "Student Loan Refi", "Balance Transfer Card", "Business Card")
- Cross-reference against `productCards` — if a product name matches (fuzzy/includes), render it as a **blue pill** (`bg-blue-50 border-blue-200 text-blue-700`); otherwise render as **gray pill** (`bg-slate-50 border-slate-100 text-slate-400`)
- Same compact `flex-wrap` row style as the current holdings row, labeled "Product Catalog"
- Blue pills get a small spark/star icon; gray pills are plain text

