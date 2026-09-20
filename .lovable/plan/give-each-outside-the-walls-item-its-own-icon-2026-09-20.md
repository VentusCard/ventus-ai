# Give each "Outside the Walls" item its own icon

## Current state (verified)
On the Visibility Gap slide, the right-hand "OUTSIDE THE WALLS — What else goes on" roller renders every life-event card with the same `ExternalLink` icon in `OutsideTicker` (src/components/deckmo/DeckmoDeck.tsx:198-201). The seven items come from `DECKMO.visibility.outside.rows` in src/lib/deckmoScript.ts:66:
Bought a house · Changed to a new job · Got married · Started a business · Took a trip overseas · Children going to college · And everything in between.

## Change
Add an icon lookup keyed by row text and render it in place of the shared `ExternalLink`:

- Bought a house → Home
- Changed to a new job → BriefcaseBusiness
- Got married → Heart
- Started a business → Building2
- Took a trip overseas → Plane
- Children going to college → GraduationCap
- And everything in between → Sparkles

Any future row without a mapping falls back to `ExternalLink`, so the ticker keeps working if copy changes.

Sizing/styling of the icon tile stays exactly as today (same 8×8 rounded tile, muted color), so only the glyphs change.

## Files touched
- src/components/deckmo/DeckmoDeck.tsx — add `Heart`, `GraduationCap`, `BriefcaseBusiness` to the lucide-react import; add an `OUTSIDE_ICONS` map inside/next to `OutsideTicker`; swap the fixed `<ExternalLink/>` for the mapped icon. Remove `ExternalLink` from the import only if it ends up unused.

## Validation
- Build must be clean.
- Playwright: scroll to the Visibility Gap section, confirm each card shows its distinct icon, rollers still animate, no overflow at 1540×855, 1024×768, and 1920×1080.
