

## Add clickable trigger pill above each product card

### What
Add a clickable pill directly above each product card in the Next-Product tab that displays the trigger/signal label (e.g., "College Preparation"). Clicking the pill expands a small evidence section showing the associated life event transactions.

### Change: `src/components/exec-demo/NextProductRationale.tsx`

1. **Add `useState`** to track which card index has its evidence expanded (toggle behavior — only one open at a time, or null).

2. **Match each card to its life event**: For each product card, find the matching `LifeEvent` from the `lifeEvents` prop by fuzzy-matching `card.signal_label` against `event.event_name`.

3. **Add a clickable pill above each card** (between the card loop, just before the `<div className="rounded-xl border...">` wrapper):
   - Pill text: the trigger label extracted from `card.signal_label` (e.g., "College Preparation")
   - Styled like the rollup pills in NextOfferRationale: `text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer` with the card's theme color
   - On click: toggle the expanded evidence state for that card index

4. **Conditionally render evidence rows** when the pill is expanded:
   - Show the matching life event's `evidence` array as a compact list of transaction rows: merchant, amount, date, and relevance
   - Styled as a small bordered section below the pill and above the card, with the same left-border accent color
   - Each row: `text-[9px]` with merchant bold, amount right-aligned, date muted

5. **Remove the existing "Trigger:" line inside the card** (lines 164-168) since the pill above now serves that purpose. Keep the rest of the card content intact.

### Technical details
- State: `const [expandedTrigger, setExpandedTrigger] = useState<number | null>(null)`
- Matching: `lifeEvents?.find(e => e.event_name.toLowerCase().includes(card.signal_label.toLowerCase()) || card.signal_label.toLowerCase().includes(e.event_name.toLowerCase()))`
- The evidence data comes from the `LifeEvent.evidence` array which has `{ merchant, amount, date, relevance }`
- For behavioral cards (no life event match), the pill still renders but is not clickable (no evidence to show)

