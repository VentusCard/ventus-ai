

# Add Smart Rewards Interactive Demo to the SmartRewards Page

## What's Happening
You've provided a full interactive animation component (`VentusSmartRewards.jsx`) that demonstrates the Smart Rewards personalization engine. This will replace the current placeholder demo on the `/smartrewards` page with a live, interactive animation -- similar to how the Enrichment page has its own `VentusTransactionEnrichment` component.

## Changes

### 1. Add the new component
Copy the uploaded `VentusSmartRewards.jsx` into the project as `src/components/technology/demos/VentusSmartRewards.tsx` (renamed to `.tsx` to match project conventions). The component is a self-contained React component with inline styles, animation logic, and all static data built in.

### 2. Add proportional scaling for mobile/tablet
The component has its own responsive media queries (collapsing grids at 980px and 760px), but to match the approach used on the Enrichment page, a `.vsr-scale-wrapper` will be added around `.vsr-root` with the same `transform: scale()` strategy:
- Tablet (max-width 1024px): scale 0.7, margin-bottom -30%
- Mobile (max-width 767px): scale 0.5, margin-bottom -50%

### 3. Update SmartRewards page
Replace the current `AnimatedDemo` placeholder with the new `VentusSmartRewards` component, embedded the same way the Enrichment page embeds its demo -- inside a "See It In Action" section with a bordered container.

### Files Changed
- **New**: `src/components/technology/demos/VentusSmartRewards.tsx` -- the uploaded component with scaling wrapper added
- **Modified**: `src/pages/SmartRewards.tsx` -- swap `AnimatedDemo` for `VentusSmartRewards`, remove the `rewardsDemoHtml` import

### Technical Details
- The component uses `useRef` and direct DOM manipulation (innerHTML) for high-performance animations without React re-renders
- It auto-starts an animation loop through 5 lifestyle indicators (Golf, Snow Sports, Domestic Travel, Pets, Dining), running one full cycle then stopping
- Users can click any lifestyle pill to interrupt and view that category's data
- Pause/Resume/Reset controls are built in
- All CSS is scoped via `.vsr-` prefixed class names to avoid conflicts

