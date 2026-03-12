

## Add Spending Tier to Classification Pipeline

### Changes

**1. Edge Function: `supabase/functions/classify-transactions/index.ts`**

- Add to `CLASSIFICATION_PROMPT` (after the CONFIDENCE LEVELS section):
  ```
  SPENDING TIER:
  Classify each transaction's spending tier:
  - "Premium": Luxury brands, fine dining, first-class travel, high-end retailers (Equinox, Tiffany, Nordstrom, Four Seasons)
  - "Standard": Mid-range, mainstream brands, casual dining (Target, Chipotle, Marriott, Nike)
  - "Budget": Discount stores, fast food, budget options, dollar stores (McDonald's, Dollar Tree, Walmart, Spirit Airlines)
  - "N/A": Utilities, insurance, medical, financial services, rent — where tier doesn't meaningfully apply
  ```

- Add `spending_tier` to `CLASSIFICATION_TOOL` schema inside the `classifications` items properties:
  ```json
  spending_tier: { type: "string", enum: ["Budget", "Standard", "Premium", "N/A"] }
  ```
  Add to `required` array.

- In the merge step (line ~605-613), include `spending_tier`:
  ```
  spending_tier: classification.spending_tier || "N/A"
  ```
  And default for unclassified (line ~594-602): `spending_tier: "N/A"`

**2. Type: `src/types/transaction.ts`**
- Add `spending_tier: "Budget" | "Standard" | "Premium" | "N/A"` to `EnrichedTransaction`

**3. UI: `src/components/tepilot/ResultsTable.tsx`**
- Add a "Tier" column header after "Subcategory"
- Render color-coded badges:
  - Premium → amber/gold (`bg-amber-500/10 text-amber-700 border-amber-500/20`)
  - Standard → blue/slate (`bg-blue-500/10 text-blue-700 border-blue-500/20`)
  - Budget → teal/green (`bg-teal-500/10 text-teal-700 border-teal-500/20`)
  - N/A → gray (`bg-gray-500/10 text-gray-500 border-gray-500/20`)

