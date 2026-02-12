

# Enhance Wealth Demo: Slower Transitions, Animated Details, More Transactions, Distinct Source Labels

## What's Changing

Four improvements to the existing `VentusWealthDemo.tsx`:

### 1. Slower Animation Cycling
- Increase the time each detail overlay is shown from **5 seconds to 8 seconds**
- Increase the gap between closing one detail and opening the next from **1.2s to 2.5s**
- This gives viewers more time to absorb each client's event details

### 2. Animated "Ventus AI Insight" and "Recommended Next Steps"
- When the detail overlay opens, the Insight text will **type in word-by-word** (typewriter effect) instead of appearing instantly
- Each Recommended Step will **fade-slide in sequentially** with staggered delays (step 1 at 0.5s, step 2 at 0.8s, step 3 at 1.1s, step 4 at 1.4s)
- New CSS keyframes: `vwm-typeIn` for the insight box and `vwm-stepSlide` for each step item
- React state will track `insightRevealed` (number of words shown) and `stepsRevealed` (number of steps shown), driven by intervals that start when the detail overlay opens

### 3. More Supporting Transactions
- Expand every event's transaction list from 2-4 items to **5-7 items** each
- Add realistic additional transactions per event type:
  - **Retirement Planning (c1)**: Add "Social Security Admin" website visit, "Vanguard Target Date Fund" rebalance, "Medicare.gov" research
  - **Home Purchase (c2)**: Add "Lowe's", "Title Insurance Co.", "Home Inspection Services"
  - **Business Liquidity (c5)**: Add "Ernst & Young Tax Advisory", "Business Insurance Review"
  - **Education (c1)**: Add "Kaplan Test Prep", "FAFSA Application"
  - And similar expansions for all 12 events

### 4. More Prominent Transaction Source Labels
- Currently all card badges use the same purple style (`.vwm-detail-tx-card`)
- Replace with **color-coded source labels** based on account type:
  - **Checking**: Blue background (`rgba(59,130,246,.20)`, text `#93c5fd`, border blue)
  - **Platinum**: Purple background (`rgba(168,85,247,.20)`, text `#c084fc`, border purple)
  - **Cashback**: Green background (`rgba(34,197,94,.20)`, text `#86efac`, border green)
  - **Travel Elite**: Amber background (`rgba(245,158,11,.20)`, text `#fcd34d`, border amber)
  - **Business**: Slate background (`rgba(100,116,139,.20)`, text `#cbd5e1`, border slate)
  - **Web Activity**: Cyan background (`rgba(6,182,212,.20)`, text `#67e8f9`, border cyan)
- Labels will also be slightly larger (font-size 10px, padding 3px 8px) with bolder weight for better visibility
- A small dot indicator before the label text matching the color for extra visual pop

## Technical Details

### File: `src/components/technology/demos/VentusWealthDemo.tsx`

**New state variables:**
- `insightWordCount: number` -- how many words of the insight to show (incremented by interval)
- `stepsShown: number` -- how many steps to reveal (incremented by interval)

**New animation logic in detail open:**
- When `detailVisible` becomes true, start an interval that increments `insightWordCount` every 40ms (fast but visible typewriter), and after insight is done, start incrementing `stepsShown` every 300ms
- Reset both to 0 when detail closes

**New CSS classes:**
- `.vwm-detail-tx-card.checking`, `.platinum`, `.cashback`, `.travel`, `.business`, `.web` -- each with distinct background/text/border colors
- `.vwm-step-item.revealed` -- fade-slide-in animation
- `.vwm-insight-cursor` -- blinking cursor during typewriter effect

**Data changes:**
- Expand all 12 `DETAILS` entries with 2-3 additional transactions each
- Add a `cardType` field derived from the `card` string to determine color coding

**Timing changes:**
- `await wait(5000)` in cycle loop becomes `await wait(8000)`
- `await wait(1200)` gap between events becomes `await wait(2500)`

