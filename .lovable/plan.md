

## Redesigned Card Reveal Animation

### Current Behavior
After the initial transaction scroll + persona pills phase, all 3 intelligence cards (Analytics, Smart Rewards, Relationship Intelligence) appear with a simple stagger -- while the left panel shows a static set of settled transactions.

### New Behavior
Each of the 3 cards gets its own mini-cycle: a brief transaction roll on the left highlighting the relevant transactions, then the card slides in on the right with those transactions settled and highlighted. This visually demonstrates how different signals are extracted from different transaction subsets.

### Data Changes
Add a `txIndices` field to each `IntelCard` linking it to specific transactions from the customer's list. For example, for Michael R.:
- **Analytics Intelligence** (renovation): Home Depot, Lowe's, Pottery Barn, Restoration Hardware, Ferguson, Sherwin-Williams (indices 0-5)
- **Smart Rewards**: Home Depot, Lowe's, Vail Resorts, Whole Foods (indices 0,1,6,10)
- **Relationship Intelligence** (life event): Mix of renovation + home transactions across accounts (indices 0-5, 14-18)

Similarly for Sarah & David L. with baby/family transaction groupings.

### Animation Sequence Redesign
Replace the single `"cards"` phase with a per-card sub-sequence:

```text
profile (1s)
  --> scroll + persona pills (3s)
  --> card1-scroll (1.2s) : left shows mini-roll of card1's transactions
  --> card1-reveal (0.8s) : card1 appears, left settles with highlighted txs
  --> card2-scroll (1.2s) : left shows mini-roll of card2's transactions
  --> card2-reveal (0.8s) : card2 appears, left settles with highlighted txs
  --> card3-scroll (1.2s) : left shows mini-roll of card3's transactions
  --> card3-reveal (0.8s) : card3 appears, left settles with highlighted txs
  --> hold (2s)
  --> flip (0.8s)
```

### Implementation Details

**State additions:**
- `activeCardIdx`: which card (0-2) is currently being revealed (-1 = none)
- `cardPhase`: `"scroll" | "reveal" | null` -- whether the active card is in its scroll or reveal sub-phase
- `highlightedTxs`: array of transaction indices to highlight on the left for the current card

**Left panel changes:**
- During a card's scroll sub-phase: show a brief rolling animation of only that card's associated transactions
- During a card's reveal sub-phase: show those transactions settled and highlighted (with the card's accent color glow/border)
- Non-highlighted transactions shown dimmed

**Right panel changes:**
- Cards still appear one by one, but each waits for its scroll sub-phase to complete
- Once revealed, cards stay visible

**TxRow component update:**
- Accept an optional `highlight` prop (boolean) and `highlightColor` (string)
- When highlighted, show a subtle left-border glow or background tint matching the card's accent color

**File modified:** `src/components/hero/EnrichmentMockup.tsx` only

