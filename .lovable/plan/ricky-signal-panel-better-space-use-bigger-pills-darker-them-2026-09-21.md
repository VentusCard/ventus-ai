# Ricky signal panel: better space use, bigger pills, darker themed borders

Scope: `src/components/deckmo/DeckmoDeck.tsx` only (the `TONES` map, `SignalFamilyCard`, and the right-panel grid in `Ricky`). No data or script changes, no copy changes.

## Changes

1. **Darker color-themed pill borders** — pills currently have `border-transparent`. Add a `pillBorder` value per family tone in `TONES` (blue-300, amber-300, emerald-300, violet-300, rose-300) and apply it to each pill button, so every pill is outlined in its own family color, one step darker than the tint background.

2. **Bigger pills** — increase pill size:
   - text: 12px → 14px (13px under max-height 800px)
   - padding: `px-3 py-2` → `px-4 py-2.5`
   - min height: `min-h-9` → `min-h-11`
   - "Ext" chip scaled up proportionally (9px text, slightly larger icon/padding)
   - family header label bumped to match (10px → 11px)

3. **Use the vertical space better** — the five family sections currently stack at the top of the right panel, leaving the bottom empty. Change the right-panel grid from top-packed (`content-start gap-y-4`) to rows that fill the panel height (`grid-cols-1 auto-rows-fr` with modest `gap-y-3`), so the five families spread evenly across the full panel height. Left ledger and masthead untouched.

## Verification

- `bunx tsgo --noEmit` clean.
- Playwright at 1540×855: navigate to /deckmo (password-gated; use ?from=demo), ArrowRight to Ricky's second beat, screenshot — confirm visible family-colored borders on all pills, larger pills, families distributed across the full panel height, pill click still filters the ledger, no page errors.
