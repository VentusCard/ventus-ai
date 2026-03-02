

## Add Fifth Tab: Travel & Local Experiences

**File: `src/components/PlatformTabs.tsx`**

### 1. Update section heading

Change "One Tech Core. Four Insight Tools." to **"One Tech Core. Five Insight Tools."**

### 2. Insert new tab data after Customer Engagement (index 3, before Wealth)

```ts
{
  label: "Travel & Local",
  heading: "Travel & Local Experiences",
  href: "/smartrewards",
  description:
    "Detect trips from transaction patterns alone — no location tracking required. Then position your bank as a holistic travel companion with curated deals, local experiences, and perks across dining, shopping, arts, and entertainment.",
  capabilities: [
    "Trip detection from spending patterns without GPS or location data",
    "Curated local experiences across dining, arts, shopping, and entertainment",
    "Geo-targeted deals that turn every trip into a bank-powered experience",
  ],
}
```

### 3. Add `TravelLocalPreview` component

A compact preview matching the style of the other four, showing:

- **Detected trip card** at the top: destination badge ("Miami, FL"), date range, transaction count, and total spend — with a small "No location tracking" note to reinforce the privacy angle
- **3 local experience tiles** below: each with a category badge (Arts, Dining, Shopping) and a sample deal (e.g., "Perez Art Museum — 15% off", "Zuma Miami — $50 dining credit", "Bayside Marketplace — 10% back")
- Visual style: rounded-lg borders, gray-50 backgrounds, small colored category badges — consistent with existing previews

### 4. Wire into `TabPreview`

Add `TravelLocalPreview` at index 3 in the previews array, shifting `WealthPreview` to index 4.

