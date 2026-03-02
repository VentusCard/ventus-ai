

## Per-Card Scrolling with Accumulated Highlights

### Current Problem
During the card cycle, each card shows a mini-scroll with only its own transactions highlighted. When the next card starts scrolling, the previous card's highlights disappear. The user wants each card to have its own full scrolling animation AND accumulate highlights from all previous cards.

### New Behavior
- **Card 1 scroll**: Full transaction list scrolls. Card 1's transactions get highlighted as they appear.
- **Card 1 reveal**: Transactions settle. Card 1's highlights visible.
- **Card 2 scroll**: Full transaction list scrolls again. Card 1's highlights persist (accumulated), Card 2's transactions get highlighted with card 2's color.
- **Card 2 reveal**: Transactions settle. Card 1 + Card 2 highlights visible.
- **Card 3 scroll**: Full transaction list scrolls again. Card 1 + Card 2 highlights persist, Card 3's transactions highlighted with card 3's color.
- **Card 3 reveal**: All three sets of highlights visible.
- **Hold**: All accumulated highlights remain.

### Technical Changes (EnrichmentMockup.tsx only)

**1. Replace `highlightedTxs` with accumulated map**
- New state: `accumulatedTxs: Map<number, string>` -- maps transaction index to accent color
- On each card's scroll phase, merge current card's txIndices into the map (keeping previous entries)
- `highlightColor` stays for the "active" card's color reference

**2. Scroll phase rendering**
- During each card's scroll phase, show ALL transactions with the `orch-mini-scroll` animation
- Transactions in `accumulatedTxs` from previous cards stay highlighted with their stored color
- Current card's transactions highlighted with the active card's color
- Non-matched transactions dimmed

**3. Reveal phase rendering**
- Show all transactions statically (no scroll)
- All accumulated transactions highlighted with their respective colors
- Non-accumulated transactions dimmed

**4. Hold phase**
- Same as reveal -- show all transactions with full accumulated highlights

**5. TxRow update**
- No changes needed -- already supports `highlight` and `highlightColor` props

**6. Left panel rendering logic**
- Replace the separate scroll/reveal/hold transaction blocks with a unified approach:
  - Always render the full `customer.transactions` list
  - Each row checks if its index is in `accumulatedTxs` map to get highlight color
  - During scroll phases, wrap in the scroll animation
  - During reveal/hold phases, show statically

