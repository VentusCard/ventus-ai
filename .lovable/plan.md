

## Compact Offers cards to fit without scrolling, life event first

### Changes

**File: `src/components/exec-demo/ProductCardsPhoneView.tsx`**

1. **Sort cards**: life_event type first, behavioral second — simple `.sort()` before mapping
2. **Compact card layout** to fit both cards + header + disclaimer in ~600px visible area:
   - Card padding: `p-5` → `p-3.5`
   - Category tag margin: `mb-3` → `mb-1.5`
   - Product name: `text-[15px] mb-1.5` → `text-[13px] mb-1`
   - Quote: `text-[12px] mb-4` → `text-[11px] mb-2`
   - Benefits spacing: `space-y-2 mb-4` → `space-y-1.5 mb-2`
   - Value line: `mb-4` → `mb-2.5`
   - CTA button: `py-2.5` → `py-2`
   - Outer container: `space-y-4 py-4` → `space-y-3 py-3`
3. **Header**: Tighten slightly — `px-4 py-4` → `px-3 py-2`

Single file, ~15 lines of sizing tweaks plus a 1-line sort.

