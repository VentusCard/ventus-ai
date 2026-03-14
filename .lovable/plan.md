

# Beat 4: Reveal Merchant Names Without Card Refresh

## Problem
When clicking to advance Beat 4 from phase 0 to phase 1 (revealing merchant names), the card visually "refreshes" — the transaction rows re-animate even though only the merchant names should appear. The existing card content should stay stable and the merchant names should simply fade in on top.

## Root Cause
The transaction row `div`s have `animate-fade-slide` with staggered delays. While React doesn't technically re-mount them (same key/parent), the conditional rendering of the merchant name `span` inside each row can cause layout shifts that make it feel like a refresh.

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Keep transaction rows stable across phases
- Remove `animate-fade-slide` from the transaction row `div`s and instead only apply it on initial mount (when `beat4Phase === 0`). Use a ref or conditional class to prevent re-animation on phase changes.
- Simpler approach: always render the merchant name `span` but control its visibility with `opacity` and a CSS transition, rather than conditional rendering with `{beat4Phase >= 1 && ...}`.

### 2. Smooth reveal for merchant names
Replace the conditional render:
```tsx
{beat4Phase >= 1 && (
  <span className="animate-fade-slide" ...>{tx.merchant}</span>
)}
```
With an always-rendered span that transitions opacity:
```tsx
<span 
  className="transition-all duration-500"
  style={{ 
    opacity: beat4Phase >= 1 ? 1 : 0,
    transform: beat4Phase >= 1 ? 'translateX(0)' : 'translateX(-8px)',
  }}
>
  {tx.merchant}
</span>
```

This keeps the DOM structure stable across phases — no layout shift, no re-mount, just a smooth reveal.

