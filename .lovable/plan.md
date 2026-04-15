

## Holistic Spacing & Layout Optimization for Membership Tab

### Problem
The phone mockup (340×740px) has several spacing inefficiencies:
- The 2-card row has empty space where the deleted "Deals" card was — two cards stretch across the full width leaving them oddly wide
- The Advisor card is vertically heavy: large avatar, multi-line quote, and two buttons stacked below
- The pinned AI tip at the bottom permanently eats ~120px of viewport even when the scrollable area above has unused space
- Uniform `space-y-2.5` gaps between all sections don't account for visual grouping

### Changes

**File: `src/components/exec-demo/RelationshipPhoneView.tsx`**

1. **Tighten the header** — reduce bottom margin, make the greeting and badge a single compact row

2. **Financial Snapshot** — reduce inner padding from `p-3` to `p-2.5`, shrink the holding tiles' vertical padding from `py-2` to `py-1.5`

3. **Merge Advisor into the 2-card row → 3-column layout** — bring back `grid-cols-3` with:
   - Col 1: Your Relationship (unchanged)
   - Col 2: Wellness score (unchanged)  
   - Col 3: Your Advisor — compact version with initials circle, name, and a single "Message" button (remove the quote and Schedule button to fit the card size)

4. **Add a standalone "Schedule a Review" banner** — a single-line horizontal strip below the 3-card row: advisor quote + Schedule button inline, replacing the old full advisor card

5. **Move AI tip into the scrollable area** — remove the pinned bottom section (`shrink-0 border-t`). Instead, place the tip card as the last item inside the scrollable `space-y` container. This reclaims ~120px of permanent viewport and lets users scroll past it naturally.

6. **Reduce section gaps** — change outer `space-y-2.5` to `space-y-2` for tighter vertical rhythm

### Result
- All vertical space is scrollable content (no pinned bottom section stealing space)
- 3-column card row fills width naturally and adds the advisor presence
- Advisor quote becomes a slim inline banner rather than a bulky card
- Overall layout feels denser and more polished within the phone frame

