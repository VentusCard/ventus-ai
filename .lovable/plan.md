

## Make collection cards clickable with deal detail view

### Problem
Currently, the rotating collection cards in the Rewards phone tab are display-only. Clicking a collection should open a detail view showing the individual deals within that collection — similar to how a banking app lets you tap a category to see its offers.

### Change: `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

1. **Add `expandedGroup` state** (`RollupOfferGroup | null`) to track which collection is open.

2. **Make collection cards clickable** — add `onClick` + `cursor-pointer` to the card div. Clicking sets `expandedGroup` to the active group and pauses auto-rotation (clear the interval when expanded).

3. **Build a deal detail view** that renders when `expandedGroup` is set:
   - **Header**: back arrow (`ChevronLeft`) + collection name + deal count. Tapping back clears `expandedGroup`.
   - **Banner**: same Unsplash image as the collection card, slightly taller (~100px).
   - **Deal list**: vertical scrollable list of the group's deals (filtered to non-suppressed), each as a card showing:
     - Merchant name (bold, 12px)
     - Product name (11px, muted)
     - Reward value pill (e.g., "5% back") in a colored badge
     - CTA button text (e.g., "Activate") — styled as a small pill button
     - One-line `message` text (10px, slate-500)
   - Smooth slide-in animation from the right

4. **Conditional render**: if `expandedGroup` is set, show the detail view instead of the carousel. The bottom tab bar remains visible (it's in the parent component).

### Visual style
- Clean white cards with subtle border, matching the existing phone mockup aesthetic
- Each deal card: rounded-xl, light border, merchant name left-aligned, reward value right-aligned
- "Activate" / CTA button: small rounded-full pill in the collection's pillar color
- Back button: simple chevron + "Back" text in slate

