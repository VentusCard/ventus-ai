

# Redesign Beat 5 Card — Spacing and Typography

## Issues Identified
From the screenshots and code:
1. **Column headers are cramped** — the uppercase text at `text-xs` is too small and dense for two-line headers
2. **Inconsistent vertical spacing** — the gap between headers and cards changes awkwardly between phases (`mt-10` vs `mt-4`)
3. **Arrow is too thin and small** — the connecting arrow between left/right columns gets lost
4. **Left column cards feel flat** — Demographics/Transactions boxes are thin with minimal padding
5. **Right column items are uniform** — no visual hierarchy between the four output items
6. **Overall card padding is tight** — the `p-8` outer container doesn't give enough breathing room for the diagram

## Proposed Changes

**File**: `src/components/demo/DemoPasswordGate.tsx` (lines ~378-473)

### 1. Column Headers
- Bump to `text-[11px]` with `leading-relaxed` for better readability on two-line headers
- Add `max-w-[220px]` so text wraps naturally and consistently in both phases
- Use consistent `mt-8 mb-5` spacing (no phase-dependent margin change)

### 2. Left Column (Demographics / Transactions)
- Increase vertical padding from `py-3` to `py-4`
- Widen the gap between the two cards from `gap-3` to `gap-4`
- Make the Intent Data bracket padding slightly larger (`-inset-4`) for better framing

### 3. Arrow / Connector
- Widen the line from `w-8 sm:w-14` to `w-10 sm:w-16`
- Increase arrowhead SVG from 12×12 to 14×14

### 4. Right Column (Analytics / UX / Rewards / Relationship)
- Increase padding from `px-4 py-2` to `px-4 py-2.5`
- Keep consistent `gap-2.5`

### 5. Outer Container
- Bump padding from `p-8 sm:p-10` to `p-10 sm:p-12` for more breathing room
- Consistent `mt-8` before the diagram section regardless of phase

