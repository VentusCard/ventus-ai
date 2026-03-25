

## Hide Previous/Next Buttons in Bank Analytics View

### Problem
The Previous/Next buttons at the bottom-right only cycle the overlay header for bank-wide nodes — the AnalyticsContainer has its own sidebar navigation, making these buttons useless.

### Change

**File: `src/pages/DemoPage.tsx`**

1. Add a `BANK_WIDE_NODES` set (same as in `DemoDetailOverlay.tsx`):
```ts
const BANK_WIDE_NODES = new Set(["analytics", "travel", "lifeEvents", "outflow", "locational", "lifeEventIntel", "wmCopilot", "aiFinancialInsights", "dealPersonalization"]);
```

2. Change the navigation condition (around line 141) from:
```tsx
{activeNode ? (
```
to:
```tsx
{activeNode && !BANK_WIDE_NODES.has(activeNode) ? (
```

This hides Previous/Next for all bank-wide overlay nodes while keeping them for individual-customer nodes (`engine`, `engagement`, `rewards`, `wealth`, etc.).

