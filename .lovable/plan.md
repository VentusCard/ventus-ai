Two changes to section 3 (`MessagePreviewsSection`) plus a tiny extension to the local card builder.

## 1. Rename "Total campaigns" → "Micro-segments"
`src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` line 121:
```
Total campaigns  →  Micro-segments
```
Header (line 101) and "shown below" copy stay as-is.

## 2. Regenerate button (local re-roll)
Goal: re-shuffle the 5 exemplars without calling any edge function.

### a. Add a seed parameter to the deterministic builder
`src/components/tepilot/campaigns/sections/buildMessageCards.ts`:
- Add optional 5th arg `seed: number = 0`.
- In the three `i % pool.length` lookups (lines ~298, 307–308, 321), replace `i` with `(i + seed)` so each bump rotates the anchor + play picks.
- No other logic changes; output stays a 5-card array of `MessageCard`.

### b. Wire seed state + button in `MessagePreviewsSection.tsx`
- New state: `const [regenSeed, setRegenSeed] = useState(0);`
- Pass `regenSeed` into `buildMessageCards(product, variants, offers, campaignLink, regenSeed)`.
- Extend the stagger-reveal `useEffect` dependency from `[productName]` to `[productName, regenSeed]` so each regen replays the cascade.
- Reset `regenSeed` to `0` inside `handleSelectProduct` (parent) — simplest: also reset on product change via `useEffect(() => setRegenSeed(0), [productName])`.
- Button placement: top-right of the section header row (next to title on line 99–102). Small ghost-style icon button using `RefreshCw` from `lucide-react`:
  ```
  [3] Micro-Segment Personalized Campaign Output           [↻ Regenerate]
  ```
  - `text-[11px] font-medium text-slate-600 hover:text-slate-900`, slate-200 border, white bg, rounded-md, px-2 py-1, gap-1 with a `w-3.5 h-3.5` icon. Disabled when `!product`.
  - On click: `setRegenSeed((s) => s + 1)`.

## Out of scope
- No edge-function call (per user choice "Re-roll local cards only").
- No changes to the fanned deck, popover, counter math, or `variants.total`.