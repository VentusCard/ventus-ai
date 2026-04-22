

## Fix parent callout position and broken connector

The Young Parent callout is sitting too far down because its `top` offset (230) was sized for a stack that extended downward — but now the stack extends upward (action bubble is above the label). The horizontal dashed line that points from the stack to the card is also no longer aligned with the label bubble, so it appears broken.

### Changes (only in `src/components/ScrollDrivenHero.tsx`)

1. **Move Young Parent back up**
   - Change parent `top` from `230` → `110`.
   - Rationale: with the action bubble now above the label, the label sits roughly 95px below the stack's top. Setting `top: 110` puts the label at ~205px — in line with the parent-tagged transaction rows in the card.

2. **Re-align the horizontal connector for Young Parent**
   - The horizontal dashed line + dot must point at the **label bubble**, not the stack's top edge.
   - Replace the rough `marginTop: actionAbove ? 90 : 20` math with a structural fix: render the horizontal connector as a sibling of the **label bubble row** instead of a sibling of the whole stack.
   - Approach: wrap the label bubble in a flex row that includes the horizontal connector, so they always stay vertically centered together regardless of whether the action bubble is above or below. The action bubble + vertical connector then live above (parent) or below (others) that row, and the line stays glued to the label.

3. **Travel + College stay as-is** (action below, top offsets 20 and 60). Their horizontal lines already align correctly with their top label bubble.

### Result

- All three callouts visually anchor on their label bubble at roughly the same vertical band as the matching transaction rows in the card.
- The dashed line from the parent label to the card is unbroken and centered on the bubble.
- The action bubble for parent floats above the label; for travel/college it hangs below.

No timing, copy, or styling changes — only layout/position fixes.

