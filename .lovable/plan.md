

## Combine Consumer Overlay Views into a Tabbed iPad Mockup

### What changes

When a user clicks any of the 3 consumer cards (Personalized UX, Personalized Rewards, Personalized Relationship), instead of opening 3 separate full-screen overlays with different content, they will all open the **same overlay** containing a single iPad mockup with **4 tabs**: UX, Rewards, Relationship, and AI. The initially active tab corresponds to whichever card was clicked.

### How

**File: `src/components/demo/DemoDetailOverlay.tsx`**

1. Detect when `node` is one of `engagement`, `rewards`, or `wealth` — treat these as "consumer" nodes.

2. For consumer nodes, render a **single iPad-frame view** (using the existing iPad styling: slate-300 bezel, camera dot, status bar, home indicator, max-w-820px) with a **4-tab bar** at the top of the content area:
   - **UX** (active when opened via `engagement`) → renders `DemoEngagementView`
   - **Rewards** (active when opened via `rewards`) → renders `DemoRewardsView`
   - **Relationship** (active when opened via `wealth`) → renders `DemoWealthView`
   - **AI** → renders a "Coming Soon" placeholder

3. Add local state `activeConsumerTab` initialized from the clicked `node`. Tabs are clickable to switch between views without closing the overlay.

4. The overlay header title updates to match the active tab. All 4 views share the same close button and overlay frame.

### What stays untouched
- The 3 consumer cards in the network diagram — unchanged
- All other overlay views (engine, analytics, bank-wide, etc.) — unchanged
- All existing view components (`DemoEngagementView`, `DemoRewardsView`, `DemoWealthView`) — unchanged internally

### Technical details
- The iPad frame markup mirrors the established pattern (border-slate-300, 12px border, camera dot, status bar, home indicator)
- Tab bar uses simple button row with active state styling (bottom border or background highlight)
- `activeConsumerTab` state: `"ux" | "rewards" | "relationship" | "ai"`, mapped from the incoming `node` prop as default value

