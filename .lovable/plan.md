

## Plan: Fix Card Clicks with Single Customer

**Problem**: Line 139 in `src/pages/DemoPage.tsx` guards `DemoDetailOverlay` with `customerA && customerB`, so the overlay never renders when only one customer is selected.

### Change

**File: `src/pages/DemoPage.tsx`, line 139**

Change:
```tsx
{activeNode && customerA && customerB && (
```
To:
```tsx
{activeNode && (customerA || customerB) && (
```

This single-line fix allows the detail overlay to appear when at least one customer is present, matching the new single-customer enrichment flow.

