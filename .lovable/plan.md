## Replace Consumer Column Cards with Single Phone Mockup

### Current state

The "Next-gen Banking Experience" column renders 3 separate clickable cards — one per pillar row (Personalized AI & UX, Personalized Rewards, Personalized Relationship). Each opens its respective overlay view.

### New design

Replace all 3 cards with a **single iOS-style phone mockup** spanning the full consumer column height, containing **4 tabs** at the bottom (like an banking app in iOS ):

- **UX** — renders existing `DemoEngagementView` content (already built)
- **Rewards** — renders existing `DemoRewardsView` content (already built)
- **Relationship** — renders existing `DemoWealthView` content (already built)
- **AI** — placeholder tab with "Coming Soon" state

### Changes

**File: `src/components/demo/DemoNetworkDiagram.tsx**`

1. **Replace the per-row consumer node rendering** (lines 401-440) with a single phone mockup component positioned to span from the first row's top to the last row's bottom in the consumer column.
2. **The phone mockup** will be a slim device frame (iPhone-style with notch, rounded corners, ~CONSUMER_COL_WIDTH wide) containing:
  - A minimal status bar at top
  - Scrollable content area showing the active tab's view
  - A bottom tab bar with 4 tabs: UX, Rewards, Relationship, AI
  - Each tab is clickable and switches the content; clicking the tab also triggers `onNodeClick` for the corresponding node (engagement, rewards, wealth)
3. **SVG connector lines** (bank→consumer, lines 256-278): Update to point all lines at the single phone mockup center instead of per-row consumer card centers.
4. **Import the view components** (`DemoEngagementView`, `DemoRewardsView`, `DemoWealthView`) into `DemoNetworkDiagram` or create a new `DemoPhoneMockup` component.
5. **Column header** "Next-gen Banking Experience" stays as-is.

### New component: `src/components/demo/DemoPhoneMockup.tsx`

A self-contained phone mockup with:

- iPhone frame styling (rounded corners, notch, home indicator)
- 4-tab bottom bar (UX / Rewards / Relationship / AI) with icons
- Content area renders the matching view based on active tab
- Accepts customer, enriched data, and other props needed by the 3 existing views
- AI tab shows a "Coming Soon" placeholder
- Tabs visually indicate readiness state (ready/processing/waiting) based on `nodeReadiness`

### Layout adjustments

- The phone mockup is positioned absolutely at `consumerColLeftX`, spanning from the first visible row's content top to the last visible row's content bottom
- `CONSUMER_COL_WIDTH` may need a slight increase to fit phone content comfortably (~180-200px in centered mode)
- Bank→Consumer SVG lines all converge to the phone's vertical center