

## Swap Sections & Expand Merchant Partner into Multi-Row Table

### Layout Change
Current expanded card order:
1. Why This Fits
2. Detail Grid (Merchant Partner / Conversion Rate / Peak Spending)
3. Deployment Strategy
4. Audience Tags

New order:
1. Why This Fits
2. **Deployment Strategy** (moved up)
3. Detail Grid (Conversion Rate / Peak Spending — **Merchant Partner removed from grid**)
4. **Merchant Partners Table** (new, full-width) — each brand on its own row with columns: Merchant, Product, MSRP, Link
5. Audience Tags

### Data Model Update

Add a new field `merchantDetails` to `CategoryExtensionOpportunity` in `types/bankwide.ts`:

```typescript
merchantDetails: Array<{
  name: string;        // "GoPro"
  product: string;     // "HERO13 Black"
  msrp: string;        // "$399.99"
  link: string;        // "https://gopro.com"
}>;
```

### Files Changed

1. **`src/types/bankwide.ts`** — Add `merchantDetails` array to `CategoryExtensionOpportunity`
2. **`src/lib/categoryExtensionData.ts`** — Add `merchantDetails` array to all 45 entries (parse from existing `extensionMerchant` string, add realistic product names, MSRPs, and merchant URLs)
3. **`src/components/tepilot/insights/CategoryExtensionOpportunities.tsx`** — Swap Deployment Strategy above the detail grid, replace single Merchant Partner card with a full-width table using the Table component, reduce detail grid to 2 columns (Conversion Rate, Peak Spending)

