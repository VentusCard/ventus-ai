

## Tighten Consumer Rewards Phone Mockups

### Changes — `src/components/demo/DemoRewardsView.tsx`

#### 1. Remove the "Lifestyle Profile" banner card
Delete the gradient lifestyle banner block (lines 279-297) — the one showing "Your Lifestyle" / lifestyle type / pillar chips. This is redundant with the deal cards themselves which already communicate the personalization story.

#### 2. Deduplicate reward value display
Currently each deal card shows:
- `deal.rewardValue` as a badge (e.g. "7% Cashback") on the top-right
- `deal.dealTitle` as a subtitle which often repeats the same reward text

Fix: Remove the `dealTitle` line (line 349). The reward badge + merchant name + AI message is sufficient. The card becomes: **icon + merchant name + reward badge** on row 1, then **AI message** on row 2.

#### 3. Tighten spacing throughout
- Reduce phone content padding from `p-4 space-y-2.5` to `p-3 space-y-2`
- Reduce deal card internal padding from `p-2.5 pb-1.5` to `p-2 pb-1`
- Remove the "Deal count" status bar (lines 304-318) — it adds clutter. The personalization badge can move inline with the header.
- Merge the personalized count badge into the header subtitle (e.g. "10 deals · 8 personalized")

#### 4. Compact header
Combine the header + personalization status into one tight line:
- "Your Rewards, {firstName}" with deal count as muted suffix
- Remove the separate subtitle "Personalized offers based on your lifestyle"

### Result
Each phone mockup becomes visually tighter — header → local perks → deal list → footer, with no duplicate info and less vertical padding.

### Files Modified
- `src/components/demo/DemoRewardsView.tsx`

