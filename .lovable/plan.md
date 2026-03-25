

## Fix Rewards Mockup Scroll & Height

### Problem
1. `max-h-[400px] overflow-y-auto` on line 245 creates a scroll container **only around the deals section** — the user wants one scroll for the entire phone content
2. When "Local Experiences" collapses, the phone mockup shrinks in height instead of staying fixed

### Fix — `src/components/demo/DemoRewardsView.tsx`

1. **Move the scroll to the entire app content area** (line 236): Give the content `div` a fixed max-height and `overflow-y-auto`, e.g. `max-h-[520px] overflow-y-auto`
2. **Remove `max-h-[400px] overflow-y-auto`** from the deals wrapper (line 245) — just keep it as a normal `space-y-1.5` div
3. **Set a `min-h` on the phone content area** so it doesn't shrink when Local Experiences collapses — e.g. `min-h-[520px]`

This gives the mockup a consistent height with one unified scrollbar for all content (header, local experiences, deals, footer).

