

## Goal

Add a **Focus mode toggle** to the bottom-right of the Next-Offer phone view. Default ON → only the Curated Collection carousel shows. Toggle OFF → all other elements (Welcome bar, Location Experience, Top Pick, Expiring Soon) reappear.

## Plan

### `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

1. Add state: `const [focusMode, setFocusMode] = useState(true);`
2. Wrap these blocks in `{!focusMode && (...)}`:
   - Savings Summary Bar (Welcome + savings)
   - Location Experience (MoMA / Mets)
   - Top Pick For You
   - Expiring Soon
3. Always render the Curated Collection carousel (header + cards + nav dots).
4. Add a small toggle row pinned just above the search bar at the bottom of the phone, right-aligned:
   ```
   [                    Layers · Focus  [Switch] ]
   [ 🔍 Search deals...                          ]
   ```
   Use `@/components/ui/switch` + `Layers` icon from lucide. Tiny text (`text-[9px]`), right-aligned.

## Files touched

- `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

## Verification

1. `/demo` → Next-Offer tab → only Curated Collection carousel visible.
2. Toggle off → Welcome, Location, Top Pick, Expiring Soon reappear above.
3. Toggle on → only carousel + search remain.

## Out of scope

Carousel internals, search behavior, other tabs.

