

## Fix: Phone View Shows "Waiting for analysis..." on Relationship Tab

### Problem
Line 681 in `ExecDemoPage.tsx` only sets `showContent={true}` for `rewards` and `product` tabs. The `relationship` (and `analytics`) tabs never pass `showContent=true`, so the phone always shows "Waiting for analysis...".

### Fix
**File: `src/pages/ExecDemoPage.tsx`** — line 681

Change the `showContent` condition to also include `analytics` and `relationship`:

```typescript
// Before
showContent={(activeTab === "rewards" || activeTab === "product") && phase !== "idle"}

// After  
showContent={activeTab !== null && phase !== "idle"}
```

This makes the phone view show content for any active tab once the demo is past the idle phase. One line changed.

