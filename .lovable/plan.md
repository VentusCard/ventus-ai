

## Remove Tier-Overlapping Labels from Subcategories

The `classify-transactions` edge function prompt includes subcategory labels like "Premium", "Budget", "Luxury", "Mid-Range" that duplicate the `spending_tier` field. These should be excluded from subcategories.

### Changes to `supabase/functions/classify-transactions/index.ts`

**1. Add explicit exclusion rule** to the SUBCATEGORY LABEL RULES section (~line 204-208):
- Add: `• Do NOT use tier/price-level labels (Premium, Budget, Luxury, Mid-Range, High-End, Value, Discount). These are covered by the spending_tier field.`

**2. Clean up examples** that use tier labels in subcategories:
- Line 98: `EQUINOX → ["Premium", "Membership"]` → `["Membership"]`
- Line 100: `LULULEMON → ["Apparel", "Premium"]` → `["Apparel", "Athletic"]`
- Line 115: `BLUE CROSS → ["Premium"]` → `["Monthly"]`
- Line 134: `FOUR SEASONS → ["Luxury"]` → `["Full-Service"]`
- Line 135: `HERTZ → ["Standard"]` → `["Airport"]`
- Line 142: `IKEA → ["Furniture", "Budget"]` → `["Furniture", "Self-Assembly"]`
- Line 149: `NORDSTROM → ["Premium"]` → `["Department Store"]`
- Line 152: `TIFFANY & CO → ["Fine Jewelry", "Luxury"]` → `["Fine Jewelry"]`
- Line 133: `MARRIOTT → ["Mid-Range"]` → `["Full-Service"]`

**File**: `supabase/functions/classify-transactions/index.ts`

