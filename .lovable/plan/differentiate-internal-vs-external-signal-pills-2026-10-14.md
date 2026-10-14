# Differentiate internal vs external signal pills

## Scope
Only the live signal pills in the deck's Section 4 story (`src/components/deckmo/RickySignalStory.tsx` + `src/styles/base.css`). The old `SignalFamilyCard`/`Ricky` scene is not reachable from the deck sequence, so it stays untouched.

## Changes

1. **Internal pills slightly darker and more saturated**
   - Today every pill uses the same tone: background `hsl(accent / 0.13)`, border `hsl(accent / 0.38)`.
   - Internal pills become background `hsl(accent / 0.22)` and border `hsl(accent / 0.55)`, with the hover state raised proportionally (background `/ 0.30`) so the family stays legible on hover. Text color is unchanged (already the full accent).
   - External pills keep today's lighter tint, so the two read differently at a glance without changing any family color.

2. **External badge moves to the front of the pill**
   - The `Sparkles` icon + `Ext` chip currently renders after the pill's text. Move it before the label, with `mr-1.5` instead of `ml-1.5`, so each external pill reads "✦ EXT — Goldman Marcus HYSA" style from the left.
   - The nested attribute chips stay inside the pill after the label, unchanged.

3. **Marking the source in the DOM**
   - Add `data-signal-source` (`internal` / `external`) on each pill button so the new styling keys off it instead of duplicating classes.

## Constraints preserved
- Strict light theme, family colors, pill wording, order, and click-to-open popover behavior unchanged.
- 4.1 reveal untouched: external pills and their lead-in words still fade/blur at step 0 and sharpen at 4.2; the darker internal styling also applies at 4.1 (it is not tied to reveal step).
- Arrow/A/D-only navigation; pill clicks never change slides.

## Verification
- `bunx tsgo --noEmit`, deck test suite (`scripts/deckmoSignalStory.test.ts` etc.), build log clean.
- Playwright on `/deckmo` at 1691×842 (plus 1376×1011): on 4.2 confirm internal pills are visibly deeper-tinted than external pills and every external pill leads with the Sparkles/Ext badge; on 4.1 confirm external pills and lead-ins are still blurred while internal pills show the new depth; click a pill to confirm the popover still opens and slides do not move.
- Record the preference in project memory (internal pills darker/more saturated; external badge leads the pill).
