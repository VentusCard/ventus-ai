

# Add Prev/Next Navigation in Feature Overlays

**File: `src/pages/DemoPage.tsx`**

Define a node order array: `["engagement", "analytics", "rewards", "travel", "lifeEvents", "wealth", "engine"]`

- When `activeNode` is `null`: show "Next Step →" button (existing behavior)
- When `activeNode` is set: show prev/next buttons instead
  - "Previous" hidden on first node
  - "Next" shown on all nodes except the last (`engine`)
  - On the last node (`engine`), "Next" closes the overlay (sets `activeNode` to `null`)
  - Wait — user said "wealth is the last node, close it afterwards"

**Updated node order**: `["engagement", "analytics", "rewards", "travel", "lifeEvents", "wealth"]` — remove `engine` from the navigation sequence (or put it first/exclude it). Actually, let me re-read: the user wants wealth to be last and closing after it. So the sequence for prev/next is: `engagement → analytics → rewards → travel → lifeEvents → wealth`. On "Next" from wealth, close the overlay.

- Styling: match existing floating button pattern (rounded-full, border, backdrop-blur, small text)
- The buttons render at `bottom-4 right-4` with `z-[60]` to sit above the overlay's `z-50`

No changes needed to `DemoDetailOverlay.tsx`.

