

## Plan: Improve Category Consolidation Visual in Customer Experience Preview

**Problem**: The current EngagementPreview uses tiny inline chips with a text arrow ("→") which feels flat and doesn't communicate the transformation well. Both `/tepilot` and `/demo` present consolidation more effectively:

- **`/tepilot` (BeforeAfterTransformation)**: Uses a 3-column grid layout — MCC cards on the left, a large arrow in the center, pillar cards on the right — with hover interactions showing which MCCs feed into which pillars.
- **`/demo` (DemoPasswordGate Beat 3)**: Shows three distinct items funneling down via SVG dashed lines into a single MCC box — visually dramatic.

**Approach**: Adapt the `/tepilot` transformation flow pattern into a compact version for the Platform tab preview. This is the most fitting since it directly shows category-to-pillar consolidation.

### New EngagementPreview Layout (single column, top to bottom)

1. **Mini Transformation Flow** (primary): A compact 3-column grid (`[left | arrow | right]`)
   - **Left**: 6-8 raw categories as small cards (e.g., "Restaurants", "Coffee Shops", "Gyms", "Airlines") styled like the `/tepilot` MCC cards — light background, small text, stacked vertically
   - **Center**: Arrow icon (like `/tepilot`)
   - **Right**: 4 lifestyle pillars as colored cards (Dining, Wellness, Travel, Shopping) with spend amounts and budget progress bars — each card colored with its pillar color accent

2. **Gamification card** (minor): Keep the "Dining Streak" achievement as-is below the flow.

3. **AI Coaching card** (minor): Keep the "Wellness spending up 28%" insight as-is below.

### Changes

**File: `src/components/PlatformTabs.tsx`** (lines 207-273)
- Replace the current flat list of category→pillar rows with a 3-column grid layout
- Left column: stack of raw category chips/cards (plain gray styling, like generic bank categories)
- Center: `ArrowRight` icon from lucide
- Right column: stack of lifestyle pillar cards with color accents, spend amounts, and budget progress bars
- Keep gamification and coaching cards unchanged below the flow
- Import `ArrowRight` from lucide-react

