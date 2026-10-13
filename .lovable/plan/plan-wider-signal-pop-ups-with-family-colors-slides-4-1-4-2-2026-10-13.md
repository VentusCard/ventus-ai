# Plan: Wider signal pop-ups with family colors (slides 4.1 / 4.2)

## Goal
On the Ricky signal-story slides, each pill pop-up card becomes wider and carries the family's color more visibly, instead of the current near-white card with only a faint tint.

## Changes

1. **Width** — `src/components/deckmo/RickySignalStory.tsx`
   - Popover content width: `w-[min(560px,calc(100vw-32px))]` → `w-[min(760px,calc(100vw-32px))]`.
   - Keep max-height, scroll, and collision padding as-is so the card still fits small desktop sizes.

2. **Family colors** — `src/styles/base.css` (existing `.ricky-story-popover` rules at lines 527–534)
   - Stronger header: raise the header tint from 8% to ~14% of the family color and add a colored top accent bar on the card (4px, family color) so the family is obvious at a glance.
   - Slightly stronger card border in the family color (0.45 → ~0.6) and a tinted shadow.
   - Section headings ("Key details", "Merchants", "Observed monthly payments", "Supporting transactions", "Outside evidence") rendered in the family color.
   - "Internal ledger" / "External signal" badge and family label tinted with the family color; external badge keeps its existing distinct styling.
   - Key-details chips, merchants chips, and the outside-evidence box take a light family-color tint instead of plain slate.
   - All colors stay strict light theme (white card, dark text), derived from the existing five family tokens: violet (Demographics), emerald (Financial), blue (Behavioral), amber (Life Events), rose (Risk).

3. **No behavior change** — click-to-open, click-outside/Escape/X closing, slide navigation rules, nested attribute pills, and evidence content stay exactly as they are.

## Verification
- bun tests (`scripts/deckmoSignalStory.test.ts` etc.) pass; build OK.
- Playwright at 1375×842 and 1691×1011: open several pop-ups (one per family, including an external one), confirm the wider width, per-family color accents, no overflow, no slide movement.
