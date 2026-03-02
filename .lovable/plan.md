

## Per-Card Scroll with Transaction Accumulation (No Cross-Card Persistence)

### Current Problem
During the card cycle, all transactions from the current card are highlighted at once in a mini-scroll. Highlights from previous cards persist (accumulate across cards), which the user does not want. The user wants each card to have its **own independent scroll** where related transactions are **identified one by one** and **float to the top** of the list as they're found.

### New Behavior
For each intelligence card (Analytics, Smart Rewards, Relationship Intelligence):

1. **Scroll phase starts**: Full transaction list scrolls. As transactions matching this card's `txIndices` appear, they get highlighted and move/accumulate at the top of the list.
2. **Scroll phase ends / Reveal**: The card's matched transactions are settled at the top, card slides in on the right.
3. **Next card starts fresh**: Previous card's highlights are cleared. The full transaction list resets and a new scroll begins for the next card.

### Visual Effect
Like a search/filter scanning through the list -- relevant transactions "light up" and rise to the top as they're found, building a collected set. Each card starts from a clean slate.

### Technical Changes (EnrichmentMockup.tsx only)

**1. Replace `accumulatedTxs` with per-card state**
- Remove `accumulatedTxs: Map<number, string>` 
- Add `collectedIndices: number[]` -- grows during scroll as transactions are "found"
- Add `currentCardColor: string` -- the active card's accent color

**2. Staggered collection during scroll phase**
- Instead of highlighting all `txIndices` at once, schedule them one by one at ~200ms intervals
- Each new index gets added to `collectedIndices`
- The left panel renders: collected transactions at the top (highlighted), then remaining transactions below (dimmed)
- This creates the "scanning and accumulating to top" effect

**3. Reveal phase**
- Show only the collected transactions (highlighted) at the top, rest dimmed below
- Card slides in on the right

**4. Reset between cards**
- When the next card's scroll starts, clear `collectedIndices` and start fresh
- No persistence of highlights from previous cards

**5. Hold phase**
- Show the last card's collected transactions at top (or show all transactions normally)

**6. Timing adjustments**
- `cardScroll` duration becomes dynamic: `card.txIndices.length * 200 + 400` (enough time for staggered reveals)
- Each card may have different scroll durations based on how many transactions it needs to find

**7. Left panel rendering during cardCycle scroll**
- Split transactions into two groups: `collected` (indices already in `collectedIndices`) and `uncollected` (the rest)
- Render collected first (highlighted with card accent color), then uncollected (dimmed)
- Each newly added transaction gets a brief fade-in/pulse animation

**8. Keyframe updates**
- Remove `orch-mini-scroll` usage during card cycle (no longer scrolling the whole list)
- Add a subtle `orch-collect-pulse` keyframe for the "just found" transaction flash

