

## Make Personalized UX pillar cards bigger and more readable

The 4 lifestyle spending pillar cards in `DemoEngagementView.tsx` (lines 217–289) are currently in a 2×2 grid with small text sizes. The plan increases sizing across the board for better readability.

### Changes (single file: `src/components/demo/DemoEngagementView.tsx`)

1. **Switch grid to single column** — Change `grid grid-cols-2 gap-1.5` to `grid grid-cols-2 gap-2.5` (keep 2-col but with more spacing), or optionally go single-column for maximum readability
2. **Increase card padding** — `px-2.5 py-2` → `px-3.5 py-3`
3. **Increase pillar icon size** — `text-sm` → `text-lg`
4. **Increase pillar name text** — `text-[10px]` → `text-[13px]`
5. **Increase budget text** — `text-[9px]` → `text-[11px]`
6. **Increase status badge** — `text-[7px]` → `text-[9px]`
7. **Increase budget bar height** — `h-1.5` → `h-2`
8. **Increase subcategory/trip row text** — `text-[9px]` → `text-[11px]`
9. **Increase Trip toggle label** — `text-[7px]` → `text-[9px]`
10. **Increase chevron icons** — `w-2.5 h-2.5` → `w-3 h-3`

All changes are confined to the pillar card section within `PhoneMockup`. The 2-column layout is preserved to keep the 4-card grid compact but each card gets more breathing room and larger text.

