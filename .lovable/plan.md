
## Goal

Each of the 5 sample cards in the "Micro-Segment Personalized Campaign Output" deck should surface an **estimated reach** (population count) — the reason each card earned a top-5 slot. Also surface the featured card's reach in the left "Example 01/05" counter block so the viewer sees the number tied to the currently shown card.

## Changes

### 1. `buildMessageCards.ts`
- Add `estimatedReach: number` to the `MessageCard` interface.
- Add a small deterministic helper `computeReach(family, slot, seed, variantsTotal)` that returns a plausible customer count per card. Rules:
  - BEHAVIOR cards → largest audiences (broad spend patterns), ~40–120K range
  - DEMOGRAPHIC → mid, ~15–45K
  - LIFE_EVENT → smaller, ~4–14K (event-triggered)
  - FINANCIAL_SIGNAL → smallest, ~2–9K (narrow trigger)
  - Values seeded by `seed` + `slot` so Regenerate produces new but stable numbers.
  - Rounded to nearest 100 for realism.
- Populate `estimatedReach` when constructing every card, including the `CUSTOMER_CHOICE_CARDS` overrides (assign at return-time, don't hardcode into the constant).
- Sort the final 5-card array descending by `estimatedReach` so slot 01 is always the largest — reinforcing "top 5 for a reason."

### 2. `MessagePreviewsSection.tsx`
- **Per-card display (FannedDeck):** Add a small reach chip in the top row next to the `play` + `anchor` badges, e.g. `Users` icon + `"~48.2K reach"`. Formatting reuses the same K/M rule as `AudienceEstimateBar` (inline, no shared util needed).
- **Left counter block:** Under the existing "Example / 01 / 05 / shown below" section, add one line with the featured card's reach, e.g. `~48.2K customers` in slate-700, tabular-nums. Updates as the user pages through cards.
- No other layout changes; keep light theme, existing colors, spacing.

## Out of scope
- No changes to `AudienceEstimateBar`, targeting logic, or variant math.
- No new sort controls or filters.
- No copy changes to card subjects/bodies.

## Technical notes
- `computeReach` is pure and deterministic — same `(family, slot, seed)` yields same number, so screenshots and demo runs stay stable.
- Sorting by reach happens after all 5 cards are built, so play/anchor pairing logic is unchanged.
