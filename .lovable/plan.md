

## Plan: Fix Light-Themed Scrollbar on Middle Section

### Root Cause

The `scrollbar-light` class on `NextOfferRationale` has no effect because its `overflow-y-auto` never activates — the div has no height constraint, so it grows to full content height. The actual scrolling happens on the **parent** container in `ExecDemoIntelPanel.tsx` line 368:

```tsx
<div className="flex-1 min-h-0 overflow-auto">
```

This parent uses default browser scrollbar styling, ignoring the `scrollbar-light` class nested below.

### Fix — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

**Line 368**: Add `scrollbar-light` class to the parent scroll container:

```tsx
<div className="flex-1 min-h-0 overflow-auto scrollbar-light">
```

**`src/components/exec-demo/NextOfferRationale.tsx` line 142**: Remove `overflow-y-auto scrollbar-light` from the inner div since it's not the actual scroll container — the parent handles scrolling:

```tsx
<div className="px-3 py-3 space-y-2.5">
```

Two lines changed across two files.

