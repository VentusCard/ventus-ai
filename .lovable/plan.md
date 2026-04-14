

## Fix: Product card pills not filtering transactions

### Root Cause
The pill click passes `card.signal_label` (e.g., "Frequent Domestic Traveler") as the filter label, but the filtering logic at `ExecDemoPage.tsx:632` matches against `signalMap[i].label` which contains granular subcategory labels like "Airlines" or "Hotels". These never match.

### Fix

**`src/components/exec-demo/NextProductRationale.tsx`**
- Change the `onPillClick` call to pass `isCategory: true` and use the **pillar name** as the label instead of `card.signal_label`. This will match all transactions in that pillar (e.g., all "Travel & Leisure" transactions).
- Update the `onPillClick` prop type to accept `isCategory`.

```tsx
// Change from:
onClick={() => onPillClick?.(themeToPillar[card.theme] || "Lifestyle", card.signal_label)}

// To: filter by pillar's category — pass pillar as both pillar and use a pillar-level filter
onClick={() => onPillClick?.(themeToPillar[card.theme] || "Lifestyle", card.signal_label, false)}
```

**`src/pages/ExecDemoPage.tsx`**
- Update the `filteredIndices` logic to add a fallback: when `activePillFilter` is set but no transactions match by label, fall back to matching all transactions in that pillar.

Specifically at line 630-633, change:
```tsx
if (activePillFilter) {
  const byLabel = Object.entries(sm)
    .filter(([, s]) => s.pillar === activePillFilter.pillar && 
      (activePillFilter.isCategory ? s.category === activePillFilter.label : s.label === activePillFilter.label))
    .map(([idx]) => Number(idx));
  // Fallback: if no matches by label, show all transactions for that pillar
  if (byLabel.length > 0) return byLabel;
  return Object.entries(sm)
    .filter(([, s]) => s.pillar === activePillFilter.pillar)
    .map(([idx]) => Number(idx));
}
```

This ensures clicking "Frequent Domestic Traveler" (mapped to "Travel & Leisure" pillar) highlights all travel-related transactions in the left panel.
