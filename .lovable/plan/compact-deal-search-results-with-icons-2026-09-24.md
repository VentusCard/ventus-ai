# Compact deal search results with icons

## What
On the slide 6 phone (semantic search results), make each result card shorter vertically and add a category icon to each deal.

## Current state (verified)
- Search results render in `GeneratedOffersPhoneView.tsx` (lines ~441-475): each card is a tall stack — merchant name, subcategory, one-line description, and a full-width "View Deal" button, plus a left color bar.
- `src/lib/availableDealsData.ts` already defines `DEAL_CATEGORIES` with a color set and an icon per category, and every deal carries `category` — the icon source exists.

## Changes
All in the search-results card block of `src/components/exec-demo/GeneratedOffersPhoneView.tsx`:

1. **Compact single-row layout** — restructure each result card to one horizontal row:
   - Leading icon chip: rounded square (~32px) with the deal's category icon from `DEAL_CATEGORIES`, tinted with the category color background.
   - Middle column: merchant name and `rewardValue` pill on one line; deal description as a single `line-clamp-1` line below (drop the separate subcategory line).
   - Remove the full-width "View Deal" button — the reward pill communicates the offer; the row keeps hover affordance.
2. **Keep the left color bar** for continuity with the collection-card style.
3. Tighten padding (`py-2`) and gaps so each card is roughly half its current height.

Copy, search behavior, filtering, results header, and all other slides are unchanged.

## Verification
- Playwright at 1540x855: open /deckmo, gate with password, navigate to slide 6, type a search (e.g. "coffee machine"), screenshot results — confirm compact rows, icons visible, no layout break.
- Check build-errors.log is clean.
