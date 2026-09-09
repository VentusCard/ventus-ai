# Simplify Intelligence Cards 2 and 3

## Goal

Reduce cards 2 and 3 in the homepage Intelligence section to simple label cards, removing their internal detail lists.

## Current State

`src/components/IntelligenceSection.tsx` now shows:

- Card 2: "Real agnostic behavior enrichment" with five signal-family progress bars.
- Card 3: "External intelligence" with five external-source chips.

## Proposed Changes

1. **Card 2 — Rail agnostic behavioral enrichment**
  - Remove the five signal-family progress bars.
  - Keep the card title/icon only.
2. **Card 3 — External intelligence**
  - Remove the five external-source chips.
  - Keep the card title/icon only.
3. Keep card 1 (Sources) and card 4 (Holistic understanding with five pills) unchanged.
4. Preserve the four-stage scroll animation, active/inactive dimming, and responsive layout.

## Verification

- Run `bunx tsgo --noEmit`.
- Check `/tmp/observability/build-errors.log`.
- Use Playwright to scroll through the Intelligence section and confirm cards 2 and 3 display only their titles.