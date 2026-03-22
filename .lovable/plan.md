

## Compact Deal Cards to 3 Lines

### Changes — `src/components/demo/DemoRewardsView.tsx`

#### Card layout (3 lines total)
**Line 1**: `[Category emoji] Merchant Name .................. [Reward Badge]`
**Lines 2-3**: AI message (no sparkle icon, italic, `line-clamp-2`) with **CTA button floated to bottom-right** inline with the text

#### Specific edits
1. **Remove Sparkles icon** from the AI message block — show just the italic message text, clamped to 2 lines
2. **Move CTA inline with the message** — place the CTA button at the end of the message row using `flex` with `items-end`, so the message text wraps to ~2 lines and the CTA sits bottom-right
3. **Remove the separate CTA+subcategory row** — no more standalone line for subcategory or CTA
4. **Remove loading state sparkle** — keep just spinner + "Personalizing…"
5. Remove unused `Sparkles` import

### Files Modified
- `src/components/demo/DemoRewardsView.tsx`

